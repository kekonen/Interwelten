const Telegraf = require('telegraf')
// const ops = require('./ops')
const sa = require('superagent')
const fs = require('fs')
// var Promise = require("bluebird");

const parseTranslations = (text) => {
    const simpleTrRe = /[a-zA-ZäöåÄÖÅÜüß\-\ ]+\|[a-zA-ZäöåÄÖÅÜüß\-\ ]+\|[а-яА-Я\-\ ]+\|[a-zA-ZäöåÄÖÅÜüß\-\ ]+\|[a-zA-ZäöåÄÖÅÜüß\-\ ]+/
    let simpleTrReResult = simpleTrRe.exec(text)
    if (simpleTrReResult) {
        const [english, german, russian, finnish, swedish] = text.split("|");
        return {english, german, russian, finnish, swedish}
    }
    return false
}

class Bot {
    constructor(token) {
        this.bot = new Telegraf(token)
    }

    async setup(db) {
        this.bot.start(async (ctx) => {
            const chatId = (await ctx.getChat()).id;
    
            const user = await db.getUser(chatId);
    
            if (!user.length) {
                await db.createUser(chatId);
                ctx.reply('Welcome!');
                return ;
            }
    
            ctx.reply('Hello again!');
        })

        this.bot.command('add', async (ctx) => {
            const {from} = ctx.update.message;

            if (!(await db.getUser(from.id)).length) {
                ctx.reply('Register first with /start')
                return ;
            }

            if ((await db.getUserRoles(from.id)).indexOf('admin') > -1 ) {
                ctx.reply('Send word to add in the following format: KEK!')
                await db.createTask(from.id, 0, 'add_word', "kek")
            } else {
                ctx.reply('No, u are not an admin')
            }
        })

        this.bot.command('delete', async (ctx) => {
            const {from} = ctx.update.message;

            if (!(await db.getUser(from.id)).length) {
                ctx.reply('Register first with /start')
                return ;
            }

            if ((await db.getUserRoles(from.id)).indexOf('admin') > -1 ) {
                ctx.reply('Send word id to delete')
                await db.createTask(from.id, 0, 'delete_word', "kek")
            } else {
                ctx.reply('No, u are not an admin')
            }
        })

        this.bot.command('admin_me', async (ctx) => {
            const {from} = ctx.update.message;

            if (!(await db.getUser(from.id)).length) {
                ctx.reply('Register first with /start')
                return ;
            }

            if ((await db.getUserRoles(from.id)).indexOf('admin') > -1 ) {
                ctx.reply('Да все с тобой ясно')
            } else {
                ctx.reply('Вилкой в глаз или в попу раз?')
                await db.createTask(from.id, 0, 'make_me_admin', "kek")
            }
        })
    
        // this.bot.hears('hi', (ctx) => ctx.reply('Hey there'))
        this.bot.on('text', async (ctx) => {
            let {text, from} = ctx.update.message;

            if (!(await db.getUser(from.id)).length) {
                ctx.reply('Register first with /start')
                return ;
            }

            const tasks = await db.getTasks(from.id, 0);
            console.log(tasks)


            if (tasks.length) {
                const task = tasks[0];

                if (task.task === 'add_word') {//furnace|ofen|печь|ugn|tulipesä
                    const result = parseTranslations(text)
                    if (result) {
                        Promise.all([
                            db.createTranslation(result),
                            db.fullfillTask(task.id),
                            ctx.reply("Done!")
                        ])
                    } else {
                        ctx.reply("Didnt match any formats!")
                    }
                } else if (task.task === 'delete_word') {
                    Promise.all([
                        db.removeTranslationById(text),
                        db.fullfillTask(task.id),
                        ctx.reply('я заскринил')
                    ])
                    
                } else if (task.task === 'make_me_admin') {
                    if (text) {
                        await db.createUserRole(from.id, 'admin')
                        ctx.reply('я заскринил')
                    }
                    const taskFullfilled = await db.fullfillTask(task.id)
                }
            } else {
                if (text.length < 3) {
                    ctx.reply("Too short...")
                    return ;
                }
                const translations = await db.getTranslationByAnyLanguageWithPhoto(text)
                const messages = translations.reduce((a, t)=> {
                    const message = `🇬🇧 ${t.english}\n🇩🇪 ${t.german}\n🇷🇺 ${t.russian}\n🇸🇪 ${t.swedish}\n🇫🇮${t.finnish}`
                    if (!t.picture_id) {
                        a.texts.push(message)
                    } else {
                        a.withPhoto.push([t.picture.cached_file_id, { caption: message}])
                        
                    }
                    return a;
                }, {withPhoto:[], texts: []})

                await ctx.reply(messages.texts.join('\n --- \n'))

                Promise.all([messages.withPhoto.map(m => ctx.replyWithPhoto(...m))])
                
                
                console.log("Translation!!!", translations)
            }
        })

        this.bot.on('photo', async (ctx) => {
            let {photo, caption, from} = ctx.update.message;
            photo = photo.pop()

            if (!(await db.getUser(from.id)).length) {
                ctx.reply('Register first with /start')
                return ;
            }

            if ((await db.getUserRoles(from.id)).indexOf('admin') === -1) {
                ctx.reply('You are not an admin')
                return ;
            } else if (!caption) {
                ctx.reply('No caption!')
            }

            const result = parseTranslations(caption)
            if (result) {
                const translationEntry = await db.createTranslation(result);
                return db.createPhoto(photo.file_id).then(entry => {
                    return Promise.all([
                        db.addPhoto(translationEntry.id, entry.id),
                        this.downloadFile(photo.file_id,`media/photos/${entry.id}.jpg`)
                    ])
                }).then(() => ctx.reply("Done!"))
            } else {
                ctx.reply("Didnt match any formats!")
            }
        })

        // this.bot.on('inline_query', async (ctx) => {
        //     const {id, query, from} = ctx.update.inline_query;

        //     // console.log('query===', ctx)


        //     const user = await db.getUser(from.id);
        //     console.log('user', user)
        //     if (!user.length) {
        //         console.log('No user!')
        //         ctx.answerInlineQuery([], {
        //             is_personal: true,
        //             switch_pm_text: "Hey, click here",
        //             switch_pm_parameter: "new"
        //         })
        //         return ;
        //     }

        //     // console.log(`from====`, await db.getAllowedVoicesLike(from.id, query))
        //     // let results = []
        //     const results = (await db.getAllowedVoicesLike(from.id, query)).slice(0,20).map((v, i) => {
        //         console.log('v============', v.voice_permissions)
        //         return {
        //             type: "voice",
        //             id: `voice_${id}_${v.voice_permissions[0].voice_id}`,
        //             voice_file_id: v.file_id_cached,
        //             title: v.title
        //         }
        //     }) || []

        //     ctx.answerInlineQuery(results, {
        //         is_personal: true,
        //     })
        // })

        // this.bot.on('chosen_inline_result', async (ctx) => {
        //     const {from, result_id} = ctx.update.chosen_inline_result;

        //     console.log('result_id', result_id)
        //     const [type, queryId, voice_id] = result_id.split('_')
        //     db.updateVoiceCounterById(voice_id)
        // })
        
        this.bot.launch()
    }

    async downloadFile(fileId, path) {
        const {body: {result}} = await sa.get(`https://api.telegram.org/bot${this.bot.telegram.token}/getFile?file_id=${fileId}`) 
    
        if (typeof path === 'function') {
            path = path(result)
        }
    
        var stream = fs.createWriteStream(path);
    
        const response = await sa.get(`https://api.telegram.org/file/bot${this.bot.telegram.token}/${result.file_path}`).pipe(stream)
        return new Promise((resolve, reject) => {
            stream.on('end', () => {
                resolve(result);
            });
            stream.on('finish', () => {
                resolve(result);
            });
            stream.on('error', (error) => {
                reject(error);
            });
        });
    }
}


module.exports = { Bot }
