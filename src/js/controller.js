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
 * Controller of game class
 *
 * @namespace game
 * @class game.Controller
 */
(function()
{
    game.Controller = function (canvas) {

        //--------------------------------------------------------------------------
        //  Modules
        //--------------------------------------------------------------------------

        var Dom = game.utils.Dom,
            Model = game.Model,
            Constants = game.Constants,
            Events = game.Events,
            View = game.View;

        //--------------------------------------------------------------------------
        //  Private members
        //--------------------------------------------------------------------------

        var canvasPosition,
            model,
            view;

        //--------------------------------------------------------------------------
        //  Private methods
        //--------------------------------------------------------------------------

        var createGame = function(level) {
            console.log('Game level is: ', level);
            model = new Model(level);
            model.addEventListener(Events.GAME_OVER, onGameOver);
            canvas.addEventListener('mousedown', onMouseDown);

            view.setModel(model);
        };

        //--------------------------------------------------------------------------
        //  Events handlers
        //--------------------------------------------------------------------------

        var onGameOver = function () {
            model.removeEventListener(Events.GAME_OVER, onGameOver);
            canvas.removeEventListener('mousedown', onMouseDown);
            model = null;
        };

        var onClick = function (e) {
            if (model == null) {
                var level = view.getButtonAtMouse(e.clientX + window.scrollX - canvasPosition.x,
                        e.clientY + window.scrollY - canvasPosition.y);
                if (level != -1) {
                    createGame(level);
                }
            }
        };

        var onMouseDown = function (e) {
            if (model != null) {
                while (true) {
                    var entity = view.getEntityAtMouse(e.clientX + window.scrollX - canvasPosition.x,
                            e.clientY + window.scrollY - canvasPosition.y);
                    if (entity != null) {
                        model.killEntity(entity.entityVO);
                    } else {
                        break;
                    }
                }
            }
        };

        //--------------------------------------------------------------------------
        //  Initialization
        //--------------------------------------------------------------------------

        canvasPosition = Dom.getElementPosition(document.getElementById("canvas"));
        view = new View(canvas);
        canvas.addEventListener('click', onClick);

        // To disable selection on web page
        window.document.body.onselectstart = function () {return false;};
    };
})();