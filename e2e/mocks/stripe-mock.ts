/**
 * stripe-mock.ts
 * Script Stripe.js minimal pour les tests E2E.
 * Servi via page.route('**\/js.stripe.com\/**', ...) pour intercepter le chargement
 * réel de Stripe.js et le remplacer par un mock contrôlable.
 *
 * Fonctionnement :
 * - Définit window.Stripe comme constructeur retournant un stripe mock
 * - Le mock émet l'événement 'ready' sur le PaymentElement après 60ms
 * - window.__stripeConfirmResult peut être défini per-test pour contrôler
 *   le résultat de confirmPayment (succès ou erreur)
 */
export const STRIPE_MOCK_SCRIPT = `(function () {
  'use strict';

  function createMockElement(type) {
    var _handlers = {};
    var self = {
      on: function (event, handler) {
        if (!_handlers[event]) _handlers[event] = [];
        _handlers[event].push(handler);
        return self;
      },
      off: function (event, handler) {
        if (_handlers[event]) {
          _handlers[event] = _handlers[event].filter(function (h) { return h !== handler; });
        }
        return self;
      },
      mount: function (container) {
        var el = typeof container === 'string' ? document.querySelector(container) : container;
        if (el) {
          el.setAttribute('data-testid', 'stripe-element');
          el.innerHTML = '<div style="padding:16px;border:1px solid #d0d5dd;border-radius:8px;"><input type="text" placeholder="4242 4242 4242 4242" data-testid="stripe-card-input" style="width:100%;padding:8px;border:1px solid #d0d5dd;border-radius:6px;font-size:14px;box-sizing:border-box;"/></div>';
        }
        setTimeout(function () {
          if (_handlers['ready']) _handlers['ready'].forEach(function (h) { h({}); });
          if (_handlers['change']) _handlers['change'].forEach(function (h) { h({ complete: true }); });
        }, 60);
      },
      unmount: function () {},
      destroy: function () { _handlers = {}; },
      update: function () { return self; },
      focus: function () {},
      blur: function () {},
      clear: function () {},
      collapse: function () {},
      getValue: function () { return {}; },
    };
    return self;
  }

  function MockElements(options) {
    var _instances = {};
    return {
      create: function (type, opts) {
        if (!_instances[type]) _instances[type] = createMockElement(type);
        return _instances[type];
      },
      getElement: function (type) { return _instances[type] || null; },
      submit: function () { return Promise.resolve({ error: null }); },
      update: function () { return this; },
      fetchUpdates: function () { return Promise.resolve({}); },
    };
  }

  function MockStripe(publicKey) {
    var _elementsInstance = null;
    return {
      elements: function (options) {
        if (!_elementsInstance) _elementsInstance = MockElements(options);
        return _elementsInstance;
      },
      confirmPayment: function (options) {
        if (window.__stripeConfirmResult !== undefined) {
          return Promise.resolve(window.__stripeConfirmResult);
        }
        return Promise.resolve({
          paymentIntent: { id: 'pi_e2e_' + Date.now(), status: 'succeeded' }
        });
      },
      confirmCardPayment: function (clientSecret, data) {
        if (window.__stripeConfirmResult !== undefined) {
          return Promise.resolve(window.__stripeConfirmResult);
        }
        return Promise.resolve({ paymentIntent: { id: 'pi_e2e_' + Date.now(), status: 'succeeded' } });
      },
      createToken: function (typeOrOptions, data) {
        return Promise.resolve({ token: { id: 'tok_e2e_' + Date.now(), type: 'card' } });
      },
      createPaymentMethod: function (data) {
        return Promise.resolve({ paymentMethod: { id: 'pm_e2e_' + Date.now(), type: 'card' } });
      },
      retrievePaymentIntent: function (cs) {
        return Promise.resolve({ paymentIntent: { id: 'pi_e2e_' + Date.now(), status: 'succeeded' } });
      },
      createSource: function (typeOrOptions, data) {
        return Promise.resolve({ source: { id: 'src_e2e_' + Date.now(), type: 'card' } });
      },
    };
  }

  window.Stripe = MockStripe;
})();`;
