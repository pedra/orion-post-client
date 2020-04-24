/*
 *  Global functions
 */

const _ = e => document.querySelector(e) || false
const _a = e => document.querySelectorAll(e) || false
const _f = f => ('function' == typeof f ? f : () => null)
const _dez = v => (v < 10 ? '0' + v : v)
