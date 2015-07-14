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
 * Entity class
 *
 * @namespace game
 * @class game.Entity
 */
(function() {
    game.Entity = function (entityVO) {

        //--------------------------------------------------------------------------
        //  Public members
        //--------------------------------------------------------------------------

        this.img = null;
        this.isLoaded = false;
        this.entityVO = entityVO;

        //--------------------------------------------------------------------------
        //  Public methods
        //--------------------------------------------------------------------------

        this.getX = function() {
            return entityVO.x;
        };

        this.getY = function() {
            return entityVO.y;
        };

        this.getWidth = function() {
            return this.img.width;
        };

        this.getHeight = function() {
            return this.img.height;
        };
    };
}());


/**
 * View of game class
 *
 * @namespace game
 * @class game.View
 */
(function()
{
    game.View = function (canvas)
    {
        //--------------------------------------------------------------------------
        //  Modules
        //--------------------------------------------------------------------------

        var Collision = game.utils.Collision,
            Constants = game.Constants,
            Strings = game.Strings,
            Events = game.Events,
            ExtMath = game.utils.ExtMath,
            Entity = game.Entity;

        //--------------------------------------------------------------------------
        //  Private members
        //--------------------------------------------------------------------------

        var context = canvas.getContext('2d'),
            entities,
            btnX,
            btnY,
            btnWidth = 100,
            btnHeight = 80,
            model = null;

        //--------------------------------------------------------------------------
        //  Public members
        //--------------------------------------------------------------------------

        //--------------------------------------------------------------------------
        //  Private methods
        //--------------------------------------------------------------------------

        var getImgSrc = function(isEnemy) {
            if (isEnemy) {
                return Constants.IE_SRC;
            } else {
                var chance = ExtMath.getRandomInt(0, 100);
                if (chance <= 30) {
                    return Constants.FF_SRC;
                } else if (chance <= 60) {
                    return Constants.CH_SRC;
                } else {
                    return Constants.O_SRC;
                }
            }
        };

        var drawMenu = function() {
            // Title
            context.fillStyle = "#FF0000";
            context.strokeStyle = "#FF0000";
            context.font = "normal 30pt Arial";
            context.fillText(Strings.IE_DIE, (canvas.width - context.measureText(Strings.IE_DIE).width) / 2,
                    canvas.height / 2 - 50);

            btnX = (canvas.width - 350) / 2;
            btnY = canvas.height / 2;
            context.font = "normal 20px Arial";

            // Easy button
            context.beginPath();
            context.fillStyle = "#F46033";
            context.rect(btnX, btnY, btnWidth, btnHeight);
            context.fill();

            context.fillStyle = "#FFFFFF";
            context.fillText(Strings.EASY, btnX + (btnWidth - context.measureText(Strings.EASY).width) / 2,
                    btnY + btnHeight / 2 + 5);

            // Medium button
            context.beginPath();
            context.fillStyle = "#CD1F1F";
            context.rect(btnX + 125, btnY, btnWidth, btnHeight);
            context.fill();

            context.fillStyle = "#FFFFFF";
            context.fillText(Strings.MEDIUM, btnX + 125 + (btnWidth - context.measureText(Strings.MEDIUM).width) / 2,
                    btnY + btnHeight / 2 + 5);

            // Hard button
            context.beginPath();
            context.fillStyle = "#B00000";
            context.rect(btnX + 250, btnY, btnWidth, btnHeight);
            context.fill();

            context.fillStyle = "#FFFFFF";
            context.fillText(Strings.HARD, btnX + 250 + (btnWidth - context.measureText(Strings.HARD).width) / 2,
                    btnY + btnHeight / 2 + 5);
        };

        var drawScores = function() {
            var scoresStr = Strings.SCORES + model.getScores().toString();
            context.fillStyle = "#127043";
            context.strokeStyle = "#127043";
            context.font = "normal 30px Arial";
            context.fillText(scoresStr, canvas.width - context.measureText(scoresStr).width - 25,
                    canvas.height - 35);
        };

        var drawLives = function() {
            var scoresStr = Strings.LIVES + model.getLives().toString();
            context.fillStyle = "#880c12";
            context.strokeStyle = "#880c12";
            context.font = "normal 30px Arial";
            context.fillText(scoresStr, 25,
                    canvas.height - 35);
        };

        var drawGameOver = function() {
            context.fillStyle = "#FB111C";
            context.strokeStyle = "#FB111C";
            context.font = "bold 48pt Arial";
            context.fillText(Strings.GAME_OVER, (canvas.width - context.measureText(Strings.GAME_OVER).width) / 2,
                    canvas.height / 2);
        };

        //--------------------------------------------------------------------------
        //  Public methods
        //--------------------------------------------------------------------------

        this.setModel = function (newModel) {
            model = newModel;
            context.clearRect(0, 0, canvas.width, canvas.height);
            entities = [];
            model.addEventListener(Events.UPDATE, onRedraw);
            model.addEventListener(Events.ADD_ENTITY, onAddEntity);
            model.addEventListener(Events.REMOVE_ENTITY, onRemoveEntity);
            model.addEventListener(Events.SCORES_CHANGED, onScoresChanged);
            model.addEventListener(Events.LIVES_CHANGED, onLivesChanged);
            model.addEventListener(Events.GAME_OVER, onGameOver);
        };

        this.getEntityAtMouse = function (mouseX, mouseY) {
            for (var key in entities) {
                if (entities.hasOwnProperty(key)) {
                    var entity = entities[key];
                    if (Collision.hitTestPoint(entity, mouseX, mouseY)) {
                        return entity;
                    }
                }
            }
            return null;
        };

        this.getButtonAtMouse = function (mouseX, mouseY) {
            if (mouseY >= btnY && mouseY <= btnY + btnHeight) {
                if (mouseX >= btnX && mouseX <= btnX + btnWidth) {
                    return Constants.EASY;
                } else if (mouseX >= btnX + 125 && mouseX <= btnX + 225) {
                    return Constants.MEDIUM;
                } else if (mouseX >= btnX + 250 && mouseX <= btnX + 350) {
                    return Constants.HARD;
                }
            }
            return -1;
        };

        //--------------------------------------------------------------------------
        //  Event handlers
        //--------------------------------------------------------------------------

        var onRedraw = function () {
            context.clearRect(0, 0, canvas.width, canvas.height);

            if (model == null) {
                drawMenu();
            } else {
                for (var key in entities) {
                    if (entities.hasOwnProperty(key)) {
                        var entity = entities[key];
                        if (entity.isLoaded) {
                            context.drawImage(entity.img, entity.getX(), entity.getY());
                        }
                    }
                }
                drawScores();
                drawLives();
            }
        };

        var onAddEntity = function(entityVO) {
            var entity = new Entity(entityVO);
            entity.img = new Image();
            entity.img.onload = function() {
                entity.isLoaded = true;
            };
            entity.img.src = getImgSrc(entityVO.isEnemy);
            entities[entityVO.id] = entity;
        };

        var onRemoveEntity = function (id) {
            delete entities[id];
            console.log("Entity is removed");
        };

        var onScoresChanged = function (scores) {
            drawScores();
        };

        var onLivesChanged = function (lives) {
            drawLives();
        };

        var onGameOver = function () {
            model.removeEventListener(Events.UPDATE, onRedraw);
            model.removeEventListener(Events.ADD_ENTITY, onAddEntity);
            model.removeEventListener(Events.REMOVE_ENTITY, onRemoveEntity);
            model.removeEventListener(Events.SCORES_CHANGED, onScoresChanged);
            model.removeEventListener(Events.LIVES_CHANGED, onLivesChanged);
            model.removeEventListener(Events.GAME_OVER, onGameOver);
            model = null;
            drawGameOver();
            setTimeout(onRedraw, 3000);
        };

        var onResize = function () {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            Constants.CANVAS_WIDTH = canvas.width;
            Constants.CANVAS_HEIGHT = canvas.height;
            onRedraw();
        };

        //--------------------------------------------------------------------------
        //  Initialization
        //--------------------------------------------------------------------------

        window.addEventListener(Events.RESIZE, onResize, false);
        onResize();
    };
})();