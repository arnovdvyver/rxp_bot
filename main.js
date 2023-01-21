import { Configuration, CreateImageRequestSizeEnum, OpenAIApi } from "openai";
import { Menu } from "@grammyjs/menu";
import { Bot, Context, session } from "grammy";
import { env } from 'node:process';
import express from "express";

const bot = new Bot(env.BOTKEY)

const app = express();

//returns the session key
function getSessionKey(ctx) {
  return ctx.chat?.id.toString();
}

// Install session middleware, and define the initial session value.
function initial() {
  return { 
    model: "text-curie-001",
    temp: 0
  };
}
bot.use(session({ initial, getSessionKey }));


let users = {};

//start command
bot.command("start", (ctx) => {
  ctx.reply(`Welcome to AI Bot 🤖` + 
  `Use the /menu command to get started with models & temperatures for your Bot`);
});


let tempChoice = 0;
//temp command
bot.command("temp", (ctx) => {
  const t = ctx.match;

  if (t < 0 || t > 1) {
    ctx.reply("Invalid argument give, please enter a number between 0 and 1 (inclusive)");
  } else {
      tempChoice = Number(t);
  }
});

//menu
const menu = new Menu("AI Bot Menu")
  .text("DaVinci Mode", (ctx) => {
      ctx.session.model = "text-davinci-003";
      ctx.reply("Bot is now using the Davinci Model");

  }).row()
  .text("Curie Mode", (ctx) => {
    ctx.session.model = "text-curie-001";
    ctx.reply("Bot is now using the Curie Model");

  })
  .text("Babbage Mode", (ctx) => {
    ctx.session.model = "text-babbage-001";
    ctx.reply("Bot is now using the Curie Model");

  })
  .text("Ada Mode", (ctx) => {
    ctx.session.model = "text-ada-001";
    ctx.reply("Bot is now using the Ada Model");

  }).row()
  .text("Get Mode", (ctx) => {
    const mode = ctx.session.model;
    ctx.reply(`Current Mode 👉 ${mode}`);
  }).row()
  .text("Set Temp", (ctx) => {
    ctx.reply(`Use the /set_temp command with a value between 0 - 1 (inclusive)` +
    '\nExample: "/set_temp 0.5"');
  })
  .text("Get Temp", (ctx) => {
    const temp = ctx.session.temp;
    ctx.reply(`Current Temp 👉 ${temp}`);
  });




bot.use(menu);
bot.command("menu", async (ctx) => {
  // Send the menu.
  await ctx.reply("Main Menu:", { reply_markup: menu });
});

//
bot.command("mode", async (ctx) => {
  const mode = ctx.session.model;
  ctx.reply(`Current Mode 👉 ${mode}`);
});

//temp
bot.command("temp", async (ctx) => {
  const temp = ctx.session.temp;
  ctx.reply(`Current Temp 👉 ${temp}`);
});



//temp command
bot.command("set_temp", (ctx) => {
  const t = ctx.match;

  if (t < 0 || t > 1) {
    ctx.reply("Invalid argument give, please enter a number between 0 and 1 (inclusive)");
  } else {
    ctx.session.temp = Number(t);
    ctx.reply(`🌡️ Temperature set to: ${t}`);
  }
});



//call openAI
const configuration = new Configuration({
  apiKey: env.AIKEY,
});
const openai = new OpenAIApi(configuration);

//listener
bot.on("message", (ctx) => {
    const mesg = ctx.message.text;

    //generate AI response
    openai.createCompletion({
        model: `${ctx.session.model}`,
        prompt: `${mesg}`,
        temperature: Number(ctx.session.temp),
        max_tokens: 1000,
      }).then(x => {
        console.log(`🤖 Model: ${ctx.session.model}`);
        console.log(`🔖 Request: ${mesg}`);
        console.log(`🔥 Temprature: ${ctx.session.temp}`);
        
        const response = x.data.choices[0].text;
        console.log(`🗣️ Response: ${response.trim()}\n\n`);
        ctx.reply(response);
      });
});

// Start the bot.
bot.start();

app.listen(8080, () => {
  console.log(`Bot is listening on port 8080`)
});
