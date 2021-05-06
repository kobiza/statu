const {uniqueId} = require('lodash')

const getStore = () => {
    const state = {
        root: {}
    }
    const subscribers = {}
    let isBatched = false
    let actionsQueue = []

    const subscribe = (keys, callback) => {
        const callbackId = uniqueId('callback_')
        keys.forEach(key => {
            subscribers[key] = subscribers[key] || {}
            subscribers[key][callbackId] = callback
        })

        return () => {
            keys.forEach(key => {
                delete subscribers[key][callbackId]
            })
        }
    }


    // todo - make sure that multiple callback will be called at the end of the batch
    const notifySubscribers = (keys) => {
        const callbacksToCall = keys.reduce((allCallbacks, key) => {
            const callbacks = subscribers[key] || {}
            Object.keys(callbacks).forEach(callbackId => {
                allCallbacks[callbackId] = callbacks[callbackId]
            })

            return allCallbacks
        }, {})

        Object.keys(callbacksToCall).forEach(callbackId => {
            callbacksToCall[callbackId]()
        })
    }



    const setState = (key, value) => {
        state.root = {
            ...state.root,
            [key]: value
        }

        // should be calculate base on the changed path
        const changedKeys = [key]
        return changedKeys
    }

    const updateAndNotify = (key, value) => {
        const changedKeys = setState(key, value)
        notifySubscribers(changedKeys)
    }

    const addUpdateToQueue = (key, value) => {
        actionsQueue.push(() => setState(key, value))
    }

    const update = (key, value) => {
        if (!isBatched) {
            return updateAndNotify(key, value)
        } else {
            return addUpdateToQueue(key, value)
        }
    }

    const startBatch = () => {
        isBatched = true
    }

    const flushBatchedAndNotify = () => {
        const keysChangedMap = actionsQueue.map(currentUpdate => currentUpdate()).reduce((keysMap, keysToAdd) => {
            keysToAdd.forEach(key => {
                keysMap[key] = true
            })

            return keysMap
        }, {})
        const keysChanged = Object.keys(keysChangedMap)
        notifySubscribers(keysChanged)
    }

    const endBatch = () => {
        flushBatchedAndNotify()
        isBatched = false
        actionsQueue = []
    }

    return {
        getState: () => state.root,
        update,
        startBatch,
        endBatch,
        subscribe
    }
}

exports.getStore = getStore
