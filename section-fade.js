(function () {
    'use strict';

    var SectionFade = function (element, options) {
        // Current section details
        var current = this.current = {
            index: 0,
            id: undefined,
            element: undefined
        };

        //
        // Options

        // The menus to be updated when the page is changed
        var menus = options.menu ? query(options.menu) : undefined;
        // Query selection for all the sections inside the element
        var sectionSelector = options.sectionSelector || '.sf';
        // List of sections inside the element
        var sections = query(element + ' ' + sectionSelector);
        // If set to true, when the page is changed, the hash in the url
        // will also be updated
        var includeAnchor = options.includeAnchor;
        // Delay before being able to scroll to the other page
        var delay = options.delay || 700;
        // What elements are scrollable therefore the scrolling
        // should be paused when these elements are being scrolled
        var scrollables = options.scrollables
            ? query(options.scrollables)
            : undefined;
        // Indication if the scrolling page change is paused
        var isPaused = false;
        // Paused timeout
        var pauseTimeout;

        /**
         * Listener for wheel events
         */
        function onWheel(e) {
            // If the scrolling should be paused, do nothing
            if (isPaused || (scrollables && scrollables.isScrolling())) {
                return;
            }

            var direction = e.deltaY < 0 ? 'up' : 'down';

            // If the direction is towards "up", then show the next element.
            // Else, show the previous element
            if (direction == 'down') {
                nextElement();
            } else {
                previousElement();
            }

            pauseByDelay();
        }

        /**
         * Show the next element
         */
        function nextElement() {
            var nextIndex = current.index + 1;
            var maxIndex = sections.length - 1;

            // If the index is out of bounds, do not continue
            if (nextIndex <= maxIndex) {
                var nextSection = sections[nextIndex];

                setCurrent(nextSection);
            }
        }

        /**
         * Show the previous element
         */
        function previousElement() {
            var nextIndex = current.index - 1;

            // If the index is out of bounds, do not continue
            if (nextIndex >= 0) {
                var nextSection = sections[nextIndex];

                setCurrent(nextSection);
            }
        }

        /**
         * Set the current values based on the current section
         */
        function setCurrent(currentSection) {
            current.id = currentSection.id;
            current.element = currentSection;

            // Set the current index of the section based on the section value
            for (var i = 0; i < sections.length; i++) {
                var section = sections[i];

                if (section == currentSection) {
                    // Add the 'active' class to the section
                    section.classList.add('active');

                    current.index = i;
                } else {
                    section.classList.remove('active');
                }
            }

            // Update the other elements
            updateElements();
        }

        /**
         * Update supporting elements
         */
        function updateElements() {
            // If the option "includeAnchor" is set to true, change the anchor
            // of the url based on the id of the section
            if (includeAnchor) {
                changeAnchor();
            }

            // Change the menu's current active element
            if (menus) {
                setActiveMenu(menus);
            }
        }

        /**
         * Change the anchor of the page's url
         */
        function changeAnchor() {
            var url = window.location.origin + window.location.pathname;
            url += '#' + current.id;

            window.location = url;
        }

        /**
         * Update the menu's current active element
         */
        function setActiveMenu(menus) {
            for (var i = 0; i < menus.length; i++) {
                var menu = menus[i];
                var elements = menu.querySelectorAll('[data-menuanchor]');

                for (var l = 0; l < elements.length; l++) {
                    var element = elements[l];
                    var menuanchor = element.attributes['data-menuanchor'];

                    if (menuanchor.value == current.id) {
                        element.classList.add('active');
                    } else {
                        element.classList.remove('active');
                    }
                }
            }
        }

        /**
         * Set the pause variable to true and wait for the delay value
         * count before setting the pause variable back to false
         */
        function pauseByDelay() {
            isPaused = true;

            // Clear the timeout for the pause variable
            clearTimeout(pauseTimeout);

            // Wait for the delay to be finished. Then set isPaused to false
            pauseTimeout = setTimeout(function () {
                isPaused = false;
            }, delay);
        }

        /**
         * Find the current section based on the url hash value
         */
        function initByHash() {
            var hash = window.location.hash;

            if (!hash) {
                setCurrent(sections[0]);
            } else {
                for (var i = 0; i < sections.length; i++) {
                    var section = sections[i];

                    if ('#' + section.id == hash) {
                        setCurrent(section);

                        break;
                    }
                }
            }

            // Add the class "sf-section" to all sections
            for (var i = 0; i < sections.length; i++) {
                sections[i].classList.add('sf-section');
            }
        }

        /**
         * Initialize the scrollables elements
         */
        function initScrollables() {
            // For each scrollable, element, set the wheel listener
            for (var i = 0; i < scrollables.length; i++) {
                var scrollable = scrollables[i];
                var scrollTimeout;

                /**
                 * In this wheel listener, check if the element is at top or
                 * bottom and the element is moving because when the element
                 * reached bottom and the user scrolled up, the top scrollTop
                 * value of the element is still the bottom most value.
                 * After checking if the scrolling direction is going up,
                 * check if the previous scrollTop value is equal to the
                 * current scrollTop and if they are equal and the direction
                 * is not going up, then the element is not being scrolled
                 * or has finished scrolling. Otherwise, set the element as
                 * currently scrolling and set the scrolling variable as false
                 * after n milliseconds set in the delay parameter
                 */
                scrollable.onwheel = function (e) {
                    var scrollMax = this.scrollHeight - this.offsetHeight;
                    var atTop = this.scrollTop == 0;
                    var atBottom = Math.ceil(this.scrollTop) == scrollMax;
                    var direction = e.deltaY < 0 ? 'up' : 'down';
                    var isMoving;

                    if (atTop && direction == 'down') {
                        isMoving = true;
                    } else if (atBottom && direction == 'up') {
                        isMoving = true;
                    }

                    if (this.previousTop == this.scrollTop && !isMoving) {
                        return;
                    }

                    this.scrolling = true;
                    this.previousTop = this.scrollTop;

                    // Clear the timeout for the pause variable
                    clearTimeout(scrollTimeout);

                    scrollTimeout = setTimeout(function () {
                        scrollable.scrolling = false;
                    }, delay);
                }
            }

            /**
             * Check if there is a scrollable element that is currently
             * being scrolled
             */
            scrollables.isScrolling = function () {
                for (var i = 0; i < scrollables.length; i++) {
                    var scrollable = scrollables[i];

                    if (scrollable.scrolling) {
                        return true;
                    }
                }
            }
        }

        /**
         * Initialize menu clicks to change the content on click
         */
        function initMenuClicks() {
            for (var i = 0; i < menus.length; i++) {
                var menu = menus[i];
                var elements = menu.querySelectorAll('[data-menuanchor] a');

                for (var l = 0; l < elements.length; l++) {
                    var element = elements[l];

                    // On anchor click, go to the section based on the href
                    element.onclick = function () {
                        for (var s = 0; s < sections.length; s++) {
                            var section = sections[s];

                            if (this.hash == '#' + section.id) {
                                setCurrent(section);

                                break;
                            }
                        }
                    };
                }
            }
        }


        // Listen for scroll events
        this.init = function () {
            window.onwheel = onWheel;

            // Initialize the current page using the hash of the url
            initByHash();

            // If the scrollables options is set, initialize the elements
            if (scrollables) {
                initScrollables();
            }

            // If the menu is set, initialize menu click
            if (menus) {
                initMenuClicks();
            }
        }

        // Remove event listener
        this.destroy = function () {
            window.removeEventListener('wheel', onWheel);
        };

        /**
         * Pause the scrolling event
         */
        this.pause = function () {
            isPaused = true;
        }

        /**
         * Un pause the scrolling event
         */
        this.unPause = function () {
            isPaused = false;
        }

        // Initialize the event listener
        this.init();
    };

    /**
     * Get the element via query selector
     */
    function query(selector) {
        return document.querySelectorAll(selector);
    };


    // Set the fade variable of the window as the fade variable
    // of this code
    window.SectionFade = SectionFade;
})();