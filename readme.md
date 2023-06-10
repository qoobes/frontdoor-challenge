# Legere

Legere means something in latin. It's fancy.

## How do I run this?

Welp, first get your server started!

Before doing so, you need to create a `.env` file in the server directory. It should look like this:

_Note: Create an openai api key, and a mongo cluster on `cloud.mongodb.com` or locally, if you prever._

```env
DATABASE_HOST=<your database connection string>
OPENAI_API_KEY=<openai_key>

# Just paste these in
PORT=5001
JWT_SECRET=secret
JWT_REFRESH_SECRET=refresh
```

After you've done that, just start the server:

```bash
$ cd server
$ yarn
$ yarn start:dev
```

Now, you can build the extension:

```bash
$ cd extension
$ yarn
$ yarn build
```

After you've done so, head over to `chrome://extensions` (or `edge://extensions` if you're using edge) and enable developer mode. Then, click on `Load unpacked` and select the `extension/dist` folder.

Now, you can use the extension!
