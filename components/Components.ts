HTMLElement.prototype.matches = HTMLElement.prototype.msMatchesSelector || HTMLElement.prototype.matches;

Node.prototype.appendChildComponent = Node.prototype.appendChild;
Node.prototype.removeChildComponent = Node.prototype.removeChild;
Node.prototype.insertBeforeComponent = Node.prototype.insertBefore;
Node.prototype.replaceChildComponent = Node.prototype.replaceChild;
Node.prototype.cloneComponent = Node.prototype.cloneNode;
Node.prototype.querySelectorComponent = Element.prototype.querySelector;
Node.prototype.querySelectorAllComponents = Element.prototype.querySelectorAll;

module components {
    export function walkTheElement(element, action) {
        var children = element.childNodes;
        var childrenValues = [];

        for (var x = 0; x < children.length; x++) {
            childrenValues.push(walkTheElement(children.item(x), action));
        }
        return action(element, childrenValues);
    }

    export function convertNodeListToArray(nodeList) {
        var array = [];

        for (var x = 0; x < nodeList.length; x++) {
            array.push(nodeList.item(x));
        }

        return array;
    }

    export function firstComponent() {
        return this._selectorContainers[0].firstElement;
    }

    export function lastComponent() {
        return this._selectorContainers[this.selectorContainers.length - 1].lastElement;
    }

    export function childComponents() {
        var items = this._selectorContainers.reduce(function (items, container) {
            var containerChildren = container.children;
            for (var x = 0; x < containerChildren.length; x++) {
                items.push(containerChildren.item(x));
            }
            return items;
        }, []);

        return {
            item: function (index) {
                return items[index];
            }, length: items.length
        };
    }

    export function childNodes() {
        return this.children;
    }

    export function previousSiblingComponent() {
        var previousSibling = null;
        var parentNode = this.parentNode;
        var element = this;

        if (parentNode) {
            var children = components.convertNodeListToArray(parentNode.children);
            children.some(function (child, index) {
                if (child === element) {
                    previousSibling = children[index - 1] || null;
                    return true;
                } else {
                    return false;
                }
            });

        }

        return previousSibling;
    }
    export function nextSiblingComponent() {
        var nextSibling = null;
        var parentNode = this.parentNode;
        var element = this;

        if (parentNode) {
            var children = components.convertNodeListToArray(parentNode.children);
            children.some(function (child, index) {
                if (child === element) {
                    nextSibling = children[index + 1] || null;
                    return true;
                } else {
                    return false;
                }
            });

        }

        return nextSibling;
    }

    export function appendChildComponent(newChild: Node) {
        var self = this;
        var selectorContainers = this._selectorContainers;
        var didAppend = selectorContainers.some(function (container) {
            var selector = container.getAttribute("select");
            if (newChild.matches(selector)) {
                container.appendChildComponent(newChild);
                return true;
            } else {
                return false;
            }
        });

        if (!didAppend) {
            throw new Error("Failed to execute 'appendComponent'.");
        }

        return newChild;
    }

    export function removeChildComponent(oldChild: Node) {
        var self = this;
        var selectorContainers = this._selectorContainers;
        var didRemove = selectorContainers.some(function (container) {
            try {
                container.removeChildComponent(oldChild);
                return true;
            } catch (e) {
                return false;
            }
        });

        if (!didRemove) {
            throw new Error("Failed to execute 'removeChild'.");
        }

        return oldChild;
    }

    export function insertBeforeComponent(newChild: Node, referenceChild: Node) {
        var self = this;
        var selectorContainers = this._selectorContainers;
        var didInsert = selectorContainers.some(function (container) {
            var selector = container.getAttribute("select");

            if (!newChild.matches(selector)) {
                return false;
            }

            try {
                container.insertBeforeComponent(newChild, referenceChild);
                return true;
            } catch (e) {
                return false;
            }
        });

        if (!didInsert) {
            throw new Error("Failed to execute 'insertBefore'.");
        }

        return newChild;
    }

    export function replaceChildComponent(newChild: Node, referenceChild: Node) {
        var self = this;
        var selectorContainers = this._selectorContainers;
        var didInsert = selectorContainers.some(function (container) {
            var selector = container.getAttribute("select");

            if (!newChild.matches(selector)) {
                return false;
            }

            try {
                container.replaceChildComponent(newChild, referenceChild);
                return true;
            } catch (e) {
                return false;
            }
        });

        if (!didInsert) {
            throw new Error("Failed to execute 'replaceChild'.");
        }
        return newChild;
    }

    export function cloneComponent(deep: boolean) {
        throw new Error("Just about to implement this. ;)");
    }

