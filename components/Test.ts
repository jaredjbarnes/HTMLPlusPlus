module components {

    export class Test {

        public setHeader: (name: string) => void;
        public header: HTMLHeadingElement;

        constructor() {
            var self = this;

            self.setHeader = function (name) {
                self.header.innerHTML = name;
            };
        }
    }

} 