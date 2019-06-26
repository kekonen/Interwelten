const Sequelize = require('sequelize');
const Op = Sequelize.Op;

class DB {
    constructor({ hostname, user, password, database }) {

        const sequelize = new Sequelize(database, user, password, {
            host: hostname,
            dialect: 'postgres'
        });

        this.User = sequelize.define('users', {
            id: {
                type: Sequelize.BIGINT(20),
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
            chat_id: {
                type: Sequelize.BIGINT(20),
                allowNull: false,
            },
            created_at: {
                type : Sequelize.DATE(),
                allowNull : false,
                defaultValue : Sequelize.NOW
            },
            updated_at: {
                type : Sequelize.DATE(),
                allowNull : false,
                defaultValue : Sequelize.NOW
            }
          }, {
            freezeTableName: true,
            createdAt : 'created_at',
            updatedAt : 'updated_at',
        });
     
        this.Dictionary = sequelize.define('dictionary', {
            id: {
                type: Sequelize.BIGINT(20),
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
            english: {
                type: Sequelize.STRING(20),
            },
            german: {
                type: Sequelize.STRING(20),
            },
            russian: {
                type: Sequelize.STRING(20),
            },
            finnish: {
                type: Sequelize.STRING(20),
            },
            swedish: {
                type: Sequelize.STRING(20),
            },
            synonyms: {
                type: Sequelize.STRING(100),
            },
            picture_id: {
                type: Sequelize.BIGINT(10),
            },
            created_at: {
                type : Sequelize.DATE(),
                allowNull : false,
                defaultValue : Sequelize.NOW
            },
            updated_at: {
                type : Sequelize.DATE(),
                allowNull : false,
                defaultValue : Sequelize.NOW
            }
          }, {
            freezeTableName: true,
            createdAt : 'created_at',
            updatedAt : 'updated_at',
        });
   
        this.Picture = sequelize.define('picture', {
            id: {
                type: Sequelize.BIGINT(20),
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
            cached_file_id: {
                type: Sequelize.STRING(70),
            },
            created_at: {
                type : Sequelize.DATE(),
                allowNull : false,
                defaultValue : Sequelize.NOW
            },
            updated_at: {
                type : Sequelize.DATE(),
                allowNull : false,
                defaultValue : Sequelize.NOW
            }
          }, {
            freezeTableName: true,
            createdAt : 'created_at',
            updatedAt : 'updated_at',
        });


        this.Dictionary.hasOne(this.Picture
            ,
            {
                foreignKey : 'id',
                sourceKey: 'picture_id'
            }
            );
        
   
        this.Task = sequelize.define('task', {
            id: {
                type: Sequelize.BIGINT(20),
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
            chat_id: {
                type: Sequelize.BIGINT(20),
                allowNull: false,
            },
            message_type: {
                type: Sequelize.SMALLINT,
                allowNull: false,
            },
            task: {
                type: Sequelize.STRING(15),
                allowNull: false,
            },
            content: {
                type: Sequelize.STRING(40),
                allowNull: false,
            },
            fullfilled: {
                type: Sequelize.BOOLEAN,
                defaultValue : false
            },
            fullfilled_at: {
                type: Sequelize.DATE(),
            },
            created_at: {
                type : Sequelize.DATE(),
                allowNull : false,
                defaultValue : Sequelize.NOW
            },
            updated_at: {
                type : Sequelize.DATE(),
                allowNull : false,
                defaultValue : Sequelize.NOW
            }
        }, {
            freezeTableName: true,
            createdAt : 'created_at',
            updatedAt : 'updated_at',
        });


        this.UserRole = sequelize.define('user_role', {
            id: {
                type: Sequelize.BIGINT(20),
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
            user_id: {
                type: Sequelize.BIGINT(20),
                allowNull: false,
            },
            role_name: {
                type: Sequelize.STRING(10),
                allowNull: false,
            },
            created_at: {
                type : Sequelize.DATE(),
                allowNull : false,
                defaultValue : Sequelize.NOW
            },
            updated_at: {
                type : Sequelize.DATE(),
                allowNull : false,
                defaultValue : Sequelize.NOW
            }
          }, {
            freezeTableName: true,
            createdAt : 'created_at',
            updatedAt : 'updated_at',
        });

        this.User.hasMany(this.UserRole
            ,
            {
                foreignKey : 'user_id',
                sourceKey: 'id'
            }
            );

        this.User.findAll().then(users => {
            console.log("All users:", users.map(u=>u.chat_id));
        });
    }
    

    getUser(chatId) {
        return this.User.findAll({
            where: {
                chat_id: chatId
            }
        })
        // return this.db.select('kek_user.id')
        // .from('kek_user')
        // .where('kek_user.chat_id', chatId)
        // .run();
    }

    createUser(chatId) {
        return this.User.create({chat_id: chatId})
        // return this.db.insert('chat_id', 'created_at')
        // .into('kek_user')
        // .values({chat_id: chatId, created_at: new Date()})
        // .run();
    }

    async getUserRoles(chatId) {
        return (await this.UserRole.findAll({
            where: {
                user_id: chatId
            }
        })).map(r => r.role_name)
        // console.log("AllRoles", allRoles)
        // return (await this.db.select('user_role.role_name')
        // .from('user_role')
        // .where('user_role.user_id', chatId)
        // .run()).map(r => r.role_name);
    }

    createUserRole(chatId, role_name) {
        return this.UserRole.create({user_id: chatId, role_name})
        // return this.db.insert('user_id', 'role_name', 'created_at')
        // .into('user_role')
        // .values({user_id: chatId, role_name, created_at: new Date()})
        // .run();
    }

    createPhoto(cached_file_id) {
        return this.Picture.create({cached_file_id})
    }

    addPhoto(id, picture_id) {
        return this.Dictionary.update({picture_id}, {where: {id}})
    }

    getTranslationByAnyLanguageWithPhoto(word) {
        return this.Dictionary.findAll({
            include: [
                {
                    model: this.Picture,
                    required: false,
                    // attributes: ['firstName','phoneNumber']
                }
            ],
            where:{
                [Op.or]: [
                    {english: {
                        [Op.iLike]: `%${word}%`
                    }},
                    {german: {
                        [Op.iLike]: `%${word}%`
                    }},
                    {russian: {
                        [Op.iLike]: `%${word}%`
                    }},
                    {finnish: {
                        [Op.iLike]: `%${word}%`
                    }},
                    {swedish: {
                        [Op.iLike]: `%${word}%`
                    }},
                    {synonyms: {
                        [Op.iLike]: `%${word}%`
                    }}
                ]
            }
        })
    }

    createTranslation(translation, picture = false) {
        const entry = Object.assign(translation, picture?{picture}:{})
        console.log("createTranslation====>", entry)
        return this.Dictionary.create(entry)
    }

    // getTranslationByAnyLanguage(translation, picture = false) {
    //     const entry = Object.assign(translation, picture?{picture}:{})
    //     return this.Dictionary.create(entry)
    // }

    removeTranslationById(id) {
        return this.Dictionary.destroy({
            where: {
                id
            }
        })
    }

    updateCachedVoice(id, file_id_cached, size, title) {
        return this.Voices.update({
            file_id_cached,
            size,
            title,
            active: true,
        },{
            where: {
                id
            }
        })
        // this.db.update('voices')
        // .set('file_id_cached', file_id_cached)
        // .set('size', size)
        // .set('title', title)
        // .set('active', true)
        // .where('id', id)
        // .returning('*')
        // .run();
    }

    // findVoiceById(id) {
    //     return this.db.select()
    //     .from('voices')
    //     .where('voices.id', id)
    //     .run();
    // }

    getTasks(chat_id, message_type, fullfilled = false) {
        return this.Task.findAll({
            where: {
                chat_id,
                message_type,
                fullfilled
            },
            order: [
                ['created_at', 'DESC'],
            ],
        })
        // this.db.select('id', 'task', 'content')
        // .from('tasks')
        // .where('tasks.chat_id', chat_id)
        // .and('tasks.fullfilled', false)
        // .and('tasks.message_type', message_type)
        // .orderBy('created_at', 'desc')
        // // .and('tasks.task', task)
        // .run();
    }

    createTask(chat_id, message_type, task, content) {
        return this.Task.create({chat_id,
            message_type,
            task,
            content})
        // return this.db.insert(  'chat_id', 'message_type', 'task',
        //                         'content')
        // .into('tasks')
        // .values({chat_id,
        // message_type,
        // task,
        // content})
        // .returning('id')
        // .run();
    }

    fullfillTask(id) {
        // console.log(id)
        return this.Task.update({
            fullfilled: true,
            fullfilled_at: new Date()
        },{
            where: {
                id
            }
        })
        // return this.db.update('tasks')
        // .set('fullfilled', true)
        // .set('fullfilled_at', new Date())
        // .where('id', id)
        // .returning('*')
        // .run();
    }

    // findPerm(chat_id, message_type, task ) {
    //     return this.db.select('content')
    //     .from('tasks')
    //     .where('tasks.chat_id', chat_id)
    //     .and('tasks.message_type', message_type)
    //     .and('tasks.task', task)
    //     .run();
    // }

    createPerm(voice_id, owner_chat_id) {
        console.log(`createPerm vid: ${voice_id}`)
        return this.VoicePermissions.create({
            voice_id,
            owner_chat_id,
        })
        // return this.db.insert(  'voice_id', 'owner_chat_id',
        //                         'created_at')
        // .into('voice_permissions')
        // .values({voice_id,
        // owner_chat_id,
        // created_at: new Date()})
        // .returning('id')
        // .run();
    }

    getPermByUserAndVoiceId(owner_chat_id, voice_id) {
        return this.VoicePermissions.findAll({
            where: {
                owner_chat_id,
                voice_id
            }
        })
        // return this.db.select()
        // .from('voice_permissions')
        // .where('owner_chat_id', owner_chat_id)
        // .and('voice_id', voice_id)
        // .run();
    }

    getPermByVoiceId(voice_id) {
        return this.VoicePermissions.findAll({
            where: {
                voice_id
            }
        })
    }

    deletePermByVoiceId(voice_id) {
        return this.VoicePermissions.destroy({
            where: {
                voice_id
            }
        })
    }

    getSourcesVoiceId(voice_id) {
        return this.Sources.findOne({
            where: {
                voice_id
            }
        })
    }

    deleteSourcesVoiceId(voice_id) {
        return this.Sources.destroy({
            where: {
                voice_id
            }
        })
    }
}

module.exports = { DB }