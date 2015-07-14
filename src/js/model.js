/*
 * Copyright 2012 Alexandr Albul
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * EntityVO class
 *
 * @namespace game
 * @class game.EntityVO
 */
(function() {
    game.EntityVO = function (id, x, y, speed, fluctuation, isEnemy) {

        //--------------------------------------------------------------------------
        //  Public members
        //--------------------------------------------------------------------------

        this.id = id;
        this.x = x;
        this.y = y;
        this.width = game.Constants.ENTITY_SIZE;
        this.height = game.Constants.ENTITY_SIZE;
        this.speed = speed;
        this.fluctuation = fluctuation;
        this.isEnemy = isEnemy;
    };
}());

/**
 * Model of game class
 *
 * @namespace game
 * @class game.Model
 */
(function()
{
    game.Model = function (level)
    {
        game.Model.superclass.constructor.call(this);

        //--------------------------------------------------------------------------
        //  Modules
        //--------------------------------------------------------------------------
        var
            Constants = game.Constants,
            Events = game.Events,
            ExtMath = game.utils.ExtMath,
            EntityVO = game.EntityVO;

        //--------------------------------------------------------------------------
        //  Private members
        //--------------------------------------------------------------------------

        var self = this,
            scores,
            lives,
            entityVOs,
            maxSpeed,
            minSpeed,
            enemyChance,
            intervalID,
            lastAddTime = new Date(),
            currTime;

        //--------------------------------------------------------------------------
        //  Public members
        //--------------------------------------------------------------------------

        //--------------------------------------------------------------------------
        //  Private methods
        //--------------------------------------------------------------------------

        var getId = function () {
            return (new Date()).getTime();
        };

        var getRandX = function () {
            return ExtMath.getRandomInt(0, Constants.CANVAS_WIDTH - Constants.ENTITY_SIZE);
        };

        var getRandSpeed = function () {
            return ExtMath.getRandomInt(minSpeed, maxSpeed);
        };

        var getRandFluctuation = function () {
            return ExtMath.getRandomInt(1, 2);  // TODO: implement fluctuation
        };

        var getIsEnemy = function () {
            return ExtMath.getRandomBool(enemyChance);
        };

        var addEntity = function () {
            var entityVO = new EntityVO(getId(), getRandX(), -Constants.ENTITY_SIZE, getRandSpeed(),
                getRandFluctuation(), getIsEnemy());
            entityVOs[entityVO.id] = entityVO;
            self.dispatchEvent(Events.ADD_ENTITY, entityVO);
        };

        var removeEntity = function (id) {
            delete entityVOs[id];
            self.dispatchEvent(Events.REMOVE_ENTITY, id);
        };

        var checkGameOver = function () {
            if (lives == 0) {
                clearInterval(intervalID);
                entityVOs = null;
                self.dispatchEvent(Events.GAME_OVER, null);
                self = null;
            }
        };

        var update = function () {
            currTime = new Date();
            if (currTime.getTime() - lastAddTime.getTime() > 700) {
                lastAddTime = currTime;
                addEntity();
            }

            for (var key in entityVOs) {
                var entityVO = entityVOs[key];
                entityVO.y += entityVO.speed;
                // Entity is reached the bottom
                if (entityVO.y + entityVO.height > Constants.CANVAS_HEIGHT) {
                    if (entityVO.isEnemy) {
                        lives -= 1;
                        self.dispatchEvent(Events.LIVES_CHANGED, lives);
                        checkGameOver();
                    }
                    removeEntity(entityVO.id);
                }
            }
            self.dispatchEvent(Events.UPDATE, entityVOs);
        };

        //--------------------------------------------------------------------------
        //  Public methods
        //--------------------------------------------------------------------------

        this.killEntity = function(entityVO) {
            if (entityVO.isEnemy) {
                scores += (entityVO.speed < 10? 5 : 10);
                self.dispatchEvent(Events.SCORES_CHANGED, scores);
            } else {
                lives -= 1;
                self.dispatchEvent(Events.LIVES_CHANGED, lives);
                checkGameOver();
            }
            removeEntity(entityVO.id);
        };

        this.getScores = function() {
            return scores;
        };

        this.getLives = function() {
            return lives;
        };

        //--------------------------------------------------------------------------
        //  Initialization
        //--------------------------------------------------------------------------

        scores = 0;
        entityVOs = [];

        switch (level) {
            case Constants.EASY:
                lives = 15;
                maxSpeed = 15;
                minSpeed = 2;
                enemyChance = 60;
                break;
            case Constants.MEDIUM:
                lives = 10;
                maxSpeed = 20;
                minSpeed = 4;
                enemyChance = 70;
                break;
            case Constants.HARD:
                lives = 5;
                maxSpeed = 30;
                minSpeed = 10;
                enemyChance = 80;
                break;
        }

        intervalID = setInterval(update, 35);
    };

    // Inherit from event dispatcher
    extend(game.Model, game.utils.EventDispatcher);
})();

