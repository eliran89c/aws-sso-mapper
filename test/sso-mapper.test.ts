import { Stack } from '@aws-cdk/core';
import { AwsSSOMapper } from '../src';
import '@aws-cdk/assert/jest';

test('Check Resources', () => {
  const stack = new Stack();
  new AwsSSOMapper(stack, 'test-aws-sso-mapper');

  expect(stack).toHaveResource('AWS::IAM::Policy');
  expect(stack).toHaveResource('AWS::IAM::Role');
  expect(stack).toHaveResource('AWS::Lambda::Function');
  expect(stack).toHaveResource('Custom::AWS');
});