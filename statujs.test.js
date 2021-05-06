const {getStore} = require('./statujs')

// todo - WIP - add tests utils to check callbacks count + check callback array [expect1: () => {}, expect2: () => {}]
// todo - add computed values to stores and notify relevant subscribers e.g [root, first_name, full_name] when updating first_name
// todo - last task is to create statujs-react to render relevant component when state is changing


describe('statujs', () => {
    describe('subscribe ', () => {
        it('should be called in the right order', () => {
            const store = getStore()
            let current_user_callback_calls = 0
            const expectArr = ['Kobiz', 'Moshe', 'Liron', 'David'].map((expectedValue) => (actualValue) => {
                expect(actualValue).toEqual(expectedValue)
            })
            store.subscribe(['current_user'], (name) => {
                const currentState = store.getState()
                expectArr[current_user_callback_calls](currentState['current_user'])
                current_user_callback_calls++
            })

            store.update('current_user', 'Kobiz')
            store.update('current_user', 'Moshe')
            store.update('current_user', 'Liron')
            store.update('current_user', 'David')

            expect(current_user_callback_calls).toEqual(4)
        });

        it('the store should be updated based on the action triggered the callback', () => {
            const store = getStore()
            let current_user_callback_calls = 0
            const expectArr = ['Moshe undefined'].map((expectedValue) => (actualValue) => {
                expect(actualValue).toEqual(expectedValue)
            })
            store.subscribe(['first_name'], () => {
                const currentState = store.getState()
                const fullName = `${currentState['first_name']} ${currentState['last_name']}`
                expectArr[current_user_callback_calls](fullName)
                current_user_callback_calls++
            })

            store.update('first_name', 'Moshe')
            store.update('last_name', 'Levi')

            expect(current_user_callback_calls).toEqual(1)
        });

        it('subscribe to multiple keys', () => {
            const store = getStore()
            let current_user_callback_calls = 0
            const expectArr = ['Moshe undefined', 'Moshe Levi'].map((expectedValue) => (actualValue) => {
                expect(actualValue).toEqual(expectedValue)
            })
            store.subscribe(['first_name', 'last_name'], () => {
                const currentState = store.getState()
                const fullName = `${currentState['first_name']} ${currentState['last_name']}`
                expectArr[current_user_callback_calls](fullName)
                current_user_callback_calls++
            })

            store.update('first_name', 'Moshe')
            store.update('last_name', 'Levi')

            expect(current_user_callback_calls).toEqual(2)
        });
    });

    describe('batch', () => {
        it('should notify subscribers one time at the end of the batch', () => {
            const store = getStore()
            let current_user_callback_calls = 0
            const expectArr = ['David'].map((expectedValue) => (actualValue) => {
                expect(actualValue).toEqual(expectedValue)
            })
            store.subscribe(['current_user'], () => {
                const currentState = store.getState()
                expectArr[current_user_callback_calls](currentState['current_user'])
                current_user_callback_calls++
            })

            store.startBatch()
            store.update('current_user', 'Kobiz')
            store.update('current_user', 'Moshe')
            store.update('current_user', 'Liron')
            store.update('current_user', 'David')
            store.endBatch()

            expect(current_user_callback_calls).toEqual(1)
        });

        it('the store should be updated based on all the actions ran in batch', () => {
            const store = getStore()
            let current_user_callback_calls = 0
            const expectArr = ['Moshe Levi'].map((expectedValue) => (actualValue) => {
                expect(actualValue).toEqual(expectedValue)
            })
            store.subscribe(['first_name'], () => {
                const currentState = store.getState()
                const fullName = `${currentState['first_name']} ${currentState['last_name']}`
                expectArr[current_user_callback_calls](fullName)
                current_user_callback_calls++
            })

            store.startBatch()
            store.update('first_name', 'Moshe')
            store.update('last_name', 'Levi')
            store.endBatch()

            expect(current_user_callback_calls).toEqual(1)
        });

        it('subscribe to multiple keys should be called one time for keys that changes in the same batch', () => {
            const store = getStore()
            let current_user_callback_calls = 0
            const expectArr = ['Moshe Levi'].map((expectedValue) => (actualValue) => {
                expect(actualValue).toEqual(expectedValue)
            })
            store.subscribe(['first_name', 'last_name'], () => {
                const currentState = store.getState()
                const fullName = `${currentState['first_name']} ${currentState['last_name']}`
                expectArr[current_user_callback_calls](fullName)
                current_user_callback_calls++
            })

            store.startBatch()
            store.update('first_name', 'Moshe')
            store.update('last_name', 'Levi')
            store.endBatch()

            expect(current_user_callback_calls).toEqual(1)
        });
    });
});
