"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var _React = React,
  useState = _React.useState,
  useEffect = _React.useEffect,
  useMemo = _React.useMemo,
  useCallback = _React.useCallback,
  useRef = _React.useRef;
var tg = window.Telegram ? window.Telegram.WebApp : null;
var STATUS_LABEL = {
  todo: "Ã¢ Ã®Ã·Ã¥Ã°Ã¥Ã¤Ã¨",
  in_progress: "Ã¢ Ã°Ã Ã¡Ã®Ã²Ã¥",
  done: "Ã£Ã®Ã²Ã®Ã¢Ã®"
};
var STATUS_ICON = {
  todo: "\u23F3",
  in_progress: "\uD83D\uDD04",
  done: "\u2705"
};
var AREA_STATUS_ICON = {
  ok: "\uD83D\uDFE2",
  watch: "\uD83D\uDFE1",
  warning: "\uD83D\uDFE0",
  critical: "\uD83D\uDD34"
};
var TOAST_TIMEOUT = 2200;
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function fetchJSON(_x) {
  return _fetchJSON.apply(this, arguments);
}
function _fetchJSON() {
  _fetchJSON = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9(url) {
    var options,
      response,
      detail,
      payload,
      _args9 = arguments,
      _t9;
    return _regenerator().w(function (_context9) {
      while (1) switch (_context9.p = _context9.n) {
        case 0:
          options = _args9.length > 1 && _args9[1] !== undefined ? _args9[1] : {};
          _context9.n = 1;
          return fetch(url, _objectSpread({
            headers: {
              "Content-Type": "application/json"
            }
          }, options));
        case 1:
          response = _context9.v;
          if (response.ok) {
            _context9.n = 6;
            break;
          }
          detail = "ÃÃ¸Ã¨Ã¡ÃªÃ  Ã§Ã Ã¯Ã°Ã®Ã±Ã ";
          _context9.p = 2;
          _context9.n = 3;
          return response.json();
        case 3:
          payload = _context9.v;
          detail = payload.detail || detail;
          _context9.n = 5;
          break;
        case 4:
          _context9.p = 4;
          _t9 = _context9.v;
        case 5:
          throw new Error(detail);
        case 6:
          if (!(response.status === 204)) {
            _context9.n = 7;
            break;
          }
          return _context9.a(2, null);
        case 7:
          return _context9.a(2, response.json());
      }
    }, _callee9, null, [[2, 4]]);
  }));
  return _fetchJSON.apply(this, arguments);
}
function useDialog(isOpen) {
  var ref = useRef(null);
  useEffect(function () {
    var dialog = ref.current;
    if (!dialog) {
      return;
    }
    if (isOpen) {
      if (!dialog.open) {
        try {
          dialog.showModal();
        } catch (_err) {
          dialog.setAttribute("open", "open");
        }
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);
  return ref;
}
function Toast(_ref) {
  var message = _ref.message;
  if (!message) {
    return null;
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "toast toast--show",
    role: "status",
    "aria-live": "assertive"
  }, message);
}
function AreasView(_ref2) {
  var _areaDetail$metrics, _metrics$counts, _areaDetail$notes, _overview$signals, _overview$next_action, _ref3, _metrics$health_score, _selected$tasks_today, _selected$stagnation_, _selected$priority, _metrics$activity_las, _metrics$completion_r, _metrics$focus_ratio, _counts$todo, _counts$in_progress, _counts$done;
  var areas = _ref2.areas,
    areasLoading = _ref2.areasLoading,
    selectedAreaId = _ref2.selectedAreaId,
    areaDetail = _ref2.areaDetail,
    onSelectArea = _ref2.onSelectArea,
    onTouchArea = _ref2.onTouchArea,
    onCreateTask = _ref2.onCreateTask,
    onOpenAreaModal = _ref2.onOpenAreaModal,
    onRefresh = _ref2.onRefresh;
  var selected = areaDetail === null || areaDetail === void 0 ? void 0 : areaDetail.area;
  var overview = areaDetail === null || areaDetail === void 0 ? void 0 : areaDetail.overview;
  var metrics = (_areaDetail$metrics = areaDetail === null || areaDetail === void 0 ? void 0 : areaDetail.metrics) !== null && _areaDetail$metrics !== void 0 ? _areaDetail$metrics : {};
  var counts = (_metrics$counts = metrics.counts) !== null && _metrics$counts !== void 0 ? _metrics$counts : {};
  var notes = (_areaDetail$notes = areaDetail === null || areaDetail === void 0 ? void 0 : areaDetail.notes) !== null && _areaDetail$notes !== void 0 ? _areaDetail$notes : [];
  var signals = (_overview$signals = overview === null || overview === void 0 ? void 0 : overview.signals) !== null && _overview$signals !== void 0 ? _overview$signals : [];
  var nextActions = (_overview$next_action = overview === null || overview === void 0 ? void 0 : overview.next_actions) !== null && _overview$next_action !== void 0 ? _overview$next_action : [];
  return /*#__PURE__*/React.createElement("section", {
    id: "areas-view",
    className: "view",
    role: "tabpanel",
    "aria-labelledby": "tab-areas"
  }, /*#__PURE__*/React.createElement("header", {
    className: "view__header"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "\xC3\x91\xC3\xB4\xC3\xA5\xC3\xB0\xC3\xBB \xC3\xA6\xC3\xA8\xC3\xA7\xC3\xAD\xC3\xA8"), /*#__PURE__*/React.createElement("p", {
    className: "view__subtitle"
  }, "\xC3\x8E\xC3\xA1\xC3\xA7\xC3\xAE\xC3\xB0 \xC3\xAF\xC3\xB0\xC3\xAE\xC3\xA3\xC3\xB0\xC3\xA5\xC3\xB1\xC3\xB1\xC3\xA0 \xC3\xA8 \xC3\xB1\xC3\xAB\xC3\xA5\xC3\xA4\xC3\xB3\xC3\xBE\xC3\xB9\xC3\xA8\xC3\xB5 \xC3\xB8\xC3\xA0\xC3\xA3\xC3\xAE\xC3\xA2")), /*#__PURE__*/React.createElement("div", {
    className: "view__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    type: "button",
    onClick: function onClick() {
      return onRefresh();
    }
  }, "\xC3\x8E\xC3\xA1\xC3\xAD\xC3\xAE\xC3\xA2\xC3\xA8\xC3\xB2\xC3\xBC"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-accent",
    type: "button",
    onClick: function onClick() {
      return onOpenAreaModal(null);
    }
  }, "+ \xC3\x91\xC3\xB4\xC3\xA5\xC3\xB0\xC3\xA0"))), /*#__PURE__*/React.createElement("div", {
    className: "areas"
  }, /*#__PURE__*/React.createElement("aside", {
    className: "areas__list",
    "aria-live": "polite"
  }, areasLoading ? /*#__PURE__*/React.createElement("p", {
    className: "empty"
  }, "\xC3\x87\xC3\xA0\xC3\xA3\xC3\xB0\xC3\xB3\xC3\xA6\xC3\xA0\xC3\xA5\xC3\xAC \xC3\xB1\xC3\xB4\xC3\xA5\xC3\xB0\xC3\xBB\xC2\x85") : !areas.length ? /*#__PURE__*/React.createElement("p", {
    className: "empty"
  }, "\xC3\x8F\xC3\xAE\xC3\xAA\xC3\xA0 \xC3\xAD\xC3\xA5\xC3\xB2 \xC3\xB1\xC3\xB4\xC3\xA5\xC3\xB0. \xC3\x84\xC3\xAE\xC3\xA1\xC3\xA0\xC3\xA2\xC3\xBC\xC3\xB2\xC3\xA5 \xC3\xAF\xC3\xA5\xC3\xB0\xC3\xA2\xC3\xB3\xC3\xBE \xC3\xB1 \xC3\xAF\xC3\xAE\xC3\xAC\xC3\xAE\xC3\xB9\xC3\xBC\xC3\xBE \xC3\xAA\xC3\xAD\xC3\xAE\xC3\xAF\xC3\xAA\xC3\xA8 \xC3\xA2\xC3\xBB\xC3\xB8\xC3\xA5.") : areas.map(function (area) {
    var _area$health_score, _area$tasks_today, _area$stagnation_days, _area$priority;
    var statusIcon = AREA_STATUS_ICON[area.status || "ok"] || "??";
    return /*#__PURE__*/React.createElement("article", {
      key: area.id,
      className: "area-card".concat(selectedAreaId === area.id ? " area-card--active" : ""),
      onClick: function onClick() {
        return onSelectArea(area.id);
      },
      role: "button",
      tabIndex: 0
    }, /*#__PURE__*/React.createElement("div", {
      className: "area-card__header"
    }, /*#__PURE__*/React.createElement("span", {
      className: "area-card__name"
    }, area.icon || statusIcon, " ", area.name), /*#__PURE__*/React.createElement("span", {
      className: "chip"
    }, "HS ", (_area$health_score = area.health_score) !== null && _area$health_score !== void 0 ? _area$health_score : 0)), area.short_desc ? /*#__PURE__*/React.createElement("p", {
      className: "area-card__subtitle"
    }, area.short_desc) : null, /*#__PURE__*/React.createElement("div", {
      className: "area-card__metrics"
    }, /*#__PURE__*/React.createElement("span", null, "\xC3\x91\xC3\xA5\xC3\xA3\xC3\xAE\xC3\xA4\xC3\xAD\xC3\xBF ", (_area$tasks_today = area.tasks_today) !== null && _area$tasks_today !== void 0 ? _area$tasks_today : 0), /*#__PURE__*/React.createElement("span", null, "\xC3\x91\xC3\xB2\xC3\xA0\xC3\xA3\xC3\xAD\xC3\xA0\xC3\xB6\xC3\xA8\xC3\xBF ", (_area$stagnation_days = area.stagnation_days) !== null && _area$stagnation_days !== void 0 ? _area$stagnation_days : 0, " \xC3\xA4\xC3\xAD"), /*#__PURE__*/React.createElement("span", null, "\xC3\x8F\xC3\xB0\xC3\xA8\xC3\xAE\xC3\xB0\xC3\xA8\xC3\xB2\xC3\xA5\xC3\xB2 ", (_area$priority = area.priority) !== null && _area$priority !== void 0 ? _area$priority : "Â")));
  })), /*#__PURE__*/React.createElement("article", {
    className: "areas__detail",
    "aria-live": "polite"
  }, areaDetail ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "area-detail__header"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "area-detail__title"
  }, ((selected === null || selected === void 0 ? void 0 : selected.icon) || AREA_STATUS_ICON[(selected === null || selected === void 0 ? void 0 : selected.status) || "ok"] || "??") + " " + ((selected === null || selected === void 0 ? void 0 : selected.name) || "")), selected !== null && selected !== void 0 && selected.short_desc ? /*#__PURE__*/React.createElement("p", {
    className: "area-card__subtitle"
  }, selected.short_desc) : null, /*#__PURE__*/React.createElement("div", {
    className: "area-detail__meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip"
  }, "HS ", (_ref3 = (_metrics$health_score = metrics.health_score) !== null && _metrics$health_score !== void 0 ? _metrics$health_score : selected === null || selected === void 0 ? void 0 : selected.health_score) !== null && _ref3 !== void 0 ? _ref3 : 0), /*#__PURE__*/React.createElement("span", {
    className: "chip"
  }, "\xC3\x91\xC3\xA5\xC3\xA3\xC3\xAE\xC3\xA4\xC3\xAD\xC3\xBF ", (_selected$tasks_today = selected === null || selected === void 0 ? void 0 : selected.tasks_today) !== null && _selected$tasks_today !== void 0 ? _selected$tasks_today : 0), /*#__PURE__*/React.createElement("span", {
    className: "chip"
  }, "\xC3\x91\xC3\xB2\xC3\xA0\xC3\xA3\xC3\xAD\xC3\xA0\xC3\xB6\xC3\xA8\xC3\xBF ", (_selected$stagnation_ = selected === null || selected === void 0 ? void 0 : selected.stagnation_days) !== null && _selected$stagnation_ !== void 0 ? _selected$stagnation_ : 0, " \xC3\xA4\xC3\xAD"), /*#__PURE__*/React.createElement("span", {
    className: "chip"
  }, "\xC3\x8F\xC3\xB0\xC3\xA8\xC3\xAE\xC3\xB0\xC3\xA8\xC3\xB2\xC3\xA5\xC3\xB2 ", (_selected$priority = selected === null || selected === void 0 ? void 0 : selected.priority) !== null && _selected$priority !== void 0 ? _selected$priority : "Â")), signals.length ? /*#__PURE__*/React.createElement("div", {
    className: "area-detail__meta"
  }, signals.filter(function (signal) {
    return signal.label;
  }).map(function (signal) {
    return /*#__PURE__*/React.createElement("span", {
      className: "chip",
      key: signal.type
    }, signal.label);
  })) : null), /*#__PURE__*/React.createElement("div", {
    className: "area-detail__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-accent",
    type: "button",
    onClick: function onClick() {
      return onTouchArea(selected.id);
    }
  }, "Touch"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    type: "button",
    onClick: function onClick() {
      return onCreateTask(selected.id);
    }
  }, "\xC3\x84\xC3\xAE\xC3\xA1\xC3\xA0\xC3\xA2\xC3\xA8\xC3\xB2\xC3\xBC \xC3\xA7\xC3\xA0\xC3\xA4\xC3\xA0\xC3\xB7\xC3\xB3"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    type: "button",
    onClick: function onClick() {
      return onOpenAreaModal(areaDetail);
    }
  }, "\xC3\x90\xC3\xA5\xC3\xA4\xC3\xA0\xC3\xAA\xC3\xB2\xC3\xA8\xC3\xB0\xC3\xAE\xC3\xA2\xC3\xA0\xC3\xB2\xC3\xBC"))), overview !== null && overview !== void 0 && overview.one_thing ? /*#__PURE__*/React.createElement("div", {
    className: "area-detail__section"
  }, /*#__PURE__*/React.createElement("h3", null, "One Thing"), /*#__PURE__*/React.createElement("p", null, overview.one_thing)) : null, /*#__PURE__*/React.createElement("div", {
    className: "area-detail__section"
  }, /*#__PURE__*/React.createElement("h3", null, "Next Actions"), nextActions.length ? /*#__PURE__*/React.createElement("div", {
    className: "next-actions"
  }, nextActions.map(function (item, index) {
    var _item$occurrence_id;
    return /*#__PURE__*/React.createElement("div", {
      key: (_item$occurrence_id = item.occurrence_id) !== null && _item$occurrence_id !== void 0 ? _item$occurrence_id : index,
      className: "next-actions__item"
    }, "".concat(index + 1, ". ").concat(STATUS_ICON[item.status] || "Â", " ").concat(item.text || ""));
  })) : /*#__PURE__*/React.createElement("p", {
    className: "empty"
  }, "\xC3\x8D\xC3\xA5\xC3\xB2 Next Action. \xC3\x84\xC3\xAE\xC3\xA1\xC3\xA0\xC3\xA2\xC3\xBC\xC3\xB2\xC3\xA5 \xC3\xA7\xC3\xA0\xC3\xA4\xC3\xA0\xC3\xB7\xC3\xB3 \xC3\xA4\xC3\xAB\xC3\xBF \xC3\xBD\xC3\xB2\xC3\xAE\xC3\xA9 \xC3\xB1\xC3\xB4\xC3\xA5\xC3\xB0\xC3\xBB.")), /*#__PURE__*/React.createElement("div", {
    className: "area-detail__section"
  }, /*#__PURE__*/React.createElement("h3", null, "\xC3\x8C\xC3\xA5\xC3\xB2\xC3\xB0\xC3\xA8\xC3\xAA\xC3\xA8"), /*#__PURE__*/React.createElement("div", {
    className: "metrics-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric-card"
  }, /*#__PURE__*/React.createElement("strong", null, "\xC3\x80\xC3\xAA\xC3\xB2\xC3\xA8\xC3\xA2\xC3\xAD\xC3\xAE\xC3\xB1\xC3\xB2\xC3\xBC 7 \xC3\xA4\xC3\xAD"), /*#__PURE__*/React.createElement("span", null, (_metrics$activity_las = metrics.activity_last_7) !== null && _metrics$activity_las !== void 0 ? _metrics$activity_las : 0)), /*#__PURE__*/React.createElement("div", {
    className: "metric-card"
  }, /*#__PURE__*/React.createElement("strong", null, "\xC3\x87\xC3\xA0\xC3\xA2\xC3\xA5\xC3\xB0\xC3\xB8\xC3\xA5\xC3\xAD\xC3\xAE 7 \xC3\xA4\xC3\xAD"), /*#__PURE__*/React.createElement("span", null, (_metrics$completion_r = metrics.completion_rate_7d) !== null && _metrics$completion_r !== void 0 ? _metrics$completion_r : 0, "%")), /*#__PURE__*/React.createElement("div", {
    className: "metric-card"
  }, /*#__PURE__*/React.createElement("strong", null, "\xC3\x94\xC3\xAE\xC3\xAA\xC3\xB3\xC3\xB1"), /*#__PURE__*/React.createElement("span", null, (_metrics$focus_ratio = metrics.focus_ratio) !== null && _metrics$focus_ratio !== void 0 ? _metrics$focus_ratio : 0, "%")), /*#__PURE__*/React.createElement("div", {
    className: "metric-card"
  }, /*#__PURE__*/React.createElement("strong", null, "\xC3\x91\xC3\xB2\xC3\xA0\xC3\xB2\xC3\xB3\xC3\xB1\xC3\xBB"), /*#__PURE__*/React.createElement("span", null, "todo ", (_counts$todo = counts.todo) !== null && _counts$todo !== void 0 ? _counts$todo : 0, " \xC2\xB7 in_progress ", (_counts$in_progress = counts.in_progress) !== null && _counts$in_progress !== void 0 ? _counts$in_progress : 0, " \xC2\xB7 done ", (_counts$done = counts.done) !== null && _counts$done !== void 0 ? _counts$done : 0)))), /*#__PURE__*/React.createElement("div", {
    className: "area-detail__section"
  }, /*#__PURE__*/React.createElement("h3", null, "\xC3\x87\xC3\xA0\xC3\xAC\xC3\xA5\xC3\xB2\xC3\xAA\xC3\xA8"), notes.length ? /*#__PURE__*/React.createElement("div", {
    className: "notes-list"
  }, notes.map(function (note) {
    var payload = note.payload || {};
    var text = payload.note || payload.text || JSON.stringify(payload);
    return /*#__PURE__*/React.createElement("div", {
      key: note.id
    }, "\xC2\x95 ", text);
  })) : /*#__PURE__*/React.createElement("p", {
    className: "empty"
  }, "\xC3\x8F\xC3\xAE\xC3\xAA\xC3\xA0 \xC3\xAD\xC3\xA5\xC3\xB2 \xC3\xA7\xC3\xA0\xC3\xAC\xC3\xA5\xC3\xB2\xC3\xAE\xC3\xAA."))) : /*#__PURE__*/React.createElement("p", {
    className: "empty"
  }, "\xC3\x82\xC3\xBB\xC3\xA1\xC3\xA5\xC3\xB0\xC3\xA8\xC3\xB2\xC3\xA5 \xC3\xB1\xC3\xB4\xC3\xA5\xC3\xB0\xC3\xB3 \xC3\xB1\xC3\xAB\xC3\xA5\xC3\xA2\xC3\xA0, \xC3\xB7\xC3\xB2\xC3\xAE\xC3\xA1\xC3\xBB \xC3\xB3\xC3\xA2\xC3\xA8\xC3\xA4\xC3\xA5\xC3\xB2\xC3\xBC \xC3\xAF\xC3\xAE\xC3\xA4\xC3\xB0\xC3\xAE\xC3\xA1\xC3\xAD\xC3\xAE\xC3\xB1\xC3\xB2\xC3\xA8."))));
}
function TasksView(_ref4) {
  var _payload$tasks, _summary$total, _summary$by_status$to, _summary$by_status, _summary$by_status$in, _summary$by_status2, _summary$by_status$do, _summary$by_status3;
  var payload = _ref4.payload,
    date = _ref4.date,
    onShiftDate = _ref4.onShiftDate,
    onSelectDate = _ref4.onSelectDate,
    showDone = _ref4.showDone,
    onToggleDone = _ref4.onToggleDone,
    onRefresh = _ref4.onRefresh,
    onUpdateStatus = _ref4.onUpdateStatus,
    onReorder = _ref4.onReorder;
  var tasks = (_payload$tasks = payload === null || payload === void 0 ? void 0 : payload.tasks) !== null && _payload$tasks !== void 0 ? _payload$tasks : [];
  var filtered = useMemo(function () {
    return showDone ? tasks : tasks.filter(function (task) {
      return task.status !== "done";
    });
  }, [tasks, showDone]);
  var summary = payload === null || payload === void 0 ? void 0 : payload.summary;
  var rollover = payload === null || payload === void 0 ? void 0 : payload.rollover;
  var dateLabel = useMemo(function () {
    if (!date) return "";
    return new Intl.DateTimeFormat("ru-RU", {
      weekday: "short",
      month: "long",
      day: "numeric"
    }).format(new Date(date + "T00:00:00"));
  }, [date]);
  return /*#__PURE__*/React.createElement("section", {
    id: "tasks-view",
    className: "view",
    role: "tabpanel",
    "aria-labelledby": "tab-tasks"
  }, /*#__PURE__*/React.createElement("header", {
    className: "toolbar"
  }, /*#__PURE__*/React.createElement("button", {
    id: "nav-prev",
    type: "button",
    title: "\u0412\u0447\u0435\u0440\u0430",
    "aria-label": "\u041F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0438\u0439 \u0434\u0435\u043D\u044C",
    onClick: function onClick() {
      return onShiftDate(-1);
    }
  }, "\u25C2"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: date,
    onChange: function onChange(event) {
      return onSelectDate(event.target.value);
    }
  }), /*#__PURE__*/React.createElement("button", {
    id: "nav-next",
    type: "button",
    title: "\u0417\u0430\u0432\u0442\u0440\u0430",
    "aria-label": "\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0434\u0435\u043D\u044C",
    onClick: function onClick() {
      return onShiftDate(1);
    }
  }, "\u25B8")), /*#__PURE__*/React.createElement("section", {
    className: "summary",
    "aria-live": "polite"
  }, /*#__PURE__*/React.createElement("strong", null, dateLabel), /*#__PURE__*/React.createElement("span", null, "\xC3\x82\xC3\xB1\xC3\xA5\xC3\xA3\xC3\xAE: ", /*#__PURE__*/React.createElement("strong", null, (_summary$total = summary === null || summary === void 0 ? void 0 : summary.total) !== null && _summary$total !== void 0 ? _summary$total : 0)), /*#__PURE__*/React.createElement("span", null, "Todo: ", (_summary$by_status$to = summary === null || summary === void 0 || (_summary$by_status = summary.by_status) === null || _summary$by_status === void 0 ? void 0 : _summary$by_status.todo) !== null && _summary$by_status$to !== void 0 ? _summary$by_status$to : 0, " \xC2\x95 \xC3\x82 \xC3\xB0\xC3\xA0\xC3\xA1\xC3\xAE\xC3\xB2\xC3\xA5: ", (_summary$by_status$in = summary === null || summary === void 0 || (_summary$by_status2 = summary.by_status) === null || _summary$by_status2 === void 0 ? void 0 : _summary$by_status2.in_progress) !== null && _summary$by_status$in !== void 0 ? _summary$by_status$in : 0, " \xC2\x95 Done: ", (_summary$by_status$do = summary === null || summary === void 0 || (_summary$by_status3 = summary.by_status) === null || _summary$by_status3 === void 0 ? void 0 : _summary$by_status3.done) !== null && _summary$by_status$do !== void 0 ? _summary$by_status$do : 0), rollover !== null && rollover !== void 0 && rollover.created ? /*#__PURE__*/React.createElement("span", null, "? \xC3\x8F\xC3\xA5\xC3\xB0\xC3\xA5\xC3\xAD\xC3\xA5\xC3\xB1\xC3\xA5\xC3\xAD\xC3\xAE \xC3\xB1\xC3\xAE \xC3\xA2\xC3\xB7\xC3\xA5\xC3\xB0\xC3\xA0: ", /*#__PURE__*/React.createElement("strong", null, rollover.created)) : null), /*#__PURE__*/React.createElement("label", {
    className: "toggle"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: showDone,
    onChange: function onChange(event) {
      return onToggleDone(event.target.checked);
    }
  }), /*#__PURE__*/React.createElement("span", null, "\xC3\x8F\xC3\xAE\xC3\xAA\xC3\xA0\xC3\xA7\xC3\xBB\xC3\xA2\xC3\xA0\xC3\xB2\xC3\xBC \xC3\xA2\xC3\xBB\xC3\xAF\xC3\xAE\xC3\xAB\xC3\xAD\xC3\xA5\xC3\xAD\xC3\xAD\xC3\xBB\xC3\xA5")), /*#__PURE__*/React.createElement("section", {
    className: "tasks",
    "aria-live": "polite"
  }, !filtered.length ? /*#__PURE__*/React.createElement("p", {
    className: "task-empty"
  }, showDone ? "ÃÃ¥Ã² Ã§Ã Ã¤Ã Ã· Ã­Ã  Ã¢Ã»Ã¡Ã°Ã Ã­Ã­Ã³Ã¾ Ã¤Ã Ã²Ã³." : "ÃÃ¥Ã² Ã ÃªÃ²Ã³Ã Ã«Ã¼Ã­Ã»Ãµ Ã§Ã Ã¤Ã Ã·. ÃÃªÃ«Ã¾Ã·Ã¨Ã²Ã¥ Ã¯Ã¥Ã°Ã¥ÃªÃ«Ã¾Ã·Ã Ã²Ã¥Ã«Ã¼, Ã·Ã²Ã®Ã¡Ã» Ã³Ã¢Ã¨Ã¤Ã¥Ã²Ã¼ Ã¢Ã»Ã¯Ã®Ã«Ã­Ã¥Ã­Ã­Ã»Ã¥.") : filtered.map(function (task) {
    return /*#__PURE__*/React.createElement("article", {
      key: task.occurrence_id,
      className: "task-item task-item--".concat(task.status),
      draggable: true,
      onDragStart: function onDragStart(event) {
        event.dataTransfer.setData("text/plain", String(task.occurrence_id));
      },
      onDragOver: function onDragOver(event) {
        return event.preventDefault();
      },
      onDrop: function onDrop(event) {
        event.preventDefault();
        var sourceId = event.dataTransfer.getData("text/plain");
        onReorder(sourceId, String(task.occurrence_id));
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "task-item__head"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "task-item__title"
    }, task.text || "ÃÃ¥Ã§ Ã­Ã Ã§Ã¢Ã Ã­Ã¨Ã¿"), /*#__PURE__*/React.createElement("div", {
      className: "task-item__controls"
    }, [{
      status: "done",
      label: "?"
    }, {
      status: "in_progress",
      label: "??"
    }, {
      status: "todo",
      label: "??"
    }].map(function (btn) {
      return /*#__PURE__*/React.createElement("button", {
        key: btn.status,
        type: "button",
        onClick: function onClick() {
          return onUpdateStatus(task.occurrence_id, btn.status);
        }
      }, btn.label);
    }))), /*#__PURE__*/React.createElement("div", {
      className: "task-item__meta"
    }, [task.area ? "#".concat(task.area) : null, STATUS_LABEL[task.status] || task.status, task.rolled_from ? "Ã¯Ã¥Ã°Ã¥Ã­Ã¥Ã±Ã¥Ã­Ã " : null].filter(Boolean).join(" Â ")));
  })), /*#__PURE__*/React.createElement("footer", {
    className: "footer"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    type: "button",
    onClick: function onClick() {
      return onRefresh();
    }
  }, "\xC3\x8E\xC3\xA1\xC3\xAD\xC3\xAE\xC3\xA2\xC3\xA8\xC3\xB2\xC3\xBC"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-accent",
    type: "button",
    onClick: function onClick() {
      return onRefresh(true);
    }
  }, "\xC3\x8F\xC3\xA5\xC3\xB0\xC3\xA5\xC3\xA7\xC3\xA0\xC3\xA3\xC3\xB0\xC3\xB3\xC3\xA7\xC3\xA8\xC3\xB2\xC3\xBC")));
}
function App() {
  var _useState = useState(null),
    _useState2 = _slicedToArray(_useState, 2),
    tgId = _useState2[0],
    setTgId = _useState2[1];
  var _useState3 = useState(null),
    _useState4 = _slicedToArray(_useState3, 2),
    timezone = _useState4[0],
    setTimezone = _useState4[1];
  var _useState5 = useState("areas"),
    _useState6 = _slicedToArray(_useState5, 2),
    view = _useState6[0],
    setView = _useState6[1];
  var _useState7 = useState([]),
    _useState8 = _slicedToArray(_useState7, 2),
    areas = _useState8[0],
    setAreas = _useState8[1];
  var _useState9 = useState(true),
    _useState0 = _slicedToArray(_useState9, 2),
    areasLoading = _useState0[0],
    setAreasLoading = _useState0[1];
  var _useState1 = useState(null),
    _useState10 = _slicedToArray(_useState1, 2),
    selectedAreaId = _useState10[0],
    setSelectedAreaId = _useState10[1];
  var _useState11 = useState(null),
    _useState12 = _slicedToArray(_useState11, 2),
    areaDetail = _useState12[0],
    setAreaDetail = _useState12[1];
  var _useState13 = useState(false),
    _useState14 = _slicedToArray(_useState13, 2),
    areaDetailLoading = _useState14[0],
    setAreaDetailLoading = _useState14[1];
  var _useState15 = useState(null),
    _useState16 = _slicedToArray(_useState15, 2),
    tasksPayload = _useState16[0],
    setTasksPayload = _useState16[1];
  var _useState17 = useState(todayISO()),
    _useState18 = _slicedToArray(_useState17, 2),
    date = _useState18[0],
    setDate = _useState18[1];
  var _useState19 = useState(false),
    _useState20 = _slicedToArray(_useState19, 2),
    showDone = _useState20[0],
    setShowDone = _useState20[1];
  var _useState21 = useState(""),
    _useState22 = _slicedToArray(_useState21, 2),
    toastMessage = _useState22[0],
    setToastMessage = _useState22[1];
  var _useState23 = useState(false),
    _useState24 = _slicedToArray(_useState23, 2),
    areaModalOpen = _useState24[0],
    setAreaModalOpen = _useState24[1];
  var _useState25 = useState(false),
    _useState26 = _slicedToArray(_useState25, 2),
    taskModalOpen = _useState26[0],
    setTaskModalOpen = _useState26[1];
  var _useState27 = useState({
      id: null,
      name: "",
      icon: "",
      short_desc: "",
      priority: "",
      one_thing: ""
    }),
    _useState28 = _slicedToArray(_useState27, 2),
    areaFormState = _useState28[0],
    setAreaFormState = _useState28[1];
  var _useState29 = useState(null),
    _useState30 = _slicedToArray(_useState29, 2),
    pendingAreaId = _useState30[0],
    setPendingAreaId = _useState30[1];
  var _useState31 = useState({
      text: "",
      area: "",
      date: todayISO()
    }),
    _useState32 = _slicedToArray(_useState31, 2),
    taskFormState = _useState32[0],
    setTaskFormState = _useState32[1];
  var areaDialogRef = useDialog(areaModalOpen);
  var taskDialogRef = useDialog(taskModalOpen);
  var showToast = useCallback(function (message) {
    setToastMessage(message);
  }, []);
  useEffect(function () {
    if (!toastMessage) {
      return;
    }
    var timer = setTimeout(function () {
      return setToastMessage("");
    }, TOAST_TIMEOUT);
    return function () {
      return clearTimeout(timer);
    };
  }, [toastMessage]);
  useEffect(function () {
    var _tg$initDataUnsafe2;
    if (tg) {
      try {
        var _tg$initDataUnsafe;
        tg.ready();
        tg.expand();
        var user = (_tg$initDataUnsafe = tg.initDataUnsafe) === null || _tg$initDataUnsafe === void 0 ? void 0 : _tg$initDataUnsafe.user;
        if (user !== null && user !== void 0 && user.id) {
          setTgId(user.id);
        }
        if (user !== null && user !== void 0 && user.language_code) {
          setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
        }
      } catch (err) {
        console.error("Telegram initialisation failed", err);
      }
    }
    if (!tg || !((_tg$initDataUnsafe2 = tg.initDataUnsafe) !== null && _tg$initDataUnsafe2 !== void 0 && (_tg$initDataUnsafe2 = _tg$initDataUnsafe2.user) !== null && _tg$initDataUnsafe2 !== void 0 && _tg$initDataUnsafe2.id)) {
      var demoId = Number(localStorage.getItem("demo-tg-id") || 1);
      localStorage.setItem("demo-tg-id", String(demoId));
      setTgId(demoId);
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  }, []);
  var loadAreas = useCallback(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
    var withSpinner,
      params,
      payload,
      nextAreas,
      _args = arguments,
      _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          withSpinner = _args.length > 0 && _args[0] !== undefined ? _args[0] : true;
          if (tgId) {
            _context.n = 1;
            break;
          }
          return _context.a(2);
        case 1:
          if (withSpinner && tg !== null && tg !== void 0 && tg.MainButton) {
            tg.MainButton.showProgress();
          }
          setAreasLoading(true);
          _context.p = 2;
          params = new URLSearchParams({
            tg_id: String(tgId)
          });
          if (timezone) {
            params.set("tz", timezone);
          }
          _context.n = 3;
          return fetchJSON("/api/areas?".concat(params.toString()));
        case 3:
          payload = _context.v;
          nextAreas = payload.areas || [];
          setAreas(nextAreas);
          if (payload.timezone) {
            setTimezone(payload.timezone);
          }
          if (nextAreas.length) {
            setSelectedAreaId(function (prev) {
              if (!prev) {
                return nextAreas[0].id;
              }
              var stillExists = nextAreas.some(function (area) {
                return area.id === prev;
              });
              return stillExists ? prev : nextAreas[0].id;
            });
          } else {
            setSelectedAreaId(null);
            setAreaDetail(null);
          }
          _context.n = 5;
          break;
        case 4:
          _context.p = 4;
          _t = _context.v;
          console.error(_t);
          showToast(_t.message || "ÃÃ¥ Ã³Ã¤Ã Ã«Ã®Ã±Ã¼ Ã§Ã Ã£Ã°Ã³Ã§Ã¨Ã²Ã¼ Ã±Ã´Ã¥Ã°Ã»");
        case 5:
          _context.p = 5;
          setAreasLoading(false);
          if (withSpinner && tg !== null && tg !== void 0 && tg.MainButton) {
            tg.MainButton.hideProgress();
          }
          return _context.f(5);
        case 6:
          return _context.a(2);
      }
    }, _callee, null, [[2, 4, 5, 6]]);
  })), [tgId, timezone, showToast]);
  var loadAreaDetail = useCallback(/*#__PURE__*/function () {
    var _ref6 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(areaId) {
      var params, detail, _t2;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            if (!(!tgId || !areaId)) {
              _context2.n = 1;
              break;
            }
            return _context2.a(2);
          case 1:
            setAreaDetailLoading(true);
            _context2.p = 2;
            params = new URLSearchParams({
              tg_id: String(tgId)
            });
            if (timezone) {
              params.set("tz", timezone);
            }
            _context2.n = 3;
            return fetchJSON("/api/areas/".concat(areaId, "?").concat(params.toString()));
          case 3:
            detail = _context2.v;
            setAreaDetail(detail);
            _context2.n = 5;
            break;
          case 4:
            _context2.p = 4;
            _t2 = _context2.v;
            console.error(_t2);
            showToast(_t2.message || "ÃÃ¥ Ã³Ã¤Ã Ã«Ã®Ã±Ã¼ Ã§Ã Ã£Ã°Ã³Ã§Ã¨Ã²Ã¼ Ã¤Ã Ã­Ã­Ã»Ã¥ Ã±Ã´Ã¥Ã°Ã»");
          case 5:
            _context2.p = 5;
            setAreaDetailLoading(false);
            return _context2.f(5);
          case 6:
            return _context2.a(2);
        }
      }, _callee2, null, [[2, 4, 5, 6]]);
    }));
    return function (_x2) {
      return _ref6.apply(this, arguments);
    };
  }(), [tgId, timezone, showToast]);
  var loadTasks = useCallback(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
    var withSpinner,
      params,
      payload,
      _args3 = arguments,
      _t3;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.p = _context3.n) {
        case 0:
          withSpinner = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : true;
          if (!(!tgId || !date)) {
            _context3.n = 1;
            break;
          }
          return _context3.a(2);
        case 1:
          if (withSpinner && tg !== null && tg !== void 0 && tg.MainButton) {
            tg.MainButton.showProgress();
          }
          _context3.p = 2;
          params = new URLSearchParams({
            tg_id: String(tgId),
            date: date,
            include_done: "true"
          });
          if (timezone) {
            params.set("tz", timezone);
          }
          _context3.n = 3;
          return fetchJSON("/api/tasks?".concat(params.toString()));
        case 3:
          payload = _context3.v;
          setTasksPayload(payload);
          if (payload.timezone) {
            setTimezone(payload.timezone);
          }
          _context3.n = 5;
          break;
        case 4:
          _context3.p = 4;
          _t3 = _context3.v;
          console.error(_t3);
          showToast(_t3.message || "ÃÃ¥ Ã³Ã¤Ã Ã«Ã®Ã±Ã¼ Ã§Ã Ã£Ã°Ã³Ã§Ã¨Ã²Ã¼ Ã§Ã Ã¤Ã Ã·Ã¨");
        case 5:
          _context3.p = 5;
          if (withSpinner && tg !== null && tg !== void 0 && tg.MainButton) {
            tg.MainButton.hideProgress();
          }
          return _context3.f(5);
        case 6:
          return _context3.a(2);
      }
    }, _callee3, null, [[2, 4, 5, 6]]);
  })), [tgId, date, timezone, showToast]);
  useEffect(function () {
    if (tgId) {
      loadAreas(true);
      loadTasks(false);
    }
  }, [tgId, loadAreas, loadTasks]);
  useEffect(function () {
    if (selectedAreaId) {
      loadAreaDetail(selectedAreaId);
    }
  }, [selectedAreaId, loadAreaDetail]);
  useEffect(function () {
    loadTasks(false);
  }, [date]);
  var handleOpenAreaModal = useCallback(function (detail) {
    if (detail !== null && detail !== void 0 && detail.area) {
      var _detail$area$priority, _detail$overview;
      setAreaFormState({
        id: detail.area.id,
        name: detail.area.name || "",
        icon: detail.area.icon || "",
        short_desc: detail.area.short_desc || "",
        priority: (_detail$area$priority = detail.area.priority) !== null && _detail$area$priority !== void 0 ? _detail$area$priority : "",
        one_thing: ((_detail$overview = detail.overview) === null || _detail$overview === void 0 ? void 0 : _detail$overview.one_thing) || ""
      });
    } else {
      setAreaFormState({
        id: null,
        name: "",
        icon: "",
        short_desc: "",
        priority: "",
        one_thing: ""
      });
    }
    setAreaModalOpen(true);
  }, []);
  var handleAreaFormSubmit = useCallback(/*#__PURE__*/function () {
    var _ref8 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(event) {
      var _areaFormState$name;
      var _areaFormState$icon, _areaFormState$short_, _areaFormState$one_th, _t4;
      return _regenerator().w(function (_context4) {
        while (1) switch (_context4.p = _context4.n) {
          case 0:
            event.preventDefault();
            if (tgId) {
              _context4.n = 1;
              break;
            }
            return _context4.a(2);
          case 1:
            if ((_areaFormState$name = areaFormState.name) !== null && _areaFormState$name !== void 0 && _areaFormState$name.trim()) {
              _context4.n = 2;
              break;
            }
            showToast("ÃÃ Ã§Ã¢Ã Ã­Ã¨Ã¥ Ã±Ã´Ã¥Ã°Ã» Ã­Ã¥ Ã¬Ã®Ã¦Ã¥Ã² Ã¡Ã»Ã²Ã¼ Ã¯Ã³Ã±Ã²Ã»Ã¬");
            return _context4.a(2);
          case 2:
            _context4.p = 2;
            _context4.n = 3;
            return fetchJSON("/api/areas", {
              method: "POST",
              body: JSON.stringify({
                tg_id: tgId,
                area_id: areaFormState.id,
                name: areaFormState.name.trim(),
                icon: ((_areaFormState$icon = areaFormState.icon) === null || _areaFormState$icon === void 0 ? void 0 : _areaFormState$icon.trim()) || null,
                short_desc: ((_areaFormState$short_ = areaFormState.short_desc) === null || _areaFormState$short_ === void 0 ? void 0 : _areaFormState$short_.trim()) || null,
                priority: areaFormState.priority ? Number(areaFormState.priority) : null,
                one_thing: ((_areaFormState$one_th = areaFormState.one_thing) === null || _areaFormState$one_th === void 0 ? void 0 : _areaFormState$one_th.trim()) || null,
                tz: timezone
              })
            });
          case 3:
            showToast("ÃÃ´Ã¥Ã°Ã  Ã±Ã®ÃµÃ°Ã Ã­Ã¥Ã­Ã ");
            setAreaModalOpen(false);
            _context4.n = 4;
            return loadAreas(false);
          case 4:
            _context4.n = 6;
            break;
          case 5:
            _context4.p = 5;
            _t4 = _context4.v;
            console.error(_t4);
            showToast(_t4.message || "ÃÃ¥ Ã³Ã¤Ã Ã«Ã®Ã±Ã¼ Ã±Ã®ÃµÃ°Ã Ã­Ã¨Ã²Ã¼ Ã±Ã´Ã¥Ã°Ã³");
          case 6:
            return _context4.a(2);
        }
      }, _callee4, null, [[2, 5]]);
    }));
    return function (_x3) {
      return _ref8.apply(this, arguments);
    };
  }(), [tgId, areaFormState, timezone, loadAreas, showToast]);
  var handleTouchArea = useCallback(/*#__PURE__*/function () {
    var _ref9 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(areaId) {
      var _t5;
      return _regenerator().w(function (_context5) {
        while (1) switch (_context5.p = _context5.n) {
          case 0:
            if (!(!tgId || !areaId)) {
              _context5.n = 1;
              break;
            }
            return _context5.a(2);
          case 1:
            _context5.p = 1;
            _context5.n = 2;
            return fetchJSON("/api/areas/".concat(areaId, "/touch"), {
              method: "POST",
              body: JSON.stringify({
                tg_id: tgId,
                tz: timezone
              })
            });
          case 2:
            showToast("ÃÃ´Ã¥Ã°Ã  Ã®Ã¡Ã­Ã®Ã¢Ã«Ã¥Ã­Ã ");
            _context5.n = 3;
            return Promise.all([loadAreas(false), loadAreaDetail(areaId)]);
          case 3:
            _context5.n = 5;
            break;
          case 4:
            _context5.p = 4;
            _t5 = _context5.v;
            console.error(_t5);
            showToast(_t5.message || "ÃÃ¥ Ã³Ã¤Ã Ã«Ã®Ã±Ã¼ Ã®Ã¡Ã­Ã®Ã¢Ã¨Ã²Ã¼ Ã±Ã´Ã¥Ã°Ã³");
          case 5:
            return _context5.a(2);
        }
      }, _callee5, null, [[1, 4]]);
    }));
    return function (_x4) {
      return _ref9.apply(this, arguments);
    };
  }(), [tgId, timezone, loadAreas, loadAreaDetail, showToast]);
  var handleOpenTaskModal = useCallback(function () {
    var _areaDetail$area;
    var areaId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    setPendingAreaId(areaId);
    setTaskFormState({
      text: "",
      area: "",
      date: date
    });
    if (areaId && areaDetail !== null && areaDetail !== void 0 && (_areaDetail$area = areaDetail.area) !== null && _areaDetail$area !== void 0 && _areaDetail$area.slug) {
      setTaskFormState(function (prev) {
        return _objectSpread(_objectSpread({}, prev), {}, {
          area: areaDetail.area.slug
        });
      });
    } else if (areaId) {
      var area = areas.find(function (item) {
        return item.id === areaId;
      });
      if (area !== null && area !== void 0 && area.slug) {
        setTaskFormState(function (prev) {
          return _objectSpread(_objectSpread({}, prev), {}, {
            area: area.slug
          });
        });
      }
    }
    setTaskModalOpen(true);
  }, [date, areaDetail, areas]);
  var handleTaskFormSubmit = useCallback(/*#__PURE__*/function () {
    var _ref0 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(event) {
      var _taskFormState$text;
      var _taskFormState$area, _t6;
      return _regenerator().w(function (_context6) {
        while (1) switch (_context6.p = _context6.n) {
          case 0:
            event.preventDefault();
            if (tgId) {
              _context6.n = 1;
              break;
            }
            return _context6.a(2);
          case 1:
            if ((_taskFormState$text = taskFormState.text) !== null && _taskFormState$text !== void 0 && _taskFormState$text.trim()) {
              _context6.n = 2;
              break;
            }
            showToast("ÃÃ¥ÃªÃ±Ã² Ã§Ã Ã¤Ã Ã·Ã¨ Ã­Ã¥ Ã¬Ã®Ã¦Ã¥Ã² Ã¡Ã»Ã²Ã¼ Ã¯Ã³Ã±Ã²Ã»Ã¬");
            return _context6.a(2);
          case 2:
            _context6.p = 2;
            _context6.n = 3;
            return fetchJSON("/api/tasks", {
              method: "POST",
              body: JSON.stringify({
                tg_id: tgId,
                text: taskFormState.text.trim(),
                date: taskFormState.date || date,
                area: ((_taskFormState$area = taskFormState.area) === null || _taskFormState$area === void 0 ? void 0 : _taskFormState$area.trim()) || null,
                area_id: pendingAreaId,
                tz: timezone
              })
            });
          case 3:
            showToast("ÃÃ Ã¤Ã Ã·Ã  Ã¤Ã®Ã¡Ã Ã¢Ã«Ã¥Ã­Ã ");
            setTaskModalOpen(false);
            _context6.n = 4;
            return Promise.all([loadTasks(false), loadAreas(false)]);
          case 4:
            if (!pendingAreaId) {
              _context6.n = 5;
              break;
            }
            _context6.n = 5;
            return loadAreaDetail(pendingAreaId);
          case 5:
            _context6.n = 7;
            break;
          case 6:
            _context6.p = 6;
            _t6 = _context6.v;
            console.error(_t6);
            showToast(_t6.message || "ÃÃ¥ Ã³Ã¤Ã Ã«Ã®Ã±Ã¼ Ã±Ã®ÃµÃ°Ã Ã­Ã¨Ã²Ã¼ Ã§Ã Ã¤Ã Ã·Ã³");
          case 7:
            _context6.p = 7;
            setPendingAreaId(null);
            return _context6.f(7);
          case 8:
            return _context6.a(2);
        }
      }, _callee6, null, [[2, 6, 7, 8]]);
    }));
    return function (_x5) {
      return _ref0.apply(this, arguments);
    };
  }(), [tgId, taskFormState, pendingAreaId, date, timezone, loadTasks, loadAreas, loadAreaDetail, showToast]);
  var handleUpdateTaskStatus = useCallback(/*#__PURE__*/function () {
    var _ref1 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(occurrenceId, status) {
      var _t7;
      return _regenerator().w(function (_context7) {
        while (1) switch (_context7.p = _context7.n) {
          case 0:
            if (tgId) {
              _context7.n = 1;
              break;
            }
            return _context7.a(2);
          case 1:
            _context7.p = 1;
            _context7.n = 2;
            return fetchJSON("/api/occurrences/".concat(occurrenceId), {
              method: "PATCH",
              body: JSON.stringify({
                tg_id: tgId,
                status: status,
                tz: timezone
              })
            });
          case 2:
            _context7.n = 3;
            return loadTasks(false);
          case 3:
            showToast("ÃÃ²Ã Ã²Ã³Ã± Ã®Ã¡Ã­Ã®Ã¢Ã«Â¸Ã­");
            _context7.n = 5;
            break;
          case 4:
            _context7.p = 4;
            _t7 = _context7.v;
            console.error(_t7);
            showToast(_t7.message || "ÃÃ¥ Ã³Ã¤Ã Ã«Ã®Ã±Ã¼ Ã®Ã¡Ã­Ã®Ã¢Ã¨Ã²Ã¼ Ã±Ã²Ã Ã²Ã³Ã±");
          case 5:
            return _context7.a(2);
        }
      }, _callee7, null, [[1, 4]]);
    }));
    return function (_x6, _x7) {
      return _ref1.apply(this, arguments);
    };
  }(), [tgId, timezone, loadTasks, showToast]);
  var handleReorderTasks = useCallback(/*#__PURE__*/function () {
    var _ref10 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(sourceId, targetId) {
      var items, sourceIndex, targetIndex, _items$splice, _items$splice2, moved, _t8;
      return _regenerator().w(function (_context8) {
        while (1) switch (_context8.p = _context8.n) {
          case 0:
            if (!(!tasksPayload || !sourceId || !targetId || sourceId === targetId)) {
              _context8.n = 1;
              break;
            }
            return _context8.a(2);
          case 1:
            items = _toConsumableArray(tasksPayload.tasks || []);
            sourceIndex = items.findIndex(function (item) {
              return String(item.occurrence_id) === String(sourceId);
            });
            targetIndex = items.findIndex(function (item) {
              return String(item.occurrence_id) === String(targetId);
            });
            if (!(sourceIndex === -1 || targetIndex === -1)) {
              _context8.n = 2;
              break;
            }
            return _context8.a(2);
          case 2:
            _items$splice = items.splice(sourceIndex, 1), _items$splice2 = _slicedToArray(_items$splice, 1), moved = _items$splice2[0];
            items.splice(sourceIndex < targetIndex ? targetIndex + 1 : targetIndex, 0, moved);
            setTasksPayload(function (prev) {
              return prev ? _objectSpread(_objectSpread({}, prev), {}, {
                tasks: items
              }) : prev;
            });
            if (tgId) {
              _context8.n = 3;
              break;
            }
            return _context8.a(2);
          case 3:
            _context8.p = 3;
            _context8.n = 4;
            return fetchJSON("/api/occurrences/reorder", {
              method: "POST",
              body: JSON.stringify({
                tg_id: tgId,
                tz: timezone,
                items: items.map(function (task, index) {
                  return {
                    occurrence_id: task.occurrence_id,
                    order_index: (index + 1) * 1000
                  };
                })
              })
            });
          case 4:
            _context8.n = 6;
            break;
          case 5:
            _context8.p = 5;
            _t8 = _context8.v;
            console.error(_t8);
            showToast(_t8.message || "ÃÃ¥ Ã³Ã¤Ã Ã«Ã®Ã±Ã¼ Ã±Ã®ÃµÃ°Ã Ã­Ã¨Ã²Ã¼ Ã¯Ã®Ã°Ã¿Ã¤Ã®Ãª");
            loadTasks(false);
          case 6:
            return _context8.a(2);
        }
      }, _callee8, null, [[3, 5]]);
    }));
    return function (_x8, _x9) {
      return _ref10.apply(this, arguments);
    };
  }(), [tasksPayload, tgId, timezone, loadTasks, showToast]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "app"
  }, /*#__PURE__*/React.createElement("nav", {
    className: "tabs",
    role: "tablist"
  }, /*#__PURE__*/React.createElement("button", {
    id: "tab-areas",
    type: "button",
    className: "tab".concat(view === "areas" ? " tab--active" : ""),
    role: "tab",
    "aria-selected": view === "areas",
    onClick: function onClick() {
      return setView("areas");
    }
  }, "\xC3\x91\xC3\xB4\xC3\xA5\xC3\xB0\xC3\xBB"), /*#__PURE__*/React.createElement("button", {
    id: "tab-tasks",
    type: "button",
    className: "tab".concat(view === "tasks" ? " tab--active" : ""),
    role: "tab",
    "aria-selected": view === "tasks",
    onClick: function onClick() {
      return setView("tasks");
    }
  }, "\xC3\x87\xC3\xA0\xC3\xA4\xC3\xA0\xC3\xB7\xC3\xA8")), view === "areas" ? /*#__PURE__*/React.createElement(AreasView, {
    areas: areas,
    areasLoading: areasLoading || areaDetailLoading,
    selectedAreaId: selectedAreaId,
    areaDetail: areaDetail,
    onSelectArea: setSelectedAreaId,
    onTouchArea: handleTouchArea,
    onCreateTask: handleOpenTaskModal,
    onOpenAreaModal: handleOpenAreaModal,
    onRefresh: loadAreas
  }) : /*#__PURE__*/React.createElement(TasksView, {
    payload: tasksPayload,
    date: date,
    onShiftDate: function onShiftDate(delta) {
      var current = new Date(date + "T00:00:00");
      current.setDate(current.getDate() + delta);
      setDate(current.toISOString().slice(0, 10));
    },
    onSelectDate: function onSelectDate(nextDate) {
      if (nextDate) {
        setDate(nextDate);
      }
    },
    showDone: showDone,
    onToggleDone: setShowDone,
    onRefresh: function onRefresh() {
      var withSpinner = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      return loadTasks(withSpinner);
    },
    onUpdateStatus: handleUpdateTaskStatus,
    onReorder: handleReorderTasks
  }), /*#__PURE__*/React.createElement("dialog", {
    className: "modal",
    ref: areaDialogRef,
    onClose: function onClose() {
      return setAreaModalOpen(false);
    },
    onCancel: function onCancel() {
      return setAreaModalOpen(false);
    }
  }, /*#__PURE__*/React.createElement("form", {
    className: "modal__content",
    onSubmit: handleAreaFormSubmit
  }, /*#__PURE__*/React.createElement("h2", null, areaFormState.id ? "ÃÃ¥Ã¤Ã ÃªÃ²Ã¨Ã°Ã®Ã¢Ã Ã­Ã¨Ã¥ Ã±Ã´Ã¥Ã°Ã»" : "ÃÃ®Ã¢Ã Ã¿ Ã±Ã´Ã¥Ã°Ã "), /*#__PURE__*/React.createElement("label", null, "\xC3\x8D\xC3\xA0\xC3\xA7\xC3\xA2\xC3\xA0\xC3\xAD\xC3\xA8\xC3\xA5", /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: areaFormState.name,
    onChange: function onChange(event) {
      return setAreaFormState(function (prev) {
        return _objectSpread(_objectSpread({}, prev), {}, {
          name: event.target.value
        });
      });
    },
    required: true
  })), /*#__PURE__*/React.createElement("label", null, "\xC3\x88\xC3\xAA\xC3\xAE\xC3\xAD\xC3\xAA\xC3\xA0 (emoji)", /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: areaFormState.icon,
    onChange: function onChange(event) {
      return setAreaFormState(function (prev) {
        return _objectSpread(_objectSpread({}, prev), {}, {
          icon: event.target.value
        });
      });
    },
    placeholder: "\\uD83E\\uDDE0"
  })), /*#__PURE__*/React.createElement("label", null, "\xC3\x8A\xC3\xB0\xC3\xA0\xC3\xB2\xC3\xAA\xC3\xAE\xC3\xA5 \xC3\xAE\xC3\xAF\xC3\xA8\xC3\xB1\xC3\xA0\xC3\xAD\xC3\xA8\xC3\xA5", /*#__PURE__*/React.createElement("textarea", {
    value: areaFormState.short_desc,
    rows: 2,
    onChange: function onChange(event) {
      return setAreaFormState(function (prev) {
        return _objectSpread(_objectSpread({}, prev), {}, {
          short_desc: event.target.value
        });
      });
    }
  })), /*#__PURE__*/React.createElement("label", null, "\xC3\x8F\xC3\xB0\xC3\xA8\xC3\xAE\xC3\xB0\xC3\xA8\xC3\xB2\xC3\xA5\xC3\xB2 (1-5)", /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "1",
    max: "5",
    value: areaFormState.priority,
    onChange: function onChange(event) {
      return setAreaFormState(function (prev) {
        return _objectSpread(_objectSpread({}, prev), {}, {
          priority: event.target.value
        });
      });
    }
  })), /*#__PURE__*/React.createElement("label", null, "One Thing", /*#__PURE__*/React.createElement("textarea", {
    rows: 2,
    value: areaFormState.one_thing,
    onChange: function onChange(event) {
      return setAreaFormState(function (prev) {
        return _objectSpread(_objectSpread({}, prev), {}, {
          one_thing: event.target.value
        });
      });
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "modal__actions"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn",
    onClick: function onClick() {
      return setAreaModalOpen(false);
    }
  }, "\xC3\x8E\xC3\xB2\xC3\xAC\xC3\xA5\xC3\xAD\xC3\xA0"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-accent"
  }, "\xC3\x91\xC3\xAE\xC3\xB5\xC3\xB0\xC3\xA0\xC3\xAD\xC3\xA8\xC3\xB2\xC3\xBC")))), /*#__PURE__*/React.createElement("dialog", {
    className: "modal",
    ref: taskDialogRef,
    onClose: function onClose() {
      return setTaskModalOpen(false);
    },
    onCancel: function onCancel() {
      return setTaskModalOpen(false);
    }
  }, /*#__PURE__*/React.createElement("form", {
    className: "modal__content",
    onSubmit: handleTaskFormSubmit
  }, /*#__PURE__*/React.createElement("h2", null, "\xC3\x8D\xC3\xAE\xC3\xA2\xC3\xA0\xC3\xBF \xC3\xA7\xC3\xA0\xC3\xA4\xC3\xA0\xC3\xB7\xC3\xA0"), /*#__PURE__*/React.createElement("label", null, "\xC3\x92\xC3\xA5\xC3\xAA\xC3\xB1\xC3\xB2", /*#__PURE__*/React.createElement("textarea", {
    value: taskFormState.text,
    rows: 3,
    onChange: function onChange(event) {
      return setTaskFormState(function (prev) {
        return _objectSpread(_objectSpread({}, prev), {}, {
          text: event.target.value
        });
      });
    },
    required: true
  })), /*#__PURE__*/React.createElement("label", null, "\xC3\x91\xC3\xB4\xC3\xA5\xC3\xB0\xC3\xA0 (slug, \xC3\xAE\xC3\xAF\xC3\xB6\xC3\xA8\xC3\xAE\xC3\xAD\xC3\xA0\xC3\xAB\xC3\xBC\xC3\xAD\xC3\xAE)", /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: taskFormState.area,
    onChange: function onChange(event) {
      return setTaskFormState(function (prev) {
        return _objectSpread(_objectSpread({}, prev), {}, {
          area: event.target.value
        });
      });
    },
    placeholder: "work"
  })), /*#__PURE__*/React.createElement("label", null, "\xC3\x84\xC3\xA0\xC3\xB2\xC3\xA0", /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: taskFormState.date,
    onChange: function onChange(event) {
      return setTaskFormState(function (prev) {
        return _objectSpread(_objectSpread({}, prev), {}, {
          date: event.target.value
        });
      });
    },
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "modal__actions"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn",
    onClick: function onClick() {
      return setTaskModalOpen(false);
    }
  }, "\xC3\x8E\xC3\xB2\xC3\xAC\xC3\xA5\xC3\xAD\xC3\xA0"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-accent"
  }, "\xC3\x91\xC3\xAE\xC3\xB5\xC3\xB0\xC3\xA0\xC3\xAD\xC3\xA8\xC3\xB2\xC3\xBC"))))), /*#__PURE__*/React.createElement("div", {
    id: "toast-container"
  }, toastMessage ? /*#__PURE__*/React.createElement(Toast, {
    message: toastMessage
  }) : null));
}
var rootElement = document.getElementById("app-root");
var root = ReactDOM.createRoot(rootElement);
root.render(/*#__PURE__*/React.createElement(App, null));
