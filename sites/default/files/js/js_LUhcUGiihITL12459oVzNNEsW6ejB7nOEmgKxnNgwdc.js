/* @license GPL-2.0-or-later https://www.drupal.org/licensing/faq */
((Drupal, once) => {
    Drupal.behaviors.azBarrioOffCanvasSearch = {
        attach: (context) => {
            function focusOffCanvasSearchOnShow() {
                const offCanvasNav = document.querySelector('#azMobileNav');
                offCanvasNav.addEventListener('shown.bs.offcanvas', (event) => {
                    if (event.relatedTarget.id === 'jsAzSearch') document.querySelector('#block-az-barrio-offcanvas-searchform input').focus();
                });
            }
            once('azBarrioOffCanvasSearch', '#azMobileNav').forEach(focusOffCanvasSearchOnShow, context);
        }
    };
})(Drupal, once);;
(($, Drupal) => {
    Drupal.behaviors.azBarrioButtonNoConflict = {
        attach: () => {
            if ($.fn.button && $.fn.button.noConflict !== undefined) {
                const bootstrapButton = $.fn.button.noConflict();
                $.fn.bootstrapBtn = bootstrapButton;
            }
        }
    };
})(jQuery, Drupal);;
((Drupal, once) => {
    Drupal.behaviors.azMobileNav = {
        attach: (context) => {
            function addCurrentPageClass() {
                const currentPagePath = window.location.pathname;
                const mobileNavMenuLinks = document.querySelectorAll('#az_mobile_nav_menu a');
                Array.from(mobileNavMenuLinks).some((link) => {
                    if (link.getAttribute('href') === currentPagePath) {
                        link.parentNode.classList.add('text-bg-gray-200', 'az-mobile-nav-current');
                        return true;
                    }
                    return false;
                });
            }
            once('azMobileNavCurrentPage', '#az_mobile_nav_menu').forEach(addCurrentPageClass, context);
        }
    };
})(Drupal, once);;
((Drupal, once) => {
    Drupal.behaviors.az_youtube_video_bg = {
        attach(context) {
            function initYouTubeBackgrounds() {
                if (window.screen && window.screen.width > 768) {
                    const defaultSettings = {
                        loop: true,
                        mute: true,
                        pauseButtonClass: 'az-video-pause',
                        playButtonClass: 'az-video-play',
                        ratio: 16 / 9,
                        width: document.documentElement.clientWidth
                    };
                    const bgVideoSettings = {};
                    const tag = document.createElement('script');
                    const firstScriptTag = document.getElementsByTagName('script')[0];
                    tag.src = 'https://www.youtube.com/iframe_api';
                    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                    const bgVideoParagraphs = document.getElementsByClassName('az-js-video-background');
                    window.onYouTubeIframeAPIReady = () => {
                        Array.from(bgVideoParagraphs).forEach((element) => {
                            const parentParagraph = document.getElementById(element.dataset.parentid);
                            const youtubeId = element.dataset.youtubeid;
                            bgVideoSettings[youtubeId] = {
                                autoplay: element.dataset.autoplay === 'true',
                                start: element.dataset.start
                            };
                            const videoPlayer = element.getElementsByClassName('az-video-player')[0];
                            const youTubePlayer = window.YT;
                            element.player = new youTubePlayer.Player(videoPlayer, {
                                width: defaultSettings.width,
                                height: Math.ceil(defaultSettings.width / defaultSettings.ratio),
                                videoId: youtubeId,
                                playerVars: {
                                    controls: 0,
                                    enablejsapi: 1,
                                    origin: window.location.origin,
                                    rel: 0
                                },
                                events: {
                                    onReady: window.onPlayerReady,
                                    onStateChange: window.onPlayerStateChange
                                }
                            });
                            const playButton = element.getElementsByClassName('az-video-play')[0];
                            playButton.addEventListener('click', (event) => {
                                event.preventDefault();
                                element.player.playVideo();
                                parentParagraph.classList.remove('az-video-paused');
                                parentParagraph.classList.add('az-video-playing');
                            });
                            const pauseButton = element.getElementsByClassName('az-video-pause')[0];
                            pauseButton.addEventListener('click', (event) => {
                                event.preventDefault();
                                element.player.pauseVideo();
                                parentParagraph.classList.remove('az-video-playing');
                                parentParagraph.classList.add('az-video-paused');
                            });
                        });
                    };
                    const setDimensions = (container) => {
                        container.style.height = `${container.parentNode.offsetHeight}px`;
                        if (container.dataset.style === 'bottom') container.style.top = 0;
                        const thisPlayer = container.getElementsByClassName('az-video-player')[0];
                        if (thisPlayer === null) return;
                        thisPlayer.style.zIndex = -100;
                        const width = container.offsetWidth;
                        const height = container.offsetHeight;
                        const pWidth = Math.ceil(height * defaultSettings.ratio);
                        const pHeight = Math.ceil(width / defaultSettings.ratio);
                        let widthMinuspWidthDividedByTwo = (width - pWidth) / 2;
                        widthMinuspWidthDividedByTwo = `${widthMinuspWidthDividedByTwo.toString()}px`;
                        const pHeightRatio = `${(height-pHeight)/2}px`;
                        if (width / defaultSettings.ratio < height) {
                            thisPlayer.width = pWidth;
                            thisPlayer.height = height;
                            thisPlayer.style.left = widthMinuspWidthDividedByTwo;
                            thisPlayer.style.top = 0;
                        } else {
                            thisPlayer.height = pHeight;
                            thisPlayer.width = width;
                            thisPlayer.style.top = pHeightRatio;
                            thisPlayer.style.left = 0;
                        }
                    };
                    const resize = () => {
                        Array.from(bgVideoParagraphs).forEach((element) => {
                            setDimensions(element);
                        });
                    };
                    window.onPlayerReady = (event) => {
                        const id = event.target.options.videoId;
                        if (!bgVideoSettings[id].autoplay) return;
                        if (defaultSettings.mute) event.target.mute();
                        event.target.seekTo(bgVideoSettings[id].start);
                        event.target.playVideo();
                        dispatchEvent(new Event('azVideoPlay'));
                    };
                    window.onPlayerStateChange = (event) => {
                        const id = event.target.options.videoId;
                        const stateChangeContainer = document.getElementById(`${id}-bg-video-container`);
                        const parentContainer = document.getElementById(stateChangeContainer.dataset.parentid);
                        if (event.data === 0 && defaultSettings.loop) stateChangeContainer.player.seekTo(bgVideoSettings[id].start);
                        if (event.data === 1) {
                            resize();
                            parentContainer.classList.add('az-video-playing');
                            parentContainer.classList.remove('az-video-loading');
                        }
                    };
                    window.addEventListener('load', () => {
                        resize();
                    });
                    window.addEventListener('resize', () => {
                        resize();
                    });
                }
            }
            once('youTubeTextOnMedia-init', 'body').forEach(initYouTubeBackgrounds, context);
        }
    };
})(Drupal, once);;
((Drupal, window, document, once) => {
    Drupal.azSelectMenu = Drupal.azSelectMenu || {};
    Drupal.behaviors.azSelectMenu = {
        attach(context, settings) {
            Object.keys(settings.azSelectMenu.ids).forEach((property) => {
                if (settings.azSelectMenu.ids.hasOwnProperty(property)) {
                    const selectFormId = settings.azSelectMenu.ids[property];
                    const selectForm = document.querySelector(`#${selectFormId}`);
                    once('azSelectMenu', selectForm, context).forEach((element) => {
                        const {
                            handleEvents
                        } = Drupal.azSelectMenu;
                        element.addEventListener('focus', handleEvents);
                        element.addEventListener('change', handleEvents);
                        element.addEventListener('mouseenter', handleEvents);
                        const button = element.querySelector('button');
                        button.addEventListener('click', handleEvents);
                        button.addEventListener('touchstart', handleEvents);
                        button.addEventListener('mouseenter', handleEvents);
                        button.addEventListener('mouseleave', handleEvents);
                        button.addEventListener('focus', handleEvents);
                        button.addEventListener('blur', handleEvents);
                        document.addEventListener('touchstart', handleEvents);
                        element.classList.add('processed');
                    });
                }
            });
        }
    };
    Drupal.azSelectMenu.handleEvents = (event) => {
        if (event.type === 'touchstart')
            if (event.target.classList.contains('js_select_menu_button')) {} else {
                document.querySelectorAll('.az-select-menu').forEach((form) => {
                    const popoverInstance = window.arizonaBootstrap ? .Popover ? .getInstance(form);
                    if (popoverInstance) popoverInstance.hide();
                });
                return;
            }
        const selectForm = event.target.closest('form');
        const selectElement = selectForm.querySelector('select');
        const [optionsSelected] = selectElement.selectedOptions;
        const selectElementHref = optionsSelected.dataset.href;
        const button = selectForm.querySelector('button');
        let popoverInstance = window.arizonaBootstrap ? .Popover ? .getInstance(selectForm);
        if (selectElementHref !== '') {
            if (popoverInstance) popoverInstance.dispose();
            button.classList.remove('disabled');
            button.setAttribute('aria-disabled', 'false');
            switch (event.type) {
                case 'click':
                    event.stopImmediatePropagation();
                    window.location = selectElementHref;
                    break;
                default:
                    break;
            }
        } else {
            button.classList.add('disabled');
            button.setAttribute('aria-disabled', 'true');
            selectElement.setAttribute('aria-disabled', 'true');
            if (!popoverInstance && window.arizonaBootstrap ? .Popover) popoverInstance = window.arizonaBootstrap.Popover.getOrCreateInstance ? window.arizonaBootstrap.Popover.getOrCreateInstance(selectForm) : window.arizonaBootstrap.Popover.getInstance(selectForm);
            switch (event.type) {
                case 'click':
                case 'touchstart':
                    if (event.target.classList.contains('js_select_menu_button')) {
                        if (popoverInstance) popoverInstance.show();
                        selectElement.focus();
                    }
                    break;
                case 'focus':
                case 'mouseenter':
                    if (event.target.classList.contains('js_select_menu_button')) {
                        if (popoverInstance) popoverInstance.show();
                    } else {
                        if (popoverInstance) popoverInstance.hide();
                    }
                    break;
                case 'mouseleave':
                    if (popoverInstance) popoverInstance.hide();
                    break;
                default:
                    break;
            }
        }
    };
})(Drupal, this, this.document, once);;
(function(Drupal) {
    'use strict';
    Drupal.behaviors.bootstrap_barrio = {
        attach: function(context, settings) {
            var position = window.scrollY;
            window.addEventListener('scroll', function() {
                if (window.scrollY > 50) document.querySelector('body').classList.add("scrolled");
                else document.querySelector('body').classList.remove("scrolled");
                var scroll = window.scrollY;
                if (scroll > position) {
                    document.querySelector('body').classList.add("scrolldown");
                    document.querySelector('body').classList.remove("scrollup");
                } else {
                    document.querySelector('body').classList.add("scrollup");
                    document.querySelector('body').classList.remove("scrolldown");
                }
                position = scroll;
            });
            document.addEventListener('click', function(event) {
                if (!event.target.matches('.dropdown-item a.dropdown-toggle')) return;
                event.preventDefault();
                toggle(event.target.next('ul'));
                event.stopPropagation();
            }, false);
            var toggle = function(elem) {
                if (window.getComputedStyle(elem).display === 'block') {
                    hide(elem);
                    return;
                }
                show(elem);
            };
            var show = function(elem) {
                elem.style.display = 'block';
            };
            var hide = function(elem) {
                elem.style.display = 'none';
            };
        }
    };
})(Drupal);;
((Drupal, drupalSettings) => {
    Drupal.extlink = Drupal.extlink || {};
    Drupal.extlink.attach = (context, drupalSettings) => {
        if (typeof drupalSettings.data === 'undefined' || !drupalSettings.data.hasOwnProperty('extlink')) return;
        let extIconPlacement = 'append';
        if (drupalSettings.data.extlink.extIconPlacement && drupalSettings.data.extlink.extIconPlacement !== '0') extIconPlacement = drupalSettings.data.extlink.extIconPlacement;
        const pattern = /^(([^:]+?\.)*)([^.:]+)((\.[a-z0-9]{1,253})*)(:[0-9]{1,5})?$/;
        const host = window.location.host.replace(pattern, '$2$3$6');
        const subdomain = window.location.host.replace(host, '');
        let subdomains;
        if (drupalSettings.data.extlink.extSubdomains) subdomains = '([^/]*\\.)?';
        else if (subdomain === 'www.' || subdomain === '') subdomains = '(www\\.)?';
        else subdomains = subdomain.replace('.', '\\.');
        let allowedDomains = false;
        if (drupalSettings.data.extlink.allowedDomains) {
            allowedDomains = [];
            for (let i = 0; i < drupalSettings.data.extlink.allowedDomains.length; i++) allowedDomains.push(new RegExp(`^https?:\\/\\/${drupalSettings.data.extlink.allowedDomains[i].replace(/(\r\n|\n|\r)/gm,'')}.*$`, 'i'));
        }
        const internalLink = new RegExp(`^https?://([^@]*@)?${subdomains}${host}`, 'i');
        let extInclude = false;
        if (drupalSettings.data.extlink.extInclude) extInclude = new RegExp(drupalSettings.data.extlink.extInclude.replace(/\\/, '\\'), 'i');
        let extExclude = false;
        if (drupalSettings.data.extlink.extExclude) extExclude = new RegExp(drupalSettings.data.extlink.extExclude.replace(/\\/, '\\'), 'i');
        let extExcludeNoreferrer = false;
        if (drupalSettings.data.extlink.extExcludeNoreferrer) extExcludeNoreferrer = new RegExp(drupalSettings.data.extlink.extExcludeNoreferrer.replace(/\\/, '\\'), 'i');
        let extCssExclude = false;
        if (drupalSettings.data.extlink.extCssExclude) extCssExclude = drupalSettings.data.extlink.extCssExclude;
        let extCssInclude = false;
        if (drupalSettings.data.extlink.extCssInclude) extCssInclude = drupalSettings.data.extlink.extCssInclude;
        let extCssExplicit = false;
        if (drupalSettings.data.extlink.extCssExplicit) extCssExplicit = drupalSettings.data.extlink.extCssExplicit;
        const externalLinks = [];
        const mailtoLinks = [];
        const telLinks = [];
        const extlinks = context.querySelectorAll('a:not([data-extlink]), area:not([data-extlink])');
        extlinks.forEach((el) => {
            try {
                let url = '';
                if (typeof el.href === 'string') url = el.href.toLowerCase();
                else {
                    if (typeof el.href === 'object') url = el.href.baseVal;
                }
                const isExtCssIncluded = extCssInclude && (el.matches(extCssInclude) || el.closest(extCssInclude));
                if (url.indexOf('http') === 0 && ((!internalLink.test(url) && !(extExclude && extExclude.test(url))) || (extInclude && extInclude.test(url)) || isExtCssIncluded) && !(extCssExclude && el.matches(extCssExclude)) && !(extCssExclude && el.closest(extCssExclude)) && !(extCssExplicit && !el.closest(extCssExplicit))) {
                    let match = false;
                    if (!isExtCssIncluded && allowedDomains) {
                        for (let i = 0; i < allowedDomains.length; i++)
                            if (allowedDomains[i].test(url)) {
                                match = true;
                                break;
                            }
                    }
                    if (!match) externalLinks.push(el);
                } else {
                    if (el.tagName !== 'AREA' && !(extCssExclude && el.closest(extCssExclude)) && !(extCssExplicit && !el.closest(extCssExplicit)))
                        if (url.indexOf('mailto:') === 0) mailtoLinks.push(el);
                        else {
                            if (url.indexOf('tel:') === 0) telLinks.push(el);
                        }
                }
            } catch (error) {
                return false;
            }
        });
        const hasExtIcon = drupalSettings.data.extlink.extClass !== '0' && drupalSettings.data.extlink.extClass !== '';
        const hasAdditionalExtClasses = drupalSettings.data.extlink.extAdditionalLinkClasses !== '';
        Drupal.extlink.applyClassAndSpan(externalLinks, 'ext', hasExtIcon ? extIconPlacement : null);
        if (hasAdditionalExtClasses) Drupal.extlink.applyClassAndSpan(externalLinks, drupalSettings.data.extlink.extAdditionalLinkClasses, null);
        const hasMailtoClass = drupalSettings.data.extlink.mailtoClass !== '0' && drupalSettings.data.extlink.mailtoClass !== '';
        const hasAdditionalMailtoClasses = drupalSettings.data.extlink.extAdditionalMailtoClasses !== '';
        if (hasMailtoClass) Drupal.extlink.applyClassAndSpan(mailtoLinks, drupalSettings.data.extlink.mailtoClass, extIconPlacement);
        if (hasAdditionalMailtoClasses) Drupal.extlink.applyClassAndSpan(mailtoLinks, drupalSettings.data.extlink.extAdditionalMailtoClasses, null);
        const hasTelClass = drupalSettings.data.extlink.telClass !== '0' && drupalSettings.data.extlink.telClass !== '';
        const hasAdditionalTelClasses = drupalSettings.data.extlink.extAdditionalTelClasses !== '0' && drupalSettings.data.extlink.extAdditionalTelClasses !== '';
        if (hasTelClass) Drupal.extlink.applyClassAndSpan(telLinks, drupalSettings.data.extlink.telClass, extIconPlacement);
        if (hasAdditionalTelClasses) Drupal.extlink.applyClassAndSpan(mailtoLinks, drupalSettings.data.extlink.extAdditionalTelClasses, null);
        if (drupalSettings.data.extlink.extTarget) {
            externalLinks.forEach((link, i) => {
                if (!(drupalSettings.data.extlink.extTargetNoOverride && link.matches('a[target]'))) externalLinks[i].setAttribute('target', '_blank');
            });
            externalLinks.forEach((link, i) => {
                const val = link.getAttribute('rel');
                if (val === null || typeof val === 'undefined') {
                    externalLinks[i].setAttribute('rel', 'noopener');
                    return;
                }
                if (val.indexOf('noopener') > -1)
                    if (val.indexOf('noopener') === -1) externalLinks[i].setAttribute('rel', `${val} noopener`);
                    else {}
                else externalLinks[i].setAttribute('rel', `${val} noopener`);
            });
        }
        if (drupalSettings.data.extlink.extNofollow) externalLinks.forEach((link, i) => {
            const val = link.getAttribute('rel');
            if (val === null || typeof val === 'undefined') {
                externalLinks[i].setAttribute('rel', 'nofollow');
                return;
            }
            let target = 'nofollow';
            if (drupalSettings.data.extlink.extFollowNoOverride) target = 'follow';
            if (val.indexOf(target) === -1) externalLinks[i].setAttribute('rel', `${val} nofollow`);
        });
        if (drupalSettings.data.extlink.extTitleNoOverride === false) externalLinks.forEach((link, i) => {
            const oldTitle = link.getAttribute('title');
            let newTitle = '';
            if (drupalSettings.data.extlink.extTargetAppendNewWindowDisplay) newTitle = drupalSettings.data.extlink.extTargetAppendNewWindowLabel;
            if (oldTitle !== null) {
                if (Drupal.extlink.hasNewWindowText(oldTitle)) return;
                newTitle = Drupal.extlink.combineLabels(oldTitle, newTitle);
            }
            if (newTitle) externalLinks[i].setAttribute('title', newTitle);
        });
        if (drupalSettings.data.extlink.extNoreferrer) externalLinks.forEach((link, i) => {
            if (drupalSettings.data.extlink.extExcludeNoreferrer && extExcludeNoreferrer.test(link.getAttribute('href'))) return;
            const val = link.getAttribute('rel');
            if (val === null || typeof val === 'undefined') {
                externalLinks[i].setAttribute('rel', 'noreferrer');
                return;
            }
            externalLinks[i].setAttribute('rel', `${val} noreferrer`);
        });
        Drupal.extlink = Drupal.extlink || {};
        Drupal.extlink.popupClickHandler = Drupal.extlink.popupClickHandler || (() => {
            if (drupalSettings.data.extlink.extAlert) return confirm(drupalSettings.data.extlink.extAlertText);
        });
        const _that = this;
        Drupal.extlink.handleClick = function(event) {
            const shouldNavigate = Drupal.extlink.popupClickHandler.call(_that, event);
            if (typeof shouldNavigate !== 'undefined' && !shouldNavigate) event.preventDefault();
        };
        externalLinks.forEach((val, i) => {
            externalLinks[i].removeEventListener('click', Drupal.extlink.handleClick);
            externalLinks[i].addEventListener('click', Drupal.extlink.handleClick);
        });
    };
    Drupal.extlink.hasNewWindowText = function(label) {
        return label.toLowerCase().indexOf(Drupal.t('new window')) !== -1;
    };
    Drupal.extlink.combineLabels = function(labelA, labelB) {
        labelA = labelA || '';
        labelB = labelB || '';
        if (!labelA.trim()) return labelB;
        if (!labelB.trim()) return labelA;
        const labelANoParens = labelA.trim().replace('(', '').replace(')', '');
        const labelBNoParens = labelB.trim().replace('(', '').replace(')', '');
        if (labelA === labelANoParens) {
            if (labelB === labelBNoParens) return `${labelA}, ${labelB}`;
            return `${labelA} ${labelB}`;
        }
        if (labelB === labelBNoParens) return `${labelB} ${labelA}`;
        return `(${labelANoParens}, ${labelBNoParens})`;
    };
    Drupal.extlink.applyClassAndSpan = (links, className, iconPlacement) => {
        let linksToProcess;
        if (drupalSettings.data.extlink.extImgClass) linksToProcess = links;
        else linksToProcess = links.filter((link) => {
            return link.querySelector('img, svg') === null;
        });
        for (let i = 0; i < linksToProcess.length; i++) {
            if (className !== '0') linksToProcess[i].classList.add(className);
            if (className === drupalSettings.data.extlink.mailtoClass && drupalSettings.data.extlink.extAdditionalMailtoClasses) linksToProcess[i].classList.add(drupalSettings.data.extlink.extAdditionalMailtoClasses);
            else if (className === drupalSettings.data.extlink.telClass && drupalSettings.data.extlink.extAdditionalTelClasses) linksToProcess[i].classList.add(drupalSettings.data.extlink.extAdditionalTelClasses);
            else {
                if (drupalSettings.data.extlink.extAdditionalLinkClasses) linksToProcess[i].classList.add(drupalSettings.data.extlink.extAdditionalLinkClasses);
            }
            linksToProcess[i].setAttribute('data-extlink', '');
            if (iconPlacement) {
                let link = linksToProcess[i];
                if (drupalSettings.data.extlink.extPreventOrphan && iconPlacement === 'append') {
                    let lastTextNode = link.lastChild;
                    let trailingWhitespace = null;
                    let parentNode = link;
                    while (lastTextNode)
                        if (lastTextNode.lastChild) {
                            parentNode = lastTextNode;
                            lastTextNode = lastTextNode.lastChild;
                        } else if (lastTextNode.nodeName === '#text' && parentNode.lastElementChild && lastTextNode.textContent.trim().length === 0) {
                        trailingWhitespace = lastTextNode;
                        parentNode = parentNode.lastElementChild;
                        lastTextNode = parentNode.lastChild;
                    } else break;
                    if (lastTextNode && lastTextNode.nodeName === '#text' && lastTextNode.textContent.length > 0) {
                        const lastText = lastTextNode.textContent;
                        const lastWordRegex = new RegExp(/\S+\s*$/, 'g');
                        const lastWord = lastText.match(lastWordRegex);
                        if (lastWord !== null) {
                            const breakPreventer = document.createElement('span');
                            breakPreventer.classList.add('extlink-nobreak');
                            breakPreventer.textContent = lastWord[0];
                            if (trailingWhitespace) {
                                trailingWhitespace.textContent = '';
                                breakPreventer.append(trailingWhitespace.textContent);
                            }
                            lastTextNode.textContent = lastText.substring(0, lastText.length - lastWord[0].length);
                            lastTextNode.parentNode.append(breakPreventer);
                            link = breakPreventer;
                        }
                    }
                }
                let iconElement;
                if (drupalSettings.data.extlink.extUseFontAwesome) {
                    iconElement = document.createElement('span');
                    iconElement.setAttribute('class', `fa-${className} extlink`);
                    if (className === drupalSettings.data.extlink.mailtoClass) {
                        if (drupalSettings.data.extlink.mailtoLabel) link.ariaLabel = drupalSettings.data.extlink.mailtoLabel;
                        iconElement.innerHTML = Drupal.theme('extlink_fa_mailto', drupalSettings, iconPlacement);
                    } else if (className === drupalSettings.data.extlink.extClass) {
                        if (drupalSettings.data.extlink.extLabel) link.ariaLabel = drupalSettings.data.extlink.extLabel;
                        iconElement.innerHTML = Drupal.theme('extlink_fa_extlink', drupalSettings, iconPlacement);
                    } else {
                        if (className === drupalSettings.data.extlink.telClass) {
                            if (drupalSettings.data.extlink.telLabel) link.ariaLabel = drupalSettings.data.extlink.telLabel;
                            iconElement.innerHTML = Drupal.theme('extlink_fa_tel', drupalSettings, iconPlacement);
                        }
                    }
                } else {
                    iconElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    iconElement.setAttribute('focusable', 'false');
                    iconElement.setAttribute('width', '1em');
                    iconElement.setAttribute('height', '1em');
                    iconElement.classList.add(className);
                    iconElement.setAttribute('data-extlink-placement', iconPlacement);
                    if (className === drupalSettings.data.extlink.mailtoClass) iconElement = Drupal.theme('extlink_mailto', iconElement, drupalSettings);
                    else if (className === drupalSettings.data.extlink.extClass) iconElement = Drupal.theme('extlink_extlink', iconElement, drupalSettings);
                    else {
                        if (className === drupalSettings.data.extlink.telClass) iconElement = Drupal.theme('extlink_tel', iconElement, drupalSettings);
                    }
                }
                iconElement.setAttribute('role', 'img');
                iconElement.setAttribute('aria-hidden', drupalSettings.data.extlink.extHideIcons);
                link[iconPlacement](iconElement);
            }
        }
    };
    Drupal.theme.extlink_fa_mailto = function(drupalSettings, iconPlacement) {
        return `<span class="${drupalSettings.data.extlink.extFaMailtoClasses}" data-extlink-placement="${iconPlacement}"></span>`;
    };
    Drupal.theme.extlink_fa_extlink = function(drupalSettings, iconPlacement) {
        return `<span class="${drupalSettings.data.extlink.extFaLinkClasses}" data-extlink-placement="${iconPlacement}"></span>`;
    };
    Drupal.theme.extlink_fa_tel = function(drupalSettings, iconPlacement) {
        return `<span class="${drupalSettings.data.extlink.extFaTelClasses}" data-extlink-placement="${iconPlacement}"></span>`;
    };
    Drupal.theme.extlink_mailto = function(iconElement, drupalSettings) {
        iconElement.setAttribute('aria-label', drupalSettings.data.extlink.mailtoLabel);
        iconElement.setAttribute('viewBox', '0 10 70 20');
        iconElement.innerHTML = `<title>${drupalSettings.data.extlink.mailtoLabel}</title><path d="M56 14H8c-1.1 0-2 0.9-2 2v32c0 1.1 0.9 2 2 2h48c1.1 0 2-0.9 2-2V16C58 14.9 57.1 14 56 14zM50.5 18L32 33.4 13.5 18H50.5zM10 46V20.3l20.7 17.3C31.1 37.8 31.5 38 32 38s0.9-0.2 1.3-0.5L54 20.3V46H10z"/>`;
        return iconElement;
    };
    Drupal.theme.extlink_extlink = function(iconElement, drupalSettings) {
        iconElement.setAttribute('aria-label', drupalSettings.data.extlink.extLabel);
        iconElement.setAttribute('viewBox', '0 0 80 40');
        iconElement.innerHTML = `<title>${drupalSettings.data.extlink.extLabel}</title><path d="M48 26c-1.1 0-2 0.9-2 2v26H10V18h26c1.1 0 2-0.9 2-2s-0.9-2-2-2H8c-1.1 0-2 0.9-2 2v40c0 1.1 0.9 2 2 2h40c1.1 0 2-0.9 2-2V28C50 26.9 49.1 26 48 26z"/><path d="M56 6H44c-1.1 0-2 0.9-2 2s0.9 2 2 2h7.2L30.6 30.6c-0.8 0.8-0.8 2 0 2.8C31 33.8 31.5 34 32 34s1-0.2 1.4-0.6L54 12.8V20c0 1.1 0.9 2 2 2s2-0.9 2-2V8C58 6.9 57.1 6 56 6z"/>`;
        return iconElement;
    };
    Drupal.theme.extlink_tel = function(iconElement, drupalSettings) {
        iconElement.setAttribute('aria-label', drupalSettings.data.extlink.telLabel);
        iconElement.setAttribute('viewBox', '0 0 181.352 181.352');
        iconElement.innerHTML = `<title>${drupalSettings.data.extlink.telLabel}</title><path xmlns="http://www.w3.org/2000/svg" d="M169.393,167.37l-14.919,9.848c-9.604,6.614-50.531,14.049-106.211-53.404C-5.415,58.873,9.934,22.86,17.134,14.555L29.523,1.678c2.921-2.491,7.328-2.198,9.839,0.811l32.583,38.543l0.02,0.02c2.384,2.824,2.306,7.22-0.83,9.868v0.029l-14.44,10.415c-5.716,5.667-0.733,14.587,5.11,23.204l27.786,32.808c12.926,12.477,20.009,18.241,26.194,14.118l12.008-13.395c2.941-2.472,7.328-2.169,9.839,0.821l32.603,38.543v0.02C172.607,160.316,172.519,164.703,169.393,167.37z"/>`;
        return iconElement;
    };
    Drupal.behaviors.extlink = Drupal.behaviors.extlink || {};
    Drupal.behaviors.extlink.attach = (context, drupalSettings) => {
        if (typeof extlinkAttach === 'function') extlinkAttach(context);
        else Drupal.extlink.attach(context, drupalSettings);
    };
})(Drupal, drupalSettings);;
(function($, Drupal, drupalSettings) {
    'use strict';
    Drupal.behaviors.googleCSECustomSearch = {
        attach: function(context, settings) {
            var getWatermarkBackground = function(value) {
                var googleCSEBaseUrl = 'https://www.google.com/cse/intl/';
                var googleCSEImageUrl = 'images/google_custom_search_watermark.gif';
                var language = drupalSettings.googlePSE.language + '/';
                return value ? '' : ' url(' + googleCSEBaseUrl + language + googleCSEImageUrl + ') left no-repeat';
            };
            var removeWatermark = function(e) {
                $(e.target).css('background', '#ffffff');
            };
            var addWatermark = function(e) {
                $(e.target).css('background', '#ffffff' + getWatermarkBackground($(e.target).val()));
            };
            var googleCSEWatermark = function(context, query) {
                var searchInputs = $(`[data-drupal-selector='${query}']`);
                if (drupalSettings.googlePSE.displayWatermark === 1) {
                    searchInputs.on("blur", addWatermark);
                    searchInputs.each(function() {
                        var event = {};
                        event.target = this;
                        addWatermark(event);
                    });
                } else {
                    searchInputs.on("blur", removeWatermark);
                    searchInputs.each(function() {
                        var event = {};
                        event.target = this;
                        removeWatermark(event);
                    });
                }
                searchInputs.focus(removeWatermark);
            };
            googleCSEWatermark('[data-drupal-selector="search-block-form"] [data-drupal-form-fields="edit-keys--2"]', 'edit-keys');
            googleCSEWatermark('[data-drupal-selector="search-block-form"] [data-drupal-form-fields="edit-keys"]', 'edit-keys');
            googleCSEWatermark('[data-drupal-selector="search-form"]', 'edit-keys');
            googleCSEWatermark('[data-drupal-selector="google-cse-search-box-form"]', 'edit-query');
        }
    };
})(jQuery, Drupal, drupalSettings);;
(function($, Drupal) {
    Drupal.theme.progressBar = function(id) {
        const escapedId = Drupal.checkPlain(id);
        return (`<div id="${escapedId}" class="progress" aria-live="polite">` + '<div class="progress__label">&nbsp;</div>' + '<div class="progress__track"><div class="progress__bar"></div></div>' + '<div class="progress__percentage"></div>' + '<div class="progress__description">&nbsp;</div>' + '</div>');
    };
    Drupal.ProgressBar = function(id, updateCallback, method, errorCallback) {
        this.id = id;
        this.method = method || 'GET';
        this.updateCallback = updateCallback;
        this.errorCallback = errorCallback;
        this.element = $(Drupal.theme('progressBar', id));
    };
    $.extend(Drupal.ProgressBar.prototype, {
        setProgress(percentage, message, label) {
            if (percentage >= 0 && percentage <= 100) {
                $(this.element).find('div.progress__bar').each(function() {
                    this.style.width = `${percentage}%`;
                });
                $(this.element).find('div.progress__percentage').html(`${percentage}%`);
            }
            $('div.progress__description', this.element).html(message);
            $('div.progress__label', this.element).html(label);
            if (this.updateCallback) this.updateCallback(percentage, message, this);
        },
        startMonitoring(uri, delay) {
            this.delay = delay;
            this.uri = uri;
            this.sendPing();
        },
        stopMonitoring() {
            clearTimeout(this.timer);
            this.uri = null;
        },
        sendPing() {
            if (this.timer) clearTimeout(this.timer);
            if (this.uri) {
                const pb = this;
                let uri = this.uri;
                if (!uri.includes('?')) uri += '?';
                else uri += '&';
                uri += '_format=json';
                $.ajax({
                    type: this.method,
                    url: uri,
                    data: '',
                    dataType: 'json',
                    success(progress) {
                        if (progress.status === 0) {
                            pb.displayError(progress.data);
                            return;
                        }
                        pb.setProgress(progress.percentage, progress.message, progress.label);
                        pb.timer = setTimeout(() => {
                            pb.sendPing();
                        }, pb.delay);
                    },
                    error(xmlhttp) {
                        const e = new Drupal.AjaxError(xmlhttp, pb.uri);
                        pb.displayError(`<pre>${e.message}</pre>`);
                    }
                });
            }
        },
        displayError(string) {
            const error = $('<div class="messages messages--error"></div>').html(string);
            $(this.element).before(error).hide();
            if (this.errorCallback) this.errorCallback(this);
        }
    });
})(jQuery, Drupal);;
/* @license MIT https://raw.githubusercontent.com/muicss/loadjs/4.3.0/LICENSE.txt */
loadjs = function() {
    var h = function() {},
        o = {},
        c = {},
        f = {};

    function u(e, n) {
        if (e) {
            var t = f[e];
            if (c[e] = n, t)
                for (; t.length;) t[0](e, n), t.splice(0, 1)
        }
    }

    function l(e, n) {
        e.call && (e = {
            success: e
        }), n.length ? (e.error || h)(n) : (e.success || h)(e)
    }

    function p(t, r, i, s) {
        var o, e, u, n = document,
            c = i.async,
            f = (i.numRetries || 0) + 1,
            l = i.before || h,
            a = t.replace(/[\?|#].*$/, ""),
            d = t.replace(/^(css|img|module|nomodule)!/, "");
        if (s = s || 0, /(^css!|\.css$)/.test(a))(u = n.createElement("link")).rel = "stylesheet", u.href = d, (o = "hideFocus" in u) && u.relList && (o = 0, u.rel = "preload", u.as = "style");
        else if (/(^img!|\.(png|gif|jpg|svg|webp)$)/.test(a))(u = n.createElement("img")).src = d;
        else if ((u = n.createElement("script")).src = d, u.async = void 0 === c || c, e = "noModule" in u, /^module!/.test(a)) {
            if (!e) return r(t, "l");
            u.type = "module"
        } else if (/^nomodule!/.test(a) && e) return r(t, "l");
        !(u.onload = u.onerror = u.onbeforeload = function(e) {
            var n = e.type[0];
            if (o) try {
                u.sheet.cssText.length || (n = "e")
            } catch (e) {
                18 != e.code && (n = "e")
            }
            if ("e" == n) {
                if ((s += 1) < f) return p(t, r, i, s)
            } else if ("preload" == u.rel && "style" == u.as) return u.rel = "stylesheet";
            r(t, n, e.defaultPrevented)
        }) !== l(t, u) && n.head.appendChild(u)
    }

    function t(e, n, t) {
        var r, i;
        if (n && n.trim && (r = n), i = (r ? t : n) || {}, r) {
            if (r in o) throw "LoadJS";
            o[r] = !0
        }

        function s(n, t) {
            ! function(e, r, n) {
                var t, i, s = (e = e.push ? e : [e]).length,
                    o = s,
                    u = [];
                for (t = function(e, n, t) {
                        if ("e" == n && u.push(e), "b" == n) {
                            if (!t) return;
                            u.push(e)
                        }--s || r(u)
                    }, i = 0; i < o; i++) p(e[i], t, n)
            }(e, function(e) {
                l(i, e), n && l({
                    success: n,
                    error: t
                }, e), u(r, e)
            }, i)
        }
        if (i.returnPromise) return new Promise(s);
        s()
    }
    return t.ready = function(e, n) {
        return function(e, t) {
            e = e.push ? e : [e];
            var n, r, i, s = [],
                o = e.length,
                u = o;
            for (n = function(e, n) {
                    n.length && s.push(e), --u || t(s)
                }; o--;) r = e[o], (i = c[r]) ? n(r, i) : (f[r] = f[r] || []).push(n)
        }(e, function(e) {
            l(n, e)
        }), t
    }, t.done = function(e) {
        u(e, [])
    }, t.reset = function() {
        o = {}, c = {}, f = {}
    }, t.isDefined = function(e) {
        return e in o
    }, t
}();;
/* @license GPL-2.0-or-later https://www.drupal.org/licensing/faq */
Drupal.debounce = function(func, wait, immediate) {
    let timeout;
    let result;
    return function(...args) {
        const context = this;
        const later = function() {
            timeout = null;
            if (!immediate) result = func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) result = func.apply(context, args);
        return result;
    };
};;
(function(Drupal, debounce) {
    let liveElement;
    const announcements = [];
    Drupal.behaviors.drupalAnnounce = {
        attach(context) {
            if (!liveElement) {
                liveElement = document.createElement('div');
                liveElement.id = 'drupal-live-announce';
                liveElement.className = 'visually-hidden';
                liveElement.setAttribute('aria-live', 'polite');
                liveElement.setAttribute('aria-busy', 'false');
                document.body.appendChild(liveElement);
            }
        }
    };

    function announce() {
        const text = [];
        let priority = 'polite';
        let announcement;
        const il = announcements.length;
        for (let i = 0; i < il; i++) {
            announcement = announcements.pop();
            text.unshift(announcement.text);
            if (announcement.priority === 'assertive') priority = 'assertive';
        }
        if (text.length) {
            liveElement.innerHTML = '';
            liveElement.setAttribute('aria-busy', 'true');
            liveElement.setAttribute('aria-live', priority);
            liveElement.innerHTML = text.join('\n');
            liveElement.setAttribute('aria-busy', 'false');
        }
    }
    Drupal.announce = function(text, priority) {
        announcements.push({
            text,
            priority
        });
        return debounce(announce, 200)();
    };
})(Drupal, Drupal.debounce);;
((Drupal) => {
    Drupal.Message = class {
        constructor(messageWrapper = null) {
            if (!messageWrapper) this.messageWrapper = Drupal.Message.defaultWrapper();
            else this.messageWrapper = messageWrapper;
        }
        static defaultWrapper() {
            let wrapper = document.querySelector('[data-drupal-messages]') || document.querySelector('[data-drupal-messages-fallback]');
            if (!wrapper) {
                wrapper = document.createElement('div');
                document.body.appendChild(wrapper);
            }
            if (wrapper.hasAttribute('data-drupal-messages-fallback')) {
                wrapper.removeAttribute('data-drupal-messages-fallback');
                wrapper.classList.remove('hidden');
            }
            wrapper.setAttribute('data-drupal-messages', '');
            return wrapper.innerHTML === '' ? Drupal.Message.messageInternalWrapper(wrapper) : wrapper.firstElementChild;
        }
        static getMessageTypeLabels() {
            return {
                status: Drupal.t('Status message'),
                error: Drupal.t('Error message'),
                warning: Drupal.t('Warning message')
            };
        }
        add(message, options = {}) {
            if (!options.hasOwnProperty('type')) options.type = 'status';
            if (typeof message !== 'string') throw new Error('Message must be a string.');
            Drupal.Message.announce(message, options);
            options.id = options.id ? String(options.id) : `${options.type}-${Math.random().toFixed(15).replace('0.','')}`;
            if (!Drupal.Message.getMessageTypeLabels().hasOwnProperty(options.type)) {
                const {
                    type
                } = options;
                throw new Error(`The message type, ${type}, is not present in Drupal.Message.getMessageTypeLabels().`);
            }
            this.messageWrapper.appendChild(Drupal.theme('message', {
                text: message
            }, options));
            return options.id;
        }
        select(id) {
            return this.messageWrapper.querySelector(`[data-drupal-message-id^="${id}"]`);
        }
        remove(id) {
            return this.messageWrapper.removeChild(this.select(id));
        }
        clear() {
            this.messageWrapper.querySelectorAll('[data-drupal-message-id]').forEach((message) => {
                this.messageWrapper.removeChild(message);
            });
        }
        static announce(message, options) {
            if (!options.priority && (options.type === 'warning' || options.type === 'error')) options.priority = 'assertive';
            if (options.announce !== '') Drupal.announce(options.announce || message, options.priority);
        }
        static messageInternalWrapper(messageWrapper) {
            const innerWrapper = document.createElement('div');
            innerWrapper.setAttribute('class', 'messages__wrapper');
            messageWrapper.insertAdjacentElement('afterbegin', innerWrapper);
            return innerWrapper;
        }
    };
    Drupal.theme.message = ({
        text
    }, {
        type,
        id
    }) => {
        const messagesTypes = Drupal.Message.getMessageTypeLabels();
        const messageWrapper = document.createElement('div');
        messageWrapper.setAttribute('class', `messages messages--${type}`);
        messageWrapper.setAttribute('role', type === 'error' || type === 'warning' ? 'alert' : 'status');
        messageWrapper.setAttribute('data-drupal-message-id', id);
        messageWrapper.setAttribute('data-drupal-message-type', type);
        messageWrapper.setAttribute('aria-label', messagesTypes[type]);
        messageWrapper.innerHTML = `${text}`;
        return messageWrapper;
    };
})(Drupal);;
((Drupal) => {
    Drupal.theme.message = function(message) {
        var messageWrapper = message.querySelector('[data-drupal-selector="messages"]');
        var type = message.getAttribute('data-drupal-message-type');
        var id = message.getAttribute('data-drupal-message-id');
        var existingToastContainer = document.querySelector('.toast-container[data-drupal-messages]');
        var existingAlertContainer = document.querySelector('.alert-wrapper[data-drupal-messages]');
        var messageText = '';
        if (messageWrapper) messageText = messageWrapper.textContent || messageWrapper.innerText;
        if (existingToastContainer) return createToast(type, messageText, id);
        return createAlert(type, messageText, id);
    };

    function createAlert(type, messageText, id) {
        var alertClass = 'alert-info';
        var icon = '';
        switch (type) {
            case 'status':
                alertClass = 'alert-success';
                icon = '<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:"><use xlink:href="#check-circle-fill"/></svg>';
                break;
            case 'warning':
                alertClass = 'alert-warning';
                icon = '<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:"><use xlink:href="#exclamation-triangle-fill"/></svg>';
                break;
            case 'error':
                alertClass = 'alert-danger';
                icon = '<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg>';
                break;
            default:
                alertClass = 'alert-info';
                icon = '<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Info:"><use xlink:href="#info-fill"/></svg>';
        }
        var alertElement = document.createElement('div');
        alertElement.className = 'alert ' + alertClass + ' alert-dismissible fade show d-flex align-items-center';
        alertElement.setAttribute('role', 'alert');
        if (id) alertElement.setAttribute('data-drupal-message-id', id);
        if (type) alertElement.setAttribute('data-drupal-message-type', type);
        alertElement.innerHTML = icon + '<div>' + messageText + '</div>' + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
        return alertElement;
    }

    function createToast(type, messageText, id) {
        var icon = '';
        var heading = '';
        var autohide = 'true';
        var role = 'status';
        var contextualClass = '';
        switch (type) {
            case 'status':
                icon = '<svg class="bi flex-shrink-0 me-2" width="20" height="20" role="img" aria-label="Success:"><use xlink:href="#check-circle-fill"/></svg>';
                heading = 'Status message';
                autohide = 'true';
                role = 'status';
                contextualClass = 'text-bg-success';
                break;
            case 'warning':
                icon = '<svg class="bi flex-shrink-0 me-2" width="20" height="20" role="img" aria-label="Warning:"><use xlink:href="#exclamation-triangle-fill"/></svg>';
                heading = 'Warning message';
                autohide = 'false';
                role = 'alert';
                contextualClass = 'text-bg-warning';
                break;
            case 'error':
                icon = '<svg class="bi flex-shrink-0 me-2" width="20" height="20" role="img" aria-label="Error:"><use xlink:href="#exclamation-triangle-fill"/></svg>';
                heading = 'Error message';
                autohide = 'false';
                role = 'alert';
                contextualClass = 'text-bg-danger';
                break;
            default:
                icon = '<svg class="bi flex-shrink-0 me-2" width="20" height="20" role="img" aria-label="Info:"><use xlink:href="#info-fill"/></svg>';
                heading = 'Informative message';
                autohide = 'true';
                role = 'status';
                contextualClass = 'text-bg-info';
        }
        var toastElement = document.createElement('div');
        toastElement.className = 'toast fade';
        toastElement.setAttribute('role', role);
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');
        toastElement.setAttribute('data-bs-autohide', autohide);
        if (id) toastElement.setAttribute('data-drupal-message-id', id);
        if (type) toastElement.setAttribute('data-drupal-message-type', type);
        toastElement.innerHTML = '<div class="toast-header">' + icon + '<strong class="me-auto">' + heading + '</strong>' + '<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>' + '</div>' + '<div class="toast-body">' + messageText + '</div>';
        setTimeout(function() {
            if (window.bootstrap && window.bootstrap.Toast) {
                var bsToast = new window.bootstrap.Toast(toastElement);
                bsToast.show();
            }
        }, 100);
        return toastElement;
    }
})(Drupal);;
(function($, window, Drupal, drupalSettings, loadjs, {
    isFocusable,
    tabbable
}) {
    Drupal.behaviors.AJAX = {
        attach(context, settings) {
            function loadAjaxBehavior(base) {
                const elementSettings = settings.ajax[base];
                if (typeof elementSettings.selector === 'undefined') elementSettings.selector = `#${base}`;
                once('drupal-ajax', $(elementSettings.selector)).forEach((el) => {
                    elementSettings.element = el;
                    elementSettings.base = base;
                    Drupal.ajax(elementSettings);
                });
            }
            Object.keys(settings.ajax || {}).forEach(loadAjaxBehavior);
            Drupal.ajax.bindAjaxLinks(document.body);
            once('ajax', '.use-ajax-submit').forEach((el) => {
                const elementSettings = {};
                elementSettings.url = $(el.form).attr('action');
                elementSettings.setClick = true;
                elementSettings.event = 'click';
                elementSettings.progress = {
                    type: 'throbber'
                };
                elementSettings.base = el.id;
                elementSettings.element = el;
                Drupal.ajax(elementSettings);
            });
        },
        detach(context, settings, trigger) {
            if (trigger === 'unload') Drupal.ajax.expired().forEach((instance) => {
                Drupal.ajax.instances[instance.instanceIndex] = null;
            });
        }
    };
    Drupal.AjaxError = function(xmlhttp, uri, customMessage) {
        let statusCode;
        let statusText;
        let responseText;
        if (xmlhttp.status) statusCode = `\n${Drupal.t('An AJAX HTTP error occurred.')}\n${Drupal.t('HTTP Result Code: !status',{'!status':xmlhttp.status})}`;
        else statusCode = `\n${Drupal.t('An AJAX HTTP request terminated abnormally.')}`;
        statusCode += `\n${Drupal.t('Debugging information follows.')}`;
        const pathText = `\n${Drupal.t('Path: !uri',{'!uri':uri})}`;
        statusText = '';
        try {
            statusText = `\n${Drupal.t('StatusText: !statusText',{'!statusText':xmlhttp.statusText.trim()})}`;
        } catch (e) {}
        responseText = '';
        try {
            responseText = `\n${Drupal.t('ResponseText: !responseText',{'!responseText':xmlhttp.responseText.trim()})}`;
        } catch (e) {}
        responseText = responseText.replace(/<("[^"]*"|'[^']*'|[^'">])*>/gi, '');
        responseText = responseText.replace(/[\n]+\s+/g, '\n');
        const readyStateText = xmlhttp.status === 0 ? `\n${Drupal.t('ReadyState: !readyState',{'!readyState':xmlhttp.readyState})}` : '';
        customMessage = customMessage ? `\n${Drupal.t('CustomMessage: !customMessage',{'!customMessage':customMessage})}` : '';
        this.message = statusCode + pathText + statusText + customMessage + responseText + readyStateText;
        this.name = 'AjaxError';
        if (!Drupal.AjaxError.messages) Drupal.AjaxError.messages = new Drupal.Message();
        Drupal.AjaxError.messages.add(Drupal.t("Oops, something went wrong. Check your browser's developer console for more details."), {
            type: 'error'
        });
    };
    Drupal.AjaxError.prototype = new Error();
    Drupal.AjaxError.prototype.constructor = Drupal.AjaxError;
    Drupal.ajax = function(settings) {
        if (arguments.length !== 1) throw new Error('Drupal.ajax() function must be called with one configuration object only');
        const base = settings.base || false;
        const element = settings.element || false;
        delete settings.base;
        delete settings.element;
        if (!settings.progress && !element) settings.progress = false;
        const ajax = new Drupal.Ajax(base, element, settings);
        ajax.instanceIndex = Drupal.ajax.instances.length;
        Drupal.ajax.instances.push(ajax);
        return ajax;
    };
    Drupal.ajax.instances = [];
    Drupal.ajax.expired = function() {
        return Drupal.ajax.instances.filter((instance) => instance && instance.element !== false && !document.body.contains(instance.element));
    };
    Drupal.ajax.bindAjaxLinks = (element) => {
        once('ajax', '.use-ajax', element).forEach((ajaxLink) => {
            const $linkElement = $(ajaxLink);
            const elementSettings = {
                progress: {
                    type: 'throbber'
                },
                dialogType: $linkElement.data('dialog-type'),
                dialog: $linkElement.data('dialog-options'),
                dialogRenderer: $linkElement.data('dialog-renderer'),
                base: $linkElement.attr('id'),
                element: ajaxLink
            };
            const href = $linkElement.attr('href');
            if (href) {
                elementSettings.url = href;
                elementSettings.event = 'click';
            }
            const httpMethod = $linkElement.data('ajax-http-method');
            if (httpMethod) elementSettings.httpMethod = httpMethod;
            Drupal.ajax(elementSettings);
        });
    };
    Drupal.Ajax = function(base, element, elementSettings) {
        const defaults = {
            httpMethod: 'POST',
            event: element ? 'mousedown' : null,
            keypress: true,
            selector: base ? `#${base}` : null,
            effect: 'none',
            speed: 'none',
            method: 'replaceWith',
            progress: {
                type: 'throbber',
                message: Drupal.t('Processing...')
            },
            submit: {
                js: true
            }
        };
        $.extend(this, defaults, elementSettings);
        this.commands = new Drupal.AjaxCommands();
        this.instanceIndex = false;
        if (this.wrapper) this.wrapper = `#${this.wrapper}`;
        this.element = element;
        this.preCommandsFocusedElementSelector = null;
        this.elementSettings = elementSettings;
        if (this.element ? .form) this.$form = $(this.element.form);
        if (!this.url) {
            const $element = $(this.element);
            if (this.element.tagName === 'A') this.url = $element.attr('href');
            else {
                if (this.element && element.form) this.url = this.$form.attr('action');
            }
        }
        const originalUrl = this.url;
        this.url = this.url.replace(/\/nojs(\/|$|\?|#)/, '/ajax$1');
        if (drupalSettings.ajaxTrustedUrl[originalUrl]) drupalSettings.ajaxTrustedUrl[this.url] = true;
        const ajax = this;
        ajax.options = {
            url: ajax.url,
            data: ajax.submit,
            isInProgress() {
                return ajax.ajaxing;
            },
            beforeSerialize(elementSettings, options) {
                return ajax.beforeSerialize(elementSettings, options);
            },
            beforeSubmit(formValues, elementSettings, options) {
                ajax.ajaxing = true;
                ajax.preCommandsFocusedElementSelector = null;
                return ajax.beforeSubmit(formValues, elementSettings, options);
            },
            beforeSend(xmlhttprequest, options) {
                ajax.ajaxing = true;
                return ajax.beforeSend(xmlhttprequest, options);
            },
            success(response, status, xmlhttprequest) {
                ajax.preCommandsFocusedElementSelector = document.activeElement.getAttribute('data-drupal-selector');
                if (typeof response === 'string') response = JSON.parse(response);
                if (response !== null && !drupalSettings.ajaxTrustedUrl[ajax.url])
                    if (xmlhttprequest.getResponseHeader('X-Drupal-Ajax-Token') !== '1') {
                        const customMessage = Drupal.t('The response failed verification so will not be processed.');
                        return ajax.error(xmlhttprequest, ajax.url, customMessage);
                    }
                return (Promise.resolve(ajax.success(response, status)).then(() => {
                    ajax.ajaxing = false;
                    $(document).trigger('ajaxSuccess', [xmlhttprequest, this]);
                    $(document).trigger('ajaxComplete', [xmlhttprequest, this]);
                    if (--$.active === 0) $(document).trigger('ajaxStop');
                }));
            },
            error(xmlhttprequest, status, error) {
                ajax.ajaxing = false;
            },
            complete(xmlhttprequest, status) {
                if (status === 'error' || status === 'parsererror') return ajax.error(xmlhttprequest, ajax.url);
            },
            dataType: 'json',
            jsonp: false,
            method: ajax.httpMethod
        };
        if (elementSettings.dialog) ajax.options.data.dialogOptions = elementSettings.dialog;
        if (!ajax.options.url.includes('?')) ajax.options.url += '?';
        else ajax.options.url += '&';
        let wrapper = `drupal_${elementSettings.dialogType||'ajax'}`;
        if (elementSettings.dialogRenderer) wrapper += `.${elementSettings.dialogRenderer}`;
        ajax.options.url += `${Drupal.ajax.WRAPPER_FORMAT}=${wrapper}`;
        $(ajax.element).on(elementSettings.event, function(event) {
            if (!drupalSettings.ajaxTrustedUrl[ajax.url] && !Drupal.url.isLocal(ajax.url)) throw new Error(Drupal.t('The callback URL is not local and not trusted: !url', {
                '!url': ajax.url
            }));
            return ajax.eventResponse(this, event);
        });
        if (elementSettings.keypress) $(ajax.element).on('keypress', function(event) {
            return ajax.keypressResponse(this, event);
        });
        if (elementSettings.prevent) $(ajax.element).on(elementSettings.prevent, false);
    };
    Drupal.ajax.WRAPPER_FORMAT = '_wrapper_format';
    Drupal.Ajax.AJAX_REQUEST_PARAMETER = '_drupal_ajax';
    Drupal.Ajax.prototype.execute = function() {
        if (this.ajaxing) return;
        try {
            this.beforeSerialize(this.element, this.options);
            return $.ajax(this.options);
        } catch (e) {
            this.ajaxing = false;
            window.alert(`An error occurred while attempting to process ${this.options.url}: ${e.message}`);
            return $.Deferred().reject();
        }
    };
    Drupal.Ajax.prototype.keypressResponse = function(element, event) {
        const ajax = this;
        if (event.which === 13 || (event.which === 32 && element.type !== 'text' && element.type !== 'textarea' && element.type !== 'tel' && element.type !== 'number')) {
            event.preventDefault();
            event.stopPropagation();
            $(element).trigger(ajax.elementSettings.event);
        }
    };
    Drupal.Ajax.prototype.eventResponse = function(element, event) {
        event.preventDefault();
        event.stopPropagation();
        const ajax = this;
        if (ajax.ajaxing) return;
        try {
            if (ajax.$form) {
                if (ajax.setClick) element.form.clk = element;
                ajax.$form.ajaxSubmit(ajax.options);
            } else {
                ajax.beforeSerialize(ajax.element, ajax.options);
                $.ajax(ajax.options);
            }
        } catch (e) {
            ajax.ajaxing = false;
            window.alert(`An error occurred while attempting to process ${ajax.options.url}: ${e.message}`);
        }
    };
    Drupal.Ajax.prototype.beforeSerialize = function(element, options) {
        if (this.$form && document.body.contains(this.$form.get(0))) {
            const settings = this.settings || drupalSettings;
            Drupal.detachBehaviors(this.$form.get(0), settings, 'serialize');
        }
        options.data[Drupal.Ajax.AJAX_REQUEST_PARAMETER] = 1;
        const pageState = drupalSettings.ajaxPageState;
        options.data['ajax_page_state[theme]'] = pageState.theme;
        options.data['ajax_page_state[theme_token]'] = pageState.theme_token;
        options.data['ajax_page_state[libraries]'] = pageState.libraries;
    };
    Drupal.Ajax.prototype.beforeSubmit = function(formValues, element, options) {};
    Drupal.Ajax.prototype.beforeSend = function(xmlhttprequest, options) {
        if (this.$form) {
            options.extraData = options.extraData || {};
            options.extraData.ajax_iframe_upload = '1';
            const v = $.fieldValue(this.element);
            if (v !== null) options.extraData[this.element.name] = v;
        }
        $(this.element).prop('disabled', true);
        if (!this.progress || !this.progress.type) return;
        const progressIndicatorMethod = `setProgressIndicator${this.progress.type.slice(0,1).toUpperCase()}${this.progress.type.slice(1).toLowerCase()}`;
        if (progressIndicatorMethod in this && typeof this[progressIndicatorMethod] === 'function') this[progressIndicatorMethod].call(this);
    };
    Drupal.theme.ajaxProgressThrobber = (message) => {
        const messageMarkup = typeof message === 'string' ? Drupal.theme('ajaxProgressMessage', message) : '';
        const throbber = '<div class="throbber">&nbsp;</div>';
        return `<div class="ajax-progress ajax-progress-throbber">${throbber}${messageMarkup}</div>`;
    };
    Drupal.theme.ajaxProgressIndicatorFullscreen = () => '<div class="ajax-progress ajax-progress-fullscreen">&nbsp;</div>';
    Drupal.theme.ajaxProgressMessage = (message) => `<div class="message">${message}</div>`;
    Drupal.theme.ajaxProgressBar = ($element) => $('<div class="ajax-progress ajax-progress-bar"></div>').append($element);
    Drupal.Ajax.prototype.setProgressIndicatorBar = function() {
        const progressBar = new Drupal.ProgressBar(`ajax-progress-${this.element.id}`, $.noop, this.progress.method, $.noop);
        if (this.progress.message) progressBar.setProgress(-1, this.progress.message);
        if (this.progress.url) progressBar.startMonitoring(this.progress.url, this.progress.interval || 1500);
        this.progress.element = $(Drupal.theme('ajaxProgressBar', progressBar.element));
        this.progress.object = progressBar;
        $(this.element).after(this.progress.element);
    };
    Drupal.Ajax.prototype.setProgressIndicatorThrobber = function() {
        this.progress.element = $(Drupal.theme('ajaxProgressThrobber', this.progress.message));
        if ($(this.element).closest('[data-drupal-ajax-container]').length) $(this.element).closest('[data-drupal-ajax-container]').after(this.progress.element);
        else $(this.element).after(this.progress.element);
    };
    Drupal.Ajax.prototype.setProgressIndicatorFullscreen = function() {
        this.progress.element = $(Drupal.theme('ajaxProgressIndicatorFullscreen'));
        $('body').append(this.progress.element);
    };
    Drupal.Ajax.prototype.commandExecutionQueue = function(response, status) {
        const ajaxCommands = this.commands;
        return Object.keys(response || {}).reduce((executionQueue, key) => executionQueue.then(() => {
            const {
                command
            } = response[key];
            if (command && ajaxCommands[command]) return ajaxCommands[command](this, response[key], status);
        }), Promise.resolve());
    };
    Drupal.Ajax.prototype.success = function(response, status) {
        if (this.progress.element) $(this.progress.element).remove();
        if (this.progress.object) this.progress.object.stopMonitoring();
        $(this.element).prop('disabled', false);
        const elementParents = $(this.element).parents('[data-drupal-selector]').addBack().toArray();
        const focusChanged = Object.keys(response || {}).some((key) => {
            const {
                command,
                method
            } = response[key];
            return (command === 'focusFirst' || command === 'openDialog' || (command === 'invoke' && method === 'focus'));
        });
        return (this.commandExecutionQueue(response, status).then(() => {
            if (!focusChanged) {
                let target = false;
                if (this.element) {
                    if ($(this.element).data('refocus-blur') && this.preCommandsFocusedElementSelector) target = document.querySelector(`[data-drupal-selector="${this.preCommandsFocusedElementSelector}"]`);
                    if (!target && !$(this.element).data('disable-refocus')) {
                        for (let n = elementParents.length - 1; !target && n >= 0; n--) target = document.querySelector(`[data-drupal-selector="${elementParents[n].getAttribute('data-drupal-selector')}"]`);
                    }
                }
                if (target) $(target).trigger('focus');
            }
            if (this.$form && document.body.contains(this.$form.get(0))) {
                const settings = this.settings || drupalSettings;
                Drupal.attachBehaviors(this.$form.get(0), settings);
            }
            this.settings = null;
        }).catch((error) => console.error(Drupal.t('An error occurred during the execution of the Ajax response: !error', {
            '!error': error
        }))));
    };
    Drupal.Ajax.prototype.getEffect = function(response) {
        const type = response.effect || this.effect;
        const speed = response.speed || this.speed;
        const effect = {};
        if (type === 'none') {
            effect.showEffect = 'show';
            effect.hideEffect = 'hide';
            effect.showSpeed = '';
        } else if (type === 'fade') {
            effect.showEffect = 'fadeIn';
            effect.hideEffect = 'fadeOut';
            effect.showSpeed = speed;
        } else {
            effect.showEffect = `${type}Toggle`;
            effect.hideEffect = `${type}Toggle`;
            effect.showSpeed = speed;
        }
        return effect;
    };
    Drupal.Ajax.prototype.error = function(xmlhttprequest, uri, customMessage) {
        if (this.progress.element) $(this.progress.element).remove();
        if (this.progress.object) this.progress.object.stopMonitoring();
        $(this.wrapper).show();
        $(this.element).prop('disabled', false);
        if (this.$form && document.body.contains(this.$form.get(0))) {
            const settings = this.settings || drupalSettings;
            Drupal.attachBehaviors(this.$form.get(0), settings);
        }
        throw new Drupal.AjaxError(xmlhttprequest, uri, customMessage);
    };
    Drupal.theme.ajaxWrapperNewContent = ($newContent, ajax, response) => (response.effect || ajax.effect) !== 'none' && $newContent.filter((i) => !(($newContent[i].nodeName === '#comment' || ($newContent[i].nodeName === '#text' && /^(\s|\n|\r)*$/.test($newContent[i].textContent))))).length > 1 ? Drupal.theme('ajaxWrapperMultipleRootElements', $newContent) : $newContent;
    Drupal.theme.ajaxWrapperMultipleRootElements = ($elements) => $('<div></div>').append($elements);
    Drupal.AjaxCommands = function() {};
    Drupal.AjaxCommands.prototype = {
        insert(ajax, response) {
            const $wrapper = response.selector ? $(response.selector) : $(ajax.wrapper);
            const method = response.method || ajax.method;
            const effect = ajax.getEffect(response);
            const settings = response.settings || ajax.settings || drupalSettings;
            const parseHTML = (htmlString) => {
                const fragment = document.createDocumentFragment();
                const template = fragment.appendChild(document.createElement('template'));
                template.innerHTML = htmlString;
                return template.content.childNodes;
            };
            let $newContent = $(parseHTML(response.data));
            $newContent = Drupal.theme('ajaxWrapperNewContent', $newContent, ajax, response);
            switch (method) {
                case 'html':
                case 'replaceWith':
                case 'replaceAll':
                case 'empty':
                case 'remove':
                    Drupal.detachBehaviors($wrapper.get(0), settings);
                    break;
                default:
                    break;
            }
            $wrapper[method]($newContent);
            if (effect.showEffect !== 'show') $newContent.hide();
            const $ajaxNewContent = $newContent.find('.ajax-new-content');
            if ($ajaxNewContent.length) {
                $ajaxNewContent.hide();
                $newContent.show();
                $ajaxNewContent[effect.showEffect](effect.showSpeed);
            } else {
                if (effect.showEffect !== 'show') $newContent[effect.showEffect](effect.showSpeed);
            }
            $newContent.each((index, element) => {
                if (element.nodeType === Node.ELEMENT_NODE && document.documentElement.contains(element)) Drupal.attachBehaviors(element, settings);
            });
        },
        remove(ajax, response, status) {
            const settings = response.settings || ajax.settings || drupalSettings;
            $(response.selector).each(function() {
                Drupal.detachBehaviors(this, settings);
            }).remove();
        },
        changed(ajax, response, status) {
            const $element = $(response.selector);
            if (!$element.hasClass('ajax-changed')) {
                $element.addClass('ajax-changed');
                if (response.asterisk) $element.find(response.asterisk).append(` <abbr class="ajax-changed" title="${Drupal.t('Changed')}">*</abbr> `);
            }
        },
        alert(ajax, response, status) {
            window.alert(response.text);
        },
        announce(ajax, response) {
            if (response.priority) Drupal.announce(response.text, response.priority);
            else Drupal.announce(response.text);
        },
        redirect(ajax, response, status) {
            window.location = response.url;
        },
        css(ajax, response, status) {
            $(response.selector).css(response.argument);
        },
        settings(ajax, response, status) {
            const ajaxSettings = drupalSettings.ajax;
            if (ajaxSettings) Drupal.ajax.expired().forEach((instance) => {
                if (instance.selector) {
                    const selector = instance.selector.replace('#', '');
                    if (selector in ajaxSettings) delete ajaxSettings[selector];
                }
            });
            if (response.merge) $.extend(true, drupalSettings, response.settings);
            else ajax.settings = response.settings;
        },
        data(ajax, response, status) {
            $(response.selector).data(response.name, response.value);
        },
        focusFirst(ajax, response, status) {
            let focusChanged = false;
            const container = document.querySelector(response.selector);
            if (container) {
                const tabbableElements = tabbable(container);
                if (tabbableElements.length) {
                    tabbableElements[0].focus();
                    focusChanged = true;
                } else {
                    if (isFocusable(container)) {
                        container.focus();
                        focusChanged = true;
                    }
                }
            }
            if (ajax.hasOwnProperty('element') && !focusChanged) ajax.element.focus();
        },
        invoke(ajax, response, status) {
            const $element = $(response.selector);
            $element[response.method](...response.args);
        },
        restripe(ajax, response, status) {
            $(response.selector).find('> tbody > tr:visible, > tr:visible').removeClass('odd even').filter(':even').addClass('odd').end().filter(':odd').addClass('even');
        },
        update_build_id(ajax, response, status) {
            document.querySelectorAll(`input[name="form_build_id"][value="${response.old}"]`).forEach((item) => {
                item.value = response.new;
            });
        },
        add_css(ajax, response, status) {
            const allUniqueBundleIds = response.data.map(function(style) {
                const uniqueBundleId = style.href;
                if (!loadjs.isDefined(uniqueBundleId)) loadjs(`css!${style.href}`, uniqueBundleId, {
                    before(path, styleEl) {
                        Object.keys(style).forEach((attributeKey) => {
                            styleEl.setAttribute(attributeKey, style[attributeKey]);
                        });
                    }
                });
                return uniqueBundleId;
            });
            return new Promise((resolve, reject) => {
                loadjs.ready(allUniqueBundleIds, {
                    success() {
                        resolve();
                    },
                    error(depsNotFound) {
                        const message = Drupal.t(`The following files could not be loaded: @dependencies`, {
                            '@dependencies': depsNotFound.join(', ')
                        });
                        reject(message);
                    }
                });
            });
        },
        message(ajax, response) {
            const messages = new Drupal.Message(document.querySelector(response.messageWrapperQuerySelector));
            if (response.clearPrevious) messages.clear();
            messages.add(response.message, response.messageOptions);
        },
        add_js(ajax, response, status) {
            const parentEl = document.querySelector(response.selector || 'body');
            const settings = ajax.settings || drupalSettings;
            const allUniqueBundleIds = response.data.map((script) => {
                const uniqueBundleId = script.src;
                if (!loadjs.isDefined(uniqueBundleId)) loadjs(script.src, uniqueBundleId, {
                    async: false,
                    before(path, scriptEl) {
                        Object.keys(script).forEach((attributeKey) => {
                            scriptEl.setAttribute(attributeKey, script[attributeKey]);
                        });
                        parentEl.appendChild(scriptEl);
                        return false;
                    }
                });
                return uniqueBundleId;
            });
            return new Promise((resolve, reject) => {
                loadjs.ready(allUniqueBundleIds, {
                    success() {
                        Drupal.attachBehaviors(parentEl, settings);
                        resolve();
                    },
                    error(depsNotFound) {
                        const message = Drupal.t(`The following files could not be loaded: @dependencies`, {
                            '@dependencies': depsNotFound.join(', ')
                        });
                        reject(message);
                    }
                });
            });
        },
        scrollTop(ajax, response) {
            const offset = $(response.selector).offset();
            let scrollTarget = response.selector;
            while ($(scrollTarget).scrollTop() === 0 && $(scrollTarget).parent()) scrollTarget = $(scrollTarget).parent();
            if (offset.top - 10 < $(scrollTarget).scrollTop()) scrollTarget.get(0).scrollTo({
                top: offset.top - 10,
                behavior: 'smooth'
            });
        }
    };
    const stopEvent = (xhr, settings) => {
        return (xhr.getResponseHeader('X-Drupal-Ajax-Token') === '1' && typeof settings.isInProgress === 'function' && settings.isInProgress());
    };
    $.extend(true, $.event.special, {
        ajaxSuccess: {
            trigger(event, xhr, settings) {
                if (stopEvent(xhr, settings)) return false;
            }
        },
        ajaxComplete: {
            trigger(event, xhr, settings) {
                if (stopEvent(xhr, settings)) {
                    $.active++;
                    return false;
                }
            }
        }
    });
})(jQuery, window, Drupal, drupalSettings, loadjs, window.tabbable);;
((Drupal) => {
    const Z_INDEX = 1261;
    const TOP_POSITION = '48.5%';
    const LEFT_POSITION = '49%';
    const SPINNER_SIZE = '3rem';
    const spinnerPositionClass = 'js-az-spinner-position';
    const style = document.createElement('style');
    style.textContent = `
    .${spinnerPositionClass} {
      position: fixed;
      z-index: ${Z_INDEX};
      top: ${TOP_POSITION};
      left: ${LEFT_POSITION};
    }
  `;
    document.head.appendChild(style);
    Drupal.theme.ajaxProgressIndicatorFullscreen = () => `
    <div class="${spinnerPositionClass}">
      <div class="spinner-border text-info" style="width: ${SPINNER_SIZE}; height: ${SPINNER_SIZE};" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>`;
})(Drupal);;
(function(Drupal) {
    Drupal.AjaxCommands.prototype.gtagEvent = function(ajax, response) {
        gtag('event', response.event_name, response.data);
    };
})(Drupal);;