    export function querySelectorComponent(selector: string) {
        var element = null;

        this._selectorContainers.some(function (container) {
            element = container.querySelector(selector);
            if (element) {
                return true;
            } else {
                return false;
            }
        });

        return element;
    }

    export function querySelectorAllComponents(selector: string) {
        var items = this._selectorContainers.reduce(function (items, container) {
            var containerChildren = container.querySelectorAll(selector);
            for (var x = 0; x < containerChildren.length; x++) {
                items.push(containerChildren.item(x));
            }
            return items;
        }, []);

        return { item: function (index) { return items[index]; }, length: items.length };
    }

    export function dispose() {
        var element = this;

        Object.keys(element).forEach(function (key) {
            try {
                element[key] = null;
            } catch (e) {

            }
        });
    }

    export function css(styles: { [key: string]: string }) {
        var element = <any>this;

        Object.keys(styles).forEach(function (key) {
            element._css[key] = styles[key];
        });

        var cssText = Object.keys(element._css).reduce(function (cssText, styleName) {
            return cssText += styleName + ":" + element._css[styleName] + ";";
        }, "");

        element.style.cssText = cssText;
    }

    export class Components {

        private _styles: string = "";
        private _document: Document;
        private _createElement: (name: string) => HTMLElement;
        private _head: HTMLHeadElement;
        private _originalElementKeys: string[];

        public _components: { [key: string]: HTMLElement } = {};
        public _domParser: DOMParser = new DOMParser();

        constructor(document: Document) {
            var self = this;

            self._document = document;
            self._head = <HTMLHeadElement>document.querySelector("head");

            if (!self._head) {
                throw new Error("Components cannot run without a head element.");
            }

            if (!self._document) {
                throw new Error("Components cannot run without a document.");
            }

            var oldCreateElement = self._createElement = document.createElement;

            // We need to override the default implementation of this function, so we can 
            // use this as the mechanism to create components too.
            document.createElement = function (name) {
                name = name.toLowerCase();

                var component = self._components[name];
                var element = oldCreateElement.call(document, name);
                var attribute;



                if (typeof component === "undefined") {
                    self._applyElementFunctions(element);
                } else {

                    var attributes = component.attributes;
                    for (var y = 0; y < attributes.length; y++) {
                        attribute = attributes.item(y);
                        element.setAttribute(attribute.name, attribute.value);
                    }

                    var children = component.childNodes;
                    for (var x = 0; x < children.length; x++) {
                        element.appendChild(self._buildComponent(children.item(x)));
                    }

                    self._applyTagsToComponent(element);
                    self._applyComponentFunctions(element);
                    self._applyFunctionsToElement(element);
                    self._applyBehaviorToComponent(element);
                    self._applyAttributesToComponent(element);
                }

                return element;
            };

            document.createComponent = document.createElement;

        }

        private _applyElementFunctions(element) {
            Object.defineProperties(element, {
                previousSiblingComponent: {
                    configurable: true,
                    get: function () {
                        return this.previousSibling;
                    }
                },
                nextSiblingComponent: {
                    configurable: true,
                    get: function () {
                        return this.nextSibling;
                    }
                },
                lastChildComponent: {
                    configurable: true,
                    get: function () {
                        return this.lastChild;
                    }
                },
                firstChildComponent: {
                    configurable: true,
                    get: function () {
                        return this.firstChild;
                    }
                },
                childComponents: {
                    configurable: true,
                    get: function () {
                        return this.children;
                    }
                }
            });
        }

        private _applyAttributesToComponent(element) {
            var attributes = element.attributes;

            for (var x = 0; x < element.attributes.length; x++) {
                var domAttribute = element.attributes.item(x);
                var descriptor = Object.getOwnPropertyDescriptor(element, domAttribute.name);
                if (descriptor) {
                    element[domAttribute.name] = domAttribute.value;
                }
            }
        }

        private _applyComponentFunctions(element) {
            var self = this;
            var selectorContainers = components.convertNodeListToArray(element.querySelectorAll("[select]"));

            element._selectorContainers = selectorContainers;

            if (selectorContainers.length > 0) {

                Object.defineProperties(element, {
                    firstComponent: {
                        configurable: true,
                        get: components.firstComponent
                    },
                    lastComponent: {
                        configurable: true,
                        get: components.lastComponent
                    },
                    childComponents: {
                        configurable: true,
                        get: components.childComponents
                    },
                    previousSiblingComponent: {
                        configurable: true,
                        get: components.previousSiblingComponent
                    },
                    nextSiblingComponent: {
                        configurable: true,
                        get: components.nextSiblingComponent
                    }
                });

                element.appendChildComponent = components.appendChildComponent;
                element.removeChildComponent = components.removeChildComponent;
                element.insertBeforeComponent = components.insertBeforeComponent;
                element.replaceChildComponent = components.replaceChildComponent;
                element.cloneComponent = components.cloneComponent;
                element.querySelectorComponent = components.querySelectorComponent;
                element.querySelectorAllComponents = components.querySelectorAllComponents;

            }

        }

