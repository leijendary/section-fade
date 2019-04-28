(function () {
    'use strict';

    var SectionFade = function (el, options) {
        // Current section details
        var current = this.current = {
            index: 0,
            id: undefined,
            element: undefined
        };

        // Options
        var menus = options.menu ? query(options.menu) : undefined;
        var sectionSelector = options.sectionSelector || '.sf';
        var sections = query(el + ' ' + sectionSelector);
        var includeAnchor = options.includeAnchor;

        /**
         * Listener for wheel events
         */
        function onWheel(e) {
            var direction = e.deltaY < 0 ? 'up' : 'down';
    
            // If the direction is towards "up", then show the next element.
            // Else, show the previous element
            if (direction == 'down') {
                nextElement();
            } else {
                previousElement();
            }
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

                    if (element.attributes['data-menuanchor'].value == current.id) {
                        element.classList.add('active');
                    } else {
                        element.classList.remove('active');
                    }
                }
            }
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
         * Initialize menu clicks to change the content on click
         */
        function initMenuClicks() {
            for (var i = 0; i < menus.length; i++) {
                var menu = menus[i];
                var elements = menu.querySelectorAll('[data-menuanchor] a');

                for (var l = 0; l < elements.length; l++) {
                    var element = elements[l];

                    // On anchor click, go to the section based on the href
                    element.addEventListener('click', goToSection);
                }
            }
        }

        /**
         * Remove event listeners for all menus
         */
        function destroyMenuClicks() {
            for (var i = 0; i < menus.length; i++) {
                var menu = menus[i];
                var elements = menu.querySelectorAll('[data-menuanchor] a');

                for (var l = 0; l < elements.length; l++) {
                    var element = elements[l];

                    // On anchor click, go to the section based on the href
                    element.addEventListener('click', goToSection);
                }
            }
        }

        /**
         * Go to section. This is for the menu click event
         */
        function goToSection() {
            for (var s = 0; s < sections.length; s++) {
                var section = sections[s];

                if (this.hash == '#' + section.id) {
                    setCurrent(section);

                    break;
                }
            }
        }

        
        // Listen for scroll events
        this.init = function () {
            window.addEventListener('wheel', onWheel);

            // Initialize the current page using the hash of the url
            initByHash();

            // If the menu is set, initialize menu click
            if (menus) {
                initMenuClicks();
            }
        }

        // Remove event listener
        this.destroy = function () {
            window.removeEventListener('wheel', onWheel);

            if (menus) {
                destroyMenuClicks();
            }
        };

        // Initialize the event listener
        this.init();
    };

    /**
     * Get the element via query selector
     */
    function query(selector) {
        return document.querySelectorAll(selector);
    };


    // Set the fade varialbe of the window as the fade variable
    // of this code
    window.SectionFade = SectionFade;
})();