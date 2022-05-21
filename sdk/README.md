# next-jobs

## Local development

1. In this project's root folder, run `npm link`
2. In the project which uses this as a dependency, run `npm link @dwayneyuen/next-jobs`. This will allow your local
   project to pick your changes without modifying the `package.json`. Whenever you run an `npm install, you'll need to
   re-run the second link command.

### Known issues

1. You see the error

```bash
[Error: ENOENT: no such file or directory, scandir '/Users/dwayneyuen/Devel/next-jobs-test/.next/server/pages/api/commands'] {
  errno: -2,
  code: 'ENOENT',
  syscall: 'scandir',
  path: '/Users/dwayneyuen/Devel/next-jobs-test/.next/server/pages/api/commands'
}
```

This seems to happen because `__dirname` in the locally linked dependency resolves to the path of the file which is
being executed and not the source file. To fix, find this file:
`/Users/dwayneyuen/Devel/next-jobs/sdk/node_modules/bullmq/dist/cjs/classes/redis-connection.js`

Find the `loadCommands()` function call and replace `__dirname` with the full path that the file resides in. e.g.:

```js
loadCommands() {
  // return (this._client['bullmq:loadingCommands'] ||
  //     (this._client['bullmq:loadingCommands'] = commands_1.scriptLoader.load(this._client, path.join(__dirname, '../commands'))));
  return (this._client['bullmq:loadingCommands'] ||
    (this._client['bullmq:loadingCommands'] = commands_1.scriptLoader.load(this._client, path.join("/Users/dwayneyuen/Devel/next-jobs/sdk/node_modules/bullmq/dist/cjs/classes", '../commands'))));
}
```

In your development project, you'll then need to run:

- `rm -rf .next`
- `npm install`
- `npm link @dwayneyuen/next-jobs`

Each time you reinstall the `bullmq` dependency in this project, you'll have to re-do the patch above. I'm not sure how
to fix this. Open github issue: https://github.com/taskforcesh/bullmq/issues/901
