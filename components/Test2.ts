module components {

    export class Test2 {

        public test: components.Test;

        constructor() {
            var self = this;
            self.test.setHeader("Hello World");
        }
    }

} 