        private _applyFunctionsToElement(element) {
            var self = this;
            element.dispose = components.dispose;
            element._css = {};
            element.css = components.css;
        }

        private _applyBehaviorToComponent(element: HTMLElement) {
            var self = this;

            var behaviorNamespace = element.getAttribute("behavior");
            var behavior = self._getObjectFromNamespace(behaviorNamespace);

            if (typeof behavior === "function") {
                // This is where scope would be injected.
                behavior.apply(element);
            }
        }

        private _applyTagsToComponent = function (element: HTMLElement) {
            var self = this;
            var tags = components.convertNodeListToArray(element.querySelectorAll("[tag]"));

            tags.forEach(function (taggedElement) {
                element[taggedElement.getAttribute("tag")] = taggedElement;
            });
        };

        private _getObjectFromNamespace(namespace: string) {

            if (namespace === "") {
                return window;
            }

            if (typeof namespace === "string") {
                var a = namespace.split('.');
                var length = a.length;
                var obj;

                obj = window[a[0]];

                if (typeof obj === "undefined") {
                    return undefined;
                }

                for (var x = 1; x < length; x++) {
                    if (typeof obj[a[x]] === 'undefined') {
                        return undefined;
                    } else {
                        obj = obj[a[x]];
                    }
                }

                return obj;
            } else {
                return undefined;
            }
        }

        private _removeStyles(htmlElement: HTMLElement): string {
            var self = this;
            var styles = components.convertNodeListToArray(htmlElement.querySelectorAll("style"));

            return styles.map(function (style: HTMLStyleElement) {
                style.parentElement.removeChild(style);
                return style.innerHTML;
            }).join("\n\n");
        }

        private _registerComponent(htmlElement: HTMLElement) {
            if (htmlElement.nodeType === htmlElement.ELEMENT_NODE) {
                var self = this;

                var styles = self._removeStyles(htmlElement);
                self._styles += styles;

                self._components[htmlElement.tagName.toLowerCase()] = htmlElement;
            }
        }

        private _buildComponent(element: HTMLElement) {
            if (element.nodeType === element.ELEMENT_NODE) {
                return components.walkTheElement(element, function (element: HTMLElement, children) {
                    var clone;

                    if (element.nodeType === element.ELEMENT_NODE) {
                        clone = document.createElement(element.tagName);

                        var attributes = element.attributes;

                        for (var x = 0; x < element.attributes.length; x++) {
                            var domAttribute = element.attributes.item(x);
                            clone.setAttribute(domAttribute.name, domAttribute.value);
                        }
                    } else {
                        clone = document.createTextNode(element.textContent);
                    }


                    children.forEach(function (element) {
                        if (!element.tagName || (element.tagName && element.tagName.toLowerCase() !== "script")) {
                            clone.appendChildComponent(element);
                        }
                    });

                    return clone;
                });
            } else if (element.nodeType === element.TEXT_NODE) {
                return document.createTextNode(element.textContent);
            }
        }

        private _registerComponents(markup: string) {
            var self = this;

            var componentsContainer = self._domParser.parseFromString(markup, "text/html");

            var allComponents = components.convertNodeListToArray(componentsContainer.body.childNodes);
            allComponents.forEach(function (element) {
                self._registerComponent(element);
            });

            var documentStyles = <HTMLStyleElement> self._createElement.call(self._document, "style");
            documentStyles.type = "text/css";
            documentStyles.innerHTML = self._styles;

            self._head.appendChild(documentStyles);

        }

        private _getComponentMarkup() {
            var self = this;
            var componentScripts = components.convertNodeListToArray(self._document.querySelectorAll("script[type='text/components']"));

            var markup = componentScripts.reduce(function (markup, script) {
                if (script.src) {

                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", script.src, false);
                    xhr.send(null);
                    return markup += xhr.responseText;

                } else {
                    return markup += script.innerHTML;
                }
            }, "");

            return markup;
        }

        public initialize() {
            var self = this;

            self._document.addEventListener("DOMContentLoaded", function () {
                var markup = self._getComponentMarkup();
                self._registerComponents(markup);
                var newBody = self._buildComponent(document.body);
                document.body.parentNode.replaceChild(newBody, document.body);
            }, false);
        }

    }
}

var _components = new components.Components(document);
_components.initialize();

