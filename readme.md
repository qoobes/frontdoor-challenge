# Legere

Legere means something in latin. It's fancy.

Basically, this was a project I did for a company I was applying to. Should I have spent two whole days without getting paid? Probably not. So I'm using it again to show you I know what I'm doing. Attached below is a video of me explaining the thing I built (chrome extension), and a link to the notion doc they gave me as a guide for what to built. Enjoy!

PS> if you wish to run this by yourself, there's a section on that below.


[Youtube video](https://www.youtube.com/watch?v=7AbiB_wOXys)

[Notion guide for the task presented above](https://elastic-delivery-6c3.notion.site/FS-Technical-Challenge-47598274286f44b290c2fbff2f111863)

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
