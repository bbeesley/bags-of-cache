# Snapshot report for `src/dynamo-client-query.unit.test.ts`

The actual snapshot is saved in `dynamo-client-query.unit.test.ts.snap`.

Generated by [AVA](https://avajs.dev).

## query -> sends the query to dynamo

> Snapshot 1

    [
      {
        ExclusiveStartKey: undefined,
        ExpressionAttributeNames: {
          '#country': 'country',
          '#language': 'language',
          '#type': 'type',
        },
        ExpressionAttributeValues: {
          ':country': 'gb',
          ':language': 'en',
          ':type': 'track',
        },
        FilterExpression: '#country = :country AND #language = :language',
        KeyConditionExpression: '#type = :type',
        Limit: undefined,
        TableName: 'big-fat-prod-table',
      },
    ]
