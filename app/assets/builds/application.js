var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/@rails/actioncable/src/adapters.js
var adapters_default;
var init_adapters = __esm({
  "node_modules/@rails/actioncable/src/adapters.js"() {
    adapters_default = {
      logger: typeof console !== "undefined" ? console : void 0,
      WebSocket: typeof WebSocket !== "undefined" ? WebSocket : void 0
    };
  }
});

// node_modules/@rails/actioncable/src/logger.js
var logger_default;
var init_logger = __esm({
  "node_modules/@rails/actioncable/src/logger.js"() {
    init_adapters();
    logger_default = {
      log(...messages) {
        if (this.enabled) {
          messages.push(Date.now());
          adapters_default.logger.log("[ActionCable]", ...messages);
        }
      }
    };
  }
});

// node_modules/@rails/actioncable/src/connection_monitor.js
var now, secondsSince, ConnectionMonitor, connection_monitor_default;
var init_connection_monitor = __esm({
  "node_modules/@rails/actioncable/src/connection_monitor.js"() {
    init_logger();
    now = () => (/* @__PURE__ */ new Date()).getTime();
    secondsSince = (time) => (now() - time) / 1e3;
    ConnectionMonitor = class {
      constructor(connection) {
        this.visibilityDidChange = this.visibilityDidChange.bind(this);
        this.connection = connection;
        this.reconnectAttempts = 0;
      }
      start() {
        if (!this.isRunning()) {
          this.startedAt = now();
          delete this.stoppedAt;
          this.startPolling();
          addEventListener("visibilitychange", this.visibilityDidChange);
          logger_default.log(`ConnectionMonitor started. stale threshold = ${this.constructor.staleThreshold} s`);
        }
      }
      stop() {
        if (this.isRunning()) {
          this.stoppedAt = now();
          this.stopPolling();
          removeEventListener("visibilitychange", this.visibilityDidChange);
          logger_default.log("ConnectionMonitor stopped");
        }
      }
      isRunning() {
        return this.startedAt && !this.stoppedAt;
      }
      recordMessage() {
        this.pingedAt = now();
      }
      recordConnect() {
        this.reconnectAttempts = 0;
        delete this.disconnectedAt;
        logger_default.log("ConnectionMonitor recorded connect");
      }
      recordDisconnect() {
        this.disconnectedAt = now();
        logger_default.log("ConnectionMonitor recorded disconnect");
      }
      // Private
      startPolling() {
        this.stopPolling();
        this.poll();
      }
      stopPolling() {
        clearTimeout(this.pollTimeout);
      }
      poll() {
        this.pollTimeout = setTimeout(
          () => {
            this.reconnectIfStale();
            this.poll();
          },
          this.getPollInterval()
        );
      }
      getPollInterval() {
        const { staleThreshold, reconnectionBackoffRate } = this.constructor;
        const backoff = Math.pow(1 + reconnectionBackoffRate, Math.min(this.reconnectAttempts, 10));
        const jitterMax = this.reconnectAttempts === 0 ? 1 : reconnectionBackoffRate;
        const jitter = jitterMax * Math.random();
        return staleThreshold * 1e3 * backoff * (1 + jitter);
      }
      reconnectIfStale() {
        if (this.connectionIsStale()) {
          logger_default.log(`ConnectionMonitor detected stale connection. reconnectAttempts = ${this.reconnectAttempts}, time stale = ${secondsSince(this.refreshedAt)} s, stale threshold = ${this.constructor.staleThreshold} s`);
          this.reconnectAttempts++;
          if (this.disconnectedRecently()) {
            logger_default.log(`ConnectionMonitor skipping reopening recent disconnect. time disconnected = ${secondsSince(this.disconnectedAt)} s`);
          } else {
            logger_default.log("ConnectionMonitor reopening");
            this.connection.reopen();
          }
        }
      }
      get refreshedAt() {
        return this.pingedAt ? this.pingedAt : this.startedAt;
      }
      connectionIsStale() {
        return secondsSince(this.refreshedAt) > this.constructor.staleThreshold;
      }
      disconnectedRecently() {
        return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
      }
      visibilityDidChange() {
        if (document.visibilityState === "visible") {
          setTimeout(
            () => {
              if (this.connectionIsStale() || !this.connection.isOpen()) {
                logger_default.log(`ConnectionMonitor reopening stale connection on visibilitychange. visibilityState = ${document.visibilityState}`);
                this.connection.reopen();
              }
            },
            200
          );
        }
      }
    };
    ConnectionMonitor.staleThreshold = 6;
    ConnectionMonitor.reconnectionBackoffRate = 0.15;
    connection_monitor_default = ConnectionMonitor;
  }
});

// node_modules/@rails/actioncable/src/internal.js
var internal_default;
var init_internal = __esm({
  "node_modules/@rails/actioncable/src/internal.js"() {
    internal_default = {
      "message_types": {
        "welcome": "welcome",
        "disconnect": "disconnect",
        "ping": "ping",
        "confirmation": "confirm_subscription",
        "rejection": "reject_subscription"
      },
      "disconnect_reasons": {
        "unauthorized": "unauthorized",
        "invalid_request": "invalid_request",
        "server_restart": "server_restart",
        "remote": "remote"
      },
      "default_mount_path": "/cable",
      "protocols": [
        "actioncable-v1-json",
        "actioncable-unsupported"
      ]
    };
  }
});

// node_modules/@rails/actioncable/src/connection.js
var message_types, protocols, supportedProtocols, indexOf, Connection, connection_default;
var init_connection = __esm({
  "node_modules/@rails/actioncable/src/connection.js"() {
    init_adapters();
    init_connection_monitor();
    init_internal();
    init_logger();
    ({ message_types, protocols } = internal_default);
    supportedProtocols = protocols.slice(0, protocols.length - 1);
    indexOf = [].indexOf;
    Connection = class {
      constructor(consumer2) {
        this.open = this.open.bind(this);
        this.consumer = consumer2;
        this.subscriptions = this.consumer.subscriptions;
        this.monitor = new connection_monitor_default(this);
        this.disconnected = true;
      }
      send(data) {
        if (this.isOpen()) {
          this.webSocket.send(JSON.stringify(data));
          return true;
        } else {
          return false;
        }
      }
      open() {
        if (this.isActive()) {
          logger_default.log(`Attempted to open WebSocket, but existing socket is ${this.getState()}`);
          return false;
        } else {
          const socketProtocols = [...protocols, ...this.consumer.subprotocols || []];
          logger_default.log(`Opening WebSocket, current state is ${this.getState()}, subprotocols: ${socketProtocols}`);
          if (this.webSocket) {
            this.uninstallEventHandlers();
          }
          this.webSocket = new adapters_default.WebSocket(this.consumer.url, socketProtocols);
          this.installEventHandlers();
          this.monitor.start();
          return true;
        }
      }
      close({ allowReconnect } = { allowReconnect: true }) {
        if (!allowReconnect) {
          this.monitor.stop();
        }
        if (this.isOpen()) {
          return this.webSocket.close();
        }
      }
      reopen() {
        logger_default.log(`Reopening WebSocket, current state is ${this.getState()}`);
        if (this.isActive()) {
          try {
            return this.close();
          } catch (error2) {
            logger_default.log("Failed to reopen WebSocket", error2);
          } finally {
            logger_default.log(`Reopening WebSocket in ${this.constructor.reopenDelay}ms`);
            setTimeout(this.open, this.constructor.reopenDelay);
          }
        } else {
          return this.open();
        }
      }
      getProtocol() {
        if (this.webSocket) {
          return this.webSocket.protocol;
        }
      }
      isOpen() {
        return this.isState("open");
      }
      isActive() {
        return this.isState("open", "connecting");
      }
      triedToReconnect() {
        return this.monitor.reconnectAttempts > 0;
      }
      // Private
      isProtocolSupported() {
        return indexOf.call(supportedProtocols, this.getProtocol()) >= 0;
      }
      isState(...states) {
        return indexOf.call(states, this.getState()) >= 0;
      }
      getState() {
        if (this.webSocket) {
          for (let state in adapters_default.WebSocket) {
            if (adapters_default.WebSocket[state] === this.webSocket.readyState) {
              return state.toLowerCase();
            }
          }
        }
        return null;
      }
      installEventHandlers() {
        for (let eventName in this.events) {
          const handler = this.events[eventName].bind(this);
          this.webSocket[`on${eventName}`] = handler;
        }
      }
      uninstallEventHandlers() {
        for (let eventName in this.events) {
          this.webSocket[`on${eventName}`] = function() {
          };
        }
      }
    };
    Connection.reopenDelay = 500;
    Connection.prototype.events = {
      message(event) {
        if (!this.isProtocolSupported()) {
          return;
        }
        const { identifier, message, reason, reconnect, type } = JSON.parse(event.data);
        this.monitor.recordMessage();
        switch (type) {
          case message_types.welcome:
            if (this.triedToReconnect()) {
              this.reconnectAttempted = true;
            }
            this.monitor.recordConnect();
            return this.subscriptions.reload();
          case message_types.disconnect:
            logger_default.log(`Disconnecting. Reason: ${reason}`);
            return this.close({ allowReconnect: reconnect });
          case message_types.ping:
            return null;
          case message_types.confirmation:
            this.subscriptions.confirmSubscription(identifier);
            if (this.reconnectAttempted) {
              this.reconnectAttempted = false;
              return this.subscriptions.notify(identifier, "connected", { reconnected: true });
            } else {
              return this.subscriptions.notify(identifier, "connected", { reconnected: false });
            }
          case message_types.rejection:
            return this.subscriptions.reject(identifier);
          default:
            return this.subscriptions.notify(identifier, "received", message);
        }
      },
      open() {
        logger_default.log(`WebSocket onopen event, using '${this.getProtocol()}' subprotocol`);
        this.disconnected = false;
        if (!this.isProtocolSupported()) {
          logger_default.log("Protocol is unsupported. Stopping monitor and disconnecting.");
          return this.close({ allowReconnect: false });
        }
      },
      close(event) {
        logger_default.log("WebSocket onclose event");
        if (this.disconnected) {
          return;
        }
        this.disconnected = true;
        this.monitor.recordDisconnect();
        return this.subscriptions.notifyAll("disconnected", { willAttemptReconnect: this.monitor.isRunning() });
      },
      error() {
        logger_default.log("WebSocket onerror event");
      }
    };
    connection_default = Connection;
  }
});

// node_modules/@rails/actioncable/src/subscription.js
var extend, Subscription;
var init_subscription = __esm({
  "node_modules/@rails/actioncable/src/subscription.js"() {
    extend = function(object, properties) {
      if (properties != null) {
        for (let key in properties) {
          const value = properties[key];
          object[key] = value;
        }
      }
      return object;
    };
    Subscription = class {
      constructor(consumer2, params = {}, mixin) {
        this.consumer = consumer2;
        this.identifier = JSON.stringify(params);
        extend(this, mixin);
      }
      // Perform a channel action with the optional data passed as an attribute
      perform(action, data = {}) {
        data.action = action;
        return this.send(data);
      }
      send(data) {
        return this.consumer.send({ command: "message", identifier: this.identifier, data: JSON.stringify(data) });
      }
      unsubscribe() {
        return this.consumer.subscriptions.remove(this);
      }
    };
  }
});

// node_modules/@rails/actioncable/src/subscription_guarantor.js
var SubscriptionGuarantor, subscription_guarantor_default;
var init_subscription_guarantor = __esm({
  "node_modules/@rails/actioncable/src/subscription_guarantor.js"() {
    init_logger();
    SubscriptionGuarantor = class {
      constructor(subscriptions) {
        this.subscriptions = subscriptions;
        this.pendingSubscriptions = [];
      }
      guarantee(subscription) {
        if (this.pendingSubscriptions.indexOf(subscription) == -1) {
          logger_default.log(`SubscriptionGuarantor guaranteeing ${subscription.identifier}`);
          this.pendingSubscriptions.push(subscription);
        } else {
          logger_default.log(`SubscriptionGuarantor already guaranteeing ${subscription.identifier}`);
        }
        this.startGuaranteeing();
      }
      forget(subscription) {
        logger_default.log(`SubscriptionGuarantor forgetting ${subscription.identifier}`);
        this.pendingSubscriptions = this.pendingSubscriptions.filter((s) => s !== subscription);
      }
      startGuaranteeing() {
        this.stopGuaranteeing();
        this.retrySubscribing();
      }
      stopGuaranteeing() {
        clearTimeout(this.retryTimeout);
      }
      retrySubscribing() {
        this.retryTimeout = setTimeout(
          () => {
            if (this.subscriptions && typeof this.subscriptions.subscribe === "function") {
              this.pendingSubscriptions.map((subscription) => {
                logger_default.log(`SubscriptionGuarantor resubscribing ${subscription.identifier}`);
                this.subscriptions.subscribe(subscription);
              });
            }
          },
          500
        );
      }
    };
    subscription_guarantor_default = SubscriptionGuarantor;
  }
});

// node_modules/@rails/actioncable/src/subscriptions.js
var Subscriptions;
var init_subscriptions = __esm({
  "node_modules/@rails/actioncable/src/subscriptions.js"() {
    init_logger();
    init_subscription();
    init_subscription_guarantor();
    Subscriptions = class {
      constructor(consumer2) {
        this.consumer = consumer2;
        this.guarantor = new subscription_guarantor_default(this);
        this.subscriptions = [];
      }
      create(channelName, mixin) {
        const channel = channelName;
        const params = typeof channel === "object" ? channel : { channel };
        const subscription = new Subscription(this.consumer, params, mixin);
        return this.add(subscription);
      }
      // Private
      add(subscription) {
        this.subscriptions.push(subscription);
        this.consumer.ensureActiveConnection();
        this.notify(subscription, "initialized");
        this.subscribe(subscription);
        return subscription;
      }
      remove(subscription) {
        this.forget(subscription);
        if (!this.findAll(subscription.identifier).length) {
          this.sendCommand(subscription, "unsubscribe");
        }
        return subscription;
      }
      reject(identifier) {
        return this.findAll(identifier).map((subscription) => {
          this.forget(subscription);
          this.notify(subscription, "rejected");
          return subscription;
        });
      }
      forget(subscription) {
        this.guarantor.forget(subscription);
        this.subscriptions = this.subscriptions.filter((s) => s !== subscription);
        return subscription;
      }
      findAll(identifier) {
        return this.subscriptions.filter((s) => s.identifier === identifier);
      }
      reload() {
        return this.subscriptions.map((subscription) => this.subscribe(subscription));
      }
      notifyAll(callbackName, ...args) {
        return this.subscriptions.map((subscription) => this.notify(subscription, callbackName, ...args));
      }
      notify(subscription, callbackName, ...args) {
        let subscriptions;
        if (typeof subscription === "string") {
          subscriptions = this.findAll(subscription);
        } else {
          subscriptions = [subscription];
        }
        return subscriptions.map((subscription2) => typeof subscription2[callbackName] === "function" ? subscription2[callbackName](...args) : void 0);
      }
      subscribe(subscription) {
        if (this.sendCommand(subscription, "subscribe")) {
          this.guarantor.guarantee(subscription);
        }
      }
      confirmSubscription(identifier) {
        logger_default.log(`Subscription confirmed ${identifier}`);
        this.findAll(identifier).map((subscription) => this.guarantor.forget(subscription));
      }
      sendCommand(subscription, command) {
        const { identifier } = subscription;
        return this.consumer.send({ command, identifier });
      }
    };
  }
});

// node_modules/@rails/actioncable/src/consumer.js
function createWebSocketURL(url) {
  if (typeof url === "function") {
    url = url();
  }
  if (url && !/^wss?:/i.test(url)) {
    const a = document.createElement("a");
    a.href = url;
    a.href = a.href;
    a.protocol = a.protocol.replace("http", "ws");
    return a.href;
  } else {
    return url;
  }
}
var Consumer;
var init_consumer = __esm({
  "node_modules/@rails/actioncable/src/consumer.js"() {
    init_connection();
    init_subscriptions();
    Consumer = class {
      constructor(url) {
        this._url = url;
        this.subscriptions = new Subscriptions(this);
        this.connection = new connection_default(this);
        this.subprotocols = [];
      }
      get url() {
        return createWebSocketURL(this._url);
      }
      send(data) {
        return this.connection.send(data);
      }
      connect() {
        return this.connection.open();
      }
      disconnect() {
        return this.connection.close({ allowReconnect: false });
      }
      ensureActiveConnection() {
        if (!this.connection.isActive()) {
          return this.connection.open();
        }
      }
      addSubProtocol(subprotocol) {
        this.subprotocols = [...this.subprotocols, subprotocol];
      }
    };
  }
});

// node_modules/@rails/actioncable/src/index.js
var src_exports = {};
__export(src_exports, {
  Connection: () => connection_default,
  ConnectionMonitor: () => connection_monitor_default,
  Consumer: () => Consumer,
  INTERNAL: () => internal_default,
  Subscription: () => Subscription,
  SubscriptionGuarantor: () => subscription_guarantor_default,
  Subscriptions: () => Subscriptions,
  adapters: () => adapters_default,
  createConsumer: () => createConsumer,
  createWebSocketURL: () => createWebSocketURL,
  getConfig: () => getConfig,
  logger: () => logger_default
});
function createConsumer(url = getConfig("url") || internal_default.default_mount_path) {
  return new Consumer(url);
}
function getConfig(name) {
  const element = document.head.querySelector(`meta[name='action-cable-${name}']`);
  if (element) {
    return element.getAttribute("content");
  }
}
var init_src = __esm({
  "node_modules/@rails/actioncable/src/index.js"() {
    init_adapters();
    init_connection();
    init_connection_monitor();
    init_consumer();
    init_internal();
    init_logger();
    init_subscription();
    init_subscription_guarantor();
    init_subscriptions();
  }
});

// node_modules/flowbite/dist/flowbite.turbo.js
var require_flowbite_turbo = __commonJS({
  "node_modules/flowbite/dist/flowbite.turbo.js"(exports, module) {
    (function webpackUniversalModuleDefinition(root, factory) {
      if (typeof exports === "object" && typeof module === "object")
        module.exports = factory();
      else if (typeof define === "function" && define.amd)
        define("Flowbite", [], factory);
      else if (typeof exports === "object")
        exports["Flowbite"] = factory();
      else
        root["Flowbite"] = factory();
    })(self, function() {
      return (
        /******/
        (function() {
          "use strict";
          var __webpack_modules__ = {
            /***/
            3853: (
              /***/
              (function(__unused_webpack_module, __webpack_exports__2, __webpack_require__2) {
                __webpack_require__2.r(__webpack_exports__2);
                __webpack_require__2.d(__webpack_exports__2, {
                  "afterMain": function() {
                    return (
                      /* reexport */
                      afterMain
                    );
                  },
                  "afterRead": function() {
                    return (
                      /* reexport */
                      afterRead
                    );
                  },
                  "afterWrite": function() {
                    return (
                      /* reexport */
                      afterWrite
                    );
                  },
                  "applyStyles": function() {
                    return (
                      /* reexport */
                      modifiers_applyStyles
                    );
                  },
                  "arrow": function() {
                    return (
                      /* reexport */
                      modifiers_arrow
                    );
                  },
                  "auto": function() {
                    return (
                      /* reexport */
                      auto
                    );
                  },
                  "basePlacements": function() {
                    return (
                      /* reexport */
                      basePlacements
                    );
                  },
                  "beforeMain": function() {
                    return (
                      /* reexport */
                      beforeMain
                    );
                  },
                  "beforeRead": function() {
                    return (
                      /* reexport */
                      beforeRead
                    );
                  },
                  "beforeWrite": function() {
                    return (
                      /* reexport */
                      beforeWrite
                    );
                  },
                  "bottom": function() {
                    return (
                      /* reexport */
                      bottom
                    );
                  },
                  "clippingParents": function() {
                    return (
                      /* reexport */
                      clippingParents
                    );
                  },
                  "computeStyles": function() {
                    return (
                      /* reexport */
                      modifiers_computeStyles
                    );
                  },
                  "createPopper": function() {
                    return (
                      /* reexport */
                      popper_createPopper
                    );
                  },
                  "createPopperBase": function() {
                    return (
                      /* reexport */
                      createPopper
                    );
                  },
                  "createPopperLite": function() {
                    return (
                      /* reexport */
                      popper_lite_createPopper
                    );
                  },
                  "detectOverflow": function() {
                    return (
                      /* reexport */
                      detectOverflow
                    );
                  },
                  "end": function() {
                    return (
                      /* reexport */
                      end
                    );
                  },
                  "eventListeners": function() {
                    return (
                      /* reexport */
                      eventListeners
                    );
                  },
                  "flip": function() {
                    return (
                      /* reexport */
                      modifiers_flip
                    );
                  },
                  "hide": function() {
                    return (
                      /* reexport */
                      modifiers_hide
                    );
                  },
                  "left": function() {
                    return (
                      /* reexport */
                      left
                    );
                  },
                  "main": function() {
                    return (
                      /* reexport */
                      main
                    );
                  },
                  "modifierPhases": function() {
                    return (
                      /* reexport */
                      modifierPhases
                    );
                  },
                  "offset": function() {
                    return (
                      /* reexport */
                      modifiers_offset
                    );
                  },
                  "placements": function() {
                    return (
                      /* reexport */
                      enums_placements
                    );
                  },
                  "popper": function() {
                    return (
                      /* reexport */
                      popper
                    );
                  },
                  "popperGenerator": function() {
                    return (
                      /* reexport */
                      popperGenerator
                    );
                  },
                  "popperOffsets": function() {
                    return (
                      /* reexport */
                      modifiers_popperOffsets
                    );
                  },
                  "preventOverflow": function() {
                    return (
                      /* reexport */
                      modifiers_preventOverflow
                    );
                  },
                  "read": function() {
                    return (
                      /* reexport */
                      read
                    );
                  },
                  "reference": function() {
                    return (
                      /* reexport */
                      reference
                    );
                  },
                  "right": function() {
                    return (
                      /* reexport */
                      right
                    );
                  },
                  "start": function() {
                    return (
                      /* reexport */
                      start2
                    );
                  },
                  "top": function() {
                    return (
                      /* reexport */
                      enums_top
                    );
                  },
                  "variationPlacements": function() {
                    return (
                      /* reexport */
                      variationPlacements
                    );
                  },
                  "viewport": function() {
                    return (
                      /* reexport */
                      viewport
                    );
                  },
                  "write": function() {
                    return (
                      /* reexport */
                      write
                    );
                  }
                });
                ;
                var enums_top = "top";
                var bottom = "bottom";
                var right = "right";
                var left = "left";
                var auto = "auto";
                var basePlacements = [enums_top, bottom, right, left];
                var start2 = "start";
                var end = "end";
                var clippingParents = "clippingParents";
                var viewport = "viewport";
                var popper = "popper";
                var reference = "reference";
                var variationPlacements = /* @__PURE__ */ basePlacements.reduce(function(acc, placement) {
                  return acc.concat([placement + "-" + start2, placement + "-" + end]);
                }, []);
                var enums_placements = /* @__PURE__ */ [].concat(basePlacements, [auto]).reduce(function(acc, placement) {
                  return acc.concat([placement, placement + "-" + start2, placement + "-" + end]);
                }, []);
                var beforeRead = "beforeRead";
                var read = "read";
                var afterRead = "afterRead";
                var beforeMain = "beforeMain";
                var main = "main";
                var afterMain = "afterMain";
                var beforeWrite = "beforeWrite";
                var write = "write";
                var afterWrite = "afterWrite";
                var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];
                ;
                function getNodeName(element) {
                  return element ? (element.nodeName || "").toLowerCase() : null;
                }
                ;
                function getWindow(node) {
                  if (node == null) {
                    return window;
                  }
                  if (node.toString() !== "[object Window]") {
                    var ownerDocument = node.ownerDocument;
                    return ownerDocument ? ownerDocument.defaultView || window : window;
                  }
                  return node;
                }
                ;
                function isElement(node) {
                  var OwnElement = getWindow(node).Element;
                  return node instanceof OwnElement || node instanceof Element;
                }
                function isHTMLElement(node) {
                  var OwnElement = getWindow(node).HTMLElement;
                  return node instanceof OwnElement || node instanceof HTMLElement;
                }
                function isShadowRoot(node) {
                  if (typeof ShadowRoot === "undefined") {
                    return false;
                  }
                  var OwnElement = getWindow(node).ShadowRoot;
                  return node instanceof OwnElement || node instanceof ShadowRoot;
                }
                ;
                function applyStyles(_ref) {
                  var state = _ref.state;
                  Object.keys(state.elements).forEach(function(name) {
                    var style = state.styles[name] || {};
                    var attributes = state.attributes[name] || {};
                    var element = state.elements[name];
                    if (!isHTMLElement(element) || !getNodeName(element)) {
                      return;
                    }
                    Object.assign(element.style, style);
                    Object.keys(attributes).forEach(function(name2) {
                      var value = attributes[name2];
                      if (value === false) {
                        element.removeAttribute(name2);
                      } else {
                        element.setAttribute(name2, value === true ? "" : value);
                      }
                    });
                  });
                }
                function effect(_ref2) {
                  var state = _ref2.state;
                  var initialStyles = {
                    popper: {
                      position: state.options.strategy,
                      left: "0",
                      top: "0",
                      margin: "0"
                    },
                    arrow: {
                      position: "absolute"
                    },
                    reference: {}
                  };
                  Object.assign(state.elements.popper.style, initialStyles.popper);
                  state.styles = initialStyles;
                  if (state.elements.arrow) {
                    Object.assign(state.elements.arrow.style, initialStyles.arrow);
                  }
                  return function() {
                    Object.keys(state.elements).forEach(function(name) {
                      var element = state.elements[name];
                      var attributes = state.attributes[name] || {};
                      var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]);
                      var style = styleProperties.reduce(function(style2, property) {
                        style2[property] = "";
                        return style2;
                      }, {});
                      if (!isHTMLElement(element) || !getNodeName(element)) {
                        return;
                      }
                      Object.assign(element.style, style);
                      Object.keys(attributes).forEach(function(attribute) {
                        element.removeAttribute(attribute);
                      });
                    });
                  };
                }
                var modifiers_applyStyles = {
                  name: "applyStyles",
                  enabled: true,
                  phase: "write",
                  fn: applyStyles,
                  effect,
                  requires: ["computeStyles"]
                };
                ;
                function getBasePlacement(placement) {
                  return placement.split("-")[0];
                }
                ;
                var math_max = Math.max;
                var math_min = Math.min;
                var round = Math.round;
                ;
                function getUAString() {
                  var uaData = navigator.userAgentData;
                  if (uaData != null && uaData.brands) {
                    return uaData.brands.map(function(item) {
                      return item.brand + "/" + item.version;
                    }).join(" ");
                  }
                  return navigator.userAgent;
                }
                ;
                function isLayoutViewport() {
                  return !/^((?!chrome|android).)*safari/i.test(getUAString());
                }
                ;
                function getBoundingClientRect(element, includeScale, isFixedStrategy) {
                  if (includeScale === void 0) {
                    includeScale = false;
                  }
                  if (isFixedStrategy === void 0) {
                    isFixedStrategy = false;
                  }
                  var clientRect = element.getBoundingClientRect();
                  var scaleX = 1;
                  var scaleY = 1;
                  if (includeScale && isHTMLElement(element)) {
                    scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
                    scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
                  }
                  var _ref = isElement(element) ? getWindow(element) : window, visualViewport = _ref.visualViewport;
                  var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
                  var x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
                  var y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
                  var width = clientRect.width / scaleX;
                  var height = clientRect.height / scaleY;
                  return {
                    width,
                    height,
                    top: y,
                    right: x + width,
                    bottom: y + height,
                    left: x,
                    x,
                    y
                  };
                }
                ;
                function getLayoutRect(element) {
                  var clientRect = getBoundingClientRect(element);
                  var width = element.offsetWidth;
                  var height = element.offsetHeight;
                  if (Math.abs(clientRect.width - width) <= 1) {
                    width = clientRect.width;
                  }
                  if (Math.abs(clientRect.height - height) <= 1) {
                    height = clientRect.height;
                  }
                  return {
                    x: element.offsetLeft,
                    y: element.offsetTop,
                    width,
                    height
                  };
                }
                ;
                function contains(parent, child) {
                  var rootNode = child.getRootNode && child.getRootNode();
                  if (parent.contains(child)) {
                    return true;
                  } else if (rootNode && isShadowRoot(rootNode)) {
                    var next = child;
                    do {
                      if (next && parent.isSameNode(next)) {
                        return true;
                      }
                      next = next.parentNode || next.host;
                    } while (next);
                  }
                  return false;
                }
                ;
                function getComputedStyle(element) {
                  return getWindow(element).getComputedStyle(element);
                }
                ;
                function isTableElement(element) {
                  return ["table", "td", "th"].indexOf(getNodeName(element)) >= 0;
                }
                ;
                function getDocumentElement(element) {
                  return ((isElement(element) ? element.ownerDocument : (
                    // $FlowFixMe[prop-missing]
                    element.document
                  )) || window.document).documentElement;
                }
                ;
                function getParentNode(element) {
                  if (getNodeName(element) === "html") {
                    return element;
                  }
                  return (
                    // this is a quicker (but less type safe) way to save quite some bytes from the bundle
                    // $FlowFixMe[incompatible-return]
                    // $FlowFixMe[prop-missing]
                    element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
                    element.parentNode || // DOM Element detected
                    (isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
                    // $FlowFixMe[incompatible-call]: HTMLElement is a Node
                    getDocumentElement(element)
                  );
                }
                ;
                function getTrueOffsetParent(element) {
                  if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
                  getComputedStyle(element).position === "fixed") {
                    return null;
                  }
                  return element.offsetParent;
                }
                function getContainingBlock(element) {
                  var isFirefox = /firefox/i.test(getUAString());
                  var isIE = /Trident/i.test(getUAString());
                  if (isIE && isHTMLElement(element)) {
                    var elementCss = getComputedStyle(element);
                    if (elementCss.position === "fixed") {
                      return null;
                    }
                  }
                  var currentNode = getParentNode(element);
                  if (isShadowRoot(currentNode)) {
                    currentNode = currentNode.host;
                  }
                  while (isHTMLElement(currentNode) && ["html", "body"].indexOf(getNodeName(currentNode)) < 0) {
                    var css = getComputedStyle(currentNode);
                    if (css.transform !== "none" || css.perspective !== "none" || css.contain === "paint" || ["transform", "perspective"].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === "filter" || isFirefox && css.filter && css.filter !== "none") {
                      return currentNode;
                    } else {
                      currentNode = currentNode.parentNode;
                    }
                  }
                  return null;
                }
                function getOffsetParent(element) {
                  var window2 = getWindow(element);
                  var offsetParent = getTrueOffsetParent(element);
                  while (offsetParent && isTableElement(offsetParent) && getComputedStyle(offsetParent).position === "static") {
                    offsetParent = getTrueOffsetParent(offsetParent);
                  }
                  if (offsetParent && (getNodeName(offsetParent) === "html" || getNodeName(offsetParent) === "body" && getComputedStyle(offsetParent).position === "static")) {
                    return window2;
                  }
                  return offsetParent || getContainingBlock(element) || window2;
                }
                ;
                function getMainAxisFromPlacement(placement) {
                  return ["top", "bottom"].indexOf(placement) >= 0 ? "x" : "y";
                }
                ;
                function within(min, value, max) {
                  return math_max(min, math_min(value, max));
                }
                function withinMaxClamp(min, value, max) {
                  var v = within(min, value, max);
                  return v > max ? max : v;
                }
                ;
                function getFreshSideObject() {
                  return {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                  };
                }
                ;
                function mergePaddingObject(paddingObject) {
                  return Object.assign({}, getFreshSideObject(), paddingObject);
                }
                ;
                function expandToHashMap(value, keys) {
                  return keys.reduce(function(hashMap, key) {
                    hashMap[key] = value;
                    return hashMap;
                  }, {});
                }
                ;
                var toPaddingObject = function toPaddingObject2(padding, state) {
                  padding = typeof padding === "function" ? padding(Object.assign({}, state.rects, {
                    placement: state.placement
                  })) : padding;
                  return mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
                };
                function arrow(_ref) {
                  var _state$modifiersData$;
                  var state = _ref.state, name = _ref.name, options = _ref.options;
                  var arrowElement = state.elements.arrow;
                  var popperOffsets2 = state.modifiersData.popperOffsets;
                  var basePlacement = getBasePlacement(state.placement);
                  var axis = getMainAxisFromPlacement(basePlacement);
                  var isVertical = [left, right].indexOf(basePlacement) >= 0;
                  var len = isVertical ? "height" : "width";
                  if (!arrowElement || !popperOffsets2) {
                    return;
                  }
                  var paddingObject = toPaddingObject(options.padding, state);
                  var arrowRect = getLayoutRect(arrowElement);
                  var minProp = axis === "y" ? enums_top : left;
                  var maxProp = axis === "y" ? bottom : right;
                  var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets2[axis] - state.rects.popper[len];
                  var startDiff = popperOffsets2[axis] - state.rects.reference[axis];
                  var arrowOffsetParent = getOffsetParent(arrowElement);
                  var clientSize = arrowOffsetParent ? axis === "y" ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
                  var centerToReference = endDiff / 2 - startDiff / 2;
                  var min = paddingObject[minProp];
                  var max = clientSize - arrowRect[len] - paddingObject[maxProp];
                  var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
                  var offset2 = within(min, center, max);
                  var axisProp = axis;
                  state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset2, _state$modifiersData$.centerOffset = offset2 - center, _state$modifiersData$);
                }
                function arrow_effect(_ref2) {
                  var state = _ref2.state, options = _ref2.options;
                  var _options$element = options.element, arrowElement = _options$element === void 0 ? "[data-popper-arrow]" : _options$element;
                  if (arrowElement == null) {
                    return;
                  }
                  if (typeof arrowElement === "string") {
                    arrowElement = state.elements.popper.querySelector(arrowElement);
                    if (!arrowElement) {
                      return;
                    }
                  }
                  if (false) {
                  }
                  if (!contains(state.elements.popper, arrowElement)) {
                    if (false) {
                    }
                    return;
                  }
                  state.elements.arrow = arrowElement;
                }
                var modifiers_arrow = {
                  name: "arrow",
                  enabled: true,
                  phase: "main",
                  fn: arrow,
                  effect: arrow_effect,
                  requires: ["popperOffsets"],
                  requiresIfExists: ["preventOverflow"]
                };
                ;
                function getVariation(placement) {
                  return placement.split("-")[1];
                }
                ;
                var unsetSides = {
                  top: "auto",
                  right: "auto",
                  bottom: "auto",
                  left: "auto"
                };
                function roundOffsetsByDPR(_ref) {
                  var x = _ref.x, y = _ref.y;
                  var win = window;
                  var dpr = win.devicePixelRatio || 1;
                  return {
                    x: round(x * dpr) / dpr || 0,
                    y: round(y * dpr) / dpr || 0
                  };
                }
                function mapToStyles(_ref2) {
                  var _Object$assign2;
                  var popper2 = _ref2.popper, popperRect = _ref2.popperRect, placement = _ref2.placement, variation = _ref2.variation, offsets = _ref2.offsets, position = _ref2.position, gpuAcceleration = _ref2.gpuAcceleration, adaptive = _ref2.adaptive, roundOffsets = _ref2.roundOffsets, isFixed = _ref2.isFixed;
                  var _offsets$x = offsets.x, x = _offsets$x === void 0 ? 0 : _offsets$x, _offsets$y = offsets.y, y = _offsets$y === void 0 ? 0 : _offsets$y;
                  var _ref3 = typeof roundOffsets === "function" ? roundOffsets({
                    x,
                    y
                  }) : {
                    x,
                    y
                  };
                  x = _ref3.x;
                  y = _ref3.y;
                  var hasX = offsets.hasOwnProperty("x");
                  var hasY = offsets.hasOwnProperty("y");
                  var sideX = left;
                  var sideY = enums_top;
                  var win = window;
                  if (adaptive) {
                    var offsetParent = getOffsetParent(popper2);
                    var heightProp = "clientHeight";
                    var widthProp = "clientWidth";
                    if (offsetParent === getWindow(popper2)) {
                      offsetParent = getDocumentElement(popper2);
                      if (getComputedStyle(offsetParent).position !== "static" && position === "absolute") {
                        heightProp = "scrollHeight";
                        widthProp = "scrollWidth";
                      }
                    }
                    offsetParent = offsetParent;
                    if (placement === enums_top || (placement === left || placement === right) && variation === end) {
                      sideY = bottom;
                      var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : (
                        // $FlowFixMe[prop-missing]
                        offsetParent[heightProp]
                      );
                      y -= offsetY - popperRect.height;
                      y *= gpuAcceleration ? 1 : -1;
                    }
                    if (placement === left || (placement === enums_top || placement === bottom) && variation === end) {
                      sideX = right;
                      var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : (
                        // $FlowFixMe[prop-missing]
                        offsetParent[widthProp]
                      );
                      x -= offsetX - popperRect.width;
                      x *= gpuAcceleration ? 1 : -1;
                    }
                  }
                  var commonStyles = Object.assign({
                    position
                  }, adaptive && unsetSides);
                  var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
                    x,
                    y
                  }) : {
                    x,
                    y
                  };
                  x = _ref4.x;
                  y = _ref4.y;
                  if (gpuAcceleration) {
                    var _Object$assign;
                    return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? "0" : "", _Object$assign[sideX] = hasX ? "0" : "", _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
                  }
                  return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : "", _Object$assign2[sideX] = hasX ? x + "px" : "", _Object$assign2.transform = "", _Object$assign2));
                }
                function computeStyles(_ref5) {
                  var state = _ref5.state, options = _ref5.options;
                  var _options$gpuAccelerat = options.gpuAcceleration, gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat, _options$adaptive = options.adaptive, adaptive = _options$adaptive === void 0 ? true : _options$adaptive, _options$roundOffsets = options.roundOffsets, roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
                  if (false) {
                    var transitionProperty;
                  }
                  var commonStyles = {
                    placement: getBasePlacement(state.placement),
                    variation: getVariation(state.placement),
                    popper: state.elements.popper,
                    popperRect: state.rects.popper,
                    gpuAcceleration,
                    isFixed: state.options.strategy === "fixed"
                  };
                  if (state.modifiersData.popperOffsets != null) {
                    state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
                      offsets: state.modifiersData.popperOffsets,
                      position: state.options.strategy,
                      adaptive,
                      roundOffsets
                    })));
                  }
                  if (state.modifiersData.arrow != null) {
                    state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
                      offsets: state.modifiersData.arrow,
                      position: "absolute",
                      adaptive: false,
                      roundOffsets
                    })));
                  }
                  state.attributes.popper = Object.assign({}, state.attributes.popper, {
                    "data-popper-placement": state.placement
                  });
                }
                var modifiers_computeStyles = {
                  name: "computeStyles",
                  enabled: true,
                  phase: "beforeWrite",
                  fn: computeStyles,
                  data: {}
                };
                ;
                var passive = {
                  passive: true
                };
                function eventListeners_effect(_ref) {
                  var state = _ref.state, instance = _ref.instance, options = _ref.options;
                  var _options$scroll = options.scroll, scroll = _options$scroll === void 0 ? true : _options$scroll, _options$resize = options.resize, resize = _options$resize === void 0 ? true : _options$resize;
                  var window2 = getWindow(state.elements.popper);
                  var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);
                  if (scroll) {
                    scrollParents.forEach(function(scrollParent) {
                      scrollParent.addEventListener("scroll", instance.update, passive);
                    });
                  }
                  if (resize) {
                    window2.addEventListener("resize", instance.update, passive);
                  }
                  return function() {
                    if (scroll) {
                      scrollParents.forEach(function(scrollParent) {
                        scrollParent.removeEventListener("scroll", instance.update, passive);
                      });
                    }
                    if (resize) {
                      window2.removeEventListener("resize", instance.update, passive);
                    }
                  };
                }
                var eventListeners = {
                  name: "eventListeners",
                  enabled: true,
                  phase: "write",
                  fn: function fn() {
                  },
                  effect: eventListeners_effect,
                  data: {}
                };
                ;
                var hash = {
                  left: "right",
                  right: "left",
                  bottom: "top",
                  top: "bottom"
                };
                function getOppositePlacement(placement) {
                  return placement.replace(/left|right|bottom|top/g, function(matched) {
                    return hash[matched];
                  });
                }
                ;
                var getOppositeVariationPlacement_hash = {
                  start: "end",
                  end: "start"
                };
                function getOppositeVariationPlacement(placement) {
                  return placement.replace(/start|end/g, function(matched) {
                    return getOppositeVariationPlacement_hash[matched];
                  });
                }
                ;
                function getWindowScroll(node) {
                  var win = getWindow(node);
                  var scrollLeft = win.pageXOffset;
                  var scrollTop = win.pageYOffset;
                  return {
                    scrollLeft,
                    scrollTop
                  };
                }
                ;
                function getWindowScrollBarX(element) {
                  return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
                }
                ;
                function getViewportRect(element, strategy) {
                  var win = getWindow(element);
                  var html = getDocumentElement(element);
                  var visualViewport = win.visualViewport;
                  var width = html.clientWidth;
                  var height = html.clientHeight;
                  var x = 0;
                  var y = 0;
                  if (visualViewport) {
                    width = visualViewport.width;
                    height = visualViewport.height;
                    var layoutViewport = isLayoutViewport();
                    if (layoutViewport || !layoutViewport && strategy === "fixed") {
                      x = visualViewport.offsetLeft;
                      y = visualViewport.offsetTop;
                    }
                  }
                  return {
                    width,
                    height,
                    x: x + getWindowScrollBarX(element),
                    y
                  };
                }
                ;
                function getDocumentRect(element) {
                  var _element$ownerDocumen;
                  var html = getDocumentElement(element);
                  var winScroll = getWindowScroll(element);
                  var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
                  var width = math_max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
                  var height = math_max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
                  var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
                  var y = -winScroll.scrollTop;
                  if (getComputedStyle(body || html).direction === "rtl") {
                    x += math_max(html.clientWidth, body ? body.clientWidth : 0) - width;
                  }
                  return {
                    width,
                    height,
                    x,
                    y
                  };
                }
                ;
                function isScrollParent(element) {
                  var _getComputedStyle = getComputedStyle(element), overflow = _getComputedStyle.overflow, overflowX = _getComputedStyle.overflowX, overflowY = _getComputedStyle.overflowY;
                  return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
                }
                ;
                function getScrollParent(node) {
                  if (["html", "body", "#document"].indexOf(getNodeName(node)) >= 0) {
                    return node.ownerDocument.body;
                  }
                  if (isHTMLElement(node) && isScrollParent(node)) {
                    return node;
                  }
                  return getScrollParent(getParentNode(node));
                }
                ;
                function listScrollParents(element, list) {
                  var _element$ownerDocumen;
                  if (list === void 0) {
                    list = [];
                  }
                  var scrollParent = getScrollParent(element);
                  var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
                  var win = getWindow(scrollParent);
                  var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
                  var updatedList = list.concat(target);
                  return isBody ? updatedList : (
                    // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
                    updatedList.concat(listScrollParents(getParentNode(target)))
                  );
                }
                ;
                function rectToClientRect(rect) {
                  return Object.assign({}, rect, {
                    left: rect.x,
                    top: rect.y,
                    right: rect.x + rect.width,
                    bottom: rect.y + rect.height
                  });
                }
                ;
                function getInnerBoundingClientRect(element, strategy) {
                  var rect = getBoundingClientRect(element, false, strategy === "fixed");
                  rect.top = rect.top + element.clientTop;
                  rect.left = rect.left + element.clientLeft;
                  rect.bottom = rect.top + element.clientHeight;
                  rect.right = rect.left + element.clientWidth;
                  rect.width = element.clientWidth;
                  rect.height = element.clientHeight;
                  rect.x = rect.left;
                  rect.y = rect.top;
                  return rect;
                }
                function getClientRectFromMixedType(element, clippingParent, strategy) {
                  return clippingParent === viewport ? rectToClientRect(getViewportRect(element, strategy)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
                }
                function getClippingParents(element) {
                  var clippingParents2 = listScrollParents(getParentNode(element));
                  var canEscapeClipping = ["absolute", "fixed"].indexOf(getComputedStyle(element).position) >= 0;
                  var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;
                  if (!isElement(clipperElement)) {
                    return [];
                  }
                  return clippingParents2.filter(function(clippingParent) {
                    return isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== "body";
                  });
                }
                function getClippingRect(element, boundary, rootBoundary, strategy) {
                  var mainClippingParents = boundary === "clippingParents" ? getClippingParents(element) : [].concat(boundary);
                  var clippingParents2 = [].concat(mainClippingParents, [rootBoundary]);
                  var firstClippingParent = clippingParents2[0];
                  var clippingRect = clippingParents2.reduce(function(accRect, clippingParent) {
                    var rect = getClientRectFromMixedType(element, clippingParent, strategy);
                    accRect.top = math_max(rect.top, accRect.top);
                    accRect.right = math_min(rect.right, accRect.right);
                    accRect.bottom = math_min(rect.bottom, accRect.bottom);
                    accRect.left = math_max(rect.left, accRect.left);
                    return accRect;
                  }, getClientRectFromMixedType(element, firstClippingParent, strategy));
                  clippingRect.width = clippingRect.right - clippingRect.left;
                  clippingRect.height = clippingRect.bottom - clippingRect.top;
                  clippingRect.x = clippingRect.left;
                  clippingRect.y = clippingRect.top;
                  return clippingRect;
                }
                ;
                function computeOffsets(_ref) {
                  var reference2 = _ref.reference, element = _ref.element, placement = _ref.placement;
                  var basePlacement = placement ? getBasePlacement(placement) : null;
                  var variation = placement ? getVariation(placement) : null;
                  var commonX = reference2.x + reference2.width / 2 - element.width / 2;
                  var commonY = reference2.y + reference2.height / 2 - element.height / 2;
                  var offsets;
                  switch (basePlacement) {
                    case enums_top:
                      offsets = {
                        x: commonX,
                        y: reference2.y - element.height
                      };
                      break;
                    case bottom:
                      offsets = {
                        x: commonX,
                        y: reference2.y + reference2.height
                      };
                      break;
                    case right:
                      offsets = {
                        x: reference2.x + reference2.width,
                        y: commonY
                      };
                      break;
                    case left:
                      offsets = {
                        x: reference2.x - element.width,
                        y: commonY
                      };
                      break;
                    default:
                      offsets = {
                        x: reference2.x,
                        y: reference2.y
                      };
                  }
                  var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;
                  if (mainAxis != null) {
                    var len = mainAxis === "y" ? "height" : "width";
                    switch (variation) {
                      case start2:
                        offsets[mainAxis] = offsets[mainAxis] - (reference2[len] / 2 - element[len] / 2);
                        break;
                      case end:
                        offsets[mainAxis] = offsets[mainAxis] + (reference2[len] / 2 - element[len] / 2);
                        break;
                      default:
                    }
                  }
                  return offsets;
                }
                ;
                function detectOverflow(state, options) {
                  if (options === void 0) {
                    options = {};
                  }
                  var _options = options, _options$placement = _options.placement, placement = _options$placement === void 0 ? state.placement : _options$placement, _options$strategy = _options.strategy, strategy = _options$strategy === void 0 ? state.strategy : _options$strategy, _options$boundary = _options.boundary, boundary = _options$boundary === void 0 ? clippingParents : _options$boundary, _options$rootBoundary = _options.rootBoundary, rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary, _options$elementConte = _options.elementContext, elementContext = _options$elementConte === void 0 ? popper : _options$elementConte, _options$altBoundary = _options.altBoundary, altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary, _options$padding = _options.padding, padding = _options$padding === void 0 ? 0 : _options$padding;
                  var paddingObject = mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
                  var altContext = elementContext === popper ? reference : popper;
                  var popperRect = state.rects.popper;
                  var element = state.elements[altBoundary ? altContext : elementContext];
                  var clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary, strategy);
                  var referenceClientRect = getBoundingClientRect(state.elements.reference);
                  var popperOffsets2 = computeOffsets({
                    reference: referenceClientRect,
                    element: popperRect,
                    strategy: "absolute",
                    placement
                  });
                  var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets2));
                  var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect;
                  var overflowOffsets = {
                    top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
                    bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
                    left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
                    right: elementClientRect.right - clippingClientRect.right + paddingObject.right
                  };
                  var offsetData = state.modifiersData.offset;
                  if (elementContext === popper && offsetData) {
                    var offset2 = offsetData[placement];
                    Object.keys(overflowOffsets).forEach(function(key) {
                      var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
                      var axis = [enums_top, bottom].indexOf(key) >= 0 ? "y" : "x";
                      overflowOffsets[key] += offset2[axis] * multiply;
                    });
                  }
                  return overflowOffsets;
                }
                ;
                function computeAutoPlacement(state, options) {
                  if (options === void 0) {
                    options = {};
                  }
                  var _options = options, placement = _options.placement, boundary = _options.boundary, rootBoundary = _options.rootBoundary, padding = _options.padding, flipVariations = _options.flipVariations, _options$allowedAutoP = _options.allowedAutoPlacements, allowedAutoPlacements = _options$allowedAutoP === void 0 ? enums_placements : _options$allowedAutoP;
                  var variation = getVariation(placement);
                  var placements = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function(placement2) {
                    return getVariation(placement2) === variation;
                  }) : basePlacements;
                  var allowedPlacements = placements.filter(function(placement2) {
                    return allowedAutoPlacements.indexOf(placement2) >= 0;
                  });
                  if (allowedPlacements.length === 0) {
                    allowedPlacements = placements;
                    if (false) {
                    }
                  }
                  var overflows = allowedPlacements.reduce(function(acc, placement2) {
                    acc[placement2] = detectOverflow(state, {
                      placement: placement2,
                      boundary,
                      rootBoundary,
                      padding
                    })[getBasePlacement(placement2)];
                    return acc;
                  }, {});
                  return Object.keys(overflows).sort(function(a, b) {
                    return overflows[a] - overflows[b];
                  });
                }
                ;
                function getExpandedFallbackPlacements(placement) {
                  if (getBasePlacement(placement) === auto) {
                    return [];
                  }
                  var oppositePlacement = getOppositePlacement(placement);
                  return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
                }
                function flip(_ref) {
                  var state = _ref.state, options = _ref.options, name = _ref.name;
                  if (state.modifiersData[name]._skip) {
                    return;
                  }
                  var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis, specifiedFallbackPlacements = options.fallbackPlacements, padding = options.padding, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, _options$flipVariatio = options.flipVariations, flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio, allowedAutoPlacements = options.allowedAutoPlacements;
                  var preferredPlacement = state.options.placement;
                  var basePlacement = getBasePlacement(preferredPlacement);
                  var isBasePlacement = basePlacement === preferredPlacement;
                  var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
                  var placements = [preferredPlacement].concat(fallbackPlacements).reduce(function(acc, placement2) {
                    return acc.concat(getBasePlacement(placement2) === auto ? computeAutoPlacement(state, {
                      placement: placement2,
                      boundary,
                      rootBoundary,
                      padding,
                      flipVariations,
                      allowedAutoPlacements
                    }) : placement2);
                  }, []);
                  var referenceRect = state.rects.reference;
                  var popperRect = state.rects.popper;
                  var checksMap = /* @__PURE__ */ new Map();
                  var makeFallbackChecks = true;
                  var firstFittingPlacement = placements[0];
                  for (var i = 0; i < placements.length; i++) {
                    var placement = placements[i];
                    var _basePlacement = getBasePlacement(placement);
                    var isStartVariation = getVariation(placement) === start2;
                    var isVertical = [enums_top, bottom].indexOf(_basePlacement) >= 0;
                    var len = isVertical ? "width" : "height";
                    var overflow = detectOverflow(state, {
                      placement,
                      boundary,
                      rootBoundary,
                      altBoundary,
                      padding
                    });
                    var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : enums_top;
                    if (referenceRect[len] > popperRect[len]) {
                      mainVariationSide = getOppositePlacement(mainVariationSide);
                    }
                    var altVariationSide = getOppositePlacement(mainVariationSide);
                    var checks = [];
                    if (checkMainAxis) {
                      checks.push(overflow[_basePlacement] <= 0);
                    }
                    if (checkAltAxis) {
                      checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
                    }
                    if (checks.every(function(check) {
                      return check;
                    })) {
                      firstFittingPlacement = placement;
                      makeFallbackChecks = false;
                      break;
                    }
                    checksMap.set(placement, checks);
                  }
                  if (makeFallbackChecks) {
                    var numberOfChecks = flipVariations ? 3 : 1;
                    var _loop = function _loop2(_i2) {
                      var fittingPlacement = placements.find(function(placement2) {
                        var checks2 = checksMap.get(placement2);
                        if (checks2) {
                          return checks2.slice(0, _i2).every(function(check) {
                            return check;
                          });
                        }
                      });
                      if (fittingPlacement) {
                        firstFittingPlacement = fittingPlacement;
                        return "break";
                      }
                    };
                    for (var _i = numberOfChecks; _i > 0; _i--) {
                      var _ret = _loop(_i);
                      if (_ret === "break") break;
                    }
                  }
                  if (state.placement !== firstFittingPlacement) {
                    state.modifiersData[name]._skip = true;
                    state.placement = firstFittingPlacement;
                    state.reset = true;
                  }
                }
                var modifiers_flip = {
                  name: "flip",
                  enabled: true,
                  phase: "main",
                  fn: flip,
                  requiresIfExists: ["offset"],
                  data: {
                    _skip: false
                  }
                };
                ;
                function getSideOffsets(overflow, rect, preventedOffsets) {
                  if (preventedOffsets === void 0) {
                    preventedOffsets = {
                      x: 0,
                      y: 0
                    };
                  }
                  return {
                    top: overflow.top - rect.height - preventedOffsets.y,
                    right: overflow.right - rect.width + preventedOffsets.x,
                    bottom: overflow.bottom - rect.height + preventedOffsets.y,
                    left: overflow.left - rect.width - preventedOffsets.x
                  };
                }
                function isAnySideFullyClipped(overflow) {
                  return [enums_top, right, bottom, left].some(function(side) {
                    return overflow[side] >= 0;
                  });
                }
                function hide(_ref) {
                  var state = _ref.state, name = _ref.name;
                  var referenceRect = state.rects.reference;
                  var popperRect = state.rects.popper;
                  var preventedOffsets = state.modifiersData.preventOverflow;
                  var referenceOverflow = detectOverflow(state, {
                    elementContext: "reference"
                  });
                  var popperAltOverflow = detectOverflow(state, {
                    altBoundary: true
                  });
                  var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
                  var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
                  var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
                  var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
                  state.modifiersData[name] = {
                    referenceClippingOffsets,
                    popperEscapeOffsets,
                    isReferenceHidden,
                    hasPopperEscaped
                  };
                  state.attributes.popper = Object.assign({}, state.attributes.popper, {
                    "data-popper-reference-hidden": isReferenceHidden,
                    "data-popper-escaped": hasPopperEscaped
                  });
                }
                var modifiers_hide = {
                  name: "hide",
                  enabled: true,
                  phase: "main",
                  requiresIfExists: ["preventOverflow"],
                  fn: hide
                };
                ;
                function distanceAndSkiddingToXY(placement, rects, offset2) {
                  var basePlacement = getBasePlacement(placement);
                  var invertDistance = [left, enums_top].indexOf(basePlacement) >= 0 ? -1 : 1;
                  var _ref = typeof offset2 === "function" ? offset2(Object.assign({}, rects, {
                    placement
                  })) : offset2, skidding = _ref[0], distance = _ref[1];
                  skidding = skidding || 0;
                  distance = (distance || 0) * invertDistance;
                  return [left, right].indexOf(basePlacement) >= 0 ? {
                    x: distance,
                    y: skidding
                  } : {
                    x: skidding,
                    y: distance
                  };
                }
                function offset(_ref2) {
                  var state = _ref2.state, options = _ref2.options, name = _ref2.name;
                  var _options$offset = options.offset, offset2 = _options$offset === void 0 ? [0, 0] : _options$offset;
                  var data = enums_placements.reduce(function(acc, placement) {
                    acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset2);
                    return acc;
                  }, {});
                  var _data$state$placement = data[state.placement], x = _data$state$placement.x, y = _data$state$placement.y;
                  if (state.modifiersData.popperOffsets != null) {
                    state.modifiersData.popperOffsets.x += x;
                    state.modifiersData.popperOffsets.y += y;
                  }
                  state.modifiersData[name] = data;
                }
                var modifiers_offset = {
                  name: "offset",
                  enabled: true,
                  phase: "main",
                  requires: ["popperOffsets"],
                  fn: offset
                };
                ;
                function popperOffsets(_ref) {
                  var state = _ref.state, name = _ref.name;
                  state.modifiersData[name] = computeOffsets({
                    reference: state.rects.reference,
                    element: state.rects.popper,
                    strategy: "absolute",
                    placement: state.placement
                  });
                }
                var modifiers_popperOffsets = {
                  name: "popperOffsets",
                  enabled: true,
                  phase: "read",
                  fn: popperOffsets,
                  data: {}
                };
                ;
                function getAltAxis(axis) {
                  return axis === "x" ? "y" : "x";
                }
                ;
                function preventOverflow(_ref) {
                  var state = _ref.state, options = _ref.options, name = _ref.name;
                  var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, padding = options.padding, _options$tether = options.tether, tether = _options$tether === void 0 ? true : _options$tether, _options$tetherOffset = options.tetherOffset, tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
                  var overflow = detectOverflow(state, {
                    boundary,
                    rootBoundary,
                    padding,
                    altBoundary
                  });
                  var basePlacement = getBasePlacement(state.placement);
                  var variation = getVariation(state.placement);
                  var isBasePlacement = !variation;
                  var mainAxis = getMainAxisFromPlacement(basePlacement);
                  var altAxis = getAltAxis(mainAxis);
                  var popperOffsets2 = state.modifiersData.popperOffsets;
                  var referenceRect = state.rects.reference;
                  var popperRect = state.rects.popper;
                  var tetherOffsetValue = typeof tetherOffset === "function" ? tetherOffset(Object.assign({}, state.rects, {
                    placement: state.placement
                  })) : tetherOffset;
                  var normalizedTetherOffsetValue = typeof tetherOffsetValue === "number" ? {
                    mainAxis: tetherOffsetValue,
                    altAxis: tetherOffsetValue
                  } : Object.assign({
                    mainAxis: 0,
                    altAxis: 0
                  }, tetherOffsetValue);
                  var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
                  var data = {
                    x: 0,
                    y: 0
                  };
                  if (!popperOffsets2) {
                    return;
                  }
                  if (checkMainAxis) {
                    var _offsetModifierState$;
                    var mainSide = mainAxis === "y" ? enums_top : left;
                    var altSide = mainAxis === "y" ? bottom : right;
                    var len = mainAxis === "y" ? "height" : "width";
                    var offset2 = popperOffsets2[mainAxis];
                    var min = offset2 + overflow[mainSide];
                    var max = offset2 - overflow[altSide];
                    var additive = tether ? -popperRect[len] / 2 : 0;
                    var minLen = variation === start2 ? referenceRect[len] : popperRect[len];
                    var maxLen = variation === start2 ? -popperRect[len] : -referenceRect[len];
                    var arrowElement = state.elements.arrow;
                    var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
                      width: 0,
                      height: 0
                    };
                    var arrowPaddingObject = state.modifiersData["arrow#persistent"] ? state.modifiersData["arrow#persistent"].padding : getFreshSideObject();
                    var arrowPaddingMin = arrowPaddingObject[mainSide];
                    var arrowPaddingMax = arrowPaddingObject[altSide];
                    var arrowLen = within(0, referenceRect[len], arrowRect[len]);
                    var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
                    var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
                    var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
                    var clientOffset = arrowOffsetParent ? mainAxis === "y" ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
                    var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
                    var tetherMin = offset2 + minOffset - offsetModifierValue - clientOffset;
                    var tetherMax = offset2 + maxOffset - offsetModifierValue;
                    var preventedOffset = within(tether ? math_min(min, tetherMin) : min, offset2, tether ? math_max(max, tetherMax) : max);
                    popperOffsets2[mainAxis] = preventedOffset;
                    data[mainAxis] = preventedOffset - offset2;
                  }
                  if (checkAltAxis) {
                    var _offsetModifierState$2;
                    var _mainSide = mainAxis === "x" ? enums_top : left;
                    var _altSide = mainAxis === "x" ? bottom : right;
                    var _offset = popperOffsets2[altAxis];
                    var _len = altAxis === "y" ? "height" : "width";
                    var _min = _offset + overflow[_mainSide];
                    var _max = _offset - overflow[_altSide];
                    var isOriginSide = [enums_top, left].indexOf(basePlacement) !== -1;
                    var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;
                    var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;
                    var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;
                    var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);
                    popperOffsets2[altAxis] = _preventedOffset;
                    data[altAxis] = _preventedOffset - _offset;
                  }
                  state.modifiersData[name] = data;
                }
                var modifiers_preventOverflow = {
                  name: "preventOverflow",
                  enabled: true,
                  phase: "main",
                  fn: preventOverflow,
                  requiresIfExists: ["offset"]
                };
                ;
                ;
                function getHTMLElementScroll(element) {
                  return {
                    scrollLeft: element.scrollLeft,
                    scrollTop: element.scrollTop
                  };
                }
                ;
                function getNodeScroll(node) {
                  if (node === getWindow(node) || !isHTMLElement(node)) {
                    return getWindowScroll(node);
                  } else {
                    return getHTMLElementScroll(node);
                  }
                }
                ;
                function isElementScaled(element) {
                  var rect = element.getBoundingClientRect();
                  var scaleX = round(rect.width) / element.offsetWidth || 1;
                  var scaleY = round(rect.height) / element.offsetHeight || 1;
                  return scaleX !== 1 || scaleY !== 1;
                }
                function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
                  if (isFixed === void 0) {
                    isFixed = false;
                  }
                  var isOffsetParentAnElement = isHTMLElement(offsetParent);
                  var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
                  var documentElement = getDocumentElement(offsetParent);
                  var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
                  var scroll = {
                    scrollLeft: 0,
                    scrollTop: 0
                  };
                  var offsets = {
                    x: 0,
                    y: 0
                  };
                  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
                    if (getNodeName(offsetParent) !== "body" || // https://github.com/popperjs/popper-core/issues/1078
                    isScrollParent(documentElement)) {
                      scroll = getNodeScroll(offsetParent);
                    }
                    if (isHTMLElement(offsetParent)) {
                      offsets = getBoundingClientRect(offsetParent, true);
                      offsets.x += offsetParent.clientLeft;
                      offsets.y += offsetParent.clientTop;
                    } else if (documentElement) {
                      offsets.x = getWindowScrollBarX(documentElement);
                    }
                  }
                  return {
                    x: rect.left + scroll.scrollLeft - offsets.x,
                    y: rect.top + scroll.scrollTop - offsets.y,
                    width: rect.width,
                    height: rect.height
                  };
                }
                ;
                function order(modifiers) {
                  var map = /* @__PURE__ */ new Map();
                  var visited = /* @__PURE__ */ new Set();
                  var result = [];
                  modifiers.forEach(function(modifier) {
                    map.set(modifier.name, modifier);
                  });
                  function sort(modifier) {
                    visited.add(modifier.name);
                    var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
                    requires.forEach(function(dep) {
                      if (!visited.has(dep)) {
                        var depModifier = map.get(dep);
                        if (depModifier) {
                          sort(depModifier);
                        }
                      }
                    });
                    result.push(modifier);
                  }
                  modifiers.forEach(function(modifier) {
                    if (!visited.has(modifier.name)) {
                      sort(modifier);
                    }
                  });
                  return result;
                }
                function orderModifiers(modifiers) {
                  var orderedModifiers = order(modifiers);
                  return modifierPhases.reduce(function(acc, phase) {
                    return acc.concat(orderedModifiers.filter(function(modifier) {
                      return modifier.phase === phase;
                    }));
                  }, []);
                }
                ;
                function debounce2(fn) {
                  var pending;
                  return function() {
                    if (!pending) {
                      pending = new Promise(function(resolve) {
                        Promise.resolve().then(function() {
                          pending = void 0;
                          resolve(fn());
                        });
                      });
                    }
                    return pending;
                  };
                }
                ;
                function mergeByName(modifiers) {
                  var merged = modifiers.reduce(function(merged2, current) {
                    var existing = merged2[current.name];
                    merged2[current.name] = existing ? Object.assign({}, existing, current, {
                      options: Object.assign({}, existing.options, current.options),
                      data: Object.assign({}, existing.data, current.data)
                    }) : current;
                    return merged2;
                  }, {});
                  return Object.keys(merged).map(function(key) {
                    return merged[key];
                  });
                }
                ;
                var INVALID_ELEMENT_ERROR = "Popper: Invalid reference or popper argument provided. They must be either a DOM element or virtual element.";
                var INFINITE_LOOP_ERROR = "Popper: An infinite loop in the modifiers cycle has been detected! The cycle has been interrupted to prevent a browser crash.";
                var DEFAULT_OPTIONS = {
                  placement: "bottom",
                  modifiers: [],
                  strategy: "absolute"
                };
                function areValidElements() {
                  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                  }
                  return !args.some(function(element) {
                    return !(element && typeof element.getBoundingClientRect === "function");
                  });
                }
                function popperGenerator(generatorOptions) {
                  if (generatorOptions === void 0) {
                    generatorOptions = {};
                  }
                  var _generatorOptions = generatorOptions, _generatorOptions$def = _generatorOptions.defaultModifiers, defaultModifiers2 = _generatorOptions$def === void 0 ? [] : _generatorOptions$def, _generatorOptions$def2 = _generatorOptions.defaultOptions, defaultOptions2 = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
                  return function createPopper2(reference2, popper2, options) {
                    if (options === void 0) {
                      options = defaultOptions2;
                    }
                    var state = {
                      placement: "bottom",
                      orderedModifiers: [],
                      options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions2),
                      modifiersData: {},
                      elements: {
                        reference: reference2,
                        popper: popper2
                      },
                      attributes: {},
                      styles: {}
                    };
                    var effectCleanupFns = [];
                    var isDestroyed = false;
                    var instance = {
                      state,
                      setOptions: function setOptions(setOptionsAction) {
                        var options2 = typeof setOptionsAction === "function" ? setOptionsAction(state.options) : setOptionsAction;
                        cleanupModifierEffects();
                        state.options = Object.assign({}, defaultOptions2, state.options, options2);
                        state.scrollParents = {
                          reference: isElement(reference2) ? listScrollParents(reference2) : reference2.contextElement ? listScrollParents(reference2.contextElement) : [],
                          popper: listScrollParents(popper2)
                        };
                        var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers2, state.options.modifiers)));
                        state.orderedModifiers = orderedModifiers.filter(function(m) {
                          return m.enabled;
                        });
                        if (false) {
                          var _getComputedStyle, marginTop, marginRight, marginBottom, marginLeft, flipModifier, modifiers;
                        }
                        runModifierEffects();
                        return instance.update();
                      },
                      // Sync update – it will always be executed, even if not necessary. This
                      // is useful for low frequency updates where sync behavior simplifies the
                      // logic.
                      // For high frequency updates (e.g. `resize` and `scroll` events), always
                      // prefer the async Popper#update method
                      forceUpdate: function forceUpdate() {
                        if (isDestroyed) {
                          return;
                        }
                        var _state$elements = state.elements, reference3 = _state$elements.reference, popper3 = _state$elements.popper;
                        if (!areValidElements(reference3, popper3)) {
                          if (false) {
                          }
                          return;
                        }
                        state.rects = {
                          reference: getCompositeRect(reference3, getOffsetParent(popper3), state.options.strategy === "fixed"),
                          popper: getLayoutRect(popper3)
                        };
                        state.reset = false;
                        state.placement = state.options.placement;
                        state.orderedModifiers.forEach(function(modifier) {
                          return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
                        });
                        var __debug_loops__ = 0;
                        for (var index = 0; index < state.orderedModifiers.length; index++) {
                          if (false) {
                          }
                          if (state.reset === true) {
                            state.reset = false;
                            index = -1;
                            continue;
                          }
                          var _state$orderedModifie = state.orderedModifiers[index], fn = _state$orderedModifie.fn, _state$orderedModifie2 = _state$orderedModifie.options, _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2, name = _state$orderedModifie.name;
                          if (typeof fn === "function") {
                            state = fn({
                              state,
                              options: _options,
                              name,
                              instance
                            }) || state;
                          }
                        }
                      },
                      // Async and optimistically optimized update – it will not be executed if
                      // not necessary (debounced to run at most once-per-tick)
                      update: debounce2(function() {
                        return new Promise(function(resolve) {
                          instance.forceUpdate();
                          resolve(state);
                        });
                      }),
                      destroy: function destroy() {
                        cleanupModifierEffects();
                        isDestroyed = true;
                      }
                    };
                    if (!areValidElements(reference2, popper2)) {
                      if (false) {
                      }
                      return instance;
                    }
                    instance.setOptions(options).then(function(state2) {
                      if (!isDestroyed && options.onFirstUpdate) {
                        options.onFirstUpdate(state2);
                      }
                    });
                    function runModifierEffects() {
                      state.orderedModifiers.forEach(function(_ref3) {
                        var name = _ref3.name, _ref3$options = _ref3.options, options2 = _ref3$options === void 0 ? {} : _ref3$options, effect2 = _ref3.effect;
                        if (typeof effect2 === "function") {
                          var cleanupFn = effect2({
                            state,
                            name,
                            instance,
                            options: options2
                          });
                          var noopFn = function noopFn2() {
                          };
                          effectCleanupFns.push(cleanupFn || noopFn);
                        }
                      });
                    }
                    function cleanupModifierEffects() {
                      effectCleanupFns.forEach(function(fn) {
                        return fn();
                      });
                      effectCleanupFns = [];
                    }
                    return instance;
                  };
                }
                var createPopper = /* @__PURE__ */ popperGenerator();
                ;
                var defaultModifiers = [eventListeners, modifiers_popperOffsets, modifiers_computeStyles, modifiers_applyStyles, modifiers_offset, modifiers_flip, modifiers_preventOverflow, modifiers_arrow, modifiers_hide];
                var popper_createPopper = /* @__PURE__ */ popperGenerator({
                  defaultModifiers
                });
                ;
                var popper_lite_defaultModifiers = [eventListeners, modifiers_popperOffsets, modifiers_computeStyles, modifiers_applyStyles];
                var popper_lite_createPopper = /* @__PURE__ */ popperGenerator({
                  defaultModifiers: popper_lite_defaultModifiers
                });
                ;
              })
            ),
            /***/
            554: (
              /***/
              (function(__unused_webpack_module, exports2) {
                Object.defineProperty(exports2, "__esModule", { value: true });
                function _arrayLikeToArray(r, a) {
                  (null == a || a > r.length) && (a = r.length);
                  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
                  return n;
                }
                function _arrayWithHoles(r) {
                  if (Array.isArray(r)) return r;
                }
                function _arrayWithoutHoles(r) {
                  if (Array.isArray(r)) return _arrayLikeToArray(r);
                }
                function _assertThisInitialized(e) {
                  if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                  return e;
                }
                function _callSuper(t, o, e) {
                  return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
                }
                function _classCallCheck(a, n) {
                  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
                }
                function _defineProperties(e, r) {
                  for (var t = 0; t < r.length; t++) {
                    var o = r[t];
                    o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey(o.key), o);
                  }
                }
                function _createClass(e, r, t) {
                  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
                    writable: false
                  }), e;
                }
                function _get() {
                  return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function(e, t, r) {
                    var p = _superPropBase(e, t);
                    if (p) {
                      var n = Object.getOwnPropertyDescriptor(p, t);
                      return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value;
                    }
                  }, _get.apply(null, arguments);
                }
                function _getPrototypeOf(t) {
                  return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t2) {
                    return t2.__proto__ || Object.getPrototypeOf(t2);
                  }, _getPrototypeOf(t);
                }
                function _inherits(t, e) {
                  if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
                  t.prototype = Object.create(e && e.prototype, {
                    constructor: {
                      value: t,
                      writable: true,
                      configurable: true
                    }
                  }), Object.defineProperty(t, "prototype", {
                    writable: false
                  }), e && _setPrototypeOf(t, e);
                }
                function _isNativeReflectConstruct() {
                  try {
                    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
                    }));
                  } catch (t2) {
                  }
                  return (_isNativeReflectConstruct = function() {
                    return !!t;
                  })();
                }
                function _iterableToArray(r) {
                  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
                }
                function _iterableToArrayLimit(r, l) {
                  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
                  if (null != t) {
                    var e, n, i, u, a = [], f = true, o = false;
                    try {
                      if (i = (t = t.call(r)).next, 0 === l) {
                        if (Object(t) !== t) return;
                        f = false;
                      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
                    } catch (r2) {
                      o = true, n = r2;
                    } finally {
                      try {
                        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
                      } finally {
                        if (o) throw n;
                      }
                    }
                    return a;
                  }
                }
                function _nonIterableRest() {
                  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                }
                function _nonIterableSpread() {
                  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                }
                function _possibleConstructorReturn(t, e) {
                  if (e && ("object" == typeof e || "function" == typeof e)) return e;
                  if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
                  return _assertThisInitialized(t);
                }
                function _setPrototypeOf(t, e) {
                  return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(t2, e2) {
                    return t2.__proto__ = e2, t2;
                  }, _setPrototypeOf(t, e);
                }
                function _slicedToArray(r, e) {
                  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
                }
                function _superPropBase(t, o) {
                  for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t)); ) ;
                  return t;
                }
                function _toConsumableArray(r) {
                  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
                }
                function _toPrimitive(t, r) {
                  if ("object" != typeof t || !t) return t;
                  var e = t[Symbol.toPrimitive];
                  if (void 0 !== e) {
                    var i = e.call(t, r || "default");
                    if ("object" != typeof i) return i;
                    throw new TypeError("@@toPrimitive must return a primitive value.");
                  }
                  return ("string" === r ? String : Number)(t);
                }
                function _toPropertyKey(t) {
                  var i = _toPrimitive(t, "string");
                  return "symbol" == typeof i ? i : i + "";
                }
                function _typeof(o) {
                  "@babel/helpers - typeof";
                  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
                    return typeof o2;
                  } : function(o2) {
                    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
                  }, _typeof(o);
                }
                function _unsupportedIterableToArray(r, a) {
                  if (r) {
                    if ("string" == typeof r) return _arrayLikeToArray(r, a);
                    var t = {}.toString.call(r).slice(8, -1);
                    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
                  }
                }
                function hasProperty2(obj, prop) {
                  return Object.prototype.hasOwnProperty.call(obj, prop);
                }
                function lastItemOf(arr) {
                  return arr[arr.length - 1];
                }
                function pushUnique(arr) {
                  for (var _len = arguments.length, items = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    items[_key - 1] = arguments[_key];
                  }
                  items.forEach(function(item) {
                    if (arr.includes(item)) {
                      return;
                    }
                    arr.push(item);
                  });
                  return arr;
                }
                function stringToArray(str, separator) {
                  return str ? str.split(separator) : [];
                }
                function isInRange(testVal, min, max) {
                  var minOK = min === void 0 || testVal >= min;
                  var maxOK = max === void 0 || testVal <= max;
                  return minOK && maxOK;
                }
                function limitToRange(val, min, max) {
                  if (val < min) {
                    return min;
                  }
                  if (val > max) {
                    return max;
                  }
                  return val;
                }
                function createTagRepeat(tagName, repeat) {
                  var attributes = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
                  var index = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
                  var html = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : "";
                  var openTagSrc = Object.keys(attributes).reduce(function(src, attr) {
                    var val = attributes[attr];
                    if (typeof val === "function") {
                      val = val(index);
                    }
                    return "".concat(src, " ").concat(attr, '="').concat(val, '"');
                  }, tagName);
                  html += "<".concat(openTagSrc, "></").concat(tagName, ">");
                  var next = index + 1;
                  return next < repeat ? createTagRepeat(tagName, repeat, attributes, next, html) : html;
                }
                function optimizeTemplateHTML(html) {
                  return html.replace(/>\s+/g, ">").replace(/\s+</, "<");
                }
                function stripTime(timeValue) {
                  return new Date(timeValue).setHours(0, 0, 0, 0);
                }
                function today() {
                  return (/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0);
                }
                function dateValue() {
                  switch (arguments.length) {
                    case 0:
                      return today();
                    case 1:
                      return stripTime(arguments.length <= 0 ? void 0 : arguments[0]);
                  }
                  var newDate = /* @__PURE__ */ new Date(0);
                  newDate.setFullYear.apply(newDate, arguments);
                  return newDate.setHours(0, 0, 0, 0);
                }
                function addDays(date, amount) {
                  var newDate = new Date(date);
                  return newDate.setDate(newDate.getDate() + amount);
                }
                function addWeeks(date, amount) {
                  return addDays(date, amount * 7);
                }
                function addMonths(date, amount) {
                  var newDate = new Date(date);
                  var monthsToSet = newDate.getMonth() + amount;
                  var expectedMonth = monthsToSet % 12;
                  if (expectedMonth < 0) {
                    expectedMonth += 12;
                  }
                  var time = newDate.setMonth(monthsToSet);
                  return newDate.getMonth() !== expectedMonth ? newDate.setDate(0) : time;
                }
                function addYears(date, amount) {
                  var newDate = new Date(date);
                  var expectedMonth = newDate.getMonth();
                  var time = newDate.setFullYear(newDate.getFullYear() + amount);
                  return expectedMonth === 1 && newDate.getMonth() === 2 ? newDate.setDate(0) : time;
                }
                function dayDiff(day, from) {
                  return (day - from + 7) % 7;
                }
                function dayOfTheWeekOf(baseDate, dayOfWeek) {
                  var weekStart = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0;
                  var baseDay = new Date(baseDate).getDay();
                  return addDays(baseDate, dayDiff(dayOfWeek, weekStart) - dayDiff(baseDay, weekStart));
                }
                function getWeek(date) {
                  var thuOfTheWeek = dayOfTheWeekOf(date, 4, 1);
                  var firstThu = dayOfTheWeekOf(new Date(thuOfTheWeek).setMonth(0, 4), 4, 1);
                  return Math.round((thuOfTheWeek - firstThu) / 6048e5) + 1;
                }
                function startOfYearPeriod(date, years) {
                  var year = new Date(date).getFullYear();
                  return Math.floor(year / years) * years;
                }
                var reFormatTokens = /dd?|DD?|mm?|MM?|yy?(?:yy)?/;
                var reNonDateParts = /[\s!-/:-@[-`{-~年月日]+/;
                var knownFormats = {};
                var parseFns = {
                  y: function y(date, year) {
                    return new Date(date).setFullYear(parseInt(year, 10));
                  },
                  m: function m(date, month, locale) {
                    var newDate = new Date(date);
                    var monthIndex = parseInt(month, 10) - 1;
                    if (isNaN(monthIndex)) {
                      if (!month) {
                        return NaN;
                      }
                      var monthName = month.toLowerCase();
                      var compareNames = function compareNames2(name) {
                        return name.toLowerCase().startsWith(monthName);
                      };
                      monthIndex = locale.monthsShort.findIndex(compareNames);
                      if (monthIndex < 0) {
                        monthIndex = locale.months.findIndex(compareNames);
                      }
                      if (monthIndex < 0) {
                        return NaN;
                      }
                    }
                    newDate.setMonth(monthIndex);
                    return newDate.getMonth() !== normalizeMonth(monthIndex) ? newDate.setDate(0) : newDate.getTime();
                  },
                  d: function d(date, day) {
                    return new Date(date).setDate(parseInt(day, 10));
                  }
                };
                var formatFns = {
                  d: function d(date) {
                    return date.getDate();
                  },
                  dd: function dd(date) {
                    return padZero(date.getDate(), 2);
                  },
                  D: function D(date, locale) {
                    return locale.daysShort[date.getDay()];
                  },
                  DD: function DD(date, locale) {
                    return locale.days[date.getDay()];
                  },
                  m: function m(date) {
                    return date.getMonth() + 1;
                  },
                  mm: function mm(date) {
                    return padZero(date.getMonth() + 1, 2);
                  },
                  M: function M(date, locale) {
                    return locale.monthsShort[date.getMonth()];
                  },
                  MM: function MM(date, locale) {
                    return locale.months[date.getMonth()];
                  },
                  y: function y(date) {
                    return date.getFullYear();
                  },
                  yy: function yy(date) {
                    return padZero(date.getFullYear(), 2).slice(-2);
                  },
                  yyyy: function yyyy(date) {
                    return padZero(date.getFullYear(), 4);
                  }
                };
                function normalizeMonth(monthIndex) {
                  return monthIndex > -1 ? monthIndex % 12 : normalizeMonth(monthIndex + 12);
                }
                function padZero(num, length) {
                  return num.toString().padStart(length, "0");
                }
                function parseFormatString(format) {
                  if (typeof format !== "string") {
                    throw new Error("Invalid date format.");
                  }
                  if (format in knownFormats) {
                    return knownFormats[format];
                  }
                  var separators = format.split(reFormatTokens);
                  var parts = format.match(new RegExp(reFormatTokens, "g"));
                  if (separators.length === 0 || !parts) {
                    throw new Error("Invalid date format.");
                  }
                  var partFormatters = parts.map(function(token) {
                    return formatFns[token];
                  });
                  var partParserKeys = Object.keys(parseFns).reduce(function(keys, key) {
                    var token = parts.find(function(part) {
                      return part[0] !== "D" && part[0].toLowerCase() === key;
                    });
                    if (token) {
                      keys.push(key);
                    }
                    return keys;
                  }, []);
                  return knownFormats[format] = {
                    parser: function parser(dateStr, locale) {
                      var dateParts = dateStr.split(reNonDateParts).reduce(function(dtParts, part, index) {
                        if (part.length > 0 && parts[index]) {
                          var token = parts[index][0];
                          if (token === "M") {
                            dtParts.m = part;
                          } else if (token !== "D") {
                            dtParts[token] = part;
                          }
                        }
                        return dtParts;
                      }, {});
                      return partParserKeys.reduce(function(origDate, key) {
                        var newDate = parseFns[key](origDate, dateParts[key], locale);
                        return isNaN(newDate) ? origDate : newDate;
                      }, today());
                    },
                    formatter: function formatter(date, locale) {
                      var dateStr = partFormatters.reduce(function(str, fn, index) {
                        return str += "".concat(separators[index]).concat(fn(date, locale));
                      }, "");
                      return dateStr += lastItemOf(separators);
                    }
                  };
                }
                function parseDate(dateStr, format, locale) {
                  if (dateStr instanceof Date || typeof dateStr === "number") {
                    var date = stripTime(dateStr);
                    return isNaN(date) ? void 0 : date;
                  }
                  if (!dateStr) {
                    return void 0;
                  }
                  if (dateStr === "today") {
                    return today();
                  }
                  if (format && format.toValue) {
                    var _date = format.toValue(dateStr, format, locale);
                    return isNaN(_date) ? void 0 : stripTime(_date);
                  }
                  return parseFormatString(format).parser(dateStr, locale);
                }
                function formatDate(date, format, locale) {
                  if (isNaN(date) || !date && date !== 0) {
                    return "";
                  }
                  var dateObj = typeof date === "number" ? new Date(date) : date;
                  if (format.toDisplay) {
                    return format.toDisplay(dateObj, format, locale);
                  }
                  return parseFormatString(format).formatter(dateObj, locale);
                }
                var listenerRegistry = /* @__PURE__ */ new WeakMap();
                var _EventTarget$prototyp = EventTarget.prototype, addEventListener2 = _EventTarget$prototyp.addEventListener, removeEventListener2 = _EventTarget$prototyp.removeEventListener;
                function registerListeners(keyObj, listeners) {
                  var registered = listenerRegistry.get(keyObj);
                  if (!registered) {
                    registered = [];
                    listenerRegistry.set(keyObj, registered);
                  }
                  listeners.forEach(function(listener) {
                    addEventListener2.call.apply(addEventListener2, _toConsumableArray(listener));
                    registered.push(listener);
                  });
                }
                function unregisterListeners(keyObj) {
                  var listeners = listenerRegistry.get(keyObj);
                  if (!listeners) {
                    return;
                  }
                  listeners.forEach(function(listener) {
                    removeEventListener2.call.apply(removeEventListener2, _toConsumableArray(listener));
                  });
                  listenerRegistry["delete"](keyObj);
                }
                if (!Event.prototype.composedPath) {
                  var getComposedPath = function getComposedPath2(node) {
                    var path = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [];
                    path.push(node);
                    var parent;
                    if (node.parentNode) {
                      parent = node.parentNode;
                    } else if (node.host) {
                      parent = node.host;
                    } else if (node.defaultView) {
                      parent = node.defaultView;
                    }
                    return parent ? getComposedPath2(parent, path) : path;
                  };
                  Event.prototype.composedPath = function() {
                    return getComposedPath(this.target);
                  };
                }
                function findFromPath(path, criteria, currentTarget) {
                  var index = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
                  var el = path[index];
                  if (criteria(el)) {
                    return el;
                  } else if (el === currentTarget || !el.parentElement) {
                    return;
                  }
                  return findFromPath(path, criteria, currentTarget, index + 1);
                }
                function findElementInEventPath(ev, selector) {
                  var criteria = typeof selector === "function" ? selector : function(el) {
                    return el.matches(selector);
                  };
                  return findFromPath(ev.composedPath(), criteria, ev.currentTarget);
                }
                var locales = {
                  en: {
                    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                    daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                    daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
                    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                    monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                    today: "Today",
                    clear: "Clear",
                    titleFormat: "MM y"
                  }
                };
                var defaultOptions2 = {
                  autohide: false,
                  beforeShowDay: null,
                  beforeShowDecade: null,
                  beforeShowMonth: null,
                  beforeShowYear: null,
                  calendarWeeks: false,
                  clearBtn: false,
                  dateDelimiter: ",",
                  datesDisabled: [],
                  daysOfWeekDisabled: [],
                  daysOfWeekHighlighted: [],
                  defaultViewDate: void 0,
                  // placeholder, defaults to today() by the program
                  disableTouchKeyboard: false,
                  format: "mm/dd/yyyy",
                  language: "en",
                  maxDate: null,
                  maxNumberOfDates: 1,
                  maxView: 3,
                  minDate: null,
                  nextArrow: '<svg class="w-4 h-4 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/></svg>',
                  orientation: "auto",
                  pickLevel: 0,
                  prevArrow: '<svg class="w-4 h-4 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5H1m0 0 4 4M1 5l4-4"/></svg>',
                  showDaysOfWeek: true,
                  showOnClick: true,
                  showOnFocus: true,
                  startView: 0,
                  title: "",
                  todayBtn: false,
                  todayBtnMode: 0,
                  todayHighlight: false,
                  updateOnBlur: true,
                  weekStart: 0
                };
                var range = null;
                function parseHTML(html) {
                  if (range == null) {
                    range = document.createRange();
                  }
                  return range.createContextualFragment(html);
                }
                function hideElement(el) {
                  if (el.style.display === "none") {
                    return;
                  }
                  if (el.style.display) {
                    el.dataset.styleDisplay = el.style.display;
                  }
                  el.style.display = "none";
                }
                function showElement(el) {
                  if (el.style.display !== "none") {
                    return;
                  }
                  if (el.dataset.styleDisplay) {
                    el.style.display = el.dataset.styleDisplay;
                    delete el.dataset.styleDisplay;
                  } else {
                    el.style.display = "";
                  }
                }
                function emptyChildNodes(el) {
                  if (el.firstChild) {
                    el.removeChild(el.firstChild);
                    emptyChildNodes(el);
                  }
                }
                function replaceChildNodes(el, newChildNodes) {
                  emptyChildNodes(el);
                  if (newChildNodes instanceof DocumentFragment) {
                    el.appendChild(newChildNodes);
                  } else if (typeof newChildNodes === "string") {
                    el.appendChild(parseHTML(newChildNodes));
                  } else if (typeof newChildNodes.forEach === "function") {
                    newChildNodes.forEach(function(node) {
                      el.appendChild(node);
                    });
                  }
                }
                var defaultLang = defaultOptions2.language, defaultFormat = defaultOptions2.format, defaultWeekStart = defaultOptions2.weekStart;
                function sanitizeDOW(dow, day) {
                  return dow.length < 6 && day >= 0 && day < 7 ? pushUnique(dow, day) : dow;
                }
                function calcEndOfWeek(startOfWeek) {
                  return (startOfWeek + 6) % 7;
                }
                function validateDate(value, format, locale, origValue) {
                  var date = parseDate(value, format, locale);
                  return date !== void 0 ? date : origValue;
                }
                function validateViewId(value, origValue) {
                  var max = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 3;
                  var viewId = parseInt(value, 10);
                  return viewId >= 0 && viewId <= max ? viewId : origValue;
                }
                function processOptions(options, datepicker) {
                  var inOpts = Object.assign({}, options);
                  var config2 = {};
                  var locales2 = datepicker.constructor.locales;
                  var _ref = datepicker.config || {}, format = _ref.format, language = _ref.language, locale = _ref.locale, maxDate = _ref.maxDate, maxView = _ref.maxView, minDate = _ref.minDate, pickLevel = _ref.pickLevel, startView = _ref.startView, weekStart = _ref.weekStart;
                  if (inOpts.language) {
                    var lang;
                    if (inOpts.language !== language) {
                      if (locales2[inOpts.language]) {
                        lang = inOpts.language;
                      } else {
                        lang = inOpts.language.split("-")[0];
                        if (locales2[lang] === void 0) {
                          lang = false;
                        }
                      }
                    }
                    delete inOpts.language;
                    if (lang) {
                      language = config2.language = lang;
                      var origLocale = locale || locales2[defaultLang];
                      locale = Object.assign({
                        format: defaultFormat,
                        weekStart: defaultWeekStart
                      }, locales2[defaultLang]);
                      if (language !== defaultLang) {
                        Object.assign(locale, locales2[language]);
                      }
                      config2.locale = locale;
                      if (format === origLocale.format) {
                        format = config2.format = locale.format;
                      }
                      if (weekStart === origLocale.weekStart) {
                        weekStart = config2.weekStart = locale.weekStart;
                        config2.weekEnd = calcEndOfWeek(locale.weekStart);
                      }
                    }
                  }
                  if (inOpts.format) {
                    var hasToDisplay = typeof inOpts.format.toDisplay === "function";
                    var hasToValue = typeof inOpts.format.toValue === "function";
                    var validFormatString = reFormatTokens.test(inOpts.format);
                    if (hasToDisplay && hasToValue || validFormatString) {
                      format = config2.format = inOpts.format;
                    }
                    delete inOpts.format;
                  }
                  var minDt = minDate;
                  var maxDt = maxDate;
                  if (inOpts.minDate !== void 0) {
                    minDt = inOpts.minDate === null ? dateValue(0, 0, 1) : validateDate(inOpts.minDate, format, locale, minDt);
                    delete inOpts.minDate;
                  }
                  if (inOpts.maxDate !== void 0) {
                    maxDt = inOpts.maxDate === null ? void 0 : validateDate(inOpts.maxDate, format, locale, maxDt);
                    delete inOpts.maxDate;
                  }
                  if (maxDt < minDt) {
                    minDate = config2.minDate = maxDt;
                    maxDate = config2.maxDate = minDt;
                  } else {
                    if (minDate !== minDt) {
                      minDate = config2.minDate = minDt;
                    }
                    if (maxDate !== maxDt) {
                      maxDate = config2.maxDate = maxDt;
                    }
                  }
                  if (inOpts.datesDisabled) {
                    config2.datesDisabled = inOpts.datesDisabled.reduce(function(dates, dt) {
                      var date = parseDate(dt, format, locale);
                      return date !== void 0 ? pushUnique(dates, date) : dates;
                    }, []);
                    delete inOpts.datesDisabled;
                  }
                  if (inOpts.defaultViewDate !== void 0) {
                    var viewDate = parseDate(inOpts.defaultViewDate, format, locale);
                    if (viewDate !== void 0) {
                      config2.defaultViewDate = viewDate;
                    }
                    delete inOpts.defaultViewDate;
                  }
                  if (inOpts.weekStart !== void 0) {
                    var wkStart = Number(inOpts.weekStart) % 7;
                    if (!isNaN(wkStart)) {
                      weekStart = config2.weekStart = wkStart;
                      config2.weekEnd = calcEndOfWeek(wkStart);
                    }
                    delete inOpts.weekStart;
                  }
                  if (inOpts.daysOfWeekDisabled) {
                    config2.daysOfWeekDisabled = inOpts.daysOfWeekDisabled.reduce(sanitizeDOW, []);
                    delete inOpts.daysOfWeekDisabled;
                  }
                  if (inOpts.daysOfWeekHighlighted) {
                    config2.daysOfWeekHighlighted = inOpts.daysOfWeekHighlighted.reduce(sanitizeDOW, []);
                    delete inOpts.daysOfWeekHighlighted;
                  }
                  if (inOpts.maxNumberOfDates !== void 0) {
                    var maxNumberOfDates = parseInt(inOpts.maxNumberOfDates, 10);
                    if (maxNumberOfDates >= 0) {
                      config2.maxNumberOfDates = maxNumberOfDates;
                      config2.multidate = maxNumberOfDates !== 1;
                    }
                    delete inOpts.maxNumberOfDates;
                  }
                  if (inOpts.dateDelimiter) {
                    config2.dateDelimiter = String(inOpts.dateDelimiter);
                    delete inOpts.dateDelimiter;
                  }
                  var newPickLevel = pickLevel;
                  if (inOpts.pickLevel !== void 0) {
                    newPickLevel = validateViewId(inOpts.pickLevel, 2);
                    delete inOpts.pickLevel;
                  }
                  if (newPickLevel !== pickLevel) {
                    pickLevel = config2.pickLevel = newPickLevel;
                  }
                  var newMaxView = maxView;
                  if (inOpts.maxView !== void 0) {
                    newMaxView = validateViewId(inOpts.maxView, maxView);
                    delete inOpts.maxView;
                  }
                  newMaxView = pickLevel > newMaxView ? pickLevel : newMaxView;
                  if (newMaxView !== maxView) {
                    maxView = config2.maxView = newMaxView;
                  }
                  var newStartView = startView;
                  if (inOpts.startView !== void 0) {
                    newStartView = validateViewId(inOpts.startView, newStartView);
                    delete inOpts.startView;
                  }
                  if (newStartView < pickLevel) {
                    newStartView = pickLevel;
                  } else if (newStartView > maxView) {
                    newStartView = maxView;
                  }
                  if (newStartView !== startView) {
                    config2.startView = newStartView;
                  }
                  if (inOpts.prevArrow) {
                    var prevArrow = parseHTML(inOpts.prevArrow);
                    if (prevArrow.childNodes.length > 0) {
                      config2.prevArrow = prevArrow.childNodes;
                    }
                    delete inOpts.prevArrow;
                  }
                  if (inOpts.nextArrow) {
                    var nextArrow = parseHTML(inOpts.nextArrow);
                    if (nextArrow.childNodes.length > 0) {
                      config2.nextArrow = nextArrow.childNodes;
                    }
                    delete inOpts.nextArrow;
                  }
                  if (inOpts.disableTouchKeyboard !== void 0) {
                    config2.disableTouchKeyboard = "ontouchstart" in document && !!inOpts.disableTouchKeyboard;
                    delete inOpts.disableTouchKeyboard;
                  }
                  if (inOpts.orientation) {
                    var orientation = inOpts.orientation.toLowerCase().split(/\s+/g);
                    config2.orientation = {
                      x: orientation.find(function(x) {
                        return x === "left" || x === "right";
                      }) || "auto",
                      y: orientation.find(function(y) {
                        return y === "top" || y === "bottom";
                      }) || "auto"
                    };
                    delete inOpts.orientation;
                  }
                  if (inOpts.todayBtnMode !== void 0) {
                    switch (inOpts.todayBtnMode) {
                      case 0:
                      case 1:
                        config2.todayBtnMode = inOpts.todayBtnMode;
                    }
                    delete inOpts.todayBtnMode;
                  }
                  Object.keys(inOpts).forEach(function(key) {
                    if (inOpts[key] !== void 0 && hasProperty2(defaultOptions2, key)) {
                      config2[key] = inOpts[key];
                    }
                  });
                  return config2;
                }
                var pickerTemplate = optimizeTemplateHTML('<div class="datepicker hidden">\n  <div class="datepicker-picker inline-block rounded-base bg-neutral-primary-medium border border-default-medium p-4">\n    <div class="datepicker-header">\n      <div class="datepicker-title bg-neutral-primary-medium text-heading px-2 py-3 text-center font-medium"></div>\n      <div class="datepicker-controls flex justify-between mb-2">\n        <button type="button" class="bg-neutral-primary-medium rounded-base text-body hover:bg-neutral-tertiary-medium hover:text-heading text-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-neutral-tertiary prev-btn"></button>\n        <button type="button" class="text-sm rounded-base text-heading bg-neutral-primary-medium font-medium py-2.5 px-5 hover:bg-neutral-tertiary-medium focus:outline-none focus:ring-2 focus:ring-neutral-tertiary view-switch"></button>\n        <button type="button" class="bg-neutral-primary-medium rounded-base text-body hover:bg-neutral-tertiary-medium hover:text-heading text-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-neutral-tertiary next-btn"></button>\n      </div>\n    </div>\n    <div class="datepicker-main p-1"></div>\n    <div class="datepicker-footer">\n      <div class="datepicker-controls flex space-x-2 rtl:space-x-reverse mt-2">\n        <button type="button" class="%buttonClass% today-btn text-white bg-brand hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium font-medium rounded-base text-sm px-5 py-2 text-center w-1/2"></button>\n        <button type="button" class="%buttonClass% clear-btn text-body bg-neutral-secondary-medium border border-default-medium hover:bg-neutral-tertiary-medium focus:ring-4 focus:ring-neutral-tertiary font-medium rounded-base text-sm px-5 py-2 text-center w-1/2"></button>\n      </div>\n    </div>\n  </div>\n</div>');
                var daysTemplate = optimizeTemplateHTML('<div class="days">\n  <div class="days-of-week grid grid-cols-7 mb-1">'.concat(createTagRepeat("span", 7, {
                  "class": "dow block flex-1 leading-9 border-0 rounded-base cursor-default text-center text-body font-medium text-sm"
                }), '</div>\n  <div class="datepicker-grid w-64 grid grid-cols-7">').concat(createTagRepeat("span", 42, {
                  "class": "block flex-1 leading-9 border-0 rounded-base cursor-default text-center text-body font-medium text-sm h-6 leading-6 text-sm font-medium text-fg-disabled"
                }), "</div>\n</div>"));
                var calendarWeeksTemplate = optimizeTemplateHTML('<div class="calendar-weeks">\n  <div class="days-of-week flex"><span class="dow h-6 leading-6 text-sm font-medium text-fg-disabled"></span></div>\n  <div class="weeks">'.concat(createTagRepeat("span", 6, {
                  "class": "week block flex-1 leading-9 border-0 rounded-base cursor-default text-center text-body font-medium text-sm"
                }), "</div>\n</div>"));
                var View2 = /* @__PURE__ */ (function() {
                  function View3(picker, config2) {
                    _classCallCheck(this, View3);
                    Object.assign(this, config2, {
                      picker,
                      element: parseHTML('<div class="datepicker-view flex"></div>').firstChild,
                      selected: []
                    });
                    this.init(this.picker.datepicker.config);
                  }
                  return _createClass(View3, [{
                    key: "init",
                    value: function init(options) {
                      if (options.pickLevel !== void 0) {
                        this.isMinView = this.id === options.pickLevel;
                      }
                      this.setOptions(options);
                      this.updateFocus();
                      this.updateSelection();
                    }
                    // Execute beforeShow() callback and apply the result to the element
                    // args:
                    // - current - current value on the iteration on view rendering
                    // - timeValue - time value of the date to pass to beforeShow()
                  }, {
                    key: "performBeforeHook",
                    value: function performBeforeHook(el, current, timeValue) {
                      var result = this.beforeShow(new Date(timeValue));
                      switch (_typeof(result)) {
                        case "boolean":
                          result = {
                            enabled: result
                          };
                          break;
                        case "string":
                          result = {
                            classes: result
                          };
                      }
                      if (result) {
                        if (result.enabled === false) {
                          el.classList.add("disabled");
                          pushUnique(this.disabled, current);
                        }
                        if (result.classes) {
                          var _el$classList;
                          var extraClasses = result.classes.split(/\s+/);
                          (_el$classList = el.classList).add.apply(_el$classList, _toConsumableArray(extraClasses));
                          if (extraClasses.includes("disabled")) {
                            pushUnique(this.disabled, current);
                          }
                        }
                        if (result.content) {
                          replaceChildNodes(el, result.content);
                        }
                      }
                    }
                  }]);
                })();
                var DaysView = /* @__PURE__ */ (function(_View) {
                  function DaysView2(picker) {
                    _classCallCheck(this, DaysView2);
                    return _callSuper(this, DaysView2, [picker, {
                      id: 0,
                      name: "days",
                      cellClass: "day"
                    }]);
                  }
                  _inherits(DaysView2, _View);
                  return _createClass(DaysView2, [{
                    key: "init",
                    value: function init(options) {
                      var onConstruction = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
                      if (onConstruction) {
                        var inner = parseHTML(daysTemplate).firstChild;
                        this.dow = inner.firstChild;
                        this.grid = inner.lastChild;
                        this.element.appendChild(inner);
                      }
                      _get(_getPrototypeOf(DaysView2.prototype), "init", this).call(this, options);
                    }
                  }, {
                    key: "setOptions",
                    value: function setOptions(options) {
                      var _this = this;
                      var updateDOW;
                      if (hasProperty2(options, "minDate")) {
                        this.minDate = options.minDate;
                      }
                      if (hasProperty2(options, "maxDate")) {
                        this.maxDate = options.maxDate;
                      }
                      if (options.datesDisabled) {
                        this.datesDisabled = options.datesDisabled;
                      }
                      if (options.daysOfWeekDisabled) {
                        this.daysOfWeekDisabled = options.daysOfWeekDisabled;
                        updateDOW = true;
                      }
                      if (options.daysOfWeekHighlighted) {
                        this.daysOfWeekHighlighted = options.daysOfWeekHighlighted;
                      }
                      if (options.todayHighlight !== void 0) {
                        this.todayHighlight = options.todayHighlight;
                      }
                      if (options.weekStart !== void 0) {
                        this.weekStart = options.weekStart;
                        this.weekEnd = options.weekEnd;
                        updateDOW = true;
                      }
                      if (options.locale) {
                        var locale = this.locale = options.locale;
                        this.dayNames = locale.daysMin;
                        this.switchLabelFormat = locale.titleFormat;
                        updateDOW = true;
                      }
                      if (options.beforeShowDay !== void 0) {
                        this.beforeShow = typeof options.beforeShowDay === "function" ? options.beforeShowDay : void 0;
                      }
                      if (options.calendarWeeks !== void 0) {
                        if (options.calendarWeeks && !this.calendarWeeks) {
                          var weeksElem = parseHTML(calendarWeeksTemplate).firstChild;
                          this.calendarWeeks = {
                            element: weeksElem,
                            dow: weeksElem.firstChild,
                            weeks: weeksElem.lastChild
                          };
                          this.element.insertBefore(weeksElem, this.element.firstChild);
                        } else if (this.calendarWeeks && !options.calendarWeeks) {
                          this.element.removeChild(this.calendarWeeks.element);
                          this.calendarWeeks = null;
                        }
                      }
                      if (options.showDaysOfWeek !== void 0) {
                        if (options.showDaysOfWeek) {
                          showElement(this.dow);
                          if (this.calendarWeeks) {
                            showElement(this.calendarWeeks.dow);
                          }
                        } else {
                          hideElement(this.dow);
                          if (this.calendarWeeks) {
                            hideElement(this.calendarWeeks.dow);
                          }
                        }
                      }
                      if (updateDOW) {
                        Array.from(this.dow.children).forEach(function(el, index) {
                          var dow = (_this.weekStart + index) % 7;
                          el.textContent = _this.dayNames[dow];
                          el.className = _this.daysOfWeekDisabled.includes(dow) ? "dow disabled text-center h-6 leading-6 text-sm font-medium text-fg-disabled cursor-not-allowed" : "dow text-center h-6 leading-6 text-sm font-medium text-body";
                        });
                      }
                    }
                    // Apply update on the focused date to view's settings
                  }, {
                    key: "updateFocus",
                    value: function updateFocus() {
                      var viewDate = new Date(this.picker.viewDate);
                      var viewYear = viewDate.getFullYear();
                      var viewMonth = viewDate.getMonth();
                      var firstOfMonth = dateValue(viewYear, viewMonth, 1);
                      var start2 = dayOfTheWeekOf(firstOfMonth, this.weekStart, this.weekStart);
                      this.first = firstOfMonth;
                      this.last = dateValue(viewYear, viewMonth + 1, 0);
                      this.start = start2;
                      this.focused = this.picker.viewDate;
                    }
                    // Apply update on the selected dates to view's settings
                  }, {
                    key: "updateSelection",
                    value: function updateSelection() {
                      var _this$picker$datepick = this.picker.datepicker, dates = _this$picker$datepick.dates, rangepicker = _this$picker$datepick.rangepicker;
                      this.selected = dates;
                      if (rangepicker) {
                        this.range = rangepicker.dates;
                      }
                    }
                    // Update the entire view UI
                  }, {
                    key: "render",
                    value: function render() {
                      var _this2 = this;
                      this.today = this.todayHighlight ? today() : void 0;
                      this.disabled = _toConsumableArray(this.datesDisabled);
                      var switchLabel = formatDate(this.focused, this.switchLabelFormat, this.locale);
                      this.picker.setViewSwitchLabel(switchLabel);
                      this.picker.setPrevBtnDisabled(this.first <= this.minDate);
                      this.picker.setNextBtnDisabled(this.last >= this.maxDate);
                      if (this.calendarWeeks) {
                        var startOfWeek = dayOfTheWeekOf(this.first, 1, 1);
                        Array.from(this.calendarWeeks.weeks.children).forEach(function(el, index) {
                          el.textContent = getWeek(addWeeks(startOfWeek, index));
                        });
                      }
                      Array.from(this.grid.children).forEach(function(el, index) {
                        var classList = el.classList;
                        var current = addDays(_this2.start, index);
                        var date = new Date(current);
                        var day = date.getDay();
                        el.className = "datepicker-cell hover:bg-neutral-tertiary-medium block flex-1 leading-9 border-0 rounded-base cursor-pointer text-center text-body font-medium text-sm ".concat(_this2.cellClass);
                        el.dataset.date = current;
                        el.textContent = date.getDate();
                        if (current < _this2.first) {
                          classList.add("prev", "text-fg-disabled");
                        } else if (current > _this2.last) {
                          classList.add("next", "text-fg-disabled");
                        }
                        if (_this2.today === current) {
                          classList.add("today", "bg-gray-100", "dark:bg-gray-600");
                        }
                        if (current < _this2.minDate || current > _this2.maxDate || _this2.disabled.includes(current)) {
                          classList.add("disabled", "cursor-not-allowed", "text-fg-disabled");
                          classList.remove("hover:bg-neutral-tertiary-medium", "text-body", "cursor-pointer");
                        }
                        if (_this2.daysOfWeekDisabled.includes(day)) {
                          classList.add("disabled", "cursor-not-allowed", "text-fg-disabled");
                          classList.remove("hover:bg-neutral-tertiary-medium", "text-body", "cursor-pointer");
                          pushUnique(_this2.disabled, current);
                        }
                        if (_this2.daysOfWeekHighlighted.includes(day)) {
                          classList.add("highlighted");
                        }
                        if (_this2.range) {
                          var _this2$range = _slicedToArray(_this2.range, 2), rangeStart = _this2$range[0], rangeEnd = _this2$range[1];
                          if (current > rangeStart && current < rangeEnd) {
                            classList.add("range", "bg-neutral-tertiary-medium");
                            classList.remove("rounded-base", "rounded-s-base", "rounded-e-base");
                          }
                          if (current === rangeStart) {
                            classList.add("range-start", "bg-brand", "rounded-s-base");
                            classList.remove("rounded-base", "rounded-e-base");
                          }
                          if (current === rangeEnd) {
                            classList.add("range-end", "bg-neutral-tertiary-medium", "rounded-e-base");
                            classList.remove("rounded-base", "rounded-s-base");
                          }
                        }
                        if (_this2.selected.includes(current)) {
                          classList.add("selected", "bg-brand", "text-white");
                          classList.remove("text-body", "hover:bg-neutral-tertiary-medium", "bg-neutral-tertiary-medium");
                        }
                        if (current === _this2.focused) {
                          classList.add("focused");
                        }
                        if (_this2.beforeShow) {
                          _this2.performBeforeHook(el, current, current);
                        }
                      });
                    }
                    // Update the view UI by applying the changes of selected and focused items
                  }, {
                    key: "refresh",
                    value: function refresh() {
                      var _this3 = this;
                      var _ref = this.range || [], _ref2 = _slicedToArray(_ref, 2), rangeStart = _ref2[0], rangeEnd = _ref2[1];
                      this.grid.querySelectorAll(".range, .range-start, .range-end, .selected, .focused").forEach(function(el) {
                        el.classList.remove("range", "range-start", "range-end", "selected", "bg-brand", "text-white", "focused");
                        el.classList.add("text-body", "rounded-base");
                      });
                      Array.from(this.grid.children).forEach(function(el) {
                        var current = Number(el.dataset.date);
                        var classList = el.classList;
                        classList.remove("bg-neutral-tertiary-medium", "rounded-s-base", "rounded-e-base");
                        if (current > rangeStart && current < rangeEnd) {
                          classList.add("range", "bg-neutral-tertiary-medium");
                          classList.remove("rounded-base");
                        }
                        if (current === rangeStart) {
                          classList.add("range-start", "bg-brand", "text-white", "rounded-s-base");
                          classList.remove("rounded-base");
                        }
                        if (current === rangeEnd) {
                          classList.add("range-end", "bg-neutral-tertiary-medium", "rounded-e-base");
                          classList.remove("rounded-base");
                        }
                        if (_this3.selected.includes(current)) {
                          classList.add("selected", "bg-brand", "text-white");
                          classList.remove("text-body", "hover:bg-neutral-tertiary-medium", "bg-neutral-tertiary-medium");
                        }
                        if (current === _this3.focused) {
                          classList.add("focused");
                        }
                      });
                    }
                    // Update the view UI by applying the change of focused item
                  }, {
                    key: "refreshFocus",
                    value: function refreshFocus() {
                      var index = Math.round((this.focused - this.start) / 864e5);
                      this.grid.querySelectorAll(".focused").forEach(function(el) {
                        el.classList.remove("focused");
                      });
                      this.grid.children[index].classList.add("focused");
                    }
                  }]);
                })(View2);
                function computeMonthRange(range2, thisYear) {
                  if (!range2 || !range2[0] || !range2[1]) {
                    return;
                  }
                  var _range = _slicedToArray(range2, 2), _range$ = _slicedToArray(_range[0], 2), startY = _range$[0], startM = _range$[1], _range$2 = _slicedToArray(_range[1], 2), endY = _range$2[0], endM = _range$2[1];
                  if (startY > thisYear || endY < thisYear) {
                    return;
                  }
                  return [startY === thisYear ? startM : -1, endY === thisYear ? endM : 12];
                }
                var MonthsView = /* @__PURE__ */ (function(_View) {
                  function MonthsView2(picker) {
                    _classCallCheck(this, MonthsView2);
                    return _callSuper(this, MonthsView2, [picker, {
                      id: 1,
                      name: "months",
                      cellClass: "month"
                    }]);
                  }
                  _inherits(MonthsView2, _View);
                  return _createClass(MonthsView2, [{
                    key: "init",
                    value: function init(options) {
                      var onConstruction = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
                      if (onConstruction) {
                        this.grid = this.element;
                        this.element.classList.add("months", "datepicker-grid", "w-64", "grid", "grid-cols-4");
                        this.grid.appendChild(parseHTML(createTagRepeat("span", 12, {
                          "data-month": function dataMonth(ix) {
                            return ix;
                          }
                        })));
                      }
                      _get(_getPrototypeOf(MonthsView2.prototype), "init", this).call(this, options);
                    }
                  }, {
                    key: "setOptions",
                    value: function setOptions(options) {
                      if (options.locale) {
                        this.monthNames = options.locale.monthsShort;
                      }
                      if (hasProperty2(options, "minDate")) {
                        if (options.minDate === void 0) {
                          this.minYear = this.minMonth = this.minDate = void 0;
                        } else {
                          var minDateObj = new Date(options.minDate);
                          this.minYear = minDateObj.getFullYear();
                          this.minMonth = minDateObj.getMonth();
                          this.minDate = minDateObj.setDate(1);
                        }
                      }
                      if (hasProperty2(options, "maxDate")) {
                        if (options.maxDate === void 0) {
                          this.maxYear = this.maxMonth = this.maxDate = void 0;
                        } else {
                          var maxDateObj = new Date(options.maxDate);
                          this.maxYear = maxDateObj.getFullYear();
                          this.maxMonth = maxDateObj.getMonth();
                          this.maxDate = dateValue(this.maxYear, this.maxMonth + 1, 0);
                        }
                      }
                      if (options.beforeShowMonth !== void 0) {
                        this.beforeShow = typeof options.beforeShowMonth === "function" ? options.beforeShowMonth : void 0;
                      }
                    }
                    // Update view's settings to reflect the viewDate set on the picker
                  }, {
                    key: "updateFocus",
                    value: function updateFocus() {
                      var viewDate = new Date(this.picker.viewDate);
                      this.year = viewDate.getFullYear();
                      this.focused = viewDate.getMonth();
                    }
                    // Update view's settings to reflect the selected dates
                  }, {
                    key: "updateSelection",
                    value: function updateSelection() {
                      var _this$picker$datepick = this.picker.datepicker, dates = _this$picker$datepick.dates, rangepicker = _this$picker$datepick.rangepicker;
                      this.selected = dates.reduce(function(selected, timeValue) {
                        var date = new Date(timeValue);
                        var year = date.getFullYear();
                        var month = date.getMonth();
                        if (selected[year] === void 0) {
                          selected[year] = [month];
                        } else {
                          pushUnique(selected[year], month);
                        }
                        return selected;
                      }, {});
                      if (rangepicker && rangepicker.dates) {
                        this.range = rangepicker.dates.map(function(timeValue) {
                          var date = new Date(timeValue);
                          return isNaN(date) ? void 0 : [date.getFullYear(), date.getMonth()];
                        });
                      }
                    }
                    // Update the entire view UI
                  }, {
                    key: "render",
                    value: function render() {
                      var _this = this;
                      this.disabled = [];
                      this.picker.setViewSwitchLabel(this.year);
                      this.picker.setPrevBtnDisabled(this.year <= this.minYear);
                      this.picker.setNextBtnDisabled(this.year >= this.maxYear);
                      var selected = this.selected[this.year] || [];
                      var yrOutOfRange = this.year < this.minYear || this.year > this.maxYear;
                      var isMinYear = this.year === this.minYear;
                      var isMaxYear = this.year === this.maxYear;
                      var range2 = computeMonthRange(this.range, this.year);
                      Array.from(this.grid.children).forEach(function(el, index) {
                        var classList = el.classList;
                        var date = dateValue(_this.year, index, 1);
                        el.className = "datepicker-cell hover:bg-neutral-tertiary-medium block flex-1 leading-9 border-0 rounded-base cursor-pointer text-center text-body font-medium text-sm ".concat(_this.cellClass);
                        if (_this.isMinView) {
                          el.dataset.date = date;
                        }
                        el.textContent = _this.monthNames[index];
                        if (yrOutOfRange || isMinYear && index < _this.minMonth || isMaxYear && index > _this.maxMonth) {
                          classList.add("disabled");
                        }
                        if (range2) {
                          var _range2 = _slicedToArray(range2, 2), rangeStart = _range2[0], rangeEnd = _range2[1];
                          if (index > rangeStart && index < rangeEnd) {
                            classList.add("range");
                          }
                          if (index === rangeStart) {
                            classList.add("range-start");
                          }
                          if (index === rangeEnd) {
                            classList.add("range-end");
                          }
                        }
                        if (selected.includes(index)) {
                          classList.add("selected", "bg-brand", "text-white", "dark:text-white");
                          classList.remove("text-body", "hover:bg-neutral-tertiary-medium", "dark:text-white");
                        }
                        if (index === _this.focused) {
                          classList.add("focused");
                        }
                        if (_this.beforeShow) {
                          _this.performBeforeHook(el, index, date);
                        }
                      });
                    }
                    // Update the view UI by applying the changes of selected and focused items
                  }, {
                    key: "refresh",
                    value: function refresh() {
                      var _this2 = this;
                      var selected = this.selected[this.year] || [];
                      var _ref = computeMonthRange(this.range, this.year) || [], _ref2 = _slicedToArray(_ref, 2), rangeStart = _ref2[0], rangeEnd = _ref2[1];
                      this.grid.querySelectorAll(".range, .range-start, .range-end, .selected, .focused").forEach(function(el) {
                        el.classList.remove("range", "range-start", "range-end", "selected", "bg-brand", "dark:text-white", "text-white", "focused");
                        el.classList.add("text-body", "hover:bg-neutral-tertiary-medium", "dark:text-white");
                      });
                      Array.from(this.grid.children).forEach(function(el, index) {
                        var classList = el.classList;
                        if (index > rangeStart && index < rangeEnd) {
                          classList.add("range");
                        }
                        if (index === rangeStart) {
                          classList.add("range-start");
                        }
                        if (index === rangeEnd) {
                          classList.add("range-end");
                        }
                        if (selected.includes(index)) {
                          classList.add("selected", "bg-brand", "text-white", "dark:text-white");
                          classList.remove("text-body", "hover:bg-neutral-tertiary-medium", "dark:text-white");
                        }
                        if (index === _this2.focused) {
                          classList.add("focused");
                        }
                      });
                    }
                    // Update the view UI by applying the change of focused item
                  }, {
                    key: "refreshFocus",
                    value: function refreshFocus() {
                      this.grid.querySelectorAll(".focused").forEach(function(el) {
                        el.classList.remove("focused");
                      });
                      this.grid.children[this.focused].classList.add("focused");
                    }
                  }]);
                })(View2);
                function toTitleCase(word) {
                  return _toConsumableArray(word).reduce(function(str, ch, ix) {
                    return str += ix ? ch : ch.toUpperCase();
                  }, "");
                }
                var YearsView = /* @__PURE__ */ (function(_View) {
                  function YearsView2(picker, config2) {
                    _classCallCheck(this, YearsView2);
                    return _callSuper(this, YearsView2, [picker, config2]);
                  }
                  _inherits(YearsView2, _View);
                  return _createClass(YearsView2, [{
                    key: "init",
                    value: function init(options) {
                      var onConstruction = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
                      if (onConstruction) {
                        this.navStep = this.step * 10;
                        this.beforeShowOption = "beforeShow".concat(toTitleCase(this.cellClass));
                        this.grid = this.element;
                        this.element.classList.add(this.name, "datepicker-grid", "w-64", "grid", "grid-cols-4");
                        this.grid.appendChild(parseHTML(createTagRepeat("span", 12)));
                      }
                      _get(_getPrototypeOf(YearsView2.prototype), "init", this).call(this, options);
                    }
                  }, {
                    key: "setOptions",
                    value: function setOptions(options) {
                      if (hasProperty2(options, "minDate")) {
                        if (options.minDate === void 0) {
                          this.minYear = this.minDate = void 0;
                        } else {
                          this.minYear = startOfYearPeriod(options.minDate, this.step);
                          this.minDate = dateValue(this.minYear, 0, 1);
                        }
                      }
                      if (hasProperty2(options, "maxDate")) {
                        if (options.maxDate === void 0) {
                          this.maxYear = this.maxDate = void 0;
                        } else {
                          this.maxYear = startOfYearPeriod(options.maxDate, this.step);
                          this.maxDate = dateValue(this.maxYear, 11, 31);
                        }
                      }
                      if (options[this.beforeShowOption] !== void 0) {
                        var beforeShow = options[this.beforeShowOption];
                        this.beforeShow = typeof beforeShow === "function" ? beforeShow : void 0;
                      }
                    }
                    // Update view's settings to reflect the viewDate set on the picker
                  }, {
                    key: "updateFocus",
                    value: function updateFocus() {
                      var viewDate = new Date(this.picker.viewDate);
                      var first = startOfYearPeriod(viewDate, this.navStep);
                      var last = first + 9 * this.step;
                      this.first = first;
                      this.last = last;
                      this.start = first - this.step;
                      this.focused = startOfYearPeriod(viewDate, this.step);
                    }
                    // Update view's settings to reflect the selected dates
                  }, {
                    key: "updateSelection",
                    value: function updateSelection() {
                      var _this = this;
                      var _this$picker$datepick = this.picker.datepicker, dates = _this$picker$datepick.dates, rangepicker = _this$picker$datepick.rangepicker;
                      this.selected = dates.reduce(function(years, timeValue) {
                        return pushUnique(years, startOfYearPeriod(timeValue, _this.step));
                      }, []);
                      if (rangepicker && rangepicker.dates) {
                        this.range = rangepicker.dates.map(function(timeValue) {
                          if (timeValue !== void 0) {
                            return startOfYearPeriod(timeValue, _this.step);
                          }
                        });
                      }
                    }
                    // Update the entire view UI
                  }, {
                    key: "render",
                    value: function render() {
                      var _this2 = this;
                      this.disabled = [];
                      this.picker.setViewSwitchLabel("".concat(this.first, "-").concat(this.last));
                      this.picker.setPrevBtnDisabled(this.first <= this.minYear);
                      this.picker.setNextBtnDisabled(this.last >= this.maxYear);
                      Array.from(this.grid.children).forEach(function(el, index) {
                        var classList = el.classList;
                        var current = _this2.start + index * _this2.step;
                        var date = dateValue(current, 0, 1);
                        el.className = "datepicker-cell hover:bg-neutral-tertiary-medium block flex-1 leading-9 border-0 rounded-base cursor-pointer text-center text-body font-medium text-sm ".concat(_this2.cellClass);
                        if (_this2.isMinView) {
                          el.dataset.date = date;
                        }
                        el.textContent = el.dataset.year = current;
                        if (index === 0) {
                          classList.add("prev");
                        } else if (index === 11) {
                          classList.add("next");
                        }
                        if (current < _this2.minYear || current > _this2.maxYear) {
                          classList.add("disabled");
                        }
                        if (_this2.range) {
                          var _this2$range = _slicedToArray(_this2.range, 2), rangeStart = _this2$range[0], rangeEnd = _this2$range[1];
                          if (current > rangeStart && current < rangeEnd) {
                            classList.add("range");
                          }
                          if (current === rangeStart) {
                            classList.add("range-start");
                          }
                          if (current === rangeEnd) {
                            classList.add("range-end");
                          }
                        }
                        if (_this2.selected.includes(current)) {
                          classList.add("selected", "bg-brand", "text-white", "dark:text-white");
                          classList.remove("text-body", "hover:bg-neutral-tertiary-medium", "dark:text-white");
                        }
                        if (current === _this2.focused) {
                          classList.add("focused");
                        }
                        if (_this2.beforeShow) {
                          _this2.performBeforeHook(el, current, date);
                        }
                      });
                    }
                    // Update the view UI by applying the changes of selected and focused items
                  }, {
                    key: "refresh",
                    value: function refresh() {
                      var _this3 = this;
                      var _ref = this.range || [], _ref2 = _slicedToArray(_ref, 2), rangeStart = _ref2[0], rangeEnd = _ref2[1];
                      this.grid.querySelectorAll(".range, .range-start, .range-end, .selected, .focused").forEach(function(el) {
                        el.classList.remove("range", "range-start", "range-end", "selected", "bg-brand", "text-white", "dark:text-white", "focused");
                      });
                      Array.from(this.grid.children).forEach(function(el) {
                        var current = Number(el.textContent);
                        var classList = el.classList;
                        if (current > rangeStart && current < rangeEnd) {
                          classList.add("range");
                        }
                        if (current === rangeStart) {
                          classList.add("range-start");
                        }
                        if (current === rangeEnd) {
                          classList.add("range-end");
                        }
                        if (_this3.selected.includes(current)) {
                          classList.add("selected", "bg-brand", "text-white", "hover:text-heading");
                          classList.remove("text-body", "hover:bg-neutral-tertiary-medium", "hover:text-heading");
                        }
                        if (current === _this3.focused) {
                          classList.add("focused");
                        }
                      });
                    }
                    // Update the view UI by applying the change of focused item
                  }, {
                    key: "refreshFocus",
                    value: function refreshFocus() {
                      var index = Math.round((this.focused - this.start) / this.step);
                      this.grid.querySelectorAll(".focused").forEach(function(el) {
                        el.classList.remove("focused");
                      });
                      this.grid.children[index].classList.add("focused");
                    }
                  }]);
                })(View2);
                function triggerDatepickerEvent(datepicker, type) {
                  var detail = {
                    date: datepicker.getDate(),
                    viewDate: new Date(datepicker.picker.viewDate),
                    viewId: datepicker.picker.currentView.id,
                    datepicker
                  };
                  datepicker.element.dispatchEvent(new CustomEvent(type, {
                    detail
                  }));
                }
                function goToPrevOrNext(datepicker, direction) {
                  var _datepicker$config = datepicker.config, minDate = _datepicker$config.minDate, maxDate = _datepicker$config.maxDate;
                  var _datepicker$picker = datepicker.picker, currentView = _datepicker$picker.currentView, viewDate = _datepicker$picker.viewDate;
                  var newViewDate;
                  switch (currentView.id) {
                    case 0:
                      newViewDate = addMonths(viewDate, direction);
                      break;
                    case 1:
                      newViewDate = addYears(viewDate, direction);
                      break;
                    default:
                      newViewDate = addYears(viewDate, direction * currentView.navStep);
                  }
                  newViewDate = limitToRange(newViewDate, minDate, maxDate);
                  datepicker.picker.changeFocus(newViewDate).render();
                }
                function switchView(datepicker) {
                  var viewId = datepicker.picker.currentView.id;
                  if (viewId === datepicker.config.maxView) {
                    return;
                  }
                  datepicker.picker.changeView(viewId + 1).render();
                }
                function unfocus(datepicker) {
                  if (datepicker.config.updateOnBlur) {
                    datepicker.update({
                      autohide: true
                    });
                  } else {
                    datepicker.refresh("input");
                    datepicker.hide();
                  }
                }
                function goToSelectedMonthOrYear(datepicker, selection) {
                  var picker = datepicker.picker;
                  var viewDate = new Date(picker.viewDate);
                  var viewId = picker.currentView.id;
                  var newDate = viewId === 1 ? addMonths(viewDate, selection - viewDate.getMonth()) : addYears(viewDate, selection - viewDate.getFullYear());
                  picker.changeFocus(newDate).changeView(viewId - 1).render();
                }
                function onClickTodayBtn(datepicker) {
                  var picker = datepicker.picker;
                  var currentDate = today();
                  if (datepicker.config.todayBtnMode === 1) {
                    if (datepicker.config.autohide) {
                      datepicker.setDate(currentDate);
                      return;
                    }
                    datepicker.setDate(currentDate, {
                      render: false
                    });
                    picker.update();
                  }
                  if (picker.viewDate !== currentDate) {
                    picker.changeFocus(currentDate);
                  }
                  picker.changeView(0).render();
                }
                function onClickClearBtn(datepicker) {
                  datepicker.setDate({
                    clear: true
                  });
                }
                function onClickViewSwitch(datepicker) {
                  switchView(datepicker);
                }
                function onClickPrevBtn(datepicker) {
                  goToPrevOrNext(datepicker, -1);
                }
                function onClickNextBtn(datepicker) {
                  goToPrevOrNext(datepicker, 1);
                }
                function onClickView(datepicker, ev) {
                  var target = findElementInEventPath(ev, ".datepicker-cell");
                  if (!target || target.classList.contains("disabled")) {
                    return;
                  }
                  var _datepicker$picker$cu = datepicker.picker.currentView, id = _datepicker$picker$cu.id, isMinView = _datepicker$picker$cu.isMinView;
                  if (isMinView) {
                    datepicker.setDate(Number(target.dataset.date));
                  } else if (id === 1) {
                    goToSelectedMonthOrYear(datepicker, Number(target.dataset.month));
                  } else {
                    goToSelectedMonthOrYear(datepicker, Number(target.dataset.year));
                  }
                }
                function onClickPicker(datepicker) {
                  if (!datepicker.inline && !datepicker.config.disableTouchKeyboard) {
                    datepicker.inputField.focus();
                  }
                }
                function processPickerOptions(picker, options) {
                  if (options.title !== void 0) {
                    if (options.title) {
                      picker.controls.title.textContent = options.title;
                      showElement(picker.controls.title);
                    } else {
                      picker.controls.title.textContent = "";
                      hideElement(picker.controls.title);
                    }
                  }
                  if (options.prevArrow) {
                    var prevBtn = picker.controls.prevBtn;
                    emptyChildNodes(prevBtn);
                    options.prevArrow.forEach(function(node) {
                      prevBtn.appendChild(node.cloneNode(true));
                    });
                  }
                  if (options.nextArrow) {
                    var nextBtn = picker.controls.nextBtn;
                    emptyChildNodes(nextBtn);
                    options.nextArrow.forEach(function(node) {
                      nextBtn.appendChild(node.cloneNode(true));
                    });
                  }
                  if (options.locale) {
                    picker.controls.todayBtn.textContent = options.locale.today;
                    picker.controls.clearBtn.textContent = options.locale.clear;
                  }
                  if (options.todayBtn !== void 0) {
                    if (options.todayBtn) {
                      showElement(picker.controls.todayBtn);
                    } else {
                      hideElement(picker.controls.todayBtn);
                    }
                  }
                  if (hasProperty2(options, "minDate") || hasProperty2(options, "maxDate")) {
                    var _picker$datepicker$co = picker.datepicker.config, minDate = _picker$datepicker$co.minDate, maxDate = _picker$datepicker$co.maxDate;
                    picker.controls.todayBtn.disabled = !isInRange(today(), minDate, maxDate);
                  }
                  if (options.clearBtn !== void 0) {
                    if (options.clearBtn) {
                      showElement(picker.controls.clearBtn);
                    } else {
                      hideElement(picker.controls.clearBtn);
                    }
                  }
                }
                function computeResetViewDate(datepicker) {
                  var dates = datepicker.dates, config2 = datepicker.config;
                  var viewDate = dates.length > 0 ? lastItemOf(dates) : config2.defaultViewDate;
                  return limitToRange(viewDate, config2.minDate, config2.maxDate);
                }
                function setViewDate(picker, newDate) {
                  var oldViewDate = new Date(picker.viewDate);
                  var newViewDate = new Date(newDate);
                  var _picker$currentView = picker.currentView, id = _picker$currentView.id, year = _picker$currentView.year, first = _picker$currentView.first, last = _picker$currentView.last;
                  var viewYear = newViewDate.getFullYear();
                  picker.viewDate = newDate;
                  if (viewYear !== oldViewDate.getFullYear()) {
                    triggerDatepickerEvent(picker.datepicker, "changeYear");
                  }
                  if (newViewDate.getMonth() !== oldViewDate.getMonth()) {
                    triggerDatepickerEvent(picker.datepicker, "changeMonth");
                  }
                  switch (id) {
                    case 0:
                      return newDate < first || newDate > last;
                    case 1:
                      return viewYear !== year;
                    default:
                      return viewYear < first || viewYear > last;
                  }
                }
                function getTextDirection(el) {
                  return window.getComputedStyle(el).direction;
                }
                var Picker = /* @__PURE__ */ (function() {
                  function Picker2(datepicker) {
                    _classCallCheck(this, Picker2);
                    this.datepicker = datepicker;
                    var template = pickerTemplate.replace(/%buttonClass%/g, datepicker.config.buttonClass);
                    var element = this.element = parseHTML(template).firstChild;
                    var _element$firstChild$c = _slicedToArray(element.firstChild.children, 3), header = _element$firstChild$c[0], main = _element$firstChild$c[1], footer = _element$firstChild$c[2];
                    var title = header.firstElementChild;
                    var _header$lastElementCh = _slicedToArray(header.lastElementChild.children, 3), prevBtn = _header$lastElementCh[0], viewSwitch = _header$lastElementCh[1], nextBtn = _header$lastElementCh[2];
                    var _footer$firstChild$ch = _slicedToArray(footer.firstChild.children, 2), todayBtn = _footer$firstChild$ch[0], clearBtn = _footer$firstChild$ch[1];
                    var controls = {
                      title,
                      prevBtn,
                      viewSwitch,
                      nextBtn,
                      todayBtn,
                      clearBtn
                    };
                    this.main = main;
                    this.controls = controls;
                    var elementClass = datepicker.inline ? "inline" : "dropdown";
                    element.classList.add("datepicker-".concat(elementClass));
                    elementClass === "dropdown" ? element.classList.add("dropdown", "absolute", "top-0", "left-0", "z-50", "pt-2") : null;
                    processPickerOptions(this, datepicker.config);
                    this.viewDate = computeResetViewDate(datepicker);
                    registerListeners(datepicker, [[element, "click", onClickPicker.bind(null, datepicker), {
                      capture: true
                    }], [main, "click", onClickView.bind(null, datepicker)], [controls.viewSwitch, "click", onClickViewSwitch.bind(null, datepicker)], [controls.prevBtn, "click", onClickPrevBtn.bind(null, datepicker)], [controls.nextBtn, "click", onClickNextBtn.bind(null, datepicker)], [controls.todayBtn, "click", onClickTodayBtn.bind(null, datepicker)], [controls.clearBtn, "click", onClickClearBtn.bind(null, datepicker)]]);
                    this.views = [new DaysView(this), new MonthsView(this), new YearsView(this, {
                      id: 2,
                      name: "years",
                      cellClass: "year",
                      step: 1
                    }), new YearsView(this, {
                      id: 3,
                      name: "decades",
                      cellClass: "decade",
                      step: 10
                    })];
                    this.currentView = this.views[datepicker.config.startView];
                    this.currentView.render();
                    this.main.appendChild(this.currentView.element);
                    datepicker.config.container.appendChild(this.element);
                  }
                  return _createClass(Picker2, [{
                    key: "setOptions",
                    value: function setOptions(options) {
                      processPickerOptions(this, options);
                      this.views.forEach(function(view) {
                        view.init(options, false);
                      });
                      this.currentView.render();
                    }
                  }, {
                    key: "detach",
                    value: function detach() {
                      this.datepicker.config.container.removeChild(this.element);
                    }
                  }, {
                    key: "show",
                    value: function show() {
                      if (this.active) {
                        return;
                      }
                      this.element.classList.add("active", "block");
                      this.element.classList.remove("hidden");
                      this.active = true;
                      var datepicker = this.datepicker;
                      if (!datepicker.inline) {
                        var inputDirection = getTextDirection(datepicker.inputField);
                        if (inputDirection !== getTextDirection(datepicker.config.container)) {
                          this.element.dir = inputDirection;
                        } else if (this.element.dir) {
                          this.element.removeAttribute("dir");
                        }
                        this.place();
                        if (datepicker.config.disableTouchKeyboard) {
                          datepicker.inputField.blur();
                        }
                      }
                      triggerDatepickerEvent(datepicker, "show");
                    }
                  }, {
                    key: "hide",
                    value: function hide() {
                      if (!this.active) {
                        return;
                      }
                      this.datepicker.exitEditMode();
                      this.element.classList.remove("active", "block");
                      this.element.classList.add("active", "block", "hidden");
                      this.active = false;
                      triggerDatepickerEvent(this.datepicker, "hide");
                    }
                  }, {
                    key: "place",
                    value: function place() {
                      var _this$element = this.element, classList = _this$element.classList, style = _this$element.style;
                      var _this$datepicker = this.datepicker, config2 = _this$datepicker.config, inputField = _this$datepicker.inputField;
                      var container = config2.container;
                      var _this$element$getBoun = this.element.getBoundingClientRect(), calendarWidth = _this$element$getBoun.width, calendarHeight = _this$element$getBoun.height;
                      var _container$getBoundin = container.getBoundingClientRect(), containerLeft = _container$getBoundin.left, containerTop = _container$getBoundin.top, containerWidth = _container$getBoundin.width;
                      var _inputField$getBoundi = inputField.getBoundingClientRect(), inputLeft = _inputField$getBoundi.left, inputTop = _inputField$getBoundi.top, inputWidth = _inputField$getBoundi.width, inputHeight = _inputField$getBoundi.height;
                      var _config$orientation = config2.orientation, orientX = _config$orientation.x, orientY = _config$orientation.y;
                      var scrollTop;
                      var left;
                      var top;
                      if (container === document.body) {
                        scrollTop = window.scrollY;
                        left = inputLeft + window.scrollX;
                        top = inputTop + scrollTop;
                      } else {
                        scrollTop = container.scrollTop;
                        left = inputLeft - containerLeft;
                        top = inputTop - containerTop + scrollTop;
                      }
                      if (orientX === "auto") {
                        if (left < 0) {
                          orientX = "left";
                          left = 10;
                        } else if (left + calendarWidth > containerWidth) {
                          orientX = "right";
                        } else {
                          orientX = getTextDirection(inputField) === "rtl" ? "right" : "left";
                        }
                      }
                      if (orientX === "right") {
                        left -= calendarWidth - inputWidth;
                      }
                      if (orientY === "auto") {
                        orientY = top - calendarHeight < scrollTop ? "bottom" : "top";
                      }
                      if (orientY === "top") {
                        top -= calendarHeight;
                      } else {
                        top += inputHeight;
                      }
                      classList.remove("datepicker-orient-top", "datepicker-orient-bottom", "datepicker-orient-right", "datepicker-orient-left");
                      classList.add("datepicker-orient-".concat(orientY), "datepicker-orient-".concat(orientX));
                      style.top = top ? "".concat(top, "px") : top;
                      style.left = left ? "".concat(left, "px") : left;
                    }
                  }, {
                    key: "setViewSwitchLabel",
                    value: function setViewSwitchLabel(labelText) {
                      this.controls.viewSwitch.textContent = labelText;
                    }
                  }, {
                    key: "setPrevBtnDisabled",
                    value: function setPrevBtnDisabled(disabled) {
                      this.controls.prevBtn.disabled = disabled;
                    }
                  }, {
                    key: "setNextBtnDisabled",
                    value: function setNextBtnDisabled(disabled) {
                      this.controls.nextBtn.disabled = disabled;
                    }
                  }, {
                    key: "changeView",
                    value: function changeView(viewId) {
                      var oldView = this.currentView;
                      var newView = this.views[viewId];
                      if (newView.id !== oldView.id) {
                        this.currentView = newView;
                        this._renderMethod = "render";
                        triggerDatepickerEvent(this.datepicker, "changeView");
                        this.main.replaceChild(newView.element, oldView.element);
                      }
                      return this;
                    }
                    // Change the focused date (view date)
                  }, {
                    key: "changeFocus",
                    value: function changeFocus(newViewDate) {
                      this._renderMethod = setViewDate(this, newViewDate) ? "render" : "refreshFocus";
                      this.views.forEach(function(view) {
                        view.updateFocus();
                      });
                      return this;
                    }
                    // Apply the change of the selected dates
                  }, {
                    key: "update",
                    value: function update() {
                      var newViewDate = computeResetViewDate(this.datepicker);
                      this._renderMethod = setViewDate(this, newViewDate) ? "render" : "refresh";
                      this.views.forEach(function(view) {
                        view.updateFocus();
                        view.updateSelection();
                      });
                      return this;
                    }
                    // Refresh the picker UI
                  }, {
                    key: "render",
                    value: function render() {
                      var quickRender = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : true;
                      var renderMethod = quickRender && this._renderMethod || "render";
                      delete this._renderMethod;
                      this.currentView[renderMethod]();
                    }
                  }]);
                })();
                function findNextAvailableOne(date, addFn, increase, testFn, min, max) {
                  if (!isInRange(date, min, max)) {
                    return;
                  }
                  if (testFn(date)) {
                    var newDate = addFn(date, increase);
                    return findNextAvailableOne(newDate, addFn, increase, testFn, min, max);
                  }
                  return date;
                }
                function moveByArrowKey(datepicker, ev, direction, vertical) {
                  var picker = datepicker.picker;
                  var currentView = picker.currentView;
                  var step = currentView.step || 1;
                  var viewDate = picker.viewDate;
                  var addFn;
                  var testFn;
                  switch (currentView.id) {
                    case 0:
                      if (vertical) {
                        viewDate = addDays(viewDate, direction * 7);
                      } else if (ev.ctrlKey || ev.metaKey) {
                        viewDate = addYears(viewDate, direction);
                      } else {
                        viewDate = addDays(viewDate, direction);
                      }
                      addFn = addDays;
                      testFn = function testFn2(date) {
                        return currentView.disabled.includes(date);
                      };
                      break;
                    case 1:
                      viewDate = addMonths(viewDate, vertical ? direction * 4 : direction);
                      addFn = addMonths;
                      testFn = function testFn2(date) {
                        var dt = new Date(date);
                        var year = currentView.year, disabled = currentView.disabled;
                        return dt.getFullYear() === year && disabled.includes(dt.getMonth());
                      };
                      break;
                    default:
                      viewDate = addYears(viewDate, direction * (vertical ? 4 : 1) * step);
                      addFn = addYears;
                      testFn = function testFn2(date) {
                        return currentView.disabled.includes(startOfYearPeriod(date, step));
                      };
                  }
                  viewDate = findNextAvailableOne(viewDate, addFn, direction < 0 ? -step : step, testFn, currentView.minDate, currentView.maxDate);
                  if (viewDate !== void 0) {
                    picker.changeFocus(viewDate).render();
                  }
                }
                function onKeydown(datepicker, ev) {
                  if (ev.key === "Tab") {
                    unfocus(datepicker);
                    return;
                  }
                  var picker = datepicker.picker;
                  var _picker$currentView = picker.currentView, id = _picker$currentView.id, isMinView = _picker$currentView.isMinView;
                  if (!picker.active) {
                    switch (ev.key) {
                      case "ArrowDown":
                      case "Escape":
                        picker.show();
                        break;
                      case "Enter":
                        datepicker.update();
                        break;
                      default:
                        return;
                    }
                  } else if (datepicker.editMode) {
                    switch (ev.key) {
                      case "Escape":
                        picker.hide();
                        break;
                      case "Enter":
                        datepicker.exitEditMode({
                          update: true,
                          autohide: datepicker.config.autohide
                        });
                        break;
                      default:
                        return;
                    }
                  } else {
                    switch (ev.key) {
                      case "Escape":
                        picker.hide();
                        break;
                      case "ArrowLeft":
                        if (ev.ctrlKey || ev.metaKey) {
                          goToPrevOrNext(datepicker, -1);
                        } else if (ev.shiftKey) {
                          datepicker.enterEditMode();
                          return;
                        } else {
                          moveByArrowKey(datepicker, ev, -1, false);
                        }
                        break;
                      case "ArrowRight":
                        if (ev.ctrlKey || ev.metaKey) {
                          goToPrevOrNext(datepicker, 1);
                        } else if (ev.shiftKey) {
                          datepicker.enterEditMode();
                          return;
                        } else {
                          moveByArrowKey(datepicker, ev, 1, false);
                        }
                        break;
                      case "ArrowUp":
                        if (ev.ctrlKey || ev.metaKey) {
                          switchView(datepicker);
                        } else if (ev.shiftKey) {
                          datepicker.enterEditMode();
                          return;
                        } else {
                          moveByArrowKey(datepicker, ev, -1, true);
                        }
                        break;
                      case "ArrowDown":
                        if (ev.shiftKey && !ev.ctrlKey && !ev.metaKey) {
                          datepicker.enterEditMode();
                          return;
                        }
                        moveByArrowKey(datepicker, ev, 1, true);
                        break;
                      case "Enter":
                        if (isMinView) {
                          datepicker.setDate(picker.viewDate);
                        } else {
                          picker.changeView(id - 1).render();
                        }
                        break;
                      case "Backspace":
                      case "Delete":
                        datepicker.enterEditMode();
                        return;
                      default:
                        if (ev.key.length === 1 && !ev.ctrlKey && !ev.metaKey) {
                          datepicker.enterEditMode();
                        }
                        return;
                    }
                  }
                  ev.preventDefault();
                  ev.stopPropagation();
                }
                function onFocus(datepicker) {
                  if (datepicker.config.showOnFocus && !datepicker._showing) {
                    datepicker.show();
                  }
                }
                function onMousedown(datepicker, ev) {
                  var el = ev.target;
                  if (datepicker.picker.active || datepicker.config.showOnClick) {
                    el._active = el === document.activeElement;
                    el._clicking = setTimeout(function() {
                      delete el._active;
                      delete el._clicking;
                    }, 2e3);
                  }
                }
                function onClickInput(datepicker, ev) {
                  var el = ev.target;
                  if (!el._clicking) {
                    return;
                  }
                  clearTimeout(el._clicking);
                  delete el._clicking;
                  if (el._active) {
                    datepicker.enterEditMode();
                  }
                  delete el._active;
                  if (datepicker.config.showOnClick) {
                    datepicker.show();
                  }
                }
                function onPaste(datepicker, ev) {
                  if (ev.clipboardData.types.includes("text/plain")) {
                    datepicker.enterEditMode();
                  }
                }
                function onClickOutside(datepicker, ev) {
                  var element = datepicker.element;
                  if (element !== document.activeElement) {
                    return;
                  }
                  var pickerElem = datepicker.picker.element;
                  if (findElementInEventPath(ev, function(el) {
                    return el === element || el === pickerElem;
                  })) {
                    return;
                  }
                  unfocus(datepicker);
                }
                function stringifyDates(dates, config2) {
                  return dates.map(function(dt) {
                    return formatDate(dt, config2.format, config2.locale);
                  }).join(config2.dateDelimiter);
                }
                function processInputDates(datepicker, inputDates) {
                  var clear = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                  var config2 = datepicker.config, origDates = datepicker.dates, rangepicker = datepicker.rangepicker;
                  if (inputDates.length === 0) {
                    return clear ? [] : void 0;
                  }
                  var rangeEnd = rangepicker && datepicker === rangepicker.datepickers[1];
                  var newDates = inputDates.reduce(function(dates, dt) {
                    var date = parseDate(dt, config2.format, config2.locale);
                    if (date === void 0) {
                      return dates;
                    }
                    if (config2.pickLevel > 0) {
                      var _dt = new Date(date);
                      if (config2.pickLevel === 1) {
                        date = rangeEnd ? _dt.setMonth(_dt.getMonth() + 1, 0) : _dt.setDate(1);
                      } else {
                        date = rangeEnd ? _dt.setFullYear(_dt.getFullYear() + 1, 0, 0) : _dt.setMonth(0, 1);
                      }
                    }
                    if (isInRange(date, config2.minDate, config2.maxDate) && !dates.includes(date) && !config2.datesDisabled.includes(date) && !config2.daysOfWeekDisabled.includes(new Date(date).getDay())) {
                      dates.push(date);
                    }
                    return dates;
                  }, []);
                  if (newDates.length === 0) {
                    return;
                  }
                  if (config2.multidate && !clear) {
                    newDates = newDates.reduce(function(dates, date) {
                      if (!origDates.includes(date)) {
                        dates.push(date);
                      }
                      return dates;
                    }, origDates.filter(function(date) {
                      return !newDates.includes(date);
                    }));
                  }
                  return config2.maxNumberOfDates && newDates.length > config2.maxNumberOfDates ? newDates.slice(config2.maxNumberOfDates * -1) : newDates;
                }
                function refreshUI(datepicker) {
                  var mode = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 3;
                  var quickRender = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : true;
                  var config2 = datepicker.config, picker = datepicker.picker, inputField = datepicker.inputField;
                  if (mode & 2) {
                    var newView = picker.active ? config2.pickLevel : config2.startView;
                    picker.update().changeView(newView).render(quickRender);
                  }
                  if (mode & 1 && inputField) {
                    inputField.value = stringifyDates(datepicker.dates, config2);
                  }
                }
                function _setDate(datepicker, inputDates, options) {
                  var clear = options.clear, render = options.render, autohide = options.autohide;
                  if (render === void 0) {
                    render = true;
                  }
                  if (!render) {
                    autohide = false;
                  } else if (autohide === void 0) {
                    autohide = datepicker.config.autohide;
                  }
                  var newDates = processInputDates(datepicker, inputDates, clear);
                  if (!newDates) {
                    return;
                  }
                  if (newDates.toString() !== datepicker.dates.toString()) {
                    datepicker.dates = newDates;
                    refreshUI(datepicker, render ? 3 : 1);
                    triggerDatepickerEvent(datepicker, "changeDate");
                  } else {
                    refreshUI(datepicker, 1);
                  }
                  if (autohide) {
                    datepicker.hide();
                  }
                }
                var Datepicker = /* @__PURE__ */ (function() {
                  function Datepicker2(element) {
                    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
                    var rangepicker = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : void 0;
                    _classCallCheck(this, Datepicker2);
                    element.datepicker = this;
                    this.element = element;
                    var config2 = this.config = Object.assign({
                      buttonClass: options.buttonClass && String(options.buttonClass) || "button",
                      container: document.body,
                      defaultViewDate: today(),
                      maxDate: void 0,
                      minDate: void 0
                    }, processOptions(defaultOptions2, this));
                    this._options = options;
                    Object.assign(config2, processOptions(options, this));
                    var inline = this.inline = element.tagName !== "INPUT";
                    var inputField;
                    var initialDates;
                    if (inline) {
                      config2.container = element;
                      initialDates = stringToArray(element.dataset.date, config2.dateDelimiter);
                      delete element.dataset.date;
                    } else {
                      var container = options.container ? document.querySelector(options.container) : null;
                      if (container) {
                        config2.container = container;
                      }
                      inputField = this.inputField = element;
                      inputField.classList.add("datepicker-input");
                      initialDates = stringToArray(inputField.value, config2.dateDelimiter);
                    }
                    if (rangepicker) {
                      var index = rangepicker.inputs.indexOf(inputField);
                      var datepickers = rangepicker.datepickers;
                      if (index < 0 || index > 1 || !Array.isArray(datepickers)) {
                        throw Error("Invalid rangepicker object.");
                      }
                      datepickers[index] = this;
                      Object.defineProperty(this, "rangepicker", {
                        get: function get() {
                          return rangepicker;
                        }
                      });
                    }
                    this.dates = [];
                    var inputDateValues = processInputDates(this, initialDates);
                    if (inputDateValues && inputDateValues.length > 0) {
                      this.dates = inputDateValues;
                    }
                    if (inputField) {
                      inputField.value = stringifyDates(this.dates, config2);
                    }
                    var picker = this.picker = new Picker(this);
                    if (inline) {
                      this.show();
                    } else {
                      var onMousedownDocument = onClickOutside.bind(null, this);
                      var listeners = [[inputField, "keydown", onKeydown.bind(null, this)], [inputField, "focus", onFocus.bind(null, this)], [inputField, "mousedown", onMousedown.bind(null, this)], [inputField, "click", onClickInput.bind(null, this)], [inputField, "paste", onPaste.bind(null, this)], [document, "mousedown", onMousedownDocument], [document, "touchstart", onMousedownDocument], [window, "resize", picker.place.bind(picker)]];
                      registerListeners(this, listeners);
                    }
                  }
                  return _createClass(Datepicker2, [{
                    key: "active",
                    get: (
                      /**
                       * @type {Boolean} - Whether the picker element is shown. `true` whne shown
                       */
                      function get() {
                        return !!(this.picker && this.picker.active);
                      }
                    )
                    /**
                     * @type {HTMLDivElement} - DOM object of picker element
                     */
                  }, {
                    key: "pickerElement",
                    get: function get() {
                      return this.picker ? this.picker.element : void 0;
                    }
                    /**
                     * Set new values to the config options
                     * @param {Object} options - config options to update
                     */
                  }, {
                    key: "setOptions",
                    value: function setOptions(options) {
                      var picker = this.picker;
                      var newOptions = processOptions(options, this);
                      Object.assign(this._options, options);
                      Object.assign(this.config, newOptions);
                      picker.setOptions(newOptions);
                      refreshUI(this, 3);
                    }
                    /**
                     * Show the picker element
                     */
                  }, {
                    key: "show",
                    value: function show() {
                      if (this.inputField) {
                        if (this.inputField.disabled) {
                          return;
                        }
                        if (this.inputField !== document.activeElement) {
                          this._showing = true;
                          this.inputField.focus();
                          delete this._showing;
                        }
                      }
                      this.picker.show();
                    }
                    /**
                     * Hide the picker element
                     * Not available on inline picker
                     */
                  }, {
                    key: "hide",
                    value: function hide() {
                      if (this.inline) {
                        return;
                      }
                      this.picker.hide();
                      this.picker.update().changeView(this.config.startView).render();
                    }
                    /**
                     * Destroy the Datepicker instance
                     * @return {Detepicker} - the instance destroyed
                     */
                  }, {
                    key: "destroy",
                    value: function destroy() {
                      this.hide();
                      unregisterListeners(this);
                      this.picker.detach();
                      if (!this.inline) {
                        this.inputField.classList.remove("datepicker-input");
                      }
                      delete this.element.datepicker;
                      return this;
                    }
                    /**
                     * Get the selected date(s)
                     *
                     * The method returns a Date object of selected date by default, and returns
                     * an array of selected dates in multidate mode. If format string is passed,
                     * it returns date string(s) formatted in given format.
                     *
                     * @param  {String} [format] - Format string to stringify the date(s)
                     * @return {Date|String|Date[]|String[]} - selected date(s), or if none is
                     * selected, empty array in multidate mode and untitled in sigledate mode
                     */
                  }, {
                    key: "getDate",
                    value: function getDate() {
                      var _this = this;
                      var format = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : void 0;
                      var callback = format ? function(date) {
                        return formatDate(date, format, _this.config.locale);
                      } : function(date) {
                        return new Date(date);
                      };
                      if (this.config.multidate) {
                        return this.dates.map(callback);
                      }
                      if (this.dates.length > 0) {
                        return callback(this.dates[0]);
                      }
                    }
                    /**
                     * Set selected date(s)
                     *
                     * In multidate mode, you can pass multiple dates as a series of arguments
                     * or an array. (Since each date is parsed individually, the type of the
                     * dates doesn't have to be the same.)
                     * The given dates are used to toggle the select status of each date. The
                     * number of selected dates is kept from exceeding the length set to
                     * maxNumberOfDates.
                     *
                     * With clear: true option, the method can be used to clear the selection
                     * and to replace the selection instead of toggling in multidate mode.
                     * If the option is passed with no date arguments or an empty dates array,
                     * it works as "clear" (clear the selection then set nothing), and if the
                     * option is passed with new dates to select, it works as "replace" (clear
                     * the selection then set the given dates)
                     *
                     * When render: false option is used, the method omits re-rendering the
                     * picker element. In this case, you need to call refresh() method later in
                     * order for the picker element to reflect the changes. The input field is
                     * refreshed always regardless of this option.
                     *
                     * When invalid (unparsable, repeated, disabled or out-of-range) dates are
                     * passed, the method ignores them and applies only valid ones. In the case
                     * that all the given dates are invalid, which is distinguished from passing
                     * no dates, the method considers it as an error and leaves the selection
                     * untouched.
                     *
                     * @param {...(Date|Number|String)|Array} [dates] - Date strings, Date
                     * objects, time values or mix of those for new selection
                     * @param {Object} [options] - function options
                     * - clear: {boolean} - Whether to clear the existing selection
                     *     defualt: false
                     * - render: {boolean} - Whether to re-render the picker element
                     *     default: true
                     * - autohide: {boolean} - Whether to hide the picker element after re-render
                     *     Ignored when used with render: false
                     *     default: config.autohide
                     */
                  }, {
                    key: "setDate",
                    value: function setDate() {
                      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                        args[_key] = arguments[_key];
                      }
                      var dates = [].concat(args);
                      var opts = {};
                      var lastArg = lastItemOf(args);
                      if (_typeof(lastArg) === "object" && !Array.isArray(lastArg) && !(lastArg instanceof Date) && lastArg) {
                        Object.assign(opts, dates.pop());
                      }
                      var inputDates = Array.isArray(dates[0]) ? dates[0] : dates;
                      _setDate(this, inputDates, opts);
                    }
                    /**
                     * Update the selected date(s) with input field's value
                     * Not available on inline picker
                     *
                     * The input field will be refreshed with properly formatted date string.
                     *
                     * @param  {Object} [options] - function options
                     * - autohide: {boolean} - whether to hide the picker element after refresh
                     *     default: false
                     */
                  }, {
                    key: "update",
                    value: function update() {
                      var options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : void 0;
                      if (this.inline) {
                        return;
                      }
                      var opts = {
                        clear: true,
                        autohide: !!(options && options.autohide)
                      };
                      var inputDates = stringToArray(this.inputField.value, this.config.dateDelimiter);
                      _setDate(this, inputDates, opts);
                    }
                    /**
                     * Refresh the picker element and the associated input field
                     * @param {String} [target] - target item when refreshing one item only
                     * 'picker' or 'input'
                     * @param {Boolean} [forceRender] - whether to re-render the picker element
                     * regardless of its state instead of optimized refresh
                     */
                  }, {
                    key: "refresh",
                    value: function refresh() {
                      var target = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : void 0;
                      var forceRender = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
                      if (target && typeof target !== "string") {
                        forceRender = target;
                        target = void 0;
                      }
                      var mode;
                      if (target === "picker") {
                        mode = 2;
                      } else if (target === "input") {
                        mode = 1;
                      } else {
                        mode = 3;
                      }
                      refreshUI(this, mode, !forceRender);
                    }
                    /**
                     * Enter edit mode
                     * Not available on inline picker or when the picker element is hidden
                     */
                  }, {
                    key: "enterEditMode",
                    value: function enterEditMode() {
                      if (this.inline || !this.picker.active || this.editMode) {
                        return;
                      }
                      this.editMode = true;
                      this.inputField.classList.add("in-edit", "border-brand");
                    }
                    /**
                     * Exit from edit mode
                     * Not available on inline picker
                     * @param  {Object} [options] - function options
                     * - update: {boolean} - whether to call update() after exiting
                     *     If false, input field is revert to the existing selection
                     *     default: false
                     */
                  }, {
                    key: "exitEditMode",
                    value: function exitEditMode() {
                      var options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : void 0;
                      if (this.inline || !this.editMode) {
                        return;
                      }
                      var opts = Object.assign({
                        update: false
                      }, options);
                      delete this.editMode;
                      this.inputField.classList.remove("in-edit", "border-brand");
                      if (opts.update) {
                        this.update(opts);
                      }
                    }
                  }], [{
                    key: "formatDate",
                    value: function formatDate$1(date, format, lang) {
                      return formatDate(date, format, lang && locales[lang] || locales.en);
                    }
                    /**
                     * Parse date string
                     * @param  {String|Date|Number} dateStr - date string, Date object or time
                     * value to parse
                     * @param  {String|Object} format - format string or object that contains
                     * toValue() custom parser, whose signature is
                     * - args:
                     *   - dateStr: {String|Date|Number} - the dateStr passed to the method
                     *   - format: {Object} - the format object passed to the method
                     *   - locale: {Object} - locale for the language specified by `lang`
                     * - return:
                     *     {Date|Number} parsed date or its time value
                     * @param  {String} [lang=en] - language code for the locale to use
                     * @return {Number} time value of parsed date
                     */
                  }, {
                    key: "parseDate",
                    value: function parseDate$1(dateStr, format, lang) {
                      return parseDate(dateStr, format, lang && locales[lang] || locales.en);
                    }
                    /**
                     * @type {Object} - Installed locales in `[languageCode]: localeObject` format
                     * en`:_English (US)_ is pre-installed.
                     */
                  }, {
                    key: "locales",
                    get: function get() {
                      return locales;
                    }
                  }]);
                })();
                function filterOptions(options) {
                  var newOpts = Object.assign({}, options);
                  delete newOpts.inputs;
                  delete newOpts.allowOneSidedRange;
                  delete newOpts.maxNumberOfDates;
                  return newOpts;
                }
                function setupDatepicker(rangepicker, changeDateListener, el, options) {
                  registerListeners(rangepicker, [[el, "changeDate", changeDateListener]]);
                  new Datepicker(el, options, rangepicker);
                }
                function onChangeDate(rangepicker, ev) {
                  if (rangepicker._updating) {
                    return;
                  }
                  rangepicker._updating = true;
                  var target = ev.target;
                  if (target.datepicker === void 0) {
                    return;
                  }
                  var datepickers = rangepicker.datepickers;
                  var setDateOptions = {
                    render: false
                  };
                  var changedSide = rangepicker.inputs.indexOf(target);
                  var otherSide = changedSide === 0 ? 1 : 0;
                  var changedDate = datepickers[changedSide].dates[0];
                  var otherDate = datepickers[otherSide].dates[0];
                  if (changedDate !== void 0 && otherDate !== void 0) {
                    if (changedSide === 0 && changedDate > otherDate) {
                      datepickers[0].setDate(otherDate, setDateOptions);
                      datepickers[1].setDate(changedDate, setDateOptions);
                    } else if (changedSide === 1 && changedDate < otherDate) {
                      datepickers[0].setDate(changedDate, setDateOptions);
                      datepickers[1].setDate(otherDate, setDateOptions);
                    }
                  } else if (!rangepicker.allowOneSidedRange) {
                    if (changedDate !== void 0 || otherDate !== void 0) {
                      setDateOptions.clear = true;
                      datepickers[otherSide].setDate(datepickers[changedSide].dates, setDateOptions);
                    }
                  }
                  datepickers[0].picker.update().render();
                  datepickers[1].picker.update().render();
                  delete rangepicker._updating;
                }
                var DateRangePicker = /* @__PURE__ */ (function() {
                  function DateRangePicker2(element) {
                    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
                    _classCallCheck(this, DateRangePicker2);
                    var inputs = Array.isArray(options.inputs) ? options.inputs : Array.from(element.querySelectorAll("input"));
                    if (inputs.length < 2) {
                      return;
                    }
                    element.rangepicker = this;
                    this.element = element;
                    this.inputs = inputs.slice(0, 2);
                    this.allowOneSidedRange = !!options.allowOneSidedRange;
                    var changeDateListener = onChangeDate.bind(null, this);
                    var cleanOptions = filterOptions(options);
                    var datepickers = [];
                    Object.defineProperty(this, "datepickers", {
                      get: function get() {
                        return datepickers;
                      }
                    });
                    setupDatepicker(this, changeDateListener, this.inputs[0], cleanOptions);
                    setupDatepicker(this, changeDateListener, this.inputs[1], cleanOptions);
                    Object.freeze(datepickers);
                    if (datepickers[0].dates.length > 0) {
                      onChangeDate(this, {
                        target: this.inputs[0]
                      });
                    } else if (datepickers[1].dates.length > 0) {
                      onChangeDate(this, {
                        target: this.inputs[1]
                      });
                    }
                  }
                  return _createClass(DateRangePicker2, [{
                    key: "dates",
                    get: function get() {
                      return this.datepickers.length === 2 ? [this.datepickers[0].dates[0], this.datepickers[1].dates[0]] : void 0;
                    }
                    /**
                     * Set new values to the config options
                     * @param {Object} options - config options to update
                     */
                  }, {
                    key: "setOptions",
                    value: function setOptions(options) {
                      this.allowOneSidedRange = !!options.allowOneSidedRange;
                      var cleanOptions = filterOptions(options);
                      this.datepickers[0].setOptions(cleanOptions);
                      this.datepickers[1].setOptions(cleanOptions);
                    }
                    /**
                     * Destroy the DateRangePicker instance
                     * @return {DateRangePicker} - the instance destroyed
                     */
                  }, {
                    key: "destroy",
                    value: function destroy() {
                      this.datepickers[0].destroy();
                      this.datepickers[1].destroy();
                      unregisterListeners(this);
                      delete this.element.rangepicker;
                    }
                    /**
                     * Get the start and end dates of the date range
                     *
                     * The method returns Date objects by default. If format string is passed,
                     * it returns date strings formatted in given format.
                     * The result array always contains 2 items (start date/end date) and
                     * undefined is used for unselected side. (e.g. If none is selected,
                     * the result will be [undefined, undefined]. If only the end date is set
                     * when allowOneSidedRange config option is true, [undefined, endDate] will
                     * be returned.)
                     *
                     * @param  {String} [format] - Format string to stringify the dates
                     * @return {Array} - Start and end dates
                     */
                  }, {
                    key: "getDates",
                    value: function getDates() {
                      var _this = this;
                      var format = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : void 0;
                      var callback = format ? function(date) {
                        return formatDate(date, format, _this.datepickers[0].config.locale);
                      } : function(date) {
                        return new Date(date);
                      };
                      return this.dates.map(function(date) {
                        return date === void 0 ? date : callback(date);
                      });
                    }
                    /**
                     * Set the start and end dates of the date range
                     *
                     * The method calls datepicker.setDate() internally using each of the
                     * arguments in start→end order.
                     *
                     * When a clear: true option object is passed instead of a date, the method
                     * clears the date.
                     *
                     * If an invalid date, the same date as the current one or an option object
                     * without clear: true is passed, the method considers that argument as an
                     * "ineffective" argument because calling datepicker.setDate() with those
                     * values makes no changes to the date selection.
                     *
                     * When the allowOneSidedRange config option is false, passing {clear: true}
                     * to clear the range works only when it is done to the last effective
                     * argument (in other words, passed to rangeEnd or to rangeStart along with
                     * ineffective rangeEnd). This is because when the date range is changed,
                     * it gets normalized based on the last change at the end of the changing
                     * process.
                     *
                     * @param {Date|Number|String|Object} rangeStart - Start date of the range
                     * or {clear: true} to clear the date
                     * @param {Date|Number|String|Object} rangeEnd - End date of the range
                     * or {clear: true} to clear the date
                     */
                  }, {
                    key: "setDates",
                    value: function setDates(rangeStart, rangeEnd) {
                      var _this$datepickers = _slicedToArray(this.datepickers, 2), datepicker0 = _this$datepickers[0], datepicker1 = _this$datepickers[1];
                      var origDates = this.dates;
                      this._updating = true;
                      datepicker0.setDate(rangeStart);
                      datepicker1.setDate(rangeEnd);
                      delete this._updating;
                      if (datepicker1.dates[0] !== origDates[1]) {
                        onChangeDate(this, {
                          target: this.inputs[1]
                        });
                      } else if (datepicker0.dates[0] !== origDates[0]) {
                        onChangeDate(this, {
                          target: this.inputs[0]
                        });
                      }
                    }
                  }]);
                })();
                exports2.DateRangePicker = DateRangePicker;
                exports2.Datepicker = Datepicker;
              })
            ),
            /***/
            902: (
              /***/
              (function(__unused_webpack_module, exports2, __webpack_require__2) {
                var __assign = this && this.__assign || function() {
                  __assign = Object.assign || function(t) {
                    for (var s, i = 1, n = arguments.length; i < n; i++) {
                      s = arguments[i];
                      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
                    }
                    return t;
                  };
                  return __assign.apply(this, arguments);
                };
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.initAccordions = void 0;
                var instances_1 = __webpack_require__2(7423);
                var Default = {
                  alwaysOpen: false,
                  activeClasses: "bg-neutral-secondary-medium text-heading",
                  inactiveClasses: "bg-neutral-primary text-body",
                  onOpen: function() {
                  },
                  onClose: function() {
                  },
                  onToggle: function() {
                  }
                };
                var DefaultInstanceOptions = {
                  id: null,
                  override: true
                };
                var Accordion = (
                  /** @class */
                  (function() {
                    function Accordion2(accordionEl, items, options, instanceOptions) {
                      if (accordionEl === void 0) {
                        accordionEl = null;
                      }
                      if (items === void 0) {
                        items = [];
                      }
                      if (options === void 0) {
                        options = Default;
                      }
                      if (instanceOptions === void 0) {
                        instanceOptions = DefaultInstanceOptions;
                      }
                      this._instanceId = instanceOptions.id ? instanceOptions.id : accordionEl.id;
                      this._accordionEl = accordionEl;
                      this._items = items;
                      this._options = __assign(__assign({}, Default), options);
                      this._initialized = false;
                      this.init();
                      instances_1.default.addInstance("Accordion", this, this._instanceId, instanceOptions.override);
                    }
                    Accordion2.prototype.init = function() {
                      var _this = this;
                      if (this._items.length && !this._initialized) {
                        this._items.forEach(function(item) {
                          if (item.active) {
                            _this.open(item.id);
                          }
                          var clickHandler = function() {
                            _this.toggle(item.id);
                          };
                          item.triggerEl.addEventListener("click", clickHandler);
                          item.clickHandler = clickHandler;
                        });
                        this._initialized = true;
                      }
                    };
                    Accordion2.prototype.destroy = function() {
                      if (this._items.length && this._initialized) {
                        this._items.forEach(function(item) {
                          item.triggerEl.removeEventListener("click", item.clickHandler);
                          delete item.clickHandler;
                        });
                        this._initialized = false;
                      }
                    };
                    Accordion2.prototype.removeInstance = function() {
                      instances_1.default.removeInstance("Accordion", this._instanceId);
                    };
                    Accordion2.prototype.destroyAndRemoveInstance = function() {
                      this.destroy();
                      this.removeInstance();
                    };
                    Accordion2.prototype.getItem = function(id) {
                      return this._items.filter(function(item) {
                        return item.id === id;
                      })[0];
                    };
                    Accordion2.prototype.open = function(id) {
                      var _a, _b;
                      var _this = this;
                      var item = this.getItem(id);
                      if (!this._options.alwaysOpen) {
                        this._items.map(function(i) {
                          var _a2, _b2;
                          if (i !== item) {
                            (_a2 = i.triggerEl.classList).remove.apply(_a2, _this._options.activeClasses.split(" "));
                            (_b2 = i.triggerEl.classList).add.apply(_b2, _this._options.inactiveClasses.split(" "));
                            i.targetEl.classList.add("hidden");
                            i.triggerEl.setAttribute("aria-expanded", "false");
                            i.active = false;
                            if (i.iconEl) {
                              i.iconEl.classList.add("rotate-180");
                            }
                          }
                        });
                      }
                      (_a = item.triggerEl.classList).add.apply(_a, this._options.activeClasses.split(" "));
                      (_b = item.triggerEl.classList).remove.apply(_b, this._options.inactiveClasses.split(" "));
                      item.triggerEl.setAttribute("aria-expanded", "true");
                      item.targetEl.classList.remove("hidden");
                      item.active = true;
                      if (item.iconEl) {
                        item.iconEl.classList.remove("rotate-180");
                      }
                      this._options.onOpen(this, item);
                    };
                    Accordion2.prototype.toggle = function(id) {
                      var item = this.getItem(id);
                      if (item.active) {
                        this.close(id);
                      } else {
                        this.open(id);
                      }
                      this._options.onToggle(this, item);
                    };
                    Accordion2.prototype.close = function(id) {
                      var _a, _b;
                      var item = this.getItem(id);
                      (_a = item.triggerEl.classList).remove.apply(_a, this._options.activeClasses.split(" "));
                      (_b = item.triggerEl.classList).add.apply(_b, this._options.inactiveClasses.split(" "));
                      item.targetEl.classList.add("hidden");
                      item.triggerEl.setAttribute("aria-expanded", "false");
                      item.active = false;
                      if (item.iconEl) {
                        item.iconEl.classList.add("rotate-180");
                      }
                      this._options.onClose(this, item);
                    };
                    Accordion2.prototype.updateOnOpen = function(callback) {
                      this._options.onOpen = callback;
                    };
                    Accordion2.prototype.updateOnClose = function(callback) {
                      this._options.onClose = callback;
                    };
                    Accordion2.prototype.updateOnToggle = function(callback) {
                      this._options.onToggle = callback;
                    };
                    return Accordion2;
                  })()
                );
                function initAccordions() {
                  document.querySelectorAll("[data-accordion]").forEach(function($accordionEl) {
                    var alwaysOpen = $accordionEl.getAttribute("data-accordion");
                    var activeClasses = $accordionEl.getAttribute("data-active-classes");
                    var inactiveClasses = $accordionEl.getAttribute("data-inactive-classes");
                    var items = [];
                    $accordionEl.querySelectorAll("[data-accordion-target]").forEach(function($triggerEl) {
                      if ($triggerEl.closest("[data-accordion]") === $accordionEl) {
                        var item = {
                          id: $triggerEl.getAttribute("data-accordion-target"),
                          triggerEl: $triggerEl,
                          targetEl: document.querySelector($triggerEl.getAttribute("data-accordion-target")),
                          iconEl: $triggerEl.querySelector("[data-accordion-icon]"),
                          active: $triggerEl.getAttribute("aria-expanded") === "true" ? true : false
                        };
                        items.push(item);
                      }
                    });
                    new Accordion($accordionEl, items, {
                      alwaysOpen: alwaysOpen === "open" ? true : false,
                      activeClasses: activeClasses ? activeClasses : Default.activeClasses,
                      inactiveClasses: inactiveClasses ? inactiveClasses : Default.inactiveClasses
                    });
                  });
                }
                exports2.initAccordions = initAccordions;
                if (typeof window !== "undefined") {
                  window.Accordion = Accordion;
                  window.initAccordions = initAccordions;
                }
                exports2["default"] = Accordion;
              })
            ),
            /***/
            6033: (
              /***/
              (function(__unused_webpack_module, exports2, __webpack_require__2) {
                var __assign = this && this.__assign || function() {
                  __assign = Object.assign || function(t) {
                    for (var s, i = 1, n = arguments.length; i < n; i++) {
                      s = arguments[i];
                      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
                    }
                    return t;
                  };
                  return __assign.apply(this, arguments);
                };
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.initCarousels = void 0;
                var instances_1 = __webpack_require__2(7423);
                var Default = {
                  defaultPosition: 0,
                  indicators: {
                    items: [],
                    activeClasses: "bg-white dark:bg-gray-800",
                    inactiveClasses: "bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800"
                  },
                  interval: 3e3,
                  onNext: function() {
                  },
                  onPrev: function() {
                  },
                  onChange: function() {
                  }
                };
                var DefaultInstanceOptions = {
                  id: null,
                  override: true
                };
                var Carousel = (
                  /** @class */
                  (function() {
                    function Carousel2(carouselEl, items, options, instanceOptions) {
                      if (carouselEl === void 0) {
                        carouselEl = null;
                      }
                      if (items === void 0) {
                        items = [];
                      }
                      if (options === void 0) {
                        options = Default;
                      }
                      if (instanceOptions === void 0) {
                        instanceOptions = DefaultInstanceOptions;
                      }
                      this._instanceId = instanceOptions.id ? instanceOptions.id : carouselEl.id;
                      this._carouselEl = carouselEl;
                      this._items = items;
                      this._options = __assign(__assign(__assign({}, Default), options), { indicators: __assign(__assign({}, Default.indicators), options.indicators) });
                      this._activeItem = this.getItem(this._options.defaultPosition);
                      this._indicators = this._options.indicators.items;
                      this._intervalDuration = this._options.interval;
                      this._intervalInstance = null;
                      this._initialized = false;
                      this.init();
                      instances_1.default.addInstance("Carousel", this, this._instanceId, instanceOptions.override);
                    }
                    Carousel2.prototype.init = function() {
                      var _this = this;
                      if (this._items.length && !this._initialized) {
                        this._items.map(function(item) {
                          item.el.classList.add("absolute", "inset-0", "transition-transform", "transform");
                        });
                        if (this.getActiveItem()) {
                          this.slideTo(this.getActiveItem().position);
                        } else {
                          this.slideTo(0);
                        }
                        this._indicators.map(function(indicator, position) {
                          indicator.el.addEventListener("click", function() {
                            _this.slideTo(position);
                          });
                        });
                        this._initialized = true;
                      }
                    };
                    Carousel2.prototype.destroy = function() {
                      if (this._initialized) {
                        this._initialized = false;
                      }
                    };
                    Carousel2.prototype.removeInstance = function() {
                      instances_1.default.removeInstance("Carousel", this._instanceId);
                    };
                    Carousel2.prototype.destroyAndRemoveInstance = function() {
                      this.destroy();
                      this.removeInstance();
                    };
                    Carousel2.prototype.getItem = function(position) {
                      return this._items[position];
                    };
                    Carousel2.prototype.slideTo = function(position) {
                      var nextItem = this._items[position];
                      var rotationItems = {
                        left: nextItem.position === 0 ? this._items[this._items.length - 1] : this._items[nextItem.position - 1],
                        middle: nextItem,
                        right: nextItem.position === this._items.length - 1 ? this._items[0] : this._items[nextItem.position + 1]
                      };
                      this._rotate(rotationItems);
                      this._setActiveItem(nextItem);
                      if (this._intervalInstance) {
                        this.pause();
                        this.cycle();
                      }
                      this._options.onChange(this);
                    };
                    Carousel2.prototype.next = function() {
                      var activeItem = this.getActiveItem();
                      var nextItem = null;
                      if (activeItem.position === this._items.length - 1) {
                        nextItem = this._items[0];
                      } else {
                        nextItem = this._items[activeItem.position + 1];
                      }
                      this.slideTo(nextItem.position);
                      this._options.onNext(this);
                    };
                    Carousel2.prototype.prev = function() {
                      var activeItem = this.getActiveItem();
                      var prevItem = null;
                      if (activeItem.position === 0) {
                        prevItem = this._items[this._items.length - 1];
                      } else {
                        prevItem = this._items[activeItem.position - 1];
                      }
                      this.slideTo(prevItem.position);
                      this._options.onPrev(this);
                    };
                    Carousel2.prototype._rotate = function(rotationItems) {
                      this._items.map(function(item) {
                        item.el.classList.add("hidden");
                      });
                      if (this._items.length === 1) {
                        rotationItems.middle.el.classList.remove("-translate-x-full", "translate-x-full", "translate-x-0", "hidden", "z-10");
                        rotationItems.middle.el.classList.add("translate-x-0", "z-20");
                        return;
                      }
                      rotationItems.left.el.classList.remove("-translate-x-full", "translate-x-full", "translate-x-0", "hidden", "z-20");
                      rotationItems.left.el.classList.add("-translate-x-full", "z-10");
                      rotationItems.middle.el.classList.remove("-translate-x-full", "translate-x-full", "translate-x-0", "hidden", "z-10");
                      rotationItems.middle.el.classList.add("translate-x-0", "z-30");
                      rotationItems.right.el.classList.remove("-translate-x-full", "translate-x-full", "translate-x-0", "hidden", "z-30");
                      rotationItems.right.el.classList.add("translate-x-full", "z-20");
                    };
                    Carousel2.prototype.cycle = function() {
                      var _this = this;
                      if (typeof window !== "undefined") {
                        this._intervalInstance = window.setInterval(function() {
                          _this.next();
                        }, this._intervalDuration);
                      }
                    };
                    Carousel2.prototype.pause = function() {
                      clearInterval(this._intervalInstance);
                    };
                    Carousel2.prototype.getActiveItem = function() {
                      return this._activeItem;
                    };
                    Carousel2.prototype._setActiveItem = function(item) {
                      var _a, _b;
                      var _this = this;
                      this._activeItem = item;
                      var position = item.position;
                      if (this._indicators.length) {
                        this._indicators.map(function(indicator) {
                          var _a2, _b2;
                          indicator.el.setAttribute("aria-current", "false");
                          (_a2 = indicator.el.classList).remove.apply(_a2, _this._options.indicators.activeClasses.split(" "));
                          (_b2 = indicator.el.classList).add.apply(_b2, _this._options.indicators.inactiveClasses.split(" "));
                        });
                        (_a = this._indicators[position].el.classList).add.apply(_a, this._options.indicators.activeClasses.split(" "));
                        (_b = this._indicators[position].el.classList).remove.apply(_b, this._options.indicators.inactiveClasses.split(" "));
                        this._indicators[position].el.setAttribute("aria-current", "true");
                      }
                    };
                    Carousel2.prototype.updateOnNext = function(callback) {
                      this._options.onNext = callback;
                    };
                    Carousel2.prototype.updateOnPrev = function(callback) {
                      this._options.onPrev = callback;
                    };
                    Carousel2.prototype.updateOnChange = function(callback) {
                      this._options.onChange = callback;
                    };
                    return Carousel2;
                  })()
                );
                function initCarousels() {
                  document.querySelectorAll("[data-carousel]").forEach(function($carouselEl) {
                    var interval = $carouselEl.getAttribute("data-carousel-interval");
                    var slide = $carouselEl.getAttribute("data-carousel") === "slide" ? true : false;
                    var items = [];
                    var defaultPosition = 0;
                    if ($carouselEl.querySelectorAll("[data-carousel-item]").length) {
                      Array.from($carouselEl.querySelectorAll("[data-carousel-item]")).map(function($carouselItemEl, position) {
                        items.push({
                          position,
                          el: $carouselItemEl
                        });
                        if ($carouselItemEl.getAttribute("data-carousel-item") === "active") {
                          defaultPosition = position;
                        }
                      });
                    }
                    var indicators = [];
                    if ($carouselEl.querySelectorAll("[data-carousel-slide-to]").length) {
                      Array.from($carouselEl.querySelectorAll("[data-carousel-slide-to]")).map(function($indicatorEl) {
                        indicators.push({
                          position: parseInt($indicatorEl.getAttribute("data-carousel-slide-to")),
                          el: $indicatorEl
                        });
                      });
                    }
                    var carousel = new Carousel($carouselEl, items, {
                      defaultPosition,
                      indicators: {
                        items: indicators
                      },
                      interval: interval ? interval : Default.interval
                    });
                    if (slide) {
                      carousel.cycle();
                    }
                    var carouselNextEl = $carouselEl.querySelector("[data-carousel-next]");
                    var carouselPrevEl = $carouselEl.querySelector("[data-carousel-prev]");
                    if (carouselNextEl) {
                      carouselNextEl.addEventListener("click", function() {
                        carousel.next();
                      });
                    }
                    if (carouselPrevEl) {
                      carouselPrevEl.addEventListener("click", function() {
                        carousel.prev();
                      });
                    }
                  });
                }
                exports2.initCarousels = initCarousels;
                if (typeof window !== "undefined") {
                  window.Carousel = Carousel;
                  window.initCarousels = initCarousels;
                }
                exports2["default"] = Carousel;
              })
            ),
            /***/
            2673: (
              /***/
              (function(__unused_webpack_module, exports2, __webpack_require__2) {
                var __assign = this && this.__assign || function() {
                  __assign = Object.assign || function(t) {
                    for (var s, i = 1, n = arguments.length; i < n; i++) {
                      s = arguments[i];
                      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
                    }
                    return t;
                  };
                  return __assign.apply(this, arguments);
                };
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.initCopyClipboards = void 0;
                var instances_1 = __webpack_require__2(7423);
                var Default = {
                  htmlEntities: false,
                  contentType: "input",
                  onCopy: function() {
                  }
                };
                var DefaultInstanceOptions = {
                  id: null,
                  override: true
                };
                var CopyClipboard = (
                  /** @class */
                  (function() {
                    function CopyClipboard2(triggerEl, targetEl, options, instanceOptions) {
                      if (triggerEl === void 0) {
                        triggerEl = null;
                      }
                      if (targetEl === void 0) {
                        targetEl = null;
                      }
                      if (options === void 0) {
                        options = Default;
                      }
                      if (instanceOptions === void 0) {
                        instanceOptions = DefaultInstanceOptions;
                      }
                      this._instanceId = instanceOptions.id ? instanceOptions.id : targetEl.id;
                      this._triggerEl = triggerEl;
                      this._targetEl = targetEl;
                      this._options = __assign(__assign({}, Default), options);
                      this._initialized = false;
                      this.init();
                      instances_1.default.addInstance("CopyClipboard", this, this._instanceId, instanceOptions.override);
                    }
                    CopyClipboard2.prototype.init = function() {
                      var _this = this;
                      if (this._targetEl && this._triggerEl && !this._initialized) {
                        this._triggerElClickHandler = function() {
                          _this.copy();
                        };
                        if (this._triggerEl) {
                          this._triggerEl.addEventListener("click", this._triggerElClickHandler);
                        }
                        this._initialized = true;
                      }
                    };
                    CopyClipboard2.prototype.destroy = function() {
                      if (this._triggerEl && this._targetEl && this._initialized) {
                        if (this._triggerEl) {
                          this._triggerEl.removeEventListener("click", this._triggerElClickHandler);
                        }
                        this._initialized = false;
                      }
                    };
                    CopyClipboard2.prototype.removeInstance = function() {
                      instances_1.default.removeInstance("CopyClipboard", this._instanceId);
                    };
                    CopyClipboard2.prototype.destroyAndRemoveInstance = function() {
                      this.destroy();
                      this.removeInstance();
                    };
                    CopyClipboard2.prototype.getTargetValue = function() {
                      if (this._options.contentType === "input") {
                        return this._targetEl.value;
                      }
                      if (this._options.contentType === "innerHTML") {
                        return this._targetEl.innerHTML;
                      }
                      if (this._options.contentType === "textContent") {
                        return this._targetEl.textContent.replace(/\s+/g, " ").trim();
                      }
                    };
                    CopyClipboard2.prototype.copy = function() {
                      var textToCopy = this.getTargetValue();
                      if (this._options.htmlEntities) {
                        textToCopy = this.decodeHTML(textToCopy);
                      }
                      var tempTextArea = document.createElement("textarea");
                      tempTextArea.value = textToCopy;
                      document.body.appendChild(tempTextArea);
                      tempTextArea.select();
                      document.execCommand("copy");
                      document.body.removeChild(tempTextArea);
                      this._options.onCopy(this);
                      return textToCopy;
                    };
                    CopyClipboard2.prototype.decodeHTML = function(html) {
                      var textarea = document.createElement("textarea");
                      textarea.innerHTML = html;
                      return textarea.textContent;
                    };
                    CopyClipboard2.prototype.updateOnCopyCallback = function(callback) {
                      this._options.onCopy = callback;
                    };
                    return CopyClipboard2;
                  })()
                );
                function initCopyClipboards() {
                  document.querySelectorAll("[data-copy-to-clipboard-target]").forEach(function($triggerEl) {
                    var targetId = $triggerEl.getAttribute("data-copy-to-clipboard-target");
                    var $targetEl = document.getElementById(targetId);
                    var contentType = $triggerEl.getAttribute("data-copy-to-clipboard-content-type");
                    var htmlEntities = $triggerEl.getAttribute("data-copy-to-clipboard-html-entities");
                    if ($targetEl) {
                      if (!instances_1.default.instanceExists("CopyClipboard", $targetEl.getAttribute("id"))) {
                        new CopyClipboard($triggerEl, $targetEl, {
                          htmlEntities: htmlEntities && htmlEntities === "true" ? true : Default.htmlEntities,
                          contentType: contentType ? contentType : Default.contentType
                        });
                      }
                    } else {
                      console.error('The target element with id "'.concat(targetId, '" does not exist. Please check the data-copy-to-clipboard-target attribute.'));
                    }
                  });
                }
                exports2.initCopyClipboards = initCopyClipboards;
                if (typeof window !== "undefined") {
                  window.CopyClipboard = CopyClipboard;
                  window.initClipboards = initCopyClipboards;
                }
                exports2["default"] = CopyClipboard;
              })
            ),
            /***/
            5922: (
              /***/
              (function(__unused_webpack_module, exports2, __webpack_require__2) {
                var __assign = this && this.__assign || function() {
                  __assign = Object.assign || function(t) {
                    for (var s, i = 1, n = arguments.length; i < n; i++) {
                      s = arguments[i];
                      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
                    }
                    return t;
                  };
                  return __assign.apply(this, arguments);
                };
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.initCollapses = void 0;
                var instances_1 = __webpack_require__2(7423);
                var Default = {
                  onCollapse: function() {
                  },
                  onExpand: function() {
                  },
                  onToggle: function() {
                  }
                };
                var DefaultInstanceOptions = {
                  id: null,
                  override: true
                };
                var Collapse = (
                  /** @class */
                  (function() {
                    function Collapse2(targetEl, triggerEl, options, instanceOptions) {
                      if (targetEl === void 0) {
                        targetEl = null;
                      }
                      if (triggerEl === void 0) {
                        triggerEl = null;
                      }
                      if (options === void 0) {
                        options = Default;
                      }
                      if (instanceOptions === void 0) {
                        instanceOptions = DefaultInstanceOptions;
                      }
                      this._instanceId = instanceOptions.id ? instanceOptions.id : targetEl.id;
                      this._targetEl = targetEl;
                      this._triggerEl = triggerEl;
                      this._options = __assign(__assign({}, Default), options);
                      this._visible = false;
                      this._initialized = false;
                      this.init();
                      instances_1.default.addInstance("Collapse", this, this._instanceId, instanceOptions.override);
                    }
                    Collapse2.prototype.init = function() {
                      var _this = this;
                      if (this._triggerEl && this._targetEl && !this._initialized) {
                        if (this._triggerEl.hasAttribute("aria-expanded")) {
                          this._visible = this._triggerEl.getAttribute("aria-expanded") === "true";
                        } else {
                          this._visible = !this._targetEl.classList.contains("hidden");
                        }
                        this._clickHandler = function() {
                          _this.toggle();
                        };
                        this._triggerEl.addEventListener("click", this._clickHandler);
                        this._initialized = true;
                      }
                    };
                    Collapse2.prototype.destroy = function() {
                      if (this._triggerEl && this._initialized) {
                        this._triggerEl.removeEventListener("click", this._clickHandler);
                        this._initialized = false;
                      }
                    };
                    Collapse2.prototype.removeInstance = function() {
                      instances_1.default.removeInstance("Collapse", this._instanceId);
                    };
                    Collapse2.prototype.destroyAndRemoveInstance = function() {
                      this.destroy();
                      this.removeInstance();
                    };
                    Collapse2.prototype.collapse = function() {
                      this._targetEl.classList.add("hidden");
                      if (this._triggerEl) {
                        this._triggerEl.setAttribute("aria-expanded", "false");
                      }
                      this._visible = false;
                      this._options.onCollapse(this);
                    };
                    Collapse2.prototype.expand = function() {
                      this._targetEl.classList.remove("hidden");
                      if (this._triggerEl) {
                        this._triggerEl.setAttribute("aria-expanded", "true");
                      }
                      this._visible = true;
                      this._options.onExpand(this);
                    };
                    Collapse2.prototype.toggle = function() {
                      if (this._visible) {
                        this.collapse();
                      } else {
                        this.expand();
                      }
                      this._options.onToggle(this);
                    };
                    Collapse2.prototype.updateOnCollapse = function(callback) {
                      this._options.onCollapse = callback;
                    };
                    Collapse2.prototype.updateOnExpand = function(callback) {
                      this._options.onExpand = callback;
                    };
                    Collapse2.prototype.updateOnToggle = function(callback) {
                      this._options.onToggle = callback;
                    };
                    return Collapse2;
                  })()
                );
                function initCollapses() {
                  document.querySelectorAll("[data-collapse-toggle]").forEach(function($triggerEl) {
                    var targetId = $triggerEl.getAttribute("data-collapse-toggle");
                    var $targetEl = document.getElementById(targetId);
                    if ($targetEl) {
                      if (!instances_1.default.instanceExists("Collapse", $targetEl.getAttribute("id"))) {
                        new Collapse($targetEl, $triggerEl);
                      } else {
                        new Collapse($targetEl, $triggerEl, {}, {
                          id: $targetEl.getAttribute("id") + "_" + instances_1.default._generateRandomId()
                        });
                      }
                    } else {
                      console.error('The target element with id "'.concat(targetId, '" does not exist. Please check the data-collapse-toggle attribute.'));
                    }
                  });
                }
                exports2.initCollapses = initCollapses;
                if (typeof window !== "undefined") {
                  window.Collapse = Collapse;
                  window.initCollapses = initCollapses;
                }
                exports2["default"] = Collapse;
              })
            ),
            /***/
            9132: (
              /***/
              (function(__unused_webpack_module, exports2, __webpack_require__2) {
                var __assign = this && this.__assign || function() {
                  __assign = Object.assign || function(t) {
                    for (var s, i = 1, n = arguments.length; i < n; i++) {
                      s = arguments[i];
                      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
                    }
                    return t;
                  };
                  return __assign.apply(this, arguments);
                };
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.initDatepickers = void 0;
                var instances_1 = __webpack_require__2(7423);
                var flowbite_datepicker_1 = __webpack_require__2(554);
                var Default = {
                  defaultDatepickerId: null,
                  autohide: false,
                  format: "mm/dd/yyyy",
                  maxDate: null,
                  minDate: null,
                  orientation: "bottom",
                  buttons: false,
                  autoSelectToday: 0,
                  title: null,
                  language: "en",
                  rangePicker: false,
                  onShow: function() {
                  },
                  onHide: function() {
                  }
                };
                var DefaultInstanceOptions = {
                  id: null,
                  override: true
                };
                var Datepicker = (
                  /** @class */
                  (function() {
                    function Datepicker2(datepickerEl, options, instanceOptions) {
                      if (datepickerEl === void 0) {
                        datepickerEl = null;
                      }
                      if (options === void 0) {
                        options = Default;
                      }
                      if (instanceOptions === void 0) {
                        instanceOptions = DefaultInstanceOptions;
                      }
                      this._instanceId = instanceOptions.id ? instanceOptions.id : datepickerEl.id;
                      this._datepickerEl = datepickerEl;
                      this._datepickerInstance = null;
                      this._options = __assign(__assign({}, Default), options);
                      this._initialized = false;
                      this.init();
                      instances_1.default.addInstance("Datepicker", this, this._instanceId, instanceOptions.override);
                    }
                    Datepicker2.prototype.init = function() {
                      if (this._datepickerEl && !this._initialized) {
                        if (this._options.rangePicker) {
                          this._datepickerInstance = new flowbite_datepicker_1.DateRangePicker(this._datepickerEl, this._getDatepickerOptions(this._options));
                        } else {
                          this._datepickerInstance = new flowbite_datepicker_1.Datepicker(this._datepickerEl, this._getDatepickerOptions(this._options));
                        }
                        this._initialized = true;
                      }
                    };
                    Datepicker2.prototype.destroy = function() {
                      if (this._initialized) {
                        this._initialized = false;
                        this._datepickerInstance.destroy();
                      }
                    };
                    Datepicker2.prototype.removeInstance = function() {
                      this.destroy();
                      instances_1.default.removeInstance("Datepicker", this._instanceId);
                    };
                    Datepicker2.prototype.destroyAndRemoveInstance = function() {
                      this.destroy();
                      this.removeInstance();
                    };
                    Datepicker2.prototype.getDatepickerInstance = function() {
                      return this._datepickerInstance;
                    };
                    Datepicker2.prototype.getDate = function() {
                      if (this._options.rangePicker && this._datepickerInstance instanceof flowbite_datepicker_1.DateRangePicker) {
                        return this._datepickerInstance.getDates();
                      }
                      if (!this._options.rangePicker && this._datepickerInstance instanceof flowbite_datepicker_1.Datepicker) {
                        return this._datepickerInstance.getDate();
                      }
                    };
                    Datepicker2.prototype.setDate = function(date) {
                      if (this._options.rangePicker && this._datepickerInstance instanceof flowbite_datepicker_1.DateRangePicker) {
                        return this._datepickerInstance.setDates(date);
                      }
                      if (!this._options.rangePicker && this._datepickerInstance instanceof flowbite_datepicker_1.Datepicker) {
                        return this._datepickerInstance.setDate(date);
                      }
                    };
                    Datepicker2.prototype.show = function() {
                      this._datepickerInstance.show();
                      this._options.onShow(this);
                    };
                    Datepicker2.prototype.hide = function() {
                      this._datepickerInstance.hide();
                      this._options.onHide(this);
                    };
                    Datepicker2.prototype._getDatepickerOptions = function(options) {
                      var datepickerOptions = {};
                      if (options.buttons) {
                        datepickerOptions.todayBtn = true;
                        datepickerOptions.clearBtn = true;
                        if (options.autoSelectToday) {
                          datepickerOptions.todayBtnMode = 1;
                        }
                      }
                      if (options.autohide) {
                        datepickerOptions.autohide = true;
                      }
                      if (options.format) {
                        datepickerOptions.format = options.format;
                      }
                      if (options.maxDate) {
                        datepickerOptions.maxDate = options.maxDate;
                      }
                      if (options.minDate) {
                        datepickerOptions.minDate = options.minDate;
                      }
                      if (options.orientation) {
                        datepickerOptions.orientation = options.orientation;
                      }
                      if (options.title) {
                        datepickerOptions.title = options.title;
                      }
                      if (options.language) {
                        datepickerOptions.language = options.language;
                      }
                      return datepickerOptions;
                    };
                    Datepicker2.prototype.updateOnShow = function(callback) {
                      this._options.onShow = callback;
                    };
                    Datepicker2.prototype.updateOnHide = function(callback) {
                      this._options.onHide = callback;
                    };
                    return Datepicker2;
                  })()
                );
                function initDatepickers() {
                  document.querySelectorAll("[datepicker], [inline-datepicker], [date-rangepicker]").forEach(function($datepickerEl) {
                    if ($datepickerEl) {
                      var buttons = $datepickerEl.hasAttribute("datepicker-buttons");
                      var autoselectToday = $datepickerEl.hasAttribute("datepicker-autoselect-today");
                      var autohide = $datepickerEl.hasAttribute("datepicker-autohide");
                      var format = $datepickerEl.getAttribute("datepicker-format");
                      var maxDate = $datepickerEl.getAttribute("datepicker-max-date");
                      var minDate = $datepickerEl.getAttribute("datepicker-min-date");
                      var orientation = $datepickerEl.getAttribute("datepicker-orientation");
                      var title = $datepickerEl.getAttribute("datepicker-title");
                      var language = $datepickerEl.getAttribute("datepicker-language");
                      var rangePicker = $datepickerEl.hasAttribute("date-rangepicker");
                      new Datepicker($datepickerEl, {
                        buttons: buttons ? buttons : Default.buttons,
                        autoSelectToday: autoselectToday ? autoselectToday : Default.autoSelectToday,
                        autohide: autohide ? autohide : Default.autohide,
                        format: format ? format : Default.format,
                        maxDate: maxDate ? maxDate : Default.maxDate,
                        minDate: minDate ? minDate : Default.minDate,
                        orientation: orientation ? orientation : Default.orientation,
                        title: title ? title : Default.title,
                        language: language ? language : Default.language,
                        rangePicker: rangePicker ? rangePicker : Default.rangePicker
                      });
                    } else {
                      console.error("The datepicker element does not exist. Please check the datepicker attribute.");
                    }
                  });
                }
                exports2.initDatepickers = initDatepickers;
                if (typeof window !== "undefined") {
                  window.Datepicker = Datepicker;
                  window.initDatepickers = initDatepickers;
                }
                exports2["default"] = Datepicker;
              })
            ),
            /***/
            1556: (
              /***/
              (function(__unused_webpack_module, exports2, __webpack_require__2) {
                var __assign = this && this.__assign || function() {
                  __assign = Object.assign || function(t) {
                    for (var s, i = 1, n = arguments.length; i < n; i++) {
                      s = arguments[i];
                      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
                    }
                    return t;
                  };
                  return __assign.apply(this, arguments);
                };
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.initDials = void 0;
                var instances_1 = __webpack_require__2(7423);
                var Default = {
                  triggerType: "hover",
                  onShow: function() {
                  },
                  onHide: function() {
                  },
                  onToggle: function() {
                  }
                };
                var DefaultInstanceOptions = {
                  id: null,
                  override: true
                };
                var Dial = (
                  /** @class */
                  (function() {
                    function Dial2(parentEl, triggerEl, targetEl, options, instanceOptions) {
                      if (parentEl === void 0) {
                        parentEl = null;
                      }
                      if (triggerEl === void 0) {
                        triggerEl = null;
                      }
                      if (targetEl === void 0) {
                        targetEl = null;
                      }
                      if (options === void 0) {
                        options = Default;
                      }
                      if (instanceOptions === void 0) {
                        instanceOptions = DefaultInstanceOptions;
                      }
                      this._instanceId = instanceOptions.id ? instanceOptions.id : targetEl.id;
                      this._parentEl = parentEl;
                      this._triggerEl = triggerEl;
                      this._targetEl = targetEl;
                      this._options = __assign(__assign({}, Default), options);
                      this._visible = false;
                      this._initialized = false;
                      this.init();
                      instances_1.default.addInstance("Dial", this, this._instanceId, instanceOptions.override);
                    }
                    Dial2.prototype.init = function() {
                      var _this = this;
                      if (this._triggerEl && this._targetEl && !this._initialized) {
                        var triggerEventTypes = this._getTriggerEventTypes(this._options.triggerType);
                        this._showEventHandler = function() {
                          _this.show();
                        };
                        triggerEventTypes.showEvents.forEach(function(ev) {
                          _this._triggerEl.addEventListener(ev, _this._showEventHandler);
                          _this._targetEl.addEventListener(ev, _this._showEventHandler);
                        });
                        this._hideEventHandler = function() {
                          if (!_this._parentEl.matches(":hover")) {
                            _this.hide();
                          }
                        };
                        triggerEventTypes.hideEvents.forEach(function(ev) {
                          _this._parentEl.addEventListener(ev, _this._hideEventHandler);
                        });
                        this._initialized = true;
                      }
                    };
                    Dial2.prototype.destroy = function() {
                      var _this = this;
                      if (this._initialized) {
                        var triggerEventTypes = this._getTriggerEventTypes(this._options.triggerType);
                        triggerEventTypes.showEvents.forEach(function(ev) {
                          _this._triggerEl.removeEventListener(ev, _this._showEventHandler);
                          _this._targetEl.removeEventListener(ev, _this._showEventHandler);
                        });
                        triggerEventTypes.hideEvents.forEach(function(ev) {
                          _this._parentEl.removeEventListener(ev, _this._hideEventHandler);
                        });
                        this._initialized = false;
                      }
                    };
                    Dial2.prototype.removeInstance = function() {
                      instances_1.default.removeInstance("Dial", this._instanceId);
                    };
                    Dial2.prototype.destroyAndRemoveInstance = function() {
                      this.destroy();
                      this.removeInstance();
                    };
                    Dial2.prototype.hide = function() {
                      this._targetEl.classList.add("hidden");
                      if (this._triggerEl) {
                        this._triggerEl.setAttribute("aria-expanded", "false");
                      }
                      this._visible = false;
                      this._options.onHide(this);
                    };
                    Dial2.prototype.show = function() {
                      this._targetEl.classList.remove("hidden");
                      if (this._triggerEl) {
                        this._triggerEl.setAttribute("aria-expanded", "true");
                      }
                      this._visible = true;
                      this._options.onShow(this);
                    };
                    Dial2.prototype.toggle = function() {
                      if (this._visible) {
                        this.hide();
                      } else {
                        this.show();
                      }
                    };
                    Dial2.prototype.isHidden = function() {
                      return !this._visible;
                    };
                    Dial2.prototype.isVisible = function() {
                      return this._visible;
                    };
                    Dial2.prototype._getTriggerEventTypes = function(triggerType) {
                      switch (triggerType) {
                        case "hover":
                          return {
                            showEvents: ["mouseenter", "focus"],
                            hideEvents: ["mouseleave", "blur"]
                          };
                        case "click":
                          return {
                            showEvents: ["click", "focus"],
                            hideEvents: ["focusout", "blur"]
                          };
                        case "none":
                          return {
                            showEvents: [],
                            hideEvents: []
                          };
                        default:
                          return {
                            showEvents: ["mouseenter", "focus"],
                            hideEvents: ["mouseleave", "blur"]
                          };
                      }
                    };
                    Dial2.prototype.updateOnShow = function(callback) {
                      this._options.onShow = callback;
                    };
                    Dial2.prototype.updateOnHide = function(callback) {
                      this._options.onHide = callback;
                    };
                    Dial2.prototype.updateOnToggle = function(callback) {
                      this._options.onToggle = callback;
                    };
                    return Dial2;
                  })()
                );
                function initDials() {
                  document.querySelectorAll("[data-dial-init]").forEach(function($parentEl) {
                    var $triggerEl = $parentEl.querySelector("[data-dial-toggle]");
                    if ($triggerEl) {
                      var dialId = $triggerEl.getAttribute("data-dial-toggle");
                      var $dialEl = document.getElementById(dialId);
                      if ($dialEl) {
                        var triggerType = $triggerEl.getAttribute("data-dial-trigger");
                        new Dial($parentEl, $triggerEl, $dialEl, {
                          triggerType: triggerType ? triggerType : Default.triggerType
                        });
                      } else {
                        console.error("Dial with id ".concat(dialId, " does not exist. Are you sure that the data-dial-toggle attribute points to the correct modal id?"));
                      }
                    } else {
                      console.error("Dial with id ".concat($parentEl.id, " does not have a trigger element. Are you sure that the data-dial-toggle attribute exists?"));
                    }
                  });
                }
                exports2.initDials = initDials;
                if (typeof window !== "undefined") {
                  window.Dial = Dial;
                  window.initDials = initDials;
                }
                exports2["default"] = Dial;
              })
            ),
            /***/
            1791: (
              /***/
              (function(__unused_webpack_module, exports2, __webpack_require__2) {
                var __assign = this && this.__assign || function() {
                  __assign = Object.assign || function(t) {
                    for (var s, i = 1, n = arguments.length; i < n; i++) {
                      s = arguments[i];
                      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
                    }
                    return t;
                  };
                  return __assign.apply(this, arguments);
                };
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.initDismisses = void 0;
                var instances_1 = __webpack_require__2(7423);
                var Default = {
                  transition: "transition-opacity",
                  duration: 300,
                  timing: "ease-out",
                  onHide: function() {
                  }
                };
                var DefaultInstanceOptions = {
                  id: null,
                  override: true
                };
                var Dismiss = (
                  /** @class */
                  (function() {
                    function Dismiss2(targetEl, triggerEl, options, instanceOptions) {
                      if (targetEl === void 0) {
                        targetEl = null;
                      }
                      if (triggerEl === void 0) {
                        triggerEl = null;
                      }
                      if (options === void 0) {
                        options = Default;
                      }
                      if (instanceOptions === void 0) {
                        instanceOptions = DefaultInstanceOptions;
                      }
                      this._instanceId = instanceOptions.id ? instanceOptions.id : targetEl.id;
                      this._targetEl = targetEl;
                      this._triggerEl = triggerEl;
                      this._options = __assign(__assign({}, Default), options);
                      this._initialized = false;
                      this.init();
                      instances_1.default.addInstance("Dismiss", this, this._instanceId, instanceOptions.override);
                    }
                    Dismiss2.prototype.init = function() {
                      var _this = this;
                      if (this._triggerEl && this._targetEl && !this._initialized) {
                        this._clickHandler = function() {
                          _this.hide();
                        };
                        this._triggerEl.addEventListener("click", this._clickHandler);
                        this._initialized = true;
                      }
                    };
                    Dismiss2.prototype.destroy = function() {
                      if (this._triggerEl && this._initialized) {
                        this._triggerEl.removeEventListener("click", this._clickHandler);
                        this._initialized = false;
                      }
                    };
                    Dismiss2.prototype.removeInstance = function() {
                      instances_1.default.removeInstance("Dismiss", this._instanceId);
                    };
                    Dismiss2.prototype.destroyAndRemoveInstance = function() {
                      this.destroy();
                      this.removeInstance();
                    };
                    Dismiss2.prototype.hide = function() {
                      var _this = this;
                      this._targetEl.classList.add(this._options.transition, "duration-".concat(this._options.duration), this._options.timing, "opacity-0");
                      setTimeout(function() {
                        _this._targetEl.classList.add("hidden");
                      }, this._options.duration);
                      this._options.onHide(this, this._targetEl);
                    };
                    Dismiss2.prototype.updateOnHide = function(callback) {
                      this._options.onHide = callback;
                    };
                    return Dismiss2;
                  })()
                );
                function initDismisses() {
                  document.querySelectorAll("[data-dismiss-target]").forEach(function($triggerEl) {
                    var targetId = $triggerEl.getAttribute("data-dismiss-target");
                    var $dismissEl = document.querySelector(targetId);
                    if ($dismissEl) {
                      new Dismiss($dismissEl, $triggerEl);
                    } else {
                      console.error('The dismiss element with id "'.concat(targetId, '" does not exist. Please check the data-dismiss-target attribute.'));
                    }
                  });
                }
                exports2.initDismisses = initDismisses;
                if (typeof window !== "undefined") {
                  window.Dismiss = Dismiss;
                  window.initDismisses = initDismisses;
                }
                exports2["default"] = Dismiss;
              })
            ),
            /***/
            1340: (
              /***/
              (function(__unused_webpack_module, exports2, __webpack_require__2) {
                var __assign = this && this.__assign || function() {
                  __assign = Object.assign || function(t) {
                    for (var s, i = 1, n = arguments.length; i < n; i++) {
                      s = arguments[i];
                      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
                    }
                    return t;
                  };
                  return __assign.apply(this, arguments);
                };
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.initDrawers = void 0;
                var instances_1 = __webpack_require__2(7423);
                var Default = {
                  placement: "left",
                  bodyScrolling: false,
                  backdrop: true,
                  edge: false,
                  edgeOffset: "bottom-[60px]",
                  backdropClasses: "bg-dark-backdrop/70 fixed inset-0 z-30",
                  onShow: function() {
                  },
                  onHide: function() {
                  },
                  onToggle: function() {
                  }
                };
                var DefaultInstanceOptions = {
                  id: null,
                  override: true
                };
                var Drawer = (
                  /** @class */
                  (function() {
                    function Drawer2(targetEl, options, instanceOptions) {
                      if (targetEl === void 0) {
                        targetEl = null;
                      }
                      if (options === void 0) {
                        options = Default;
                      }
                      if (instanceOptions === void 0) {
                        instanceOptions = DefaultInstanceOptions;
                      }
                      this._eventListenerInstances = [];
                      this._instanceId = instanceOptions.id ? instanceOptions.id : targetEl.id;
                      this._targetEl = targetEl;
                      this._options = __assign(__assign({}, Default), options);
                      this._visible = false;
                      this._initialized = false;
                      this.init();
                      instances_1.default.addInstance("Drawer", this, this._instanceId, instanceOptions.override);
                    }
                    Drawer2.prototype.init = function() {
                      var _this = this;
                      if (this._targetEl && !this._initialized) {
                        this._targetEl.setAttribute("aria-hidden", "true");
                        this._targetEl.classList.add("transition-transform");
                        this._getPlacementClasses(this._options.placement).base.map(function(c) {
                          _this._targetEl.classList.add(c);
                        });
                        this._handleEscapeKey = function(event) {
                          if (event.key === "Escape") {
                            if (_this.isVisible()) {
                              _this.hide();
                            }
                          }
                        };
                        document.addEventListener("keydown", this._handleEscapeKey);
                        this._initialized = true;
                      }
                    };
                    Drawer2.prototype.destroy = function() {
                      if (this._initialized) {
                        this.removeAllEventListenerInstances();
                        this._destroyBackdropEl();
                        document.removeEventListener("keydown", this._handleEscapeKey);
                        this._initialized = false;
                      }
                    };
                    Drawer2.prototype.removeInstance = function() {
                      instances_1.default.removeInstance("Drawer", this._instanceId);
                    };
                    Drawer2.prototype.destroyAndRemoveInstance = function() {
                      this.destroy();
                      this.removeInstance();
                    };
                    Drawer2.prototype.hide = function() {
                      var _this = this;
                      if (this._options.edge) {
                        this._getPlacementClasses(this._options.placement + "-edge").active.map(function(c) {
                          _this._targetEl.classList.remove(c);
                        });
                        this._getPlacementClasses(this._options.placement + "-edge").inactive.map(function(c) {
                          _this._targetEl.classList.add(c);
                        });
                      } else {
                        this._getPlacementClasses(this._options.placement).active.map(function(c) {
                          _this._targetEl.classList.remove(c);
                        });
                        this._getPlacementClasses(this._options.placement).inactive.map(function(c) {
                          _this._targetEl.classList.add(c);
                        });
                      }
                      this._targetEl.setAttribute("aria-hidden", "true");
                      this._targetEl.removeAttribute("aria-modal");
                      this._targetEl.removeAttribute("role");
                      if (!this._options.bodyScrolling) {
                        document.body.classList.remove("overflow-hidden");
                      }
                      if (this._options.backdrop) {
                        this._destroyBackdropEl();
                      }
                      this._visible = false;
                      this._options.onHide(this);
                    };
                    Drawer2.prototype.show = function() {
                      var _this = this;
                      if (this._options.edge) {
                        this._getPlacementClasses(this._options.placement + "-edge").active.map(function(c) {
                          _this._targetEl.classList.add(c);
                        });
                        this._getPlacementClasses(this._options.placement + "-edge").inactive.map(function(c) {
                          _this._targetEl.classList.remove(c);
                        });
                      } else {
                        this._getPlacementClasses(this._options.placement).active.map(function(c) {
                          _this._targetEl.classList.add(c);
                        });
                        this._getPlacementClasses(this._options.placement).inactive.map(function(c) {
                          _this._targetEl.classList.remove(c);
                        });
                      }
                      this._targetEl.setAttribute("aria-modal", "true");
                      this._targetEl.setAttribute("role", "dialog");
                      this._targetEl.removeAttribute("aria-hidden");
                      if (!this._options.bodyScrolling) {
                        document.body.classList.add("overflow-hidden");
                      }
                      if (this._options.backdrop) {
                        this._createBackdrop();
                      }
                      this._visible = true;
                      this._options.onShow(this);
                    };
                    Drawer2.prototype.toggle = function() {
                      if (this.isVisible()) {
                        this.hide();
                      } else {
                        this.show();
                      }
                    };
                    Drawer2.prototype._createBackdrop = function() {
                      var _a;
                      var _this = this;
                      if (!this._visible) {
                        var backdropEl = document.createElement("div");
                        backdropEl.setAttribute("drawer-backdrop", "");
                        (_a = backdropEl.classList).add.apply(_a, this._options.backdropClasses.split(" "));
                        document.querySelector("body").append(backdropEl);
                        backdropEl.addEventListener("click", function() {
                          _this.hide();
                        });
                      }
                    };
                    Drawer2.prototype._destroyBackdropEl = function() {
                      if (this._visible && document.querySelector("[drawer-backdrop]") !== null) {
                        document.querySelector("[drawer-backdrop]").remove();
                      }
                    };
                    Drawer2.prototype._getPlacementClasses = function(placement) {
                      switch (placement) {
                        case "top":
                          return {
                            base: ["top-0", "left-0", "right-0"],
                            active: ["transform-none"],
                            inactive: ["-translate-y-full"]
                          };
                        case "right":
                          return {
                            base: ["right-0", "top-0"],
                            active: ["transform-none"],
                            inactive: ["translate-x-full"]
                          };
                        case "bottom":
                          return {
                            base: ["bottom-0", "left-0", "right-0"],
                            active: ["transform-none"],
                            inactive: ["translate-y-full"]
                          };
                        case "left":
                          return {
                            base: ["left-0", "top-0"],
                            active: ["transform-none"],
                            inactive: ["-translate-x-full"]
                          };
                        case "bottom-edge":
                          return {
                            base: ["left-0", "top-0"],
                            active: ["transform-none"],
                            inactive: ["translate-y-full", this._options.edgeOffset]
                          };
                        default:
                          return {
                            base: ["left-0", "top-0"],
                            active: ["transform-none"],
                            inactive: ["-translate-x-full"]
                          };
                      }
                    };
                    Drawer2.prototype.isHidden = function() {
                      return !this._visible;
                    };
                    Drawer2.prototype.isVisible = function() {
                      return this._visible;
                    };
                    Drawer2.prototype.addEventListenerInstance = function(element, type, handler) {
                      this._eventListenerInstances.push({
                        element,
                        type,
                        handler
                      });
                    };
                    Drawer2.prototype.removeAllEventListenerInstances = function() {
                      this._eventListenerInstances.map(function(eventListenerInstance) {
                        eventListenerInstance.element.removeEventListener(eventListenerInstance.type, eventListenerInstance.handler);
                      });
                      this._eventListenerInstances = [];
                    };
                    Drawer2.prototype.getAllEventListenerInstances = function() {
                      return this._eventListenerInstances;
                    };
                    Drawer2.prototype.updateOnShow = function(callback) {
                      this._options.onShow = callback;
                    };
                    Drawer2.prototype.updateOnHide = function(callback) {
                      this._options.onHide = callback;
                    };
                    Drawer2.prototype.updateOnToggle = function(callback) {
                      this._options.onToggle = callback;
                    };
                    return Drawer2;
                  })()
                );
                function initDrawers() {
                  document.querySelectorAll("[data-drawer-target]").forEach(function($triggerEl) {
                    var drawerId = $triggerEl.getAttribute("data-drawer-target");
                    var $drawerEl = document.getElementById(drawerId);
                    if ($drawerEl) {
                      var placement = $triggerEl.getAttribute("data-drawer-placement");
                      var bodyScrolling = $triggerEl.getAttribute("data-drawer-body-scrolling");
                      var backdrop = $triggerEl.getAttribute("data-drawer-backdrop");
                      var edge = $triggerEl.getAttribute("data-drawer-edge");
                      var edgeOffset = $triggerEl.getAttribute("data-drawer-edge-offset");
                      new Drawer($drawerEl, {
                        placement: placement ? placement : Default.placement,
                        bodyScrolling: bodyScrolling ? bodyScrolling === "true" ? true : false : Default.bodyScrolling,
                        backdrop: backdrop ? backdrop === "true" ? true : false : Default.backdrop,
                        edge: edge ? edge === "true" ? true : false : Default.edge,
                        edgeOffset: edgeOffset ? edgeOffset : Default.edgeOffset
                      });
                    } else {
                      console.error("Drawer with id ".concat(drawerId, " not found. Are you sure that the data-drawer-target attribute points to the correct drawer id?"));
                    }
                  });
                  document.querySelectorAll("[data-drawer-toggle]").forEach(function($triggerEl) {
                    var drawerId = $triggerEl.getAttribute("data-drawer-toggle");
                    var $drawerEl = document.getElementById(drawerId);
                    if ($drawerEl) {
                      var drawer_1 = instances_1.default.getInstance("Drawer", drawerId);
                      if (drawer_1) {
                        var toggleDrawer = function() {
                          drawer_1.toggle();
                        };
                        $triggerEl.addEventListener("click", toggleDrawer);
                        drawer_1.addEventListenerInstance($triggerEl, "click", toggleDrawer);
                      } else {
                        console.error("Drawer with id ".concat(drawerId, " has not been initialized. Please initialize it using the data-drawer-target attribute."));
                      }
                    } else {
                      console.error("Drawer with id ".concat(drawerId, " not found. Are you sure that the data-drawer-target attribute points to the correct drawer id?"));
                    }
                  });
                  document.querySelectorAll("[data-drawer-dismiss], [data-drawer-hide]").forEach(function($triggerEl) {
                    var drawerId = $triggerEl.getAttribute("data-drawer-dismiss") ? $triggerEl.getAttribute("data-drawer-dismiss") : $triggerEl.getAttribute("data-drawer-hide");
                    var $drawerEl = document.getElementById(drawerId);
                    if ($drawerEl) {
                      var drawer_2 = instances_1.default.getInstance("Drawer", drawerId);
                      if (drawer_2) {
                        var hideDrawer = function() {
                          drawer_2.hide();
                        };
                        $triggerEl.addEventListener("click", hideDrawer);
                        drawer_2.addEventListenerInstance($triggerEl, "click", hideDrawer);
                      } else {
                        console.error("Drawer with id ".concat(drawerId, " has not been initialized. Please initialize it using the data-drawer-target attribute."));
                      }
                    } else {
                      console.error("Drawer with id ".concat(drawerId, " not found. Are you sure that the data-drawer-target attribute points to the correct drawer id"));
                    }
                  });
                  document.querySelectorAll("[data-drawer-show]").forEach(function($triggerEl) {
                    var drawerId = $triggerEl.getAttribute("data-drawer-show");
                    var $drawerEl = document.getElementById(drawerId);
                    if ($drawerEl) {
                      var drawer_3 = instances_1.default.getInstance("Drawer", drawerId);
                      if (drawer_3) {
                        var showDrawer = function() {
                          drawer_3.show();
                        };
                        $triggerEl.addEventListener("click", showDrawer);
                        drawer_3.addEventListenerInstance($triggerEl, "click", showDrawer);
                      } else {
                        console.error("Drawer with id ".concat(drawerId, " has not been initialized. Please initialize it using the data-drawer-target attribute."));
                      }
                    } else {
                      console.error("Drawer with id ".concat(drawerId, " not found. Are you sure that the data-drawer-target attribute points to the correct drawer id?"));
                    }
                  });
                }
                exports2.initDrawers = initDrawers;
                if (typeof window !== "undefined") {
                  window.Drawer = Drawer;
                  window.initDrawers = initDrawers;
                }
                exports2["default"] = Drawer;
              })
            ),
            /***/
            4316: (
              /***/
              (function(__unused_webpack_module, exports2, __webpack_require__2) {
                var __assign = this && this.__assign || function() {
                  __assign = Object.assign || function(t) {
                    for (var s, i = 1, n = arguments.length; i < n; i++) {
                      s = arguments[i];
                      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
                    }
                    return t;
                  };
                  return __assign.apply(this, arguments);
                };
                var __spreadArray = this && this.__spreadArray || function(to, from, pack) {
                  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
                    if (ar || !(i in from)) {
                      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                      ar[i] = from[i];
                    }
                  }
                  return to.concat(ar || Array.prototype.slice.call(from));
                };
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.initDropdowns = void 0;
                var core_1 = __webpack_require__2(3853);
                var instances_1 = __webpack_require__2(7423);
                var Default = {
                  placement: "bottom",
                  triggerType: "click",
                  offsetSkidding: 0,
                  offsetDistance: 10,
                  delay: 300,
                  ignoreClickOutsideClass: false,
                  onShow: function() {
                  },
                  onHide: function() {
                  },
                  onToggle: function() {
                  }
                };
                var DefaultInstanceOptions = {
                  id: null,
                  override: true
                };
                var Dropdown = (
                  /** @class */
                  (function() {
                    function Dropdown2(targetElement, triggerElement, options, instanceOptions) {
                      if (targetElement === void 0) {
                        targetElement = null;
                      }
                      if (triggerElement === void 0) {
                        triggerElement = null;
                      }
                      if (options === void 0) {
                        options = Default;
                      }
                      if (instanceOptions === void 0) {
                        instanceOptions = DefaultInstanceOptions;
                      }
                      this._instanceId = instanceOptions.id ? instanceOptions.id : targetElement.id;
                      this._targetEl = targetElement;
                      this._triggerEl = triggerElement;
                      this._options = __assign(__assign({}, Default), options);
                      this._popperInstance = null;
                      this._visible = false;
                      this._initialized = false;
                      this.init();
                      instances_1.default.addInstance("Dropdown", this, this._instanceId, instanceOptions.override);
                    }
                    Dropdown2.prototype.init = function() {
                      if (this._triggerEl && this._targetEl && !this._initialized) {
                        this._popperInstance = this._createPopperInstance();
                        this._setupEventListeners();
                        this._initialized = true;
                      }
                    };
                    Dropdown2.prototype.destroy = function() {
                      var _this = this;
                      var triggerEvents = this._getTriggerEvents();
                      if (this._options.triggerType === "click") {
                        triggerEvents.showEvents.forEach(function(ev) {
                          _this._triggerEl.removeEventListener(ev, _this._clickHandler);
                        });
                      }
                      if (this._options.triggerType === "hover") {
                        triggerEvents.showEvents.forEach(function(ev) {
                          _this._triggerEl.removeEventListener(ev, _this._hoverShowTriggerElHandler);
                          _this._targetEl.removeEventListener(ev, _this._hoverShowTargetElHandler);
                        });
                        triggerEvents.hideEvents.forEach(function(ev) {
                          _this._triggerEl.removeEventListener(ev, _this._hoverHideHandler);
                          _this._targetEl.removeEventListener(ev, _this._hoverHideHandler);
                        });
                      }
                      this._popperInstance.destroy();
                      this._initialized = false;
                    };
                    Dropdown2.prototype.removeInstance = function() {
                      instances_1.default.removeInstance("Dropdown", this._instanceId);
                    };
                    Dropdown2.prototype.destroyAndRemoveInstance = function() {
                      this.destroy();
                      this.removeInstance();
                    };
                    Dropdown2.prototype._setupEventListeners = function() {
                      var _this = this;
                      var triggerEvents = this._getTriggerEvents();
                      this._clickHandler = function() {
                        _this.toggle();
                      };
                      if (this._options.triggerType === "click") {
                        triggerEvents.showEvents.forEach(function(ev) {
                          _this._triggerEl.addEventListener(ev, _this._clickHandler);
                        });
                      }
                      this._hoverShowTriggerElHandler = function(ev) {
                        if (ev.type === "click") {
                          _this.toggle();
                        } else {
                          setTimeout(function() {
                            _this.show();
                          }, _this._options.delay);
                        }
                      };
                      this._hoverShowTargetElHandler = function() {
                        _this.show();
                      };
                      this._hoverHideHandler = function() {
                        setTimeout(function() {
                          if (!_this._targetEl.matches(":hover")) {
                            _this.hide();
                          }
                        }, _this._options.delay);
                      };
                      if (this._options.triggerType === "hover") {
                        triggerEvents.showEvents.forEach(function(ev) {
                          _this._triggerEl.addEventListener(ev, _this._hoverShowTriggerElHandler);
                          _this._targetEl.addEventListener(ev, _this._hoverShowTargetElHandler);
                        });
                        triggerEvents.hideEvents.forEach(function(ev) {
                          _this._triggerEl.addEventListener(ev, _this._hoverHideHandler);
                          _this._targetEl.addEventListener(ev, _this._hoverHideHandler);
                        });
                      }
                    };
                    Dropdown2.prototype._createPopperInstance = function() {
                      return (0, core_1.createPopper)(this._triggerEl, this._targetEl, {
                        placement: this._options.placement,
                        modifiers: [
                          {
                            name: "offset",
                            options: {
                              offset: [
                                this._options.offsetSkidding,
                                this._options.offsetDistance
                              ]
                            }
                          }
                        ]
                      });
                    };
                    Dropdown2.prototype._setupClickOutsideListener = function() {
                      var _this = this;
                      this._clickOutsideEventListener = function(ev) {
                        _this._handleClickOutside(ev, _this._targetEl);
                      };
                      document.body.addEventListener("click", this._clickOutsideEventListener, true);
                    };
                    Dropdown2.prototype._removeClickOutsideListener = function() {
                      document.body.removeEventListener("click", this._clickOutsideEventListener, true);
                    };
                    Dropdown2.prototype._handleClickOutside = function(ev, targetEl) {
                      var clickedEl = ev.target;
                      var ignoreClickOutsideClass = this._options.ignoreClickOutsideClass;
                      var isIgnored = false;
                      if (ignoreClickOutsideClass) {
                        var ignoredClickOutsideEls = document.querySelectorAll(".".concat(ignoreClickOutsideClass));
                        ignoredClickOutsideEls.forEach(function(el) {
                          if (el.contains(clickedEl)) {
                            isIgnored = true;
                            return;
                          }
                        });
                      }
                      if (clickedEl !== targetEl && !targetEl.contains(clickedEl) && !this._triggerEl.contains(clickedEl) && !isIgnored && this.isVisible()) {
                        this.hide();
                      }
                    };
                    Dropdown2.prototype._getTriggerEvents = function() {
                      switch (this._options.triggerType) {
                        case "hover":
                          return {
                            showEvents: ["mouseenter", "click"],
                            hideEvents: ["mouseleave"]
                          };
                        case "click":
                          return {
                            showEvents: ["click"],
                            hideEvents: []
                          };
                        case "none":
                          return {
                            showEvents: [],
                            hideEvents: []
                          };
                        default:
                          return {
                            showEvents: ["click"],
                            hideEvents: []
                          };
                      }
                    };
                    Dropdown2.prototype.toggle = function() {
                      if (this.isVisible()) {
                        this.hide();
                      } else {
                        this.show();
                      }
                      this._options.onToggle(this);
                    };
                    Dropdown2.prototype.isVisible = function() {
                      return this._visible;
                    };
                    Dropdown2.prototype.show = function() {
                      this._targetEl.classList.remove("hidden");
                      this._targetEl.classList.add("block");
                      this._targetEl.removeAttribute("aria-hidden");
                      this._popperInstance.setOptions(function(options) {
                        return __assign(__assign({}, options), { modifiers: __spreadArray(__spreadArray([], options.modifiers, true), [
                          { name: "eventListeners", enabled: true }
                        ], false) });
                      });
                      this._setupClickOutsideListener();
                      this._popperInstance.update();
                      this._visible = true;
                      this._options.onShow(this);
                    };
                    Dropdown2.prototype.hide = function() {
                      this._targetEl.classList.remove("block");
                      this._targetEl.classList.add("hidden");
                      this._targetEl.setAttribute("aria-hidden", "true");
                      this._popperInstance.setOptions(function(options) {
                        return __assign(__assign({}, options), { modifiers: __spreadArray(__spreadArray([], options.modifiers, true), [
                          { name: "eventListeners", enabled: false }
                        ], false) });
                      });
                      this._visible = false;
                      this._removeClickOutsideListener();
                      this._options.onHide(this);
                    };
                    Dropdown2.prototype.updateOnShow = function(callback) {
                      this._options.onShow = callback;
                    };
                    Dropdown2.prototype.updateOnHide = function(callback) {
                      this._options.onHide = callback;
                    };
                    Dropdown2.prototype.updateOnToggle = function(callback) {
                      this._options.onToggle = callback;
                    };
                    return Dropdown2;
                  })()
                );
                function initDropdowns() {
                  document.querySelectorAll("[data-dropdown-toggle]").forEach(function($triggerEl) {
                    var dropdownId = $triggerEl.getAttribute("data-dropdown-toggle");
                    var $dropdownEl = document.getElementById(dropdownId);
                    if ($dropdownEl) {
                      var placement = $triggerEl.getAttribute("data-dropdown-placement");
                      var offsetSkidding = $triggerEl.getAttribute("data-dropdown-offset-skidding");
                      var offsetDistance = $triggerEl.getAttribute("data-dropdown-offset-distance");
                      var triggerType = $triggerEl.getAttribute("data-dropdown-trigger");
                      var delay = $triggerEl.getAttribute("data-dropdown-delay");
                      var ignoreClickOutsideClass = $triggerEl.getAttribute("data-dropdown-ignore-click-outside-class");
                      new Dropdown($dropdownEl, $triggerEl, {
                        placement: placement ? placement : Default.placement,
                        triggerType: triggerType ? triggerType : Default.triggerType,
                        offsetSkidding: offsetSkidding ? parseInt(offsetSkidding) : Default.offsetSkidding,
                        offsetDistance: offsetDistance ? parseInt(offsetDistance) : Default.offsetDistance,
                        delay: delay ? parseInt(delay) : Default.delay,
                        ignoreClickOutsideClass: ignoreClickOutsideClass ? ignoreClickOutsideClass : Default.ignoreClickOutsideClass
                      });
                    } else {
                      console.error('The dropdown element with id "'.concat(dropdownId, '" does not exist. Please check the data-dropdown-toggle attribute.'));
                    }
                  });
                }
                exports2.initDropdowns = initDropdowns;
                if (typeof window !== "undefined") {
                  window.Dropdown = Dropdown;
                  window.initDropdowns = initDropdowns;
                }
                exports2["default"] = Dropdown;
              })
            ),
            /***/
            1311: (
              /***/
              (function(__unused_webpack_module, exports2, __webpack_require__2) {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.initFlowbite = void 0;
                var accordion_1 = __webpack_require__2(902);
                var carousel_1 = __webpack_require__2(6033);
                var clipboard_1 = __webpack_require__2(2673);
                var collapse_1 = __webpack_require__2(5922);
                var dial_1 = __webpack_require__2(1556);
                var dismiss_1 = __webpack_require__2(1791);
                var drawer_1 = __webpack_require__2(1340);
                var dropdown_1 = __webpack_require__2(4316);
                var input_counter_1 = __webpack_require__2(3656);
                var modal_1 = __webpack_require__2(16);
                var popover_1 = __webpack_require__2(5903);
                var tabs_1 = __webpack_require__2(4247);
                var tooltip_1 = __webpack_require__2(1671);
                var datepicker_1 = __webpack_require__2(9132);
                function initFlowbite() {
                  (0, accordion_1.initAccordions)();
                  (0, collapse_1.initCollapses)();
                  (0, carousel_1.initCarousels)();
                  (0, dismiss_1.initDismisses)();
                  (0, dropdown_1.initDropdowns)();
                  (0, modal_1.initModals)();
                  (0, drawer_1.initDrawers)();
                  (0, tabs_1.initTabs)();
                  (0, tooltip_1.initTooltips)();
                  (0, popover_1.initPopovers)();
                  (0, dial_1.initDials)();
                  (0, input_counter_1.initInputCounters)();
                  (0, clipboard_1.initCopyClipboards)();
                  (0, datepicker_1.initDatepickers)();
                }
                exports2.initFlowbite = initFlowbite;
                if (typeof window !== "undefined") {
                  window.initFlowbite = initFlowbite;
                }
              })
            ),
            /***/
            3656: (
              /***/
              (function(__unused_webpack_module, exports2, __webpack_require__2) {
                var __assign = this && this.__assign || function() {
                  __assign = Object.assign || function(t) {
                    for (var s, i = 1, n = arguments.length; i < n; i++) {
                      s = arguments[i];
                      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
                    }
                    return t;
                  };
                  return __assign.apply(this, arguments);
                };
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.initInputCounters = void 0;
                var instances_1 = __webpack_require__2(7423);
                var Default = {
                  minValue: null,
                  maxValue: null,
                  onIncrement: function() {
                  },
                  onDecrement: function() {
                  }
                };
                var DefaultInstanceOptions = {
                  id: null,
                  override: true
                };
                var InputCounter = (
                  /** @class */
                  (function() {
                    function InputCounter2(targetEl, incrementEl, decrementEl, options, instanceOptions) {
                      if (targetEl === void 0) {
                        targetEl = null;
                      }
                      if (incrementEl === void 0) {
                        incrementEl = null;
                      }
                      if (decrementEl === void 0) {
                        decrementEl = null;
                      }
                      if (options === void 0) {
                        options = Default;
                      }
                      if (instanceOptions === void 0) {
                        instanceOptions = DefaultInstanceOptions;
                      }
                      this._instanceId = instanceOptions.id ? instanceOptions.id : targetEl.id;
                      this._targetEl = targetEl;
                      this._incrementEl = incrementEl;
                      this._decrementEl = decrementEl;
                      this._options = __assign(__assign({}, Default), options);
                      this._initialized = false;
                      this.init();
                      instances_1.default.addInstance("InputCounter", this, this._instanceId, instanceOptions.override);
                    }
                    InputCounter2.prototype.init = function() {
                      var _this = this;
                      if (this._targetEl && !this._initialized) {
                        this._inputHandler = function(event) {
                          {
                            var target = event.target;
                            if (!/^\d*$/.test(target.value)) {
                              target.value = target.value.replace(/[^\d]/g, "");
                            }
                            if (_this._options.maxValue !== null && parseInt(target.value) > _this._options.maxValue) {
                              target.value = _this._options.maxValue.toString();
                            }
                            if (_this._options.minValue !== null && parseInt(target.value) < _this._options.minValue) {
                              target.value = _this._options.minValue.toString();
                            }
                          }
                        };
                        this._incrementClickHandler = function() {
                          _this.increment();
                        };
                        this._decrementClickHandler = function() {
                          _this.decrement();
                        };
                        this._targetEl.addEventListener("input", this._inputHandler);
                        if (this._incrementEl) {
                          this._incrementEl.addEventListener("click", this._incrementClickHandler);
                        }
                        if (this._decrementEl) {
                          this._decrementEl.addEventListener("click", this._decrementClickHandler);
                        }
                        this._initialized = true;
                      }
                    };
                    InputCounter2.prototype.destroy = function() {
                      if (this._targetEl && this._initialized) {
                        this._targetEl.removeEventListener("input", this._inputHandler);
                        if (this._incrementEl) {
                          this._incrementEl.removeEventListener("click", this._incrementClickHandler);
                        }
                        if (this._decrementEl) {
                          this._decrementEl.removeEventListener("click", this._decrementClickHandler);
                        }
                        this._initialized = false;
                      }
                    };
                    InputCounter2.prototype.removeInstance = function() {
                      instances_1.default.removeInstance("InputCounter", this._instanceId);
                    };
                    InputCounter2.prototype.destroyAndRemoveInstance = function() {
                      this.destroy();
                      this.removeInstance();
                    };
                    InputCounter2.prototype.getCurrentValue = function() {
                      return parseInt(this._targetEl.value) || 0;
                    };
                    InputCounter2.prototype.increment = function() {
                      if (this._options.maxValue !== null && this.getCurrentValue() >= this._options.maxValue) {
                        return;
                      }
                      this._targetEl.value = (this.getCurrentValue() + 1).toString();
                      this._options.onIncrement(this);
                    };
                    InputCounter2.prototype.decrement = function() {
                      if (this._options.minValue !== null && this.getCurrentValue() <= this._options.minValue) {
                        return;
                      }
                      this._targetEl.value = (this.getCurrentValue() - 1).toString();
                      this._options.onDecrement(this);
                    };
                    InputCounter2.prototype.updateOnIncrement = function(callback) {
                      this._options.onIncrement = callback;
                    };
                    InputCounter2.prototype.updateOnDecrement = function(callback) {
                      this._options.onDecrement = callback;
                    };
                    return InputCounter2;
                  })()
                );
                function initInputCounters() {
                  document.querySelectorAll("[data-input-counter]").forEach(function($targetEl) {
                    var targetId = $targetEl.id;
                    var $incrementEl = document.querySelector('[data-input-counter-increment="' + targetId + '"]');
                    var $decrementEl = document.querySelector('[data-input-counter-decrement="' + targetId + '"]');
                    var minValue = $targetEl.getAttribute("data-input-counter-min");
                    var maxValue = $targetEl.getAttribute("data-input-counter-max");
                    if ($targetEl) {
                      if (!instances_1.default.instanceExists("InputCounter", $targetEl.getAttribute("id"))) {
                        new InputCounter($targetEl, $incrementEl ? $incrementEl : null, $decrementEl ? $decrementEl : null, {
                          minValue: minValue ? parseInt(minValue) : null,
                          maxValue: maxValue ? parseInt(maxValue) : null
                        });
                      }
                    } else {
                      console.error('The target element with id "'.concat(targetId, '" does not exist. Please check the data-input-counter attribute.'));
                    }
                  });
                }
                exports2.initInputCounters = initInputCounters;
                if (typeof window !== "undefined") {
                  window.InputCounter = InputCounter;
                  window.initInputCounters = initInputCounters;
                }
                exports2["default"] = InputCounter;
              })
            ),
            /***/
            16: (
              /***/
              (function(__unused_webpack_module, exports2, __webpack_require__2) {
                var __assign = this && this.__assign || function() {
                  __assign = Object.assign || function(t) {
                    for (var s, i = 1, n = arguments.length; i < n; i++) {
                      s = arguments[i];
                      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
                    }
                    return t;
                  };
                  return __assign.apply(this, arguments);
                };
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.initModals = void 0;
                var instances_1 = __webpack_require__2(7423);
                var Default = {
                  placement: "center",
                  backdropClasses: "bg-dark-backdrop/70 fixed inset-0 z-40",
                  backdrop: "dynamic",
                  closable: true,
                  onHide: function() {
                  },
                  onShow: function() {
                  },
                  onToggle: function() {
                  }
                };
                var DefaultInstanceOptions = {
                  id: null,
                  override: true
                };
                var Modal = (
                  /** @class */
                  (function() {
                    function Modal2(targetEl, options, instanceOptions) {
                      if (targetEl === void 0) {
                        targetEl = null;
                      }
                      if (options === void 0) {
                        options = Default;
                      }
                      if (instanceOptions === void 0) {
                        instanceOptions = DefaultInstanceOptions;
                      }
                      this._eventListenerInstances = [];
                      this._instanceId = instanceOptions.id ? instanceOptions.id : targetEl.id;
                      this._targetEl = targetEl;
                      this._options = __assign(__assign({}, Default), options);
                      this._isHidden = true;
                      this._backdropEl = null;
                      this._initialized = false;
                      this.init();
                      instances_1.default.addInstance("Modal", this, this._instanceId, instanceOptions.override);
                    }
                    Modal2.prototype.init = function() {
                      var _this = this;
                      if (this._targetEl && !this._initialized) {
                        this._getPlacementClasses().map(function(c) {
                          _this._targetEl.classList.add(c);
                        });
                        this._initialized = true;
                      }
                    };
                    Modal2.prototype.destroy = function() {
                      if (this._initialized) {
                        this.removeAllEventListenerInstances();
                        this._destroyBackdropEl();
                        this._initialized = false;
                      }
                    };
                    Modal2.prototype.removeInstance = function() {
                      instances_1.default.removeInstance("Modal", this._instanceId);
                    };
                    Modal2.prototype.destroyAndRemoveInstance = function() {
                      this.destroy();
                      this.removeInstance();
                    };
                    Modal2.prototype._createBackdrop = function() {
                      var _a;
                      if (this._isHidden) {
                        var backdropEl = document.createElement("div");
                        (_a = backdropEl.classList).add.apply(_a, this._options.backdropClasses.split(" "));
                        document.querySelector("body").append(backdropEl);
                        this._backdropEl = backdropEl;
                      }
                    };
                    Modal2.prototype._destroyBackdropEl = function() {
                      if (!this._isHidden && this._backdropEl) {
                        this._backdropEl.remove();
                        this._backdropEl = null;
                      }
                    };
                    Modal2.prototype._setupModalCloseEventListeners = function() {
                      var _this = this;
                      if (this._options.backdrop === "dynamic") {
                        this._clickOutsideEventListener = function(ev) {
                          _this._handleOutsideClick(ev.target);
                        };
                        this._targetEl.addEventListener("click", this._clickOutsideEventListener, true);
                      }
                      this._keydownEventListener = function(ev) {
                        if (ev.key === "Escape") {
                          _this.hide();
                        }
                      };
                      document.body.addEventListener("keydown", this._keydownEventListener, true);
                    };
                    Modal2.prototype._removeModalCloseEventListeners = function() {
                      if (this._options.backdrop === "dynamic") {
                        this._targetEl.removeEventListener("click", this._clickOutsideEventListener, true);
                      }
                      document.body.removeEventListener("keydown", this._keydownEventListener, true);
                    };
                    Modal2.prototype._handleOutsideClick = function(target) {
                      if (target === this._targetEl || target === this._backdropEl && this.isVisible()) {
                        this.hide();
                      }
                    };
                    Modal2.prototype._getPlacementClasses = function() {
                      switch (this._options.placement) {
                        // top
                        case "top-left":
                          return ["justify-start", "items-start"];
                        case "top-center":
                          return ["justify-center", "items-start"];
                        case "top-right":
                          return ["justify-end", "items-start"];
                        // center
                        case "center-left":
                          return ["justify-start", "items-center"];
                        case "center":
                          return ["justify-center", "items-center"];
                        case "center-right":
                          return ["justify-end", "items-center"];
                        // bottom
                        case "bottom-left":
                          return ["justify-start", "items-end"];
                        case "bottom-center":
                          return ["justify-center", "items-end"];
                        case "bottom-right":
                          return ["justify-end", "items-end"];
                        default:
                          return ["justify-center", "items-center"];
                      }
                    };
                    Modal2.prototype.toggle = function() {
                      if (this._isHidden) {
                        this.show();
                      } else {
                        this.hide();
                      }
                      this._options.onToggle(this);
                    };
                    Modal2.prototype.show = function() {
                      if (this.isHidden) {
                        this._targetEl.classList.add("flex");
                        this._targetEl.classList.remove("hidden");
                        this._targetEl.setAttribute("aria-modal", "true");
                        this._targetEl.setAttribute("role", "dialog");
                        this._targetEl.removeAttribute("aria-hidden");
                        this._createBackdrop();
                        this._isHidden = false;
                        if (this._options.closable) {
                          this._setupModalCloseEventListeners();
                        }
                        document.body.classList.add("overflow-hidden");
                        this._options.onShow(this);
                      }
                    };
                    Modal2.prototype.hide = function() {
                      if (this.isVisible) {
                        this._targetEl.classList.add("hidden");
                        this._targetEl.classList.remove("flex");
                        this._targetEl.setAttribute("aria-hidden", "true");
                        this._targetEl.removeAttribute("aria-modal");
                        this._targetEl.removeAttribute("role");
                        this._destroyBackdropEl();
                        this._isHidden = true;
                        document.body.classList.remove("overflow-hidden");
                        if (this._options.closable) {
                          this._removeModalCloseEventListeners();
                        }
                        this._options.onHide(this);
                      }
                    };
                    Modal2.prototype.isVisible = function() {
                      return !this._isHidden;
                    };
                    Modal2.prototype.isHidden = function() {
                      return this._isHidden;
                    };
                    Modal2.prototype.addEventListenerInstance = function(element, type, handler) {
                      this._eventListenerInstances.push({
                        element,
                        type,
                        handler
                      });
                    };
                    Modal2.prototype.removeAllEventListenerInstances = function() {
                      this._eventListenerInstances.map(function(eventListenerInstance) {
                        eventListenerInstance.element.removeEventListener(eventListenerInstance.type, eventListenerInstance.handler);
                      });
                      this._eventListenerInstances = [];
                    };
                    Modal2.prototype.getAllEventListenerInstances = function() {
                      return this._eventListenerInstances;
                    };
                    Modal2.prototype.updateOnShow = function(callback) {
                      this._options.onShow = callback;
                    };
                    Modal2.prototype.updateOnHide = function(callback) {
                      this._options.onHide = callback;
                    };
                    Modal2.prototype.updateOnToggle = function(callback) {
                      this._options.onToggle = callback;
                    };
                    return Modal2;
                  })()
                );
                function initModals() {
                  document.querySelectorAll("[data-modal-target]").forEach(function($triggerEl) {
                    var modalId = $triggerEl.getAttribute("data-modal-target");
                    var $modalEl = document.getElementById(modalId);
                    if ($modalEl) {
                      var placement = $modalEl.getAttribute("data-modal-placement");
                      var backdrop = $modalEl.getAttribute("data-modal-backdrop");
                      new Modal($modalEl, {
                        placement: placement ? placement : Default.placement,
                        backdrop: backdrop ? backdrop : Default.backdrop
                      });
                    } else {
                      console.error("Modal with id ".concat(modalId, " does not exist. Are you sure that the data-modal-target attribute points to the correct modal id?."));
                    }
                  });
                  document.querySelectorAll("[data-modal-toggle]").forEach(function($triggerEl) {
                    var modalId = $triggerEl.getAttribute("data-modal-toggle");
                    var $modalEl = document.getElementById(modalId);
                    if ($modalEl) {
                      var modal_1 = instances_1.default.getInstance("Modal", modalId);
                      if (modal_1) {
                        var toggleModal = function() {
                          modal_1.toggle();
                        };
                        $triggerEl.addEventListener("click", toggleModal);
                        modal_1.addEventListenerInstance($triggerEl, "click", toggleModal);
                      } else {
                        console.error("Modal with id ".concat(modalId, " has not been initialized. Please initialize it using the data-modal-target attribute."));
                      }
                    } else {
                      console.error("Modal with id ".concat(modalId, " does not exist. Are you sure that the data-modal-toggle attribute points to the correct modal id?"));
                    }
                  });
                  document.querySelectorAll("[data-modal-show]").forEach(function($triggerEl) {
                    var modalId = $triggerEl.getAttribute("data-modal-show");
                    var $modalEl = document.getElementById(modalId);
                    if ($modalEl) {
                      var modal_2 = instances_1.default.getInstance("Modal", modalId);
                      if (modal_2) {
                        var showModal = function() {
                          modal_2.show();
                        };
                        $triggerEl.addEventListener("click", showModal);
                        modal_2.addEventListenerInstance($triggerEl, "click", showModal);
                      } else {
                        console.error("Modal with id ".concat(modalId, " has not been initialized. Please initialize it using the data-modal-target attribute."));
                      }
                    } else {
                      console.error("Modal with id ".concat(modalId, " does not exist. Are you sure that the data-modal-show attribute points to the correct modal id?"));
                    }
                  });
                  document.querySelectorAll("[data-modal-hide]").forEach(function($triggerEl) {
                    var modalId = $triggerEl.getAttribute("data-modal-hide");
                    var $modalEl = document.getElementById(modalId);
                    if ($modalEl) {
                      var modal_3 = instances_1.default.getInstance("Modal", modalId);
                      if (modal_3) {
                        var hideModal = function() {
                          modal_3.hide();
                        };
                        $triggerEl.addEventListener("click", hideModal);
                        modal_3.addEventListenerInstance($triggerEl, "click", hideModal);
                      } else {
                        console.error("Modal with id ".concat(modalId, " has not been initialized. Please initialize it using the data-modal-target attribute."));
                      }
                    } else {
                      console.error("Modal with id ".concat(modalId, " does not exist. Are you sure that the data-modal-hide attribute points to the correct modal id?"));
                    }
                  });
                }
                exports2.initModals = initModals;
                if (typeof window !== "undefined") {
                  window.Modal = Modal;
                  window.initModals = initModals;
                }
                exports2["default"] = Modal;
              })
            ),
            /***/
            5903: (
              /***/
              (function(__unused_webpack_module, exports2, __webpack_require__2) {
                var __assign = this && this.__assign || function() {
                  __assign = Object.assign || function(t) {
                    for (var s, i = 1, n = arguments.length; i < n; i++) {
                      s = arguments[i];
                      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
                    }
                    return t;
                  };
                  return __assign.apply(this, arguments);
                };
                var __spreadArray = this && this.__spreadArray || function(to, from, pack) {
                  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
                    if (ar || !(i in from)) {
                      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                      ar[i] = from[i];
                    }
                  }
                  return to.concat(ar || Array.prototype.slice.call(from));
                };
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.initPopovers = void 0;
                var core_1 = __webpack_require__2(3853);
                var instances_1 = __webpack_require__2(7423);
                var Default = {
                  placement: "top",
                  offset: 10,
                  triggerType: "hover",
                  onShow: function() {
                  },
                  onHide: function() {
                  },
                  onToggle: function() {
                  }
                };
                var DefaultInstanceOptions = {
                  id: null,
                  override: true
                };
                var Popover = (
                  /** @class */
                  (function() {
                    function Popover2(targetEl, triggerEl, options, instanceOptions) {
                      if (targetEl === void 0) {
                        targetEl = null;
                      }
                      if (triggerEl === void 0) {
                        triggerEl = null;
                      }
                      if (options === void 0) {
                        options = Default;
                      }
                      if (instanceOptions === void 0) {
                        instanceOptions = DefaultInstanceOptions;
                      }
                      this._instanceId = instanceOptions.id ? instanceOptions.id : targetEl.id;
                      this._targetEl = targetEl;
                      this._triggerEl = triggerEl;
                      this._options = __assign(__assign({}, Default), options);
                      this._popperInstance = null;
                      this._visible = false;
                      this._initialized = false;
                      this.init();
                      instances_1.default.addInstance("Popover", this, instanceOptions.id ? instanceOptions.id : this._targetEl.id, instanceOptions.override);
                    }
                    Popover2.prototype.init = function() {
                      if (this._triggerEl && this._targetEl && !this._initialized) {
                        this._setupEventListeners();
                        this._popperInstance = this._createPopperInstance();
                        this._initialized = true;
                      }
                    };
                    Popover2.prototype.destroy = function() {
                      var _this = this;
                      if (this._initialized) {
                        var triggerEvents = this._getTriggerEvents();
                        triggerEvents.showEvents.forEach(function(ev) {
                          _this._triggerEl.removeEventListener(ev, _this._showHandler);
                          _this._targetEl.removeEventListener(ev, _this._showHandler);
                        });
                        triggerEvents.hideEvents.forEach(function(ev) {
                          _this._triggerEl.removeEventListener(ev, _this._hideHandler);
                          _this._targetEl.removeEventListener(ev, _this._hideHandler);
                        });
                        this._removeKeydownListener();
                        this._removeClickOutsideListener();
                        if (this._popperInstance) {
                          this._popperInstance.destroy();
                        }
                        this._initialized = false;
                      }
                    };
                    Popover2.prototype.removeInstance = function() {
                      instances_1.default.removeInstance("Popover", this._instanceId);
                    };
                    Popover2.prototype.destroyAndRemoveInstance = function() {
                      this.destroy();
                      this.removeInstance();
                    };
                    Popover2.prototype._setupEventListeners = function() {
                      var _this = this;
                      var triggerEvents = this._getTriggerEvents();
                      this._showHandler = function() {
                        _this.show();
                      };
                      this._hideHandler = function() {
                        setTimeout(function() {
                          if (!_this._targetEl.matches(":hover")) {
                            _this.hide();
                          }
                        }, 100);
                      };
                      triggerEvents.showEvents.forEach(function(ev) {
                        _this._triggerEl.addEventListener(ev, _this._showHandler);
                        _this._targetEl.addEventListener(ev, _this._showHandler);
                      });
                      triggerEvents.hideEvents.forEach(function(ev) {
                        _this._triggerEl.addEventListener(ev, _this._hideHandler);
                        _this._targetEl.addEventListener(ev, _this._hideHandler);
                      });
                    };
                    Popover2.prototype._createPopperInstance = function() {
                      return (0, core_1.createPopper)(this._triggerEl, this._targetEl, {
                        placement: this._options.placement,
                        modifiers: [
                          {
                            name: "offset",
                            options: {
                              offset: [0, this._options.offset]
                            }
                          }
                        ]
                      });
                    };
                    Popover2.prototype._getTriggerEvents = function() {
                      switch (this._options.triggerType) {
                        case "hover":
                          return {
                            showEvents: ["mouseenter", "focus"],
                            hideEvents: ["mouseleave", "blur"]
                          };
                        case "click":
                          return {
                            showEvents: ["click", "focus"],
                            hideEvents: ["focusout", "blur"]
                          };
                        case "none":
                          return {
                            showEvents: [],
                            hideEvents: []
                          };
                        default:
                          return {
                            showEvents: ["mouseenter", "focus"],
                            hideEvents: ["mouseleave", "blur"]
                          };
                      }
                    };
                    Popover2.prototype._setupKeydownListener = function() {
                      var _this = this;
                      this._keydownEventListener = function(ev) {
                        if (ev.key === "Escape") {
                          _this.hide();
                        }
                      };
                      document.body.addEventListener("keydown", this._keydownEventListener, true);
                    };
                    Popover2.prototype._removeKeydownListener = function() {
                      document.body.removeEventListener("keydown", this._keydownEventListener, true);
                    };
                    Popover2.prototype._setupClickOutsideListener = function() {
                      var _this = this;
                      this._clickOutsideEventListener = function(ev) {
                        _this._handleClickOutside(ev, _this._targetEl);
                      };
                      document.body.addEventListener("click", this._clickOutsideEventListener, true);
                    };
                    Popover2.prototype._removeClickOutsideListener = function() {
                      document.body.removeEventListener("click", this._clickOutsideEventListener, true);
                    };
                    Popover2.prototype._handleClickOutside = function(ev, targetEl) {
                      var clickedEl = ev.target;
                      if (clickedEl !== targetEl && !targetEl.contains(clickedEl) && !this._triggerEl.contains(clickedEl) && this.isVisible()) {
                        this.hide();
                      }
                    };
                    Popover2.prototype.isVisible = function() {
                      return this._visible;
                    };
                    Popover2.prototype.toggle = function() {
                      if (this.isVisible()) {
                        this.hide();
                      } else {
                        this.show();
                      }
                      this._options.onToggle(this);
                    };
                    Popover2.prototype.show = function() {
                      this._targetEl.classList.remove("opacity-0", "invisible");
                      this._targetEl.classList.add("opacity-100", "visible");
                      this._popperInstance.setOptions(function(options) {
                        return __assign(__assign({}, options), { modifiers: __spreadArray(__spreadArray([], options.modifiers, true), [
                          { name: "eventListeners", enabled: true }
                        ], false) });
                      });
                      this._setupClickOutsideListener();
                      this._setupKeydownListener();
                      this._popperInstance.update();
                      this._visible = true;
                      this._options.onShow(this);
                    };
                    Popover2.prototype.hide = function() {
                      this._targetEl.classList.remove("opacity-100", "visible");
                      this._targetEl.classList.add("opacity-0", "invisible");
                      this._popperInstance.setOptions(function(options) {
                        return __assign(__assign({}, options), { modifiers: __spreadArray(__spreadArray([], options.modifiers, true), [
                          { name: "eventListeners", enabled: false }
                        ], false) });
                      });
                      this._removeClickOutsideListener();
                      this._removeKeydownListener();
                      this._visible = false;
                      this._options.onHide(this);
                    };
                    Popover2.prototype.updateOnShow = function(callback) {
                      this._options.onShow = callback;
                    };
                    Popover2.prototype.updateOnHide = function(callback) {
                      this._options.onHide = callback;
                    };
                    Popover2.prototype.updateOnToggle = function(callback) {
                      this._options.onToggle = callback;
                    };
                    return Popover2;
                  })()
                );
                function initPopovers() {
                  document.querySelectorAll("[data-popover-target]").forEach(function($triggerEl) {
                    var popoverID = $triggerEl.getAttribute("data-popover-target");
                    var $popoverEl = document.getElementById(popoverID);
                    if ($popoverEl) {
                      var triggerType = $triggerEl.getAttribute("data-popover-trigger");
                      var placement = $triggerEl.getAttribute("data-popover-placement");
                      var offset = $triggerEl.getAttribute("data-popover-offset");
                      new Popover($popoverEl, $triggerEl, {
                        placement: placement ? placement : Default.placement,
                        offset: offset ? parseInt(offset) : Default.offset,
                        triggerType: triggerType ? triggerType : Default.triggerType
                      });
                    } else {
                      console.error('The popover element with id "'.concat(popoverID, '" does not exist. Please check the data-popover-target attribute.'));
                    }
                  });
                }
                exports2.initPopovers = initPopovers;
                if (typeof window !== "undefined") {
                  window.Popover = Popover;
                  window.initPopovers = initPopovers;
                }
                exports2["default"] = Popover;
              })
            ),
            /***/
            4247: (
              /***/
              (function(__unused_webpack_module, exports2, __webpack_require__2) {
                var __assign = this && this.__assign || function() {
                  __assign = Object.assign || function(t) {
                    for (var s, i = 1, n = arguments.length; i < n; i++) {
                      s = arguments[i];
                      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
                    }
                    return t;
                  };
                  return __assign.apply(this, arguments);
                };
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.initTabs = void 0;
                var instances_1 = __webpack_require__2(7423);
                var Default = {
                  defaultTabId: null,
                  activeClasses: "text-fg-brand hover:text-fg-brand border-brand",
                  inactiveClasses: "border-transparent text-body hover:text-heading border-soft hover:border-default",
                  onShow: function() {
                  }
                };
                var DefaultInstanceOptions = {
                  id: null,
                  override: true
                };
                var Tabs = (
                  /** @class */
                  (function() {
                    function Tabs2(tabsEl, items, options, instanceOptions) {
                      if (tabsEl === void 0) {
                        tabsEl = null;
                      }
                      if (items === void 0) {
                        items = [];
                      }
                      if (options === void 0) {
                        options = Default;
                      }
                      if (instanceOptions === void 0) {
                        instanceOptions = DefaultInstanceOptions;
                      }
                      this._instanceId = instanceOptions.id ? instanceOptions.id : tabsEl.id;
                      this._tabsEl = tabsEl;
                      this._items = items;
                      this._activeTab = options ? this.getTab(options.defaultTabId) : null;
                      this._options = __assign(__assign({}, Default), options);
                      this._initialized = false;
                      this.init();
                      instances_1.default.addInstance("Tabs", this, this._instanceId, instanceOptions.override);
                    }
                    Tabs2.prototype.init = function() {
                      var _this = this;
                      if (this._items.length && !this._initialized) {
                        if (!this._activeTab) {
                          this.setActiveTab(this._items[0]);
                        }
                        this.show(this._activeTab.id, true);
                        this._items.map(function(tab) {
                          tab.triggerEl.addEventListener("click", function(event) {
                            event.preventDefault();
                            _this.show(tab.id);
                          });
                        });
                      }
                    };
                    Tabs2.prototype.destroy = function() {
                      if (this._initialized) {
                        this._initialized = false;
                      }
                    };
                    Tabs2.prototype.removeInstance = function() {
                      this.destroy();
                      instances_1.default.removeInstance("Tabs", this._instanceId);
                    };
                    Tabs2.prototype.destroyAndRemoveInstance = function() {
                      this.destroy();
                      this.removeInstance();
                    };
                    Tabs2.prototype.getActiveTab = function() {
                      return this._activeTab;
                    };
                    Tabs2.prototype.setActiveTab = function(tab) {
                      this._activeTab = tab;
                    };
                    Tabs2.prototype.getTab = function(id) {
                      return this._items.filter(function(t) {
                        return t.id === id;
                      })[0];
                    };
                    Tabs2.prototype.show = function(id, forceShow) {
                      var _a, _b;
                      var _this = this;
                      if (forceShow === void 0) {
                        forceShow = false;
                      }
                      var tab = this.getTab(id);
                      if (tab === this._activeTab && !forceShow) {
                        return;
                      }
                      this._items.map(function(t) {
                        var _a2, _b2;
                        if (t !== tab) {
                          (_a2 = t.triggerEl.classList).remove.apply(_a2, _this._options.activeClasses.split(" "));
                          (_b2 = t.triggerEl.classList).add.apply(_b2, _this._options.inactiveClasses.split(" "));
                          t.targetEl.classList.add("hidden");
                          t.triggerEl.setAttribute("aria-selected", "false");
                        }
                      });
                      (_a = tab.triggerEl.classList).add.apply(_a, this._options.activeClasses.split(" "));
                      (_b = tab.triggerEl.classList).remove.apply(_b, this._options.inactiveClasses.split(" "));
                      tab.triggerEl.setAttribute("aria-selected", "true");
                      tab.targetEl.classList.remove("hidden");
                      this.setActiveTab(tab);
                      this._options.onShow(this, tab);
                    };
                    Tabs2.prototype.updateOnShow = function(callback) {
                      this._options.onShow = callback;
                    };
                    return Tabs2;
                  })()
                );
                function initTabs() {
                  document.querySelectorAll("[data-tabs-toggle]").forEach(function($parentEl) {
                    var tabItems = [];
                    var activeClasses = $parentEl.getAttribute("data-tabs-active-classes");
                    var inactiveClasses = $parentEl.getAttribute("data-tabs-inactive-classes");
                    var defaultTabId = null;
                    $parentEl.querySelectorAll('[role="tab"]').forEach(function($triggerEl) {
                      var isActive = $triggerEl.getAttribute("aria-selected") === "true";
                      var tab = {
                        id: $triggerEl.getAttribute("data-tabs-target"),
                        triggerEl: $triggerEl,
                        targetEl: document.querySelector($triggerEl.getAttribute("data-tabs-target"))
                      };
                      tabItems.push(tab);
                      if (isActive) {
                        defaultTabId = tab.id;
                      }
                    });
                    new Tabs($parentEl, tabItems, {
                      defaultTabId,
                      activeClasses: activeClasses ? activeClasses : Default.activeClasses,
                      inactiveClasses: inactiveClasses ? inactiveClasses : Default.inactiveClasses
                    });
                  });
                }
                exports2.initTabs = initTabs;
                if (typeof window !== "undefined") {
                  window.Tabs = Tabs;
                  window.initTabs = initTabs;
                }
                exports2["default"] = Tabs;
              })
            ),
            /***/
            1671: (
              /***/
              (function(__unused_webpack_module, exports2, __webpack_require__2) {
                var __assign = this && this.__assign || function() {
                  __assign = Object.assign || function(t) {
                    for (var s, i = 1, n = arguments.length; i < n; i++) {
                      s = arguments[i];
                      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
                    }
                    return t;
                  };
                  return __assign.apply(this, arguments);
                };
                var __spreadArray = this && this.__spreadArray || function(to, from, pack) {
                  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
                    if (ar || !(i in from)) {
                      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                      ar[i] = from[i];
                    }
                  }
                  return to.concat(ar || Array.prototype.slice.call(from));
                };
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.initTooltips = void 0;
                var core_1 = __webpack_require__2(3853);
                var instances_1 = __webpack_require__2(7423);
                var Default = {
                  placement: "top",
                  triggerType: "hover",
                  onShow: function() {
                  },
                  onHide: function() {
                  },
                  onToggle: function() {
                  }
                };
                var DefaultInstanceOptions = {
                  id: null,
                  override: true
                };
                var Tooltip = (
                  /** @class */
                  (function() {
                    function Tooltip2(targetEl, triggerEl, options, instanceOptions) {
                      if (targetEl === void 0) {
                        targetEl = null;
                      }
                      if (triggerEl === void 0) {
                        triggerEl = null;
                      }
                      if (options === void 0) {
                        options = Default;
                      }
                      if (instanceOptions === void 0) {
                        instanceOptions = DefaultInstanceOptions;
                      }
                      this._instanceId = instanceOptions.id ? instanceOptions.id : targetEl.id;
                      this._targetEl = targetEl;
                      this._triggerEl = triggerEl;
                      this._options = __assign(__assign({}, Default), options);
                      this._popperInstance = null;
                      this._visible = false;
                      this._initialized = false;
                      this.init();
                      instances_1.default.addInstance("Tooltip", this, this._instanceId, instanceOptions.override);
                    }
                    Tooltip2.prototype.init = function() {
                      if (this._triggerEl && this._targetEl && !this._initialized) {
                        this._setupEventListeners();
                        this._popperInstance = this._createPopperInstance();
                        this._initialized = true;
                      }
                    };
                    Tooltip2.prototype.destroy = function() {
                      var _this = this;
                      if (this._initialized) {
                        var triggerEvents = this._getTriggerEvents();
                        triggerEvents.showEvents.forEach(function(ev) {
                          _this._triggerEl.removeEventListener(ev, _this._showHandler);
                        });
                        triggerEvents.hideEvents.forEach(function(ev) {
                          _this._triggerEl.removeEventListener(ev, _this._hideHandler);
                        });
                        this._removeKeydownListener();
                        this._removeClickOutsideListener();
                        if (this._popperInstance) {
                          this._popperInstance.destroy();
                        }
                        this._initialized = false;
                      }
                    };
                    Tooltip2.prototype.removeInstance = function() {
                      instances_1.default.removeInstance("Tooltip", this._instanceId);
                    };
                    Tooltip2.prototype.destroyAndRemoveInstance = function() {
                      this.destroy();
                      this.removeInstance();
                    };
                    Tooltip2.prototype._setupEventListeners = function() {
                      var _this = this;
                      var triggerEvents = this._getTriggerEvents();
                      this._showHandler = function() {
                        _this.show();
                      };
                      this._hideHandler = function() {
                        _this.hide();
                      };
                      triggerEvents.showEvents.forEach(function(ev) {
                        _this._triggerEl.addEventListener(ev, _this._showHandler);
                      });
                      triggerEvents.hideEvents.forEach(function(ev) {
                        _this._triggerEl.addEventListener(ev, _this._hideHandler);
                      });
                    };
                    Tooltip2.prototype._createPopperInstance = function() {
                      return (0, core_1.createPopper)(this._triggerEl, this._targetEl, {
                        placement: this._options.placement,
                        modifiers: [
                          {
                            name: "offset",
                            options: {
                              offset: [0, 8]
                            }
                          }
                        ]
                      });
                    };
                    Tooltip2.prototype._getTriggerEvents = function() {
                      switch (this._options.triggerType) {
                        case "hover":
                          return {
                            showEvents: ["mouseenter", "focus"],
                            hideEvents: ["mouseleave", "blur"]
                          };
                        case "click":
                          return {
                            showEvents: ["click", "focus"],
                            hideEvents: ["focusout", "blur"]
                          };
                        case "none":
                          return {
                            showEvents: [],
                            hideEvents: []
                          };
                        default:
                          return {
                            showEvents: ["mouseenter", "focus"],
                            hideEvents: ["mouseleave", "blur"]
                          };
                      }
                    };
                    Tooltip2.prototype._setupKeydownListener = function() {
                      var _this = this;
                      this._keydownEventListener = function(ev) {
                        if (ev.key === "Escape") {
                          _this.hide();
                        }
                      };
                      document.body.addEventListener("keydown", this._keydownEventListener, true);
                    };
                    Tooltip2.prototype._removeKeydownListener = function() {
                      document.body.removeEventListener("keydown", this._keydownEventListener, true);
                    };
                    Tooltip2.prototype._setupClickOutsideListener = function() {
                      var _this = this;
                      this._clickOutsideEventListener = function(ev) {
                        _this._handleClickOutside(ev, _this._targetEl);
                      };
                      document.body.addEventListener("click", this._clickOutsideEventListener, true);
                    };
                    Tooltip2.prototype._removeClickOutsideListener = function() {
                      document.body.removeEventListener("click", this._clickOutsideEventListener, true);
                    };
                    Tooltip2.prototype._handleClickOutside = function(ev, targetEl) {
                      var clickedEl = ev.target;
                      if (clickedEl !== targetEl && !targetEl.contains(clickedEl) && !this._triggerEl.contains(clickedEl) && this.isVisible()) {
                        this.hide();
                      }
                    };
                    Tooltip2.prototype.isVisible = function() {
                      return this._visible;
                    };
                    Tooltip2.prototype.toggle = function() {
                      if (this.isVisible()) {
                        this.hide();
                      } else {
                        this.show();
                      }
                    };
                    Tooltip2.prototype.show = function() {
                      this._targetEl.classList.remove("opacity-0", "invisible");
                      this._targetEl.classList.add("opacity-100", "visible");
                      this._popperInstance.setOptions(function(options) {
                        return __assign(__assign({}, options), { modifiers: __spreadArray(__spreadArray([], options.modifiers, true), [
                          { name: "eventListeners", enabled: true }
                        ], false) });
                      });
                      this._setupClickOutsideListener();
                      this._setupKeydownListener();
                      this._popperInstance.update();
                      this._visible = true;
                      this._options.onShow(this);
                    };
                    Tooltip2.prototype.hide = function() {
                      this._targetEl.classList.remove("opacity-100", "visible");
                      this._targetEl.classList.add("opacity-0", "invisible");
                      this._popperInstance.setOptions(function(options) {
                        return __assign(__assign({}, options), { modifiers: __spreadArray(__spreadArray([], options.modifiers, true), [
                          { name: "eventListeners", enabled: false }
                        ], false) });
                      });
                      this._removeClickOutsideListener();
                      this._removeKeydownListener();
                      this._visible = false;
                      this._options.onHide(this);
                    };
                    Tooltip2.prototype.updateOnShow = function(callback) {
                      this._options.onShow = callback;
                    };
                    Tooltip2.prototype.updateOnHide = function(callback) {
                      this._options.onHide = callback;
                    };
                    Tooltip2.prototype.updateOnToggle = function(callback) {
                      this._options.onToggle = callback;
                    };
                    return Tooltip2;
                  })()
                );
                function initTooltips() {
                  document.querySelectorAll("[data-tooltip-target]").forEach(function($triggerEl) {
                    var tooltipId = $triggerEl.getAttribute("data-tooltip-target");
                    var $tooltipEl = document.getElementById(tooltipId);
                    if ($tooltipEl) {
                      var triggerType = $triggerEl.getAttribute("data-tooltip-trigger");
                      var placement = $triggerEl.getAttribute("data-tooltip-placement");
                      new Tooltip($tooltipEl, $triggerEl, {
                        placement: placement ? placement : Default.placement,
                        triggerType: triggerType ? triggerType : Default.triggerType
                      });
                    } else {
                      console.error('The tooltip element with id "'.concat(tooltipId, '" does not exist. Please check the data-tooltip-target attribute.'));
                    }
                  });
                }
                exports2.initTooltips = initTooltips;
                if (typeof window !== "undefined") {
                  window.Tooltip = Tooltip;
                  window.initTooltips = initTooltips;
                }
                exports2["default"] = Tooltip;
              })
            ),
            /***/
            7947: (
              /***/
              (function(__unused_webpack_module, exports2) {
                Object.defineProperty(exports2, "__esModule", { value: true });
                var Events = (
                  /** @class */
                  (function() {
                    function Events2(eventType, eventFunctions) {
                      if (eventFunctions === void 0) {
                        eventFunctions = [];
                      }
                      this._eventType = eventType;
                      this._eventFunctions = eventFunctions;
                    }
                    Events2.prototype.init = function() {
                      var _this = this;
                      this._eventFunctions.forEach(function(eventFunction) {
                        if (typeof window !== "undefined") {
                          window.addEventListener(_this._eventType, eventFunction);
                        }
                      });
                    };
                    return Events2;
                  })()
                );
                exports2["default"] = Events;
              })
            ),
            /***/
            7423: (
              /***/
              (function(__unused_webpack_module, exports2) {
                Object.defineProperty(exports2, "__esModule", { value: true });
                var Instances = (
                  /** @class */
                  (function() {
                    function Instances2() {
                      this._instances = {
                        Accordion: {},
                        Carousel: {},
                        Collapse: {},
                        Dial: {},
                        Dismiss: {},
                        Drawer: {},
                        Dropdown: {},
                        Modal: {},
                        Popover: {},
                        Tabs: {},
                        Tooltip: {},
                        InputCounter: {},
                        CopyClipboard: {},
                        Datepicker: {}
                      };
                    }
                    Instances2.prototype.addInstance = function(component, instance, id, override) {
                      if (override === void 0) {
                        override = false;
                      }
                      if (!this._instances[component]) {
                        console.warn("Flowbite: Component ".concat(component, " does not exist."));
                        return false;
                      }
                      if (this._instances[component][id] && !override) {
                        console.warn("Flowbite: Instance with ID ".concat(id, " already exists."));
                        return;
                      }
                      if (override && this._instances[component][id]) {
                        this._instances[component][id].destroyAndRemoveInstance();
                      }
                      this._instances[component][id ? id : this._generateRandomId()] = instance;
                    };
                    Instances2.prototype.getAllInstances = function() {
                      return this._instances;
                    };
                    Instances2.prototype.getInstances = function(component) {
                      if (!this._instances[component]) {
                        console.warn("Flowbite: Component ".concat(component, " does not exist."));
                        return false;
                      }
                      return this._instances[component];
                    };
                    Instances2.prototype.getInstance = function(component, id) {
                      if (!this._componentAndInstanceCheck(component, id)) {
                        return;
                      }
                      if (!this._instances[component][id]) {
                        console.warn("Flowbite: Instance with ID ".concat(id, " does not exist."));
                        return;
                      }
                      return this._instances[component][id];
                    };
                    Instances2.prototype.destroyAndRemoveInstance = function(component, id) {
                      if (!this._componentAndInstanceCheck(component, id)) {
                        return;
                      }
                      this.destroyInstanceObject(component, id);
                      this.removeInstance(component, id);
                    };
                    Instances2.prototype.removeInstance = function(component, id) {
                      if (!this._componentAndInstanceCheck(component, id)) {
                        return;
                      }
                      delete this._instances[component][id];
                    };
                    Instances2.prototype.destroyInstanceObject = function(component, id) {
                      if (!this._componentAndInstanceCheck(component, id)) {
                        return;
                      }
                      this._instances[component][id].destroy();
                    };
                    Instances2.prototype.instanceExists = function(component, id) {
                      if (!this._instances[component]) {
                        return false;
                      }
                      if (!this._instances[component][id]) {
                        return false;
                      }
                      return true;
                    };
                    Instances2.prototype._generateRandomId = function() {
                      return Math.random().toString(36).substr(2, 9);
                    };
                    Instances2.prototype._componentAndInstanceCheck = function(component, id) {
                      if (!this._instances[component]) {
                        console.warn("Flowbite: Component ".concat(component, " does not exist."));
                        return false;
                      }
                      if (!this._instances[component][id]) {
                        console.warn("Flowbite: Instance with ID ".concat(id, " does not exist."));
                        return false;
                      }
                      return true;
                    };
                    return Instances2;
                  })()
                );
                var instances = new Instances();
                exports2["default"] = instances;
                if (typeof window !== "undefined") {
                  window.FlowbiteInstances = instances;
                }
              })
            )
            /******/
          };
          var __webpack_module_cache__ = {};
          function __webpack_require__(moduleId) {
            var cachedModule = __webpack_module_cache__[moduleId];
            if (cachedModule !== void 0) {
              return cachedModule.exports;
            }
            var module2 = __webpack_module_cache__[moduleId] = {
              /******/
              // no module.id needed
              /******/
              // no module.loaded needed
              /******/
              exports: {}
              /******/
            };
            __webpack_modules__[moduleId].call(module2.exports, module2, module2.exports, __webpack_require__);
            return module2.exports;
          }
          !(function() {
            __webpack_require__.d = function(exports2, definition) {
              for (var key in definition) {
                if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports2, key)) {
                  Object.defineProperty(exports2, key, { enumerable: true, get: definition[key] });
                }
              }
            };
          })();
          !(function() {
            __webpack_require__.o = function(obj, prop) {
              return Object.prototype.hasOwnProperty.call(obj, prop);
            };
          })();
          !(function() {
            __webpack_require__.r = function(exports2) {
              if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
                Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
              }
              Object.defineProperty(exports2, "__esModule", { value: true });
            };
          })();
          var __webpack_exports__ = {};
          !(function() {
            var exports2 = __webpack_exports__;
            Object.defineProperty(exports2, "__esModule", { value: true });
            var accordion_1 = __webpack_require__(902);
            var carousel_1 = __webpack_require__(6033);
            var collapse_1 = __webpack_require__(5922);
            var dial_1 = __webpack_require__(1556);
            var dismiss_1 = __webpack_require__(1791);
            var drawer_1 = __webpack_require__(1340);
            var dropdown_1 = __webpack_require__(4316);
            var modal_1 = __webpack_require__(16);
            var popover_1 = __webpack_require__(5903);
            var tabs_1 = __webpack_require__(4247);
            var tooltip_1 = __webpack_require__(1671);
            var input_counter_1 = __webpack_require__(3656);
            var clipboard_1 = __webpack_require__(2673);
            var datepicker_1 = __webpack_require__(9132);
            var index_1 = __webpack_require__(1311);
            var events_1 = __webpack_require__(7947);
            var afterRenderEvent = new Event("turbo:after-stream-render");
            addEventListener("turbo:before-stream-render", function(event) {
              var originalRender = event.detail.render;
              event.detail.render = function(streamElement) {
                originalRender(streamElement);
                window.dispatchEvent(afterRenderEvent);
              };
            });
            var turboLoadEvents = new events_1.default("turbo:load", [index_1.initFlowbite]);
            turboLoadEvents.init();
            var turboFrameLoadEvents = new events_1.default("turbo:frame-load", [index_1.initFlowbite]);
            turboFrameLoadEvents.init();
            var turboStreamLoadEvents = new events_1.default("turbo:after-stream-render", [
              index_1.initFlowbite
            ]);
            turboStreamLoadEvents.init();
            exports2["default"] = {
              Accordion: accordion_1.default,
              Carousel: carousel_1.default,
              Collapse: collapse_1.default,
              Dial: dial_1.default,
              Drawer: drawer_1.default,
              Dismiss: dismiss_1.default,
              Dropdown: dropdown_1.default,
              Modal: modal_1.default,
              Popover: popover_1.default,
              Tabs: tabs_1.default,
              Tooltip: tooltip_1.default,
              InputCounter: input_counter_1.default,
              CopyClipboard: clipboard_1.default,
              Datepicker: datepicker_1.default,
              Events: events_1.default
            };
          })();
          return __webpack_exports__;
        })()
      );
    });
  }
});

// node_modules/@hotwired/turbo/dist/turbo.es2017-esm.js
var turbo_es2017_esm_exports = {};
__export(turbo_es2017_esm_exports, {
  FetchEnctype: () => FetchEnctype,
  FetchMethod: () => FetchMethod,
  FetchRequest: () => FetchRequest,
  FetchResponse: () => FetchResponse,
  FrameElement: () => FrameElement,
  FrameLoadingStyle: () => FrameLoadingStyle,
  FrameRenderer: () => FrameRenderer,
  PageRenderer: () => PageRenderer,
  PageSnapshot: () => PageSnapshot,
  StreamActions: () => StreamActions,
  StreamElement: () => StreamElement,
  StreamSourceElement: () => StreamSourceElement,
  cache: () => cache,
  clearCache: () => clearCache,
  config: () => config,
  connectStreamSource: () => connectStreamSource,
  disconnectStreamSource: () => disconnectStreamSource,
  fetch: () => fetchWithTurboHeaders,
  fetchEnctypeFromString: () => fetchEnctypeFromString,
  fetchMethodFromString: () => fetchMethodFromString,
  isSafe: () => isSafe,
  morphBodyElements: () => morphBodyElements,
  morphChildren: () => morphChildren,
  morphElements: () => morphElements,
  morphTurboFrameElements: () => morphTurboFrameElements,
  navigator: () => navigator$1,
  registerAdapter: () => registerAdapter,
  renderStreamMessage: () => renderStreamMessage,
  session: () => session,
  setConfirmMethod: () => setConfirmMethod,
  setFormMode: () => setFormMode,
  setProgressBarDelay: () => setProgressBarDelay,
  start: () => start,
  visit: () => visit
});
(function(prototype) {
  if (typeof prototype.requestSubmit == "function") return;
  prototype.requestSubmit = function(submitter2) {
    if (submitter2) {
      validateSubmitter(submitter2, this);
      submitter2.click();
    } else {
      submitter2 = document.createElement("input");
      submitter2.type = "submit";
      submitter2.hidden = true;
      this.appendChild(submitter2);
      submitter2.click();
      this.removeChild(submitter2);
    }
  };
  function validateSubmitter(submitter2, form) {
    submitter2 instanceof HTMLElement || raise(TypeError, "parameter 1 is not of type 'HTMLElement'");
    submitter2.type == "submit" || raise(TypeError, "The specified element is not a submit button");
    submitter2.form == form || raise(DOMException, "The specified element is not owned by this form element", "NotFoundError");
  }
  function raise(errorConstructor, message, name) {
    throw new errorConstructor("Failed to execute 'requestSubmit' on 'HTMLFormElement': " + message + ".", name);
  }
})(HTMLFormElement.prototype);
var submittersByForm = /* @__PURE__ */ new WeakMap();
function findSubmitterFromClickTarget(target) {
  const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
  const candidate = element ? element.closest("input, button") : null;
  return candidate?.type == "submit" ? candidate : null;
}
function clickCaptured(event) {
  const submitter2 = findSubmitterFromClickTarget(event.target);
  if (submitter2 && submitter2.form) {
    submittersByForm.set(submitter2.form, submitter2);
  }
}
(function() {
  if ("submitter" in Event.prototype) return;
  let prototype = window.Event.prototype;
  if ("SubmitEvent" in window) {
    const prototypeOfSubmitEvent = window.SubmitEvent.prototype;
    if (/Apple Computer/.test(navigator.vendor) && !("submitter" in prototypeOfSubmitEvent)) {
      prototype = prototypeOfSubmitEvent;
    } else {
      return;
    }
  }
  addEventListener("click", clickCaptured, true);
  Object.defineProperty(prototype, "submitter", {
    get() {
      if (this.type == "submit" && this.target instanceof HTMLFormElement) {
        return submittersByForm.get(this.target);
      }
    }
  });
})();
var FrameLoadingStyle = {
  eager: "eager",
  lazy: "lazy"
};
var FrameElement = class _FrameElement extends HTMLElement {
  static delegateConstructor = void 0;
  loaded = Promise.resolve();
  static get observedAttributes() {
    return ["disabled", "loading", "src"];
  }
  constructor() {
    super();
    this.delegate = new _FrameElement.delegateConstructor(this);
  }
  connectedCallback() {
    this.delegate.connect();
  }
  disconnectedCallback() {
    this.delegate.disconnect();
  }
  reload() {
    return this.delegate.sourceURLReloaded();
  }
  attributeChangedCallback(name) {
    if (name == "loading") {
      this.delegate.loadingStyleChanged();
    } else if (name == "src") {
      this.delegate.sourceURLChanged();
    } else if (name == "disabled") {
      this.delegate.disabledChanged();
    }
  }
  /**
   * Gets the URL to lazily load source HTML from
   */
  get src() {
    return this.getAttribute("src");
  }
  /**
   * Sets the URL to lazily load source HTML from
   */
  set src(value) {
    if (value) {
      this.setAttribute("src", value);
    } else {
      this.removeAttribute("src");
    }
  }
  /**
   * Gets the refresh mode for the frame.
   */
  get refresh() {
    return this.getAttribute("refresh");
  }
  /**
   * Sets the refresh mode for the frame.
   */
  set refresh(value) {
    if (value) {
      this.setAttribute("refresh", value);
    } else {
      this.removeAttribute("refresh");
    }
  }
  get shouldReloadWithMorph() {
    return this.src && this.refresh === "morph";
  }
  /**
   * Determines if the element is loading
   */
  get loading() {
    return frameLoadingStyleFromString(this.getAttribute("loading") || "");
  }
  /**
   * Sets the value of if the element is loading
   */
  set loading(value) {
    if (value) {
      this.setAttribute("loading", value);
    } else {
      this.removeAttribute("loading");
    }
  }
  /**
   * Gets the disabled state of the frame.
   *
   * If disabled, no requests will be intercepted by the frame.
   */
  get disabled() {
    return this.hasAttribute("disabled");
  }
  /**
   * Sets the disabled state of the frame.
   *
   * If disabled, no requests will be intercepted by the frame.
   */
  set disabled(value) {
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }
  /**
   * Gets the autoscroll state of the frame.
   *
   * If true, the frame will be scrolled into view automatically on update.
   */
  get autoscroll() {
    return this.hasAttribute("autoscroll");
  }
  /**
   * Sets the autoscroll state of the frame.
   *
   * If true, the frame will be scrolled into view automatically on update.
   */
  set autoscroll(value) {
    if (value) {
      this.setAttribute("autoscroll", "");
    } else {
      this.removeAttribute("autoscroll");
    }
  }
  /**
   * Determines if the element has finished loading
   */
  get complete() {
    return !this.delegate.isLoading;
  }
  /**
   * Gets the active state of the frame.
   *
   * If inactive, source changes will not be observed.
   */
  get isActive() {
    return this.ownerDocument === document && !this.isPreview;
  }
  /**
   * Sets the active state of the frame.
   *
   * If inactive, source changes will not be observed.
   */
  get isPreview() {
    return this.ownerDocument?.documentElement?.hasAttribute("data-turbo-preview");
  }
};
function frameLoadingStyleFromString(style) {
  switch (style.toLowerCase()) {
    case "lazy":
      return FrameLoadingStyle.lazy;
    default:
      return FrameLoadingStyle.eager;
  }
}
var drive = {
  enabled: true,
  progressBarDelay: 500,
  unvisitableExtensions: /* @__PURE__ */ new Set(
    [
      ".7z",
      ".aac",
      ".apk",
      ".avi",
      ".bmp",
      ".bz2",
      ".css",
      ".csv",
      ".deb",
      ".dmg",
      ".doc",
      ".docx",
      ".exe",
      ".gif",
      ".gz",
      ".heic",
      ".heif",
      ".ico",
      ".iso",
      ".jpeg",
      ".jpg",
      ".js",
      ".json",
      ".m4a",
      ".mkv",
      ".mov",
      ".mp3",
      ".mp4",
      ".mpeg",
      ".mpg",
      ".msi",
      ".ogg",
      ".ogv",
      ".pdf",
      ".pkg",
      ".png",
      ".ppt",
      ".pptx",
      ".rar",
      ".rtf",
      ".svg",
      ".tar",
      ".tif",
      ".tiff",
      ".txt",
      ".wav",
      ".webm",
      ".webp",
      ".wma",
      ".wmv",
      ".xls",
      ".xlsx",
      ".xml",
      ".zip"
    ]
  )
};
function activateScriptElement(element) {
  if (element.getAttribute("data-turbo-eval") == "false") {
    return element;
  } else {
    const createdScriptElement = document.createElement("script");
    const cspNonce = getCspNonce();
    if (cspNonce) {
      createdScriptElement.nonce = cspNonce;
    }
    createdScriptElement.textContent = element.textContent;
    createdScriptElement.async = false;
    copyElementAttributes(createdScriptElement, element);
    return createdScriptElement;
  }
}
function copyElementAttributes(destinationElement, sourceElement) {
  for (const { name, value } of sourceElement.attributes) {
    destinationElement.setAttribute(name, value);
  }
}
function createDocumentFragment(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content;
}
function dispatch(eventName, { target, cancelable, detail } = {}) {
  const event = new CustomEvent(eventName, {
    cancelable,
    bubbles: true,
    composed: true,
    detail
  });
  if (target && target.isConnected) {
    target.dispatchEvent(event);
  } else {
    document.documentElement.dispatchEvent(event);
  }
  return event;
}
function cancelEvent(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}
function nextRepaint() {
  if (document.visibilityState === "hidden") {
    return nextEventLoopTick();
  } else {
    return nextAnimationFrame();
  }
}
function nextAnimationFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
function nextEventLoopTick() {
  return new Promise((resolve) => setTimeout(() => resolve(), 0));
}
function nextMicrotask() {
  return Promise.resolve();
}
function parseHTMLDocument(html = "") {
  return new DOMParser().parseFromString(html, "text/html");
}
function unindent(strings, ...values) {
  const lines = interpolate(strings, values).replace(/^\n/, "").split("\n");
  const match = lines[0].match(/^\s+/);
  const indent = match ? match[0].length : 0;
  return lines.map((line) => line.slice(indent)).join("\n");
}
function interpolate(strings, values) {
  return strings.reduce((result, string, i) => {
    const value = values[i] == void 0 ? "" : values[i];
    return result + string + value;
  }, "");
}
function uuid() {
  return Array.from({ length: 36 }).map((_, i) => {
    if (i == 8 || i == 13 || i == 18 || i == 23) {
      return "-";
    } else if (i == 14) {
      return "4";
    } else if (i == 19) {
      return (Math.floor(Math.random() * 4) + 8).toString(16);
    } else {
      return Math.floor(Math.random() * 15).toString(16);
    }
  }).join("");
}
function getAttribute(attributeName, ...elements) {
  for (const value of elements.map((element) => element?.getAttribute(attributeName))) {
    if (typeof value == "string") return value;
  }
  return null;
}
function hasAttribute(attributeName, ...elements) {
  return elements.some((element) => element && element.hasAttribute(attributeName));
}
function markAsBusy(...elements) {
  for (const element of elements) {
    if (element.localName == "turbo-frame") {
      element.setAttribute("busy", "");
    }
    element.setAttribute("aria-busy", "true");
  }
}
function clearBusyState(...elements) {
  for (const element of elements) {
    if (element.localName == "turbo-frame") {
      element.removeAttribute("busy");
    }
    element.removeAttribute("aria-busy");
  }
}
function waitForLoad(element, timeoutInMilliseconds = 2e3) {
  return new Promise((resolve) => {
    const onComplete = () => {
      element.removeEventListener("error", onComplete);
      element.removeEventListener("load", onComplete);
      resolve();
    };
    element.addEventListener("load", onComplete, { once: true });
    element.addEventListener("error", onComplete, { once: true });
    setTimeout(resolve, timeoutInMilliseconds);
  });
}
function getHistoryMethodForAction(action) {
  switch (action) {
    case "replace":
      return history.replaceState;
    case "advance":
    case "restore":
      return history.pushState;
  }
}
function isAction(action) {
  return action == "advance" || action == "replace" || action == "restore";
}
function getVisitAction(...elements) {
  const action = getAttribute("data-turbo-action", ...elements);
  return isAction(action) ? action : null;
}
function getMetaElement(name) {
  return document.querySelector(`meta[name="${name}"]`);
}
function getMetaContent(name) {
  const element = getMetaElement(name);
  return element && element.content;
}
function getCspNonce() {
  const element = getMetaElement("csp-nonce");
  if (element) {
    const { nonce, content } = element;
    return nonce == "" ? content : nonce;
  }
}
function setMetaContent(name, content) {
  let element = getMetaElement(name);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
  return element;
}
function findClosestRecursively(element, selector) {
  if (element instanceof Element) {
    return element.closest(selector) || findClosestRecursively(element.assignedSlot || element.getRootNode()?.host, selector);
  }
}
function elementIsFocusable(element) {
  const inertDisabledOrHidden = "[inert], :disabled, [hidden], details:not([open]), dialog:not([open])";
  return !!element && element.closest(inertDisabledOrHidden) == null && typeof element.focus == "function";
}
function queryAutofocusableElement(elementOrDocumentFragment) {
  return Array.from(elementOrDocumentFragment.querySelectorAll("[autofocus]")).find(elementIsFocusable);
}
async function around(callback, reader) {
  const before = reader();
  callback();
  await nextAnimationFrame();
  const after = reader();
  return [before, after];
}
function doesNotTargetIFrame(name) {
  if (name === "_blank") {
    return false;
  } else if (name) {
    for (const element of document.getElementsByName(name)) {
      if (element instanceof HTMLIFrameElement) return false;
    }
    return true;
  } else {
    return true;
  }
}
function findLinkFromClickTarget(target) {
  const link = findClosestRecursively(target, "a[href], a[xlink\\:href]");
  if (!link) return null;
  if (link.hasAttribute("download")) return null;
  if (link.hasAttribute("target") && link.target !== "_self") return null;
  return link;
}
function getLocationForLink(link) {
  return expandURL(link.getAttribute("href") || "");
}
function debounce(fn, delay) {
  let timeoutId = null;
  return (...args) => {
    const callback = () => fn.apply(this, args);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };
}
var submitter = {
  "aria-disabled": {
    beforeSubmit: (submitter2) => {
      submitter2.setAttribute("aria-disabled", "true");
      submitter2.addEventListener("click", cancelEvent);
    },
    afterSubmit: (submitter2) => {
      submitter2.removeAttribute("aria-disabled");
      submitter2.removeEventListener("click", cancelEvent);
    }
  },
  "disabled": {
    beforeSubmit: (submitter2) => submitter2.disabled = true,
    afterSubmit: (submitter2) => submitter2.disabled = false
  }
};
var Config = class {
  #submitter = null;
  constructor(config2) {
    Object.assign(this, config2);
  }
  get submitter() {
    return this.#submitter;
  }
  set submitter(value) {
    this.#submitter = submitter[value] || value;
  }
};
var forms = new Config({
  mode: "on",
  submitter: "disabled"
});
var config = {
  drive,
  forms
};
function expandURL(locatable) {
  return new URL(locatable.toString(), document.baseURI);
}
function getAnchor(url) {
  let anchorMatch;
  if (url.hash) {
    return url.hash.slice(1);
  } else if (anchorMatch = url.href.match(/#(.*)$/)) {
    return anchorMatch[1];
  }
}
function getAction$1(form, submitter2) {
  const action = submitter2?.getAttribute("formaction") || form.getAttribute("action") || form.action;
  return expandURL(action);
}
function getExtension(url) {
  return (getLastPathComponent(url).match(/\.[^.]*$/) || [])[0] || "";
}
function isPrefixedBy(baseURL, url) {
  const prefix = addTrailingSlash(url.origin + url.pathname);
  return addTrailingSlash(baseURL.href) === prefix || baseURL.href.startsWith(prefix);
}
function locationIsVisitable(location2, rootLocation) {
  return isPrefixedBy(location2, rootLocation) && !config.drive.unvisitableExtensions.has(getExtension(location2));
}
function getRequestURL(url) {
  const anchor = getAnchor(url);
  return anchor != null ? url.href.slice(0, -(anchor.length + 1)) : url.href;
}
function toCacheKey(url) {
  return getRequestURL(url);
}
function urlsAreEqual(left, right) {
  return expandURL(left).href == expandURL(right).href;
}
function getPathComponents(url) {
  return url.pathname.split("/").slice(1);
}
function getLastPathComponent(url) {
  return getPathComponents(url).slice(-1)[0];
}
function addTrailingSlash(value) {
  return value.endsWith("/") ? value : value + "/";
}
var FetchResponse = class {
  constructor(response) {
    this.response = response;
  }
  get succeeded() {
    return this.response.ok;
  }
  get failed() {
    return !this.succeeded;
  }
  get clientError() {
    return this.statusCode >= 400 && this.statusCode <= 499;
  }
  get serverError() {
    return this.statusCode >= 500 && this.statusCode <= 599;
  }
  get redirected() {
    return this.response.redirected;
  }
  get location() {
    return expandURL(this.response.url);
  }
  get isHTML() {
    return this.contentType && this.contentType.match(/^(?:text\/([^\s;,]+\b)?html|application\/xhtml\+xml)\b/);
  }
  get statusCode() {
    return this.response.status;
  }
  get contentType() {
    return this.header("Content-Type");
  }
  get responseText() {
    return this.response.clone().text();
  }
  get responseHTML() {
    if (this.isHTML) {
      return this.response.clone().text();
    } else {
      return Promise.resolve(void 0);
    }
  }
  header(name) {
    return this.response.headers.get(name);
  }
};
var LimitedSet = class extends Set {
  constructor(maxSize) {
    super();
    this.maxSize = maxSize;
  }
  add(value) {
    if (this.size >= this.maxSize) {
      const iterator = this.values();
      const oldestValue = iterator.next().value;
      this.delete(oldestValue);
    }
    super.add(value);
  }
};
var recentRequests = new LimitedSet(20);
function fetchWithTurboHeaders(url, options = {}) {
  const modifiedHeaders = new Headers(options.headers || {});
  const requestUID = uuid();
  recentRequests.add(requestUID);
  modifiedHeaders.append("X-Turbo-Request-Id", requestUID);
  return window.fetch(url, {
    ...options,
    headers: modifiedHeaders
  });
}
function fetchMethodFromString(method) {
  switch (method.toLowerCase()) {
    case "get":
      return FetchMethod.get;
    case "post":
      return FetchMethod.post;
    case "put":
      return FetchMethod.put;
    case "patch":
      return FetchMethod.patch;
    case "delete":
      return FetchMethod.delete;
  }
}
var FetchMethod = {
  get: "get",
  post: "post",
  put: "put",
  patch: "patch",
  delete: "delete"
};
function fetchEnctypeFromString(encoding) {
  switch (encoding.toLowerCase()) {
    case FetchEnctype.multipart:
      return FetchEnctype.multipart;
    case FetchEnctype.plain:
      return FetchEnctype.plain;
    default:
      return FetchEnctype.urlEncoded;
  }
}
var FetchEnctype = {
  urlEncoded: "application/x-www-form-urlencoded",
  multipart: "multipart/form-data",
  plain: "text/plain"
};
var FetchRequest = class {
  abortController = new AbortController();
  #resolveRequestPromise = (_value) => {
  };
  constructor(delegate, method, location2, requestBody = new URLSearchParams(), target = null, enctype = FetchEnctype.urlEncoded) {
    const [url, body] = buildResourceAndBody(expandURL(location2), method, requestBody, enctype);
    this.delegate = delegate;
    this.url = url;
    this.target = target;
    this.fetchOptions = {
      credentials: "same-origin",
      redirect: "follow",
      method: method.toUpperCase(),
      headers: { ...this.defaultHeaders },
      body,
      signal: this.abortSignal,
      referrer: this.delegate.referrer?.href
    };
    this.enctype = enctype;
  }
  get method() {
    return this.fetchOptions.method;
  }
  set method(value) {
    const fetchBody = this.isSafe ? this.url.searchParams : this.fetchOptions.body || new FormData();
    const fetchMethod = fetchMethodFromString(value) || FetchMethod.get;
    this.url.search = "";
    const [url, body] = buildResourceAndBody(this.url, fetchMethod, fetchBody, this.enctype);
    this.url = url;
    this.fetchOptions.body = body;
    this.fetchOptions.method = fetchMethod.toUpperCase();
  }
  get headers() {
    return this.fetchOptions.headers;
  }
  set headers(value) {
    this.fetchOptions.headers = value;
  }
  get body() {
    if (this.isSafe) {
      return this.url.searchParams;
    } else {
      return this.fetchOptions.body;
    }
  }
  set body(value) {
    this.fetchOptions.body = value;
  }
  get location() {
    return this.url;
  }
  get params() {
    return this.url.searchParams;
  }
  get entries() {
    return this.body ? Array.from(this.body.entries()) : [];
  }
  cancel() {
    this.abortController.abort();
  }
  async perform() {
    const { fetchOptions } = this;
    this.delegate.prepareRequest(this);
    const event = await this.#allowRequestToBeIntercepted(fetchOptions);
    try {
      this.delegate.requestStarted(this);
      if (event.detail.fetchRequest) {
        this.response = event.detail.fetchRequest.response;
      } else {
        this.response = fetchWithTurboHeaders(this.url.href, fetchOptions);
      }
      const response = await this.response;
      return await this.receive(response);
    } catch (error2) {
      if (error2.name !== "AbortError") {
        if (this.#willDelegateErrorHandling(error2)) {
          this.delegate.requestErrored(this, error2);
        }
        throw error2;
      }
    } finally {
      this.delegate.requestFinished(this);
    }
  }
  async receive(response) {
    const fetchResponse = new FetchResponse(response);
    const event = dispatch("turbo:before-fetch-response", {
      cancelable: true,
      detail: { fetchResponse },
      target: this.target
    });
    if (event.defaultPrevented) {
      this.delegate.requestPreventedHandlingResponse(this, fetchResponse);
    } else if (fetchResponse.succeeded) {
      this.delegate.requestSucceededWithResponse(this, fetchResponse);
    } else {
      this.delegate.requestFailedWithResponse(this, fetchResponse);
    }
    return fetchResponse;
  }
  get defaultHeaders() {
    return {
      Accept: "text/html, application/xhtml+xml"
    };
  }
  get isSafe() {
    return isSafe(this.method);
  }
  get abortSignal() {
    return this.abortController.signal;
  }
  acceptResponseType(mimeType) {
    this.headers["Accept"] = [mimeType, this.headers["Accept"]].join(", ");
  }
  async #allowRequestToBeIntercepted(fetchOptions) {
    const requestInterception = new Promise((resolve) => this.#resolveRequestPromise = resolve);
    const event = dispatch("turbo:before-fetch-request", {
      cancelable: true,
      detail: {
        fetchOptions,
        url: this.url,
        resume: this.#resolveRequestPromise
      },
      target: this.target
    });
    this.url = event.detail.url;
    if (event.defaultPrevented) await requestInterception;
    return event;
  }
  #willDelegateErrorHandling(error2) {
    const event = dispatch("turbo:fetch-request-error", {
      target: this.target,
      cancelable: true,
      detail: { request: this, error: error2 }
    });
    return !event.defaultPrevented;
  }
};
function isSafe(fetchMethod) {
  return fetchMethodFromString(fetchMethod) == FetchMethod.get;
}
function buildResourceAndBody(resource, method, requestBody, enctype) {
  const searchParams = Array.from(requestBody).length > 0 ? new URLSearchParams(entriesExcludingFiles(requestBody)) : resource.searchParams;
  if (isSafe(method)) {
    return [mergeIntoURLSearchParams(resource, searchParams), null];
  } else if (enctype == FetchEnctype.urlEncoded) {
    return [resource, searchParams];
  } else {
    return [resource, requestBody];
  }
}
function entriesExcludingFiles(requestBody) {
  const entries = [];
  for (const [name, value] of requestBody) {
    if (value instanceof File) continue;
    else entries.push([name, value]);
  }
  return entries;
}
function mergeIntoURLSearchParams(url, requestBody) {
  const searchParams = new URLSearchParams(entriesExcludingFiles(requestBody));
  url.search = searchParams.toString();
  return url;
}
var AppearanceObserver = class {
  started = false;
  constructor(delegate, element) {
    this.delegate = delegate;
    this.element = element;
    this.intersectionObserver = new IntersectionObserver(this.intersect);
  }
  start() {
    if (!this.started) {
      this.started = true;
      this.intersectionObserver.observe(this.element);
    }
  }
  stop() {
    if (this.started) {
      this.started = false;
      this.intersectionObserver.unobserve(this.element);
    }
  }
  intersect = (entries) => {
    const lastEntry = entries.slice(-1)[0];
    if (lastEntry?.isIntersecting) {
      this.delegate.elementAppearedInViewport(this.element);
    }
  };
};
var StreamMessage = class {
  static contentType = "text/vnd.turbo-stream.html";
  static wrap(message) {
    if (typeof message == "string") {
      return new this(createDocumentFragment(message));
    } else {
      return message;
    }
  }
  constructor(fragment) {
    this.fragment = importStreamElements(fragment);
  }
};
function importStreamElements(fragment) {
  for (const element of fragment.querySelectorAll("turbo-stream")) {
    const streamElement = document.importNode(element, true);
    for (const inertScriptElement of streamElement.templateElement.content.querySelectorAll("script")) {
      inertScriptElement.replaceWith(activateScriptElement(inertScriptElement));
    }
    element.replaceWith(streamElement);
  }
  return fragment;
}
var PREFETCH_DELAY = 100;
var PrefetchCache = class {
  #prefetchTimeout = null;
  #prefetched = null;
  get(url) {
    if (this.#prefetched && this.#prefetched.url === url && this.#prefetched.expire > Date.now()) {
      return this.#prefetched.request;
    }
  }
  setLater(url, request, ttl) {
    this.clear();
    this.#prefetchTimeout = setTimeout(() => {
      request.perform();
      this.set(url, request, ttl);
      this.#prefetchTimeout = null;
    }, PREFETCH_DELAY);
  }
  set(url, request, ttl) {
    this.#prefetched = { url, request, expire: new Date((/* @__PURE__ */ new Date()).getTime() + ttl) };
  }
  clear() {
    if (this.#prefetchTimeout) clearTimeout(this.#prefetchTimeout);
    this.#prefetched = null;
  }
};
var cacheTtl = 10 * 1e3;
var prefetchCache = new PrefetchCache();
var FormSubmissionState = {
  initialized: "initialized",
  requesting: "requesting",
  waiting: "waiting",
  receiving: "receiving",
  stopping: "stopping",
  stopped: "stopped"
};
var FormSubmission = class _FormSubmission {
  state = FormSubmissionState.initialized;
  static confirmMethod(message) {
    return Promise.resolve(confirm(message));
  }
  constructor(delegate, formElement, submitter2, mustRedirect = false) {
    const method = getMethod(formElement, submitter2);
    const action = getAction(getFormAction(formElement, submitter2), method);
    const body = buildFormData(formElement, submitter2);
    const enctype = getEnctype(formElement, submitter2);
    this.delegate = delegate;
    this.formElement = formElement;
    this.submitter = submitter2;
    this.fetchRequest = new FetchRequest(this, method, action, body, formElement, enctype);
    this.mustRedirect = mustRedirect;
  }
  get method() {
    return this.fetchRequest.method;
  }
  set method(value) {
    this.fetchRequest.method = value;
  }
  get action() {
    return this.fetchRequest.url.toString();
  }
  set action(value) {
    this.fetchRequest.url = expandURL(value);
  }
  get body() {
    return this.fetchRequest.body;
  }
  get enctype() {
    return this.fetchRequest.enctype;
  }
  get isSafe() {
    return this.fetchRequest.isSafe;
  }
  get location() {
    return this.fetchRequest.url;
  }
  // The submission process
  async start() {
    const { initialized, requesting } = FormSubmissionState;
    const confirmationMessage = getAttribute("data-turbo-confirm", this.submitter, this.formElement);
    if (typeof confirmationMessage === "string") {
      const confirmMethod = typeof config.forms.confirm === "function" ? config.forms.confirm : _FormSubmission.confirmMethod;
      const answer = await confirmMethod(confirmationMessage, this.formElement, this.submitter);
      if (!answer) {
        return;
      }
    }
    if (this.state == initialized) {
      this.state = requesting;
      return this.fetchRequest.perform();
    }
  }
  stop() {
    const { stopping, stopped } = FormSubmissionState;
    if (this.state != stopping && this.state != stopped) {
      this.state = stopping;
      this.fetchRequest.cancel();
      return true;
    }
  }
  // Fetch request delegate
  prepareRequest(request) {
    if (!request.isSafe) {
      const token = getCookieValue(getMetaContent("csrf-param")) || getMetaContent("csrf-token");
      if (token) {
        request.headers["X-CSRF-Token"] = token;
      }
    }
    if (this.requestAcceptsTurboStreamResponse(request)) {
      request.acceptResponseType(StreamMessage.contentType);
    }
  }
  requestStarted(_request) {
    this.state = FormSubmissionState.waiting;
    if (this.submitter) config.forms.submitter.beforeSubmit(this.submitter);
    this.setSubmitsWith();
    markAsBusy(this.formElement);
    dispatch("turbo:submit-start", {
      target: this.formElement,
      detail: { formSubmission: this }
    });
    this.delegate.formSubmissionStarted(this);
  }
  requestPreventedHandlingResponse(request, response) {
    prefetchCache.clear();
    this.result = { success: response.succeeded, fetchResponse: response };
  }
  requestSucceededWithResponse(request, response) {
    if (response.clientError || response.serverError) {
      this.delegate.formSubmissionFailedWithResponse(this, response);
      return;
    }
    prefetchCache.clear();
    if (this.requestMustRedirect(request) && responseSucceededWithoutRedirect(response)) {
      const error2 = new Error("Form responses must redirect to another location");
      this.delegate.formSubmissionErrored(this, error2);
    } else {
      this.state = FormSubmissionState.receiving;
      this.result = { success: true, fetchResponse: response };
      this.delegate.formSubmissionSucceededWithResponse(this, response);
    }
  }
  requestFailedWithResponse(request, response) {
    this.result = { success: false, fetchResponse: response };
    this.delegate.formSubmissionFailedWithResponse(this, response);
  }
  requestErrored(request, error2) {
    this.result = { success: false, error: error2 };
    this.delegate.formSubmissionErrored(this, error2);
  }
  requestFinished(_request) {
    this.state = FormSubmissionState.stopped;
    if (this.submitter) config.forms.submitter.afterSubmit(this.submitter);
    this.resetSubmitterText();
    clearBusyState(this.formElement);
    dispatch("turbo:submit-end", {
      target: this.formElement,
      detail: { formSubmission: this, ...this.result }
    });
    this.delegate.formSubmissionFinished(this);
  }
  // Private
  setSubmitsWith() {
    if (!this.submitter || !this.submitsWith) return;
    if (this.submitter.matches("button")) {
      this.originalSubmitText = this.submitter.innerHTML;
      this.submitter.innerHTML = this.submitsWith;
    } else if (this.submitter.matches("input")) {
      const input = this.submitter;
      this.originalSubmitText = input.value;
      input.value = this.submitsWith;
    }
  }
  resetSubmitterText() {
    if (!this.submitter || !this.originalSubmitText) return;
    if (this.submitter.matches("button")) {
      this.submitter.innerHTML = this.originalSubmitText;
    } else if (this.submitter.matches("input")) {
      const input = this.submitter;
      input.value = this.originalSubmitText;
    }
  }
  requestMustRedirect(request) {
    return !request.isSafe && this.mustRedirect;
  }
  requestAcceptsTurboStreamResponse(request) {
    return !request.isSafe || hasAttribute("data-turbo-stream", this.submitter, this.formElement);
  }
  get submitsWith() {
    return this.submitter?.getAttribute("data-turbo-submits-with");
  }
};
function buildFormData(formElement, submitter2) {
  const formData = new FormData(formElement);
  const name = submitter2?.getAttribute("name");
  const value = submitter2?.getAttribute("value");
  if (name) {
    formData.append(name, value || "");
  }
  return formData;
}
function getCookieValue(cookieName) {
  if (cookieName != null) {
    const cookies = document.cookie ? document.cookie.split("; ") : [];
    const cookie = cookies.find((cookie2) => cookie2.startsWith(cookieName));
    if (cookie) {
      const value = cookie.split("=").slice(1).join("=");
      return value ? decodeURIComponent(value) : void 0;
    }
  }
}
function responseSucceededWithoutRedirect(response) {
  return response.statusCode == 200 && !response.redirected;
}
function getFormAction(formElement, submitter2) {
  const formElementAction = typeof formElement.action === "string" ? formElement.action : null;
  if (submitter2?.hasAttribute("formaction")) {
    return submitter2.getAttribute("formaction") || "";
  } else {
    return formElement.getAttribute("action") || formElementAction || "";
  }
}
function getAction(formAction, fetchMethod) {
  const action = expandURL(formAction);
  if (isSafe(fetchMethod)) {
    action.search = "";
  }
  return action;
}
function getMethod(formElement, submitter2) {
  const method = submitter2?.getAttribute("formmethod") || formElement.getAttribute("method") || "";
  return fetchMethodFromString(method.toLowerCase()) || FetchMethod.get;
}
function getEnctype(formElement, submitter2) {
  return fetchEnctypeFromString(submitter2?.getAttribute("formenctype") || formElement.enctype);
}
var Snapshot = class {
  constructor(element) {
    this.element = element;
  }
  get activeElement() {
    return this.element.ownerDocument.activeElement;
  }
  get children() {
    return [...this.element.children];
  }
  hasAnchor(anchor) {
    return this.getElementForAnchor(anchor) != null;
  }
  getElementForAnchor(anchor) {
    return anchor ? this.element.querySelector(`[id='${anchor}'], a[name='${anchor}']`) : null;
  }
  get isConnected() {
    return this.element.isConnected;
  }
  get firstAutofocusableElement() {
    return queryAutofocusableElement(this.element);
  }
  get permanentElements() {
    return queryPermanentElementsAll(this.element);
  }
  getPermanentElementById(id) {
    return getPermanentElementById(this.element, id);
  }
  getPermanentElementMapForSnapshot(snapshot) {
    const permanentElementMap = {};
    for (const currentPermanentElement of this.permanentElements) {
      const { id } = currentPermanentElement;
      const newPermanentElement = snapshot.getPermanentElementById(id);
      if (newPermanentElement) {
        permanentElementMap[id] = [currentPermanentElement, newPermanentElement];
      }
    }
    return permanentElementMap;
  }
};
function getPermanentElementById(node, id) {
  return node.querySelector(`#${id}[data-turbo-permanent]`);
}
function queryPermanentElementsAll(node) {
  return node.querySelectorAll("[id][data-turbo-permanent]");
}
var FormSubmitObserver = class {
  started = false;
  constructor(delegate, eventTarget) {
    this.delegate = delegate;
    this.eventTarget = eventTarget;
  }
  start() {
    if (!this.started) {
      this.eventTarget.addEventListener("submit", this.submitCaptured, true);
      this.started = true;
    }
  }
  stop() {
    if (this.started) {
      this.eventTarget.removeEventListener("submit", this.submitCaptured, true);
      this.started = false;
    }
  }
  submitCaptured = () => {
    this.eventTarget.removeEventListener("submit", this.submitBubbled, false);
    this.eventTarget.addEventListener("submit", this.submitBubbled, false);
  };
  submitBubbled = (event) => {
    if (!event.defaultPrevented) {
      const form = event.target instanceof HTMLFormElement ? event.target : void 0;
      const submitter2 = event.submitter || void 0;
      if (form && submissionDoesNotDismissDialog(form, submitter2) && submissionDoesNotTargetIFrame(form, submitter2) && this.delegate.willSubmitForm(form, submitter2)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.delegate.formSubmitted(form, submitter2);
      }
    }
  };
};
function submissionDoesNotDismissDialog(form, submitter2) {
  const method = submitter2?.getAttribute("formmethod") || form.getAttribute("method");
  return method != "dialog";
}
function submissionDoesNotTargetIFrame(form, submitter2) {
  const target = submitter2?.getAttribute("formtarget") || form.getAttribute("target");
  return doesNotTargetIFrame(target);
}
var View = class {
  #resolveRenderPromise = (_value) => {
  };
  #resolveInterceptionPromise = (_value) => {
  };
  constructor(delegate, element) {
    this.delegate = delegate;
    this.element = element;
  }
  // Scrolling
  scrollToAnchor(anchor) {
    const element = this.snapshot.getElementForAnchor(anchor);
    if (element) {
      this.focusElement(element);
      this.scrollToElement(element);
    } else {
      this.scrollToPosition({ x: 0, y: 0 });
    }
  }
  scrollToAnchorFromLocation(location2) {
    this.scrollToAnchor(getAnchor(location2));
  }
  scrollToElement(element) {
    element.scrollIntoView();
  }
  focusElement(element) {
    if (element instanceof HTMLElement) {
      if (element.hasAttribute("tabindex")) {
        element.focus();
      } else {
        element.setAttribute("tabindex", "-1");
        element.focus();
        element.removeAttribute("tabindex");
      }
    }
  }
  scrollToPosition({ x, y }) {
    this.scrollRoot.scrollTo(x, y);
  }
  scrollToTop() {
    this.scrollToPosition({ x: 0, y: 0 });
  }
  get scrollRoot() {
    return window;
  }
  // Rendering
  async render(renderer) {
    const { isPreview, shouldRender, willRender, newSnapshot: snapshot } = renderer;
    const shouldInvalidate = willRender;
    if (shouldRender) {
      try {
        this.renderPromise = new Promise((resolve) => this.#resolveRenderPromise = resolve);
        this.renderer = renderer;
        await this.prepareToRenderSnapshot(renderer);
        const renderInterception = new Promise((resolve) => this.#resolveInterceptionPromise = resolve);
        const options = { resume: this.#resolveInterceptionPromise, render: this.renderer.renderElement, renderMethod: this.renderer.renderMethod };
        const immediateRender = this.delegate.allowsImmediateRender(snapshot, options);
        if (!immediateRender) await renderInterception;
        await this.renderSnapshot(renderer);
        this.delegate.viewRenderedSnapshot(snapshot, isPreview, this.renderer.renderMethod);
        this.delegate.preloadOnLoadLinksForView(this.element);
        this.finishRenderingSnapshot(renderer);
      } finally {
        delete this.renderer;
        this.#resolveRenderPromise(void 0);
        delete this.renderPromise;
      }
    } else if (shouldInvalidate) {
      this.invalidate(renderer.reloadReason);
    }
  }
  invalidate(reason) {
    this.delegate.viewInvalidated(reason);
  }
  async prepareToRenderSnapshot(renderer) {
    this.markAsPreview(renderer.isPreview);
    await renderer.prepareToRender();
  }
  markAsPreview(isPreview) {
    if (isPreview) {
      this.element.setAttribute("data-turbo-preview", "");
    } else {
      this.element.removeAttribute("data-turbo-preview");
    }
  }
  markVisitDirection(direction) {
    this.element.setAttribute("data-turbo-visit-direction", direction);
  }
  unmarkVisitDirection() {
    this.element.removeAttribute("data-turbo-visit-direction");
  }
  async renderSnapshot(renderer) {
    await renderer.render();
  }
  finishRenderingSnapshot(renderer) {
    renderer.finishRendering();
  }
};
var FrameView = class extends View {
  missing() {
    this.element.innerHTML = `<strong class="turbo-frame-error">Content missing</strong>`;
  }
  get snapshot() {
    return new Snapshot(this.element);
  }
};
var LinkInterceptor = class {
  constructor(delegate, element) {
    this.delegate = delegate;
    this.element = element;
  }
  start() {
    this.element.addEventListener("click", this.clickBubbled);
    document.addEventListener("turbo:click", this.linkClicked);
    document.addEventListener("turbo:before-visit", this.willVisit);
  }
  stop() {
    this.element.removeEventListener("click", this.clickBubbled);
    document.removeEventListener("turbo:click", this.linkClicked);
    document.removeEventListener("turbo:before-visit", this.willVisit);
  }
  clickBubbled = (event) => {
    if (this.clickEventIsSignificant(event)) {
      this.clickEvent = event;
    } else {
      delete this.clickEvent;
    }
  };
  linkClicked = (event) => {
    if (this.clickEvent && this.clickEventIsSignificant(event)) {
      if (this.delegate.shouldInterceptLinkClick(event.target, event.detail.url, event.detail.originalEvent)) {
        this.clickEvent.preventDefault();
        event.preventDefault();
        this.delegate.linkClickIntercepted(event.target, event.detail.url, event.detail.originalEvent);
      }
    }
    delete this.clickEvent;
  };
  willVisit = (_event) => {
    delete this.clickEvent;
  };
  clickEventIsSignificant(event) {
    const target = event.composed ? event.target?.parentElement : event.target;
    const element = findLinkFromClickTarget(target) || target;
    return element instanceof Element && element.closest("turbo-frame, html") == this.element;
  }
};
var LinkClickObserver = class {
  started = false;
  constructor(delegate, eventTarget) {
    this.delegate = delegate;
    this.eventTarget = eventTarget;
  }
  start() {
    if (!this.started) {
      this.eventTarget.addEventListener("click", this.clickCaptured, true);
      this.started = true;
    }
  }
  stop() {
    if (this.started) {
      this.eventTarget.removeEventListener("click", this.clickCaptured, true);
      this.started = false;
    }
  }
  clickCaptured = () => {
    this.eventTarget.removeEventListener("click", this.clickBubbled, false);
    this.eventTarget.addEventListener("click", this.clickBubbled, false);
  };
  clickBubbled = (event) => {
    if (event instanceof MouseEvent && this.clickEventIsSignificant(event)) {
      const target = event.composedPath && event.composedPath()[0] || event.target;
      const link = findLinkFromClickTarget(target);
      if (link && doesNotTargetIFrame(link.target)) {
        const location2 = getLocationForLink(link);
        if (this.delegate.willFollowLinkToLocation(link, location2, event)) {
          event.preventDefault();
          this.delegate.followedLinkToLocation(link, location2);
        }
      }
    }
  };
  clickEventIsSignificant(event) {
    return !(event.target && event.target.isContentEditable || event.defaultPrevented || event.which > 1 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
  }
};
var FormLinkClickObserver = class {
  constructor(delegate, element) {
    this.delegate = delegate;
    this.linkInterceptor = new LinkClickObserver(this, element);
  }
  start() {
    this.linkInterceptor.start();
  }
  stop() {
    this.linkInterceptor.stop();
  }
  // Link hover observer delegate
  canPrefetchRequestToLocation(link, location2) {
    return false;
  }
  prefetchAndCacheRequestToLocation(link, location2) {
    return;
  }
  // Link click observer delegate
  willFollowLinkToLocation(link, location2, originalEvent) {
    return this.delegate.willSubmitFormLinkToLocation(link, location2, originalEvent) && (link.hasAttribute("data-turbo-method") || link.hasAttribute("data-turbo-stream"));
  }
  followedLinkToLocation(link, location2) {
    const form = document.createElement("form");
    const type = "hidden";
    for (const [name, value] of location2.searchParams) {
      form.append(Object.assign(document.createElement("input"), { type, name, value }));
    }
    const action = Object.assign(location2, { search: "" });
    form.setAttribute("data-turbo", "true");
    form.setAttribute("action", action.href);
    form.setAttribute("hidden", "");
    const method = link.getAttribute("data-turbo-method");
    if (method) form.setAttribute("method", method);
    const turboFrame = link.getAttribute("data-turbo-frame");
    if (turboFrame) form.setAttribute("data-turbo-frame", turboFrame);
    const turboAction = getVisitAction(link);
    if (turboAction) form.setAttribute("data-turbo-action", turboAction);
    const turboConfirm = link.getAttribute("data-turbo-confirm");
    if (turboConfirm) form.setAttribute("data-turbo-confirm", turboConfirm);
    const turboStream = link.hasAttribute("data-turbo-stream");
    if (turboStream) form.setAttribute("data-turbo-stream", "");
    this.delegate.submittedFormLinkToLocation(link, location2, form);
    document.body.appendChild(form);
    form.addEventListener("turbo:submit-end", () => form.remove(), { once: true });
    requestAnimationFrame(() => form.requestSubmit());
  }
};
var Bardo = class {
  static async preservingPermanentElements(delegate, permanentElementMap, callback) {
    const bardo = new this(delegate, permanentElementMap);
    bardo.enter();
    await callback();
    bardo.leave();
  }
  constructor(delegate, permanentElementMap) {
    this.delegate = delegate;
    this.permanentElementMap = permanentElementMap;
  }
  enter() {
    for (const id in this.permanentElementMap) {
      const [currentPermanentElement, newPermanentElement] = this.permanentElementMap[id];
      this.delegate.enteringBardo(currentPermanentElement, newPermanentElement);
      this.replaceNewPermanentElementWithPlaceholder(newPermanentElement);
    }
  }
  leave() {
    for (const id in this.permanentElementMap) {
      const [currentPermanentElement] = this.permanentElementMap[id];
      this.replaceCurrentPermanentElementWithClone(currentPermanentElement);
      this.replacePlaceholderWithPermanentElement(currentPermanentElement);
      this.delegate.leavingBardo(currentPermanentElement);
    }
  }
  replaceNewPermanentElementWithPlaceholder(permanentElement) {
    const placeholder = createPlaceholderForPermanentElement(permanentElement);
    permanentElement.replaceWith(placeholder);
  }
  replaceCurrentPermanentElementWithClone(permanentElement) {
    const clone = permanentElement.cloneNode(true);
    permanentElement.replaceWith(clone);
  }
  replacePlaceholderWithPermanentElement(permanentElement) {
    const placeholder = this.getPlaceholderById(permanentElement.id);
    placeholder?.replaceWith(permanentElement);
  }
  getPlaceholderById(id) {
    return this.placeholders.find((element) => element.content == id);
  }
  get placeholders() {
    return [...document.querySelectorAll("meta[name=turbo-permanent-placeholder][content]")];
  }
};
function createPlaceholderForPermanentElement(permanentElement) {
  const element = document.createElement("meta");
  element.setAttribute("name", "turbo-permanent-placeholder");
  element.setAttribute("content", permanentElement.id);
  return element;
}
var Renderer = class {
  #activeElement = null;
  static renderElement(currentElement, newElement) {
  }
  constructor(currentSnapshot, newSnapshot, isPreview, willRender = true) {
    this.currentSnapshot = currentSnapshot;
    this.newSnapshot = newSnapshot;
    this.isPreview = isPreview;
    this.willRender = willRender;
    this.renderElement = this.constructor.renderElement;
    this.promise = new Promise((resolve, reject) => this.resolvingFunctions = { resolve, reject });
  }
  get shouldRender() {
    return true;
  }
  get shouldAutofocus() {
    return true;
  }
  get reloadReason() {
    return;
  }
  prepareToRender() {
    return;
  }
  render() {
  }
  finishRendering() {
    if (this.resolvingFunctions) {
      this.resolvingFunctions.resolve();
      delete this.resolvingFunctions;
    }
  }
  async preservingPermanentElements(callback) {
    await Bardo.preservingPermanentElements(this, this.permanentElementMap, callback);
  }
  focusFirstAutofocusableElement() {
    if (this.shouldAutofocus) {
      const element = this.connectedSnapshot.firstAutofocusableElement;
      if (element) {
        element.focus();
      }
    }
  }
  // Bardo delegate
  enteringBardo(currentPermanentElement) {
    if (this.#activeElement) return;
    if (currentPermanentElement.contains(this.currentSnapshot.activeElement)) {
      this.#activeElement = this.currentSnapshot.activeElement;
    }
  }
  leavingBardo(currentPermanentElement) {
    if (currentPermanentElement.contains(this.#activeElement) && this.#activeElement instanceof HTMLElement) {
      this.#activeElement.focus();
      this.#activeElement = null;
    }
  }
  get connectedSnapshot() {
    return this.newSnapshot.isConnected ? this.newSnapshot : this.currentSnapshot;
  }
  get currentElement() {
    return this.currentSnapshot.element;
  }
  get newElement() {
    return this.newSnapshot.element;
  }
  get permanentElementMap() {
    return this.currentSnapshot.getPermanentElementMapForSnapshot(this.newSnapshot);
  }
  get renderMethod() {
    return "replace";
  }
};
var FrameRenderer = class extends Renderer {
  static renderElement(currentElement, newElement) {
    const destinationRange = document.createRange();
    destinationRange.selectNodeContents(currentElement);
    destinationRange.deleteContents();
    const frameElement = newElement;
    const sourceRange = frameElement.ownerDocument?.createRange();
    if (sourceRange) {
      sourceRange.selectNodeContents(frameElement);
      currentElement.appendChild(sourceRange.extractContents());
    }
  }
  constructor(delegate, currentSnapshot, newSnapshot, renderElement, isPreview, willRender = true) {
    super(currentSnapshot, newSnapshot, renderElement, isPreview, willRender);
    this.delegate = delegate;
  }
  get shouldRender() {
    return true;
  }
  async render() {
    await nextRepaint();
    this.preservingPermanentElements(() => {
      this.loadFrameElement();
    });
    this.scrollFrameIntoView();
    await nextRepaint();
    this.focusFirstAutofocusableElement();
    await nextRepaint();
    this.activateScriptElements();
  }
  loadFrameElement() {
    this.delegate.willRenderFrame(this.currentElement, this.newElement);
    this.renderElement(this.currentElement, this.newElement);
  }
  scrollFrameIntoView() {
    if (this.currentElement.autoscroll || this.newElement.autoscroll) {
      const element = this.currentElement.firstElementChild;
      const block = readScrollLogicalPosition(this.currentElement.getAttribute("data-autoscroll-block"), "end");
      const behavior = readScrollBehavior(this.currentElement.getAttribute("data-autoscroll-behavior"), "auto");
      if (element) {
        element.scrollIntoView({ block, behavior });
        return true;
      }
    }
    return false;
  }
  activateScriptElements() {
    for (const inertScriptElement of this.newScriptElements) {
      const activatedScriptElement = activateScriptElement(inertScriptElement);
      inertScriptElement.replaceWith(activatedScriptElement);
    }
  }
  get newScriptElements() {
    return this.currentElement.querySelectorAll("script");
  }
};
function readScrollLogicalPosition(value, defaultValue) {
  if (value == "end" || value == "start" || value == "center" || value == "nearest") {
    return value;
  } else {
    return defaultValue;
  }
}
function readScrollBehavior(value, defaultValue) {
  if (value == "auto" || value == "smooth") {
    return value;
  } else {
    return defaultValue;
  }
}
var Idiomorph = (function() {
  const noOp = () => {
  };
  const defaults = {
    morphStyle: "outerHTML",
    callbacks: {
      beforeNodeAdded: noOp,
      afterNodeAdded: noOp,
      beforeNodeMorphed: noOp,
      afterNodeMorphed: noOp,
      beforeNodeRemoved: noOp,
      afterNodeRemoved: noOp,
      beforeAttributeUpdated: noOp
    },
    head: {
      style: "merge",
      shouldPreserve: (elt) => elt.getAttribute("im-preserve") === "true",
      shouldReAppend: (elt) => elt.getAttribute("im-re-append") === "true",
      shouldRemove: noOp,
      afterHeadMorphed: noOp
    },
    restoreFocus: true
  };
  function morph(oldNode, newContent, config2 = {}) {
    oldNode = normalizeElement(oldNode);
    const newNode = normalizeParent(newContent);
    const ctx = createMorphContext(oldNode, newNode, config2);
    const morphedNodes = saveAndRestoreFocus(ctx, () => {
      return withHeadBlocking(
        ctx,
        oldNode,
        newNode,
        /** @param {MorphContext} ctx */
        (ctx2) => {
          if (ctx2.morphStyle === "innerHTML") {
            morphChildren2(ctx2, oldNode, newNode);
            return Array.from(oldNode.childNodes);
          } else {
            return morphOuterHTML(ctx2, oldNode, newNode);
          }
        }
      );
    });
    ctx.pantry.remove();
    return morphedNodes;
  }
  function morphOuterHTML(ctx, oldNode, newNode) {
    const oldParent = normalizeParent(oldNode);
    morphChildren2(
      ctx,
      oldParent,
      newNode,
      // these two optional params are the secret sauce
      oldNode,
      // start point for iteration
      oldNode.nextSibling
      // end point for iteration
    );
    return Array.from(oldParent.childNodes);
  }
  function saveAndRestoreFocus(ctx, fn) {
    if (!ctx.config.restoreFocus) return fn();
    let activeElement = (
      /** @type {HTMLInputElement|HTMLTextAreaElement|null} */
      document.activeElement
    );
    if (!(activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement)) {
      return fn();
    }
    const { id: activeElementId, selectionStart, selectionEnd } = activeElement;
    const results = fn();
    if (activeElementId && activeElementId !== document.activeElement?.getAttribute("id")) {
      activeElement = ctx.target.querySelector(`[id="${activeElementId}"]`);
      activeElement?.focus();
    }
    if (activeElement && !activeElement.selectionEnd && selectionEnd) {
      activeElement.setSelectionRange(selectionStart, selectionEnd);
    }
    return results;
  }
  const morphChildren2 = /* @__PURE__ */ (function() {
    function morphChildren3(ctx, oldParent, newParent, insertionPoint = null, endPoint = null) {
      if (oldParent instanceof HTMLTemplateElement && newParent instanceof HTMLTemplateElement) {
        oldParent = oldParent.content;
        newParent = newParent.content;
      }
      insertionPoint ||= oldParent.firstChild;
      for (const newChild of newParent.childNodes) {
        if (insertionPoint && insertionPoint != endPoint) {
          const bestMatch = findBestMatch(
            ctx,
            newChild,
            insertionPoint,
            endPoint
          );
          if (bestMatch) {
            if (bestMatch !== insertionPoint) {
              removeNodesBetween(ctx, insertionPoint, bestMatch);
            }
            morphNode(bestMatch, newChild, ctx);
            insertionPoint = bestMatch.nextSibling;
            continue;
          }
        }
        if (newChild instanceof Element) {
          const newChildId = (
            /** @type {String} */
            newChild.getAttribute("id")
          );
          if (ctx.persistentIds.has(newChildId)) {
            const movedChild = moveBeforeById(
              oldParent,
              newChildId,
              insertionPoint,
              ctx
            );
            morphNode(movedChild, newChild, ctx);
            insertionPoint = movedChild.nextSibling;
            continue;
          }
        }
        const insertedNode = createNode(
          oldParent,
          newChild,
          insertionPoint,
          ctx
        );
        if (insertedNode) {
          insertionPoint = insertedNode.nextSibling;
        }
      }
      while (insertionPoint && insertionPoint != endPoint) {
        const tempNode = insertionPoint;
        insertionPoint = insertionPoint.nextSibling;
        removeNode(ctx, tempNode);
      }
    }
    function createNode(oldParent, newChild, insertionPoint, ctx) {
      if (ctx.callbacks.beforeNodeAdded(newChild) === false) return null;
      if (ctx.idMap.has(newChild)) {
        const newEmptyChild = document.createElement(
          /** @type {Element} */
          newChild.tagName
        );
        oldParent.insertBefore(newEmptyChild, insertionPoint);
        morphNode(newEmptyChild, newChild, ctx);
        ctx.callbacks.afterNodeAdded(newEmptyChild);
        return newEmptyChild;
      } else {
        const newClonedChild = document.importNode(newChild, true);
        oldParent.insertBefore(newClonedChild, insertionPoint);
        ctx.callbacks.afterNodeAdded(newClonedChild);
        return newClonedChild;
      }
    }
    const findBestMatch = /* @__PURE__ */ (function() {
      function findBestMatch2(ctx, node, startPoint, endPoint) {
        let softMatch = null;
        let nextSibling = node.nextSibling;
        let siblingSoftMatchCount = 0;
        let cursor = startPoint;
        while (cursor && cursor != endPoint) {
          if (isSoftMatch(cursor, node)) {
            if (isIdSetMatch(ctx, cursor, node)) {
              return cursor;
            }
            if (softMatch === null) {
              if (!ctx.idMap.has(cursor)) {
                softMatch = cursor;
              }
            }
          }
          if (softMatch === null && nextSibling && isSoftMatch(cursor, nextSibling)) {
            siblingSoftMatchCount++;
            nextSibling = nextSibling.nextSibling;
            if (siblingSoftMatchCount >= 2) {
              softMatch = void 0;
            }
          }
          if (ctx.activeElementAndParents.includes(cursor)) break;
          cursor = cursor.nextSibling;
        }
        return softMatch || null;
      }
      function isIdSetMatch(ctx, oldNode, newNode) {
        let oldSet = ctx.idMap.get(oldNode);
        let newSet = ctx.idMap.get(newNode);
        if (!newSet || !oldSet) return false;
        for (const id of oldSet) {
          if (newSet.has(id)) {
            return true;
          }
        }
        return false;
      }
      function isSoftMatch(oldNode, newNode) {
        const oldElt = (
          /** @type {Element} */
          oldNode
        );
        const newElt = (
          /** @type {Element} */
          newNode
        );
        return oldElt.nodeType === newElt.nodeType && oldElt.tagName === newElt.tagName && // If oldElt has an `id` with possible state and it doesn't match newElt.id then avoid morphing.
        // We'll still match an anonymous node with an IDed newElt, though, because if it got this far,
        // its not persistent, and new nodes can't have any hidden state.
        // We can't use .id because of form input shadowing, and we can't count on .getAttribute's presence because it could be a document-fragment
        (!oldElt.getAttribute?.("id") || oldElt.getAttribute?.("id") === newElt.getAttribute?.("id"));
      }
      return findBestMatch2;
    })();
    function removeNode(ctx, node) {
      if (ctx.idMap.has(node)) {
        moveBefore(ctx.pantry, node, null);
      } else {
        if (ctx.callbacks.beforeNodeRemoved(node) === false) return;
        node.parentNode?.removeChild(node);
        ctx.callbacks.afterNodeRemoved(node);
      }
    }
    function removeNodesBetween(ctx, startInclusive, endExclusive) {
      let cursor = startInclusive;
      while (cursor && cursor !== endExclusive) {
        let tempNode = (
          /** @type {Node} */
          cursor
        );
        cursor = cursor.nextSibling;
        removeNode(ctx, tempNode);
      }
      return cursor;
    }
    function moveBeforeById(parentNode, id, after, ctx) {
      const target = (
        /** @type {Element} - will always be found */
        // ctx.target.id unsafe because of form input shadowing
        // ctx.target could be a document fragment which doesn't have `getAttribute`
        ctx.target.getAttribute?.("id") === id && ctx.target || ctx.target.querySelector(`[id="${id}"]`) || ctx.pantry.querySelector(`[id="${id}"]`)
      );
      removeElementFromAncestorsIdMaps(target, ctx);
      moveBefore(parentNode, target, after);
      return target;
    }
    function removeElementFromAncestorsIdMaps(element, ctx) {
      const id = (
        /** @type {String} */
        element.getAttribute("id")
      );
      while (element = element.parentNode) {
        let idSet = ctx.idMap.get(element);
        if (idSet) {
          idSet.delete(id);
          if (!idSet.size) {
            ctx.idMap.delete(element);
          }
        }
      }
    }
    function moveBefore(parentNode, element, after) {
      if (parentNode.moveBefore) {
        try {
          parentNode.moveBefore(element, after);
        } catch (e) {
          parentNode.insertBefore(element, after);
        }
      } else {
        parentNode.insertBefore(element, after);
      }
    }
    return morphChildren3;
  })();
  const morphNode = /* @__PURE__ */ (function() {
    function morphNode2(oldNode, newContent, ctx) {
      if (ctx.ignoreActive && oldNode === document.activeElement) {
        return null;
      }
      if (ctx.callbacks.beforeNodeMorphed(oldNode, newContent) === false) {
        return oldNode;
      }
      if (oldNode instanceof HTMLHeadElement && ctx.head.ignore) ;
      else if (oldNode instanceof HTMLHeadElement && ctx.head.style !== "morph") {
        handleHeadElement(
          oldNode,
          /** @type {HTMLHeadElement} */
          newContent,
          ctx
        );
      } else {
        morphAttributes(oldNode, newContent, ctx);
        if (!ignoreValueOfActiveElement(oldNode, ctx)) {
          morphChildren2(ctx, oldNode, newContent);
        }
      }
      ctx.callbacks.afterNodeMorphed(oldNode, newContent);
      return oldNode;
    }
    function morphAttributes(oldNode, newNode, ctx) {
      let type = newNode.nodeType;
      if (type === 1) {
        const oldElt = (
          /** @type {Element} */
          oldNode
        );
        const newElt = (
          /** @type {Element} */
          newNode
        );
        const oldAttributes = oldElt.attributes;
        const newAttributes = newElt.attributes;
        for (const newAttribute of newAttributes) {
          if (ignoreAttribute(newAttribute.name, oldElt, "update", ctx)) {
            continue;
          }
          if (oldElt.getAttribute(newAttribute.name) !== newAttribute.value) {
            oldElt.setAttribute(newAttribute.name, newAttribute.value);
          }
        }
        for (let i = oldAttributes.length - 1; 0 <= i; i--) {
          const oldAttribute = oldAttributes[i];
          if (!oldAttribute) continue;
          if (!newElt.hasAttribute(oldAttribute.name)) {
            if (ignoreAttribute(oldAttribute.name, oldElt, "remove", ctx)) {
              continue;
            }
            oldElt.removeAttribute(oldAttribute.name);
          }
        }
        if (!ignoreValueOfActiveElement(oldElt, ctx)) {
          syncInputValue(oldElt, newElt, ctx);
        }
      }
      if (type === 8 || type === 3) {
        if (oldNode.nodeValue !== newNode.nodeValue) {
          oldNode.nodeValue = newNode.nodeValue;
        }
      }
    }
    function syncInputValue(oldElement, newElement, ctx) {
      if (oldElement instanceof HTMLInputElement && newElement instanceof HTMLInputElement && newElement.type !== "file") {
        let newValue = newElement.value;
        let oldValue = oldElement.value;
        syncBooleanAttribute(oldElement, newElement, "checked", ctx);
        syncBooleanAttribute(oldElement, newElement, "disabled", ctx);
        if (!newElement.hasAttribute("value")) {
          if (!ignoreAttribute("value", oldElement, "remove", ctx)) {
            oldElement.value = "";
            oldElement.removeAttribute("value");
          }
        } else if (oldValue !== newValue) {
          if (!ignoreAttribute("value", oldElement, "update", ctx)) {
            oldElement.setAttribute("value", newValue);
            oldElement.value = newValue;
          }
        }
      } else if (oldElement instanceof HTMLOptionElement && newElement instanceof HTMLOptionElement) {
        syncBooleanAttribute(oldElement, newElement, "selected", ctx);
      } else if (oldElement instanceof HTMLTextAreaElement && newElement instanceof HTMLTextAreaElement) {
        let newValue = newElement.value;
        let oldValue = oldElement.value;
        if (ignoreAttribute("value", oldElement, "update", ctx)) {
          return;
        }
        if (newValue !== oldValue) {
          oldElement.value = newValue;
        }
        if (oldElement.firstChild && oldElement.firstChild.nodeValue !== newValue) {
          oldElement.firstChild.nodeValue = newValue;
        }
      }
    }
    function syncBooleanAttribute(oldElement, newElement, attributeName, ctx) {
      const newLiveValue = newElement[attributeName], oldLiveValue = oldElement[attributeName];
      if (newLiveValue !== oldLiveValue) {
        const ignoreUpdate = ignoreAttribute(
          attributeName,
          oldElement,
          "update",
          ctx
        );
        if (!ignoreUpdate) {
          oldElement[attributeName] = newElement[attributeName];
        }
        if (newLiveValue) {
          if (!ignoreUpdate) {
            oldElement.setAttribute(attributeName, "");
          }
        } else {
          if (!ignoreAttribute(attributeName, oldElement, "remove", ctx)) {
            oldElement.removeAttribute(attributeName);
          }
        }
      }
    }
    function ignoreAttribute(attr, element, updateType, ctx) {
      if (attr === "value" && ctx.ignoreActiveValue && element === document.activeElement) {
        return true;
      }
      return ctx.callbacks.beforeAttributeUpdated(attr, element, updateType) === false;
    }
    function ignoreValueOfActiveElement(possibleActiveElement, ctx) {
      return !!ctx.ignoreActiveValue && possibleActiveElement === document.activeElement && possibleActiveElement !== document.body;
    }
    return morphNode2;
  })();
  function withHeadBlocking(ctx, oldNode, newNode, callback) {
    if (ctx.head.block) {
      const oldHead = oldNode.querySelector("head");
      const newHead = newNode.querySelector("head");
      if (oldHead && newHead) {
        const promises = handleHeadElement(oldHead, newHead, ctx);
        return Promise.all(promises).then(() => {
          const newCtx = Object.assign(ctx, {
            head: {
              block: false,
              ignore: true
            }
          });
          return callback(newCtx);
        });
      }
    }
    return callback(ctx);
  }
  function handleHeadElement(oldHead, newHead, ctx) {
    let added = [];
    let removed = [];
    let preserved = [];
    let nodesToAppend = [];
    let srcToNewHeadNodes = /* @__PURE__ */ new Map();
    for (const newHeadChild of newHead.children) {
      srcToNewHeadNodes.set(newHeadChild.outerHTML, newHeadChild);
    }
    for (const currentHeadElt of oldHead.children) {
      let inNewContent = srcToNewHeadNodes.has(currentHeadElt.outerHTML);
      let isReAppended = ctx.head.shouldReAppend(currentHeadElt);
      let isPreserved = ctx.head.shouldPreserve(currentHeadElt);
      if (inNewContent || isPreserved) {
        if (isReAppended) {
          removed.push(currentHeadElt);
        } else {
          srcToNewHeadNodes.delete(currentHeadElt.outerHTML);
          preserved.push(currentHeadElt);
        }
      } else {
        if (ctx.head.style === "append") {
          if (isReAppended) {
            removed.push(currentHeadElt);
            nodesToAppend.push(currentHeadElt);
          }
        } else {
          if (ctx.head.shouldRemove(currentHeadElt) !== false) {
            removed.push(currentHeadElt);
          }
        }
      }
    }
    nodesToAppend.push(...srcToNewHeadNodes.values());
    let promises = [];
    for (const newNode of nodesToAppend) {
      let newElt = (
        /** @type {ChildNode} */
        document.createRange().createContextualFragment(newNode.outerHTML).firstChild
      );
      if (ctx.callbacks.beforeNodeAdded(newElt) !== false) {
        if ("href" in newElt && newElt.href || "src" in newElt && newElt.src) {
          let resolve;
          let promise = new Promise(function(_resolve) {
            resolve = _resolve;
          });
          newElt.addEventListener("load", function() {
            resolve();
          });
          promises.push(promise);
        }
        oldHead.appendChild(newElt);
        ctx.callbacks.afterNodeAdded(newElt);
        added.push(newElt);
      }
    }
    for (const removedElement of removed) {
      if (ctx.callbacks.beforeNodeRemoved(removedElement) !== false) {
        oldHead.removeChild(removedElement);
        ctx.callbacks.afterNodeRemoved(removedElement);
      }
    }
    ctx.head.afterHeadMorphed(oldHead, {
      added,
      kept: preserved,
      removed
    });
    return promises;
  }
  const createMorphContext = /* @__PURE__ */ (function() {
    function createMorphContext2(oldNode, newContent, config2) {
      const { persistentIds, idMap } = createIdMaps(oldNode, newContent);
      const mergedConfig = mergeDefaults(config2);
      const morphStyle = mergedConfig.morphStyle || "outerHTML";
      if (!["innerHTML", "outerHTML"].includes(morphStyle)) {
        throw `Do not understand how to morph style ${morphStyle}`;
      }
      return {
        target: oldNode,
        newContent,
        config: mergedConfig,
        morphStyle,
        ignoreActive: mergedConfig.ignoreActive,
        ignoreActiveValue: mergedConfig.ignoreActiveValue,
        restoreFocus: mergedConfig.restoreFocus,
        idMap,
        persistentIds,
        pantry: createPantry(),
        activeElementAndParents: createActiveElementAndParents(oldNode),
        callbacks: mergedConfig.callbacks,
        head: mergedConfig.head
      };
    }
    function mergeDefaults(config2) {
      let finalConfig = Object.assign({}, defaults);
      Object.assign(finalConfig, config2);
      finalConfig.callbacks = Object.assign(
        {},
        defaults.callbacks,
        config2.callbacks
      );
      finalConfig.head = Object.assign({}, defaults.head, config2.head);
      return finalConfig;
    }
    function createPantry() {
      const pantry = document.createElement("div");
      pantry.hidden = true;
      document.body.insertAdjacentElement("afterend", pantry);
      return pantry;
    }
    function createActiveElementAndParents(oldNode) {
      let activeElementAndParents = [];
      let elt = document.activeElement;
      if (elt?.tagName !== "BODY" && oldNode.contains(elt)) {
        while (elt) {
          activeElementAndParents.push(elt);
          if (elt === oldNode) break;
          elt = elt.parentElement;
        }
      }
      return activeElementAndParents;
    }
    function findIdElements(root) {
      let elements = Array.from(root.querySelectorAll("[id]"));
      if (root.getAttribute?.("id")) {
        elements.push(root);
      }
      return elements;
    }
    function populateIdMapWithTree(idMap, persistentIds, root, elements) {
      for (const elt of elements) {
        const id = (
          /** @type {String} */
          elt.getAttribute("id")
        );
        if (persistentIds.has(id)) {
          let current = elt;
          while (current) {
            let idSet = idMap.get(current);
            if (idSet == null) {
              idSet = /* @__PURE__ */ new Set();
              idMap.set(current, idSet);
            }
            idSet.add(id);
            if (current === root) break;
            current = current.parentElement;
          }
        }
      }
    }
    function createIdMaps(oldContent, newContent) {
      const oldIdElements = findIdElements(oldContent);
      const newIdElements = findIdElements(newContent);
      const persistentIds = createPersistentIds(oldIdElements, newIdElements);
      let idMap = /* @__PURE__ */ new Map();
      populateIdMapWithTree(idMap, persistentIds, oldContent, oldIdElements);
      const newRoot = newContent.__idiomorphRoot || newContent;
      populateIdMapWithTree(idMap, persistentIds, newRoot, newIdElements);
      return { persistentIds, idMap };
    }
    function createPersistentIds(oldIdElements, newIdElements) {
      let duplicateIds = /* @__PURE__ */ new Set();
      let oldIdTagNameMap = /* @__PURE__ */ new Map();
      for (const { id, tagName } of oldIdElements) {
        if (oldIdTagNameMap.has(id)) {
          duplicateIds.add(id);
        } else {
          oldIdTagNameMap.set(id, tagName);
        }
      }
      let persistentIds = /* @__PURE__ */ new Set();
      for (const { id, tagName } of newIdElements) {
        if (persistentIds.has(id)) {
          duplicateIds.add(id);
        } else if (oldIdTagNameMap.get(id) === tagName) {
          persistentIds.add(id);
        }
      }
      for (const id of duplicateIds) {
        persistentIds.delete(id);
      }
      return persistentIds;
    }
    return createMorphContext2;
  })();
  const { normalizeElement, normalizeParent } = /* @__PURE__ */ (function() {
    const generatedByIdiomorph = /* @__PURE__ */ new WeakSet();
    function normalizeElement2(content) {
      if (content instanceof Document) {
        return content.documentElement;
      } else {
        return content;
      }
    }
    function normalizeParent2(newContent) {
      if (newContent == null) {
        return document.createElement("div");
      } else if (typeof newContent === "string") {
        return normalizeParent2(parseContent(newContent));
      } else if (generatedByIdiomorph.has(
        /** @type {Element} */
        newContent
      )) {
        return (
          /** @type {Element} */
          newContent
        );
      } else if (newContent instanceof Node) {
        if (newContent.parentNode) {
          return (
            /** @type {any} */
            new SlicedParentNode(newContent)
          );
        } else {
          const dummyParent = document.createElement("div");
          dummyParent.append(newContent);
          return dummyParent;
        }
      } else {
        const dummyParent = document.createElement("div");
        for (const elt of [...newContent]) {
          dummyParent.append(elt);
        }
        return dummyParent;
      }
    }
    class SlicedParentNode {
      /** @param {Node} node */
      constructor(node) {
        this.originalNode = node;
        this.realParentNode = /** @type {Element} */
        node.parentNode;
        this.previousSibling = node.previousSibling;
        this.nextSibling = node.nextSibling;
      }
      /** @returns {Node[]} */
      get childNodes() {
        const nodes = [];
        let cursor = this.previousSibling ? this.previousSibling.nextSibling : this.realParentNode.firstChild;
        while (cursor && cursor != this.nextSibling) {
          nodes.push(cursor);
          cursor = cursor.nextSibling;
        }
        return nodes;
      }
      /**
       * @param {string} selector
       * @returns {Element[]}
       */
      querySelectorAll(selector) {
        return this.childNodes.reduce(
          (results, node) => {
            if (node instanceof Element) {
              if (node.matches(selector)) results.push(node);
              const nodeList = node.querySelectorAll(selector);
              for (let i = 0; i < nodeList.length; i++) {
                results.push(nodeList[i]);
              }
            }
            return results;
          },
          /** @type {Element[]} */
          []
        );
      }
      /**
       * @param {Node} node
       * @param {Node} referenceNode
       * @returns {Node}
       */
      insertBefore(node, referenceNode) {
        return this.realParentNode.insertBefore(node, referenceNode);
      }
      /**
       * @param {Node} node
       * @param {Node} referenceNode
       * @returns {Node}
       */
      moveBefore(node, referenceNode) {
        return this.realParentNode.moveBefore(node, referenceNode);
      }
      /**
       * for later use with populateIdMapWithTree to halt upwards iteration
       * @returns {Node}
       */
      get __idiomorphRoot() {
        return this.originalNode;
      }
    }
    function parseContent(newContent) {
      let parser = new DOMParser();
      let contentWithSvgsRemoved = newContent.replace(
        /<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim,
        ""
      );
      if (contentWithSvgsRemoved.match(/<\/html>/) || contentWithSvgsRemoved.match(/<\/head>/) || contentWithSvgsRemoved.match(/<\/body>/)) {
        let content = parser.parseFromString(newContent, "text/html");
        if (contentWithSvgsRemoved.match(/<\/html>/)) {
          generatedByIdiomorph.add(content);
          return content;
        } else {
          let htmlElement = content.firstChild;
          if (htmlElement) {
            generatedByIdiomorph.add(htmlElement);
          }
          return htmlElement;
        }
      } else {
        let responseDoc = parser.parseFromString(
          "<body><template>" + newContent + "</template></body>",
          "text/html"
        );
        let content = (
          /** @type {HTMLTemplateElement} */
          responseDoc.body.querySelector("template").content
        );
        generatedByIdiomorph.add(content);
        return content;
      }
    }
    return { normalizeElement: normalizeElement2, normalizeParent: normalizeParent2 };
  })();
  return {
    morph,
    defaults
  };
})();
function morphElements(currentElement, newElement, { callbacks, ...options } = {}) {
  Idiomorph.morph(currentElement, newElement, {
    ...options,
    callbacks: new DefaultIdiomorphCallbacks(callbacks)
  });
}
function morphChildren(currentElement, newElement, options = {}) {
  morphElements(currentElement, newElement.childNodes, {
    ...options,
    morphStyle: "innerHTML"
  });
}
function shouldRefreshFrameWithMorphing(currentFrame, newFrame) {
  return currentFrame instanceof FrameElement && currentFrame.shouldReloadWithMorph && (!newFrame || areFramesCompatibleForRefreshing(currentFrame, newFrame)) && !currentFrame.closest("[data-turbo-permanent]");
}
function areFramesCompatibleForRefreshing(currentFrame, newFrame) {
  return newFrame instanceof Element && newFrame.nodeName === "TURBO-FRAME" && currentFrame.id === newFrame.id && (!newFrame.getAttribute("src") || urlsAreEqual(currentFrame.src, newFrame.getAttribute("src")));
}
function closestFrameReloadableWithMorphing(node) {
  return node.parentElement.closest("turbo-frame[src][refresh=morph]");
}
var DefaultIdiomorphCallbacks = class {
  #beforeNodeMorphed;
  constructor({ beforeNodeMorphed } = {}) {
    this.#beforeNodeMorphed = beforeNodeMorphed || (() => true);
  }
  beforeNodeAdded = (node) => {
    return !(node.id && node.hasAttribute("data-turbo-permanent") && document.getElementById(node.id));
  };
  beforeNodeMorphed = (currentElement, newElement) => {
    if (currentElement instanceof Element) {
      if (!currentElement.hasAttribute("data-turbo-permanent") && this.#beforeNodeMorphed(currentElement, newElement)) {
        const event = dispatch("turbo:before-morph-element", {
          cancelable: true,
          target: currentElement,
          detail: { currentElement, newElement }
        });
        return !event.defaultPrevented;
      } else {
        return false;
      }
    }
  };
  beforeAttributeUpdated = (attributeName, target, mutationType) => {
    const event = dispatch("turbo:before-morph-attribute", {
      cancelable: true,
      target,
      detail: { attributeName, mutationType }
    });
    return !event.defaultPrevented;
  };
  beforeNodeRemoved = (node) => {
    return this.beforeNodeMorphed(node);
  };
  afterNodeMorphed = (currentElement, newElement) => {
    if (currentElement instanceof Element) {
      dispatch("turbo:morph-element", {
        target: currentElement,
        detail: { currentElement, newElement }
      });
    }
  };
};
var MorphingFrameRenderer = class extends FrameRenderer {
  static renderElement(currentElement, newElement) {
    dispatch("turbo:before-frame-morph", {
      target: currentElement,
      detail: { currentElement, newElement }
    });
    morphChildren(currentElement, newElement, {
      callbacks: {
        beforeNodeMorphed: (node, newNode) => {
          if (shouldRefreshFrameWithMorphing(node, newNode) && closestFrameReloadableWithMorphing(node) === currentElement) {
            node.reload();
            return false;
          }
          return true;
        }
      }
    });
  }
  async preservingPermanentElements(callback) {
    return await callback();
  }
};
var ProgressBar = class _ProgressBar {
  static animationDuration = 300;
  /*ms*/
  static get defaultCSS() {
    return unindent`
      .turbo-progress-bar {
        position: fixed;
        display: block;
        top: 0;
        left: 0;
        height: 3px;
        background: #0076ff;
        z-index: 2147483647;
        transition:
          width ${_ProgressBar.animationDuration}ms ease-out,
          opacity ${_ProgressBar.animationDuration / 2}ms ${_ProgressBar.animationDuration / 2}ms ease-in;
        transform: translate3d(0, 0, 0);
      }
    `;
  }
  hiding = false;
  value = 0;
  visible = false;
  constructor() {
    this.stylesheetElement = this.createStylesheetElement();
    this.progressElement = this.createProgressElement();
    this.installStylesheetElement();
    this.setValue(0);
  }
  show() {
    if (!this.visible) {
      this.visible = true;
      this.installProgressElement();
      this.startTrickling();
    }
  }
  hide() {
    if (this.visible && !this.hiding) {
      this.hiding = true;
      this.fadeProgressElement(() => {
        this.uninstallProgressElement();
        this.stopTrickling();
        this.visible = false;
        this.hiding = false;
      });
    }
  }
  setValue(value) {
    this.value = value;
    this.refresh();
  }
  // Private
  installStylesheetElement() {
    document.head.insertBefore(this.stylesheetElement, document.head.firstChild);
  }
  installProgressElement() {
    this.progressElement.style.width = "0";
    this.progressElement.style.opacity = "1";
    document.documentElement.insertBefore(this.progressElement, document.body);
    this.refresh();
  }
  fadeProgressElement(callback) {
    this.progressElement.style.opacity = "0";
    setTimeout(callback, _ProgressBar.animationDuration * 1.5);
  }
  uninstallProgressElement() {
    if (this.progressElement.parentNode) {
      document.documentElement.removeChild(this.progressElement);
    }
  }
  startTrickling() {
    if (!this.trickleInterval) {
      this.trickleInterval = window.setInterval(this.trickle, _ProgressBar.animationDuration);
    }
  }
  stopTrickling() {
    window.clearInterval(this.trickleInterval);
    delete this.trickleInterval;
  }
  trickle = () => {
    this.setValue(this.value + Math.random() / 100);
  };
  refresh() {
    requestAnimationFrame(() => {
      this.progressElement.style.width = `${10 + this.value * 90}%`;
    });
  }
  createStylesheetElement() {
    const element = document.createElement("style");
    element.type = "text/css";
    element.textContent = _ProgressBar.defaultCSS;
    const cspNonce = getCspNonce();
    if (cspNonce) {
      element.nonce = cspNonce;
    }
    return element;
  }
  createProgressElement() {
    const element = document.createElement("div");
    element.className = "turbo-progress-bar";
    return element;
  }
};
var HeadSnapshot = class extends Snapshot {
  detailsByOuterHTML = this.children.filter((element) => !elementIsNoscript(element)).map((element) => elementWithoutNonce(element)).reduce((result, element) => {
    const { outerHTML } = element;
    const details = outerHTML in result ? result[outerHTML] : {
      type: elementType(element),
      tracked: elementIsTracked(element),
      elements: []
    };
    return {
      ...result,
      [outerHTML]: {
        ...details,
        elements: [...details.elements, element]
      }
    };
  }, {});
  get trackedElementSignature() {
    return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => this.detailsByOuterHTML[outerHTML].tracked).join("");
  }
  getScriptElementsNotInSnapshot(snapshot) {
    return this.getElementsMatchingTypeNotInSnapshot("script", snapshot);
  }
  getStylesheetElementsNotInSnapshot(snapshot) {
    return this.getElementsMatchingTypeNotInSnapshot("stylesheet", snapshot);
  }
  getElementsMatchingTypeNotInSnapshot(matchedType, snapshot) {
    return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => !(outerHTML in snapshot.detailsByOuterHTML)).map((outerHTML) => this.detailsByOuterHTML[outerHTML]).filter(({ type }) => type == matchedType).map(({ elements: [element] }) => element);
  }
  get provisionalElements() {
    return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
      const { type, tracked, elements } = this.detailsByOuterHTML[outerHTML];
      if (type == null && !tracked) {
        return [...result, ...elements];
      } else if (elements.length > 1) {
        return [...result, ...elements.slice(1)];
      } else {
        return result;
      }
    }, []);
  }
  getMetaValue(name) {
    const element = this.findMetaElementByName(name);
    return element ? element.getAttribute("content") : null;
  }
  findMetaElementByName(name) {
    return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
      const {
        elements: [element]
      } = this.detailsByOuterHTML[outerHTML];
      return elementIsMetaElementWithName(element, name) ? element : result;
    }, void 0 | void 0);
  }
};
function elementType(element) {
  if (elementIsScript(element)) {
    return "script";
  } else if (elementIsStylesheet(element)) {
    return "stylesheet";
  }
}
function elementIsTracked(element) {
  return element.getAttribute("data-turbo-track") == "reload";
}
function elementIsScript(element) {
  const tagName = element.localName;
  return tagName == "script";
}
function elementIsNoscript(element) {
  const tagName = element.localName;
  return tagName == "noscript";
}
function elementIsStylesheet(element) {
  const tagName = element.localName;
  return tagName == "style" || tagName == "link" && element.getAttribute("rel") == "stylesheet";
}
function elementIsMetaElementWithName(element, name) {
  const tagName = element.localName;
  return tagName == "meta" && element.getAttribute("name") == name;
}
function elementWithoutNonce(element) {
  if (element.hasAttribute("nonce")) {
    element.setAttribute("nonce", "");
  }
  return element;
}
var PageSnapshot = class _PageSnapshot extends Snapshot {
  static fromHTMLString(html = "") {
    return this.fromDocument(parseHTMLDocument(html));
  }
  static fromElement(element) {
    return this.fromDocument(element.ownerDocument);
  }
  static fromDocument({ documentElement, body, head }) {
    return new this(documentElement, body, new HeadSnapshot(head));
  }
  constructor(documentElement, body, headSnapshot) {
    super(body);
    this.documentElement = documentElement;
    this.headSnapshot = headSnapshot;
  }
  clone() {
    const clonedElement = this.element.cloneNode(true);
    const selectElements = this.element.querySelectorAll("select");
    const clonedSelectElements = clonedElement.querySelectorAll("select");
    for (const [index, source] of selectElements.entries()) {
      const clone = clonedSelectElements[index];
      for (const option of clone.selectedOptions) option.selected = false;
      for (const option of source.selectedOptions) clone.options[option.index].selected = true;
    }
    for (const clonedPasswordInput of clonedElement.querySelectorAll('input[type="password"]')) {
      clonedPasswordInput.value = "";
    }
    return new _PageSnapshot(this.documentElement, clonedElement, this.headSnapshot);
  }
  get lang() {
    return this.documentElement.getAttribute("lang");
  }
  get headElement() {
    return this.headSnapshot.element;
  }
  get rootLocation() {
    const root = this.getSetting("root") ?? "/";
    return expandURL(root);
  }
  get cacheControlValue() {
    return this.getSetting("cache-control");
  }
  get isPreviewable() {
    return this.cacheControlValue != "no-preview";
  }
  get isCacheable() {
    return this.cacheControlValue != "no-cache";
  }
  get isVisitable() {
    return this.getSetting("visit-control") != "reload";
  }
  get prefersViewTransitions() {
    const viewTransitionEnabled = this.getSetting("view-transition") === "true" || this.headSnapshot.getMetaValue("view-transition") === "same-origin";
    return viewTransitionEnabled && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  get shouldMorphPage() {
    return this.getSetting("refresh-method") === "morph";
  }
  get shouldPreserveScrollPosition() {
    return this.getSetting("refresh-scroll") === "preserve";
  }
  // Private
  getSetting(name) {
    return this.headSnapshot.getMetaValue(`turbo-${name}`);
  }
};
var ViewTransitioner = class {
  #viewTransitionStarted = false;
  #lastOperation = Promise.resolve();
  renderChange(useViewTransition, render) {
    if (useViewTransition && this.viewTransitionsAvailable && !this.#viewTransitionStarted) {
      this.#viewTransitionStarted = true;
      this.#lastOperation = this.#lastOperation.then(async () => {
        await document.startViewTransition(render).finished;
      });
    } else {
      this.#lastOperation = this.#lastOperation.then(render);
    }
    return this.#lastOperation;
  }
  get viewTransitionsAvailable() {
    return document.startViewTransition;
  }
};
var defaultOptions = {
  action: "advance",
  historyChanged: false,
  visitCachedSnapshot: () => {
  },
  willRender: true,
  updateHistory: true,
  shouldCacheSnapshot: true,
  acceptsStreamResponse: false
};
var TimingMetric = {
  visitStart: "visitStart",
  requestStart: "requestStart",
  requestEnd: "requestEnd",
  visitEnd: "visitEnd"
};
var VisitState = {
  initialized: "initialized",
  started: "started",
  canceled: "canceled",
  failed: "failed",
  completed: "completed"
};
var SystemStatusCode = {
  networkFailure: 0,
  timeoutFailure: -1,
  contentTypeMismatch: -2
};
var Direction = {
  advance: "forward",
  restore: "back",
  replace: "none"
};
var Visit = class {
  identifier = uuid();
  // Required by turbo-ios
  timingMetrics = {};
  followedRedirect = false;
  historyChanged = false;
  scrolled = false;
  shouldCacheSnapshot = true;
  acceptsStreamResponse = false;
  snapshotCached = false;
  state = VisitState.initialized;
  viewTransitioner = new ViewTransitioner();
  constructor(delegate, location2, restorationIdentifier, options = {}) {
    this.delegate = delegate;
    this.location = location2;
    this.restorationIdentifier = restorationIdentifier || uuid();
    const {
      action,
      historyChanged,
      referrer,
      snapshot,
      snapshotHTML,
      response,
      visitCachedSnapshot,
      willRender,
      updateHistory,
      shouldCacheSnapshot,
      acceptsStreamResponse,
      direction
    } = {
      ...defaultOptions,
      ...options
    };
    this.action = action;
    this.historyChanged = historyChanged;
    this.referrer = referrer;
    this.snapshot = snapshot;
    this.snapshotHTML = snapshotHTML;
    this.response = response;
    this.isSamePage = this.delegate.locationWithActionIsSamePage(this.location, this.action);
    this.isPageRefresh = this.view.isPageRefresh(this);
    this.visitCachedSnapshot = visitCachedSnapshot;
    this.willRender = willRender;
    this.updateHistory = updateHistory;
    this.scrolled = !willRender;
    this.shouldCacheSnapshot = shouldCacheSnapshot;
    this.acceptsStreamResponse = acceptsStreamResponse;
    this.direction = direction || Direction[action];
  }
  get adapter() {
    return this.delegate.adapter;
  }
  get view() {
    return this.delegate.view;
  }
  get history() {
    return this.delegate.history;
  }
  get restorationData() {
    return this.history.getRestorationDataForIdentifier(this.restorationIdentifier);
  }
  get silent() {
    return this.isSamePage;
  }
  start() {
    if (this.state == VisitState.initialized) {
      this.recordTimingMetric(TimingMetric.visitStart);
      this.state = VisitState.started;
      this.adapter.visitStarted(this);
      this.delegate.visitStarted(this);
    }
  }
  cancel() {
    if (this.state == VisitState.started) {
      if (this.request) {
        this.request.cancel();
      }
      this.cancelRender();
      this.state = VisitState.canceled;
    }
  }
  complete() {
    if (this.state == VisitState.started) {
      this.recordTimingMetric(TimingMetric.visitEnd);
      this.adapter.visitCompleted(this);
      this.state = VisitState.completed;
      this.followRedirect();
      if (!this.followedRedirect) {
        this.delegate.visitCompleted(this);
      }
    }
  }
  fail() {
    if (this.state == VisitState.started) {
      this.state = VisitState.failed;
      this.adapter.visitFailed(this);
      this.delegate.visitCompleted(this);
    }
  }
  changeHistory() {
    if (!this.historyChanged && this.updateHistory) {
      const actionForHistory = this.location.href === this.referrer?.href ? "replace" : this.action;
      const method = getHistoryMethodForAction(actionForHistory);
      this.history.update(method, this.location, this.restorationIdentifier);
      this.historyChanged = true;
    }
  }
  issueRequest() {
    if (this.hasPreloadedResponse()) {
      this.simulateRequest();
    } else if (this.shouldIssueRequest() && !this.request) {
      this.request = new FetchRequest(this, FetchMethod.get, this.location);
      this.request.perform();
    }
  }
  simulateRequest() {
    if (this.response) {
      this.startRequest();
      this.recordResponse();
      this.finishRequest();
    }
  }
  startRequest() {
    this.recordTimingMetric(TimingMetric.requestStart);
    this.adapter.visitRequestStarted(this);
  }
  recordResponse(response = this.response) {
    this.response = response;
    if (response) {
      const { statusCode } = response;
      if (isSuccessful(statusCode)) {
        this.adapter.visitRequestCompleted(this);
      } else {
        this.adapter.visitRequestFailedWithStatusCode(this, statusCode);
      }
    }
  }
  finishRequest() {
    this.recordTimingMetric(TimingMetric.requestEnd);
    this.adapter.visitRequestFinished(this);
  }
  loadResponse() {
    if (this.response) {
      const { statusCode, responseHTML } = this.response;
      this.render(async () => {
        if (this.shouldCacheSnapshot) this.cacheSnapshot();
        if (this.view.renderPromise) await this.view.renderPromise;
        if (isSuccessful(statusCode) && responseHTML != null) {
          const snapshot = PageSnapshot.fromHTMLString(responseHTML);
          await this.renderPageSnapshot(snapshot, false);
          this.adapter.visitRendered(this);
          this.complete();
        } else {
          await this.view.renderError(PageSnapshot.fromHTMLString(responseHTML), this);
          this.adapter.visitRendered(this);
          this.fail();
        }
      });
    }
  }
  getCachedSnapshot() {
    const snapshot = this.view.getCachedSnapshotForLocation(this.location) || this.getPreloadedSnapshot();
    if (snapshot && (!getAnchor(this.location) || snapshot.hasAnchor(getAnchor(this.location)))) {
      if (this.action == "restore" || snapshot.isPreviewable) {
        return snapshot;
      }
    }
  }
  getPreloadedSnapshot() {
    if (this.snapshotHTML) {
      return PageSnapshot.fromHTMLString(this.snapshotHTML);
    }
  }
  hasCachedSnapshot() {
    return this.getCachedSnapshot() != null;
  }
  loadCachedSnapshot() {
    const snapshot = this.getCachedSnapshot();
    if (snapshot) {
      const isPreview = this.shouldIssueRequest();
      this.render(async () => {
        this.cacheSnapshot();
        if (this.isSamePage || this.isPageRefresh) {
          this.adapter.visitRendered(this);
        } else {
          if (this.view.renderPromise) await this.view.renderPromise;
          await this.renderPageSnapshot(snapshot, isPreview);
          this.adapter.visitRendered(this);
          if (!isPreview) {
            this.complete();
          }
        }
      });
    }
  }
  followRedirect() {
    if (this.redirectedToLocation && !this.followedRedirect && this.response?.redirected) {
      this.adapter.visitProposedToLocation(this.redirectedToLocation, {
        action: "replace",
        response: this.response,
        shouldCacheSnapshot: false,
        willRender: false
      });
      this.followedRedirect = true;
    }
  }
  goToSamePageAnchor() {
    if (this.isSamePage) {
      this.render(async () => {
        this.cacheSnapshot();
        this.performScroll();
        this.changeHistory();
        this.adapter.visitRendered(this);
      });
    }
  }
  // Fetch request delegate
  prepareRequest(request) {
    if (this.acceptsStreamResponse) {
      request.acceptResponseType(StreamMessage.contentType);
    }
  }
  requestStarted() {
    this.startRequest();
  }
  requestPreventedHandlingResponse(_request, _response) {
  }
  async requestSucceededWithResponse(request, response) {
    const responseHTML = await response.responseHTML;
    const { redirected, statusCode } = response;
    if (responseHTML == void 0) {
      this.recordResponse({
        statusCode: SystemStatusCode.contentTypeMismatch,
        redirected
      });
    } else {
      this.redirectedToLocation = response.redirected ? response.location : void 0;
      this.recordResponse({ statusCode, responseHTML, redirected });
    }
  }
  async requestFailedWithResponse(request, response) {
    const responseHTML = await response.responseHTML;
    const { redirected, statusCode } = response;
    if (responseHTML == void 0) {
      this.recordResponse({
        statusCode: SystemStatusCode.contentTypeMismatch,
        redirected
      });
    } else {
      this.recordResponse({ statusCode, responseHTML, redirected });
    }
  }
  requestErrored(_request, _error) {
    this.recordResponse({
      statusCode: SystemStatusCode.networkFailure,
      redirected: false
    });
  }
  requestFinished() {
    this.finishRequest();
  }
  // Scrolling
  performScroll() {
    if (!this.scrolled && !this.view.forceReloaded && !this.view.shouldPreserveScrollPosition(this)) {
      if (this.action == "restore") {
        this.scrollToRestoredPosition() || this.scrollToAnchor() || this.view.scrollToTop();
      } else {
        this.scrollToAnchor() || this.view.scrollToTop();
      }
      if (this.isSamePage) {
        this.delegate.visitScrolledToSamePageLocation(this.view.lastRenderedLocation, this.location);
      }
      this.scrolled = true;
    }
  }
  scrollToRestoredPosition() {
    const { scrollPosition } = this.restorationData;
    if (scrollPosition) {
      this.view.scrollToPosition(scrollPosition);
      return true;
    }
  }
  scrollToAnchor() {
    const anchor = getAnchor(this.location);
    if (anchor != null) {
      this.view.scrollToAnchor(anchor);
      return true;
    }
  }
  // Instrumentation
  recordTimingMetric(metric) {
    this.timingMetrics[metric] = (/* @__PURE__ */ new Date()).getTime();
  }
  getTimingMetrics() {
    return { ...this.timingMetrics };
  }
  // Private
  hasPreloadedResponse() {
    return typeof this.response == "object";
  }
  shouldIssueRequest() {
    if (this.isSamePage) {
      return false;
    } else if (this.action == "restore") {
      return !this.hasCachedSnapshot();
    } else {
      return this.willRender;
    }
  }
  cacheSnapshot() {
    if (!this.snapshotCached) {
      this.view.cacheSnapshot(this.snapshot).then((snapshot) => snapshot && this.visitCachedSnapshot(snapshot));
      this.snapshotCached = true;
    }
  }
  async render(callback) {
    this.cancelRender();
    await new Promise((resolve) => {
      this.frame = document.visibilityState === "hidden" ? setTimeout(() => resolve(), 0) : requestAnimationFrame(() => resolve());
    });
    await callback();
    delete this.frame;
  }
  async renderPageSnapshot(snapshot, isPreview) {
    await this.viewTransitioner.renderChange(this.view.shouldTransitionTo(snapshot), async () => {
      await this.view.renderPage(snapshot, isPreview, this.willRender, this);
      this.performScroll();
    });
  }
  cancelRender() {
    if (this.frame) {
      cancelAnimationFrame(this.frame);
      delete this.frame;
    }
  }
};
function isSuccessful(statusCode) {
  return statusCode >= 200 && statusCode < 300;
}
var BrowserAdapter = class {
  progressBar = new ProgressBar();
  constructor(session2) {
    this.session = session2;
  }
  visitProposedToLocation(location2, options) {
    if (locationIsVisitable(location2, this.navigator.rootLocation)) {
      this.navigator.startVisit(location2, options?.restorationIdentifier || uuid(), options);
    } else {
      window.location.href = location2.toString();
    }
  }
  visitStarted(visit2) {
    this.location = visit2.location;
    this.redirectedToLocation = null;
    visit2.loadCachedSnapshot();
    visit2.issueRequest();
    visit2.goToSamePageAnchor();
  }
  visitRequestStarted(visit2) {
    this.progressBar.setValue(0);
    if (visit2.hasCachedSnapshot() || visit2.action != "restore") {
      this.showVisitProgressBarAfterDelay();
    } else {
      this.showProgressBar();
    }
  }
  visitRequestCompleted(visit2) {
    visit2.loadResponse();
    if (visit2.response.redirected) {
      this.redirectedToLocation = visit2.redirectedToLocation;
    }
  }
  visitRequestFailedWithStatusCode(visit2, statusCode) {
    switch (statusCode) {
      case SystemStatusCode.networkFailure:
      case SystemStatusCode.timeoutFailure:
      case SystemStatusCode.contentTypeMismatch:
        return this.reload({
          reason: "request_failed",
          context: {
            statusCode
          }
        });
      default:
        return visit2.loadResponse();
    }
  }
  visitRequestFinished(_visit) {
  }
  visitCompleted(_visit) {
    this.progressBar.setValue(1);
    this.hideVisitProgressBar();
  }
  pageInvalidated(reason) {
    this.reload(reason);
  }
  visitFailed(_visit) {
    this.progressBar.setValue(1);
    this.hideVisitProgressBar();
  }
  visitRendered(_visit) {
  }
  // Link prefetching
  linkPrefetchingIsEnabledForLocation(location2) {
    return true;
  }
  // Form Submission Delegate
  formSubmissionStarted(_formSubmission) {
    this.progressBar.setValue(0);
    this.showFormProgressBarAfterDelay();
  }
  formSubmissionFinished(_formSubmission) {
    this.progressBar.setValue(1);
    this.hideFormProgressBar();
  }
  // Private
  showVisitProgressBarAfterDelay() {
    this.visitProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
  }
  hideVisitProgressBar() {
    this.progressBar.hide();
    if (this.visitProgressBarTimeout != null) {
      window.clearTimeout(this.visitProgressBarTimeout);
      delete this.visitProgressBarTimeout;
    }
  }
  showFormProgressBarAfterDelay() {
    if (this.formProgressBarTimeout == null) {
      this.formProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
    }
  }
  hideFormProgressBar() {
    this.progressBar.hide();
    if (this.formProgressBarTimeout != null) {
      window.clearTimeout(this.formProgressBarTimeout);
      delete this.formProgressBarTimeout;
    }
  }
  showProgressBar = () => {
    this.progressBar.show();
  };
  reload(reason) {
    dispatch("turbo:reload", { detail: reason });
    window.location.href = (this.redirectedToLocation || this.location)?.toString() || window.location.href;
  }
  get navigator() {
    return this.session.navigator;
  }
};
var CacheObserver = class {
  selector = "[data-turbo-temporary]";
  deprecatedSelector = "[data-turbo-cache=false]";
  started = false;
  start() {
    if (!this.started) {
      this.started = true;
      addEventListener("turbo:before-cache", this.removeTemporaryElements, false);
    }
  }
  stop() {
    if (this.started) {
      this.started = false;
      removeEventListener("turbo:before-cache", this.removeTemporaryElements, false);
    }
  }
  removeTemporaryElements = (_event) => {
    for (const element of this.temporaryElements) {
      element.remove();
    }
  };
  get temporaryElements() {
    return [...document.querySelectorAll(this.selector), ...this.temporaryElementsWithDeprecation];
  }
  get temporaryElementsWithDeprecation() {
    const elements = document.querySelectorAll(this.deprecatedSelector);
    if (elements.length) {
      console.warn(
        `The ${this.deprecatedSelector} selector is deprecated and will be removed in a future version. Use ${this.selector} instead.`
      );
    }
    return [...elements];
  }
};
var FrameRedirector = class {
  constructor(session2, element) {
    this.session = session2;
    this.element = element;
    this.linkInterceptor = new LinkInterceptor(this, element);
    this.formSubmitObserver = new FormSubmitObserver(this, element);
  }
  start() {
    this.linkInterceptor.start();
    this.formSubmitObserver.start();
  }
  stop() {
    this.linkInterceptor.stop();
    this.formSubmitObserver.stop();
  }
  // Link interceptor delegate
  shouldInterceptLinkClick(element, _location, _event) {
    return this.#shouldRedirect(element);
  }
  linkClickIntercepted(element, url, event) {
    const frame = this.#findFrameElement(element);
    if (frame) {
      frame.delegate.linkClickIntercepted(element, url, event);
    }
  }
  // Form submit observer delegate
  willSubmitForm(element, submitter2) {
    return element.closest("turbo-frame") == null && this.#shouldSubmit(element, submitter2) && this.#shouldRedirect(element, submitter2);
  }
  formSubmitted(element, submitter2) {
    const frame = this.#findFrameElement(element, submitter2);
    if (frame) {
      frame.delegate.formSubmitted(element, submitter2);
    }
  }
  #shouldSubmit(form, submitter2) {
    const action = getAction$1(form, submitter2);
    const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
    const rootLocation = expandURL(meta?.content ?? "/");
    return this.#shouldRedirect(form, submitter2) && locationIsVisitable(action, rootLocation);
  }
  #shouldRedirect(element, submitter2) {
    const isNavigatable = element instanceof HTMLFormElement ? this.session.submissionIsNavigatable(element, submitter2) : this.session.elementIsNavigatable(element);
    if (isNavigatable) {
      const frame = this.#findFrameElement(element, submitter2);
      return frame ? frame != element.closest("turbo-frame") : false;
    } else {
      return false;
    }
  }
  #findFrameElement(element, submitter2) {
    const id = submitter2?.getAttribute("data-turbo-frame") || element.getAttribute("data-turbo-frame");
    if (id && id != "_top") {
      const frame = this.element.querySelector(`#${id}:not([disabled])`);
      if (frame instanceof FrameElement) {
        return frame;
      }
    }
  }
};
var History = class {
  location;
  restorationIdentifier = uuid();
  restorationData = {};
  started = false;
  pageLoaded = false;
  currentIndex = 0;
  constructor(delegate) {
    this.delegate = delegate;
  }
  start() {
    if (!this.started) {
      addEventListener("popstate", this.onPopState, false);
      addEventListener("load", this.onPageLoad, false);
      this.currentIndex = history.state?.turbo?.restorationIndex || 0;
      this.started = true;
      this.replace(new URL(window.location.href));
    }
  }
  stop() {
    if (this.started) {
      removeEventListener("popstate", this.onPopState, false);
      removeEventListener("load", this.onPageLoad, false);
      this.started = false;
    }
  }
  push(location2, restorationIdentifier) {
    this.update(history.pushState, location2, restorationIdentifier);
  }
  replace(location2, restorationIdentifier) {
    this.update(history.replaceState, location2, restorationIdentifier);
  }
  update(method, location2, restorationIdentifier = uuid()) {
    if (method === history.pushState) ++this.currentIndex;
    const state = { turbo: { restorationIdentifier, restorationIndex: this.currentIndex } };
    method.call(history, state, "", location2.href);
    this.location = location2;
    this.restorationIdentifier = restorationIdentifier;
  }
  // Restoration data
  getRestorationDataForIdentifier(restorationIdentifier) {
    return this.restorationData[restorationIdentifier] || {};
  }
  updateRestorationData(additionalData) {
    const { restorationIdentifier } = this;
    const restorationData = this.restorationData[restorationIdentifier];
    this.restorationData[restorationIdentifier] = {
      ...restorationData,
      ...additionalData
    };
  }
  // Scroll restoration
  assumeControlOfScrollRestoration() {
    if (!this.previousScrollRestoration) {
      this.previousScrollRestoration = history.scrollRestoration ?? "auto";
      history.scrollRestoration = "manual";
    }
  }
  relinquishControlOfScrollRestoration() {
    if (this.previousScrollRestoration) {
      history.scrollRestoration = this.previousScrollRestoration;
      delete this.previousScrollRestoration;
    }
  }
  // Event handlers
  onPopState = (event) => {
    if (this.shouldHandlePopState()) {
      const { turbo } = event.state || {};
      if (turbo) {
        this.location = new URL(window.location.href);
        const { restorationIdentifier, restorationIndex } = turbo;
        this.restorationIdentifier = restorationIdentifier;
        const direction = restorationIndex > this.currentIndex ? "forward" : "back";
        this.delegate.historyPoppedToLocationWithRestorationIdentifierAndDirection(this.location, restorationIdentifier, direction);
        this.currentIndex = restorationIndex;
      }
    }
  };
  onPageLoad = async (_event) => {
    await nextMicrotask();
    this.pageLoaded = true;
  };
  // Private
  shouldHandlePopState() {
    return this.pageIsLoaded();
  }
  pageIsLoaded() {
    return this.pageLoaded || document.readyState == "complete";
  }
};
var LinkPrefetchObserver = class {
  started = false;
  #prefetchedLink = null;
  constructor(delegate, eventTarget) {
    this.delegate = delegate;
    this.eventTarget = eventTarget;
  }
  start() {
    if (this.started) return;
    if (this.eventTarget.readyState === "loading") {
      this.eventTarget.addEventListener("DOMContentLoaded", this.#enable, { once: true });
    } else {
      this.#enable();
    }
  }
  stop() {
    if (!this.started) return;
    this.eventTarget.removeEventListener("mouseenter", this.#tryToPrefetchRequest, {
      capture: true,
      passive: true
    });
    this.eventTarget.removeEventListener("mouseleave", this.#cancelRequestIfObsolete, {
      capture: true,
      passive: true
    });
    this.eventTarget.removeEventListener("turbo:before-fetch-request", this.#tryToUsePrefetchedRequest, true);
    this.started = false;
  }
  #enable = () => {
    this.eventTarget.addEventListener("mouseenter", this.#tryToPrefetchRequest, {
      capture: true,
      passive: true
    });
    this.eventTarget.addEventListener("mouseleave", this.#cancelRequestIfObsolete, {
      capture: true,
      passive: true
    });
    this.eventTarget.addEventListener("turbo:before-fetch-request", this.#tryToUsePrefetchedRequest, true);
    this.started = true;
  };
  #tryToPrefetchRequest = (event) => {
    if (getMetaContent("turbo-prefetch") === "false") return;
    const target = event.target;
    const isLink = target.matches && target.matches("a[href]:not([target^=_]):not([download])");
    if (isLink && this.#isPrefetchable(target)) {
      const link = target;
      const location2 = getLocationForLink(link);
      if (this.delegate.canPrefetchRequestToLocation(link, location2)) {
        this.#prefetchedLink = link;
        const fetchRequest = new FetchRequest(
          this,
          FetchMethod.get,
          location2,
          new URLSearchParams(),
          target
        );
        fetchRequest.fetchOptions.priority = "low";
        prefetchCache.setLater(location2.toString(), fetchRequest, this.#cacheTtl);
      }
    }
  };
  #cancelRequestIfObsolete = (event) => {
    if (event.target === this.#prefetchedLink) this.#cancelPrefetchRequest();
  };
  #cancelPrefetchRequest = () => {
    prefetchCache.clear();
    this.#prefetchedLink = null;
  };
  #tryToUsePrefetchedRequest = (event) => {
    if (event.target.tagName !== "FORM" && event.detail.fetchOptions.method === "GET") {
      const cached = prefetchCache.get(event.detail.url.toString());
      if (cached) {
        event.detail.fetchRequest = cached;
      }
      prefetchCache.clear();
    }
  };
  prepareRequest(request) {
    const link = request.target;
    request.headers["X-Sec-Purpose"] = "prefetch";
    const turboFrame = link.closest("turbo-frame");
    const turboFrameTarget = link.getAttribute("data-turbo-frame") || turboFrame?.getAttribute("target") || turboFrame?.id;
    if (turboFrameTarget && turboFrameTarget !== "_top") {
      request.headers["Turbo-Frame"] = turboFrameTarget;
    }
  }
  // Fetch request interface
  requestSucceededWithResponse() {
  }
  requestStarted(fetchRequest) {
  }
  requestErrored(fetchRequest) {
  }
  requestFinished(fetchRequest) {
  }
  requestPreventedHandlingResponse(fetchRequest, fetchResponse) {
  }
  requestFailedWithResponse(fetchRequest, fetchResponse) {
  }
  get #cacheTtl() {
    return Number(getMetaContent("turbo-prefetch-cache-time")) || cacheTtl;
  }
  #isPrefetchable(link) {
    const href = link.getAttribute("href");
    if (!href) return false;
    if (unfetchableLink(link)) return false;
    if (linkToTheSamePage(link)) return false;
    if (linkOptsOut(link)) return false;
    if (nonSafeLink(link)) return false;
    if (eventPrevented(link)) return false;
    return true;
  }
};
var unfetchableLink = (link) => {
  return link.origin !== document.location.origin || !["http:", "https:"].includes(link.protocol) || link.hasAttribute("target");
};
var linkToTheSamePage = (link) => {
  return link.pathname + link.search === document.location.pathname + document.location.search || link.href.startsWith("#");
};
var linkOptsOut = (link) => {
  if (link.getAttribute("data-turbo-prefetch") === "false") return true;
  if (link.getAttribute("data-turbo") === "false") return true;
  const turboPrefetchParent = findClosestRecursively(link, "[data-turbo-prefetch]");
  if (turboPrefetchParent && turboPrefetchParent.getAttribute("data-turbo-prefetch") === "false") return true;
  return false;
};
var nonSafeLink = (link) => {
  const turboMethod = link.getAttribute("data-turbo-method");
  if (turboMethod && turboMethod.toLowerCase() !== "get") return true;
  if (isUJS(link)) return true;
  if (link.hasAttribute("data-turbo-confirm")) return true;
  if (link.hasAttribute("data-turbo-stream")) return true;
  return false;
};
var isUJS = (link) => {
  return link.hasAttribute("data-remote") || link.hasAttribute("data-behavior") || link.hasAttribute("data-confirm") || link.hasAttribute("data-method");
};
var eventPrevented = (link) => {
  const event = dispatch("turbo:before-prefetch", { target: link, cancelable: true });
  return event.defaultPrevented;
};
var Navigator = class {
  constructor(delegate) {
    this.delegate = delegate;
  }
  proposeVisit(location2, options = {}) {
    if (this.delegate.allowsVisitingLocationWithAction(location2, options.action)) {
      this.delegate.visitProposedToLocation(location2, options);
    }
  }
  startVisit(locatable, restorationIdentifier, options = {}) {
    this.stop();
    this.currentVisit = new Visit(this, expandURL(locatable), restorationIdentifier, {
      referrer: this.location,
      ...options
    });
    this.currentVisit.start();
  }
  submitForm(form, submitter2) {
    this.stop();
    this.formSubmission = new FormSubmission(this, form, submitter2, true);
    this.formSubmission.start();
  }
  stop() {
    if (this.formSubmission) {
      this.formSubmission.stop();
      delete this.formSubmission;
    }
    if (this.currentVisit) {
      this.currentVisit.cancel();
      delete this.currentVisit;
    }
  }
  get adapter() {
    return this.delegate.adapter;
  }
  get view() {
    return this.delegate.view;
  }
  get rootLocation() {
    return this.view.snapshot.rootLocation;
  }
  get history() {
    return this.delegate.history;
  }
  // Form submission delegate
  formSubmissionStarted(formSubmission) {
    if (typeof this.adapter.formSubmissionStarted === "function") {
      this.adapter.formSubmissionStarted(formSubmission);
    }
  }
  async formSubmissionSucceededWithResponse(formSubmission, fetchResponse) {
    if (formSubmission == this.formSubmission) {
      const responseHTML = await fetchResponse.responseHTML;
      if (responseHTML) {
        const shouldCacheSnapshot = formSubmission.isSafe;
        if (!shouldCacheSnapshot) {
          this.view.clearSnapshotCache();
        }
        const { statusCode, redirected } = fetchResponse;
        const action = this.#getActionForFormSubmission(formSubmission, fetchResponse);
        const visitOptions = {
          action,
          shouldCacheSnapshot,
          response: { statusCode, responseHTML, redirected }
        };
        this.proposeVisit(fetchResponse.location, visitOptions);
      }
    }
  }
  async formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
    const responseHTML = await fetchResponse.responseHTML;
    if (responseHTML) {
      const snapshot = PageSnapshot.fromHTMLString(responseHTML);
      if (fetchResponse.serverError) {
        await this.view.renderError(snapshot, this.currentVisit);
      } else {
        await this.view.renderPage(snapshot, false, true, this.currentVisit);
      }
      if (!snapshot.shouldPreserveScrollPosition) {
        this.view.scrollToTop();
      }
      this.view.clearSnapshotCache();
    }
  }
  formSubmissionErrored(formSubmission, error2) {
    console.error(error2);
  }
  formSubmissionFinished(formSubmission) {
    if (typeof this.adapter.formSubmissionFinished === "function") {
      this.adapter.formSubmissionFinished(formSubmission);
    }
  }
  // Link prefetching
  linkPrefetchingIsEnabledForLocation(location2) {
    if (typeof this.adapter.linkPrefetchingIsEnabledForLocation === "function") {
      return this.adapter.linkPrefetchingIsEnabledForLocation(location2);
    }
    return true;
  }
  // Visit delegate
  visitStarted(visit2) {
    this.delegate.visitStarted(visit2);
  }
  visitCompleted(visit2) {
    this.delegate.visitCompleted(visit2);
    delete this.currentVisit;
  }
  locationWithActionIsSamePage(location2, action) {
    const anchor = getAnchor(location2);
    const currentAnchor = getAnchor(this.view.lastRenderedLocation);
    const isRestorationToTop = action === "restore" && typeof anchor === "undefined";
    return action !== "replace" && getRequestURL(location2) === getRequestURL(this.view.lastRenderedLocation) && (isRestorationToTop || anchor != null && anchor !== currentAnchor);
  }
  visitScrolledToSamePageLocation(oldURL, newURL) {
    this.delegate.visitScrolledToSamePageLocation(oldURL, newURL);
  }
  // Visits
  get location() {
    return this.history.location;
  }
  get restorationIdentifier() {
    return this.history.restorationIdentifier;
  }
  #getActionForFormSubmission(formSubmission, fetchResponse) {
    const { submitter: submitter2, formElement } = formSubmission;
    return getVisitAction(submitter2, formElement) || this.#getDefaultAction(fetchResponse);
  }
  #getDefaultAction(fetchResponse) {
    const sameLocationRedirect = fetchResponse.redirected && fetchResponse.location.href === this.location?.href;
    return sameLocationRedirect ? "replace" : "advance";
  }
};
var PageStage = {
  initial: 0,
  loading: 1,
  interactive: 2,
  complete: 3
};
var PageObserver = class {
  stage = PageStage.initial;
  started = false;
  constructor(delegate) {
    this.delegate = delegate;
  }
  start() {
    if (!this.started) {
      if (this.stage == PageStage.initial) {
        this.stage = PageStage.loading;
      }
      document.addEventListener("readystatechange", this.interpretReadyState, false);
      addEventListener("pagehide", this.pageWillUnload, false);
      this.started = true;
    }
  }
  stop() {
    if (this.started) {
      document.removeEventListener("readystatechange", this.interpretReadyState, false);
      removeEventListener("pagehide", this.pageWillUnload, false);
      this.started = false;
    }
  }
  interpretReadyState = () => {
    const { readyState } = this;
    if (readyState == "interactive") {
      this.pageIsInteractive();
    } else if (readyState == "complete") {
      this.pageIsComplete();
    }
  };
  pageIsInteractive() {
    if (this.stage == PageStage.loading) {
      this.stage = PageStage.interactive;
      this.delegate.pageBecameInteractive();
    }
  }
  pageIsComplete() {
    this.pageIsInteractive();
    if (this.stage == PageStage.interactive) {
      this.stage = PageStage.complete;
      this.delegate.pageLoaded();
    }
  }
  pageWillUnload = () => {
    this.delegate.pageWillUnload();
  };
  get readyState() {
    return document.readyState;
  }
};
var ScrollObserver = class {
  started = false;
  constructor(delegate) {
    this.delegate = delegate;
  }
  start() {
    if (!this.started) {
      addEventListener("scroll", this.onScroll, false);
      this.onScroll();
      this.started = true;
    }
  }
  stop() {
    if (this.started) {
      removeEventListener("scroll", this.onScroll, false);
      this.started = false;
    }
  }
  onScroll = () => {
    this.updatePosition({ x: window.pageXOffset, y: window.pageYOffset });
  };
  // Private
  updatePosition(position) {
    this.delegate.scrollPositionChanged(position);
  }
};
var StreamMessageRenderer = class {
  render({ fragment }) {
    Bardo.preservingPermanentElements(this, getPermanentElementMapForFragment(fragment), () => {
      withAutofocusFromFragment(fragment, () => {
        withPreservedFocus(() => {
          document.documentElement.appendChild(fragment);
        });
      });
    });
  }
  // Bardo delegate
  enteringBardo(currentPermanentElement, newPermanentElement) {
    newPermanentElement.replaceWith(currentPermanentElement.cloneNode(true));
  }
  leavingBardo() {
  }
};
function getPermanentElementMapForFragment(fragment) {
  const permanentElementsInDocument = queryPermanentElementsAll(document.documentElement);
  const permanentElementMap = {};
  for (const permanentElementInDocument of permanentElementsInDocument) {
    const { id } = permanentElementInDocument;
    for (const streamElement of fragment.querySelectorAll("turbo-stream")) {
      const elementInStream = getPermanentElementById(streamElement.templateElement.content, id);
      if (elementInStream) {
        permanentElementMap[id] = [permanentElementInDocument, elementInStream];
      }
    }
  }
  return permanentElementMap;
}
async function withAutofocusFromFragment(fragment, callback) {
  const generatedID = `turbo-stream-autofocus-${uuid()}`;
  const turboStreams = fragment.querySelectorAll("turbo-stream");
  const elementWithAutofocus = firstAutofocusableElementInStreams(turboStreams);
  let willAutofocusId = null;
  if (elementWithAutofocus) {
    if (elementWithAutofocus.id) {
      willAutofocusId = elementWithAutofocus.id;
    } else {
      willAutofocusId = generatedID;
    }
    elementWithAutofocus.id = willAutofocusId;
  }
  callback();
  await nextRepaint();
  const hasNoActiveElement = document.activeElement == null || document.activeElement == document.body;
  if (hasNoActiveElement && willAutofocusId) {
    const elementToAutofocus = document.getElementById(willAutofocusId);
    if (elementIsFocusable(elementToAutofocus)) {
      elementToAutofocus.focus();
    }
    if (elementToAutofocus && elementToAutofocus.id == generatedID) {
      elementToAutofocus.removeAttribute("id");
    }
  }
}
async function withPreservedFocus(callback) {
  const [activeElementBeforeRender, activeElementAfterRender] = await around(callback, () => document.activeElement);
  const restoreFocusTo = activeElementBeforeRender && activeElementBeforeRender.id;
  if (restoreFocusTo) {
    const elementToFocus = document.getElementById(restoreFocusTo);
    if (elementIsFocusable(elementToFocus) && elementToFocus != activeElementAfterRender) {
      elementToFocus.focus();
    }
  }
}
function firstAutofocusableElementInStreams(nodeListOfStreamElements) {
  for (const streamElement of nodeListOfStreamElements) {
    const elementWithAutofocus = queryAutofocusableElement(streamElement.templateElement.content);
    if (elementWithAutofocus) return elementWithAutofocus;
  }
  return null;
}
var StreamObserver = class {
  sources = /* @__PURE__ */ new Set();
  #started = false;
  constructor(delegate) {
    this.delegate = delegate;
  }
  start() {
    if (!this.#started) {
      this.#started = true;
      addEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
    }
  }
  stop() {
    if (this.#started) {
      this.#started = false;
      removeEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
    }
  }
  connectStreamSource(source) {
    if (!this.streamSourceIsConnected(source)) {
      this.sources.add(source);
      source.addEventListener("message", this.receiveMessageEvent, false);
    }
  }
  disconnectStreamSource(source) {
    if (this.streamSourceIsConnected(source)) {
      this.sources.delete(source);
      source.removeEventListener("message", this.receiveMessageEvent, false);
    }
  }
  streamSourceIsConnected(source) {
    return this.sources.has(source);
  }
  inspectFetchResponse = (event) => {
    const response = fetchResponseFromEvent(event);
    if (response && fetchResponseIsStream(response)) {
      event.preventDefault();
      this.receiveMessageResponse(response);
    }
  };
  receiveMessageEvent = (event) => {
    if (this.#started && typeof event.data == "string") {
      this.receiveMessageHTML(event.data);
    }
  };
  async receiveMessageResponse(response) {
    const html = await response.responseHTML;
    if (html) {
      this.receiveMessageHTML(html);
    }
  }
  receiveMessageHTML(html) {
    this.delegate.receivedMessageFromStream(StreamMessage.wrap(html));
  }
};
function fetchResponseFromEvent(event) {
  const fetchResponse = event.detail?.fetchResponse;
  if (fetchResponse instanceof FetchResponse) {
    return fetchResponse;
  }
}
function fetchResponseIsStream(response) {
  const contentType = response.contentType ?? "";
  return contentType.startsWith(StreamMessage.contentType);
}
var ErrorRenderer = class extends Renderer {
  static renderElement(currentElement, newElement) {
    const { documentElement, body } = document;
    documentElement.replaceChild(newElement, body);
  }
  async render() {
    this.replaceHeadAndBody();
    this.activateScriptElements();
  }
  replaceHeadAndBody() {
    const { documentElement, head } = document;
    documentElement.replaceChild(this.newHead, head);
    this.renderElement(this.currentElement, this.newElement);
  }
  activateScriptElements() {
    for (const replaceableElement of this.scriptElements) {
      const parentNode = replaceableElement.parentNode;
      if (parentNode) {
        const element = activateScriptElement(replaceableElement);
        parentNode.replaceChild(element, replaceableElement);
      }
    }
  }
  get newHead() {
    return this.newSnapshot.headSnapshot.element;
  }
  get scriptElements() {
    return document.documentElement.querySelectorAll("script");
  }
};
var PageRenderer = class extends Renderer {
  static renderElement(currentElement, newElement) {
    if (document.body && newElement instanceof HTMLBodyElement) {
      document.body.replaceWith(newElement);
    } else {
      document.documentElement.appendChild(newElement);
    }
  }
  get shouldRender() {
    return this.newSnapshot.isVisitable && this.trackedElementsAreIdentical;
  }
  get reloadReason() {
    if (!this.newSnapshot.isVisitable) {
      return {
        reason: "turbo_visit_control_is_reload"
      };
    }
    if (!this.trackedElementsAreIdentical) {
      return {
        reason: "tracked_element_mismatch"
      };
    }
  }
  async prepareToRender() {
    this.#setLanguage();
    await this.mergeHead();
  }
  async render() {
    if (this.willRender) {
      await this.replaceBody();
    }
  }
  finishRendering() {
    super.finishRendering();
    if (!this.isPreview) {
      this.focusFirstAutofocusableElement();
    }
  }
  get currentHeadSnapshot() {
    return this.currentSnapshot.headSnapshot;
  }
  get newHeadSnapshot() {
    return this.newSnapshot.headSnapshot;
  }
  get newElement() {
    return this.newSnapshot.element;
  }
  #setLanguage() {
    const { documentElement } = this.currentSnapshot;
    const { lang } = this.newSnapshot;
    if (lang) {
      documentElement.setAttribute("lang", lang);
    } else {
      documentElement.removeAttribute("lang");
    }
  }
  async mergeHead() {
    const mergedHeadElements = this.mergeProvisionalElements();
    const newStylesheetElements = this.copyNewHeadStylesheetElements();
    this.copyNewHeadScriptElements();
    await mergedHeadElements;
    await newStylesheetElements;
    if (this.willRender) {
      this.removeUnusedDynamicStylesheetElements();
    }
  }
  async replaceBody() {
    await this.preservingPermanentElements(async () => {
      this.activateNewBody();
      await this.assignNewBody();
    });
  }
  get trackedElementsAreIdentical() {
    return this.currentHeadSnapshot.trackedElementSignature == this.newHeadSnapshot.trackedElementSignature;
  }
  async copyNewHeadStylesheetElements() {
    const loadingElements = [];
    for (const element of this.newHeadStylesheetElements) {
      loadingElements.push(waitForLoad(element));
      document.head.appendChild(element);
    }
    await Promise.all(loadingElements);
  }
  copyNewHeadScriptElements() {
    for (const element of this.newHeadScriptElements) {
      document.head.appendChild(activateScriptElement(element));
    }
  }
  removeUnusedDynamicStylesheetElements() {
    for (const element of this.unusedDynamicStylesheetElements) {
      document.head.removeChild(element);
    }
  }
  async mergeProvisionalElements() {
    const newHeadElements = [...this.newHeadProvisionalElements];
    for (const element of this.currentHeadProvisionalElements) {
      if (!this.isCurrentElementInElementList(element, newHeadElements)) {
        document.head.removeChild(element);
      }
    }
    for (const element of newHeadElements) {
      document.head.appendChild(element);
    }
  }
  isCurrentElementInElementList(element, elementList) {
    for (const [index, newElement] of elementList.entries()) {
      if (element.tagName == "TITLE") {
        if (newElement.tagName != "TITLE") {
          continue;
        }
        if (element.innerHTML == newElement.innerHTML) {
          elementList.splice(index, 1);
          return true;
        }
      }
      if (newElement.isEqualNode(element)) {
        elementList.splice(index, 1);
        return true;
      }
    }
    return false;
  }
  removeCurrentHeadProvisionalElements() {
    for (const element of this.currentHeadProvisionalElements) {
      document.head.removeChild(element);
    }
  }
  copyNewHeadProvisionalElements() {
    for (const element of this.newHeadProvisionalElements) {
      document.head.appendChild(element);
    }
  }
  activateNewBody() {
    document.adoptNode(this.newElement);
    this.activateNewBodyScriptElements();
  }
  activateNewBodyScriptElements() {
    for (const inertScriptElement of this.newBodyScriptElements) {
      const activatedScriptElement = activateScriptElement(inertScriptElement);
      inertScriptElement.replaceWith(activatedScriptElement);
    }
  }
  async assignNewBody() {
    await this.renderElement(this.currentElement, this.newElement);
  }
  get unusedDynamicStylesheetElements() {
    return this.oldHeadStylesheetElements.filter((element) => {
      return element.getAttribute("data-turbo-track") === "dynamic";
    });
  }
  get oldHeadStylesheetElements() {
    return this.currentHeadSnapshot.getStylesheetElementsNotInSnapshot(this.newHeadSnapshot);
  }
  get newHeadStylesheetElements() {
    return this.newHeadSnapshot.getStylesheetElementsNotInSnapshot(this.currentHeadSnapshot);
  }
  get newHeadScriptElements() {
    return this.newHeadSnapshot.getScriptElementsNotInSnapshot(this.currentHeadSnapshot);
  }
  get currentHeadProvisionalElements() {
    return this.currentHeadSnapshot.provisionalElements;
  }
  get newHeadProvisionalElements() {
    return this.newHeadSnapshot.provisionalElements;
  }
  get newBodyScriptElements() {
    return this.newElement.querySelectorAll("script");
  }
};
var MorphingPageRenderer = class extends PageRenderer {
  static renderElement(currentElement, newElement) {
    morphElements(currentElement, newElement, {
      callbacks: {
        beforeNodeMorphed: (node, newNode) => {
          if (shouldRefreshFrameWithMorphing(node, newNode) && !closestFrameReloadableWithMorphing(node)) {
            node.reload();
            return false;
          }
          return true;
        }
      }
    });
    dispatch("turbo:morph", { detail: { currentElement, newElement } });
  }
  async preservingPermanentElements(callback) {
    return await callback();
  }
  get renderMethod() {
    return "morph";
  }
  get shouldAutofocus() {
    return false;
  }
};
var SnapshotCache = class {
  keys = [];
  snapshots = {};
  constructor(size) {
    this.size = size;
  }
  has(location2) {
    return toCacheKey(location2) in this.snapshots;
  }
  get(location2) {
    if (this.has(location2)) {
      const snapshot = this.read(location2);
      this.touch(location2);
      return snapshot;
    }
  }
  put(location2, snapshot) {
    this.write(location2, snapshot);
    this.touch(location2);
    return snapshot;
  }
  clear() {
    this.snapshots = {};
  }
  // Private
  read(location2) {
    return this.snapshots[toCacheKey(location2)];
  }
  write(location2, snapshot) {
    this.snapshots[toCacheKey(location2)] = snapshot;
  }
  touch(location2) {
    const key = toCacheKey(location2);
    const index = this.keys.indexOf(key);
    if (index > -1) this.keys.splice(index, 1);
    this.keys.unshift(key);
    this.trim();
  }
  trim() {
    for (const key of this.keys.splice(this.size)) {
      delete this.snapshots[key];
    }
  }
};
var PageView = class extends View {
  snapshotCache = new SnapshotCache(10);
  lastRenderedLocation = new URL(location.href);
  forceReloaded = false;
  shouldTransitionTo(newSnapshot) {
    return this.snapshot.prefersViewTransitions && newSnapshot.prefersViewTransitions;
  }
  renderPage(snapshot, isPreview = false, willRender = true, visit2) {
    const shouldMorphPage = this.isPageRefresh(visit2) && this.snapshot.shouldMorphPage;
    const rendererClass = shouldMorphPage ? MorphingPageRenderer : PageRenderer;
    const renderer = new rendererClass(this.snapshot, snapshot, isPreview, willRender);
    if (!renderer.shouldRender) {
      this.forceReloaded = true;
    } else {
      visit2?.changeHistory();
    }
    return this.render(renderer);
  }
  renderError(snapshot, visit2) {
    visit2?.changeHistory();
    const renderer = new ErrorRenderer(this.snapshot, snapshot, false);
    return this.render(renderer);
  }
  clearSnapshotCache() {
    this.snapshotCache.clear();
  }
  async cacheSnapshot(snapshot = this.snapshot) {
    if (snapshot.isCacheable) {
      this.delegate.viewWillCacheSnapshot();
      const { lastRenderedLocation: location2 } = this;
      await nextEventLoopTick();
      const cachedSnapshot = snapshot.clone();
      this.snapshotCache.put(location2, cachedSnapshot);
      return cachedSnapshot;
    }
  }
  getCachedSnapshotForLocation(location2) {
    return this.snapshotCache.get(location2);
  }
  isPageRefresh(visit2) {
    return !visit2 || this.lastRenderedLocation.pathname === visit2.location.pathname && visit2.action === "replace";
  }
  shouldPreserveScrollPosition(visit2) {
    return this.isPageRefresh(visit2) && this.snapshot.shouldPreserveScrollPosition;
  }
  get snapshot() {
    return PageSnapshot.fromElement(this.element);
  }
};
var Preloader = class {
  selector = "a[data-turbo-preload]";
  constructor(delegate, snapshotCache) {
    this.delegate = delegate;
    this.snapshotCache = snapshotCache;
  }
  start() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", this.#preloadAll);
    } else {
      this.preloadOnLoadLinksForView(document.body);
    }
  }
  stop() {
    document.removeEventListener("DOMContentLoaded", this.#preloadAll);
  }
  preloadOnLoadLinksForView(element) {
    for (const link of element.querySelectorAll(this.selector)) {
      if (this.delegate.shouldPreloadLink(link)) {
        this.preloadURL(link);
      }
    }
  }
  async preloadURL(link) {
    const location2 = new URL(link.href);
    if (this.snapshotCache.has(location2)) {
      return;
    }
    const fetchRequest = new FetchRequest(this, FetchMethod.get, location2, new URLSearchParams(), link);
    await fetchRequest.perform();
  }
  // Fetch request delegate
  prepareRequest(fetchRequest) {
    fetchRequest.headers["X-Sec-Purpose"] = "prefetch";
  }
  async requestSucceededWithResponse(fetchRequest, fetchResponse) {
    try {
      const responseHTML = await fetchResponse.responseHTML;
      const snapshot = PageSnapshot.fromHTMLString(responseHTML);
      this.snapshotCache.put(fetchRequest.url, snapshot);
    } catch (_) {
    }
  }
  requestStarted(fetchRequest) {
  }
  requestErrored(fetchRequest) {
  }
  requestFinished(fetchRequest) {
  }
  requestPreventedHandlingResponse(fetchRequest, fetchResponse) {
  }
  requestFailedWithResponse(fetchRequest, fetchResponse) {
  }
  #preloadAll = () => {
    this.preloadOnLoadLinksForView(document.body);
  };
};
var Cache = class {
  constructor(session2) {
    this.session = session2;
  }
  clear() {
    this.session.clearCache();
  }
  resetCacheControl() {
    this.#setCacheControl("");
  }
  exemptPageFromCache() {
    this.#setCacheControl("no-cache");
  }
  exemptPageFromPreview() {
    this.#setCacheControl("no-preview");
  }
  #setCacheControl(value) {
    setMetaContent("turbo-cache-control", value);
  }
};
var Session = class {
  navigator = new Navigator(this);
  history = new History(this);
  view = new PageView(this, document.documentElement);
  adapter = new BrowserAdapter(this);
  pageObserver = new PageObserver(this);
  cacheObserver = new CacheObserver();
  linkPrefetchObserver = new LinkPrefetchObserver(this, document);
  linkClickObserver = new LinkClickObserver(this, window);
  formSubmitObserver = new FormSubmitObserver(this, document);
  scrollObserver = new ScrollObserver(this);
  streamObserver = new StreamObserver(this);
  formLinkClickObserver = new FormLinkClickObserver(this, document.documentElement);
  frameRedirector = new FrameRedirector(this, document.documentElement);
  streamMessageRenderer = new StreamMessageRenderer();
  cache = new Cache(this);
  enabled = true;
  started = false;
  #pageRefreshDebouncePeriod = 150;
  constructor(recentRequests2) {
    this.recentRequests = recentRequests2;
    this.preloader = new Preloader(this, this.view.snapshotCache);
    this.debouncedRefresh = this.refresh;
    this.pageRefreshDebouncePeriod = this.pageRefreshDebouncePeriod;
  }
  start() {
    if (!this.started) {
      this.pageObserver.start();
      this.cacheObserver.start();
      this.linkPrefetchObserver.start();
      this.formLinkClickObserver.start();
      this.linkClickObserver.start();
      this.formSubmitObserver.start();
      this.scrollObserver.start();
      this.streamObserver.start();
      this.frameRedirector.start();
      this.history.start();
      this.preloader.start();
      this.started = true;
      this.enabled = true;
    }
  }
  disable() {
    this.enabled = false;
  }
  stop() {
    if (this.started) {
      this.pageObserver.stop();
      this.cacheObserver.stop();
      this.linkPrefetchObserver.stop();
      this.formLinkClickObserver.stop();
      this.linkClickObserver.stop();
      this.formSubmitObserver.stop();
      this.scrollObserver.stop();
      this.streamObserver.stop();
      this.frameRedirector.stop();
      this.history.stop();
      this.preloader.stop();
      this.started = false;
    }
  }
  registerAdapter(adapter) {
    this.adapter = adapter;
  }
  visit(location2, options = {}) {
    const frameElement = options.frame ? document.getElementById(options.frame) : null;
    if (frameElement instanceof FrameElement) {
      const action = options.action || getVisitAction(frameElement);
      frameElement.delegate.proposeVisitIfNavigatedWithAction(frameElement, action);
      frameElement.src = location2.toString();
    } else {
      this.navigator.proposeVisit(expandURL(location2), options);
    }
  }
  refresh(url, requestId) {
    const isRecentRequest = requestId && this.recentRequests.has(requestId);
    const isCurrentUrl = url === document.baseURI;
    if (!isRecentRequest && !this.navigator.currentVisit && isCurrentUrl) {
      this.visit(url, { action: "replace", shouldCacheSnapshot: false });
    }
  }
  connectStreamSource(source) {
    this.streamObserver.connectStreamSource(source);
  }
  disconnectStreamSource(source) {
    this.streamObserver.disconnectStreamSource(source);
  }
  renderStreamMessage(message) {
    this.streamMessageRenderer.render(StreamMessage.wrap(message));
  }
  clearCache() {
    this.view.clearSnapshotCache();
  }
  setProgressBarDelay(delay) {
    console.warn(
      "Please replace `session.setProgressBarDelay(delay)` with `session.progressBarDelay = delay`. The function is deprecated and will be removed in a future version of Turbo.`"
    );
    this.progressBarDelay = delay;
  }
  set progressBarDelay(delay) {
    config.drive.progressBarDelay = delay;
  }
  get progressBarDelay() {
    return config.drive.progressBarDelay;
  }
  set drive(value) {
    config.drive.enabled = value;
  }
  get drive() {
    return config.drive.enabled;
  }
  set formMode(value) {
    config.forms.mode = value;
  }
  get formMode() {
    return config.forms.mode;
  }
  get location() {
    return this.history.location;
  }
  get restorationIdentifier() {
    return this.history.restorationIdentifier;
  }
  get pageRefreshDebouncePeriod() {
    return this.#pageRefreshDebouncePeriod;
  }
  set pageRefreshDebouncePeriod(value) {
    this.refresh = debounce(this.debouncedRefresh.bind(this), value);
    this.#pageRefreshDebouncePeriod = value;
  }
  // Preloader delegate
  shouldPreloadLink(element) {
    const isUnsafe = element.hasAttribute("data-turbo-method");
    const isStream = element.hasAttribute("data-turbo-stream");
    const frameTarget = element.getAttribute("data-turbo-frame");
    const frame = frameTarget == "_top" ? null : document.getElementById(frameTarget) || findClosestRecursively(element, "turbo-frame:not([disabled])");
    if (isUnsafe || isStream || frame instanceof FrameElement) {
      return false;
    } else {
      const location2 = new URL(element.href);
      return this.elementIsNavigatable(element) && locationIsVisitable(location2, this.snapshot.rootLocation);
    }
  }
  // History delegate
  historyPoppedToLocationWithRestorationIdentifierAndDirection(location2, restorationIdentifier, direction) {
    if (this.enabled) {
      this.navigator.startVisit(location2, restorationIdentifier, {
        action: "restore",
        historyChanged: true,
        direction
      });
    } else {
      this.adapter.pageInvalidated({
        reason: "turbo_disabled"
      });
    }
  }
  // Scroll observer delegate
  scrollPositionChanged(position) {
    this.history.updateRestorationData({ scrollPosition: position });
  }
  // Form click observer delegate
  willSubmitFormLinkToLocation(link, location2) {
    return this.elementIsNavigatable(link) && locationIsVisitable(location2, this.snapshot.rootLocation);
  }
  submittedFormLinkToLocation() {
  }
  // Link hover observer delegate
  canPrefetchRequestToLocation(link, location2) {
    return this.elementIsNavigatable(link) && locationIsVisitable(location2, this.snapshot.rootLocation) && this.navigator.linkPrefetchingIsEnabledForLocation(location2);
  }
  // Link click observer delegate
  willFollowLinkToLocation(link, location2, event) {
    return this.elementIsNavigatable(link) && locationIsVisitable(location2, this.snapshot.rootLocation) && this.applicationAllowsFollowingLinkToLocation(link, location2, event);
  }
  followedLinkToLocation(link, location2) {
    const action = this.getActionForLink(link);
    const acceptsStreamResponse = link.hasAttribute("data-turbo-stream");
    this.visit(location2.href, { action, acceptsStreamResponse });
  }
  // Navigator delegate
  allowsVisitingLocationWithAction(location2, action) {
    return this.locationWithActionIsSamePage(location2, action) || this.applicationAllowsVisitingLocation(location2);
  }
  visitProposedToLocation(location2, options) {
    extendURLWithDeprecatedProperties(location2);
    this.adapter.visitProposedToLocation(location2, options);
  }
  // Visit delegate
  visitStarted(visit2) {
    if (!visit2.acceptsStreamResponse) {
      markAsBusy(document.documentElement);
      this.view.markVisitDirection(visit2.direction);
    }
    extendURLWithDeprecatedProperties(visit2.location);
    if (!visit2.silent) {
      this.notifyApplicationAfterVisitingLocation(visit2.location, visit2.action);
    }
  }
  visitCompleted(visit2) {
    this.view.unmarkVisitDirection();
    clearBusyState(document.documentElement);
    this.notifyApplicationAfterPageLoad(visit2.getTimingMetrics());
  }
  locationWithActionIsSamePage(location2, action) {
    return this.navigator.locationWithActionIsSamePage(location2, action);
  }
  visitScrolledToSamePageLocation(oldURL, newURL) {
    this.notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL);
  }
  // Form submit observer delegate
  willSubmitForm(form, submitter2) {
    const action = getAction$1(form, submitter2);
    return this.submissionIsNavigatable(form, submitter2) && locationIsVisitable(expandURL(action), this.snapshot.rootLocation);
  }
  formSubmitted(form, submitter2) {
    this.navigator.submitForm(form, submitter2);
  }
  // Page observer delegate
  pageBecameInteractive() {
    this.view.lastRenderedLocation = this.location;
    this.notifyApplicationAfterPageLoad();
  }
  pageLoaded() {
    this.history.assumeControlOfScrollRestoration();
  }
  pageWillUnload() {
    this.history.relinquishControlOfScrollRestoration();
  }
  // Stream observer delegate
  receivedMessageFromStream(message) {
    this.renderStreamMessage(message);
  }
  // Page view delegate
  viewWillCacheSnapshot() {
    if (!this.navigator.currentVisit?.silent) {
      this.notifyApplicationBeforeCachingSnapshot();
    }
  }
  allowsImmediateRender({ element }, options) {
    const event = this.notifyApplicationBeforeRender(element, options);
    const {
      defaultPrevented,
      detail: { render }
    } = event;
    if (this.view.renderer && render) {
      this.view.renderer.renderElement = render;
    }
    return !defaultPrevented;
  }
  viewRenderedSnapshot(_snapshot, _isPreview, renderMethod) {
    this.view.lastRenderedLocation = this.history.location;
    this.notifyApplicationAfterRender(renderMethod);
  }
  preloadOnLoadLinksForView(element) {
    this.preloader.preloadOnLoadLinksForView(element);
  }
  viewInvalidated(reason) {
    this.adapter.pageInvalidated(reason);
  }
  // Frame element
  frameLoaded(frame) {
    this.notifyApplicationAfterFrameLoad(frame);
  }
  frameRendered(fetchResponse, frame) {
    this.notifyApplicationAfterFrameRender(fetchResponse, frame);
  }
  // Application events
  applicationAllowsFollowingLinkToLocation(link, location2, ev) {
    const event = this.notifyApplicationAfterClickingLinkToLocation(link, location2, ev);
    return !event.defaultPrevented;
  }
  applicationAllowsVisitingLocation(location2) {
    const event = this.notifyApplicationBeforeVisitingLocation(location2);
    return !event.defaultPrevented;
  }
  notifyApplicationAfterClickingLinkToLocation(link, location2, event) {
    return dispatch("turbo:click", {
      target: link,
      detail: { url: location2.href, originalEvent: event },
      cancelable: true
    });
  }
  notifyApplicationBeforeVisitingLocation(location2) {
    return dispatch("turbo:before-visit", {
      detail: { url: location2.href },
      cancelable: true
    });
  }
  notifyApplicationAfterVisitingLocation(location2, action) {
    return dispatch("turbo:visit", { detail: { url: location2.href, action } });
  }
  notifyApplicationBeforeCachingSnapshot() {
    return dispatch("turbo:before-cache");
  }
  notifyApplicationBeforeRender(newBody, options) {
    return dispatch("turbo:before-render", {
      detail: { newBody, ...options },
      cancelable: true
    });
  }
  notifyApplicationAfterRender(renderMethod) {
    return dispatch("turbo:render", { detail: { renderMethod } });
  }
  notifyApplicationAfterPageLoad(timing = {}) {
    return dispatch("turbo:load", {
      detail: { url: this.location.href, timing }
    });
  }
  notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL) {
    dispatchEvent(
      new HashChangeEvent("hashchange", {
        oldURL: oldURL.toString(),
        newURL: newURL.toString()
      })
    );
  }
  notifyApplicationAfterFrameLoad(frame) {
    return dispatch("turbo:frame-load", { target: frame });
  }
  notifyApplicationAfterFrameRender(fetchResponse, frame) {
    return dispatch("turbo:frame-render", {
      detail: { fetchResponse },
      target: frame,
      cancelable: true
    });
  }
  // Helpers
  submissionIsNavigatable(form, submitter2) {
    if (config.forms.mode == "off") {
      return false;
    } else {
      const submitterIsNavigatable = submitter2 ? this.elementIsNavigatable(submitter2) : true;
      if (config.forms.mode == "optin") {
        return submitterIsNavigatable && form.closest('[data-turbo="true"]') != null;
      } else {
        return submitterIsNavigatable && this.elementIsNavigatable(form);
      }
    }
  }
  elementIsNavigatable(element) {
    const container = findClosestRecursively(element, "[data-turbo]");
    const withinFrame = findClosestRecursively(element, "turbo-frame");
    if (config.drive.enabled || withinFrame) {
      if (container) {
        return container.getAttribute("data-turbo") != "false";
      } else {
        return true;
      }
    } else {
      if (container) {
        return container.getAttribute("data-turbo") == "true";
      } else {
        return false;
      }
    }
  }
  // Private
  getActionForLink(link) {
    return getVisitAction(link) || "advance";
  }
  get snapshot() {
    return this.view.snapshot;
  }
};
function extendURLWithDeprecatedProperties(url) {
  Object.defineProperties(url, deprecatedLocationPropertyDescriptors);
}
var deprecatedLocationPropertyDescriptors = {
  absoluteURL: {
    get() {
      return this.toString();
    }
  }
};
var session = new Session(recentRequests);
var { cache, navigator: navigator$1 } = session;
function start() {
  session.start();
}
function registerAdapter(adapter) {
  session.registerAdapter(adapter);
}
function visit(location2, options) {
  session.visit(location2, options);
}
function connectStreamSource(source) {
  session.connectStreamSource(source);
}
function disconnectStreamSource(source) {
  session.disconnectStreamSource(source);
}
function renderStreamMessage(message) {
  session.renderStreamMessage(message);
}
function clearCache() {
  console.warn(
    "Please replace `Turbo.clearCache()` with `Turbo.cache.clear()`. The top-level function is deprecated and will be removed in a future version of Turbo.`"
  );
  session.clearCache();
}
function setProgressBarDelay(delay) {
  console.warn(
    "Please replace `Turbo.setProgressBarDelay(delay)` with `Turbo.config.drive.progressBarDelay = delay`. The top-level function is deprecated and will be removed in a future version of Turbo.`"
  );
  config.drive.progressBarDelay = delay;
}
function setConfirmMethod(confirmMethod) {
  console.warn(
    "Please replace `Turbo.setConfirmMethod(confirmMethod)` with `Turbo.config.forms.confirm = confirmMethod`. The top-level function is deprecated and will be removed in a future version of Turbo.`"
  );
  config.forms.confirm = confirmMethod;
}
function setFormMode(mode) {
  console.warn(
    "Please replace `Turbo.setFormMode(mode)` with `Turbo.config.forms.mode = mode`. The top-level function is deprecated and will be removed in a future version of Turbo.`"
  );
  config.forms.mode = mode;
}
function morphBodyElements(currentBody, newBody) {
  MorphingPageRenderer.renderElement(currentBody, newBody);
}
function morphTurboFrameElements(currentFrame, newFrame) {
  MorphingFrameRenderer.renderElement(currentFrame, newFrame);
}
var Turbo = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  navigator: navigator$1,
  session,
  cache,
  PageRenderer,
  PageSnapshot,
  FrameRenderer,
  fetch: fetchWithTurboHeaders,
  config,
  start,
  registerAdapter,
  visit,
  connectStreamSource,
  disconnectStreamSource,
  renderStreamMessage,
  clearCache,
  setProgressBarDelay,
  setConfirmMethod,
  setFormMode,
  morphBodyElements,
  morphTurboFrameElements,
  morphChildren,
  morphElements
});
var TurboFrameMissingError = class extends Error {
};
var FrameController = class {
  fetchResponseLoaded = (_fetchResponse) => Promise.resolve();
  #currentFetchRequest = null;
  #resolveVisitPromise = () => {
  };
  #connected = false;
  #hasBeenLoaded = false;
  #ignoredAttributes = /* @__PURE__ */ new Set();
  #shouldMorphFrame = false;
  action = null;
  constructor(element) {
    this.element = element;
    this.view = new FrameView(this, this.element);
    this.appearanceObserver = new AppearanceObserver(this, this.element);
    this.formLinkClickObserver = new FormLinkClickObserver(this, this.element);
    this.linkInterceptor = new LinkInterceptor(this, this.element);
    this.restorationIdentifier = uuid();
    this.formSubmitObserver = new FormSubmitObserver(this, this.element);
  }
  // Frame delegate
  connect() {
    if (!this.#connected) {
      this.#connected = true;
      if (this.loadingStyle == FrameLoadingStyle.lazy) {
        this.appearanceObserver.start();
      } else {
        this.#loadSourceURL();
      }
      this.formLinkClickObserver.start();
      this.linkInterceptor.start();
      this.formSubmitObserver.start();
    }
  }
  disconnect() {
    if (this.#connected) {
      this.#connected = false;
      this.appearanceObserver.stop();
      this.formLinkClickObserver.stop();
      this.linkInterceptor.stop();
      this.formSubmitObserver.stop();
    }
  }
  disabledChanged() {
    if (this.loadingStyle == FrameLoadingStyle.eager) {
      this.#loadSourceURL();
    }
  }
  sourceURLChanged() {
    if (this.#isIgnoringChangesTo("src")) return;
    if (this.element.isConnected) {
      this.complete = false;
    }
    if (this.loadingStyle == FrameLoadingStyle.eager || this.#hasBeenLoaded) {
      this.#loadSourceURL();
    }
  }
  sourceURLReloaded() {
    const { refresh, src } = this.element;
    this.#shouldMorphFrame = src && refresh === "morph";
    this.element.removeAttribute("complete");
    this.element.src = null;
    this.element.src = src;
    return this.element.loaded;
  }
  loadingStyleChanged() {
    if (this.loadingStyle == FrameLoadingStyle.lazy) {
      this.appearanceObserver.start();
    } else {
      this.appearanceObserver.stop();
      this.#loadSourceURL();
    }
  }
  async #loadSourceURL() {
    if (this.enabled && this.isActive && !this.complete && this.sourceURL) {
      this.element.loaded = this.#visit(expandURL(this.sourceURL));
      this.appearanceObserver.stop();
      await this.element.loaded;
      this.#hasBeenLoaded = true;
    }
  }
  async loadResponse(fetchResponse) {
    if (fetchResponse.redirected || fetchResponse.succeeded && fetchResponse.isHTML) {
      this.sourceURL = fetchResponse.response.url;
    }
    try {
      const html = await fetchResponse.responseHTML;
      if (html) {
        const document2 = parseHTMLDocument(html);
        const pageSnapshot = PageSnapshot.fromDocument(document2);
        if (pageSnapshot.isVisitable) {
          await this.#loadFrameResponse(fetchResponse, document2);
        } else {
          await this.#handleUnvisitableFrameResponse(fetchResponse);
        }
      }
    } finally {
      this.#shouldMorphFrame = false;
      this.fetchResponseLoaded = () => Promise.resolve();
    }
  }
  // Appearance observer delegate
  elementAppearedInViewport(element) {
    this.proposeVisitIfNavigatedWithAction(element, getVisitAction(element));
    this.#loadSourceURL();
  }
  // Form link click observer delegate
  willSubmitFormLinkToLocation(link) {
    return this.#shouldInterceptNavigation(link);
  }
  submittedFormLinkToLocation(link, _location, form) {
    const frame = this.#findFrameElement(link);
    if (frame) form.setAttribute("data-turbo-frame", frame.id);
  }
  // Link interceptor delegate
  shouldInterceptLinkClick(element, _location, _event) {
    return this.#shouldInterceptNavigation(element);
  }
  linkClickIntercepted(element, location2) {
    this.#navigateFrame(element, location2);
  }
  // Form submit observer delegate
  willSubmitForm(element, submitter2) {
    return element.closest("turbo-frame") == this.element && this.#shouldInterceptNavigation(element, submitter2);
  }
  formSubmitted(element, submitter2) {
    if (this.formSubmission) {
      this.formSubmission.stop();
    }
    this.formSubmission = new FormSubmission(this, element, submitter2);
    const { fetchRequest } = this.formSubmission;
    this.prepareRequest(fetchRequest);
    this.formSubmission.start();
  }
  // Fetch request delegate
  prepareRequest(request) {
    request.headers["Turbo-Frame"] = this.id;
    if (this.currentNavigationElement?.hasAttribute("data-turbo-stream")) {
      request.acceptResponseType(StreamMessage.contentType);
    }
  }
  requestStarted(_request) {
    markAsBusy(this.element);
  }
  requestPreventedHandlingResponse(_request, _response) {
    this.#resolveVisitPromise();
  }
  async requestSucceededWithResponse(request, response) {
    await this.loadResponse(response);
    this.#resolveVisitPromise();
  }
  async requestFailedWithResponse(request, response) {
    await this.loadResponse(response);
    this.#resolveVisitPromise();
  }
  requestErrored(request, error2) {
    console.error(error2);
    this.#resolveVisitPromise();
  }
  requestFinished(_request) {
    clearBusyState(this.element);
  }
  // Form submission delegate
  formSubmissionStarted({ formElement }) {
    markAsBusy(formElement, this.#findFrameElement(formElement));
  }
  formSubmissionSucceededWithResponse(formSubmission, response) {
    const frame = this.#findFrameElement(formSubmission.formElement, formSubmission.submitter);
    frame.delegate.proposeVisitIfNavigatedWithAction(frame, getVisitAction(formSubmission.submitter, formSubmission.formElement, frame));
    frame.delegate.loadResponse(response);
    if (!formSubmission.isSafe) {
      session.clearCache();
    }
  }
  formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
    this.element.delegate.loadResponse(fetchResponse);
    session.clearCache();
  }
  formSubmissionErrored(formSubmission, error2) {
    console.error(error2);
  }
  formSubmissionFinished({ formElement }) {
    clearBusyState(formElement, this.#findFrameElement(formElement));
  }
  // View delegate
  allowsImmediateRender({ element: newFrame }, options) {
    const event = dispatch("turbo:before-frame-render", {
      target: this.element,
      detail: { newFrame, ...options },
      cancelable: true
    });
    const {
      defaultPrevented,
      detail: { render }
    } = event;
    if (this.view.renderer && render) {
      this.view.renderer.renderElement = render;
    }
    return !defaultPrevented;
  }
  viewRenderedSnapshot(_snapshot, _isPreview, _renderMethod) {
  }
  preloadOnLoadLinksForView(element) {
    session.preloadOnLoadLinksForView(element);
  }
  viewInvalidated() {
  }
  // Frame renderer delegate
  willRenderFrame(currentElement, _newElement) {
    this.previousFrameElement = currentElement.cloneNode(true);
  }
  visitCachedSnapshot = ({ element }) => {
    const frame = element.querySelector("#" + this.element.id);
    if (frame && this.previousFrameElement) {
      frame.replaceChildren(...this.previousFrameElement.children);
    }
    delete this.previousFrameElement;
  };
  // Private
  async #loadFrameResponse(fetchResponse, document2) {
    const newFrameElement = await this.extractForeignFrameElement(document2.body);
    const rendererClass = this.#shouldMorphFrame ? MorphingFrameRenderer : FrameRenderer;
    if (newFrameElement) {
      const snapshot = new Snapshot(newFrameElement);
      const renderer = new rendererClass(this, this.view.snapshot, snapshot, false, false);
      if (this.view.renderPromise) await this.view.renderPromise;
      this.changeHistory();
      await this.view.render(renderer);
      this.complete = true;
      session.frameRendered(fetchResponse, this.element);
      session.frameLoaded(this.element);
      await this.fetchResponseLoaded(fetchResponse);
    } else if (this.#willHandleFrameMissingFromResponse(fetchResponse)) {
      this.#handleFrameMissingFromResponse(fetchResponse);
    }
  }
  async #visit(url) {
    const request = new FetchRequest(this, FetchMethod.get, url, new URLSearchParams(), this.element);
    this.#currentFetchRequest?.cancel();
    this.#currentFetchRequest = request;
    return new Promise((resolve) => {
      this.#resolveVisitPromise = () => {
        this.#resolveVisitPromise = () => {
        };
        this.#currentFetchRequest = null;
        resolve();
      };
      request.perform();
    });
  }
  #navigateFrame(element, url, submitter2) {
    const frame = this.#findFrameElement(element, submitter2);
    frame.delegate.proposeVisitIfNavigatedWithAction(frame, getVisitAction(submitter2, element, frame));
    this.#withCurrentNavigationElement(element, () => {
      frame.src = url;
    });
  }
  proposeVisitIfNavigatedWithAction(frame, action = null) {
    this.action = action;
    if (this.action) {
      const pageSnapshot = PageSnapshot.fromElement(frame).clone();
      const { visitCachedSnapshot } = frame.delegate;
      frame.delegate.fetchResponseLoaded = async (fetchResponse) => {
        if (frame.src) {
          const { statusCode, redirected } = fetchResponse;
          const responseHTML = await fetchResponse.responseHTML;
          const response = { statusCode, redirected, responseHTML };
          const options = {
            response,
            visitCachedSnapshot,
            willRender: false,
            updateHistory: false,
            restorationIdentifier: this.restorationIdentifier,
            snapshot: pageSnapshot
          };
          if (this.action) options.action = this.action;
          session.visit(frame.src, options);
        }
      };
    }
  }
  changeHistory() {
    if (this.action) {
      const method = getHistoryMethodForAction(this.action);
      session.history.update(method, expandURL(this.element.src || ""), this.restorationIdentifier);
    }
  }
  async #handleUnvisitableFrameResponse(fetchResponse) {
    console.warn(
      `The response (${fetchResponse.statusCode}) from <turbo-frame id="${this.element.id}"> is performing a full page visit due to turbo-visit-control.`
    );
    await this.#visitResponse(fetchResponse.response);
  }
  #willHandleFrameMissingFromResponse(fetchResponse) {
    this.element.setAttribute("complete", "");
    const response = fetchResponse.response;
    const visit2 = async (url, options) => {
      if (url instanceof Response) {
        this.#visitResponse(url);
      } else {
        session.visit(url, options);
      }
    };
    const event = dispatch("turbo:frame-missing", {
      target: this.element,
      detail: { response, visit: visit2 },
      cancelable: true
    });
    return !event.defaultPrevented;
  }
  #handleFrameMissingFromResponse(fetchResponse) {
    this.view.missing();
    this.#throwFrameMissingError(fetchResponse);
  }
  #throwFrameMissingError(fetchResponse) {
    const message = `The response (${fetchResponse.statusCode}) did not contain the expected <turbo-frame id="${this.element.id}"> and will be ignored. To perform a full page visit instead, set turbo-visit-control to reload.`;
    throw new TurboFrameMissingError(message);
  }
  async #visitResponse(response) {
    const wrapped = new FetchResponse(response);
    const responseHTML = await wrapped.responseHTML;
    const { location: location2, redirected, statusCode } = wrapped;
    return session.visit(location2, { response: { redirected, statusCode, responseHTML } });
  }
  #findFrameElement(element, submitter2) {
    const id = getAttribute("data-turbo-frame", submitter2, element) || this.element.getAttribute("target");
    return getFrameElementById(id) ?? this.element;
  }
  async extractForeignFrameElement(container) {
    let element;
    const id = CSS.escape(this.id);
    try {
      element = activateElement(container.querySelector(`turbo-frame#${id}`), this.sourceURL);
      if (element) {
        return element;
      }
      element = activateElement(container.querySelector(`turbo-frame[src][recurse~=${id}]`), this.sourceURL);
      if (element) {
        await element.loaded;
        return await this.extractForeignFrameElement(element);
      }
    } catch (error2) {
      console.error(error2);
      return new FrameElement();
    }
    return null;
  }
  #formActionIsVisitable(form, submitter2) {
    const action = getAction$1(form, submitter2);
    return locationIsVisitable(expandURL(action), this.rootLocation);
  }
  #shouldInterceptNavigation(element, submitter2) {
    const id = getAttribute("data-turbo-frame", submitter2, element) || this.element.getAttribute("target");
    if (element instanceof HTMLFormElement && !this.#formActionIsVisitable(element, submitter2)) {
      return false;
    }
    if (!this.enabled || id == "_top") {
      return false;
    }
    if (id) {
      const frameElement = getFrameElementById(id);
      if (frameElement) {
        return !frameElement.disabled;
      }
    }
    if (!session.elementIsNavigatable(element)) {
      return false;
    }
    if (submitter2 && !session.elementIsNavigatable(submitter2)) {
      return false;
    }
    return true;
  }
  // Computed properties
  get id() {
    return this.element.id;
  }
  get enabled() {
    return !this.element.disabled;
  }
  get sourceURL() {
    if (this.element.src) {
      return this.element.src;
    }
  }
  set sourceURL(sourceURL) {
    this.#ignoringChangesToAttribute("src", () => {
      this.element.src = sourceURL ?? null;
    });
  }
  get loadingStyle() {
    return this.element.loading;
  }
  get isLoading() {
    return this.formSubmission !== void 0 || this.#resolveVisitPromise() !== void 0;
  }
  get complete() {
    return this.element.hasAttribute("complete");
  }
  set complete(value) {
    if (value) {
      this.element.setAttribute("complete", "");
    } else {
      this.element.removeAttribute("complete");
    }
  }
  get isActive() {
    return this.element.isActive && this.#connected;
  }
  get rootLocation() {
    const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
    const root = meta?.content ?? "/";
    return expandURL(root);
  }
  #isIgnoringChangesTo(attributeName) {
    return this.#ignoredAttributes.has(attributeName);
  }
  #ignoringChangesToAttribute(attributeName, callback) {
    this.#ignoredAttributes.add(attributeName);
    callback();
    this.#ignoredAttributes.delete(attributeName);
  }
  #withCurrentNavigationElement(element, callback) {
    this.currentNavigationElement = element;
    callback();
    delete this.currentNavigationElement;
  }
};
function getFrameElementById(id) {
  if (id != null) {
    const element = document.getElementById(id);
    if (element instanceof FrameElement) {
      return element;
    }
  }
}
function activateElement(element, currentURL) {
  if (element) {
    const src = element.getAttribute("src");
    if (src != null && currentURL != null && urlsAreEqual(src, currentURL)) {
      throw new Error(`Matching <turbo-frame id="${element.id}"> element has a source URL which references itself`);
    }
    if (element.ownerDocument !== document) {
      element = document.importNode(element, true);
    }
    if (element instanceof FrameElement) {
      element.connectedCallback();
      element.disconnectedCallback();
      return element;
    }
  }
}
var StreamActions = {
  after() {
    this.targetElements.forEach((e) => e.parentElement?.insertBefore(this.templateContent, e.nextSibling));
  },
  append() {
    this.removeDuplicateTargetChildren();
    this.targetElements.forEach((e) => e.append(this.templateContent));
  },
  before() {
    this.targetElements.forEach((e) => e.parentElement?.insertBefore(this.templateContent, e));
  },
  prepend() {
    this.removeDuplicateTargetChildren();
    this.targetElements.forEach((e) => e.prepend(this.templateContent));
  },
  remove() {
    this.targetElements.forEach((e) => e.remove());
  },
  replace() {
    const method = this.getAttribute("method");
    this.targetElements.forEach((targetElement) => {
      if (method === "morph") {
        morphElements(targetElement, this.templateContent);
      } else {
        targetElement.replaceWith(this.templateContent);
      }
    });
  },
  update() {
    const method = this.getAttribute("method");
    this.targetElements.forEach((targetElement) => {
      if (method === "morph") {
        morphChildren(targetElement, this.templateContent);
      } else {
        targetElement.innerHTML = "";
        targetElement.append(this.templateContent);
      }
    });
  },
  refresh() {
    session.refresh(this.baseURI, this.requestId);
  }
};
var StreamElement = class _StreamElement extends HTMLElement {
  static async renderElement(newElement) {
    await newElement.performAction();
  }
  async connectedCallback() {
    try {
      await this.render();
    } catch (error2) {
      console.error(error2);
    } finally {
      this.disconnect();
    }
  }
  async render() {
    return this.renderPromise ??= (async () => {
      const event = this.beforeRenderEvent;
      if (this.dispatchEvent(event)) {
        await nextRepaint();
        await event.detail.render(this);
      }
    })();
  }
  disconnect() {
    try {
      this.remove();
    } catch {
    }
  }
  /**
   * Removes duplicate children (by ID)
   */
  removeDuplicateTargetChildren() {
    this.duplicateChildren.forEach((c) => c.remove());
  }
  /**
   * Gets the list of duplicate children (i.e. those with the same ID)
   */
  get duplicateChildren() {
    const existingChildren = this.targetElements.flatMap((e) => [...e.children]).filter((c) => !!c.getAttribute("id"));
    const newChildrenIds = [...this.templateContent?.children || []].filter((c) => !!c.getAttribute("id")).map((c) => c.getAttribute("id"));
    return existingChildren.filter((c) => newChildrenIds.includes(c.getAttribute("id")));
  }
  /**
   * Gets the action function to be performed.
   */
  get performAction() {
    if (this.action) {
      const actionFunction = StreamActions[this.action];
      if (actionFunction) {
        return actionFunction;
      }
      this.#raise("unknown action");
    }
    this.#raise("action attribute is missing");
  }
  /**
   * Gets the target elements which the template will be rendered to.
   */
  get targetElements() {
    if (this.target) {
      return this.targetElementsById;
    } else if (this.targets) {
      return this.targetElementsByQuery;
    } else {
      this.#raise("target or targets attribute is missing");
    }
  }
  /**
   * Gets the contents of the main `<template>`.
   */
  get templateContent() {
    return this.templateElement.content.cloneNode(true);
  }
  /**
   * Gets the main `<template>` used for rendering
   */
  get templateElement() {
    if (this.firstElementChild === null) {
      const template = this.ownerDocument.createElement("template");
      this.appendChild(template);
      return template;
    } else if (this.firstElementChild instanceof HTMLTemplateElement) {
      return this.firstElementChild;
    }
    this.#raise("first child element must be a <template> element");
  }
  /**
   * Gets the current action.
   */
  get action() {
    return this.getAttribute("action");
  }
  /**
   * Gets the current target (an element ID) to which the result will
   * be rendered.
   */
  get target() {
    return this.getAttribute("target");
  }
  /**
   * Gets the current "targets" selector (a CSS selector)
   */
  get targets() {
    return this.getAttribute("targets");
  }
  /**
   * Reads the request-id attribute
   */
  get requestId() {
    return this.getAttribute("request-id");
  }
  #raise(message) {
    throw new Error(`${this.description}: ${message}`);
  }
  get description() {
    return (this.outerHTML.match(/<[^>]+>/) ?? [])[0] ?? "<turbo-stream>";
  }
  get beforeRenderEvent() {
    return new CustomEvent("turbo:before-stream-render", {
      bubbles: true,
      cancelable: true,
      detail: { newStream: this, render: _StreamElement.renderElement }
    });
  }
  get targetElementsById() {
    const element = this.ownerDocument?.getElementById(this.target);
    if (element !== null) {
      return [element];
    } else {
      return [];
    }
  }
  get targetElementsByQuery() {
    const elements = this.ownerDocument?.querySelectorAll(this.targets);
    if (elements.length !== 0) {
      return Array.prototype.slice.call(elements);
    } else {
      return [];
    }
  }
};
var StreamSourceElement = class extends HTMLElement {
  streamSource = null;
  connectedCallback() {
    this.streamSource = this.src.match(/^ws{1,2}:/) ? new WebSocket(this.src) : new EventSource(this.src);
    connectStreamSource(this.streamSource);
  }
  disconnectedCallback() {
    if (this.streamSource) {
      this.streamSource.close();
      disconnectStreamSource(this.streamSource);
    }
  }
  get src() {
    return this.getAttribute("src") || "";
  }
};
FrameElement.delegateConstructor = FrameController;
if (customElements.get("turbo-frame") === void 0) {
  customElements.define("turbo-frame", FrameElement);
}
if (customElements.get("turbo-stream") === void 0) {
  customElements.define("turbo-stream", StreamElement);
}
if (customElements.get("turbo-stream-source") === void 0) {
  customElements.define("turbo-stream-source", StreamSourceElement);
}
(() => {
  let element = document.currentScript;
  if (!element) return;
  if (element.hasAttribute("data-turbo-suppress-warning")) return;
  element = element.parentElement;
  while (element) {
    if (element == document.body) {
      return console.warn(
        unindent`
        You are loading Turbo from a <script> element inside the <body> element. This is probably not what you meant to do!

        Load your application’s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.

        For more information, see: https://turbo.hotwired.dev/handbook/building#working-with-script-elements

        ——
        Suppress this warning by adding a "data-turbo-suppress-warning" attribute to: %s
      `,
        element.outerHTML
      );
    }
    element = element.parentElement;
  }
})();
window.Turbo = { ...Turbo, StreamActions };
start();

// node_modules/@hotwired/turbo-rails/app/javascript/turbo/cable.js
var consumer;
async function getConsumer() {
  return consumer || setConsumer(createConsumer2().then(setConsumer));
}
function setConsumer(newConsumer) {
  return consumer = newConsumer;
}
async function createConsumer2() {
  const { createConsumer: createConsumer3 } = await Promise.resolve().then(() => (init_src(), src_exports));
  return createConsumer3();
}
async function subscribeTo(channel, mixin) {
  const { subscriptions } = await getConsumer();
  return subscriptions.create(channel, mixin);
}

// node_modules/@hotwired/turbo-rails/app/javascript/turbo/snakeize.js
function walk(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (obj instanceof Date || obj instanceof RegExp) return obj;
  if (Array.isArray(obj)) return obj.map(walk);
  return Object.keys(obj).reduce(function(acc, key) {
    var camel = key[0].toLowerCase() + key.slice(1).replace(/([A-Z]+)/g, function(m, x) {
      return "_" + x.toLowerCase();
    });
    acc[camel] = walk(obj[key]);
    return acc;
  }, {});
}

// node_modules/@hotwired/turbo-rails/app/javascript/turbo/cable_stream_source_element.js
var TurboCableStreamSourceElement = class extends HTMLElement {
  static observedAttributes = ["channel", "signed-stream-name"];
  async connectedCallback() {
    connectStreamSource(this);
    this.subscription = await subscribeTo(this.channel, {
      received: this.dispatchMessageEvent.bind(this),
      connected: this.subscriptionConnected.bind(this),
      disconnected: this.subscriptionDisconnected.bind(this)
    });
  }
  disconnectedCallback() {
    disconnectStreamSource(this);
    if (this.subscription) this.subscription.unsubscribe();
    this.subscriptionDisconnected();
  }
  attributeChangedCallback() {
    if (this.subscription) {
      this.disconnectedCallback();
      this.connectedCallback();
    }
  }
  dispatchMessageEvent(data) {
    const event = new MessageEvent("message", { data });
    return this.dispatchEvent(event);
  }
  subscriptionConnected() {
    this.setAttribute("connected", "");
  }
  subscriptionDisconnected() {
    this.removeAttribute("connected");
  }
  get channel() {
    const channel = this.getAttribute("channel");
    const signed_stream_name = this.getAttribute("signed-stream-name");
    return { channel, signed_stream_name, ...walk({ ...this.dataset }) };
  }
};
if (customElements.get("turbo-cable-stream-source") === void 0) {
  customElements.define("turbo-cable-stream-source", TurboCableStreamSourceElement);
}

// node_modules/@hotwired/turbo-rails/app/javascript/turbo/fetch_requests.js
function encodeMethodIntoRequestBody(event) {
  if (event.target instanceof HTMLFormElement) {
    const { target: form, detail: { fetchOptions } } = event;
    form.addEventListener("turbo:submit-start", ({ detail: { formSubmission: { submitter: submitter2 } } }) => {
      const body = isBodyInit(fetchOptions.body) ? fetchOptions.body : new URLSearchParams();
      const method = determineFetchMethod(submitter2, body, form);
      if (!/get/i.test(method)) {
        if (/post/i.test(method)) {
          body.delete("_method");
        } else {
          body.set("_method", method);
        }
        fetchOptions.method = "post";
      }
    }, { once: true });
  }
}
function determineFetchMethod(submitter2, body, form) {
  const formMethod = determineFormMethod(submitter2);
  const overrideMethod = body.get("_method");
  const method = form.getAttribute("method") || "get";
  if (typeof formMethod == "string") {
    return formMethod;
  } else if (typeof overrideMethod == "string") {
    return overrideMethod;
  } else {
    return method;
  }
}
function determineFormMethod(submitter2) {
  if (submitter2 instanceof HTMLButtonElement || submitter2 instanceof HTMLInputElement) {
    if (submitter2.name === "_method") {
      return submitter2.value;
    } else if (submitter2.hasAttribute("formmethod")) {
      return submitter2.formMethod;
    } else {
      return null;
    }
  } else {
    return null;
  }
}
function isBodyInit(body) {
  return body instanceof FormData || body instanceof URLSearchParams;
}

// node_modules/@hotwired/turbo-rails/app/javascript/turbo/index.js
window.Turbo = turbo_es2017_esm_exports;
addEventListener("turbo:before-fetch-request", encodeMethodIntoRequestBody);

// node_modules/@hotwired/stimulus/dist/stimulus.js
var EventListener = class {
  constructor(eventTarget, eventName, eventOptions) {
    this.eventTarget = eventTarget;
    this.eventName = eventName;
    this.eventOptions = eventOptions;
    this.unorderedBindings = /* @__PURE__ */ new Set();
  }
  connect() {
    this.eventTarget.addEventListener(this.eventName, this, this.eventOptions);
  }
  disconnect() {
    this.eventTarget.removeEventListener(this.eventName, this, this.eventOptions);
  }
  bindingConnected(binding) {
    this.unorderedBindings.add(binding);
  }
  bindingDisconnected(binding) {
    this.unorderedBindings.delete(binding);
  }
  handleEvent(event) {
    const extendedEvent = extendEvent(event);
    for (const binding of this.bindings) {
      if (extendedEvent.immediatePropagationStopped) {
        break;
      } else {
        binding.handleEvent(extendedEvent);
      }
    }
  }
  hasBindings() {
    return this.unorderedBindings.size > 0;
  }
  get bindings() {
    return Array.from(this.unorderedBindings).sort((left, right) => {
      const leftIndex = left.index, rightIndex = right.index;
      return leftIndex < rightIndex ? -1 : leftIndex > rightIndex ? 1 : 0;
    });
  }
};
function extendEvent(event) {
  if ("immediatePropagationStopped" in event) {
    return event;
  } else {
    const { stopImmediatePropagation } = event;
    return Object.assign(event, {
      immediatePropagationStopped: false,
      stopImmediatePropagation() {
        this.immediatePropagationStopped = true;
        stopImmediatePropagation.call(this);
      }
    });
  }
}
var Dispatcher = class {
  constructor(application2) {
    this.application = application2;
    this.eventListenerMaps = /* @__PURE__ */ new Map();
    this.started = false;
  }
  start() {
    if (!this.started) {
      this.started = true;
      this.eventListeners.forEach((eventListener) => eventListener.connect());
    }
  }
  stop() {
    if (this.started) {
      this.started = false;
      this.eventListeners.forEach((eventListener) => eventListener.disconnect());
    }
  }
  get eventListeners() {
    return Array.from(this.eventListenerMaps.values()).reduce((listeners, map) => listeners.concat(Array.from(map.values())), []);
  }
  bindingConnected(binding) {
    this.fetchEventListenerForBinding(binding).bindingConnected(binding);
  }
  bindingDisconnected(binding, clearEventListeners = false) {
    this.fetchEventListenerForBinding(binding).bindingDisconnected(binding);
    if (clearEventListeners)
      this.clearEventListenersForBinding(binding);
  }
  handleError(error2, message, detail = {}) {
    this.application.handleError(error2, `Error ${message}`, detail);
  }
  clearEventListenersForBinding(binding) {
    const eventListener = this.fetchEventListenerForBinding(binding);
    if (!eventListener.hasBindings()) {
      eventListener.disconnect();
      this.removeMappedEventListenerFor(binding);
    }
  }
  removeMappedEventListenerFor(binding) {
    const { eventTarget, eventName, eventOptions } = binding;
    const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
    const cacheKey = this.cacheKey(eventName, eventOptions);
    eventListenerMap.delete(cacheKey);
    if (eventListenerMap.size == 0)
      this.eventListenerMaps.delete(eventTarget);
  }
  fetchEventListenerForBinding(binding) {
    const { eventTarget, eventName, eventOptions } = binding;
    return this.fetchEventListener(eventTarget, eventName, eventOptions);
  }
  fetchEventListener(eventTarget, eventName, eventOptions) {
    const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
    const cacheKey = this.cacheKey(eventName, eventOptions);
    let eventListener = eventListenerMap.get(cacheKey);
    if (!eventListener) {
      eventListener = this.createEventListener(eventTarget, eventName, eventOptions);
      eventListenerMap.set(cacheKey, eventListener);
    }
    return eventListener;
  }
  createEventListener(eventTarget, eventName, eventOptions) {
    const eventListener = new EventListener(eventTarget, eventName, eventOptions);
    if (this.started) {
      eventListener.connect();
    }
    return eventListener;
  }
  fetchEventListenerMapForEventTarget(eventTarget) {
    let eventListenerMap = this.eventListenerMaps.get(eventTarget);
    if (!eventListenerMap) {
      eventListenerMap = /* @__PURE__ */ new Map();
      this.eventListenerMaps.set(eventTarget, eventListenerMap);
    }
    return eventListenerMap;
  }
  cacheKey(eventName, eventOptions) {
    const parts = [eventName];
    Object.keys(eventOptions).sort().forEach((key) => {
      parts.push(`${eventOptions[key] ? "" : "!"}${key}`);
    });
    return parts.join(":");
  }
};
var defaultActionDescriptorFilters = {
  stop({ event, value }) {
    if (value)
      event.stopPropagation();
    return true;
  },
  prevent({ event, value }) {
    if (value)
      event.preventDefault();
    return true;
  },
  self({ event, value, element }) {
    if (value) {
      return element === event.target;
    } else {
      return true;
    }
  }
};
var descriptorPattern = /^(?:(?:([^.]+?)\+)?(.+?)(?:\.(.+?))?(?:@(window|document))?->)?(.+?)(?:#([^:]+?))(?::(.+))?$/;
function parseActionDescriptorString(descriptorString) {
  const source = descriptorString.trim();
  const matches = source.match(descriptorPattern) || [];
  let eventName = matches[2];
  let keyFilter = matches[3];
  if (keyFilter && !["keydown", "keyup", "keypress"].includes(eventName)) {
    eventName += `.${keyFilter}`;
    keyFilter = "";
  }
  return {
    eventTarget: parseEventTarget(matches[4]),
    eventName,
    eventOptions: matches[7] ? parseEventOptions(matches[7]) : {},
    identifier: matches[5],
    methodName: matches[6],
    keyFilter: matches[1] || keyFilter
  };
}
function parseEventTarget(eventTargetName) {
  if (eventTargetName == "window") {
    return window;
  } else if (eventTargetName == "document") {
    return document;
  }
}
function parseEventOptions(eventOptions) {
  return eventOptions.split(":").reduce((options, token) => Object.assign(options, { [token.replace(/^!/, "")]: !/^!/.test(token) }), {});
}
function stringifyEventTarget(eventTarget) {
  if (eventTarget == window) {
    return "window";
  } else if (eventTarget == document) {
    return "document";
  }
}
function camelize(value) {
  return value.replace(/(?:[_-])([a-z0-9])/g, (_, char) => char.toUpperCase());
}
function namespaceCamelize(value) {
  return camelize(value.replace(/--/g, "-").replace(/__/g, "_"));
}
function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
function dasherize(value) {
  return value.replace(/([A-Z])/g, (_, char) => `-${char.toLowerCase()}`);
}
function tokenize(value) {
  return value.match(/[^\s]+/g) || [];
}
function isSomething(object) {
  return object !== null && object !== void 0;
}
function hasProperty(object, property) {
  return Object.prototype.hasOwnProperty.call(object, property);
}
var allModifiers = ["meta", "ctrl", "alt", "shift"];
var Action = class {
  constructor(element, index, descriptor, schema) {
    this.element = element;
    this.index = index;
    this.eventTarget = descriptor.eventTarget || element;
    this.eventName = descriptor.eventName || getDefaultEventNameForElement(element) || error("missing event name");
    this.eventOptions = descriptor.eventOptions || {};
    this.identifier = descriptor.identifier || error("missing identifier");
    this.methodName = descriptor.methodName || error("missing method name");
    this.keyFilter = descriptor.keyFilter || "";
    this.schema = schema;
  }
  static forToken(token, schema) {
    return new this(token.element, token.index, parseActionDescriptorString(token.content), schema);
  }
  toString() {
    const eventFilter = this.keyFilter ? `.${this.keyFilter}` : "";
    const eventTarget = this.eventTargetName ? `@${this.eventTargetName}` : "";
    return `${this.eventName}${eventFilter}${eventTarget}->${this.identifier}#${this.methodName}`;
  }
  shouldIgnoreKeyboardEvent(event) {
    if (!this.keyFilter) {
      return false;
    }
    const filters = this.keyFilter.split("+");
    if (this.keyFilterDissatisfied(event, filters)) {
      return true;
    }
    const standardFilter = filters.filter((key) => !allModifiers.includes(key))[0];
    if (!standardFilter) {
      return false;
    }
    if (!hasProperty(this.keyMappings, standardFilter)) {
      error(`contains unknown key filter: ${this.keyFilter}`);
    }
    return this.keyMappings[standardFilter].toLowerCase() !== event.key.toLowerCase();
  }
  shouldIgnoreMouseEvent(event) {
    if (!this.keyFilter) {
      return false;
    }
    const filters = [this.keyFilter];
    if (this.keyFilterDissatisfied(event, filters)) {
      return true;
    }
    return false;
  }
  get params() {
    const params = {};
    const pattern = new RegExp(`^data-${this.identifier}-(.+)-param$`, "i");
    for (const { name, value } of Array.from(this.element.attributes)) {
      const match = name.match(pattern);
      const key = match && match[1];
      if (key) {
        params[camelize(key)] = typecast(value);
      }
    }
    return params;
  }
  get eventTargetName() {
    return stringifyEventTarget(this.eventTarget);
  }
  get keyMappings() {
    return this.schema.keyMappings;
  }
  keyFilterDissatisfied(event, filters) {
    const [meta, ctrl, alt, shift] = allModifiers.map((modifier) => filters.includes(modifier));
    return event.metaKey !== meta || event.ctrlKey !== ctrl || event.altKey !== alt || event.shiftKey !== shift;
  }
};
var defaultEventNames = {
  a: () => "click",
  button: () => "click",
  form: () => "submit",
  details: () => "toggle",
  input: (e) => e.getAttribute("type") == "submit" ? "click" : "input",
  select: () => "change",
  textarea: () => "input"
};
function getDefaultEventNameForElement(element) {
  const tagName = element.tagName.toLowerCase();
  if (tagName in defaultEventNames) {
    return defaultEventNames[tagName](element);
  }
}
function error(message) {
  throw new Error(message);
}
function typecast(value) {
  try {
    return JSON.parse(value);
  } catch (o_O) {
    return value;
  }
}
var Binding = class {
  constructor(context, action) {
    this.context = context;
    this.action = action;
  }
  get index() {
    return this.action.index;
  }
  get eventTarget() {
    return this.action.eventTarget;
  }
  get eventOptions() {
    return this.action.eventOptions;
  }
  get identifier() {
    return this.context.identifier;
  }
  handleEvent(event) {
    const actionEvent = this.prepareActionEvent(event);
    if (this.willBeInvokedByEvent(event) && this.applyEventModifiers(actionEvent)) {
      this.invokeWithEvent(actionEvent);
    }
  }
  get eventName() {
    return this.action.eventName;
  }
  get method() {
    const method = this.controller[this.methodName];
    if (typeof method == "function") {
      return method;
    }
    throw new Error(`Action "${this.action}" references undefined method "${this.methodName}"`);
  }
  applyEventModifiers(event) {
    const { element } = this.action;
    const { actionDescriptorFilters } = this.context.application;
    const { controller } = this.context;
    let passes = true;
    for (const [name, value] of Object.entries(this.eventOptions)) {
      if (name in actionDescriptorFilters) {
        const filter = actionDescriptorFilters[name];
        passes = passes && filter({ name, value, event, element, controller });
      } else {
        continue;
      }
    }
    return passes;
  }
  prepareActionEvent(event) {
    return Object.assign(event, { params: this.action.params });
  }
  invokeWithEvent(event) {
    const { target, currentTarget } = event;
    try {
      this.method.call(this.controller, event);
      this.context.logDebugActivity(this.methodName, { event, target, currentTarget, action: this.methodName });
    } catch (error2) {
      const { identifier, controller, element, index } = this;
      const detail = { identifier, controller, element, index, event };
      this.context.handleError(error2, `invoking action "${this.action}"`, detail);
    }
  }
  willBeInvokedByEvent(event) {
    const eventTarget = event.target;
    if (event instanceof KeyboardEvent && this.action.shouldIgnoreKeyboardEvent(event)) {
      return false;
    }
    if (event instanceof MouseEvent && this.action.shouldIgnoreMouseEvent(event)) {
      return false;
    }
    if (this.element === eventTarget) {
      return true;
    } else if (eventTarget instanceof Element && this.element.contains(eventTarget)) {
      return this.scope.containsElement(eventTarget);
    } else {
      return this.scope.containsElement(this.action.element);
    }
  }
  get controller() {
    return this.context.controller;
  }
  get methodName() {
    return this.action.methodName;
  }
  get element() {
    return this.scope.element;
  }
  get scope() {
    return this.context.scope;
  }
};
var ElementObserver = class {
  constructor(element, delegate) {
    this.mutationObserverInit = { attributes: true, childList: true, subtree: true };
    this.element = element;
    this.started = false;
    this.delegate = delegate;
    this.elements = /* @__PURE__ */ new Set();
    this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
  }
  start() {
    if (!this.started) {
      this.started = true;
      this.mutationObserver.observe(this.element, this.mutationObserverInit);
      this.refresh();
    }
  }
  pause(callback) {
    if (this.started) {
      this.mutationObserver.disconnect();
      this.started = false;
    }
    callback();
    if (!this.started) {
      this.mutationObserver.observe(this.element, this.mutationObserverInit);
      this.started = true;
    }
  }
  stop() {
    if (this.started) {
      this.mutationObserver.takeRecords();
      this.mutationObserver.disconnect();
      this.started = false;
    }
  }
  refresh() {
    if (this.started) {
      const matches = new Set(this.matchElementsInTree());
      for (const element of Array.from(this.elements)) {
        if (!matches.has(element)) {
          this.removeElement(element);
        }
      }
      for (const element of Array.from(matches)) {
        this.addElement(element);
      }
    }
  }
  processMutations(mutations) {
    if (this.started) {
      for (const mutation of mutations) {
        this.processMutation(mutation);
      }
    }
  }
  processMutation(mutation) {
    if (mutation.type == "attributes") {
      this.processAttributeChange(mutation.target, mutation.attributeName);
    } else if (mutation.type == "childList") {
      this.processRemovedNodes(mutation.removedNodes);
      this.processAddedNodes(mutation.addedNodes);
    }
  }
  processAttributeChange(element, attributeName) {
    if (this.elements.has(element)) {
      if (this.delegate.elementAttributeChanged && this.matchElement(element)) {
        this.delegate.elementAttributeChanged(element, attributeName);
      } else {
        this.removeElement(element);
      }
    } else if (this.matchElement(element)) {
      this.addElement(element);
    }
  }
  processRemovedNodes(nodes) {
    for (const node of Array.from(nodes)) {
      const element = this.elementFromNode(node);
      if (element) {
        this.processTree(element, this.removeElement);
      }
    }
  }
  processAddedNodes(nodes) {
    for (const node of Array.from(nodes)) {
      const element = this.elementFromNode(node);
      if (element && this.elementIsActive(element)) {
        this.processTree(element, this.addElement);
      }
    }
  }
  matchElement(element) {
    return this.delegate.matchElement(element);
  }
  matchElementsInTree(tree = this.element) {
    return this.delegate.matchElementsInTree(tree);
  }
  processTree(tree, processor) {
    for (const element of this.matchElementsInTree(tree)) {
      processor.call(this, element);
    }
  }
  elementFromNode(node) {
    if (node.nodeType == Node.ELEMENT_NODE) {
      return node;
    }
  }
  elementIsActive(element) {
    if (element.isConnected != this.element.isConnected) {
      return false;
    } else {
      return this.element.contains(element);
    }
  }
  addElement(element) {
    if (!this.elements.has(element)) {
      if (this.elementIsActive(element)) {
        this.elements.add(element);
        if (this.delegate.elementMatched) {
          this.delegate.elementMatched(element);
        }
      }
    }
  }
  removeElement(element) {
    if (this.elements.has(element)) {
      this.elements.delete(element);
      if (this.delegate.elementUnmatched) {
        this.delegate.elementUnmatched(element);
      }
    }
  }
};
var AttributeObserver = class {
  constructor(element, attributeName, delegate) {
    this.attributeName = attributeName;
    this.delegate = delegate;
    this.elementObserver = new ElementObserver(element, this);
  }
  get element() {
    return this.elementObserver.element;
  }
  get selector() {
    return `[${this.attributeName}]`;
  }
  start() {
    this.elementObserver.start();
  }
  pause(callback) {
    this.elementObserver.pause(callback);
  }
  stop() {
    this.elementObserver.stop();
  }
  refresh() {
    this.elementObserver.refresh();
  }
  get started() {
    return this.elementObserver.started;
  }
  matchElement(element) {
    return element.hasAttribute(this.attributeName);
  }
  matchElementsInTree(tree) {
    const match = this.matchElement(tree) ? [tree] : [];
    const matches = Array.from(tree.querySelectorAll(this.selector));
    return match.concat(matches);
  }
  elementMatched(element) {
    if (this.delegate.elementMatchedAttribute) {
      this.delegate.elementMatchedAttribute(element, this.attributeName);
    }
  }
  elementUnmatched(element) {
    if (this.delegate.elementUnmatchedAttribute) {
      this.delegate.elementUnmatchedAttribute(element, this.attributeName);
    }
  }
  elementAttributeChanged(element, attributeName) {
    if (this.delegate.elementAttributeValueChanged && this.attributeName == attributeName) {
      this.delegate.elementAttributeValueChanged(element, attributeName);
    }
  }
};
function add(map, key, value) {
  fetch(map, key).add(value);
}
function del(map, key, value) {
  fetch(map, key).delete(value);
  prune(map, key);
}
function fetch(map, key) {
  let values = map.get(key);
  if (!values) {
    values = /* @__PURE__ */ new Set();
    map.set(key, values);
  }
  return values;
}
function prune(map, key) {
  const values = map.get(key);
  if (values != null && values.size == 0) {
    map.delete(key);
  }
}
var Multimap = class {
  constructor() {
    this.valuesByKey = /* @__PURE__ */ new Map();
  }
  get keys() {
    return Array.from(this.valuesByKey.keys());
  }
  get values() {
    const sets = Array.from(this.valuesByKey.values());
    return sets.reduce((values, set) => values.concat(Array.from(set)), []);
  }
  get size() {
    const sets = Array.from(this.valuesByKey.values());
    return sets.reduce((size, set) => size + set.size, 0);
  }
  add(key, value) {
    add(this.valuesByKey, key, value);
  }
  delete(key, value) {
    del(this.valuesByKey, key, value);
  }
  has(key, value) {
    const values = this.valuesByKey.get(key);
    return values != null && values.has(value);
  }
  hasKey(key) {
    return this.valuesByKey.has(key);
  }
  hasValue(value) {
    const sets = Array.from(this.valuesByKey.values());
    return sets.some((set) => set.has(value));
  }
  getValuesForKey(key) {
    const values = this.valuesByKey.get(key);
    return values ? Array.from(values) : [];
  }
  getKeysForValue(value) {
    return Array.from(this.valuesByKey).filter(([_key, values]) => values.has(value)).map(([key, _values]) => key);
  }
};
var SelectorObserver = class {
  constructor(element, selector, delegate, details) {
    this._selector = selector;
    this.details = details;
    this.elementObserver = new ElementObserver(element, this);
    this.delegate = delegate;
    this.matchesByElement = new Multimap();
  }
  get started() {
    return this.elementObserver.started;
  }
  get selector() {
    return this._selector;
  }
  set selector(selector) {
    this._selector = selector;
    this.refresh();
  }
  start() {
    this.elementObserver.start();
  }
  pause(callback) {
    this.elementObserver.pause(callback);
  }
  stop() {
    this.elementObserver.stop();
  }
  refresh() {
    this.elementObserver.refresh();
  }
  get element() {
    return this.elementObserver.element;
  }
  matchElement(element) {
    const { selector } = this;
    if (selector) {
      const matches = element.matches(selector);
      if (this.delegate.selectorMatchElement) {
        return matches && this.delegate.selectorMatchElement(element, this.details);
      }
      return matches;
    } else {
      return false;
    }
  }
  matchElementsInTree(tree) {
    const { selector } = this;
    if (selector) {
      const match = this.matchElement(tree) ? [tree] : [];
      const matches = Array.from(tree.querySelectorAll(selector)).filter((match2) => this.matchElement(match2));
      return match.concat(matches);
    } else {
      return [];
    }
  }
  elementMatched(element) {
    const { selector } = this;
    if (selector) {
      this.selectorMatched(element, selector);
    }
  }
  elementUnmatched(element) {
    const selectors = this.matchesByElement.getKeysForValue(element);
    for (const selector of selectors) {
      this.selectorUnmatched(element, selector);
    }
  }
  elementAttributeChanged(element, _attributeName) {
    const { selector } = this;
    if (selector) {
      const matches = this.matchElement(element);
      const matchedBefore = this.matchesByElement.has(selector, element);
      if (matches && !matchedBefore) {
        this.selectorMatched(element, selector);
      } else if (!matches && matchedBefore) {
        this.selectorUnmatched(element, selector);
      }
    }
  }
  selectorMatched(element, selector) {
    this.delegate.selectorMatched(element, selector, this.details);
    this.matchesByElement.add(selector, element);
  }
  selectorUnmatched(element, selector) {
    this.delegate.selectorUnmatched(element, selector, this.details);
    this.matchesByElement.delete(selector, element);
  }
};
var StringMapObserver = class {
  constructor(element, delegate) {
    this.element = element;
    this.delegate = delegate;
    this.started = false;
    this.stringMap = /* @__PURE__ */ new Map();
    this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
  }
  start() {
    if (!this.started) {
      this.started = true;
      this.mutationObserver.observe(this.element, { attributes: true, attributeOldValue: true });
      this.refresh();
    }
  }
  stop() {
    if (this.started) {
      this.mutationObserver.takeRecords();
      this.mutationObserver.disconnect();
      this.started = false;
    }
  }
  refresh() {
    if (this.started) {
      for (const attributeName of this.knownAttributeNames) {
        this.refreshAttribute(attributeName, null);
      }
    }
  }
  processMutations(mutations) {
    if (this.started) {
      for (const mutation of mutations) {
        this.processMutation(mutation);
      }
    }
  }
  processMutation(mutation) {
    const attributeName = mutation.attributeName;
    if (attributeName) {
      this.refreshAttribute(attributeName, mutation.oldValue);
    }
  }
  refreshAttribute(attributeName, oldValue) {
    const key = this.delegate.getStringMapKeyForAttribute(attributeName);
    if (key != null) {
      if (!this.stringMap.has(attributeName)) {
        this.stringMapKeyAdded(key, attributeName);
      }
      const value = this.element.getAttribute(attributeName);
      if (this.stringMap.get(attributeName) != value) {
        this.stringMapValueChanged(value, key, oldValue);
      }
      if (value == null) {
        const oldValue2 = this.stringMap.get(attributeName);
        this.stringMap.delete(attributeName);
        if (oldValue2)
          this.stringMapKeyRemoved(key, attributeName, oldValue2);
      } else {
        this.stringMap.set(attributeName, value);
      }
    }
  }
  stringMapKeyAdded(key, attributeName) {
    if (this.delegate.stringMapKeyAdded) {
      this.delegate.stringMapKeyAdded(key, attributeName);
    }
  }
  stringMapValueChanged(value, key, oldValue) {
    if (this.delegate.stringMapValueChanged) {
      this.delegate.stringMapValueChanged(value, key, oldValue);
    }
  }
  stringMapKeyRemoved(key, attributeName, oldValue) {
    if (this.delegate.stringMapKeyRemoved) {
      this.delegate.stringMapKeyRemoved(key, attributeName, oldValue);
    }
  }
  get knownAttributeNames() {
    return Array.from(new Set(this.currentAttributeNames.concat(this.recordedAttributeNames)));
  }
  get currentAttributeNames() {
    return Array.from(this.element.attributes).map((attribute) => attribute.name);
  }
  get recordedAttributeNames() {
    return Array.from(this.stringMap.keys());
  }
};
var TokenListObserver = class {
  constructor(element, attributeName, delegate) {
    this.attributeObserver = new AttributeObserver(element, attributeName, this);
    this.delegate = delegate;
    this.tokensByElement = new Multimap();
  }
  get started() {
    return this.attributeObserver.started;
  }
  start() {
    this.attributeObserver.start();
  }
  pause(callback) {
    this.attributeObserver.pause(callback);
  }
  stop() {
    this.attributeObserver.stop();
  }
  refresh() {
    this.attributeObserver.refresh();
  }
  get element() {
    return this.attributeObserver.element;
  }
  get attributeName() {
    return this.attributeObserver.attributeName;
  }
  elementMatchedAttribute(element) {
    this.tokensMatched(this.readTokensForElement(element));
  }
  elementAttributeValueChanged(element) {
    const [unmatchedTokens, matchedTokens] = this.refreshTokensForElement(element);
    this.tokensUnmatched(unmatchedTokens);
    this.tokensMatched(matchedTokens);
  }
  elementUnmatchedAttribute(element) {
    this.tokensUnmatched(this.tokensByElement.getValuesForKey(element));
  }
  tokensMatched(tokens) {
    tokens.forEach((token) => this.tokenMatched(token));
  }
  tokensUnmatched(tokens) {
    tokens.forEach((token) => this.tokenUnmatched(token));
  }
  tokenMatched(token) {
    this.delegate.tokenMatched(token);
    this.tokensByElement.add(token.element, token);
  }
  tokenUnmatched(token) {
    this.delegate.tokenUnmatched(token);
    this.tokensByElement.delete(token.element, token);
  }
  refreshTokensForElement(element) {
    const previousTokens = this.tokensByElement.getValuesForKey(element);
    const currentTokens = this.readTokensForElement(element);
    const firstDifferingIndex = zip(previousTokens, currentTokens).findIndex(([previousToken, currentToken]) => !tokensAreEqual(previousToken, currentToken));
    if (firstDifferingIndex == -1) {
      return [[], []];
    } else {
      return [previousTokens.slice(firstDifferingIndex), currentTokens.slice(firstDifferingIndex)];
    }
  }
  readTokensForElement(element) {
    const attributeName = this.attributeName;
    const tokenString = element.getAttribute(attributeName) || "";
    return parseTokenString(tokenString, element, attributeName);
  }
};
function parseTokenString(tokenString, element, attributeName) {
  return tokenString.trim().split(/\s+/).filter((content) => content.length).map((content, index) => ({ element, attributeName, content, index }));
}
function zip(left, right) {
  const length = Math.max(left.length, right.length);
  return Array.from({ length }, (_, index) => [left[index], right[index]]);
}
function tokensAreEqual(left, right) {
  return left && right && left.index == right.index && left.content == right.content;
}
var ValueListObserver = class {
  constructor(element, attributeName, delegate) {
    this.tokenListObserver = new TokenListObserver(element, attributeName, this);
    this.delegate = delegate;
    this.parseResultsByToken = /* @__PURE__ */ new WeakMap();
    this.valuesByTokenByElement = /* @__PURE__ */ new WeakMap();
  }
  get started() {
    return this.tokenListObserver.started;
  }
  start() {
    this.tokenListObserver.start();
  }
  stop() {
    this.tokenListObserver.stop();
  }
  refresh() {
    this.tokenListObserver.refresh();
  }
  get element() {
    return this.tokenListObserver.element;
  }
  get attributeName() {
    return this.tokenListObserver.attributeName;
  }
  tokenMatched(token) {
    const { element } = token;
    const { value } = this.fetchParseResultForToken(token);
    if (value) {
      this.fetchValuesByTokenForElement(element).set(token, value);
      this.delegate.elementMatchedValue(element, value);
    }
  }
  tokenUnmatched(token) {
    const { element } = token;
    const { value } = this.fetchParseResultForToken(token);
    if (value) {
      this.fetchValuesByTokenForElement(element).delete(token);
      this.delegate.elementUnmatchedValue(element, value);
    }
  }
  fetchParseResultForToken(token) {
    let parseResult = this.parseResultsByToken.get(token);
    if (!parseResult) {
      parseResult = this.parseToken(token);
      this.parseResultsByToken.set(token, parseResult);
    }
    return parseResult;
  }
  fetchValuesByTokenForElement(element) {
    let valuesByToken = this.valuesByTokenByElement.get(element);
    if (!valuesByToken) {
      valuesByToken = /* @__PURE__ */ new Map();
      this.valuesByTokenByElement.set(element, valuesByToken);
    }
    return valuesByToken;
  }
  parseToken(token) {
    try {
      const value = this.delegate.parseValueForToken(token);
      return { value };
    } catch (error2) {
      return { error: error2 };
    }
  }
};
var BindingObserver = class {
  constructor(context, delegate) {
    this.context = context;
    this.delegate = delegate;
    this.bindingsByAction = /* @__PURE__ */ new Map();
  }
  start() {
    if (!this.valueListObserver) {
      this.valueListObserver = new ValueListObserver(this.element, this.actionAttribute, this);
      this.valueListObserver.start();
    }
  }
  stop() {
    if (this.valueListObserver) {
      this.valueListObserver.stop();
      delete this.valueListObserver;
      this.disconnectAllActions();
    }
  }
  get element() {
    return this.context.element;
  }
  get identifier() {
    return this.context.identifier;
  }
  get actionAttribute() {
    return this.schema.actionAttribute;
  }
  get schema() {
    return this.context.schema;
  }
  get bindings() {
    return Array.from(this.bindingsByAction.values());
  }
  connectAction(action) {
    const binding = new Binding(this.context, action);
    this.bindingsByAction.set(action, binding);
    this.delegate.bindingConnected(binding);
  }
  disconnectAction(action) {
    const binding = this.bindingsByAction.get(action);
    if (binding) {
      this.bindingsByAction.delete(action);
      this.delegate.bindingDisconnected(binding);
    }
  }
  disconnectAllActions() {
    this.bindings.forEach((binding) => this.delegate.bindingDisconnected(binding, true));
    this.bindingsByAction.clear();
  }
  parseValueForToken(token) {
    const action = Action.forToken(token, this.schema);
    if (action.identifier == this.identifier) {
      return action;
    }
  }
  elementMatchedValue(element, action) {
    this.connectAction(action);
  }
  elementUnmatchedValue(element, action) {
    this.disconnectAction(action);
  }
};
var ValueObserver = class {
  constructor(context, receiver) {
    this.context = context;
    this.receiver = receiver;
    this.stringMapObserver = new StringMapObserver(this.element, this);
    this.valueDescriptorMap = this.controller.valueDescriptorMap;
  }
  start() {
    this.stringMapObserver.start();
    this.invokeChangedCallbacksForDefaultValues();
  }
  stop() {
    this.stringMapObserver.stop();
  }
  get element() {
    return this.context.element;
  }
  get controller() {
    return this.context.controller;
  }
  getStringMapKeyForAttribute(attributeName) {
    if (attributeName in this.valueDescriptorMap) {
      return this.valueDescriptorMap[attributeName].name;
    }
  }
  stringMapKeyAdded(key, attributeName) {
    const descriptor = this.valueDescriptorMap[attributeName];
    if (!this.hasValue(key)) {
      this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), descriptor.writer(descriptor.defaultValue));
    }
  }
  stringMapValueChanged(value, name, oldValue) {
    const descriptor = this.valueDescriptorNameMap[name];
    if (value === null)
      return;
    if (oldValue === null) {
      oldValue = descriptor.writer(descriptor.defaultValue);
    }
    this.invokeChangedCallback(name, value, oldValue);
  }
  stringMapKeyRemoved(key, attributeName, oldValue) {
    const descriptor = this.valueDescriptorNameMap[key];
    if (this.hasValue(key)) {
      this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), oldValue);
    } else {
      this.invokeChangedCallback(key, descriptor.writer(descriptor.defaultValue), oldValue);
    }
  }
  invokeChangedCallbacksForDefaultValues() {
    for (const { key, name, defaultValue, writer } of this.valueDescriptors) {
      if (defaultValue != void 0 && !this.controller.data.has(key)) {
        this.invokeChangedCallback(name, writer(defaultValue), void 0);
      }
    }
  }
  invokeChangedCallback(name, rawValue, rawOldValue) {
    const changedMethodName = `${name}Changed`;
    const changedMethod = this.receiver[changedMethodName];
    if (typeof changedMethod == "function") {
      const descriptor = this.valueDescriptorNameMap[name];
      try {
        const value = descriptor.reader(rawValue);
        let oldValue = rawOldValue;
        if (rawOldValue) {
          oldValue = descriptor.reader(rawOldValue);
        }
        changedMethod.call(this.receiver, value, oldValue);
      } catch (error2) {
        if (error2 instanceof TypeError) {
          error2.message = `Stimulus Value "${this.context.identifier}.${descriptor.name}" - ${error2.message}`;
        }
        throw error2;
      }
    }
  }
  get valueDescriptors() {
    const { valueDescriptorMap } = this;
    return Object.keys(valueDescriptorMap).map((key) => valueDescriptorMap[key]);
  }
  get valueDescriptorNameMap() {
    const descriptors = {};
    Object.keys(this.valueDescriptorMap).forEach((key) => {
      const descriptor = this.valueDescriptorMap[key];
      descriptors[descriptor.name] = descriptor;
    });
    return descriptors;
  }
  hasValue(attributeName) {
    const descriptor = this.valueDescriptorNameMap[attributeName];
    const hasMethodName = `has${capitalize(descriptor.name)}`;
    return this.receiver[hasMethodName];
  }
};
var TargetObserver = class {
  constructor(context, delegate) {
    this.context = context;
    this.delegate = delegate;
    this.targetsByName = new Multimap();
  }
  start() {
    if (!this.tokenListObserver) {
      this.tokenListObserver = new TokenListObserver(this.element, this.attributeName, this);
      this.tokenListObserver.start();
    }
  }
  stop() {
    if (this.tokenListObserver) {
      this.disconnectAllTargets();
      this.tokenListObserver.stop();
      delete this.tokenListObserver;
    }
  }
  tokenMatched({ element, content: name }) {
    if (this.scope.containsElement(element)) {
      this.connectTarget(element, name);
    }
  }
  tokenUnmatched({ element, content: name }) {
    this.disconnectTarget(element, name);
  }
  connectTarget(element, name) {
    var _a;
    if (!this.targetsByName.has(name, element)) {
      this.targetsByName.add(name, element);
      (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetConnected(element, name));
    }
  }
  disconnectTarget(element, name) {
    var _a;
    if (this.targetsByName.has(name, element)) {
      this.targetsByName.delete(name, element);
      (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetDisconnected(element, name));
    }
  }
  disconnectAllTargets() {
    for (const name of this.targetsByName.keys) {
      for (const element of this.targetsByName.getValuesForKey(name)) {
        this.disconnectTarget(element, name);
      }
    }
  }
  get attributeName() {
    return `data-${this.context.identifier}-target`;
  }
  get element() {
    return this.context.element;
  }
  get scope() {
    return this.context.scope;
  }
};
function readInheritableStaticArrayValues(constructor, propertyName) {
  const ancestors = getAncestorsForConstructor(constructor);
  return Array.from(ancestors.reduce((values, constructor2) => {
    getOwnStaticArrayValues(constructor2, propertyName).forEach((name) => values.add(name));
    return values;
  }, /* @__PURE__ */ new Set()));
}
function readInheritableStaticObjectPairs(constructor, propertyName) {
  const ancestors = getAncestorsForConstructor(constructor);
  return ancestors.reduce((pairs, constructor2) => {
    pairs.push(...getOwnStaticObjectPairs(constructor2, propertyName));
    return pairs;
  }, []);
}
function getAncestorsForConstructor(constructor) {
  const ancestors = [];
  while (constructor) {
    ancestors.push(constructor);
    constructor = Object.getPrototypeOf(constructor);
  }
  return ancestors.reverse();
}
function getOwnStaticArrayValues(constructor, propertyName) {
  const definition = constructor[propertyName];
  return Array.isArray(definition) ? definition : [];
}
function getOwnStaticObjectPairs(constructor, propertyName) {
  const definition = constructor[propertyName];
  return definition ? Object.keys(definition).map((key) => [key, definition[key]]) : [];
}
var OutletObserver = class {
  constructor(context, delegate) {
    this.started = false;
    this.context = context;
    this.delegate = delegate;
    this.outletsByName = new Multimap();
    this.outletElementsByName = new Multimap();
    this.selectorObserverMap = /* @__PURE__ */ new Map();
    this.attributeObserverMap = /* @__PURE__ */ new Map();
  }
  start() {
    if (!this.started) {
      this.outletDefinitions.forEach((outletName) => {
        this.setupSelectorObserverForOutlet(outletName);
        this.setupAttributeObserverForOutlet(outletName);
      });
      this.started = true;
      this.dependentContexts.forEach((context) => context.refresh());
    }
  }
  refresh() {
    this.selectorObserverMap.forEach((observer) => observer.refresh());
    this.attributeObserverMap.forEach((observer) => observer.refresh());
  }
  stop() {
    if (this.started) {
      this.started = false;
      this.disconnectAllOutlets();
      this.stopSelectorObservers();
      this.stopAttributeObservers();
    }
  }
  stopSelectorObservers() {
    if (this.selectorObserverMap.size > 0) {
      this.selectorObserverMap.forEach((observer) => observer.stop());
      this.selectorObserverMap.clear();
    }
  }
  stopAttributeObservers() {
    if (this.attributeObserverMap.size > 0) {
      this.attributeObserverMap.forEach((observer) => observer.stop());
      this.attributeObserverMap.clear();
    }
  }
  selectorMatched(element, _selector, { outletName }) {
    const outlet = this.getOutlet(element, outletName);
    if (outlet) {
      this.connectOutlet(outlet, element, outletName);
    }
  }
  selectorUnmatched(element, _selector, { outletName }) {
    const outlet = this.getOutletFromMap(element, outletName);
    if (outlet) {
      this.disconnectOutlet(outlet, element, outletName);
    }
  }
  selectorMatchElement(element, { outletName }) {
    const selector = this.selector(outletName);
    const hasOutlet = this.hasOutlet(element, outletName);
    const hasOutletController = element.matches(`[${this.schema.controllerAttribute}~=${outletName}]`);
    if (selector) {
      return hasOutlet && hasOutletController && element.matches(selector);
    } else {
      return false;
    }
  }
  elementMatchedAttribute(_element, attributeName) {
    const outletName = this.getOutletNameFromOutletAttributeName(attributeName);
    if (outletName) {
      this.updateSelectorObserverForOutlet(outletName);
    }
  }
  elementAttributeValueChanged(_element, attributeName) {
    const outletName = this.getOutletNameFromOutletAttributeName(attributeName);
    if (outletName) {
      this.updateSelectorObserverForOutlet(outletName);
    }
  }
  elementUnmatchedAttribute(_element, attributeName) {
    const outletName = this.getOutletNameFromOutletAttributeName(attributeName);
    if (outletName) {
      this.updateSelectorObserverForOutlet(outletName);
    }
  }
  connectOutlet(outlet, element, outletName) {
    var _a;
    if (!this.outletElementsByName.has(outletName, element)) {
      this.outletsByName.add(outletName, outlet);
      this.outletElementsByName.add(outletName, element);
      (_a = this.selectorObserverMap.get(outletName)) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.outletConnected(outlet, element, outletName));
    }
  }
  disconnectOutlet(outlet, element, outletName) {
    var _a;
    if (this.outletElementsByName.has(outletName, element)) {
      this.outletsByName.delete(outletName, outlet);
      this.outletElementsByName.delete(outletName, element);
      (_a = this.selectorObserverMap.get(outletName)) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.outletDisconnected(outlet, element, outletName));
    }
  }
  disconnectAllOutlets() {
    for (const outletName of this.outletElementsByName.keys) {
      for (const element of this.outletElementsByName.getValuesForKey(outletName)) {
        for (const outlet of this.outletsByName.getValuesForKey(outletName)) {
          this.disconnectOutlet(outlet, element, outletName);
        }
      }
    }
  }
  updateSelectorObserverForOutlet(outletName) {
    const observer = this.selectorObserverMap.get(outletName);
    if (observer) {
      observer.selector = this.selector(outletName);
    }
  }
  setupSelectorObserverForOutlet(outletName) {
    const selector = this.selector(outletName);
    const selectorObserver = new SelectorObserver(document.body, selector, this, { outletName });
    this.selectorObserverMap.set(outletName, selectorObserver);
    selectorObserver.start();
  }
  setupAttributeObserverForOutlet(outletName) {
    const attributeName = this.attributeNameForOutletName(outletName);
    const attributeObserver = new AttributeObserver(this.scope.element, attributeName, this);
    this.attributeObserverMap.set(outletName, attributeObserver);
    attributeObserver.start();
  }
  selector(outletName) {
    return this.scope.outlets.getSelectorForOutletName(outletName);
  }
  attributeNameForOutletName(outletName) {
    return this.scope.schema.outletAttributeForScope(this.identifier, outletName);
  }
  getOutletNameFromOutletAttributeName(attributeName) {
    return this.outletDefinitions.find((outletName) => this.attributeNameForOutletName(outletName) === attributeName);
  }
  get outletDependencies() {
    const dependencies = new Multimap();
    this.router.modules.forEach((module) => {
      const constructor = module.definition.controllerConstructor;
      const outlets = readInheritableStaticArrayValues(constructor, "outlets");
      outlets.forEach((outlet) => dependencies.add(outlet, module.identifier));
    });
    return dependencies;
  }
  get outletDefinitions() {
    return this.outletDependencies.getKeysForValue(this.identifier);
  }
  get dependentControllerIdentifiers() {
    return this.outletDependencies.getValuesForKey(this.identifier);
  }
  get dependentContexts() {
    const identifiers = this.dependentControllerIdentifiers;
    return this.router.contexts.filter((context) => identifiers.includes(context.identifier));
  }
  hasOutlet(element, outletName) {
    return !!this.getOutlet(element, outletName) || !!this.getOutletFromMap(element, outletName);
  }
  getOutlet(element, outletName) {
    return this.application.getControllerForElementAndIdentifier(element, outletName);
  }
  getOutletFromMap(element, outletName) {
    return this.outletsByName.getValuesForKey(outletName).find((outlet) => outlet.element === element);
  }
  get scope() {
    return this.context.scope;
  }
  get schema() {
    return this.context.schema;
  }
  get identifier() {
    return this.context.identifier;
  }
  get application() {
    return this.context.application;
  }
  get router() {
    return this.application.router;
  }
};
var Context = class {
  constructor(module, scope) {
    this.logDebugActivity = (functionName, detail = {}) => {
      const { identifier, controller, element } = this;
      detail = Object.assign({ identifier, controller, element }, detail);
      this.application.logDebugActivity(this.identifier, functionName, detail);
    };
    this.module = module;
    this.scope = scope;
    this.controller = new module.controllerConstructor(this);
    this.bindingObserver = new BindingObserver(this, this.dispatcher);
    this.valueObserver = new ValueObserver(this, this.controller);
    this.targetObserver = new TargetObserver(this, this);
    this.outletObserver = new OutletObserver(this, this);
    try {
      this.controller.initialize();
      this.logDebugActivity("initialize");
    } catch (error2) {
      this.handleError(error2, "initializing controller");
    }
  }
  connect() {
    this.bindingObserver.start();
    this.valueObserver.start();
    this.targetObserver.start();
    this.outletObserver.start();
    try {
      this.controller.connect();
      this.logDebugActivity("connect");
    } catch (error2) {
      this.handleError(error2, "connecting controller");
    }
  }
  refresh() {
    this.outletObserver.refresh();
  }
  disconnect() {
    try {
      this.controller.disconnect();
      this.logDebugActivity("disconnect");
    } catch (error2) {
      this.handleError(error2, "disconnecting controller");
    }
    this.outletObserver.stop();
    this.targetObserver.stop();
    this.valueObserver.stop();
    this.bindingObserver.stop();
  }
  get application() {
    return this.module.application;
  }
  get identifier() {
    return this.module.identifier;
  }
  get schema() {
    return this.application.schema;
  }
  get dispatcher() {
    return this.application.dispatcher;
  }
  get element() {
    return this.scope.element;
  }
  get parentElement() {
    return this.element.parentElement;
  }
  handleError(error2, message, detail = {}) {
    const { identifier, controller, element } = this;
    detail = Object.assign({ identifier, controller, element }, detail);
    this.application.handleError(error2, `Error ${message}`, detail);
  }
  targetConnected(element, name) {
    this.invokeControllerMethod(`${name}TargetConnected`, element);
  }
  targetDisconnected(element, name) {
    this.invokeControllerMethod(`${name}TargetDisconnected`, element);
  }
  outletConnected(outlet, element, name) {
    this.invokeControllerMethod(`${namespaceCamelize(name)}OutletConnected`, outlet, element);
  }
  outletDisconnected(outlet, element, name) {
    this.invokeControllerMethod(`${namespaceCamelize(name)}OutletDisconnected`, outlet, element);
  }
  invokeControllerMethod(methodName, ...args) {
    const controller = this.controller;
    if (typeof controller[methodName] == "function") {
      controller[methodName](...args);
    }
  }
};
function bless(constructor) {
  return shadow(constructor, getBlessedProperties(constructor));
}
function shadow(constructor, properties) {
  const shadowConstructor = extend2(constructor);
  const shadowProperties = getShadowProperties(constructor.prototype, properties);
  Object.defineProperties(shadowConstructor.prototype, shadowProperties);
  return shadowConstructor;
}
function getBlessedProperties(constructor) {
  const blessings = readInheritableStaticArrayValues(constructor, "blessings");
  return blessings.reduce((blessedProperties, blessing) => {
    const properties = blessing(constructor);
    for (const key in properties) {
      const descriptor = blessedProperties[key] || {};
      blessedProperties[key] = Object.assign(descriptor, properties[key]);
    }
    return blessedProperties;
  }, {});
}
function getShadowProperties(prototype, properties) {
  return getOwnKeys(properties).reduce((shadowProperties, key) => {
    const descriptor = getShadowedDescriptor(prototype, properties, key);
    if (descriptor) {
      Object.assign(shadowProperties, { [key]: descriptor });
    }
    return shadowProperties;
  }, {});
}
function getShadowedDescriptor(prototype, properties, key) {
  const shadowingDescriptor = Object.getOwnPropertyDescriptor(prototype, key);
  const shadowedByValue = shadowingDescriptor && "value" in shadowingDescriptor;
  if (!shadowedByValue) {
    const descriptor = Object.getOwnPropertyDescriptor(properties, key).value;
    if (shadowingDescriptor) {
      descriptor.get = shadowingDescriptor.get || descriptor.get;
      descriptor.set = shadowingDescriptor.set || descriptor.set;
    }
    return descriptor;
  }
}
var getOwnKeys = (() => {
  if (typeof Object.getOwnPropertySymbols == "function") {
    return (object) => [...Object.getOwnPropertyNames(object), ...Object.getOwnPropertySymbols(object)];
  } else {
    return Object.getOwnPropertyNames;
  }
})();
var extend2 = (() => {
  function extendWithReflect(constructor) {
    function extended() {
      return Reflect.construct(constructor, arguments, new.target);
    }
    extended.prototype = Object.create(constructor.prototype, {
      constructor: { value: extended }
    });
    Reflect.setPrototypeOf(extended, constructor);
    return extended;
  }
  function testReflectExtension() {
    const a = function() {
      this.a.call(this);
    };
    const b = extendWithReflect(a);
    b.prototype.a = function() {
    };
    return new b();
  }
  try {
    testReflectExtension();
    return extendWithReflect;
  } catch (error2) {
    return (constructor) => class extended extends constructor {
    };
  }
})();
function blessDefinition(definition) {
  return {
    identifier: definition.identifier,
    controllerConstructor: bless(definition.controllerConstructor)
  };
}
var Module = class {
  constructor(application2, definition) {
    this.application = application2;
    this.definition = blessDefinition(definition);
    this.contextsByScope = /* @__PURE__ */ new WeakMap();
    this.connectedContexts = /* @__PURE__ */ new Set();
  }
  get identifier() {
    return this.definition.identifier;
  }
  get controllerConstructor() {
    return this.definition.controllerConstructor;
  }
  get contexts() {
    return Array.from(this.connectedContexts);
  }
  connectContextForScope(scope) {
    const context = this.fetchContextForScope(scope);
    this.connectedContexts.add(context);
    context.connect();
  }
  disconnectContextForScope(scope) {
    const context = this.contextsByScope.get(scope);
    if (context) {
      this.connectedContexts.delete(context);
      context.disconnect();
    }
  }
  fetchContextForScope(scope) {
    let context = this.contextsByScope.get(scope);
    if (!context) {
      context = new Context(this, scope);
      this.contextsByScope.set(scope, context);
    }
    return context;
  }
};
var ClassMap = class {
  constructor(scope) {
    this.scope = scope;
  }
  has(name) {
    return this.data.has(this.getDataKey(name));
  }
  get(name) {
    return this.getAll(name)[0];
  }
  getAll(name) {
    const tokenString = this.data.get(this.getDataKey(name)) || "";
    return tokenize(tokenString);
  }
  getAttributeName(name) {
    return this.data.getAttributeNameForKey(this.getDataKey(name));
  }
  getDataKey(name) {
    return `${name}-class`;
  }
  get data() {
    return this.scope.data;
  }
};
var DataMap = class {
  constructor(scope) {
    this.scope = scope;
  }
  get element() {
    return this.scope.element;
  }
  get identifier() {
    return this.scope.identifier;
  }
  get(key) {
    const name = this.getAttributeNameForKey(key);
    return this.element.getAttribute(name);
  }
  set(key, value) {
    const name = this.getAttributeNameForKey(key);
    this.element.setAttribute(name, value);
    return this.get(key);
  }
  has(key) {
    const name = this.getAttributeNameForKey(key);
    return this.element.hasAttribute(name);
  }
  delete(key) {
    if (this.has(key)) {
      const name = this.getAttributeNameForKey(key);
      this.element.removeAttribute(name);
      return true;
    } else {
      return false;
    }
  }
  getAttributeNameForKey(key) {
    return `data-${this.identifier}-${dasherize(key)}`;
  }
};
var Guide = class {
  constructor(logger) {
    this.warnedKeysByObject = /* @__PURE__ */ new WeakMap();
    this.logger = logger;
  }
  warn(object, key, message) {
    let warnedKeys = this.warnedKeysByObject.get(object);
    if (!warnedKeys) {
      warnedKeys = /* @__PURE__ */ new Set();
      this.warnedKeysByObject.set(object, warnedKeys);
    }
    if (!warnedKeys.has(key)) {
      warnedKeys.add(key);
      this.logger.warn(message, object);
    }
  }
};
function attributeValueContainsToken(attributeName, token) {
  return `[${attributeName}~="${token}"]`;
}
var TargetSet = class {
  constructor(scope) {
    this.scope = scope;
  }
  get element() {
    return this.scope.element;
  }
  get identifier() {
    return this.scope.identifier;
  }
  get schema() {
    return this.scope.schema;
  }
  has(targetName) {
    return this.find(targetName) != null;
  }
  find(...targetNames) {
    return targetNames.reduce((target, targetName) => target || this.findTarget(targetName) || this.findLegacyTarget(targetName), void 0);
  }
  findAll(...targetNames) {
    return targetNames.reduce((targets, targetName) => [
      ...targets,
      ...this.findAllTargets(targetName),
      ...this.findAllLegacyTargets(targetName)
    ], []);
  }
  findTarget(targetName) {
    const selector = this.getSelectorForTargetName(targetName);
    return this.scope.findElement(selector);
  }
  findAllTargets(targetName) {
    const selector = this.getSelectorForTargetName(targetName);
    return this.scope.findAllElements(selector);
  }
  getSelectorForTargetName(targetName) {
    const attributeName = this.schema.targetAttributeForScope(this.identifier);
    return attributeValueContainsToken(attributeName, targetName);
  }
  findLegacyTarget(targetName) {
    const selector = this.getLegacySelectorForTargetName(targetName);
    return this.deprecate(this.scope.findElement(selector), targetName);
  }
  findAllLegacyTargets(targetName) {
    const selector = this.getLegacySelectorForTargetName(targetName);
    return this.scope.findAllElements(selector).map((element) => this.deprecate(element, targetName));
  }
  getLegacySelectorForTargetName(targetName) {
    const targetDescriptor = `${this.identifier}.${targetName}`;
    return attributeValueContainsToken(this.schema.targetAttribute, targetDescriptor);
  }
  deprecate(element, targetName) {
    if (element) {
      const { identifier } = this;
      const attributeName = this.schema.targetAttribute;
      const revisedAttributeName = this.schema.targetAttributeForScope(identifier);
      this.guide.warn(element, `target:${targetName}`, `Please replace ${attributeName}="${identifier}.${targetName}" with ${revisedAttributeName}="${targetName}". The ${attributeName} attribute is deprecated and will be removed in a future version of Stimulus.`);
    }
    return element;
  }
  get guide() {
    return this.scope.guide;
  }
};
var OutletSet = class {
  constructor(scope, controllerElement) {
    this.scope = scope;
    this.controllerElement = controllerElement;
  }
  get element() {
    return this.scope.element;
  }
  get identifier() {
    return this.scope.identifier;
  }
  get schema() {
    return this.scope.schema;
  }
  has(outletName) {
    return this.find(outletName) != null;
  }
  find(...outletNames) {
    return outletNames.reduce((outlet, outletName) => outlet || this.findOutlet(outletName), void 0);
  }
  findAll(...outletNames) {
    return outletNames.reduce((outlets, outletName) => [...outlets, ...this.findAllOutlets(outletName)], []);
  }
  getSelectorForOutletName(outletName) {
    const attributeName = this.schema.outletAttributeForScope(this.identifier, outletName);
    return this.controllerElement.getAttribute(attributeName);
  }
  findOutlet(outletName) {
    const selector = this.getSelectorForOutletName(outletName);
    if (selector)
      return this.findElement(selector, outletName);
  }
  findAllOutlets(outletName) {
    const selector = this.getSelectorForOutletName(outletName);
    return selector ? this.findAllElements(selector, outletName) : [];
  }
  findElement(selector, outletName) {
    const elements = this.scope.queryElements(selector);
    return elements.filter((element) => this.matchesElement(element, selector, outletName))[0];
  }
  findAllElements(selector, outletName) {
    const elements = this.scope.queryElements(selector);
    return elements.filter((element) => this.matchesElement(element, selector, outletName));
  }
  matchesElement(element, selector, outletName) {
    const controllerAttribute = element.getAttribute(this.scope.schema.controllerAttribute) || "";
    return element.matches(selector) && controllerAttribute.split(" ").includes(outletName);
  }
};
var Scope = class _Scope {
  constructor(schema, element, identifier, logger) {
    this.targets = new TargetSet(this);
    this.classes = new ClassMap(this);
    this.data = new DataMap(this);
    this.containsElement = (element2) => {
      return element2.closest(this.controllerSelector) === this.element;
    };
    this.schema = schema;
    this.element = element;
    this.identifier = identifier;
    this.guide = new Guide(logger);
    this.outlets = new OutletSet(this.documentScope, element);
  }
  findElement(selector) {
    return this.element.matches(selector) ? this.element : this.queryElements(selector).find(this.containsElement);
  }
  findAllElements(selector) {
    return [
      ...this.element.matches(selector) ? [this.element] : [],
      ...this.queryElements(selector).filter(this.containsElement)
    ];
  }
  queryElements(selector) {
    return Array.from(this.element.querySelectorAll(selector));
  }
  get controllerSelector() {
    return attributeValueContainsToken(this.schema.controllerAttribute, this.identifier);
  }
  get isDocumentScope() {
    return this.element === document.documentElement;
  }
  get documentScope() {
    return this.isDocumentScope ? this : new _Scope(this.schema, document.documentElement, this.identifier, this.guide.logger);
  }
};
var ScopeObserver = class {
  constructor(element, schema, delegate) {
    this.element = element;
    this.schema = schema;
    this.delegate = delegate;
    this.valueListObserver = new ValueListObserver(this.element, this.controllerAttribute, this);
    this.scopesByIdentifierByElement = /* @__PURE__ */ new WeakMap();
    this.scopeReferenceCounts = /* @__PURE__ */ new WeakMap();
  }
  start() {
    this.valueListObserver.start();
  }
  stop() {
    this.valueListObserver.stop();
  }
  get controllerAttribute() {
    return this.schema.controllerAttribute;
  }
  parseValueForToken(token) {
    const { element, content: identifier } = token;
    return this.parseValueForElementAndIdentifier(element, identifier);
  }
  parseValueForElementAndIdentifier(element, identifier) {
    const scopesByIdentifier = this.fetchScopesByIdentifierForElement(element);
    let scope = scopesByIdentifier.get(identifier);
    if (!scope) {
      scope = this.delegate.createScopeForElementAndIdentifier(element, identifier);
      scopesByIdentifier.set(identifier, scope);
    }
    return scope;
  }
  elementMatchedValue(element, value) {
    const referenceCount = (this.scopeReferenceCounts.get(value) || 0) + 1;
    this.scopeReferenceCounts.set(value, referenceCount);
    if (referenceCount == 1) {
      this.delegate.scopeConnected(value);
    }
  }
  elementUnmatchedValue(element, value) {
    const referenceCount = this.scopeReferenceCounts.get(value);
    if (referenceCount) {
      this.scopeReferenceCounts.set(value, referenceCount - 1);
      if (referenceCount == 1) {
        this.delegate.scopeDisconnected(value);
      }
    }
  }
  fetchScopesByIdentifierForElement(element) {
    let scopesByIdentifier = this.scopesByIdentifierByElement.get(element);
    if (!scopesByIdentifier) {
      scopesByIdentifier = /* @__PURE__ */ new Map();
      this.scopesByIdentifierByElement.set(element, scopesByIdentifier);
    }
    return scopesByIdentifier;
  }
};
var Router = class {
  constructor(application2) {
    this.application = application2;
    this.scopeObserver = new ScopeObserver(this.element, this.schema, this);
    this.scopesByIdentifier = new Multimap();
    this.modulesByIdentifier = /* @__PURE__ */ new Map();
  }
  get element() {
    return this.application.element;
  }
  get schema() {
    return this.application.schema;
  }
  get logger() {
    return this.application.logger;
  }
  get controllerAttribute() {
    return this.schema.controllerAttribute;
  }
  get modules() {
    return Array.from(this.modulesByIdentifier.values());
  }
  get contexts() {
    return this.modules.reduce((contexts, module) => contexts.concat(module.contexts), []);
  }
  start() {
    this.scopeObserver.start();
  }
  stop() {
    this.scopeObserver.stop();
  }
  loadDefinition(definition) {
    this.unloadIdentifier(definition.identifier);
    const module = new Module(this.application, definition);
    this.connectModule(module);
    const afterLoad = definition.controllerConstructor.afterLoad;
    if (afterLoad) {
      afterLoad.call(definition.controllerConstructor, definition.identifier, this.application);
    }
  }
  unloadIdentifier(identifier) {
    const module = this.modulesByIdentifier.get(identifier);
    if (module) {
      this.disconnectModule(module);
    }
  }
  getContextForElementAndIdentifier(element, identifier) {
    const module = this.modulesByIdentifier.get(identifier);
    if (module) {
      return module.contexts.find((context) => context.element == element);
    }
  }
  proposeToConnectScopeForElementAndIdentifier(element, identifier) {
    const scope = this.scopeObserver.parseValueForElementAndIdentifier(element, identifier);
    if (scope) {
      this.scopeObserver.elementMatchedValue(scope.element, scope);
    } else {
      console.error(`Couldn't find or create scope for identifier: "${identifier}" and element:`, element);
    }
  }
  handleError(error2, message, detail) {
    this.application.handleError(error2, message, detail);
  }
  createScopeForElementAndIdentifier(element, identifier) {
    return new Scope(this.schema, element, identifier, this.logger);
  }
  scopeConnected(scope) {
    this.scopesByIdentifier.add(scope.identifier, scope);
    const module = this.modulesByIdentifier.get(scope.identifier);
    if (module) {
      module.connectContextForScope(scope);
    }
  }
  scopeDisconnected(scope) {
    this.scopesByIdentifier.delete(scope.identifier, scope);
    const module = this.modulesByIdentifier.get(scope.identifier);
    if (module) {
      module.disconnectContextForScope(scope);
    }
  }
  connectModule(module) {
    this.modulesByIdentifier.set(module.identifier, module);
    const scopes = this.scopesByIdentifier.getValuesForKey(module.identifier);
    scopes.forEach((scope) => module.connectContextForScope(scope));
  }
  disconnectModule(module) {
    this.modulesByIdentifier.delete(module.identifier);
    const scopes = this.scopesByIdentifier.getValuesForKey(module.identifier);
    scopes.forEach((scope) => module.disconnectContextForScope(scope));
  }
};
var defaultSchema = {
  controllerAttribute: "data-controller",
  actionAttribute: "data-action",
  targetAttribute: "data-target",
  targetAttributeForScope: (identifier) => `data-${identifier}-target`,
  outletAttributeForScope: (identifier, outlet) => `data-${identifier}-${outlet}-outlet`,
  keyMappings: Object.assign(Object.assign({ enter: "Enter", tab: "Tab", esc: "Escape", space: " ", up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", home: "Home", end: "End", page_up: "PageUp", page_down: "PageDown" }, objectFromEntries("abcdefghijklmnopqrstuvwxyz".split("").map((c) => [c, c]))), objectFromEntries("0123456789".split("").map((n) => [n, n])))
};
function objectFromEntries(array) {
  return array.reduce((memo, [k, v]) => Object.assign(Object.assign({}, memo), { [k]: v }), {});
}
var Application = class {
  constructor(element = document.documentElement, schema = defaultSchema) {
    this.logger = console;
    this.debug = false;
    this.logDebugActivity = (identifier, functionName, detail = {}) => {
      if (this.debug) {
        this.logFormattedMessage(identifier, functionName, detail);
      }
    };
    this.element = element;
    this.schema = schema;
    this.dispatcher = new Dispatcher(this);
    this.router = new Router(this);
    this.actionDescriptorFilters = Object.assign({}, defaultActionDescriptorFilters);
  }
  static start(element, schema) {
    const application2 = new this(element, schema);
    application2.start();
    return application2;
  }
  async start() {
    await domReady();
    this.logDebugActivity("application", "starting");
    this.dispatcher.start();
    this.router.start();
    this.logDebugActivity("application", "start");
  }
  stop() {
    this.logDebugActivity("application", "stopping");
    this.dispatcher.stop();
    this.router.stop();
    this.logDebugActivity("application", "stop");
  }
  register(identifier, controllerConstructor) {
    this.load({ identifier, controllerConstructor });
  }
  registerActionOption(name, filter) {
    this.actionDescriptorFilters[name] = filter;
  }
  load(head, ...rest) {
    const definitions = Array.isArray(head) ? head : [head, ...rest];
    definitions.forEach((definition) => {
      if (definition.controllerConstructor.shouldLoad) {
        this.router.loadDefinition(definition);
      }
    });
  }
  unload(head, ...rest) {
    const identifiers = Array.isArray(head) ? head : [head, ...rest];
    identifiers.forEach((identifier) => this.router.unloadIdentifier(identifier));
  }
  get controllers() {
    return this.router.contexts.map((context) => context.controller);
  }
  getControllerForElementAndIdentifier(element, identifier) {
    const context = this.router.getContextForElementAndIdentifier(element, identifier);
    return context ? context.controller : null;
  }
  handleError(error2, message, detail) {
    var _a;
    this.logger.error(`%s

%o

%o`, message, error2, detail);
    (_a = window.onerror) === null || _a === void 0 ? void 0 : _a.call(window, message, "", 0, 0, error2);
  }
  logFormattedMessage(identifier, functionName, detail = {}) {
    detail = Object.assign({ application: this }, detail);
    this.logger.groupCollapsed(`${identifier} #${functionName}`);
    this.logger.log("details:", Object.assign({}, detail));
    this.logger.groupEnd();
  }
};
function domReady() {
  return new Promise((resolve) => {
    if (document.readyState == "loading") {
      document.addEventListener("DOMContentLoaded", () => resolve());
    } else {
      resolve();
    }
  });
}
function ClassPropertiesBlessing(constructor) {
  const classes = readInheritableStaticArrayValues(constructor, "classes");
  return classes.reduce((properties, classDefinition) => {
    return Object.assign(properties, propertiesForClassDefinition(classDefinition));
  }, {});
}
function propertiesForClassDefinition(key) {
  return {
    [`${key}Class`]: {
      get() {
        const { classes } = this;
        if (classes.has(key)) {
          return classes.get(key);
        } else {
          const attribute = classes.getAttributeName(key);
          throw new Error(`Missing attribute "${attribute}"`);
        }
      }
    },
    [`${key}Classes`]: {
      get() {
        return this.classes.getAll(key);
      }
    },
    [`has${capitalize(key)}Class`]: {
      get() {
        return this.classes.has(key);
      }
    }
  };
}
function OutletPropertiesBlessing(constructor) {
  const outlets = readInheritableStaticArrayValues(constructor, "outlets");
  return outlets.reduce((properties, outletDefinition) => {
    return Object.assign(properties, propertiesForOutletDefinition(outletDefinition));
  }, {});
}
function getOutletController(controller, element, identifier) {
  return controller.application.getControllerForElementAndIdentifier(element, identifier);
}
function getControllerAndEnsureConnectedScope(controller, element, outletName) {
  let outletController = getOutletController(controller, element, outletName);
  if (outletController)
    return outletController;
  controller.application.router.proposeToConnectScopeForElementAndIdentifier(element, outletName);
  outletController = getOutletController(controller, element, outletName);
  if (outletController)
    return outletController;
}
function propertiesForOutletDefinition(name) {
  const camelizedName = namespaceCamelize(name);
  return {
    [`${camelizedName}Outlet`]: {
      get() {
        const outletElement = this.outlets.find(name);
        const selector = this.outlets.getSelectorForOutletName(name);
        if (outletElement) {
          const outletController = getControllerAndEnsureConnectedScope(this, outletElement, name);
          if (outletController)
            return outletController;
          throw new Error(`The provided outlet element is missing an outlet controller "${name}" instance for host controller "${this.identifier}"`);
        }
        throw new Error(`Missing outlet element "${name}" for host controller "${this.identifier}". Stimulus couldn't find a matching outlet element using selector "${selector}".`);
      }
    },
    [`${camelizedName}Outlets`]: {
      get() {
        const outlets = this.outlets.findAll(name);
        if (outlets.length > 0) {
          return outlets.map((outletElement) => {
            const outletController = getControllerAndEnsureConnectedScope(this, outletElement, name);
            if (outletController)
              return outletController;
            console.warn(`The provided outlet element is missing an outlet controller "${name}" instance for host controller "${this.identifier}"`, outletElement);
          }).filter((controller) => controller);
        }
        return [];
      }
    },
    [`${camelizedName}OutletElement`]: {
      get() {
        const outletElement = this.outlets.find(name);
        const selector = this.outlets.getSelectorForOutletName(name);
        if (outletElement) {
          return outletElement;
        } else {
          throw new Error(`Missing outlet element "${name}" for host controller "${this.identifier}". Stimulus couldn't find a matching outlet element using selector "${selector}".`);
        }
      }
    },
    [`${camelizedName}OutletElements`]: {
      get() {
        return this.outlets.findAll(name);
      }
    },
    [`has${capitalize(camelizedName)}Outlet`]: {
      get() {
        return this.outlets.has(name);
      }
    }
  };
}
function TargetPropertiesBlessing(constructor) {
  const targets = readInheritableStaticArrayValues(constructor, "targets");
  return targets.reduce((properties, targetDefinition) => {
    return Object.assign(properties, propertiesForTargetDefinition(targetDefinition));
  }, {});
}
function propertiesForTargetDefinition(name) {
  return {
    [`${name}Target`]: {
      get() {
        const target = this.targets.find(name);
        if (target) {
          return target;
        } else {
          throw new Error(`Missing target element "${name}" for "${this.identifier}" controller`);
        }
      }
    },
    [`${name}Targets`]: {
      get() {
        return this.targets.findAll(name);
      }
    },
    [`has${capitalize(name)}Target`]: {
      get() {
        return this.targets.has(name);
      }
    }
  };
}
function ValuePropertiesBlessing(constructor) {
  const valueDefinitionPairs = readInheritableStaticObjectPairs(constructor, "values");
  const propertyDescriptorMap = {
    valueDescriptorMap: {
      get() {
        return valueDefinitionPairs.reduce((result, valueDefinitionPair) => {
          const valueDescriptor = parseValueDefinitionPair(valueDefinitionPair, this.identifier);
          const attributeName = this.data.getAttributeNameForKey(valueDescriptor.key);
          return Object.assign(result, { [attributeName]: valueDescriptor });
        }, {});
      }
    }
  };
  return valueDefinitionPairs.reduce((properties, valueDefinitionPair) => {
    return Object.assign(properties, propertiesForValueDefinitionPair(valueDefinitionPair));
  }, propertyDescriptorMap);
}
function propertiesForValueDefinitionPair(valueDefinitionPair, controller) {
  const definition = parseValueDefinitionPair(valueDefinitionPair, controller);
  const { key, name, reader: read, writer: write } = definition;
  return {
    [name]: {
      get() {
        const value = this.data.get(key);
        if (value !== null) {
          return read(value);
        } else {
          return definition.defaultValue;
        }
      },
      set(value) {
        if (value === void 0) {
          this.data.delete(key);
        } else {
          this.data.set(key, write(value));
        }
      }
    },
    [`has${capitalize(name)}`]: {
      get() {
        return this.data.has(key) || definition.hasCustomDefaultValue;
      }
    }
  };
}
function parseValueDefinitionPair([token, typeDefinition], controller) {
  return valueDescriptorForTokenAndTypeDefinition({
    controller,
    token,
    typeDefinition
  });
}
function parseValueTypeConstant(constant) {
  switch (constant) {
    case Array:
      return "array";
    case Boolean:
      return "boolean";
    case Number:
      return "number";
    case Object:
      return "object";
    case String:
      return "string";
  }
}
function parseValueTypeDefault(defaultValue) {
  switch (typeof defaultValue) {
    case "boolean":
      return "boolean";
    case "number":
      return "number";
    case "string":
      return "string";
  }
  if (Array.isArray(defaultValue))
    return "array";
  if (Object.prototype.toString.call(defaultValue) === "[object Object]")
    return "object";
}
function parseValueTypeObject(payload) {
  const { controller, token, typeObject } = payload;
  const hasType = isSomething(typeObject.type);
  const hasDefault = isSomething(typeObject.default);
  const fullObject = hasType && hasDefault;
  const onlyType = hasType && !hasDefault;
  const onlyDefault = !hasType && hasDefault;
  const typeFromObject = parseValueTypeConstant(typeObject.type);
  const typeFromDefaultValue = parseValueTypeDefault(payload.typeObject.default);
  if (onlyType)
    return typeFromObject;
  if (onlyDefault)
    return typeFromDefaultValue;
  if (typeFromObject !== typeFromDefaultValue) {
    const propertyPath = controller ? `${controller}.${token}` : token;
    throw new Error(`The specified default value for the Stimulus Value "${propertyPath}" must match the defined type "${typeFromObject}". The provided default value of "${typeObject.default}" is of type "${typeFromDefaultValue}".`);
  }
  if (fullObject)
    return typeFromObject;
}
function parseValueTypeDefinition(payload) {
  const { controller, token, typeDefinition } = payload;
  const typeObject = { controller, token, typeObject: typeDefinition };
  const typeFromObject = parseValueTypeObject(typeObject);
  const typeFromDefaultValue = parseValueTypeDefault(typeDefinition);
  const typeFromConstant = parseValueTypeConstant(typeDefinition);
  const type = typeFromObject || typeFromDefaultValue || typeFromConstant;
  if (type)
    return type;
  const propertyPath = controller ? `${controller}.${typeDefinition}` : token;
  throw new Error(`Unknown value type "${propertyPath}" for "${token}" value`);
}
function defaultValueForDefinition(typeDefinition) {
  const constant = parseValueTypeConstant(typeDefinition);
  if (constant)
    return defaultValuesByType[constant];
  const hasDefault = hasProperty(typeDefinition, "default");
  const hasType = hasProperty(typeDefinition, "type");
  const typeObject = typeDefinition;
  if (hasDefault)
    return typeObject.default;
  if (hasType) {
    const { type } = typeObject;
    const constantFromType = parseValueTypeConstant(type);
    if (constantFromType)
      return defaultValuesByType[constantFromType];
  }
  return typeDefinition;
}
function valueDescriptorForTokenAndTypeDefinition(payload) {
  const { token, typeDefinition } = payload;
  const key = `${dasherize(token)}-value`;
  const type = parseValueTypeDefinition(payload);
  return {
    type,
    key,
    name: camelize(key),
    get defaultValue() {
      return defaultValueForDefinition(typeDefinition);
    },
    get hasCustomDefaultValue() {
      return parseValueTypeDefault(typeDefinition) !== void 0;
    },
    reader: readers[type],
    writer: writers[type] || writers.default
  };
}
var defaultValuesByType = {
  get array() {
    return [];
  },
  boolean: false,
  number: 0,
  get object() {
    return {};
  },
  string: ""
};
var readers = {
  array(value) {
    const array = JSON.parse(value);
    if (!Array.isArray(array)) {
      throw new TypeError(`expected value of type "array" but instead got value "${value}" of type "${parseValueTypeDefault(array)}"`);
    }
    return array;
  },
  boolean(value) {
    return !(value == "0" || String(value).toLowerCase() == "false");
  },
  number(value) {
    return Number(value.replace(/_/g, ""));
  },
  object(value) {
    const object = JSON.parse(value);
    if (object === null || typeof object != "object" || Array.isArray(object)) {
      throw new TypeError(`expected value of type "object" but instead got value "${value}" of type "${parseValueTypeDefault(object)}"`);
    }
    return object;
  },
  string(value) {
    return value;
  }
};
var writers = {
  default: writeString,
  array: writeJSON,
  object: writeJSON
};
function writeJSON(value) {
  return JSON.stringify(value);
}
function writeString(value) {
  return `${value}`;
}
var Controller = class {
  constructor(context) {
    this.context = context;
  }
  static get shouldLoad() {
    return true;
  }
  static afterLoad(_identifier, _application) {
    return;
  }
  get application() {
    return this.context.application;
  }
  get scope() {
    return this.context.scope;
  }
  get element() {
    return this.scope.element;
  }
  get identifier() {
    return this.scope.identifier;
  }
  get targets() {
    return this.scope.targets;
  }
  get outlets() {
    return this.scope.outlets;
  }
  get classes() {
    return this.scope.classes;
  }
  get data() {
    return this.scope.data;
  }
  initialize() {
  }
  connect() {
  }
  disconnect() {
  }
  dispatch(eventName, { target = this.element, detail = {}, prefix = this.identifier, bubbles = true, cancelable = true } = {}) {
    const type = prefix ? `${prefix}:${eventName}` : eventName;
    const event = new CustomEvent(type, { detail, bubbles, cancelable });
    target.dispatchEvent(event);
    return event;
  }
};
Controller.blessings = [
  ClassPropertiesBlessing,
  TargetPropertiesBlessing,
  ValuePropertiesBlessing,
  OutletPropertiesBlessing
];
Controller.targets = [];
Controller.outlets = [];
Controller.values = {};

// app/javascript/controllers/application.js
var application = Application.start();
application.debug = false;
window.Stimulus = application;

// app/javascript/controllers/hello_controller.js
var hello_controller_default = class extends Controller {
  connect() {
    this.element.textContent = "Hello World!";
  }
};

// app/javascript/controllers/index.js
application.register("hello", hello_controller_default);

// app/javascript/application.js
var import_flowbite_turbo = __toESM(require_flowbite_turbo());
/*! Bundled license information:

@hotwired/turbo/dist/turbo.es2017-esm.js:
  (*!
  Turbo 8.0.19
  Copyright © 2025 37signals LLC
   *)
*/
//# sourceMappingURL=/assets/application.js.map
