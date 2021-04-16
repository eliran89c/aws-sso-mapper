import { Effect, PolicyStatement, PolicyDocument, IManagedPolicy } from '@aws-cdk/aws-iam';
import * as sso from '@aws-cdk/aws-sso';
import * as cdk from '@aws-cdk/core';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from '@aws-cdk/custom-resources';

/**
 * @summary The properties for the addPermissionSet method.
 */
export interface IAddPermissionSetProps {
  /**
   * The Permission Set name.
   */
  name: string;
  /**
   * The Permission Set description.
   *
   * @default - name
   */
  description?: string;
  /**
   * The Permission Set inline policy
   *
   * @default - No inline policy
   */
  inlinePolicy?: PolicyDocument;
  /**
   * A list with AWS managed policies to apply to the Permission Set
   *
   * @default - No managed policies
   */
  managedPolicies?: IManagedPolicy[];
  /**
   * The Permission Set session duration
   *
   * @default - 4 hours
   */
  sessionDuration?: cdk.Duration;
}

/**
 * @summary The properties for the PermissionSet class.
 */
export interface IPermissionSetProps extends IAddPermissionSetProps {
  /**
   * The AWS SSO instance ARN.
   */
  instanceArn: string;
  /**
   * The AWS SSO Identity Store id.
   */
  identityStoreId: string;
}

/**
 * @summary The properties for the Assign method.
 */
export interface IAssignProps {
  /**
   * The principal name.
   */
  name: string;
  /**
   * The principal type (USER/GROUP).
   */
  type: 'USER'|'GROUP';
  /**
   * The target id (AWS Account id).
   */
  targetId: string;
}

/**
 * @summary The PermissionSet class.
 */
export class PermissionSet extends cdk.Construct {
  private readonly ps: sso.CfnPermissionSet;
  private readonly instanceArn: string;
  private readonly identityStoreId: string;
  /**
   * @summary Constructs a new instance of the PermissionSet class.
   * @param {cdk.App} scope - represents the scope for all the resources.
   * @param {string} id - this is a a scope-unique id.
   * @param {IPermissionSetProps} props - user provided props for the construct.
   * @access public
   */
  constructor(scope: cdk.Construct, id: string, props: IPermissionSetProps) {
    super(scope, id);

    let mps = [];

    if (props.managedPolicies) {
      for (const i in props.managedPolicies) {
        mps.push(props.managedPolicies[i].managedPolicyArn);
      }
    }
    this.instanceArn = props.instanceArn;
    this.identityStoreId = props.identityStoreId;

    this.ps = new sso.CfnPermissionSet(this, 'PermissionSet', {
      instanceArn: props.instanceArn,
      name: props.name,
      description: props.description,
      sessionDuration: props.sessionDuration?.toIsoString(),
      inlinePolicy: props.inlinePolicy?.toJSON(),
      managedPolicies: mps,
    });
  }

  /**
  * Assign principal to a specific AWS Account
  * @param props User provided props for the method
  * @returns returns Cfn Assignment resource
  */
  public assign(props: IAssignProps): sso.CfnAssignment {
    // assign principal to target
    return new sso.CfnAssignment(this, `${props.name}-${props.targetId}`, {
      instanceArn: this.instanceArn,
      permissionSetArn: this.ps.getAtt('PermissionSetArn').toString(),
      principalType: props.type,
      targetType: 'AWS_ACCOUNT',
      targetId: props.targetId,
      principalId: this.getPrincipalId(props.type, props.name, props.targetId),
    });
  }

  private getPrincipalId(type: 'USER'|'GROUP', name: string, targetId: string): string {
    if (type === 'USER') {
      return new AwsCustomResource(this, `GetUserId-${name}-${targetId}`, {
        policy: AwsCustomResourcePolicy.fromSdkCalls({ resources: ['*'] }),
        onCreate: {
          action: 'listUsers',
          service: 'IdentityStore',
          physicalResourceId: PhysicalResourceId.of(name),
          parameters: {
            IdentityStoreId: this.identityStoreId,
            Filters: [{
              AttributePath: 'UserName',
              AttributeValue: name,
            }],
          },
        },
      }).getResponseField('Users.0.UserId');
    } else {
      return new AwsCustomResource(this, `GetGroupId-${name}-${targetId}`, {
        policy: AwsCustomResourcePolicy.fromSdkCalls({ resources: ['*'] }),
        onCreate: {
          action: 'listGroups',
          service: 'IdentityStore',
          physicalResourceId: PhysicalResourceId.of(name),
          parameters: {
            IdentityStoreId: this.identityStoreId,
            Filters: [{
              AttributePath: 'DisplayName',
              AttributeValue: name,
            }],
          },
        },
      }).getResponseField('Groups.0.GroupId');
    }
  }
}

/**
 * @summary The AwsSSOMapper class.
 */
export class AwsSSOMapper extends cdk.Construct {
  public readonly instanceArn: string;
  public readonly identityStoreId: string;
  /**
   * @summary Constructs a new instance of the AwsSSOMapper class.
   * @param {cdk.App} scope - represents the scope for all the resources.
   * @param {string} id - this is a a scope-unique id.
   * @access public
   */
  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    const getInstanceId = new AwsCustomResource(this, 'GetInstanceId', {
      installLatestAwsSdk: false,
      policy: AwsCustomResourcePolicy.fromStatements([
        new PolicyStatement({
          actions: ['sso:List*'],
          resources: ['*'],
          effect: Effect.ALLOW,
        }),
      ]),
      onCreate: {
        physicalResourceId: PhysicalResourceId.of('aws-sso-instance-id'),
        action: 'listInstances',
        service: 'SSOAdmin',
      },
      onUpdate: {
        physicalResourceId: PhysicalResourceId.of('aws-sso-instance-id'),
        action: 'listInstances',
        service: 'SSOAdmin',
      },
    });
    this.instanceArn = getInstanceId.getResponseField('Instances.0.InstanceArn');
    this.identityStoreId = getInstanceId.getResponseField('Instances.0.IdentityStoreId');
  }

  /**
  * Create new PermissionSet
  * @param id this is a a scope-unique id.
  * @param props User provided props for the method
  * @returns returns PermissionSet instance
  */
  public addPermissionSet(id: string, props: IAddPermissionSetProps): PermissionSet {
    return new PermissionSet(this, id, {
      instanceArn: this.instanceArn,
      identityStoreId: this.identityStoreId,
      name: props.name,
      description: props.description || props.name,
      inlinePolicy: props.inlinePolicy || undefined,
      managedPolicies: props.managedPolicies || undefined,
      sessionDuration: props.sessionDuration || cdk.Duration.hours(4),
    });
  }
}
