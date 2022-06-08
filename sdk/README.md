# next-jobs

## Local development

1. In this project's root folder, run `npm link`
2. In the project which uses this as a dependency, run `npm link @dwayneyuen/next-jobs`. This will allow your local
   project to pick your changes without modifying the `package.json`. Whenever you run an `npm install, you'll need to
   re-run the second link command.
