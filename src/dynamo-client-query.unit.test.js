import ava from 'ava'; // eslint-disable-line ava/use-test
import { mockClient } from 'aws-sdk-client-mock';
import { QueryCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import delay from 'delay';
import { DynamoCachedClient } from './dynamo-client.js';

const { serial: test } = ava;

const dynamoMock = mockClient(DynamoDBDocumentClient);
dynamoMock.on(QueryCommand).callsFake((input) => ({ Items: [input] }));

test.beforeEach(() => {
  dynamoMock.resetHistory();
});

const parameters = {
  ttl: 500,
  dynamoTable: 'my-config-dev',
  awsRegion: 'eu-central-1',
};

const queryInput = {
  TableName: 'big-fat-prod-table',
  KeyConditionExpression: '#type = :type',
  FilterExpression: '#country = :country AND #language = :language',
  ExpressionAttributeNames: {
    '#type': 'type',
    '#country': 'country',
    '#language': 'language',
  },
  ExpressionAttributeValues: {
    ':type': 'track',
    ':country': 'gb',
    ':language': 'en',
  },
};

test('query -> sends the query to dynamo', async (t) => {
  const client = new DynamoCachedClient(parameters);
  await client.query(queryInput);
  t.snapshot(
    dynamoMock.commandCalls(QueryCommand).map((entity) => entity.args[0].input),
  );
});

test('query -> works when queryConcurrency is set', async (t) => {
  const client = new DynamoCachedClient({ ...parameters, queryConcurrency: 1 });
  const item = await client.query(queryInput);
  t.is(dynamoMock.commandCalls(QueryCommand).length, 1);
  const nextItem = await client.query(queryInput);
  t.is(dynamoMock.commandCalls(QueryCommand).length, 1);
  t.deepEqual(item, nextItem);
});

test('query -> does not call dynamo if a fresh copy is cached', async (t) => {
  const client = new DynamoCachedClient(parameters);
  const item = await client.query(queryInput);
  t.is(dynamoMock.commandCalls(QueryCommand).length, 1);
  const nextItem = await client.query(queryInput);
  t.is(dynamoMock.commandCalls(QueryCommand).length, 1);
  t.deepEqual(item, nextItem);
});

test('query -> calls dynamo again if the cache has gone stale', async (t) => {
  const client = new DynamoCachedClient({ ...parameters, ttl: 50 });
  await client.query(queryInput);
  t.is(dynamoMock.commandCalls(QueryCommand).length, 1);
  await delay(50);
  await client.query(queryInput);
  t.is(dynamoMock.commandCalls(QueryCommand).length, 2);
});

test('query -> calls dynamo again if the cache params have changed', async (t) => {
  const client = new DynamoCachedClient(parameters);
  const item = await client.query(queryInput);
  t.is(dynamoMock.commandCalls(QueryCommand).length, 1);
  const nextItem = await client.query({
    ...queryInput,
    ExpressionAttributeValues: {
      ':type': 'Artist',
      ':country': 'de',
      ':language': 'default',
    },
  });
  t.is(dynamoMock.commandCalls(QueryCommand).length, 2);
  t.notDeepEqual(item, nextItem);
});
