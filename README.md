[![Release](https://github.com/eliran89c/aws-sso-mapper/actions/workflows/release.yml/badge.svg)](https://github.com/eliran89c/aws-sso-mapper/actions/workflows/release.yml)
![npm](https://img.shields.io/npm/v/aws-sso-mapper?label=version)

# aws-sso-mapper module
Use this CDK module to create and map AWS SSO PermissionSets using principal names rather than principal ids
<!--BEGIN STABILITY BANNER-->

---

![Stability: Experimental](https://img.shields.io/badge/stability-Experimental-important.svg?style=for-the-badge)

---
<!--END STABILITY BANNER-->


# API Reference

## class AwsSSOMapper  <a id="aws-sso-mapper-awsssomapper"></a>

### Initializer


```ts
new AwsSSOMapper(scope: Construct, id: string)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  - represents the scope for all the resources.
* **id** (<code>string</code>)  - this is a a scope-unique id.



### Properties


Name | Type | Description 
-----|------|-------------
**identityStoreId** | <code>string</code> | <span>AWS SSO Identity Store id</span>
**instanceArn** | <code>string</code> | <span>AWS SSO instance ARN</span>

### Methods


#### addPermissionSet(id, props) <a id="aws-sso-mapper-awsssomapper-addpermissionset"></a>

Create new PermissionSet.

```ts
addPermissionSet(id: string, props: IAddPermissionSetProps): PermissionSet
```

* **id** (<code>string</code>)  this is a a scope-unique id.
* **props** (<code>[IAddPermissionSetProps](#aws-sso-mapper-iaddpermissionsetprops)</code>)  User provided props for the method.

__Returns__:
* <code>[PermissionSet](#aws-sso-mapper-permissionset)</code>



## class PermissionSet  <a id="aws-sso-mapper-permissionset"></a>

### Initializer


```ts
new PermissionSet(scope: Construct, id: string, props: IPermissionSetProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  - represents the scope for all the resources.
* **id** (<code>string</code>)  - this is a a scope-unique id.
* **props** (<code>[IPermissionSetProps](#aws-sso-mapper-ipermissionsetprops)</code>)  - user provided props for the construct.


### Methods


#### assign(props) <a id="aws-sso-mapper-permissionset-assign"></a>

Assign principal to a specific AWS Account.

```ts
assign(props: IAssignProps): CfnAssignment
```

* **props** (<code>[IAssignProps](#aws-sso-mapper-iassignprops)</code>)  User provided props for the method.

__Returns__:
* <code>[CfnAssignment](#aws-cdk-aws-sso-cfnassignment)</code>



## interface IAddPermissionSetProps  <a id="aws-sso-mapper-iaddpermissionsetprops"></a>




### Properties


Name | Type | Description 
-----|------|-------------
**name** | <code>string</code> | The Permission Set name.
**description**? | <code>string</code> | The Permission Set description.<br/>__*Default*__: name
**inlinePolicy**? | <code>[PolicyDocument](#aws-cdk-aws-iam-policydocument)</code> | The Permission Set inline policy.<br/>__*Default*__: No inline policy
**managedPolicies**? | <code>Array<[IManagedPolicy](#aws-cdk-aws-iam-imanagedpolicy)></code> | A list with AWS managed policies to apply to the Permission Set.<br/>__*Default*__: No managed policies
**sessionDuration**? | <code>[Duration](#aws-cdk-core-duration)</code> | The Permission Set session duration.<br/>__*Default*__: 4 hours



## interface IAssignProps  <a id="aws-sso-mapper-iassignprops"></a>




### Properties


Name | Type | Description 
-----|------|-------------
**name** | <code>string</code> | The principal name.
**targetId** | <code>string</code> | The target id (AWS Account id).
**type** | <code>string</code> | The principal type (USER/GROUP).



## interface IPermissionSetProps  <a id="aws-sso-mapper-ipermissionsetprops"></a>




### Properties


Name | Type | Description 
-----|------|-------------
**identityStoreId** | <code>string</code> | The AWS SSO Identity Store id.
**instanceArn** | <code>string</code> | The AWS SSO instance ARN.
**name** | <code>string</code> | The Permission Set name.
**description**? | <code>string</code> | The Permission Set description.<br/>__*Default*__: name
**inlinePolicy**? | <code>[PolicyDocument](#aws-cdk-aws-iam-policydocument)</code> | The Permission Set inline policy.<br/>__*Default*__: No inline policy
**managedPolicies**? | <code>Array<[IManagedPolicy](#aws-cdk-aws-iam-imanagedpolicy)></code> | A list with AWS managed policies to apply to the Permission Set.<br/>__*Default*__: No managed policies
**sessionDuration**? | <code>[Duration](#aws-cdk-core-duration)</code> | The Permission Set session duration.<br/>__*Default*__: 4 hours




