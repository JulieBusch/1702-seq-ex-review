var Sequelize = require('sequelize');

var db = new Sequelize('postgres://localhost:5432/catstravaganza', {
    logging: false
});

var Cat = db.define('cats', {

    name: {
        type: Sequelize.STRING,
        allowNull: false
    },

    fluffiness: {
        type: Sequelize.ENUM('shorthaired', 'longhaired')
    },

    color: {
        type: Sequelize.STRING
    },

    wuv: {
        type: Sequelize.INTEGER,
        validate: {
            min: 0,
            max: 10
        }
    }

}, {

    getterMethods: {
        description: function() {
            return `${this.color} ${this.fluffiness}`;
        }
    },

    instanceMethods: {
        grooming: function() {
            this.update({
                fluffiness: 'shorthaired'
            })
            .catch();

        }
    },

    classMethods: {
        findFluffyOrangeCats: function() {
            return this.findAll({
                where: {
                    color: 'orange',
                    fluffiness: 'longhaired'
                }
            })
            .catch();
        }
    },

    hooks: {
        beforeValidate: function(cat) {
            cat.wuv = 10;
        }

    }

});

var Owner = db.define('owners', {

    name: {
        type: Sequelize.STRING,
        allowNull: false
    },

    craziness: {
        type: Sequelize.INTEGER,
        validate: {
            min: 0,
            max: 10
        }
    }

}, {

    instanceMethods: {
        isCrazyCatPerson: function() {
            if (this.countCats() > 3 || this.craziness >= 5) {
                return `${this.name} is a crazy cat person!`;
            } else {
                return `${this.name} is just a regular cat person!`;
            }
        },

        adopt: function(catId) {
            if (catId) {
                this.addCat(catId);
            } else {
                Cat.findOne({
                    where: {
                        ownerId: null
                    }
                })
                    .then(cat => this.addCat(cat))
                    .catch();
            }
        }
    }

});

Owner.hasMany(Cat);

module.exports = {
    db: db,
    Cat: Cat,
    Owner: Owner
};
