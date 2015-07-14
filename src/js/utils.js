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
 * game root namespace.
 *
 * @namespace game
 */
if (typeof game == "undefined" || !game) {
    var game = {};
}


/**
 * Constants
 *
 * @namespace game
 * @class game.Constants
 */
game.Constants =
{
    EASY: 0,
    MEDIUM: 1,
    HARD: 2,
    CANVAS_WIDTH: 1024,
    CANVAS_HEIGHT: 860,
    ENTITY_SIZE: 100,
    IE_SRC: '../assets/ie.png',
    FF_SRC: '../assets/ff.png',
    O_SRC: '../assets/o.png',
    CH_SRC: '../assets/ch.png'
};


/**
 * Strings
 *
 * @namespace game
 * @class game.Strings
 */
game.Strings =
{
    IE_DIE: 'IE, Die!',
    EASY: 'Easy',
    MEDIUM: 'Medium',
    HARD: 'Hard',
    GAME_OVER: 'Game over',
    SCORES: 'Scores: ',
    LIVES: 'Lives: '
};


/**
 * Events
 *
 * @namespace game
 * @class game.Events
 */
game.Events =
{
    UPDATE: 'update',
    ADD_ENTITY: 'addEntity',
    REMOVE_ENTITY: 'removeEntity',
    SCORES_CHANGED: 'scoresChanged',
    LIVES_CHANGED: 'livesChanged',
    GAME_OVER: 'gameOver',
    RESIZE: 'resize'
};

/**
 * utils namespace.
 *
 * @namespace game.utils
 */
if (typeof game.utils == "undefined" || !game.utils) {
    game.utils = {};
}


function extend(Child, Parent) {
    var F = function() {};
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.superclass = Parent.prototype;
}


// Add to prototype of array the method clone
Array.prototype.clone = function() {
    return this.slice(0);
};


/**
 * EventDispatcher class
 *
 * @namespace game.utils
 * @class game.utils.EventDispatcher
 */
(function()
{
    game.utils.EventDispatcher = function ()
    {
        var eventListeners = {
            any: []
        };

        //--------------------------------------------------------------------------
        //  Private methods
        //--------------------------------------------------------------------------

        var visitListeners = function (action, type, event) {
            var pubtype = eventListeners.hasOwnProperty(type)? type : 'any';
            var clonedListeners = eventListeners[pubtype].clone();
            var listeners = eventListeners[pubtype];

            for (var i = 0, max = clonedListeners.length; i < max; i++) {
                if (action === 'dispatch') {
                    clonedListeners[i](event);
                } else {
                    if (listeners[i] === event) {
                        listeners.splice(i, 1);
                    }
                }
            }
        };

        //--------------------------------------------------------------------------
        //  Public methods
        //--------------------------------------------------------------------------

        /**
         * Registers an event listener object on the object EventDispatcher
         * @param type The event type
         * @param listener The listener function that processes the event
         */
        this.addEventListener = function (type, listener) {
            type = type || 'any';
            if (typeof eventListeners[type] === "undefined") {
                eventListeners[type] = [];
            }
            eventListeners[type].push(listener);
        };

        /**
         * Removes a listener from the EventDispatcher object
         * @param type The event type
         * @param listener The listener function that processes the event
         */
        this.removeEventListener = function (type, listener) {
            visitListeners('remove', type, listener);
        };

        /**
         * Dispatches an event
         * @param type The event type
         * @param event The event object passed to the handler
         */
        this.dispatchEvent = function (type, event) {
            visitListeners('dispatch', type, event);
        };
    };
})();


/**
 * ExtMath class
 *
 * @namespace game.utils
 * @class game.utils.ExtMath
 */
(function()
{
    game.utils.ExtMath =
    {
        //--------------------------------------------------------------------------
        //  Static methods
        //--------------------------------------------------------------------------

        /**
         * Returns a random number from a specified range
         * @param min
         * @param max
         * @return {Number}
         */
        getRandomInt : function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        getRandomBool: function (trueChance) {
            return this.getRandomInt(0, 100) <= trueChance;
        }
    };
})();

/**
 * Collision class
 *
 * @namespace game.utils
 * @class game.utils.Collision
 */
(function ()
{
    //--------------------------------------------------------------------------
    //  Static methods
    //--------------------------------------------------------------------------

    game.utils.Collision =
    {
        /**
         * Collision check the object with the point
         * @param obj
         * @param x x coordinate of the point
         * @param y y coordinate of the point
         * @return {boolean}
         */
        hitTestPoint: function (obj, x, y) {
            if (x >= obj.getX() && y >= obj.getY()
                && x <= obj.getX() + obj.getWidth()
                && y <= obj.getY() + obj.getHeight()) {
                console.log("hit test point true");
                return true;
            } else {
                console.log("hit test point false", x, y, obj.getX(), obj.getY(), obj.getWidth(), obj.getHeight());
                return false;
            }
        }
    }
})();


/**
 * Dom class
 *
 * @namespace game.utils
 * @class game.utils.Dom
 */
(function ()
{
    //--------------------------------------------------------------------------
    //  Static methods
    //--------------------------------------------------------------------------

    game.utils.Dom =
    {
        /**
         * Returns the global coordinates of the element on the page
         * @param element HTMLElement
         * @return {Object}
         */
        getElementPosition: function (element) {
            var elem = element,
                tagname = '',
                x = 0,
                y = 0;

            while((typeof(elem) == 'object') && (typeof(elem.tagName) != 'undefined')) {
                y += elem.offsetTop;
                x += elem.offsetLeft;
                tagname = elem.tagName.toUpperCase();

                if(tagname == 'BODY') elem = 0;

                if(typeof(elem) == 'object') {
                    if(typeof(elem.offsetParent) == 'object')
                        elem = elem.offsetParent;
                }
            }
            return {x: x, y: y};
        }
    };
})();