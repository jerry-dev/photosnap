(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  function toArray(objectOrArray) {
    objectOrArray = objectOrArray || [];
    return Array.isArray(objectOrArray) ? objectOrArray : [objectOrArray];
  }

  function log(msg) {
    return `[Vaadin.Router] ${msg}`;
  }

  function logValue(value) {
    if (typeof value !== 'object') {
      return String(value);
    }

    const stringType = Object.prototype.toString.call(value).match(/ (.*)\]$/)[1];
    if (stringType === 'Object' || stringType === 'Array') {
      return `${stringType} ${JSON.stringify(value)}`;
    } else {
      return stringType;
    }
  }

  const MODULE = 'module';
  const NOMODULE = 'nomodule';
  const bundleKeys = [MODULE, NOMODULE];

  function ensureBundle(src) {
    if (!src.match(/.+\.[m]?js$/)) {
      throw new Error(
        log(`Unsupported type for bundle "${src}": .js or .mjs expected.`)
      );
    }
  }

  function ensureRoute(route) {
    if (!route || !isString(route.path)) {
      throw new Error(
        log(`Expected route config to be an object with a "path" string property, or an array of such objects`)
      );
    }

    const bundle = route.bundle;

    const stringKeys = ['component', 'redirect', 'bundle'];
    if (
      !isFunction(route.action) &&
      !Array.isArray(route.children) &&
      !isFunction(route.children) &&
      !isObject(bundle) &&
      !stringKeys.some(key => isString(route[key]))
    ) {
      throw new Error(
        log(
          `Expected route config "${route.path}" to include either "${stringKeys.join('", "')}" ` +
          `or "action" function but none found.`
        )
      );
    }

    if (bundle) {
      if (isString(bundle)) {
        ensureBundle(bundle);
      } else if (!bundleKeys.some(key => key in bundle)) {
        throw new Error(
          log('Expected route bundle to include either "' + NOMODULE + '" or "' + MODULE + '" keys, or both')
        );
      } else {
        bundleKeys.forEach(key => key in bundle && ensureBundle(bundle[key]));
      }
    }

    if (route.redirect) {
      ['bundle', 'component'].forEach(overriddenProp => {
        if (overriddenProp in route) {
          console.warn(
            log(
              `Route config "${route.path}" has both "redirect" and "${overriddenProp}" properties, ` +
              `and "redirect" will always override the latter. Did you mean to only use "${overriddenProp}"?`
            )
          );
        }
      });
    }
  }

  function ensureRoutes(routes) {
    toArray(routes).forEach(route => ensureRoute(route));
  }

  function loadScript(src, key) {
    let script = document.head.querySelector('script[src="' + src + '"][async]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('src', src);
      if (key === MODULE) {
        script.setAttribute('type', MODULE);
      } else if (key === NOMODULE) {
        script.setAttribute(NOMODULE, '');
      }
      script.async = true;
    }
    return new Promise((resolve, reject) => {
      script.onreadystatechange = script.onload = e => {
        script.__dynamicImportLoaded = true;
        resolve(e);
      };
      script.onerror = e => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        reject(e);
      };
      if (script.parentNode === null) {
        document.head.appendChild(script);
      } else if (script.__dynamicImportLoaded) {
        resolve();
      }
    });
  }

  function loadBundle(bundle) {
    if (isString(bundle)) {
      return loadScript(bundle);
    } else {
      return Promise.race(
        bundleKeys
          .filter(key => key in bundle)
          .map(key => loadScript(bundle[key], key))
      );
    }
  }

  function fireRouterEvent(type, detail) {
    return !window.dispatchEvent(new CustomEvent(
      `vaadin-router-${type}`,
      {cancelable: type === 'go', detail}
    ));
  }

  function isObject(o) {
    // guard against null passing the typeof check
    return typeof o === 'object' && !!o;
  }

  function isFunction(f) {
    return typeof f === 'function';
  }

  function isString(s) {
    return typeof s === 'string';
  }

  function getNotFoundError(context) {
    const error = new Error(log(`Page not found (${context.pathname})`));
    error.context = context;
    error.code = 404;
    return error;
  }

  const notFoundResult = new (class NotFoundResult {})();

  /* istanbul ignore next: coverage is calculated in Chrome, this code is for IE */
  function getAnchorOrigin(anchor) {
    // IE11: on HTTP and HTTPS the default port is not included into
    // window.location.origin, so won't include it here either.
    const port = anchor.port;
    const protocol = anchor.protocol;
    const defaultHttp = protocol === 'http:' && port === '80';
    const defaultHttps = protocol === 'https:' && port === '443';
    const host = (defaultHttp || defaultHttps)
      ? anchor.hostname // does not include the port number (e.g. www.example.org)
      : anchor.host; // does include the port number (e.g. www.example.org:80)
    return `${protocol}//${host}`;
  }

  // The list of checks is not complete:
  //  - SVG support is missing
  //  - the 'rel' attribute is not considered
  function vaadinRouterGlobalClickHandler(event) {
    // ignore the click if the default action is prevented
    if (event.defaultPrevented) {
      return;
    }

    // ignore the click if not with the primary mouse button
    if (event.button !== 0) {
      return;
    }

    // ignore the click if a modifier key is pressed
    if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    // find the <a> element that the click is at (or within)
    let anchor = event.target;
    const path = event.composedPath
      ? event.composedPath()
      : (event.path || []);

    // FIXME(web-padawan): `Symbol.iterator` used by webcomponentsjs is broken for arrays
    // example to check: `for...of` loop here throws the "Not yet implemented" error
    for (let i = 0; i < path.length; i++) {
      const target = path[i];
      if (target.nodeName && target.nodeName.toLowerCase() === 'a') {
        anchor = target;
        break;
      }
    }

    while (anchor && anchor.nodeName.toLowerCase() !== 'a') {
      anchor = anchor.parentNode;
    }

    // ignore the click if not at an <a> element
    if (!anchor || anchor.nodeName.toLowerCase() !== 'a') {
      return;
    }

    // ignore the click if the <a> element has a non-default target
    if (anchor.target && anchor.target.toLowerCase() !== '_self') {
      return;
    }

    // ignore the click if the <a> element has the 'download' attribute
    if (anchor.hasAttribute('download')) {
      return;
    }

    // ignore the click if the <a> element has the 'router-ignore' attribute
    if (anchor.hasAttribute('router-ignore')) {
      return;
    }

    // ignore the click if the target URL is a fragment on the current page
    if (anchor.pathname === window.location.pathname && anchor.hash !== '') {
      return;
    }

    // ignore the click if the target is external to the app
    // In IE11 HTMLAnchorElement does not have the `origin` property
    const origin = anchor.origin || getAnchorOrigin(anchor);
    if (origin !== window.location.origin) {
      return;
    }

    // if none of the above, convert the click into a navigation event
    const {pathname, search, hash} = anchor;
    if (fireRouterEvent('go', {pathname, search, hash})) {
      event.preventDefault();
    }
  }

  /**
   * A navigation trigger for Vaadin Router that translated clicks on `<a>` links
   * into Vaadin Router navigation events.
   *
   * Only regular clicks on in-app links are translated (primary mouse button, no
   * modifier keys, the target href is within the app's URL space).
   *
   * @memberOf Router.NavigationTrigger
   * @type {NavigationTrigger}
   */
  const CLICK = {
    activate() {
      window.document.addEventListener('click', vaadinRouterGlobalClickHandler);
    },

    inactivate() {
      window.document.removeEventListener('click', vaadinRouterGlobalClickHandler);
    }
  };

  // PopStateEvent constructor shim
  const isIE = /Trident/.test(navigator.userAgent);

  /* istanbul ignore next: coverage is calculated in Chrome, this code is for IE */
  if (isIE && !isFunction(window.PopStateEvent)) {
    window.PopStateEvent = function(inType, params) {
      params = params || {};
      var e = document.createEvent('Event');
      e.initEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable));
      e.state = params.state || null;
      return e;
    };
    window.PopStateEvent.prototype = window.Event.prototype;
  }

  function vaadinRouterGlobalPopstateHandler(event) {
    if (event.state === 'vaadin-router-ignore') {
      return;
    }
    const {pathname, search, hash} = window.location;
    fireRouterEvent('go', {pathname, search, hash});
  }

  /**
   * A navigation trigger for Vaadin Router that translates popstate events into
   * Vaadin Router navigation events.
   *
   * @memberOf Router.NavigationTrigger
   * @type {NavigationTrigger}
   */
  const POPSTATE = {
    activate() {
      window.addEventListener('popstate', vaadinRouterGlobalPopstateHandler);
    },

    inactivate() {
      window.removeEventListener('popstate', vaadinRouterGlobalPopstateHandler);
    }
  };

  /**
   * Expose `pathToRegexp`.
   */
  var pathToRegexp_1 = pathToRegexp;
  var parse_1 = parse;
  var compile_1 = compile;
  var tokensToFunction_1 = tokensToFunction;
  var tokensToRegExp_1 = tokensToRegExp;

  /**
   * Default configs.
   */
  var DEFAULT_DELIMITER = '/';
  var DEFAULT_DELIMITERS = './';

  /**
   * The main path matching regexp utility.
   *
   * @type {RegExp}
   */
  var PATH_REGEXP = new RegExp([
    // Match escaped characters that would otherwise appear in future matches.
    // This allows the user to escape special characters that won't transform.
    '(\\\\.)',
    // Match Express-style parameters and un-named parameters with a prefix
    // and optional suffixes. Matches appear as:
    //
    // ":test(\\d+)?" => ["test", "\d+", undefined, "?"]
    // "(\\d+)"  => [undefined, undefined, "\d+", undefined]
    '(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?'
  ].join('|'), 'g');

  /**
   * Parse a string for the raw tokens.
   *
   * @param  {string}  str
   * @param  {Object=} options
   * @return {!Array}
   */
  function parse (str, options) {
    var tokens = [];
    var key = 0;
    var index = 0;
    var path = '';
    var defaultDelimiter = (options && options.delimiter) || DEFAULT_DELIMITER;
    var delimiters = (options && options.delimiters) || DEFAULT_DELIMITERS;
    var pathEscaped = false;
    var res;

    while ((res = PATH_REGEXP.exec(str)) !== null) {
      var m = res[0];
      var escaped = res[1];
      var offset = res.index;
      path += str.slice(index, offset);
      index = offset + m.length;

      // Ignore already escaped sequences.
      if (escaped) {
        path += escaped[1];
        pathEscaped = true;
        continue
      }

      var prev = '';
      var next = str[index];
      var name = res[2];
      var capture = res[3];
      var group = res[4];
      var modifier = res[5];

      if (!pathEscaped && path.length) {
        var k = path.length - 1;

        if (delimiters.indexOf(path[k]) > -1) {
          prev = path[k];
          path = path.slice(0, k);
        }
      }

      // Push the current path onto the tokens.
      if (path) {
        tokens.push(path);
        path = '';
        pathEscaped = false;
      }

      var partial = prev !== '' && next !== undefined && next !== prev;
      var repeat = modifier === '+' || modifier === '*';
      var optional = modifier === '?' || modifier === '*';
      var delimiter = prev || defaultDelimiter;
      var pattern = capture || group;

      tokens.push({
        name: name || key++,
        prefix: prev,
        delimiter: delimiter,
        optional: optional,
        repeat: repeat,
        partial: partial,
        pattern: pattern ? escapeGroup(pattern) : '[^' + escapeString(delimiter) + ']+?'
      });
    }

    // Push any remaining characters.
    if (path || index < str.length) {
      tokens.push(path + str.substr(index));
    }

    return tokens
  }

  /**
   * Compile a string to a template function for the path.
   *
   * @param  {string}             str
   * @param  {Object=}            options
   * @return {!function(Object=, Object=)}
   */
  function compile (str, options) {
    return tokensToFunction(parse(str, options))
  }

  /**
   * Expose a method for transforming tokens into the path function.
   */
  function tokensToFunction (tokens) {
    // Compile all the tokens into regexps.
    var matches = new Array(tokens.length);

    // Compile all the patterns before compilation.
    for (var i = 0; i < tokens.length; i++) {
      if (typeof tokens[i] === 'object') {
        matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$');
      }
    }

    return function (data, options) {
      var path = '';
      var encode = (options && options.encode) || encodeURIComponent;

      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (typeof token === 'string') {
          path += token;
          continue
        }

        var value = data ? data[token.name] : undefined;
        var segment;

        if (Array.isArray(value)) {
          if (!token.repeat) {
            throw new TypeError('Expected "' + token.name + '" to not repeat, but got array')
          }

          if (value.length === 0) {
            if (token.optional) continue

            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }

          for (var j = 0; j < value.length; j++) {
            segment = encode(value[j], token);

            if (!matches[i].test(segment)) {
              throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '"')
            }

            path += (j === 0 ? token.prefix : token.delimiter) + segment;
          }

          continue
        }

        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          segment = encode(String(value), token);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but got "' + segment + '"')
          }

          path += token.prefix + segment;
          continue
        }

        if (token.optional) {
          // Prepend partial segment prefixes.
          if (token.partial) path += token.prefix;

          continue
        }

        throw new TypeError('Expected "' + token.name + '" to be ' + (token.repeat ? 'an array' : 'a string'))
      }

      return path
    }
  }

  /**
   * Escape a regular expression string.
   *
   * @param  {string} str
   * @return {string}
   */
  function escapeString (str) {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1')
  }

  /**
   * Escape the capturing group by escaping special characters and meaning.
   *
   * @param  {string} group
   * @return {string}
   */
  function escapeGroup (group) {
    return group.replace(/([=!:$/()])/g, '\\$1')
  }

  /**
   * Get the flags for a regexp from the options.
   *
   * @param  {Object} options
   * @return {string}
   */
  function flags (options) {
    return options && options.sensitive ? '' : 'i'
  }

  /**
   * Pull out keys from a regexp.
   *
   * @param  {!RegExp} path
   * @param  {Array=}  keys
   * @return {!RegExp}
   */
  function regexpToRegexp (path, keys) {
    if (!keys) return path

    // Use a negative lookahead to match only capturing groups.
    var groups = path.source.match(/\((?!\?)/g);

    if (groups) {
      for (var i = 0; i < groups.length; i++) {
        keys.push({
          name: i,
          prefix: null,
          delimiter: null,
          optional: false,
          repeat: false,
          partial: false,
          pattern: null
        });
      }
    }

    return path
  }

  /**
   * Transform an array into a regexp.
   *
   * @param  {!Array}  path
   * @param  {Array=}  keys
   * @param  {Object=} options
   * @return {!RegExp}
   */
  function arrayToRegexp (path, keys, options) {
    var parts = [];

    for (var i = 0; i < path.length; i++) {
      parts.push(pathToRegexp(path[i], keys, options).source);
    }

    return new RegExp('(?:' + parts.join('|') + ')', flags(options))
  }

  /**
   * Create a path regexp from string input.
   *
   * @param  {string}  path
   * @param  {Array=}  keys
   * @param  {Object=} options
   * @return {!RegExp}
   */
  function stringToRegexp (path, keys, options) {
    return tokensToRegExp(parse(path, options), keys, options)
  }

  /**
   * Expose a function for taking tokens and returning a RegExp.
   *
   * @param  {!Array}  tokens
   * @param  {Array=}  keys
   * @param  {Object=} options
   * @return {!RegExp}
   */
  function tokensToRegExp (tokens, keys, options) {
    options = options || {};

    var strict = options.strict;
    var start = options.start !== false;
    var end = options.end !== false;
    var delimiter = escapeString(options.delimiter || DEFAULT_DELIMITER);
    var delimiters = options.delimiters || DEFAULT_DELIMITERS;
    var endsWith = [].concat(options.endsWith || []).map(escapeString).concat('$').join('|');
    var route = start ? '^' : '';
    var isEndDelimited = tokens.length === 0;

    // Iterate over the tokens and create our regexp string.
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      if (typeof token === 'string') {
        route += escapeString(token);
        isEndDelimited = i === tokens.length - 1 && delimiters.indexOf(token[token.length - 1]) > -1;
      } else {
        var capture = token.repeat
          ? '(?:' + token.pattern + ')(?:' + escapeString(token.delimiter) + '(?:' + token.pattern + '))*'
          : token.pattern;

        if (keys) keys.push(token);

        if (token.optional) {
          if (token.partial) {
            route += escapeString(token.prefix) + '(' + capture + ')?';
          } else {
            route += '(?:' + escapeString(token.prefix) + '(' + capture + '))?';
          }
        } else {
          route += escapeString(token.prefix) + '(' + capture + ')';
        }
      }
    }

    if (end) {
      if (!strict) route += '(?:' + delimiter + ')?';

      route += endsWith === '$' ? '$' : '(?=' + endsWith + ')';
    } else {
      if (!strict) route += '(?:' + delimiter + '(?=' + endsWith + '))?';
      if (!isEndDelimited) route += '(?=' + delimiter + '|' + endsWith + ')';
    }

    return new RegExp(route, flags(options))
  }

  /**
   * Normalize the given path string, returning a regular expression.
   *
   * An empty array can be passed in for the keys, which will hold the
   * placeholder key descriptions. For example, using `/user/:id`, `keys` will
   * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
   *
   * @param  {(string|RegExp|Array)} path
   * @param  {Array=}                keys
   * @param  {Object=}               options
   * @return {!RegExp}
   */
  function pathToRegexp (path, keys, options) {
    if (path instanceof RegExp) {
      return regexpToRegexp(path, keys)
    }

    if (Array.isArray(path)) {
      return arrayToRegexp(/** @type {!Array} */ (path), keys, options)
    }

    return stringToRegexp(/** @type {string} */ (path), keys, options)
  }
  pathToRegexp_1.parse = parse_1;
  pathToRegexp_1.compile = compile_1;
  pathToRegexp_1.tokensToFunction = tokensToFunction_1;
  pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

  /**
   * Universal Router (https://www.kriasoft.com/universal-router/)
   *
   * Copyright (c) 2015-present Kriasoft.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.txt file in the root directory of this source tree.
   */

  const {hasOwnProperty} = Object.prototype;
  const cache = new Map();
  // see https://github.com/pillarjs/path-to-regexp/issues/148
  cache.set('|false', {
    keys: [],
    pattern: /(?:)/
  });

  function decodeParam(val) {
    try {
      return decodeURIComponent(val);
    } catch (err) {
      return val;
    }
  }

  function matchPath(routepath, path, exact, parentKeys, parentParams) {
    exact = !!exact;
    const cacheKey = `${routepath}|${exact}`;
    let regexp = cache.get(cacheKey);

    if (!regexp) {
      const keys = [];
      regexp = {
        keys,
        pattern: pathToRegexp_1(routepath, keys, {
          end: exact,
          strict: routepath === ''
        }),
      };
      cache.set(cacheKey, regexp);
    }

    const m = regexp.pattern.exec(path);
    if (!m) {
      return null;
    }

    const params = Object.assign({}, parentParams);

    for (let i = 1; i < m.length; i++) {
      const key = regexp.keys[i - 1];
      const prop = key.name;
      const value = m[i];
      if (value !== undefined || !hasOwnProperty.call(params, prop)) {
        if (key.repeat) {
          params[prop] = value ? value.split(key.delimiter).map(decodeParam) : [];
        } else {
          params[prop] = value ? decodeParam(value) : value;
        }
      }
    }

    return {
      path: m[0],
      keys: (parentKeys || []).concat(regexp.keys),
      params,
    };
  }

  /**
   * Universal Router (https://www.kriasoft.com/universal-router/)
   *
   * Copyright (c) 2015-present Kriasoft.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.txt file in the root directory of this source tree.
   */

  /**
   * Traverses the routes tree and matches its nodes to the given pathname from
   * the root down to the leaves. Each match consumes a part of the pathname and
   * the matching process continues for as long as there is a matching child
   * route for the remaining part of the pathname.
   *
   * The returned value is a lazily evaluated iterator.
   *
   * The leading "/" in a route path matters only for the root of the routes
   * tree (or if all parent routes are ""). In all other cases a leading "/" in
   * a child route path has no significance.
   *
   * The trailing "/" in a _route path_ matters only for the leaves of the
   * routes tree. A leaf route with a trailing "/" matches only a pathname that
   * also has a trailing "/".
   *
   * The trailing "/" in a route path does not affect matching of child routes
   * in any way.
   *
   * The trailing "/" in a _pathname_ generally does not matter (except for
   * the case of leaf nodes described above).
   *
   * The "" and "/" routes have special treatment:
   *  1. as a single route
   *     the "" and "/" routes match only the "" and "/" pathnames respectively
   *  2. as a parent in the routes tree
   *     the "" route matches any pathname without consuming any part of it
   *     the "/" route matches any absolute pathname consuming its leading "/"
   *  3. as a leaf in the routes tree
   *     the "" and "/" routes match only if the entire pathname is consumed by
   *         the parent routes chain. In this case "" and "/" are equivalent.
   *  4. several directly nested "" or "/" routes
   *     - directly nested "" or "/" routes are 'squashed' (i.e. nesting two
   *       "/" routes does not require a double "/" in the pathname to match)
   *     - if there are only "" in the parent routes chain, no part of the
   *       pathname is consumed, and the leading "/" in the child routes' paths
   *       remains significant
   *
   * Side effect:
   *   - the routes tree { path: '' } matches only the '' pathname
   *   - the routes tree { path: '', children: [ { path: '' } ] } matches any
   *     pathname (for the tree root)
   *
   * Prefix matching can be enabled also by `children: true`.
   */
  function matchRoute(route, pathname, ignoreLeadingSlash, parentKeys, parentParams) {
    let match;
    let childMatches;
    let childIndex = 0;
    let routepath = route.path || '';
    if (routepath.charAt(0) === '/') {
      if (ignoreLeadingSlash) {
        routepath = routepath.substr(1);
      }
      ignoreLeadingSlash = true;
    }

    return {
      next(routeToSkip) {
        if (route === routeToSkip) {
          return {done: true};
        }

        const children = route.__children = route.__children || route.children;

        if (!match) {
          match = matchPath(routepath, pathname, !children, parentKeys, parentParams);

          if (match) {
            return {
              done: false,
              value: {
                route,
                keys: match.keys,
                params: match.params,
                path: match.path
              },
            };
          }
        }

        if (match && children) {
          while (childIndex < children.length) {
            if (!childMatches) {
              const childRoute = children[childIndex];
              childRoute.parent = route;

              let matchedLength = match.path.length;
              if (matchedLength > 0 && pathname.charAt(matchedLength) === '/') {
                matchedLength += 1;
              }

              childMatches = matchRoute(
                childRoute,
                pathname.substr(matchedLength),
                ignoreLeadingSlash,
                match.keys,
                match.params
              );
            }

            const childMatch = childMatches.next(routeToSkip);
            if (!childMatch.done) {
              return {
                done: false,
                value: childMatch.value,
              };
            }

            childMatches = null;
            childIndex++;
          }
        }

        return {done: true};
      },
    };
  }

  /**
   * Universal Router (https://www.kriasoft.com/universal-router/)
   *
   * Copyright (c) 2015-present Kriasoft.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.txt file in the root directory of this source tree.
   */

  function resolveRoute(context) {
    if (isFunction(context.route.action)) {
      return context.route.action(context);
    }
    return undefined;
  }

  /**
   * Universal Router (https://www.kriasoft.com/universal-router/)
   *
   * Copyright (c) 2015-present Kriasoft.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.txt file in the root directory of this source tree.
   */

  function isChildRoute(parentRoute, childRoute) {
    let route = childRoute;
    while (route) {
      route = route.parent;
      if (route === parentRoute) {
        return true;
      }
    }
    return false;
  }

  function generateErrorMessage(currentContext) {
    let errorMessage = `Path '${currentContext.pathname}' is not properly resolved due to an error.`;
    const routePath = (currentContext.route || {}).path;
    if (routePath) {
      errorMessage += ` Resolution had failed on route: '${routePath}'`;
    }
    return errorMessage;
  }

  function updateChainForRoute(context, match) {
    const {route, path} = match;

    if (route && !route.__synthetic) {
      const item = {path, route};
      if (!context.chain) {
        context.chain = [];
      } else {
        // Discard old items
        if (route.parent) {
          let i = context.chain.length;
          while (i-- && context.chain[i].route && context.chain[i].route !== route.parent) {
            context.chain.pop();
          }
        }
      }
      context.chain.push(item);
    }
  }

  /**
   */
  class Resolver {
    constructor(routes, options = {}) {
      if (Object(routes) !== routes) {
        throw new TypeError('Invalid routes');
      }

      this.baseUrl = options.baseUrl || '';
      this.errorHandler = options.errorHandler;
      this.resolveRoute = options.resolveRoute || resolveRoute;
      this.context = Object.assign({resolver: this}, options.context);
      this.root = Array.isArray(routes) ? {path: '', __children: routes, parent: null, __synthetic: true} : routes;
      this.root.parent = null;
    }

    /**
     * Returns the current list of routes (as a shallow copy). Adding / removing
     * routes to / from the returned array does not affect the routing config,
     * but modifying the route objects does.
     *
     * @return {!Array<!Router.Route>}
     */
    getRoutes() {
      return [...this.root.__children];
    }

    /**
     * Sets the routing config (replacing the existing one).
     *
     * @param {!Array<!Router.Route>|!Router.Route} routes a single route or an array of those
     *    (the array is shallow copied)
     */
    setRoutes(routes) {
      ensureRoutes(routes);
      const newRoutes = [...toArray(routes)];
      this.root.__children = newRoutes;
    }

    /**
     * Appends one or several routes to the routing config and returns the
     * effective routing config after the operation.
     *
     * @param {!Array<!Router.Route>|!Router.Route} routes a single route or an array of those
     *    (the array is shallow copied)
     * @return {!Array<!Router.Route>}
     * @protected
     */
    addRoutes(routes) {
      ensureRoutes(routes);
      this.root.__children.push(...toArray(routes));
      return this.getRoutes();
    }

    /**
     * Removes all existing routes from the routing config.
     */
    removeRoutes() {
      this.setRoutes([]);
    }

    /**
     * Asynchronously resolves the given pathname, i.e. finds all routes matching
     * the pathname and tries resolving them one after another in the order they
     * are listed in the routes config until the first non-null result.
     *
     * Returns a promise that is fulfilled with the return value of an object that consists of the first
     * route handler result that returns something other than `null` or `undefined` and context used to get this result.
     *
     * If no route handlers return a non-null result, or if no route matches the
     * given pathname the returned promise is rejected with a 'page not found'
     * `Error`.
     *
     * @param {!string|!{pathname: !string}} pathnameOrContext the pathname to
     *    resolve or a context object with a `pathname` property and other
     *    properties to pass to the route resolver functions.
     * @return {!Promise<any>}
     */
    resolve(pathnameOrContext) {
      const context = Object.assign(
        {},
        this.context,
        isString(pathnameOrContext) ? {pathname: pathnameOrContext} : pathnameOrContext
      );
      const match = matchRoute(
        this.root,
        this.__normalizePathname(context.pathname),
        this.baseUrl
      );
      const resolve = this.resolveRoute;
      let matches = null;
      let nextMatches = null;
      let currentContext = context;

      function next(resume, parent = matches.value.route, prevResult) {
        const routeToSkip = prevResult === null && matches.value.route;
        matches = nextMatches || match.next(routeToSkip);
        nextMatches = null;

        if (!resume) {
          if (matches.done || !isChildRoute(parent, matches.value.route)) {
            nextMatches = matches;
            return Promise.resolve(notFoundResult);
          }
        }

        if (matches.done) {
          return Promise.reject(getNotFoundError(context));
        }

        currentContext = Object.assign(
          currentContext
            ? {chain: (currentContext.chain ? currentContext.chain.slice(0) : [])}
            : {},
          context,
          matches.value
        );
        updateChainForRoute(currentContext, matches.value);

        return Promise.resolve(resolve(currentContext)).then(resolution => {
          if (resolution !== null && resolution !== undefined && resolution !== notFoundResult) {
            currentContext.result = resolution.result || resolution;
            return currentContext;
          }
          return next(resume, parent, resolution);
        });
      }

      context.next = next;

      return Promise.resolve()
        .then(() => next(true, this.root))
        .catch((error) => {
          const errorMessage = generateErrorMessage(currentContext);
          if (!error) {
            error = new Error(errorMessage);
          } else {
            console.warn(errorMessage);
          }
          error.context = error.context || currentContext;
          // DOMException has its own code which is read-only
          if (!(error instanceof DOMException)) {
            error.code = error.code || 500;
          }
          if (this.errorHandler) {
            currentContext.result = this.errorHandler(error);
            return currentContext;
          }
          throw error;
        });
    }

    /**
     * URL constructor polyfill hook. Creates and returns an URL instance.
     */
    static __createUrl(url, base) {
      return new URL(url, base);
    }

    /**
     * If the baseUrl property is set, transforms the baseUrl and returns the full
     * actual `base` string for using in the `new URL(path, base);` and for
     * prepernding the paths with. The returned base ends with a trailing slash.
     *
     * Otherwise, returns empty string.
     */
    get __effectiveBaseUrl() {
      return this.baseUrl
        ? this.constructor.__createUrl(
          this.baseUrl,
          document.baseURI || document.URL
        ).href.replace(/[^\/]*$/, '')
        : '';
    }

    /**
     * If the baseUrl is set, matches the pathname with the router’s baseUrl,
     * and returns the local pathname with the baseUrl stripped out.
     *
     * If the pathname does not match the baseUrl, returns undefined.
     *
     * If the `baseUrl` is not set, returns the unmodified pathname argument.
     */
    __normalizePathname(pathname) {
      if (!this.baseUrl) {
        // No base URL, no need to transform the pathname.
        return pathname;
      }

      const base = this.__effectiveBaseUrl;
      const normalizedUrl = this.constructor.__createUrl(pathname, base).href;
      if (normalizedUrl.slice(0, base.length) === base) {
        return normalizedUrl.slice(base.length);
      }
    }
  }

  Resolver.pathToRegexp = pathToRegexp_1;

  /**
   * Universal Router (https://www.kriasoft.com/universal-router/)
   *
   * Copyright (c) 2015-present Kriasoft.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.txt file in the root directory of this source tree.
   */

  const {pathToRegexp: pathToRegexp$1} = Resolver;
  const cache$1 = new Map();

  function cacheRoutes(routesByName, route, routes) {
    const name = route.name || route.component;
    if (name) {
      if (routesByName.has(name)) {
        routesByName.get(name).push(route);
      } else {
        routesByName.set(name, [route]);
      }
    }

    if (Array.isArray(routes)) {
      for (let i = 0; i < routes.length; i++) {
        const childRoute = routes[i];
        childRoute.parent = route;
        cacheRoutes(routesByName, childRoute, childRoute.__children || childRoute.children);
      }
    }
  }

  function getRouteByName(routesByName, routeName) {
    const routes = routesByName.get(routeName);
    if (routes && routes.length > 1) {
      throw new Error(
        `Duplicate route with name "${routeName}".`
        + ` Try seting unique 'name' route properties.`
      );
    }
    return routes && routes[0];
  }

  function getRoutePath(route) {
    let path = route.path;
    path = Array.isArray(path) ? path[0] : path;
    return path !== undefined ? path : '';
  }

  function generateUrls(router, options = {}) {
    if (!(router instanceof Resolver)) {
      throw new TypeError('An instance of Resolver is expected');
    }

    const routesByName = new Map();

    return (routeName, params) => {
      let route = getRouteByName(routesByName, routeName);
      if (!route) {
        routesByName.clear(); // clear cache
        cacheRoutes(routesByName, router.root, router.root.__children);

        route = getRouteByName(routesByName, routeName);
        if (!route) {
          throw new Error(`Route "${routeName}" not found`);
        }
      }

      let regexp = cache$1.get(route.fullPath);
      if (!regexp) {
        let fullPath = getRoutePath(route);
        let rt = route.parent;
        while (rt) {
          const path = getRoutePath(rt);
          if (path) {
            fullPath = path.replace(/\/$/, '') + '/' + fullPath.replace(/^\//, '');
          }
          rt = rt.parent;
        }
        const tokens = pathToRegexp$1.parse(fullPath);
        const toPath = pathToRegexp$1.tokensToFunction(tokens);
        const keys = Object.create(null);
        for (let i = 0; i < tokens.length; i++) {
          if (!isString(tokens[i])) {
            keys[tokens[i].name] = true;
          }
        }
        regexp = {toPath, keys};
        cache$1.set(fullPath, regexp);
        route.fullPath = fullPath;
      }

      let url = regexp.toPath(params, options) || '/';

      if (options.stringifyQueryParams && params) {
        const queryParams = {};
        const keys = Object.keys(params);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          if (!regexp.keys[key]) {
            queryParams[key] = params[key];
          }
        }
        const query = options.stringifyQueryParams(queryParams);
        if (query) {
          url += query.charAt(0) === '?' ? query : `?${query}`;
        }
      }

      return url;
    };
  }

  /**
   * @typedef NavigationTrigger
   * @type {object}
   * @property {function()} activate
   * @property {function()} inactivate
   */

  /** @type {Array<NavigationTrigger>} */
  let triggers = [];

  function setNavigationTriggers(newTriggers) {
    triggers.forEach(trigger => trigger.inactivate());

    newTriggers.forEach(trigger => trigger.activate());

    triggers = newTriggers;
  }

  const willAnimate = elem => {
    const name = getComputedStyle(elem).getPropertyValue('animation-name');
    return name && name !== 'none';
  };

  const waitForAnimation = (elem, cb) => {
    const listener = () => {
      elem.removeEventListener('animationend', listener);
      cb();
    };
    elem.addEventListener('animationend', listener);
  };

  function animate(elem, className) {
    elem.classList.add(className);

    return new Promise(resolve => {
      if (willAnimate(elem)) {
        const rect = elem.getBoundingClientRect();
        const size = `height: ${rect.bottom - rect.top}px; width: ${rect.right - rect.left}px`;
        elem.setAttribute('style', `position: absolute; ${size}`);
        waitForAnimation(elem, () => {
          elem.classList.remove(className);
          elem.removeAttribute('style');
          resolve();
        });
      } else {
        elem.classList.remove(className);
        resolve();
      }
    });
  }

  const MAX_REDIRECT_COUNT = 256;

  function isResultNotEmpty(result) {
    return result !== null && result !== undefined;
  }

  function copyContextWithoutNext(context) {
    const copy = Object.assign({}, context);
    delete copy.next;
    return copy;
  }

  function createLocation({pathname = '', search = '', hash = '', chain = [], params = {}, redirectFrom, resolver}, route) {
    const routes = chain.map(item => item.route);
    return {
      baseUrl: resolver && resolver.baseUrl || '',
      pathname,
      search,
      hash,
      routes,
      route: route || routes.length && routes[routes.length - 1] || null,
      params,
      redirectFrom,
      getUrl: (userParams = {}) => getPathnameForRouter(
        Router.pathToRegexp.compile(
          getMatchedPath(routes)
        )(Object.assign({}, params, userParams)),
        resolver
      )
    };
  }

  function createRedirect(context, pathname) {
    const params = Object.assign({}, context.params);
    return {
      redirect: {
        pathname,
        from: context.pathname,
        params
      }
    };
  }

  function renderElement(context, element) {
    element.location = createLocation(context);
    const index = context.chain.map(item => item.route).indexOf(context.route);
    context.chain[index].element = element;
    return element;
  }

  function runCallbackIfPossible(callback, args, thisArg) {
    if (isFunction(callback)) {
      return callback.apply(thisArg, args);
    }
  }

  function amend(amendmentFunction, args, element) {
    return amendmentResult => {
      if (amendmentResult && (amendmentResult.cancel || amendmentResult.redirect)) {
        return amendmentResult;
      }

      if (element) {
        return runCallbackIfPossible(element[amendmentFunction], args, element);
      }
    };
  }

  function processNewChildren(newChildren, route) {
    if (!Array.isArray(newChildren) && !isObject(newChildren)) {
      throw new Error(
        log(
          `Incorrect "children" value for the route ${route.path}: expected array or object, but got ${newChildren}`
        )
      );
    }

    route.__children = [];
    const childRoutes = toArray(newChildren);
    for (let i = 0; i < childRoutes.length; i++) {
      ensureRoute(childRoutes[i]);
      route.__children.push(childRoutes[i]);
    }
  }

  function removeDomNodes(nodes) {
    if (nodes && nodes.length) {
      const parent = nodes[0].parentNode;
      for (let i = 0; i < nodes.length; i++) {
        parent.removeChild(nodes[i]);
      }
    }
  }

  function getPathnameForRouter(pathname, router) {
    const base = router.__effectiveBaseUrl;
    return base
      ? router.constructor.__createUrl(pathname.replace(/^\//, ''), base).pathname
      : pathname;
  }

  function getMatchedPath(chain) {
    return chain.map(item => item.path).reduce((a, b) => {
      if (b.length) {
        return a.replace(/\/$/, '') + '/' + b.replace(/^\//, '');
      }
      return a;
    }, '');
  }

  /**
   * A simple client-side router for single-page applications. It uses
   * express-style middleware and has a first-class support for Web Components and
   * lazy-loading. Works great in Polymer and non-Polymer apps.
   *
   * Use `new Router(outlet, options)` to create a new Router instance.
   *
   * * The `outlet` parameter is a reference to the DOM node to render
   *   the content into.
   *
   * * The `options` parameter is an optional object with options. The following
   *   keys are supported:
   *   * `baseUrl` — the initial value for [
   *     the `baseUrl` property
   *   ](#/classes/Router#property-baseUrl)
   *
   * The Router instance is automatically subscribed to navigation events
   * on `window`.
   *
   * See [Live Examples](#/classes/Router/demos/demo/index.html) for the detailed usage demo and code snippets.
   *
   * See also detailed API docs for the following methods, for the advanced usage:
   *
   * * [setOutlet](#/classes/Router#method-setOutlet) – should be used to configure the outlet.
   * * [setTriggers](#/classes/Router#method-setTriggers) – should be used to configure the navigation events.
   * * [setRoutes](#/classes/Router#method-setRoutes) – should be used to configure the routes.
   *
   * Only `setRoutes` has to be called manually, others are automatically invoked when creating a new instance.
   *
   * @extends Resolver
   * @demo demo/index.html
   * @summary JavaScript class that renders different DOM content depending on
   *    a given path. It can re-render when triggered or automatically on
   *    'popstate' and / or 'click' events.
   */
  class Router extends Resolver {

    /**
     * Creates a new Router instance with a given outlet, and
     * automatically subscribes it to navigation events on the `window`.
     * Using a constructor argument or a setter for outlet is equivalent:
     *
     * ```
     * const router = new Router();
     * router.setOutlet(outlet);
     * ```
     * @param {?Node=} outlet
     * @param {?RouterOptions=} options
     */
    constructor(outlet, options) {
      const baseElement = document.head.querySelector('base');
      const baseHref = baseElement && baseElement.getAttribute('href');
      super([], Object.assign({
        // Default options
        baseUrl: baseHref && Resolver.__createUrl(baseHref, document.URL).pathname.replace(/[^\/]*$/, '')
      }, options));

      this.resolveRoute = context => this.__resolveRoute(context);

      const triggers = Router.NavigationTrigger;
      Router.setTriggers.apply(Router, Object.keys(triggers).map(key => triggers[key]));

      /**
       * The base URL for all routes in the router instance. By default,
       * if the base element exists in the `<head>`, vaadin-router
       * takes the `<base href>` attribute value, resolves against current `document.URL`
       * and gets the `pathname` from the result.
       *
       * @public
       * @type {string}
       */
      this.baseUrl;

      /**
       * A promise that is settled after the current render cycle completes. If
       * there is no render cycle in progress the promise is immediately settled
       * with the last render cycle result.
       *
       * @public
       * @type {!Promise<!RouterLocation>}
       */
      this.ready;
      this.ready = Promise.resolve(outlet);

      /**
       * Contains read-only information about the current router location:
       * pathname, active routes, parameters. See the
       * [Location type declaration](#/classes/RouterLocation)
       * for more details.
       *
       * @public
       * @type {!RouterLocation}
       */
      this.location;
      this.location = createLocation({resolver: this});

      this.__lastStartedRenderId = 0;
      this.__navigationEventHandler = this.__onNavigationEvent.bind(this);
      this.setOutlet(outlet);
      this.subscribe();
      // Using WeakMap instead of WeakSet because WeakSet is not supported by IE11
      this.__createdByRouter = new WeakMap();
      this.__addedByRouter = new WeakMap();
    }

    __resolveRoute(context) {
      const route = context.route;

      let callbacks = Promise.resolve();

      if (isFunction(route.children)) {
        callbacks = callbacks
          .then(() => route.children(copyContextWithoutNext(context)))
          .then(children => {
            // The route.children() callback might have re-written the
            // route.children property instead of returning a value
            if (!isResultNotEmpty(children) && !isFunction(route.children)) {
              children = route.children;
            }
            processNewChildren(children, route);
          });
      }

      const commands = {
        redirect: path => createRedirect(context, path),
        component: (component) => {
          const element = document.createElement(component);
          this.__createdByRouter.set(element, true);
          return element;
        }
      };

      return callbacks
        .then(() => {
          if (this.__isLatestRender(context)) {
            return runCallbackIfPossible(route.action, [context, commands], route);
          }
        })
        .then(result => {
          if (isResultNotEmpty(result)) {
            // Actions like `() => import('my-view.js')` are not expected to
            // end the resolution, despite the result is not empty. Checking
            // the result with a whitelist of values that end the resolution.
            if (result instanceof HTMLElement ||
                result.redirect ||
                result === notFoundResult) {
              return result;
            }
          }

          if (isString(route.redirect)) {
            return commands.redirect(route.redirect);
          }

          if (route.bundle) {
            return loadBundle(route.bundle)
              .then(() => {}, () => {
                throw new Error(log(`Bundle not found: ${route.bundle}. Check if the file name is correct`));
              });
          }
        })
        .then(result => {
          if (isResultNotEmpty(result)) {
            return result;
          }
          if (isString(route.component)) {
            return commands.component(route.component);
          }
        });
    }

    /**
     * Sets the router outlet (the DOM node where the content for the current
     * route is inserted). Any content pre-existing in the router outlet is
     * removed at the end of each render pass.
     *
     * NOTE: this method is automatically invoked first time when creating a new Router instance.
     *
     * @param {?Node} outlet the DOM node where the content for the current route
     *     is inserted.
     */
    setOutlet(outlet) {
      if (outlet) {
        this.__ensureOutlet(outlet);
      }
      this.__outlet = outlet;
    }

    /**
     * Returns the current router outlet. The initial value is `undefined`.
     *
     * @return {?Node} the current router outlet (or `undefined`)
     */
    getOutlet() {
      return this.__outlet;
    }

    /**
     * Sets the routing config (replacing the existing one) and triggers a
     * navigation event so that the router outlet is refreshed according to the
     * current `window.location` and the new routing config.
     *
     * Each route object may have the following properties, listed here in the processing order:
     * * `path` – the route path (relative to the parent route if any) in the
     * [express.js syntax](https://expressjs.com/en/guide/routing.html#route-paths").
     *
     * * `children` – an array of nested routes or a function that provides this
     * array at the render time. The function can be synchronous or asynchronous:
     * in the latter case the render is delayed until the returned promise is
     * resolved. The `children` function is executed every time when this route is
     * being rendered. This allows for dynamic route structures (e.g. backend-defined),
     * but it might have a performance impact as well. In order to avoid calling
     * the function on subsequent renders, you can override the `children` property
     * of the route object and save the calculated array there
     * (via `context.route.children = [ route1, route2, ...];`).
     * Parent routes are fully resolved before resolving the children. Children
     * 'path' values are relative to the parent ones.
     *
     * * `action` – the action that is executed before the route is resolved.
     * The value for this property should be a function, accepting `context`
     * and `commands` parameters described below. If present, this function is
     * always invoked first, disregarding of the other properties' presence.
     * The action can return a result directly or within a `Promise`, which
     * resolves to the result. If the action result is an `HTMLElement` instance,
     * a `commands.component(name)` result, a `commands.redirect(path)` result,
     * or a `context.next()` result, the current route resolution is finished,
     * and other route config properties are ignored.
     * See also **Route Actions** section in [Live Examples](#/classes/Router/demos/demo/index.html).
     *
     * * `redirect` – other route's path to redirect to. Passes all route parameters to the redirect target.
     * The target route should also be defined.
     * See also **Redirects** section in [Live Examples](#/classes/Router/demos/demo/index.html).
     *
     * * `bundle` – string containing the path to `.js` or `.mjs` bundle to load before resolving the route,
     * or the object with "module" and "nomodule" keys referring to different bundles.
     * Each bundle is only loaded once. If "module" and "nomodule" are set, only one bundle is loaded,
     * depending on whether the browser supports ES modules or not.
     * The property is ignored when either an `action` returns the result or `redirect` property is present.
     * Any error, e.g. 404 while loading bundle will cause route resolution to throw.
     * See also **Code Splitting** section in [Live Examples](#/classes/Router/demos/demo/index.html).
     *
     * * `component` – the tag name of the Web Component to resolve the route to.
     * The property is ignored when either an `action` returns the result or `redirect` property is present.
     * If route contains the `component` property (or an action that return a component)
     * and its child route also contains the `component` property, child route's component
     * will be rendered as a light dom child of a parent component.
     *
     * * `name` – the string name of the route to use in the
     * [`router.urlForName(name, params)`](#/classes/Router#method-urlForName)
     * navigation helper method.
     *
     * For any route function (`action`, `children`) defined, the corresponding `route` object is available inside the callback
     * through the `this` reference. If you need to access it, make sure you define the callback as a non-arrow function
     * because arrow functions do not have their own `this` reference.
     *
     * `context` object that is passed to `action` function holds the following properties:
     * * `context.pathname` – string with the pathname being resolved
     *
     * * `context.search` – search query string
     *
     * * `context.hash` – hash string
     *
     * * `context.params` – object with route parameters
     *
     * * `context.route` – object that holds the route that is currently being rendered.
     *
     * * `context.next()` – function for asynchronously getting the next route
     * contents from the resolution chain (if any)
     *
     * `commands` object that is passed to `action` function has
     * the following methods:
     *
     * * `commands.redirect(path)` – function that creates a redirect data
     * for the path specified.
     *
     * * `commands.component(component)` – function that creates a new HTMLElement
     * with current context. Note: the component created by this function is reused if visiting the same path twice in row.
     *
     *
     * @param {!Array<!Route>|!Route} routes a single route or an array of those
     * @param {?boolean} skipRender configure the router but skip rendering the
     *     route corresponding to the current `window.location` values
     *
     * @return {!Promise<!Node>}
     */
    setRoutes(routes, skipRender = false) {
      this.__previousContext = undefined;
      this.__urlForName = undefined;
      super.setRoutes(routes);
      if (!skipRender) {
        this.__onNavigationEvent();
      }
      return this.ready;
    }

    /**
     * Asynchronously resolves the given pathname and renders the resolved route
     * component into the router outlet. If no router outlet is set at the time of
     * calling this method, or at the time when the route resolution is completed,
     * a `TypeError` is thrown.
     *
     * Returns a promise that is fulfilled with the router outlet DOM Node after
     * the route component is created and inserted into the router outlet, or
     * rejected if no route matches the given path.
     *
     * If another render pass is started before the previous one is completed, the
     * result of the previous render pass is ignored.
     *
     * @param {!string|!{pathname: !string, search: ?string, hash: ?string}} pathnameOrContext
     *    the pathname to render or a context object with a `pathname` property,
     *    optional `search` and `hash` properties, and other properties
     *    to pass to the resolver.
     * @param {boolean=} shouldUpdateHistory
     *    update browser history with the rendered location
     * @return {!Promise<!Node>}
     */
    render(pathnameOrContext, shouldUpdateHistory) {
      const renderId = ++this.__lastStartedRenderId;
      const context = Object.assign(
        {
          search: '',
          hash: ''
        },
        isString(pathnameOrContext)
          ? {pathname: pathnameOrContext}
          : pathnameOrContext,
        {
          __renderId: renderId
        }
      );

      // Find the first route that resolves to a non-empty result
      this.ready = this.resolve(context)

        // Process the result of this.resolve() and handle all special commands:
        // (redirect / prevent / component). If the result is a 'component',
        // then go deeper and build the entire chain of nested components matching
        // the pathname. Also call all 'on before' callbacks along the way.
        .then(context => this.__fullyResolveChain(context))

        .then(context => {
          if (this.__isLatestRender(context)) {
            const previousContext = this.__previousContext;

            // Check if the render was prevented and make an early return in that case
            if (context === previousContext) {
              // Replace the history with the previous context
              // to make sure the URL stays the same.
              this.__updateBrowserHistory(previousContext, true);
              return this.location;
            }

            this.location = createLocation(context);

            if (shouldUpdateHistory) {
              // Replace only if first render redirects, so that we don’t leave
              // the redirecting record in the history
              this.__updateBrowserHistory(context, renderId === 1);
            }

            fireRouterEvent('location-changed', {router: this, location: this.location});

            // Skip detaching/re-attaching there are no render changes
            if (context.__skipAttach) {
              this.__copyUnchangedElements(context, previousContext);
              this.__previousContext = context;
              return this.location;
            }

            this.__addAppearingContent(context, previousContext);
            const animationDone = this.__animateIfNeeded(context);

            this.__runOnAfterEnterCallbacks(context);
            this.__runOnAfterLeaveCallbacks(context, previousContext);

            return animationDone.then(() => {
              if (this.__isLatestRender(context)) {
                // If there is another render pass started after this one,
                // the 'disappearing content' would be removed when the other
                // render pass calls `this.__addAppearingContent()`
                this.__removeDisappearingContent();

                this.__previousContext = context;
                return this.location;
              }
            });
          }
        })
        .catch(error => {
          if (renderId === this.__lastStartedRenderId) {
            if (shouldUpdateHistory) {
              this.__updateBrowserHistory(context);
            }
            removeDomNodes(this.__outlet && this.__outlet.children);
            this.location = createLocation(Object.assign(context, {resolver: this}));
            fireRouterEvent('error', Object.assign({router: this, error}, context));
            throw error;
          }
        });
      return this.ready;
    }

    // `topOfTheChainContextBeforeRedirects` is a context coming from Resolver.resolve().
    // It would contain a 'redirect' route or the first 'component' route that
    // matched the pathname. There might be more child 'component' routes to be
    // resolved and added into the chain. This method would find and add them.
    // `contextBeforeRedirects` is the context containing such a child component
    // route. It's only necessary when this method is called recursively (otherwise
    // it's the same as the 'top of the chain' context).
    //
    // Apart from building the chain of child components, this method would also
    // handle 'redirect' routes, call 'onBefore' callbacks and handle 'prevent'
    // and 'redirect' callback results.
    __fullyResolveChain(topOfTheChainContextBeforeRedirects,
      contextBeforeRedirects = topOfTheChainContextBeforeRedirects) {
      return this.__findComponentContextAfterAllRedirects(contextBeforeRedirects)
        // `contextAfterRedirects` is always a context with an `HTMLElement` result
        // In other cases the promise gets rejected and .then() is not called
        .then(contextAfterRedirects => {
          const redirectsHappened = contextAfterRedirects !== contextBeforeRedirects;
          const topOfTheChainContextAfterRedirects =
            redirectsHappened ? contextAfterRedirects : topOfTheChainContextBeforeRedirects;

          const matchedPath = getPathnameForRouter(
            getMatchedPath(contextAfterRedirects.chain),
            contextAfterRedirects.resolver
          );
          const isFound = (matchedPath === contextAfterRedirects.pathname);

          // Recursive method to try matching more child and sibling routes
          const findNextContextIfAny = (context, parent = context.route, prevResult) => {
            return context.next(undefined, parent, prevResult).then(nextContext => {
              if (nextContext === null || nextContext === notFoundResult) {
                // Next context is not found in children, ...
                if (isFound) {
                  // ...but original context is already fully matching - use it
                  return context;
                } else if (parent.parent !== null) {
                  // ...and there is no full match yet - step up to check siblings
                  return findNextContextIfAny(context, parent.parent, nextContext);
                } else {
                  return nextContext;
                }
              }

              return nextContext;
            });
          };

          return findNextContextIfAny(contextAfterRedirects).then(nextContext => {
            if (nextContext === null || nextContext === notFoundResult) {
              throw getNotFoundError(topOfTheChainContextAfterRedirects);
            }

            return nextContext
            && nextContext !== notFoundResult
            && nextContext !== contextAfterRedirects
              ? this.__fullyResolveChain(topOfTheChainContextAfterRedirects, nextContext)
              : this.__amendWithOnBeforeCallbacks(contextAfterRedirects);
          });
        });
    }

    __findComponentContextAfterAllRedirects(context) {
      const result = context.result;
      if (result instanceof HTMLElement) {
        renderElement(context, result);
        return Promise.resolve(context);
      } else if (result.redirect) {
        return this.__redirect(result.redirect, context.__redirectCount, context.__renderId)
          .then(context => this.__findComponentContextAfterAllRedirects(context));
      } else if (result instanceof Error) {
        return Promise.reject(result);
      } else {
        return Promise.reject(
          new Error(
            log(
              `Invalid route resolution result for path "${context.pathname}". ` +
              `Expected redirect object or HTML element, but got: "${logValue(result)}". ` +
              `Double check the action return value for the route.`
            )
          ));
      }
    }

    __amendWithOnBeforeCallbacks(contextWithFullChain) {
      return this.__runOnBeforeCallbacks(contextWithFullChain).then(amendedContext => {
        if (amendedContext === this.__previousContext || amendedContext === contextWithFullChain) {
          return amendedContext;
        }
        return this.__fullyResolveChain(amendedContext);
      });
    }

    __runOnBeforeCallbacks(newContext) {
      const previousContext = this.__previousContext || {};
      const previousChain = previousContext.chain || [];
      const newChain = newContext.chain;

      let callbacks = Promise.resolve();
      const prevent = () => ({cancel: true});
      const redirect = (pathname) => createRedirect(newContext, pathname);

      newContext.__divergedChainIndex = 0;
      newContext.__skipAttach = false;
      if (previousChain.length) {
        for (let i = 0; i < Math.min(previousChain.length, newChain.length); i = ++newContext.__divergedChainIndex) {
          if (previousChain[i].route !== newChain[i].route
            || previousChain[i].path !== newChain[i].path && previousChain[i].element !== newChain[i].element
            || !this.__isReusableElement(previousChain[i].element, newChain[i].element)) {
            break;
          }
        }

        // Skip re-attaching and notifications if element and chain do not change
        newContext.__skipAttach =
          // Same route chain
          newChain.length === previousChain.length && newContext.__divergedChainIndex == newChain.length &&
          // Same element
          this.__isReusableElement(newContext.result, previousContext.result);

        if (newContext.__skipAttach) {
          // execute onBeforeLeave for changed segment element when skipping attach
          for (let i = newChain.length - 1; i >= 0; i--) {
            callbacks = this.__runOnBeforeLeaveCallbacks(callbacks, newContext, {prevent}, previousChain[i]);
          }
          // execute onBeforeEnter for changed segment element when skipping attach
          for (let i = 0; i < newChain.length; i++) {
            callbacks = this.__runOnBeforeEnterCallbacks(callbacks, newContext, {prevent, redirect}, newChain[i]);
            previousChain[i].element.location = createLocation(newContext, previousChain[i].route);
          }

        } else {
          // execute onBeforeLeave when NOT skipping attach
          for (let i = previousChain.length - 1; i >= newContext.__divergedChainIndex; i--) {
            callbacks = this.__runOnBeforeLeaveCallbacks(callbacks, newContext, {prevent}, previousChain[i]);
          }
        }
      }
      // execute onBeforeEnter when NOT skipping attach
      if (!newContext.__skipAttach) {
        for (let i = 0; i < newChain.length; i++) {
          if (i < newContext.__divergedChainIndex) {
            if (i < previousChain.length && previousChain[i].element) {
              previousChain[i].element.location = createLocation(newContext, previousChain[i].route);
            }
          } else {
            callbacks = this.__runOnBeforeEnterCallbacks(callbacks, newContext, {prevent, redirect}, newChain[i]);
            if (newChain[i].element) {
              newChain[i].element.location = createLocation(newContext, newChain[i].route);
            }
          }
        }
      }
      return callbacks.then(amendmentResult => {
        if (amendmentResult) {
          if (amendmentResult.cancel) {
            this.__previousContext.__renderId = newContext.__renderId;
            return this.__previousContext;
          }
          if (amendmentResult.redirect) {
            return this.__redirect(amendmentResult.redirect, newContext.__redirectCount, newContext.__renderId);
          }
        }
        return newContext;
      });
    }

    __runOnBeforeLeaveCallbacks(callbacks, newContext, commands, chainElement) {
      const location = createLocation(newContext);
      return callbacks.then(result => {
        if (this.__isLatestRender(newContext)) {
          const afterLeaveFunction = amend('onBeforeLeave', [location, commands, this], chainElement.element);
          return afterLeaveFunction(result);
        }
      }).then(result => {
        if (!(result || {}).redirect) {
          return result;
        }
      });
    }

    __runOnBeforeEnterCallbacks(callbacks, newContext, commands, chainElement) {
      const location = createLocation(newContext, chainElement.route);
      return callbacks.then(result => {
        if (this.__isLatestRender(newContext)) {
          const beforeEnterFunction = amend('onBeforeEnter', [location, commands, this], chainElement.element);
          return beforeEnterFunction(result);
        }
      });
    }

    __isReusableElement(element, otherElement) {
      if (element && otherElement) {
        return this.__createdByRouter.get(element) && this.__createdByRouter.get(otherElement)
          ? element.localName === otherElement.localName
          : element === otherElement;
      }
      return false;
    }

    __isLatestRender(context) {
      return context.__renderId === this.__lastStartedRenderId;
    }

    __redirect(redirectData, counter, renderId) {
      if (counter > MAX_REDIRECT_COUNT) {
        throw new Error(log(`Too many redirects when rendering ${redirectData.from}`));
      }

      return this.resolve({
        pathname: this.urlForPath(
          redirectData.pathname,
          redirectData.params
        ),
        redirectFrom: redirectData.from,
        __redirectCount: (counter || 0) + 1,
        __renderId: renderId
      });
    }

    __ensureOutlet(outlet = this.__outlet) {
      if (!(outlet instanceof Node)) {
        throw new TypeError(log(`Expected router outlet to be a valid DOM Node (but got ${outlet})`));
      }
    }

    __updateBrowserHistory({pathname, search = '', hash = ''}, replace) {
      if (window.location.pathname !== pathname
          || window.location.search !== search
          || window.location.hash !== hash
      ) {
        const changeState = replace ? 'replaceState' : 'pushState';
        window.history[changeState](null, document.title, pathname + search + hash);
        window.dispatchEvent(new PopStateEvent('popstate', {state: 'vaadin-router-ignore'}));
      }
    }

    __copyUnchangedElements(context, previousContext) {
      // Find the deepest common parent between the last and the new component
      // chains. Update references for the unchanged elements in the new chain
      let deepestCommonParent = this.__outlet;
      for (let i = 0; i < context.__divergedChainIndex; i++) {
        const unchangedElement = previousContext && previousContext.chain[i].element;
        if (unchangedElement) {
          if (unchangedElement.parentNode === deepestCommonParent) {
            context.chain[i].element = unchangedElement;
            deepestCommonParent = unchangedElement;
          } else {
            break;
          }
        }
      }
      return deepestCommonParent;
    }

    __addAppearingContent(context, previousContext) {
      this.__ensureOutlet();

      // If the previous 'entering' animation has not completed yet,
      // stop it and remove that content from the DOM before adding new one.
      this.__removeAppearingContent();

      // Copy reusable elements from the previousContext to current
      const deepestCommonParent = this.__copyUnchangedElements(context, previousContext);

      // Keep two lists of DOM elements:
      //  - those that should be removed once the transition animation is over
      //  - and those that should remain
      this.__appearingContent = [];
      this.__disappearingContent = Array
        .from(deepestCommonParent.children)
        .filter(
          // Only remove layout content that was added by router
          e => this.__addedByRouter.get(e) &&
          // Do not remove the result element to avoid flickering
          e !== context.result);

      // Add new elements (starting after the deepest common parent) to the DOM.
      // That way only the components that are actually different between the two
      // locations are added to the DOM (and those that are common remain in the
      // DOM without first removing and then adding them again).
      let parentElement = deepestCommonParent;
      for (let i = context.__divergedChainIndex; i < context.chain.length; i++) {
        const elementToAdd = context.chain[i].element;
        if (elementToAdd) {
          parentElement.appendChild(elementToAdd);
          this.__addedByRouter.set(elementToAdd, true);
          if (parentElement === deepestCommonParent) {
            this.__appearingContent.push(elementToAdd);
          }
          parentElement = elementToAdd;
        }
      }
    }

    __removeDisappearingContent() {
      if (this.__disappearingContent) {
        removeDomNodes(this.__disappearingContent);
      }
      this.__disappearingContent = null;
      this.__appearingContent = null;
    }

    __removeAppearingContent() {
      if (this.__disappearingContent && this.__appearingContent) {
        removeDomNodes(this.__appearingContent);
        this.__disappearingContent = null;
        this.__appearingContent = null;
      }
    }

    __runOnAfterLeaveCallbacks(currentContext, targetContext) {
      if (!targetContext) {
        return;
      }

      // REVERSE iteration: from Z to A
      for (let i = targetContext.chain.length - 1; i >= currentContext.__divergedChainIndex; i--) {
        if (!this.__isLatestRender(currentContext)) {
          break;
        }
        const currentComponent = targetContext.chain[i].element;
        if (!currentComponent) {
          continue;
        }
        try {
          const location = createLocation(currentContext);
          runCallbackIfPossible(
            currentComponent.onAfterLeave,
            [location, {}, targetContext.resolver],
            currentComponent);
        } finally {
          if (this.__disappearingContent.indexOf(currentComponent) > -1) {
            removeDomNodes(currentComponent.children);
          }
        }
      }
    }

    __runOnAfterEnterCallbacks(currentContext) {
      // forward iteration: from A to Z
      for (let i = currentContext.__divergedChainIndex; i < currentContext.chain.length; i++) {
        if (!this.__isLatestRender(currentContext)) {
          break;
        }
        const currentComponent = currentContext.chain[i].element || {};
        const location = createLocation(currentContext, currentContext.chain[i].route);
        runCallbackIfPossible(
          currentComponent.onAfterEnter,
          [location, {}, currentContext.resolver],
          currentComponent);
      }
    }

    __animateIfNeeded(context) {
      const from = (this.__disappearingContent || [])[0];
      const to = (this.__appearingContent || [])[0];
      const promises = [];

      const chain = context.chain;
      let config;
      for (let i = chain.length; i > 0; i--) {
        if (chain[i - 1].route.animate) {
          config = chain[i - 1].route.animate;
          break;
        }
      }

      if (from && to && config) {
        const leave = isObject(config) && config.leave || 'leaving';
        const enter = isObject(config) && config.enter || 'entering';
        promises.push(animate(from, leave));
        promises.push(animate(to, enter));
      }

      return Promise.all(promises).then(() => context);
    }

    /**
     * Subscribes this instance to navigation events on the `window`.
     *
     * NOTE: beware of resource leaks. For as long as a router instance is
     * subscribed to navigation events, it won't be garbage collected.
     */
    subscribe() {
      window.addEventListener('vaadin-router-go', this.__navigationEventHandler);
    }

    /**
     * Removes the subscription to navigation events created in the `subscribe()`
     * method.
     */
    unsubscribe() {
      window.removeEventListener('vaadin-router-go', this.__navigationEventHandler);
    }

    __onNavigationEvent(event) {
      const {pathname, search, hash} = event ? event.detail : window.location;
      if (isString(this.__normalizePathname(pathname))) {
        if (event && event.preventDefault) {
          event.preventDefault();
        }
        this.render({pathname, search, hash}, true);
      }
    }

    /**
     * Configures what triggers Router navigation events:
     *  - `POPSTATE`: popstate events on the current `window`
     *  - `CLICK`: click events on `<a>` links leading to the current page
     *
     * This method is invoked with the pre-configured values when creating a new Router instance.
     * By default, both `POPSTATE` and `CLICK` are enabled. This setup is expected to cover most of the use cases.
     *
     * See the `router-config.js` for the default navigation triggers config. Based on it, you can
     * create the own one and only import the triggers you need, instead of pulling in all the code,
     * e.g. if you want to handle `click` differently.
     *
     * See also **Navigation Triggers** section in [Live Examples](#/classes/Router/demos/demo/index.html).
     *
     * @param {...NavigationTrigger} triggers
     */
    static setTriggers(...triggers) {
      setNavigationTriggers(triggers);
    }

    /**
     * Generates a URL for the route with the given name, optionally performing
     * substitution of parameters.
     *
     * The route is searched in all the Router instances subscribed to
     * navigation events.
     *
     * **Note:** For child route names, only array children are considered.
     * It is not possible to generate URLs using a name for routes set with
     * a children function.
     *
     * @function urlForName
     * @param {!string} name the route name or the route’s `component` name.
     * @param {Params=} params Optional object with route path parameters.
     * Named parameters are passed by name (`params[name] = value`), unnamed
     * parameters are passed by index (`params[index] = value`).
     *
     * @return {string}
     */
    urlForName(name, params) {
      if (!this.__urlForName) {
        this.__urlForName = generateUrls(this);
      }
      return getPathnameForRouter(
        this.__urlForName(name, params),
        this
      );
    }

    /**
     * Generates a URL for the given route path, optionally performing
     * substitution of parameters.
     *
     * @param {!string} path string route path declared in [express.js syntax](https://expressjs.com/en/guide/routing.html#route-paths").
     * @param {Params=} params Optional object with route path parameters.
     * Named parameters are passed by name (`params[name] = value`), unnamed
     * parameters are passed by index (`params[index] = value`).
     *
     * @return {string}
     */
    urlForPath(path, params) {
      return getPathnameForRouter(
        Router.pathToRegexp.compile(path)(params),
        this
      );
    }

    /**
     * Triggers navigation to a new path. Returns a boolean without waiting until
     * the navigation is complete. Returns `true` if at least one `Router`
     * has handled the navigation (was subscribed and had `baseUrl` matching
     * the `path` argument), otherwise returns `false`.
     *
     * @param {!string|!{pathname: !string, search: (string|undefined), hash: (string|undefined)}} path
     *   a new in-app path string, or an URL-like object with `pathname`
     *   string property, and optional `search` and `hash` string properties.
     * @return {boolean}
     */
    static go(path) {
      const {pathname, search, hash} = isString(path)
        ? this.__createUrl(path, 'http://a') // some base to omit origin
        : path;
      return fireRouterEvent('go', {pathname, search, hash});
    }
  }

  const DEV_MODE_CODE_REGEXP =
    /\/\*\*\s+vaadin-dev-mode:start([\s\S]*)vaadin-dev-mode:end\s+\*\*\//i;

  const FlowClients = window.Vaadin && window.Vaadin.Flow && window.Vaadin.Flow.clients;

  function isMinified() {
    function test() {
      /** vaadin-dev-mode:start
      return false;
      vaadin-dev-mode:end **/
      return true;
    }
    return uncommentAndRun(test);
  }

  function isDevelopmentMode() {
    try {
      if (isForcedDevelopmentMode()) {
        return true;
      }

      if (!isLocalhost()) {
        return false;
      }

      if (FlowClients) {
        return !isFlowProductionMode();
      }

      return !isMinified();
    } catch (e) {
      // Some error in this code, assume production so no further actions will be taken
      return false;
    }
  }

  function isForcedDevelopmentMode() {
    return localStorage.getItem("vaadin.developmentmode.force");
  }

  function isLocalhost() {
    return (["localhost","127.0.0.1"].indexOf(window.location.hostname) >= 0);
  }

  function isFlowProductionMode() {
    if (FlowClients) {
      const productionModeApps = Object.keys(FlowClients)
        .map(key => FlowClients[key])
        .filter(client => client.productionMode);
      if (productionModeApps.length > 0) {
        return true;
      }
    }
    return false;
  }

  function uncommentAndRun(callback, args) {
    if (typeof callback !== 'function') {
      return;
    }

    const match = DEV_MODE_CODE_REGEXP.exec(callback.toString());
    if (match) {
      try {
        // requires CSP: script-src 'unsafe-eval'
        callback = new Function(match[1]);
      } catch (e) {
        // eat the exception
        console.log('vaadin-development-mode-detector: uncommentAndRun() failed', e);
      }
    }

    return callback(args);
  }

  // A guard against polymer-modulizer removing the window.Vaadin
  // initialization above.
  window['Vaadin'] = window['Vaadin'] || {};

  /**
   * Inspects the source code of the given `callback` function for
   * specially-marked _commented_ code. If such commented code is found in the
   * callback source, uncomments and runs that code instead of the callback
   * itself. Otherwise runs the callback as is.
   *
   * The optional arguments are passed into the callback / uncommented code,
   * the result is returned.
   *
   * See the `isMinified()` function source code in this file for an example.
   *
   */
  const runIfDevelopmentMode = function(callback, args) {
    if (window.Vaadin.developmentMode) {
      return uncommentAndRun(callback, args);
    }
  };

  if (window.Vaadin.developmentMode === undefined) {
    window.Vaadin.developmentMode = isDevelopmentMode();
  }

  /* This file is autogenerated from src/vaadin-usage-statistics.tpl.html */

  function maybeGatherAndSendStats() {
    /** vaadin-dev-mode:start
    (function () {
  'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var getPolymerVersion = function getPolymerVersion() {
    return window.Polymer && window.Polymer.version;
  };

  var StatisticsGatherer = function () {
    function StatisticsGatherer(logger) {
      classCallCheck(this, StatisticsGatherer);

      this.now = new Date().getTime();
      this.logger = logger;
    }

    createClass(StatisticsGatherer, [{
      key: 'frameworkVersionDetectors',
      value: function frameworkVersionDetectors() {
        return {
          'Flow': function Flow() {
            if (window.Vaadin && window.Vaadin.Flow && window.Vaadin.Flow.clients) {
              var flowVersions = Object.keys(window.Vaadin.Flow.clients).map(function (key) {
                return window.Vaadin.Flow.clients[key];
              }).filter(function (client) {
                return client.getVersionInfo;
              }).map(function (client) {
                return client.getVersionInfo().flow;
              });
              if (flowVersions.length > 0) {
                return flowVersions[0];
              }
            }
          },
          'Vaadin Framework': function VaadinFramework() {
            if (window.vaadin && window.vaadin.clients) {
              var frameworkVersions = Object.values(window.vaadin.clients).filter(function (client) {
                return client.getVersionInfo;
              }).map(function (client) {
                return client.getVersionInfo().vaadinVersion;
              });
              if (frameworkVersions.length > 0) {
                return frameworkVersions[0];
              }
            }
          },
          'AngularJs': function AngularJs() {
            if (window.angular && window.angular.version && window.angular.version) {
              return window.angular.version.full;
            }
          },
          'Angular': function Angular() {
            if (window.ng) {
              var tags = document.querySelectorAll("[ng-version]");
              if (tags.length > 0) {
                return tags[0].getAttribute("ng-version");
              }
              return "Unknown";
            }
          },
          'Backbone.js': function BackboneJs() {
            if (window.Backbone) {
              return window.Backbone.VERSION;
            }
          },
          'React': function React() {
            var reactSelector = '[data-reactroot], [data-reactid]';
            if (!!document.querySelector(reactSelector)) {
              // React does not publish the version by default
              return "unknown";
            }
          },
          'Ember': function Ember() {
            if (window.Em && window.Em.VERSION) {
              return window.Em.VERSION;
            } else if (window.Ember && window.Ember.VERSION) {
              return window.Ember.VERSION;
            }
          },
          'jQuery': function (_jQuery) {
            function jQuery() {
              return _jQuery.apply(this, arguments);
            }

            jQuery.toString = function () {
              return _jQuery.toString();
            };

            return jQuery;
          }(function () {
            if (typeof jQuery === 'function' && jQuery.prototype.jquery !== undefined) {
              return jQuery.prototype.jquery;
            }
          }),
          'Polymer': function Polymer() {
            var version = getPolymerVersion();
            if (version) {
              return version;
            }
          },
          'LitElement': function LitElement() {
            var version = window.litElementVersions && window.litElementVersions[0];
            if (version) {
              return version;
            }
          },
          'LitHtml': function LitHtml() {
            var version = window.litHtmlVersions && window.litHtmlVersions[0];
            if (version) {
              return version;
            }
          },
          'Vue.js': function VueJs() {
            if (window.Vue) {
              return window.Vue.version;
            }
          }
        };
      }
    }, {
      key: 'getUsedVaadinElements',
      value: function getUsedVaadinElements(elements) {
        var version = getPolymerVersion();
        var elementClasses = void 0;
        // NOTE: In case you edit the code here, YOU MUST UPDATE any statistics reporting code in Flow.
        // Check all locations calling the method getEntries() in
        // https://github.com/vaadin/flow/blob/master/flow-server/src/main/java/com/vaadin/flow/internal/UsageStatistics.java#L106
        // Currently it is only used by BootstrapHandler.
        if (version && version.indexOf('2') === 0) {
          // Polymer 2: components classes are stored in window.Vaadin
          elementClasses = Object.keys(window.Vaadin).map(function (c) {
            return window.Vaadin[c];
          }).filter(function (c) {
            return c.is;
          });
        } else {
          // Polymer 3: components classes are stored in window.Vaadin.registrations
          elementClasses = window.Vaadin.registrations || [];
        }
        elementClasses.forEach(function (klass) {
          var version = klass.version ? klass.version : "0.0.0";
          elements[klass.is] = { version: version };
        });
      }
    }, {
      key: 'getUsedVaadinThemes',
      value: function getUsedVaadinThemes(themes) {
        ['Lumo', 'Material'].forEach(function (themeName) {
          var theme;
          var version = getPolymerVersion();
          if (version && version.indexOf('2') === 0) {
            // Polymer 2: themes are stored in window.Vaadin
            theme = window.Vaadin[themeName];
          } else {
            // Polymer 3: themes are stored in custom element registry
            theme = customElements.get('vaadin-' + themeName.toLowerCase() + '-styles');
          }
          if (theme && theme.version) {
            themes[themeName] = { version: theme.version };
          }
        });
      }
    }, {
      key: 'getFrameworks',
      value: function getFrameworks(frameworks) {
        var detectors = this.frameworkVersionDetectors();
        Object.keys(detectors).forEach(function (framework) {
          var detector = detectors[framework];
          try {
            var version = detector();
            if (version) {
              frameworks[framework] = { version: version };
            }
          } catch (e) {}
        });
      }
    }, {
      key: 'gather',
      value: function gather(storage) {
        var storedStats = storage.read();
        var gatheredStats = {};
        var types = ["elements", "frameworks", "themes"];

        types.forEach(function (type) {
          gatheredStats[type] = {};
          if (!storedStats[type]) {
            storedStats[type] = {};
          }
        });

        var previousStats = JSON.stringify(storedStats);

        this.getUsedVaadinElements(gatheredStats.elements);
        this.getFrameworks(gatheredStats.frameworks);
        this.getUsedVaadinThemes(gatheredStats.themes);

        var now = this.now;
        types.forEach(function (type) {
          var keys = Object.keys(gatheredStats[type]);
          keys.forEach(function (key) {
            if (!storedStats[type][key] || _typeof(storedStats[type][key]) != _typeof({})) {
              storedStats[type][key] = { firstUsed: now };
            }
            // Discards any previously logged version number
            storedStats[type][key].version = gatheredStats[type][key].version;
            storedStats[type][key].lastUsed = now;
          });
        });

        var newStats = JSON.stringify(storedStats);
        storage.write(newStats);
        if (newStats != previousStats && Object.keys(storedStats).length > 0) {
          this.logger.debug("New stats: " + newStats);
        }
      }
    }]);
    return StatisticsGatherer;
  }();

  var StatisticsStorage = function () {
    function StatisticsStorage(key) {
      classCallCheck(this, StatisticsStorage);

      this.key = key;
    }

    createClass(StatisticsStorage, [{
      key: 'read',
      value: function read() {
        var localStorageStatsString = localStorage.getItem(this.key);
        try {
          return JSON.parse(localStorageStatsString ? localStorageStatsString : '{}');
        } catch (e) {
          return {};
        }
      }
    }, {
      key: 'write',
      value: function write(data) {
        localStorage.setItem(this.key, data);
      }
    }, {
      key: 'clear',
      value: function clear() {
        localStorage.removeItem(this.key);
      }
    }, {
      key: 'isEmpty',
      value: function isEmpty() {
        var storedStats = this.read();
        var empty = true;
        Object.keys(storedStats).forEach(function (key) {
          if (Object.keys(storedStats[key]).length > 0) {
            empty = false;
          }
        });

        return empty;
      }
    }]);
    return StatisticsStorage;
  }();

  var StatisticsSender = function () {
    function StatisticsSender(url, logger) {
      classCallCheck(this, StatisticsSender);

      this.url = url;
      this.logger = logger;
    }

    createClass(StatisticsSender, [{
      key: 'send',
      value: function send(data, errorHandler) {
        var logger = this.logger;

        if (navigator.onLine === false) {
          logger.debug("Offline, can't send");
          errorHandler();
          return;
        }
        logger.debug("Sending data to " + this.url);

        var req = new XMLHttpRequest();
        req.withCredentials = true;
        req.addEventListener("load", function () {
          // Stats sent, nothing more to do
          logger.debug("Response: " + req.responseText);
        });
        req.addEventListener("error", function () {
          logger.debug("Send failed");
          errorHandler();
        });
        req.addEventListener("abort", function () {
          logger.debug("Send aborted");
          errorHandler();
        });
        req.open("POST", this.url);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(data);
      }
    }]);
    return StatisticsSender;
  }();

  var StatisticsLogger = function () {
    function StatisticsLogger(id) {
      classCallCheck(this, StatisticsLogger);

      this.id = id;
    }

    createClass(StatisticsLogger, [{
      key: '_isDebug',
      value: function _isDebug() {
        return localStorage.getItem("vaadin." + this.id + ".debug");
      }
    }, {
      key: 'debug',
      value: function debug(msg) {
        if (this._isDebug()) {
          console.info(this.id + ": " + msg);
        }
      }
    }]);
    return StatisticsLogger;
  }();

  var UsageStatistics = function () {
    function UsageStatistics() {
      classCallCheck(this, UsageStatistics);

      this.now = new Date();
      this.timeNow = this.now.getTime();
      this.gatherDelay = 10; // Delay between loading this file and gathering stats
      this.initialDelay = 24 * 60 * 60;

      this.logger = new StatisticsLogger("statistics");
      this.storage = new StatisticsStorage("vaadin.statistics.basket");
      this.gatherer = new StatisticsGatherer(this.logger);
      this.sender = new StatisticsSender("https://tools.vaadin.com/usage-stats/submit", this.logger);
    }

    createClass(UsageStatistics, [{
      key: 'maybeGatherAndSend',
      value: function maybeGatherAndSend() {
        var _this = this;

        if (localStorage.getItem(UsageStatistics.optOutKey)) {
          return;
        }
        this.gatherer.gather(this.storage);
        setTimeout(function () {
          _this.maybeSend();
        }, this.gatherDelay * 1000);
      }
    }, {
      key: 'lottery',
      value: function lottery() {
        return true;
      }
    }, {
      key: 'currentMonth',
      value: function currentMonth() {
        return this.now.getYear() * 12 + this.now.getMonth();
      }
    }, {
      key: 'maybeSend',
      value: function maybeSend() {
        var firstUse = Number(localStorage.getItem(UsageStatistics.firstUseKey));
        var monthProcessed = Number(localStorage.getItem(UsageStatistics.monthProcessedKey));

        if (!firstUse) {
          // Use a grace period to avoid interfering with tests, incognito mode etc
          firstUse = this.timeNow;
          localStorage.setItem(UsageStatistics.firstUseKey, firstUse);
        }

        if (this.timeNow < firstUse + this.initialDelay * 1000) {
          this.logger.debug("No statistics will be sent until the initial delay of " + this.initialDelay + "s has passed");
          return;
        }
        if (this.currentMonth() <= monthProcessed) {
          this.logger.debug("This month has already been processed");
          return;
        }
        localStorage.setItem(UsageStatistics.monthProcessedKey, this.currentMonth());
        // Use random sampling
        if (this.lottery()) {
          this.logger.debug("Congratulations, we have a winner!");
        } else {
          this.logger.debug("Sorry, no stats from you this time");
          return;
        }

        this.send();
      }
    }, {
      key: 'send',
      value: function send() {
        // Ensure we have the latest data
        this.gatherer.gather(this.storage);

        // Read, send and clean up
        var data = this.storage.read();
        data["firstUse"] = Number(localStorage.getItem(UsageStatistics.firstUseKey));
        data["usageStatisticsVersion"] = UsageStatistics.version;
        var info = 'This request contains usage statistics gathered from the application running in development mode. \n\nStatistics gathering is automatically disabled and excluded from production builds.\n\nFor details and to opt-out, see https://github.com/vaadin/vaadin-usage-statistics.\n\n\n\n';
        var self = this;
        this.sender.send(info + JSON.stringify(data), function () {
          // Revert the 'month processed' flag
          localStorage.setItem(UsageStatistics.monthProcessedKey, self.currentMonth() - 1);
        });
      }
    }], [{
      key: 'version',
      get: function get$1() {
        return '2.1.0';
      }
    }, {
      key: 'firstUseKey',
      get: function get$1() {
        return 'vaadin.statistics.firstuse';
      }
    }, {
      key: 'monthProcessedKey',
      get: function get$1() {
        return 'vaadin.statistics.monthProcessed';
      }
    }, {
      key: 'optOutKey',
      get: function get$1() {
        return 'vaadin.statistics.optout';
      }
    }]);
    return UsageStatistics;
  }();

  try {
    window.Vaadin = window.Vaadin || {};
    window.Vaadin.usageStatsChecker = window.Vaadin.usageStatsChecker || new UsageStatistics();
    window.Vaadin.usageStatsChecker.maybeGatherAndSend();
  } catch (e) {
    // Intentionally ignored as this is not a problem in the app being developed
  }

  }());

    vaadin-dev-mode:end **/
  }

  const usageStatistics = function() {
    if (typeof runIfDevelopmentMode === 'function') {
      return runIfDevelopmentMode(maybeGatherAndSendStats);
    }
  };

  window.Vaadin = window.Vaadin || {};
  window.Vaadin.registrations = window.Vaadin.registrations || [];

  window.Vaadin.registrations.push({
    is: '@vaadin/router',
    version: '1.7.3',
  });

  usageStatistics();

  Router.NavigationTrigger = {POPSTATE, CLICK};

  class SiteHeader extends HTMLElement {
      constructor() {
          super();
          this.attachShadow({mode: 'open'});
      }

      connectedCallback() {
          this.render();
      }

      render() {
          this.html();
          this.css();
          this.scripts();
      }

      css() {
          this.defaultCSS();
          this.tabletLayoutCSS();
          this.mobileLayoutCSS();
          this.menuAnimationCSS();
      }

      html() {
          this.shadowRoot.innerHTML += `
            <div id="siteHeaderContainer">
                <img id="logo" src="../src/assets/shared/desktop/logo.svg" alt="company logo">
                <ul>
                    <li><a href="/stories">STORIES</a></li>
                    <li><a href="/features">FEATURES</a></li>
                    <li><a href="/pricing">PRICING</a></li>
                </ul>
                <button>GET AN INVITE</button>
                <ul id="menuIconContainer">
                    <img id="menuOpenIcon" src="../src/assets/shared/mobile/menu.svg" alt="menu open icon">
                    <img id="menuCloseIcon" src="../src/assets/shared/mobile/close.svg" alt="close icon">
                </ul>
            </div>
            <div id="dropDownOverlay">
                <div id="dropDownGroup">
                    <ul>
                        <li><a href="/stories">STORIES</a></li>
                        <li><a href="/features">FEATURES</a></li>
                        <li><a href="/pricing">PRICING</a></li>
                    </ul>
                    <button>GET AN INVITE</button>
                </div>
            </div>
        `;
      }

      defaultCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                *, *::before, *::after { padding: 0; margin: 0; }

                a {
                    color: var(--pure-black);
                    text-decoration: none;
                }

                :host {
                    display: block;
                    max-width: 100%;
                    padding-top: 28px;
                    padding-bottom: 28px;
                    padding-left: 165px;
                    padding-right: 165px;
                }

                :host > #dropDownOverlay {
                    display: none;
                    position: absolute;
                    height: 100vh;
                    width: 100vw;
                    background-color: var(--opaque-pure-black-2);
                    margin-top: 28px;
                    left: 0;
                    right: 0;
                    z-index: 100;
                }

                :host > #dropDownOverlay > #dropDownGroup {
                    background-color: var(--pure-white);
                    display: flex;
                    left: 0;
                    right: 0;
                    top: -1px;
                    padding-bottom: 32px;
                    padding-left: 33px;
                    padding-right: 32px;
                    padding-top: 32px;
                    position: absolute;
                }

                :host > #siteHeaderContainer {
                    align-items: center;
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                }

                :host > #siteHeaderContainer > ul, 
                :host > #dropDownOverlay > #dropDownGroup > ul {
                    display: flex;
                    flex-direction: row;
                    list-style: none;
                }

                :host > #siteHeaderContainer > ul > li,
                :host > #dropDownOverlay > #dropDownGroup > ul > li {
                    cursor: pointer;
                    font-size: var(--font-size-1);
                    font-weight: bold;
                    letter-spacing: var(--letter-spacing-1);
                    light-height: var(--line-height-1);
                }

                :host > #siteHeaderContainer > ul > li:not(:last-child) {
                    margin-right: 37px;
                }

                :host > #siteHeaderContainer > ul > li:hover,
                :host > #dropDownOverlay > #dropDownGroup > ul > li:hover {
                    opacity: 0.3;
                }

                :host > #siteHeaderContainer > button,
                :host > #dropDownOverlay > #dropDownGroup > button {
                    color: var(--pure-white);
                    cursor: pointer;
                    background: none;
                    background-color: var(--pure-black);
                    border: none;
                    font-size: var(--font-size-1);
                    font-weight: bold;
                    height: 40px;
                    letter-spacing: var(--letter-spacing-1);
                    width: 158px;
                }

                :host > #siteHeaderContainer > button:hover,
                :host > #dropDownOverlay > #dropDownGroup > button:hover {
                    color: rgba(0, 0, 0, 1);
                    background-color: var(--light-grey);
                }

                :host > #siteHeaderContainer > #menuIconContainer {
                    display: none;
                }
            </style>
        `;
      }

      tabletLayoutCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 968px) {
                    :host {
                        display: block;
                        padding-left: 39px;
                        padding-right: 40px;
                    }
                }
            </style>`;
      }

      mobileLayoutCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 700px) {
                    :host {
                        padding-left: 24px;
                        padding-right: 24px;
                    }

                    :host > #siteHeaderContainer {
                        align-items: center;
                        display: flex;
                        justify-content: space-between;
                    }

                    :host > #siteHeaderContainer > ul,
                    :host > #siteHeaderContainer > button {
                        display: none;
                    }

                    :host > #siteHeaderContainer > ul,
                    :host > #siteHeaderContainer > button {
                        display: none;
                    }

                    :host > #dropDownOverlay > #dropDownGroup {
                        align-items: center;
                        flex-direction: column;
                    }

                    :host > #dropDownOverlay > #dropDownGroup > ul {
                        align-items: center;
                        border-bottom: 1px solid var(--opaque-pure-black-1);
                        display: flex;
                        flex-direction: column;
                        margin-bottom: 20px;
                        width: 100%;
                    }

                    :host > #dropDownOverlay > #dropDownGroup > ul > li {
                        font-size: var(--font-size-2);
                        margin-bottom: 20px;
                    }

                    :host > #dropDownOverlay > #dropDownGroup > button {
                        font-size: var(--font-size-2);
                        height: 48px;
                        width: 100%;
                    }

                    :host > #siteHeaderContainer > #menuIconContainer {
                        display: block;
                    }

                    :host > #siteHeaderContainer > #menuIconContainer > #menuCloseIcon {
                        display: none;
                    }
                }
            </style>`;
      }

      menuAnimationCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                :host > #dropDownOverlay {
                    animation-fill-mode: forwards;
                    animation-duration: 0.1s;
                    animation-iteration-count: 1;
                }

                @keyframes openOverlay {
                    0% {
                        transform: scaleX(0);
                        transform: scaleY(0);
                    }
                    
                    100% {
                        transform: scaleX(1);
                        transform: scaleY(1);
                    }
                }

                @keyframes closeOverlay {
                    0% {
                        transform: scaleX(1);
                        transform: scaleY(1);
                    }
                    
                    100% {
                        transform: scaleX(0);
                        transform: scaleY(0);
                    }
                }

                :host > #dropDownOverlay > #dropDownGroup {
                    animation-fill-mode: forwards;
                    animation-duration: 0.5s;
                    animation-iteration-count: 1;
                }

                @keyframes openMenu {
                    0%, 50% {
                        opacity: 0;
                        transform: translate3d(0, -400px, 0);
                    }
                    
                    100% {
                        opacity: 1;
                        transform: translate3d(0, 0, 0);
                    }
                }
            </stlye>`
          ;
      }

      scripts() {
          this.mobileMenuToggle();
      }

      mobileMenuToggle() {
          this.shadowRoot.addEventListener('click', (event) => {
              const { id } = event.target;
              switch (id) {
                  case 'dropDownGroup': this.toggleMobileMenu();
                  break;
                  case 'menuOpenIcon': this.openMobileMenu();
                  break;
                  case 'menuCloseIcon': this.closeMobileMenu();
                  break;
              }

              window.addEventListener('keydown', (event) => {
                  if (this.isMobileMenuOpen() && event.key === 'Escape') {
                      this.closeMobileMenu();
                  }
              });

              window.addEventListener('resize', () => {
                  if (this.isMobileMenuOpen() && window.innerWidth > 700) {
                      this.closeMobileMenu();
                  }
              });
          });
      }

      openMobileMenu() {
          this.shadowRoot.querySelector('#dropDownOverlay').style.animationName = 'openOverlay';
          this.shadowRoot.querySelector('#dropDownOverlay > #dropDownGroup').style.animationName = 'openMenu';
          this.shadowRoot.querySelector('#dropDownOverlay').style.display = 'block';
          this.shadowRoot.querySelector('#menuIconContainer > #menuOpenIcon').style.display = 'none';
          this.shadowRoot.querySelector('#menuIconContainer > #menuCloseIcon').style.display = 'block';
      }

      closeMobileMenu() {
          this.shadowRoot.querySelector('#dropDownOverlay').style.animationName = 'closeOverlay';
          this.shadowRoot.querySelector('#dropDownOverlay > #dropDownGroup').style.animationName = '';
          setTimeout(() => {
              this.shadowRoot.querySelector('#dropDownOverlay').style.display = 'none';
              this.shadowRoot.querySelector('#menuIconContainer > #menuOpenIcon').style.display = 'block';
              this.shadowRoot.querySelector('#menuIconContainer > #menuCloseIcon').style.display = 'none';
          }, 200);
      }


      isMobileMenuOpen() {
          const result = this.shadowRoot.querySelector('#dropDownOverlay').style.display;
          return (result !== "none") ? true : false;
      }

      toggleMobileMenu() {
          if (!this.isMobileMenuOpen()) {
              this.openMobileMenu();
          } else {
              this.closeMobileMenu();
          }
      }
  }

  if (!customElements.get('site-header')) {
      customElements.define('site-header', SiteHeader);
  }

  const storyCardGenerator = (section, metaData) => {
      let html = ``;

      for (let i = 0; i < metaData.length; i++) {
          if (!metaData[i].sections.includes(section)) {
              continue;
          }
          
          html += `<story-card
            publishDate="${metaData[i].publishDate}"
            title="${metaData[i].title}"
            author="${metaData[i].author}"
            desktopImage="${metaData[i].desktopImage}"
            tabletImage="${metaData[i].tabletImage}"
            mobileImage="${metaData[i].mobileImage}"
        ></story-card>`;
      }

      return html;
  };

  const cardMetaData = [
      {
          sections: ["home", "stories"],
          publishDate: 'April 16th 2020',
          title: "The Mountains", author: "John Appleseed",
          desktopImage: "../src/assets/stories/desktop/mountains.jpg",
          tabletImage: "../src/assets/stories/table/mountains.jpg",
          mobileImage: "../src/assets/stories/mobile/mountains.jpg"
      },
      {
          sections: ["home", "stories"],
          publishDate: 'April 14th 2020',
          title: "Sunset Cityscapes", author: "Benjamin Cruz",
          desktopImage: "../src/assets/stories/desktop/cityscapes.jpg",
          tabletImage: "../src/assets/stories/table/cityscapes.jpg",
          mobileImage: "../src/assets/stories/mobile/cityscapes.jpg"
      },
      {
          sections: ["home", "stories"],
          publishDate: 'April 11th 2020',
          title: "18 Days Voyage", author: "Alexei Borodin",
          desktopImage: "../src/assets/stories/desktop/18-days-voyage.jpg",
          tabletImage: "../src/assets/stories/table/18-days-voyage.jpg",
          mobileImage: "../src/assets/stories/mobile/18-days-voyage.jpg"
      },
      {
          sections: ["home", "stories"],
          publishDate: 'April 9th 2020',
          title: "Architecturals", author: "Samantha Brooke",
          desktopImage: "../src/assets/stories/desktop/architecturals.jpg",
          tabletImage: "../src/assets/stories/table/architecturals.jpg",
          mobileImage: "../src/assets/stories/mobile/architecturals.jpg"
      },
      {
          sections: ["stories"],
          publishDate: 'April 7th 2020',
          title: "World Tour 2019", author: "by Timothy Wagner",
          desktopImage: "../src/assets/stories/desktop/world-tour.jpg",
          tabletImage: "../src/assets/stories/table/world-tour.jpg",
          mobileImage: "../src/assets/stories/mobile/world-tour.jpg"
      },
      {
          sections: ["stories"],
          publishDate: 'April 3rd 2020',
          title: "Unforeseen Corners", author: "by William Malcolm",
          desktopImage: "../src/assets/stories/desktop/unforeseen-corners.jpg",
          tabletImage: "../src/assets/stories/table/unforeseen-corners.jpg",
          mobileImage: "../src/assets/stories/mobile/unforeseen-corners.jpg"
      },
      {
          sections: ["stories"],
          publishDate: 'March 29th 2020',
          title: "King on Africa: Part II", author: "by Tim Hillenburg",
          desktopImage: "../src/assets/stories/desktop/king-on-africa.jpg",
          tabletImage: "../src/assets/stories/table/king-on-africa.jpg",
          mobileImage: "../src/assets/stories/mobile/king-on-africa.jpg"
      },
      {
          sections: ["stories"],
          publishDate: 'March 21st 2020',
          title: "The Trip to Nowhere", author: "by Felicia Rourke",
          desktopImage: "../src/assets/stories/desktop/trip-to-nowhere.jpg",
          tabletImage: "../src/assets/stories/table/trip-to-nowhere.jpg",
          mobileImage: "../src/assets/stories/mobile/trip-to-nowhere.jpg"
      },
      {
          sections: ["stories"],
          publishDate: 'March 19th 2020',
          title: "Rage of The Sea", author: "by Mohammed Abdul",
          desktopImage: "../src/assets/stories/desktop/rage-of-the-sea.jpg",
          tabletImage: "../src/assets/stories/table/rage-of-the-sea.jpg",
          mobileImage: "../src/assets/stories/mobile/rage-of-the-sea.jpg"
      },
      {
          sections: ["stories"],
          publishDate: 'March 16th 2020',
          title: "Running Free", author: "by Michelle",
          desktopImage: "../src/assets/stories/desktop/running-free.jpg",
          tabletImage: "../src/assets/stories/table/running-free.jpg",
          mobileImage: "../src/assets/stories/mobile/running-free.jpg"
      },
      {
          sections: ["stories"],
          publishDate: 'March 11th 2020',
          title: "Behind the Waves", author: "by Lamarr Wilson",
          desktopImage: "../src/assets/stories/desktop/behind-the-waves.jpg",
          tabletImage: "../src/assets/stories/table/behind-the-waves.jpg",
          mobileImage: "../src/assets/stories/mobile/behind-the-waves.jpg"
      },
      {
          sections: ["stories"],
          publishDate: 'March 9th 2020',
          title: "Calm Waters", author: "by Samantha Brooke",
          desktopImage: "../src/assets/stories/desktop/calm-waters.jpg",
          tabletImage: "../src/assets/stories/table/calm-waters.jpg",
          mobileImage: "../src/assets/stories/mobile/calm-waters.jpg"
      },
      {
          sections: ["stories"],
          publishDate: 'March 5th 2020',
          title: "The Milky Way", author: "by Benjamin Cruz",
          desktopImage: "../src/assets/stories/desktop/milky-way.jpg",
          tabletImage: "../src/assets/stories/table/milky-way.jpg",
          mobileImage: "../src/assets/stories/mobile/milky-way.jpg"
      },
      {
          sections: ["stories"],
          publishDate: 'March 4th 2020',
          title: "Night at The Dark Forest", author: "by  Mohammed Abdul",
          desktopImage: "../src/assets/stories/desktop/dark-forest.jpg",
          tabletImage: "../src/assets/stories/table/dark-forest.jpg",
          mobileImage: "../src/assets/stories/mobile/dark-forest.jpg"
      },
      {
          sections: ["stories"],
          publishDate: 'March 1st 2020',
          title: "Somwarpet’s Beauty", author: "by Michelle",
          desktopImage: "../src/assets/stories/desktop/somwarpet.jpg",
          tabletImage: "../src/assets/stories/table/somwarpet.jpg",
          mobileImage: "../src/assets/stories/mobile/somwarpet.jpg"
      },
      {
          sections: ["stories"],
          publishDate: 'February 25th 2020',
          title: "Land of Dreams", author: "by William Malcolm",
          desktopImage: "../src/assets/stories/desktop/land-of-dreams.jpg",
          tabletImage: "../src/assets/stories/table/land-of-dreams.jpg",
          mobileImage: "../src/assets/stories/mobile/land-of-dreams.jpg"
      }
  ];

  class HeroSection extends HTMLElement {
      constructor() {
          super();
          this.attachShadow({mode: 'open'});
      }

      connectedCallback() {
          this.render();
      }

      render() {
          this.html();
          this.css();
      }

      css()  {
          this.defaultCSS();
          this.tabletLayoutCSS();
          this.mobileLayoutCSS();
      }

      html() {
          this.shadowRoot.innerHTML += `
            <div id="row-1" class="row">
                <span class="descriptionBox">
                    <div class="descriptionContainer">
                        <h2>CREATE AND SHARE YOUR PHOTO STORIES.</h2>
                        <p>
                            Photosnap is a platform for photographers and visual
                            storytellsers. We make it easy to share photos, tell
                            stories and connect with others.
                        </p>
                        <a id="cta" href="#000">
                            <p>GET AN INVITE</p>
                            <img class="arrowIcon" src="../src/assets/shared/desktop/white/arrow.svg">
                        </a>
                    </div>
                </span>
                <span class="imageBox"></span>
            </div>

            <div id="row-2" class="row">
                <span class="imageBox"></span>
                <span class="descriptionBox">
                    <div class="descriptionContainer">
                        <h2>BEAUTIFUL STORIES<br> EVERY TIME</h2>
                        <p>
                            We provide design templates to ensure your stories
                            look terrific. Easily add photos, text, embed maps
                            and media from other networks. Then share your
                            story with everyone.
                        </p>
                        <a id="cta" href="#000">
                            <p>VIEW THE STORIES</p>
                            <img class="arrowIcon" src="../src/assets/shared/desktop/arrow.svg">
                        </a>
                    </div>
                </span>
            </div>

            <div id="row-3" class="row">
                <span class="descriptionBox">
                    <div class="descriptionContainer">
                        <h2>DESIGNED FOR EVERYONE</h2>
                        <p>
                            Photosnap can help you create stories that resonate with your audience.  Our tool is designed for
                            photographers of all levels, brands, businesses you name it. 
                        </p>
                        <a id="cta" href="#000">
                            <p>VIEW THE STORIES</p>
                            <img class="arrowIcon" src="../src/assets/shared/desktop/arrow.svg">
                        </a>
                    </div>
                </span>
                <span class="imageBox"></span>
            </div>
        `;
      }

      defaultCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                *, *::before, *::after { margin: 0, padding: 0; }

                .row {
                    display: flex;
                    flex-direction: row;
                }

                .row > .descriptionBox > .descriptionContainer {
                    margin-top: -33px;
                }

                .row > .descriptionBox > .descriptionContainer > h2 {
                    font-size: var(--font-size-5);
                    font-weight: bold;
                    letter-spacing: var(--letter-spacing-2);
                    line-height: var(--line-height-3);
                    margin-bottom: 21px;
                    max-width: 387px;
                }

                .row > .descriptionBox > .descriptionContainer >  p {
                    font-size: var(--font-size-2);
                    line-height: var(--line-height-2);
                    opacity: 0.6;
                    margin-bottom: 48px;
                    max-width: 387px;
                }

                #cta {
                    align-items: center;
                    cursor: pointer;
                    display: flex;
                    max-width: 168px;
                    max-height: 16px;
                    text-decoration: none;
                }

                #cta > p {
                    font-size: var(--font-size-1);
                    font-weight: bold;
                    letter-spacing: var(--letter-spacing-1);
                    margin-right: 16px;
                    white-space: nowrap;
                }

                #row-1 > .descriptionBox {
                    background-color: var(--pure-black);
                    color: var(--light-grey);
                    padding-left: 7.778%;
                    padding-right: 7.708%;
                    padding-top: 13%;
                    padding-bottom: 13%;
                    max-width: 610px;
                    max-height: 100%;
                }

                #row-1 {
                    height: 650px;
                    max-width: 100%;
                }

                #row-2,
                #row-3 {
                    height: 600px;
                    max-width: 100%;
                }

                #row-1 > .descriptionBox > .descriptionContainer,
                #row-2 > .descriptionBox > .descriptionContainer,
                #row-3 > .descriptionBox > .descriptionContainer {
                    max-width: 100%;
                    max-height: 100%;
                }

                #row-1 > .descriptionBox > .descriptionContainer > #cta {
                    color: var(--pure-white);
                    font-weight: bold;
                }

                #row-1 > .descriptionBox > .descriptionContainer > #cta > p:hover {
                    border-bottom: 1px solid var(--light-grey);
                }

                #row-1 > .imageBox {
                    background-image: url("../src/assets/home/desktop/create-and-share.jpg");
                    background-position: center;
                    height: 100%;
                    width: 830px;     
                }

                #row-2 > .imageBox {
                    background-image: url("../src/assets/home/desktop/beautiful-stories.jpg");
                    background-position: center;
                    height: 100%;
                    width: 830px;                    
                }

                #row-2 > .descriptionBox {
                    max-height: 100%;
                    max-width: 610px;
                    padding-left: 7.778%;
                    padding-right: 7.708%;
                    padding-top: 13%;
                    padding-bottom: 13%;
                }

                #row-2 > .descriptionBox > .descriptionContainer > #cta {
                    color: var(--pure-black);
                    font-weight: bold;
                }

                #row-2 > .descriptionBox > .descriptionContainer > #cta > p:hover {
                    border-bottom: 1px solid var(--pure-black);
                }

                #row-3 > .descriptionBox {
                    max-height: 100%;
                    padding-top: 160px;
                    padding-top: 11.111%;
                    padding-left: 7.778%;
                    padding-right: 7.708%;
                    padding-bottom: 11.042%; 
                    max-width: 610px;                  
                }

                #row-3 > .descriptionBox > .descriptionContainer > #cta {
                    color: var(--pure-black);
                    font-weight: bold;
                }

                #row-3 > .descriptionBox > .descriptionContainer > #cta > p:hover {
                    border-bottom: 1px solid var(--pure-black);
                }

                #row-3 > .descriptionBox > #cta > p:hover {
                    border-bottom: 1px solid var(--pure-black);
                }

                #row-3 > .imageBox {
                    background-image: url("../src/assets/home/desktop/designed-for-everyone.jpg");
                    background-position: center;
                    height: 100%;
                    width: 830px;
                }

                #row-1 > .descriptionBox {
                    position: relative;
                }

                #row-1 > .descriptionBox::after {
                    content: "";
                    background-image: var(--main-accent);
                    height: 45%;
                    left: 0px;
                    bottom: 168px;
                    position: absolute;
                    width: 6px;
                    transform: scaleY(0);
                    transition-duration: 0.5s;
                }

                #row-1 > .descriptionBox:hover::after {
                    transform: scaleY(1);
                }
            </style>
        `;
      }

      tabletLayoutCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 768px) {
                    #row-1 > .descriptionBox {
                        padding-left: 54px;
                        padding-right: 54px;
                        max-width: 495px;
                    }

                    #row-2 > .descriptionBox {
                        padding-left: 54px;
                        padding-right: 54px;
                        padding-top: 136px;
                        padding-bottom: 135px;
                        max-width: 495px;
                    }

                    #row-3 > .descriptionBox {
                        padding-left: 54px;
                        padding-right: 54px;
                        padding-top: 160px;
                        padding-bottom: 159px;
                        max-width: 495px;
                    }

                }
            </style>`;
      }

      mobileLayoutCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 375px) {
                    .row {
                        flex-direction: column;
                        width: 375px;
                    }

                    .row > .imageBox {
                        background-repeat: no-repeat;
                        background-size: cover;
                        max-width: 100%;
                        order: 1;
                    }

                    .row > .descriptionBox {
                        max-width: 100%;
                        order: 2;
                    }

                    .row > .descriptionBox > .descriptionContainer > h2 {
                        font-size: var(--font-size-7);
                        letter-spacing: var(--letter-spacing-3);
                        line-height: var(--line-height-4);
                        margin-bottom: 16px;
                    }

                    .row > .descriptionBox > .descriptionContainer > p {
                        margin-bottom: 23px;
                    }

                    #row-1 {
                        height: 713px;
                    }

                    #row-1 > .imageBox {
                        min-height: 294px
                    }

                    #row-1 > .descriptionBox {
                        height: 419px;
                        padding-left: 33px;
                        padding-right: 24px;
                        padding-top: 72px;
                        padding-bottom: 72px;
                    }

                    #row-1 > .descriptionBox > .descriptionContainer {
                        height: 275px;
                        width: 318px;
                    }

                    #row-1 > .descriptionBox > .descriptionContainer:hover::after {
                        display: none;
                    }

                    #row-1 > .descriptionBox > .descriptionContainer::after {
                        content: "";
                        background-image: var(--main-accent);
                        display: block;
                        height: 6px;
                        left: 0px;
                        bottom: 341px;
                        position: relative;
                        width: 128px;
                    }

                    #row-2 {
                        height: 690px;
                    }

                    #row-2 > .imageBox {
                        min-height: 271px;
                    }

                    #row-2 > .descriptionBox {
                        height: 419px;
                        padding-left: 33px;
                        padding-right: 24px;
                        padding-top: 72px;
                        padding-bottom: 72px;
                    }

                    #row-2 > .descriptionBox > .descriptionContainer {
                        height: 275px;
                        width: 318px;
                    }

                    #row-3 {
                        height: 690px;
                    }

                    #row-3 > .imageBox {
                        minheight: 271px;
                    }

                    #row-3 > .descriptionBox {
                        height: 419px;-;
                        padding-top: 92px;
                        padding-bottom: 92px;
                    }

                    #row-3 > .descriptionBox > .descriptionContainer {
                        height: 235px;
                        width: 318px;
                    }
                }
            </style>`;
      }
  }

  if (!customElements.get('hero-section')) {
      customElements.define('hero-section', HeroSection);
  }

  class StoryCard extends HTMLElement {
      static get observedAttributes() {
          return ['publishDate, title, author, desktopImage, tabletImage, mobileImage'];
      }

      constructor() {
          super();
          this.attachShadow({mode: 'open'});
      }

      attributeChangedCallback(attrName, oldValue, newValue) {
          if (oldValue !== newValue) {
              this[attrName] = this.getAttribute(attrName);
          }
      }

      connectedCallback() {
          this.render();
      }

      render() {
          this.html();
          this.css();
      }

      html() {
          this.shadowRoot.innerHTML +=
          `<div id="details">
            <time>${this.getAttribute('publishDate')}</time>
            <h3>${this.getAttribute('title')}</h3>
            <address rel="author">by ${this.getAttribute('author')}</address>
            <a id="cta" href="#000">
                <p>READ STORY</p>
                <img class="arrowIcon" src="../src/assets/shared/desktop/white/arrow.svg">
            </a>
        </div>
        `;
      }

      css() {
          this.shadowRoot.innerHTML += `
            <style>
            *, *::before, *::after { margin: 0; padding: 0; }

            :host {
                align-items: center;
                background-image: url('${this.getAttribute('desktopImage')}');
                background-position: center;
                background-size: cover;
                color: var(--pure-white);
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                transition-property: transform;
                transition-duration: .2s;
            }

            :host(:hover) {
                transform: translateY(-20px);
            }

            :host(:hover)::after {
                content: "";
                background-image: var(--main-accent);
                display: block;
                height: 6px;
                position: relative;
                width: 100%;
            }

            #details {
                width: 77.78%;
                margin-bottom: 40px;
            }

            #details > time {
                font-size: var(--font-size-6);
                margin-bottom: 4px;
            }

            #details > address {
                font-style: normal;
            }

            #details > h3 {
                font-weight: bold;
                font-size: var(--font-size-3);
                margin-bottom: 4px;
            }

            #details > address {
                font-size: var(--font-size-6);
                margin-bottom: 16px;
            }

            #cta {
                align-items: center;
                border-top: 1px solid var(--opaque-pure-white);
                cursor: pointer;
                display: flex;
                justify-content: center;
                max-width: 168px;
                max-height: 16px;
                text-decoration: none;
                max-width: 100%;
                padding-top: 20px;
            }

            #cta > p {
                color: var(--pure-white);
                font-size: var(--font-size-1);
                letter-spacing: var(--letter-spacing-1);
                margin-right: auto;
                white-space: nowrap;
            }
            </style>
        `;
      }
  }

  if (!customElements.get('story-card')) {
      customElements.define('story-card', StoryCard);
  }

  class PersuasiveServiceDetails extends HTMLElement {
      static get observedAttributes() {
          return [ 'displayOff' ]
      }
      constructor() {
          super();
          this.attachShadow({mode: 'open'});
      }

      connectedCallback() {
          this.render();
      }
      
      render() {
          this.html();
          this.css();
      }

      html() {
          this.shadowRoot.innerHTML += `
            <div id="detailsContainer">
                <article id="detail-1" class="detail group-1">
                    <img class="detailIcon" src="../src/assets/features/desktop/responsive.svg">
                    <div class="descriptionContainer">
                        <h3>100% Responsive</h3>
                        <p>
                            No matter which the device you’re on, our site is fully
                            responsive and stories look beautiful on any screen.
                        </p>
                    </div>
                </article>
                <article id="detail-2" class="detail group-1">
                    <img class="detailIcon" src="../src/assets/features/desktop/no-limit.svg">
                    <div class="descriptionContainer">
                        <h3>No Photo Upload Limit</h3>
                        <p>
                            Our tool has no limits on uploads or bandwidth. Freely
                            upload in bulk and share all of your stories in one go.
                        </p>
                    </div>
                </article>
                <article id="detail-3" class="detail group-1">
                    <img class="detailIcon" src="../src/assets/features/desktop/embed.svg">
                    <div class="descriptionContainer">
                        <h3>Available to Embed</h3>
                        <p>
                            Embed Tweets, Facebook posts, Instagram media, Vimeo
                            or YouTube videos, Google Maps, and more.
                        </p>
                    </div>
                </article>
                <article id="detail-4" class="detail group-2">
                    <img class="detailIcon" src="../src/assets/features/desktop/custom-domain.svg">
                    <div class="descriptionContainer">
                        <h3>100% Responsive</h3>
                        <p>
                            With Photosnap subscriptions you can host your stories on your own domain.
                            You can also remove our branding!
                        </p>
                    </div>
                </article>
                <article id="detail-5" class="detail group-2">
                    <img class="detailIcon" src="../src/assets/features/desktop/boost-exposure.svg">
                    <div class="descriptionContainer">
                        <h3>No Photo Upload Limit</h3>
                        <p>
                            Users that viewed your story or gallery can easily get notifed of new and
                            featured stories with our built in mailing list.
                        </p>
                    </div>
                </article>
                <article id="detail-6" class="detail group-2">
                    <img class="detailIcon" src="../src/assets/features/desktop/drag-drop.svg">
                    <div class="descriptionContainer">
                        <h3>Available to Embed</h3>
                        <p>
                            Easily drag and drop your image and get beautiful shots everytime. No over
                            the top tooling to add friction to creating stories.
                        </p>
                    </div>
                </article>
            </div>
        `;
      }

      css() {
          this.defaultCSS();
          this.tabletLayoutCSS();
          this.mobileLayoutCSS();
      }

      defaultCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                *, *::before, *::after { padding: 0; margin: 0; }

                :host {
                    background-color: var(--pure-white);
                    display: block;
                    max-width: 100%;
                    padding-top: 160px;
                    padding-bottom: 160px;
                    padding-left: 12.5%;
                    padding-right: 12.5%;
                }

                #detailsContainer {
                    display: grid;
                    grid-template-columns: repeat(3, 31.53%);
                    grid-auto-rows: auto;
                    grid-column-gap: 2.70%;
                    grid-row-gap: 104px;
                    width: 100%;
                }
                
                #detailsContainer > .detail {
                    align-items: center;
                    display: flex;
                    flex-direction: column;
                    grid-column: span 1;
                }

                #detailsContainer > .detail > img {
                    margin-bottom: 48px;
                }

                #detailsContainer > #detail-2 > img {
                    margin-top: 15px;
                    margin-bottom: 66px;
                }

                #detailsContainer > .detail > .descriptionContainer > h3 {
                    font-size: var(--font-size-3);
                    font-weight: bold;
                    margin-bottom: 16px;
                    text-align: center;
                }

                #detailsContainer > .detail > .descriptionContainer > p {
                    font-size: var(--font-size-2);
                    text-align: center;
                    line-height: var(--line-height-2);
                }

                #detailsContainer > ${this.getAttribute('displayOff')} {
                    display: none;
                }
            </style>
        `;
      }

      tabletLayoutCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 768px) {

                    :host {
                        padding-bottom: 112px;
                        padding-top: 112px;
                        padding-left: 5.20%;
                        padding-right: 5.20%;
                    }

                    #detailsContainer {
                        grid-template-columns: repeat(2, 49.13%);
                        grid-auto-rows: auto;
                        grid-column-gap: 0.99%;
                        grid-row-gap: 83px;
                    }

                    :host([displayoff=".group-2"]) {
                        padding-bottom: 120px;
                        padding-top: 120px;
                        padding-left: 20.182%;
                        padding-right: 20.312%;
                    }

                    :host([displayoff=".group-2"]) > #detailsContainer {
                        grid-template-columns: minmax(91.4px, 457px);
                        grid-auto-rows: auto;
                        grid-row-gap: 80px;
                        justify-content: center;
                    }
                }
            </style>`;
      }

      mobileLayoutCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 375px) {
                    :host {
                        padding-bottom: 91px;
                        padding-top: 64px;
                    }

                    #detailsContainer {
                        grid-template-columns: 1fr;
                        grid-auto-rows: auto;
                        grid-row-gap: 56px;
                        max-width: 310px;
                        margin-left: auto;
                        margin-right: auto;
                    }
                }
            </style>`;
      }
  }

  if (!customElements.get('persuasive-service-details')) {
      customElements.define('persuasive-service-details', PersuasiveServiceDetails);
  }

  class HomeSection extends HTMLElement {
      constructor() {
          super();
          this.attachShadow({mode: 'open'});
      }

      connectedCallback() {
          this.render();
      }

      render() {
          this.html();
          this.css();
      }

      html()  {
          this.shadowRoot.innerHTML += `
            <hero-section></hero-section>
            <div id="storyCardsContainer">${storyCardGenerator("home", cardMetaData)}</div>
            <persuasive-service-details displayOff=".group-2"></persuasive-service-details>
        `;
      }

      css() {
          this.defaultCSS();
          this.tabletLayoutCSS();
          this.mobileLayoutCSS();
      }

      defaultCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                *, *::before, *::after { margin: 0; padding: 0; }

                #storyCardsContainer {
                    display: grid;
                    grid-template-columns: repeat(4, 25%);
                    grid-template-rows: 500px;
                }

                story-card {
                    grid-column: span 1;
                }

                persuasive-service-details {
                    padding-bottom: 120px;
                    padding-top: 120px;
                }
            </style>
        `;
      }

      tabletLayoutCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 768px) {
                    #storyCardsContainer {
                        grid-template-columns: repeat(2, 50%);
                        grid-template-rows: repeat(2, 500px);
                    }
                }
            </style>`;
      }

      mobileLayoutCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 375px) {
                    persuasive-service-details {
                        padding-bottom: 80px;
                        padding-top: 80px;
                    }

                    #storyCardsContainer {
                        grid-template-columns: repeat(1, 100%);
                        grid-template-rows: repeat(4, 500px);
                    }
                }
            </style>`;
      }
  }

  if (!customElements.get('home-section')) {
      customElements.define('home-section', HomeSection);
  }

  class LastMonthFeature extends HTMLElement {
      constructor() {
          super();
          this.attachShadow({mode: 'open'});
      }

      connectedCallback() {
          this.render();
      }

      render() {
          this.html();
          this.css();
      }

      html() {
          this.shadowRoot.innerHTML += `
            <div id="featuredStory">
                <div id="featuredStoryContainer">
                    <h3>LAST MONTH’S FEATURED STORY</h3>
                    <h2>HAZY FULL MOON OF APPALACHIA</h2>
                    <small id="articleMetaData"><time>March 2nd 2020</time>&nbsp;<address rel="author"> by John Appleseed</address></small>
                    <p>
                        The dissected plateau area, while not actually made up of geological
                        mountains, is popularly called "mountains," especially in eastern
                        Kentucky and West Virginia, and while the ridges are not high, the
                        terrain is extremely rugged.
                    </p>
                    <a id="cta" href="#000">
                        <p>READ THE STORY</p>
                        <img class="arrowIcon" src="../src/assets/shared/desktop/white/arrow.svg">
                    </a>
                </div>
            </div>
        `;
      }

      css() {
          this.defaultCSS();
      }

      defaultCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                *, *::before, *::after { padding: 0; margin: 0; }

                #featuredStory {
                    background-image: url('../src/assets/stories/desktop/moon-of-appalacia.jpg');
                    background-position: center;
                    background-size: cover;
                    background-repeat: no-repeat;
                    max-width: 100%;
                    padding-bottom: 122px;
                    padding-left: 7.78%;
                    padding-top: 122px;
                }

                #featuredStory:hover {
                    background-image:
                        var(--secondary-accent),
                        url('../src/assets/stories/desktop/moon-of-appalacia.jpg');
                }

                #featuredStory > #featuredStoryContainer {
                    color: var(--pure-white);
                    max-width: 387px;
                }

                #featuredStory > #featuredStoryContainer > h3 {
                    font-size: var(--font-size-1);
                    letter-spacing: var(--letter-spacing-1);
                    margin-bottom: 24px;
                }

                #featuredStory > #featuredStoryContainer > h2 {
                    font-size: var(--font-size-5);
                    letter-spacing: var(--letter-spacing-2);
                    margin-bottom: 16px;
                }

                #featuredStory > #featuredStoryContainer > #articleMetaData {
                    display: flex;
                    flex-direction: row;
                    font-size: var(--font-size-6);
                    margin-bottom: 24px;
                }

                #featuredStory > #featuredStoryContainer > #articleMetaData > time {
                    opacity: 0.75;
                }

                #featuredStory > #featuredStoryContainer > #articleMetaData > address {
                    font-style: normal;
                }

                #featuredStory > #featuredStoryContainer > p {
                    color: var(--opaque-pure-white-2);
                    font-size: var(--font-size-2);
                    line-height: var(--line-height-2);
                    margin-bottom: 24px;
                }

                #featuredStory > #featuredStoryContainer > #cta {
                    align-items: flex-start;
                    cursor: pointer;
                    display: flex;
                    text-decoration: none;
                }
    
                #featuredStory > #featuredStoryContainer > #cta > p {
                    color: var(--pure-white);
                    font-size: var(--font-size-1);
                    letter-spacing: var(--letter-spacing-1);
                    margin-right: 16px;
                    white-space: nowrap;
                }

                #featuredStory > #featuredStoryContainer > #cta {
                    color: var(--pure-white);
                    font-weight: bold;
                }

                #featuredStory > #featuredStoryContainer > #cta > p:hover {
                    border-bottom: 1px solid var(--pure-white);
                }
            </style>
        `;
      }
  }

  if (!customElements.get('last-month-feature')) {
      customElements.define('last-month-feature', LastMonthFeature);
  }

  class StoriesSection extends HTMLElement {
      constructor() {
          super();
          this.attachShadow({mode: 'open'});
      }

      connectedCallback() {
          this.render();
      }

      render() {
          this.html();
          this.css();
      }

      html() {
          let markup = ``;
          markup += `<last-month-feature></last-month-feature>`;
          markup += `<div id="storyCardsContainer">${storyCardGenerator("stories", cardMetaData)}</div>`;
          this.shadowRoot.innerHTML +=  markup;
      }
      
      css() {
          this.defaultCSS();
          this.tabletLayoutCSS();
          this.mobileLayoutCSS();
      }

      defaultCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                *, *::before, *::after { margin: 0; padding: 0; }

                #storyCardsContainer {
                    display: grid;
                    grid-template-columns: repeat(4, 25%);
                    grid-auto-rows: 500px;
                }

                story-card {
                    grid-column: span 1;
                }
            </style>
        `;
      }

      tabletLayoutCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 768px) {
                    #storyCardsContainer {
                        grid-template-columns: repeat(2, 50%);
                    }
                }
            </style>`;
      }

      mobileLayoutCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 375px) {
                    persuasive-service-details {
                        padding-bottom: 80px;
                        padding-top: 80px;
                    }

                    #storyCardsContainer {
                        grid-template-columns: repeat(1, 100%);
                    }
                }
            </style>`;
      }
  }

  if (!customElements.get('stories-section')) {
      customElements.define('stories-section', StoriesSection);
  }

  class GenericHeroSection extends HTMLElement {
      static get observedAttributes() {
          return  ['desktopImage, tabletImage, mobileImage, title, paragraph'];
      }

      constructor() {
          super();
          this.attachShadow({mode: 'open'});
      }

      attributeChangeCallback(attrName, oldValue, newValue) {
          if (oldValue !== newValue) {
              this[attrName] = this.getAttribute(attrName);
          }
      }

      connectedCallback() {
          this.render();
      }

      render() {
          this.html();
          this.css();
      }

      css()  {
          this.defaultCSS();
          this.tabletLayoutCSS();
          this.mobileLayoutCSS();
      }

      html() {
          this.shadowRoot.innerHTML +=  `
            <div id="hero" class="row">
                <span class="descriptionBox">
                    <div class="descriptionContainer">
                        <h2>${this.getAttribute('title')}</h2>
                        <p>${this.getAttribute('paragraph')}</p>
                    </div>
                </span>
                <span class="imageBox"></span>
            </div>
        `;
      }

      defaultCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                *, *::before, *::after { margin: 0, padding: 0; }

                #hero {
                    display: flex;
                    flex-direction: row;
                    height: 490px;
                    max-width: 100%;
                }

                #hero > .descriptionBox {
                    background-color: var(--pure-black);
                    color: var(--opaque-pure-white-2);
                    font-size: var(--font-size-2);
                    line-height: var(--line-height-2);
                    padding-left: 112px;
                    padding-right: 111px;
                    padding-top: 173px;
                    padding-bottom: 173px;
                    max-height: 100%;
                }

                #hero > .descriptionBox > .descriptionContainer {
                    margin-top: -33px;
                    max-width: 387px;
                }

                #hero > .descriptionBox > .descriptionContainer > h2 {
                    color: var(--pure-white);
                    font-size: var(--font-size-5);
                    font-weight: bold;
                    letter-spacing: var(--letter-spacing-2);
                    line-height: var(--line-height-3);
                    margin-bottom: 21px;
                }

                #hero > .descriptionBox > .descriptionContainer::after {
                    animation-name: load;
                    animation-duration: 0.7s;
                    animation-fill-mode: forwards;
                    animation-iteration-count: 1;
                    content: "";
                    background-image: var(--main-accent);
                    display: block;
                    height: 144px;
                    left: -112px;
                    bottom: 160px;
                    position: relative;
                    width: 6px;
                }

                @keyframes load {
                    0% {
                        transform: scaleY(3);
                    }
                    100% {
                        transform: scaleY(1);
                    }
                }

                #hero > .imageBox {
                    background-image: url("${this.getAttribute('desktopImage')}");
                    background-position: center;
                    background-size: cover;
                    background-repeat: no-repeat;
                    height: 100%;
                    width: 830px;     
                }
            </style>
        `;
      }

      tabletLayoutCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 768px) {
                    #hero > .descriptionBox {
                        padding-left: 54px;
                        padding-right: 54px;
                        max-width: 495px;
                    }

                    #hero > .descriptionBox > .descriptionContainer::after {
                        left: -54px;
                    }

                    #hero > .imageBox {
                        background-image: url("${this.getAttribute('tabletImage')}");
                    }
                }
            </style>`;
      }

      mobileLayoutCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 375px) {

                    #hero {
                        flex-direction: column;
                        height: 594px;
                        width: 375px;
                    }

                    #hero > .imageBox {
                        background-image: url("${this.getAttribute('mobileImage')}");
                        background-repeat: no-repeat;
                        background-size: cover;
                        max-width: 100%;
                        order: 1;
                    }

                    #hero > .descriptionBox {
                        Xheight: 419px;
                        padding-left: 33px;
                        padding-right: 24px;
                        padding-top: 72px;
                        padding-bottom: 72px;
                        max-width: 100%;
                        order: 2;
                    }

                    #hero > .descriptionBox > .descriptionContainer {
                        width: 318px;
                    }

                    #hero > .descriptionBox > .descriptionContainer > h2 {
                        font-size: var(--font-size-7);
                        letter-spacing: var(--letter-spacing-3);
                        line-height: var(--line-height-4);
                        margin-bottom: 16px;
                    }

                    #hero > .descriptionBox > .descriptionContainer > p {
                        margin-bottom: 23px;
                    }

                    #hero > .descriptionBox > .descriptionContainer:hover::after {
                        display: none;
                    }

                    #hero > .descriptionBox > .descriptionContainer::after {
                        animation-name: load;
                        animation-duration: 0.7s;
                        animation-fill-mode: forwards;
                        animation-iteration-count: 1;
                        content: "";
                        background-image: var(--main-accent);
                        display: block;
                        height: 6px;
                        left: 0px;
                        bottom: 245px;
                        position: relative;
                        width: 128px;
                    }
    
                    @keyframes load {
                        0% {
                            transform: scaleX(0);
                        }
                        100% {
                            transform: scaleX(1);
                        }
                    }
                }
            </style>`;
      }
  }

  if (!customElements.get('generic-hero-section')) {
      customElements.define('generic-hero-section', GenericHeroSection);
  }

  class BetaCTABanner extends HTMLElement {
      constructor() {
          super();
          this.attachShadow({mode: 'open'});
      }

      connectedCallback() {
          this.render();
      }

      render() {
          this.html();
          this.css();
      }

      html() {
          this.shadowRoot.innerHTML += `
            <div id="container">
                <h2>WE'RE IN BETA. GET YOUR INVITE TODAY!</h2>
                <a id="cta" href="#000">
                    <p>GET AN INVITE</p>
                    <img class="arrowIcon" src="../src/assets/shared/desktop/white/arrow.svg">
                </a>
            </div>
        `;
      }

      css() {
          this.defaultCSS();
          this.tabletLayoutCSS();
          this.mobileLayoutCSS();
      }

      defaultCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                *, *::before, *::after { padding: 0; margin: 0; }

                :host {
                    background-image: url("../src/assets/shared/desktop/bg-beta.jpg");
                    background-repeat: no-repeat;
                    background-size: cover;
                    display: block;
                    max-width: 100%;
                    padding-bottom: 68px;
                    padding-left: 11.458%;
                    padding-right: 11.458%;
                    padding-top: 68px;
                    position: relative;
                }

                :host::before {
                    animation-name: load;
                    animation-duration: 0.7s;
                    animation-fill-mode: forwards;
                    animation-iteration-count: 1;
                    background-image: var(--main-accent);
                    content: "";
                    height: 100%;
                    top: 0;
                    left: 0;
                    right: 0px;
                    position: absolute;
                    width: 6px;
                }

                @keyframes load {
                    0% {
                        transform: scaleY(0);
                    }
                    100% {
                        transform: scaleY(1);
                    }
                }

                #container {
                    align-items: center;
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    position: relative;
                }

                #container > h2 {
                    color: var(--pure-white);
                    font-size: var(--font-size-5);
                    letter-spacing: var(--letter-spacing-2);
                    max-width: 400px;
                }

                #container > #cta {
                    align-items: center;
                    color: var(--pure-white);
                    cursor: pointer;
                    display: flex;
                    font-weight: bold;
                    justify-content: space-between;
                    margin-left: auto;
                    max-width: 168px;
                    max-height: 16px;
                    text-decoration: none;
                }

                #container > #cta > p {
                    font-size: var(--font-size-1);
                    font-weight: bold;
                    letter-spacing: var(--letter-spacing-1);
                    margin-right: 16px;
                    white-space: nowrap;
                }

                #container > #cta > p:hover {
                    border-bottom: 1px solid var(--pure-white);
                }
            </style>
        `;
      }

      tabletLayoutCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 768px) {
                    :host {
                        background-image: url("../src/assets/shared/tablet/bg-beta.jpg");
                        padding-left: 2.708%;
                        padding-right: 2.708%;
                    }
                }
            </style>
        `;
      }

      mobileLayoutCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 375px) {
                    :host {
                        background-image: url("../src/assets/shared/mobile/bg-beta.jpg");
                        padding-bottom: 64px;
                        padding-top: 64px;
                        padding-left: 9%;
                        padding-right: 7%;
                    }

                    #container {
                        align-items: flex-start;
                        flex-direction: column;
                    }

                    #container > h2 {
                        font-size: var(--font-size-7);
                        letter-spacing: var(--letter-spacing-3);
                        line-height: var(--line-height-4);
                        margin-bottom: 24px;
                    }

                    :host::before {
                        animation-name: load;
                        animation-duration: 0.7s;
                        animation-fill-mode: forwards;
                        animation-iteration-count: 1;
                        background-image: var(--main-accent);
                        content: "";
                        height: 6px;
                        top: 0;
                        left: 33px;
                        right: 0px;
                        position: absolute;
                        width: 34.133%;
                    }
    
                    @keyframes load {
                        0% {
                            transform: scaleX(0);
                        }
                        100% {
                            transform: scaleX(1);
                        }
                    }
                }
            </style>
        `;
      }
  }

  if (!customElements.get('beta-cta-banner')) {
      customElements.define('beta-cta-banner', BetaCTABanner);
  }

  class FeaturesSection extends HTMLElement {
      constructor() {
          super();
          this.attachShadow({mode: 'open'});
      }

      connectedCallback() {
          this.render();
      }

      render() {
          this.shadowRoot.innerHTML += `
            <generic-hero-section
                desktopImage="../src/assets/features/desktop/hero.jpg"
                tabletImage="../src/assets/features/tablet/hero.jpg"
                mobileImage="../src/assets/features/mobile/hero.jpg"
                title="FEATURES"
                paragraph="We make sure all of our features are designed to be loved by every aspiring and even professional photograpers who wanted to share their stories."
            ></generic-hero-section>
            <persuasive-service-details></persuasive-service-details>
            <beta-cta-banner></beta-cta-banner>
        `;
      }
  }

  if (!customElements.get('features-section')) {
      customElements.define('features-section', FeaturesSection);
  }

  class SiteFooter extends HTMLElement {
      constructor() {
          super();
          this.attachShadow({mode: 'open'});
      }

      connectedCallback() {
          this.render();
      }

      render() {
          this.html();
          this.css();
      }

      html() {
          this.shadowRoot.innerHTML += `
            <div id="siteFooterContainer">
                <svg id="logo" xmlns="http://www.w3.org/2000/svg" width="170" height="16" viewBox="0 0 170 16" fill="none">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M70.1027 15.3622C69.0721 15.7874 67.9658 16 66.7838 16C65.5874 16 64.4775 15.7874 63.4541 15.3622C62.4306 14.9369 61.5405 14.3568 60.7838 13.6216C60.027 12.8865 59.4324 12.036 59 11.0703C58.5676 10.1045 58.3514 9.08108 58.3514 8C58.3514 6.91892 58.5676 5.8955 59 4.92973C59.4324 3.96396 60.027 3.11351 60.7838 2.37838C61.5405 1.64324 62.4306 1.06306 63.4541 0.637838C64.4775 0.212613 65.5874 0 66.7838 0C67.9658 0 69.0721 0.212613 70.1027 0.637838C71.1333 1.06306 72.027 1.64324 72.7838 2.37838C73.5405 3.11351 74.1351 3.96396 74.5676 4.92973C75 5.8955 75.2162 6.91892 75.2162 8C75.2162 9.08108 75 10.1045 74.5676 11.0703C74.1351 12.036 73.5405 12.8865 72.7838 13.6216C72.027 14.3568 71.1333 14.9369 70.1027 15.3622ZM31.1081 11.027V15.5676H27V0.432432H33.8108C34.6468 0.432432 35.4108 0.565766 36.1027 0.832432C36.7946 1.0991 37.3856 1.47027 37.8757 1.94595C38.3658 2.42162 38.7477 2.98378 39.0216 3.63243C39.2955 4.28108 39.4324 4.98018 39.4324 5.72973C39.4324 6.49369 39.2955 7.1964 39.0216 7.83784C38.7477 8.47928 38.3658 9.03784 37.8757 9.51351C37.3856 9.98919 36.7946 10.3604 36.1027 10.627C35.4108 10.8937 34.6468 11.027 33.8108 11.027H31.1081ZM31.1081 7.35135H33.5946C34.0847 7.35135 34.4955 7.18919 34.827 6.86486C35.1586 6.54054 35.3243 6.16216 35.3243 5.72973C35.3243 5.2973 35.1586 4.91892 34.827 4.59459C34.4955 4.27027 34.0847 4.10811 33.5946 4.10811H31.1081V7.35135ZM46.1351 15.5676V9.72973H51.6486V15.5676H55.7568V0.432432H51.6486V6.05405H46.1351V0.432432H42.027V15.5676H46.1351ZM66.7838 12.3243C66.1928 12.3243 65.6378 12.2162 65.1189 12C64.6 11.7838 64.1532 11.4811 63.7784 11.0919C63.4036 10.7027 63.1081 10.245 62.8919 9.71892C62.6757 9.19279 62.5676 8.61982 62.5676 8C62.5676 7.38018 62.6757 6.80721 62.8919 6.28108C63.1081 5.75495 63.4036 5.2973 63.7784 4.90811C64.1532 4.51892 64.6 4.21622 65.1189 4C65.6378 3.78378 66.1928 3.67568 66.7838 3.67568C67.3748 3.67568 67.9261 3.78378 68.4378 4C68.9495 4.21622 69.3964 4.51892 69.7784 4.90811C70.1604 5.2973 70.4595 5.75495 70.6757 6.28108C70.8919 6.80721 71 7.38018 71 8C71 8.61982 70.8919 9.19279 70.6757 9.71892C70.4595 10.245 70.1604 10.7027 69.7784 11.0919C69.3964 11.4811 68.9495 11.7838 68.4378 12C67.9261 12.2162 67.3748 12.3243 66.7838 12.3243ZM84.8378 4.10811V15.5676H80.7297V4.10811H76.5135V0.432432H89.0541V4.10811H84.8378ZM98.7838 16C99.9658 16 101.072 15.7874 102.103 15.3622C103.133 14.9369 104.027 14.3568 104.784 13.6216C105.541 12.8865 106.135 12.036 106.568 11.0703C107 10.1045 107.216 9.08108 107.216 8C107.216 6.91892 107 5.8955 106.568 4.92973C106.135 3.96396 105.541 3.11351 104.784 2.37838C104.027 1.64324 103.133 1.06306 102.103 0.637838C101.072 0.212613 99.9658 0 98.7838 0C97.5874 0 96.4775 0.212613 95.4541 0.637838C94.4306 1.06306 93.5405 1.64324 92.7838 2.37838C92.027 3.11351 91.4324 3.96396 91 4.92973C90.5676 5.8955 90.3514 6.91892 90.3514 8C90.3514 9.08108 90.5676 10.1045 91 11.0703C91.4324 12.036 92.027 12.8865 92.7838 13.6216C93.5405 14.3568 94.4306 14.9369 95.4541 15.3622C96.4775 15.7874 97.5874 16 98.7838 16ZM97.1189 12C97.6378 12.2162 98.1928 12.3243 98.7838 12.3243C99.3748 12.3243 99.9261 12.2162 100.438 12C100.95 11.7838 101.396 11.4811 101.778 11.0919C102.16 10.7027 102.459 10.245 102.676 9.71892C102.892 9.19279 103 8.61982 103 8C103 7.38018 102.892 6.80721 102.676 6.28108C102.459 5.75495 102.16 5.2973 101.778 4.90811C101.396 4.51892 100.95 4.21622 100.438 4C99.9261 3.78378 99.3748 3.67568 98.7838 3.67568C98.1928 3.67568 97.6378 3.78378 97.1189 4C96.6 4.21622 96.1532 4.51892 95.7784 4.90811C95.4036 5.2973 95.1081 5.75495 94.8919 6.28108C94.6757 6.80721 94.5676 7.38018 94.5676 8C94.5676 8.61982 94.6757 9.19279 94.8919 9.71892C95.1081 10.245 95.4036 10.7027 95.7784 11.0919C96.1532 11.4811 96.6 11.7838 97.1189 12ZM114.568 16C115.519 16 116.369 15.8667 117.119 15.6C117.868 15.3333 118.503 14.973 119.022 14.5189C119.541 14.0649 119.937 13.5387 120.211 12.9405C120.485 12.3423 120.622 11.7045 120.622 11.027C120.622 10.1477 120.449 9.42703 120.103 8.86487C119.757 8.3027 119.324 7.84865 118.805 7.5027C118.286 7.15676 117.721 6.88288 117.108 6.68108C116.495 6.47928 115.93 6.29189 115.411 6.11892C114.892 5.94595 114.459 5.76216 114.114 5.56757C113.768 5.37297 113.595 5.1027 113.595 4.75676C113.595 4.42523 113.742 4.12613 114.038 3.85946C114.333 3.59279 114.726 3.45946 115.216 3.45946C115.591 3.45946 115.93 3.52072 116.232 3.64324C116.535 3.76577 116.795 3.90631 117.011 4.06486C117.27 4.23784 117.501 4.43243 117.703 4.64865L120.081 2.16216C119.735 1.75856 119.31 1.3982 118.805 1.08108C118.373 0.807207 117.825 0.558559 117.162 0.335135C116.499 0.111712 115.706 0 114.784 0C113.919 0 113.133 0.12973 112.427 0.389189C111.721 0.648649 111.119 0.994595 110.622 1.42703C110.124 1.85946 109.739 2.35676 109.465 2.91892C109.191 3.48108 109.054 4.05766 109.054 4.64865C109.054 5.52793 109.227 6.24865 109.573 6.81081C109.919 7.37297 110.351 7.82703 110.87 8.17297C111.389 8.51892 111.955 8.79279 112.568 8.99459C113.18 9.1964 113.746 9.38378 114.265 9.55676C114.784 9.72973 115.216 9.91351 115.562 10.1081C115.908 10.3027 116.081 10.573 116.081 10.9189C116.081 11.3514 115.908 11.7297 115.562 12.0541C115.216 12.3784 114.741 12.5405 114.135 12.5405C113.645 12.5405 113.202 12.4577 112.805 12.2919C112.409 12.1261 112.067 11.9423 111.778 11.7405C111.447 11.4955 111.151 11.2216 110.892 10.9189L108.514 13.4054C108.946 13.8955 109.458 14.3279 110.049 14.7027C110.553 15.0342 111.18 15.3333 111.93 15.6C112.679 15.8667 113.559 16 114.568 16ZM127.108 7.13514V15.5676H123V0.432432H126.568L133.054 8.86486V0.432432H137.162V15.5676H133.616L127.108 7.13514ZM143.324 15.5676L144.405 12.3243H149.378L150.459 15.5676H154.892L149.162 0.432432H144.622L138.892 15.5676H143.324ZM146.892 4.64865L145.486 9.08108H148.297L146.892 4.64865ZM160.73 15.5676V11.027H163.432C164.268 11.027 165.032 10.8937 165.724 10.627C166.416 10.3604 167.007 9.98919 167.497 9.51351C167.987 9.03784 168.369 8.47928 168.643 7.83784C168.917 7.1964 169.054 6.49369 169.054 5.72973C169.054 4.98018 168.917 4.28108 168.643 3.63243C168.369 2.98378 167.987 2.42162 167.497 1.94595C167.007 1.47027 166.416 1.0991 165.724 0.832432C165.032 0.565766 164.268 0.432432 163.432 0.432432H156.622V15.5676H160.73ZM160.73 7.35135H163.216C163.706 7.35135 164.117 7.18919 164.449 6.86486C164.78 6.54054 164.946 6.16216 164.946 5.72973C164.946 5.2973 164.78 4.91892 164.449 4.59459C164.117 4.27027 163.706 4.10811 163.216 4.10811H160.73V7.35135Z" fill="white"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0 16L9.5 0L19 16H0Z" fill="url(#paint0_linear)"/>
                    <defs>
                    <linearGradient id="paint0_linear" x1="9.5" y1="20" x2="16.6529" y2="3.01176" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#FFC593"/>
                    <stop offset="0.519452" stop-color="#BC7198"/>
                    <stop offset="1" stop-color="#5A77FF"/>
                    </linearGradient>
                    </defs>
                </svg>
                <ul id="pageLinks">
                    <li><a href="/">HOME</a></li>
                    <li><a href="/stories">STORIES</a></li>
                    <li><a href="/features">FEATURES</a></li>
                    <li><a href="/pricing">PRICING</a></li>
                </ul>
                <a id="cta" href="#000">
                    <p>GET AN INVITE</p>
                    <svg xmlns="http://www.w3.org/2000/svg" width="42" height="14" viewBox="0 0 42 14" fill="none">
                    <path d="M0 7H41.864" stroke="white"/>
                    <path d="M35.4282 1L41.4282 7L35.4282 13" stroke="white"/>
                    </svg>                    
                </a>
                <ul id="socialLinks">
                    <li>
                        <img class="white" src="../src/assets/shared/desktop/white/facebook.svg" alt="facebook icon">
                        <img class="color" src="../src/assets/shared/desktop/facebook.svg" alt="facebook icon">
                    </li>
                    <li>
                        <img class="white" src="../src/assets/shared/desktop/white/youtube.svg" alt="youtube icon">
                        <img class="color" src="../src/assets/shared/desktop/youtube.svg" alt="youtube icon">
                    </li>
                    <li>
                        <img class="white" src="../src/assets/shared/desktop/white/twitter.svg" alt="twitter icon">
                        <img class="color" src="../src/assets/shared/desktop/twitter.svg" alt="twitter icon">
                    </li>
                    <li>
                        <img class="white" src="../src/assets/shared/desktop/white/pinterest.svg" alt="pinterest icon">
                        <img class="color" src="../src/assets/shared/desktop/pinterest.svg" alt="pinterest icon">
                    </li>
                    <li>
                        <img class="white" src="../src/assets/shared/desktop/white/instagram.svg" alt="instagram icon">
                        <img class="color" src="../src/assets/shared/desktop/instagram.svg" alt="instagram icon">
                    </li>
                </ul>
                <small>Copyright 2019. All Rights Reserved</small>
            </div>
            
        `;
      }

      css() {
          this.defaultCSS();
          this.tabletLayoutCSS();
          this.mobileLayoutCSS();
      }

      defaultCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                *, *::before, *::after { padding: 0; margin: 0; }

                a {
                    color: var(--pure-white);
                    text-decoration: none;
                }

                :host {
                    background-color: var(--pure-black);
                    display: block;
                    padding-top: 66px;
                    padding-bottom: 62px;
                    padding-left: 11.74%;
                    padding-right: 11.60%;
                }

                :host > #siteFooterContainer {
                    display: grid;
                    grid-template-columns: 279px 1fr minmax(51px, 255px);
                    grid-template-rows: repeat(2, 61px);
                }

                :host > #siteFooterContainer > #logo {
                    height: 16px;
                    margin-right: 109px;
                }

                :host > #siteFooterContainer > #pageLinks {
                    display: flex;
                    flex-direction: column;
                    grid-column: 2;
                    grid-row: span 2;
                    list-style: none;
                }

                :host > #siteFooterContainer > #pageLinks > li {
                    color: var(--pure-white);
                    cursor: pointer;
                    font-size: var(--font-size-1);
                    font-weight: bold;
                    letter-spacing: var(--letter-spacing-1);
                    light-height: var(--line-height-1);
                }

                :host > #siteFooterContainer > #pageLinks > li:hover {
                    opacity: 0.3;
                }

                :host > #siteFooterContainer > ul > li:not(:last-child) {
                    margin-bottom: 19px;
                }

                :host > #siteFooterContainer > #cta {
                    align-items: center;
                    color: var(--pure-white);
                    cursor: pointer;
                    display: flex;
                    grid-column: 3;
                    margin-left: auto;
                    max-width: 168px;
                    max-height: 16px;
                    text-decoration: none;
                }

                :host > #siteFooterContainer > #cta > p {
                    font-size: var(--font-size-1);
                    letter-spacing: var(--letter-spacing-1);
                    margin-right: 16px;
                    white-space: nowrap;
                }

                :host > #siteFooterContainer > #cta > p:hover {
                    border-bottom: 1px solid var(--light-grey);
                }

                :host > #siteFooterContainer > #socialLinks {
                    display: flex;
                    flex-direction: row;
                    grid-column: 1;
                    grid-row: 2;
                    height: 20px;
                    list-style: none;
                    margin-top: auto;
                    width: 153.32px;
                }

                .color {
                    display: none;
                }

                :host > #siteFooterContainer > #socialLinks > li:not(:last-child) {
                    margin-right: 13.33px;
                }

                :host > #siteFooterContainer > #socialLinks > li:hover > .white {
                    display: none;
                }

                :host > #siteFooterContainer > #socialLinks > li:hover > .color {
                    display: block;
                }

                :host > #siteFooterContainer > #socialLinks > li > img {
                    cursor: pointer;
                    height: 20px;
                    width: 20px;
                }

                small {
                    color: var(--pure-white);
                    font-size: var(--font-size-2);
                    grid-column: 3;
                    grid-row: 2;
                    margin-top: auto;
                    margin-left: auto;
                    opacity: 0.5;
                    position: relative
                }

                small:after {
                    content: "Developed by Jerry Dormetus";
                    position: absolute;
                    bottom: 40px;
                    left: 0;
                    right: 0;
                    color: gold;
                }
            </style>
        `;
      }

      tabletLayoutCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 768px) {
                    :host {
                        padding-top: 64px;
                        padding-bottom: 64px;
                        padding-left: 5.078%;
                        padding-right: 5.208%;
                    }

                    :host > #siteFooterContainer {
                        grid-template-columns: minmax(139.5px, 279px) 1fr;
                        grid-template-rows: repeat(3, 1fr);
                    }

                    :host > #siteFooterContainer > #logo {
                        margin-bottom: 32px;
                    }

                    :host > #siteFooterContainer > #cta {
                        grid-column: 2;
                    }

                    :host > #siteFooterContainer > #pageLinks {
                        flex-direction: row;
                        grid-column: span 2;
                        grid-row: 2;
                        margin-bottom: 72px;
                    }

                    :host > #siteFooterContainer > #pageLinks > li:not(:last-child) {
                        margin-right: 26px;
                    }

                    small {
                        grid-column: 2;
                        grid-row: 3;
                    }

                    :host > #siteFooterContainer > #socialLinks {
                        grid-column: 1;
                        grid-row: 3;
                    }
                }
            </style>`;
      }

      mobileLayoutCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 375px) {
                    :host {
                        padding-top: 56px;
                        padding-bottom: 56px;
                        padding-right: 9.2%;
                        padding-left: 9.2%;
                    }
                    
                    :host > #siteFooterContainer {
                        align-items: center;
                        display: flex;
                        flex-direction: column;
                    }

                    :host > #siteFooterContainer > #logo {
                        margin-bottom: 32px;
                        order: 0;
                        margin-left: auto;
                        margin-right: auto;
                    }

                    :host > #siteFooterContainer > #socialLinks {
                        margin-bottom: 50.87px;
                        order: 1;
                    }

                    :host > #siteFooterContainer > #pageLinks {
                        align-items: center;
                        flex-direction: column;
                        margin-bottom: 119px;
                        order: 3;
                    }

                    :host > #siteFooterContainer > #pageLinks > li:not(:last-child) {
                        margin-right: 0;
                    }

                    :host > #siteFooterContainer > #cta {
                        order: 4;
                        margin-bottom: 34px;
                        margin-left: auto;
                        margin-right: auto;
                    }

                    small {
                        order: 5;
                        margin-left: auto;
                        margin-right: auto;
                    }
                }
            </style>`;
      }
  }

  if (!customElements.get('site-footer')) {
      customElements.define('site-footer', SiteFooter);
  }

  class ComparePricingPlanTable extends HTMLElement {
      constructor() {
          super();
          this.attachShadow({mode: 'open'});
      }

      connectedCallback() {
          this.render();
      }

      render() {
          this.html();
          this.css();
      }

      html() {
          this.shadowRoot.innerHTML += `
            <div id="container">
                <h2>COMPARE</h2>
                <table id="largeTable">
                    <thead>
                        <tr>
                            <th id="head-1">THE FEATURES</th>
                            <th id="head-2">BASIC</th>
                            <th id="head-3">PRO</th>
                            <th id="head-4">BUSINESS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="theFeaturesColumn">UNLIMITED STORY POSTING</td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                        </tr>
                        <tr>
                            <td class="theFeaturesColumn">UNLIMITED PHOTO UPLOAD</td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                        </tr>
                        <tr>
                            <td class="theFeaturesColumn">EMBEDDING CUSTOM CONTENT</td>
                            <td class="check"></td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                        </tr>
                        <tr>
                            <td class="theFeaturesColumn">CUSTOMIZE METADATA</td>
                            <td class="check"></td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                        </tr>
                        <tr>
                            <td class="theFeaturesColumn">ADVANCED METRICS</td>
                            <td class="check"></td>
                            <td class="check"></td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                        </tr>
                        <tr>
                            <td class="theFeaturesColumn">PHOTO DOWLOADS</td>
                            <td class="check"></td>
                            <td class="check"></td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                        </tr>
                        <tr>
                            <td class="theFeaturesColumn">SEARCH ENGINE INDEXING</td>
                            <td class="check"></td>
                            <td class="check"></td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                        </tr>
                        <tr>
                            <td class="theFeaturesColumn">CUSTOM ANALYTICS</td>
                            <td class="check"></td>
                            <td class="check"></td>
                            <td class="check"><img src="../src/assets/pricing/desktop/check.svg"></td>
                        </tr>
                    </tbody>
                </table>

                <table id="mobileTable">
                    <thead>
                        <tr>
                            <th>THE FEATURES</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="rowHeader"><th>UNLIMITED STORY POSTING</th></tr>
                        <tr class="rowInfo">
                            <td>
                                <span class="category">BASIC</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                            <td>
                                <span class="category">PRO</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                            <td>
                                <span class="category">BUSINESS</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                        </tr>

                        <tr class="rowHeader"><th>UNLIMITED PHOTO UPLOAD</th></tr>
                        <tr class="rowInfo">
                            <td>
                                <span class="category">BASIC</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                            <td>
                                <span class="category">PRO</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                            <td>
                                <span class="category">BUSINESS</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                        </tr>

                        <tr class="rowHeader"><th>EMBEDDING CUSTOM CONTENT</th></tr>
                        <tr class="rowInfo">
                            <td>
                                <span class="category">BASIC</span>
                            </td>
                            <td>
                                <span class="category">PRO</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                            <td>
                                <span class="category">BUSINESS</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                        </tr>

                        <tr class="rowHeader"><th>CUSTOMIZE METADATA</th></tr>
                        <tr class="rowInfo">
                            <td>
                                <span class="category">BASIC</span>
                            </td>
                            <td>
                                <span class="category">PRO</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                            <td>
                                <span class="category">BUSINESS</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                        </tr>

                        <tr class="rowHeader"><th>ADVANCED METRICS</th></tr>
                        <tr class="rowInfo">
                            <td>
                                <span class="category">BASIC</span>
                            </td>
                            <td>
                                <span class="category">PRO</span>
                            </td>
                            <td>
                                <span class="category">BUSINESS</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                        </tr>

                        <tr class="rowHeader"><th>PHOTO DOWNLOADS</th></tr>
                        <tr class="rowInfo">
                            <td>
                                <span class="category">BASIC</span>
                            </td>
                            <td>
                                <span class="category">PRO</span>
                            </td>
                            <td>
                                <span class="category">BUSINESS</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                        </tr>

                        <tr class="rowHeader"><th>SEARCH ENGINE INDEXING</th></tr>
                        <tr class="rowInfo">
                            <td>
                                <span class="category">BASIC</span>
                            </td>
                            <td>
                                <span class="category">PRO</span>
                            </td>
                            <td>
                                <span class="category">BUSINESS</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                        </tr>

                        <tr class="rowHeader"><th>CUSTOM ANALYTICS</th></tr>
                        <tr class="rowInfo">
                            <td>
                                <span class="category">BASIC</span>
                            </td>
                            <td>
                                <span class="category">PRO</span>
                            </td>
                            <td>
                                <span class="category">BUSINESS</span>
                                <img src="../src/assets/pricing/desktop/check.svg">
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
      }

      css() {
          this.defaultCSS();
          this.tabletLayoutCSS();
          this.mobileLayoutCSS();
      }

      defaultCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                *, *::before, *::after { margin: 0; padding: 0; }

                #mobileTable {
                    display: none;
                }

                :host {
                    display: block;
                    padding-bottom: 160px;
                    padding-left: 24.652%;
                    padding-right: 24.652%;
                    padding-top: 160px;
                }

                #container {
                    display: grid;
                    justify-content: center;
                    width: 100%;
                }

                #container > h2 {
                    font-size: var(--font-size-5);
                    margin-bottom: 56px;
                    margin-left: auto;
                    margin-right: auto;
                }

                #container > table {
                    font-size: var(--font-size-1);
                    font-weight: bold;
                    letter-spacing: var(--letter-spacing-1);
                    width: 100%;
                }

                table, td {
                    border-collapse: collapse;
                    border-bottom: 1px solid var(--light-grey);
                }

                #container > table > thead > tr {
                    border-bottom: 1px solid var(--pure-black);
                }

                #largeTable > thead > tr,
                #largeTable > tbody > tr {
                    height: 62.5px;
                }

                #largeTable > thead > tr > #head-1 {
                    padding-left: 24px;
                    text-align: left;
                    width: 287px;
                }

                #largeTable > thead > tr > #head-2,
                #largeTable > thead > tr > #head-3,
                #largeTable > thead > tr > #head-4 {
                    width: 140px;
                    text-align: center;
                }

                #largeTable > tbody > tr > .check {
                    align-items: center;
                    text-align: center;
                }

                #largeTable > tbody > tr > .theFeaturesColumn {
                    padding-left: 24px;
                }




                #mobileTable > thead > tr > th {
                    text-align: left;
                    padding-bottom: 23px;
                }

                #mobileTable > tbody > tr {
                    align-items: center;
                }

                #mobileTable > tbody > .rowHeader {
                    height: 16px;
                    padding-bottom: 16px;
                    padding-top: 23px;
                }

                #mobileTable > tbody > .rowInfo {
                    align-items: baseline;
                    border-bottom: 1px solid var(--light-grey);
                    height: 33px;
                    padding-bottom: 24px;
                    padding-right: 46px;
                }

                #mobileTable > tbody > tr > td {
                    border: none;
                    display: flex;
                    flex-direction: column;
                }

                #mobileTable > tbody > tr > td:nth-child(1) {
                    margin-right: 68px;
                }

                #mobileTable > tbody > tr > td:nth-child(2) {
                    margin-right: 80px;
                }

                #mobileTable > tbody > tr {
                    display: flex;
                    max-width: 272px;
                    height: 33px;
                    justify-content: flex-start;
                }

                #mobileTable > tbody > tr > td > span {
                    align-items: start
                    color: var(--opaque-pure-black-3);
                    font-size: var(--font-size-8);
                    letter-spacing: var(--letter-spacing-4);
                }

                #mobileTable > tbody > tr > td > img {
                    height: 12px;
                    margin-top: 8px;
                    width: 16px;
                }
            </style>
        `;
      }

      tabletLayoutCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 768px) {
                    :host {
                        padding-bottom: 112px;
                        padding-left: 5.3%;
                        padding-right: 5.3%;
                        padding-top: 112px;
                    }

                    #largeTable > thead > tr,
                    #largeTable > tbody > tr {
                        height: 63px;
                    }
                }
            </style>`;
      }

      mobileLayoutCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 375px) {
                    #container > h2,
                    #largeTable {
                        display: none;
                    }

                    #mobileTable {
                        display: block;
                    }

                    :host {
                        display: block;
                        padding-bottom: 64px;
                        padding-left: 29px;
                        padding-right: 29px;
                        padding-top: 64px;
                    }
                }
            </style>`;
      }
  }

  if (!customElements.get('compare-pricing-plan-table')) {
      customElements.define('compare-pricing-plan-table', ComparePricingPlanTable);
  }

  class PricingToggle extends HTMLElement {
      static get observedAttributes() {
          return ['checked'];
      }

      constructor() {
          super();
          this.attachShadow({mode: 'open'});
      }

      attributeChangedCallback(attrName, oldValue, newValue) {
          if (oldValue !== newValue) {
              this[attrName] = this.getAttribute(attrName);
          }
      }

      connectedCallback() {
          this.render();
      }

      render() {
          this.html();
          this.css();
          this.scripts();
      }

      html() {
          this.shadowRoot.innerHTML += `
        <div id="toggleContainer">
            <input type="checkbox" id="intervalToggle">
            <label for="intervalToggle">
                <span id="monthly">Monthly</span>
                <span id="opening"></span>
                <span id="annual">Annual</span>
            </label>
        </div>
        `;
      }

      css() {
          this.defaultCSS();
      }

      defaultCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                *, *::before, *::after { margin: 0; padding: 0; }

                :host {
                    max-width: 100%;
                }

                label {
                    align-items: center;
                    display: flex;
                    flex-direction: row;
                }

                #toggleContainer > input[type="checkbox"] {
                    display: none;
                }

                #toggleContainer {
                    margin-left: auto;
                    margin-right: auto;
                    max-width: 255px;
                }

                #toggleContainer > label #monthly {
                    font-size: 18px;
                    font-weight: bold;
                    line-height: 25px;
                    margin-right: 32px;
                }

                #toggleContainer > label #annual {
                    font-size: 18px;
                    font-weight: bold;
                    line-height: 25px;
                    margin-left: 32px;
                }

                #toggleContainer > label #opening {
                    background-color: var(--light-grey);
                    border-radius: 16px;
                    display: block;
                    position: relative;
                    height: 32px;
                    width: 64px;
                }       

                #toggleContainer > label #opening::before,
                #toggleContainer > label #opening::after {
                    content: "";
                    position: absolute;
                }
                
                #toggleContainer > label #opening::before {
                    cursor: pointer;
                    top: 4px;
                    left: 4px;
                    width: 24px;
                    height: 24px;
                    background-color: var(--pure-black);
                    border-radius: 50%;
                    z-index: 1;
                    transition: transform 0.3s;
                }

                #toggleContainer > input[type="checkbox"]:checked + label #opening::before {
                    transform: translateX(27px);
                    background-color: var(--light-grey);
                }

                #toggleContainer > input[type="checkbox"]:checked + label #opening {
                    background-color: var(--pure-black);
                }

                :host([checked="true"]) > #toggleContainer > label #annual {
                    color: var(--pure-black);
                }

                :host([checked="true"]) > #toggleContainer > label #monthly {
                    color: var(--opaque-pure-black-3);
                }

                :host([checked="false"]) > #toggleContainer > label #monthly {
                    color: var(--pure-black);
                }

                :host([checked="false"]) > #toggleContainer > label #annual {
                    color: var(--opaque-pure-black-3);
                }
            </style>
        `;
      }

      scripts() {
          this.toggleFlip();
      }

      toggleFlip() {
          const theInput = this.shadowRoot.querySelector('#toggleContainer > input');

          theInput.addEventListener('click', () => {
              if (theInput.checked) {
                  this.setAttribute('checked', true);
              } else {
                  this.setAttribute('checked', false);
              }
          });
      }
  }

  if (!customElements.get('pricing-toggle')) {
      customElements.define('pricing-toggle', PricingToggle);
  }

  class PricingCards extends HTMLElement {
      constructor() {
          super();
          this.attachShadow({mode: 'open'});
          this.basicMonthlyPlanPrice = 19.00;
          this.proMonthlyPlanPrice = 39.00;
          this.businessMonthlyPlanPrice = 99.00;
          this.isAnnual = false;
      }

      connectedCallback() {
          this.render();
      }
      
      render() {
          this.html();
          this.css();
          this.scripts();
      }

      html() {
          this.shadowRoot.innerHTML += `
            <pricing-toggle checked="false"></pricing-toggle>
            <div id="cardContainer">
                <div id="basicCard" class="card">
                    <h2>Basic</h2>
                    <p>
                        Includes basic usage of our platform. Recommended for new and aspiring photographers.
                    </p>
                    <div class="planPrice">${this.planDetails('basic').price}</div>
                    <span class="interval">per ${this.planDetails('basic').interval}</span>
                    <button type="button">PRICE PLAN</button>
                </div>

                <div id="proCard" class="card">
                    <h2>Pro</h2>
                    <p>
                        More advanced features available. Recommended for photography veterans and professionals.
                    </p>
                    <div class="planPrice">${this.planDetails('pro').price}</div>
                    <span class="interval">per ${this.planDetails('pro').interval}</span>
                    <button type="button">PRICE PLAN</button>
                </div>

                <div id="businessCard" class="card">
                    <h2>Business</h2>
                    <p>
                        Additional features available such as more detailed metrics. Recommended for business owners.
                    </p>
                    <div class="planPrice">${this.planDetails('business').price}</div>
                    <span class="interval">per ${this.planDetails('business').interval}</span>
                    <button type="button">PRICE PLAN</button>
                </div>
            </div>
        `;
      }

      css() {
          this.defaultCSS();
          this.tabletLayoutCSS();
          this.mobileLayoutCSS();
      }

      defaultCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                *, *::before, *::after { padding: 0; margin: 0; }

                :host {
                    display: flex;
                    flex-direction: column;
                    margin-top: 120px;
                    max-width: 100%;
                    padding-left: 11.458%;
                    padding-right: 11.458%;
                }

                pricing-toggle {
                    margin-bottom: 48px;
                }

                #cardContainer {
                    display: flex;
                    flex-direction: row;
                    max-width: 100%;
                }

                .card {
                    align-items: center;
                    background-color: var(--light-grey-2);
                    display: flex;
                    flex-direction: column;
                    padding-left: 3.604%;
                    padding-right: 3.604%;
                    max-width: 350px;
                    min-width: 70px;
                }

                .card > h2 {
                    font-size: var(--font-size-4);
                    line-height: var(--line-height-2);
                    margin-bottom: 18px;
                }

                .card > p {
                    font-size: var(--font-size-2);
                    line-height: var(--line-height-2);  
                    margin-bottom: 40px;
                    max-width: 100%;
                    text-align: center;                    
                }

                .card > .planPrice {
                    font-size: var(--font-size-5);
                    font-weight: bold;
                }

                .card > .interval {
                    margin-bottom: 40px;
                    line-height: var(--line-height-2);
                }

                .card > button {
                    background-color: var(--pure-black);
                    border: none;
                    color: var(--pure-white);
                    font-size: var(--font-size-1);
                    font-weight: bold;
                    height: 40px;
                    letter-spacing: var(--letter-spacing-1);
                    width: 100%;
                }

                #basicCard,
                #businessCard {
                    padding-bottom: 40px;
                    padding-top: 56px;
                    margin-bottom: 31.5px;
                    margin-top: 31.5px;
                }

                #proCard > button:active,
                #basicCard > button:active,
                #businessCard > button:active {
                    color: var(--pure-black);
                    background-color: var(--light-grey);
                    outline: none;
                }

                #proCard {
                    background-color: var(--pure-black);
                    margin-right: 2.083%;
                    margin-left: 2.083%;
                    padding-bottom: 71px;
                    padding-top: 88px;
                    position: relative;
                }

                #proCard::before {
                    content: "";
                    background-image: var(--main-accent);
                    height: 6px;
                    position: absolute;
                    top: 0px;
                    width: 100%;
                }

                #proCard > h2 {
                    align-items: center;
                    color: var(--pure-white);
                }

                #proCard > p,
                #proCard > .interval {
                    color: var(--opaque-pure-white-2);
                }

                #proCard > .planPrice {
                    color: var(--pure-white);
                }

                #proCard > button {
                    color: var(--pure-black);
                    background-color: var(--pure-white);
                }
            </style>
        `;
      }

      tabletLayoutCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 768px) {
                    :host {
                        margin-top: 112px;
                        padding-left: 5.65%;
                        padding-right: 5.65%;
                    }

                    pricing-toggle {
                        margin-bottom: 40px;
                    }
    
                    #cardContainer {
                        display: flex;
                        flex-direction: column;
                    }

                    .card {
                        max-width: 689px;
                        min-width: 137.8px;
                    }
    
                    #basicCard,
                    #proCard,
                    #businessCard {
                        padding: 0;
                        margin: 0;
                        display: grid;
                        grid-template-column: minmax(54px, 270px) minmax(55.6px, 278px);
                        grid-template-rows: repeat(3, auto);
                        grid-column-gap: 6.901%;
                        padding-bottom: 40px;
                        padding-top: 42px;
                        padding-left: 6%;
                        padding-right: 7%;
                    }

                    #basicCard > p,
                    #proCard > p,
                    #businessCard > p {
                        text-align: left;
                        margin-bottom: 32px;
                    }

                    .card > .planPrice {
                        font-size: clamp(var(--font-size-5)/2, 6vw, var(--font-size-5));
                        grid-column: 2;
                        grid-row: 1;
                        text-align: right;
                        margin-bottom: 0;
                    }

                    .card > .interval {
                        text-align: right;
                        margin-bottom: auto;
                    }

                    .card > button {
                        max-width: 270px;
                    }

                    #proCard {
                        margin-top: 24px;
                        margin-bottom: 24px;
                        position: relative;
                    }

                    #proCard::before {
                        content: none;
                    }
                    
                    #proCard::after {
                        content: "";
                        background-image: var(--main-accent);
                        height: 100%;
                        position: absolute;
                        top: 0px;
                        width: 6px;
                    }
                }
            </style>`;
      }

      mobileLayoutCSS() {
          this.shadowRoot.innerHTML += `
            <style>
                @media screen and (max-width: 375px) {
                    :host {
                        margin-top: 64px;
                        padding-left: 7.733%;
                        padding-right: 7.733%;
                    }

                    #basicCard,
                    #proCard,
                    #businessCard {
                        align-items: center;
                        display: flex;
                        flex-direction: column;
                        padding-left: 6.604%;
                        padding-right: 6.918%;
                        padding-top: 56px;
                    }

                    #proCard::after {
                        content: none;
                    }

                    #proCard::before {
                        content: "";
                    }

                    #basicCard > p,
                    #proCard > p,
                    #businessCard > p {
                        text-align: center;
                        margin-bottom: 40px;
                    }

                    .card > .planPrice {
                        font-size: var(--font-size-5);
                    }

                    .card > .interval {
                        margin-bottom: 40px;
                    }
                }
            </style>`;
      }

      scripts() {
          this.pricePlanToggleEvent();
      }

      planDetails(plan) {
          let details = { price: null, interval: null };
          const checked = this.isAnnual;

          switch(checked) {
              case false:
              case 'false':
                  details.price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(eval(`this.${plan}MonthlyPlanPrice`));
                  details.interval = `month`;
                  break;
              case true:
              case 'true':
                  details.price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(eval(`this.${plan}MonthlyPlanPrice`)*10);
                  details.interval = `year`;
                  break;
          }

          return details;
      }

      pricePlanToggleEvent() {
          const toggle = this.shadowRoot.querySelector('pricing-toggle');
          toggle.addEventListener('click', () => {
              this.isAnnual = toggle.getAttribute('checked');
              this.shadowRoot.querySelector('#cardContainer > #basicCard > .planPrice').innerHTML = this.planDetails('basic').price;
              this.shadowRoot.querySelector('#cardContainer > #basicCard > .interval').innerHTML = `per ${this.planDetails('basic').interval}`;

              this.shadowRoot.querySelector('#cardContainer > #proCard > .planPrice').innerHTML = this.planDetails('pro').price;
              this.shadowRoot.querySelector('#cardContainer > #proCard > .interval').innerHTML = `per ${this.planDetails('pro').interval}`;

              this.shadowRoot.querySelector('#cardContainer > #businessCard > .planPrice').innerHTML = this.planDetails('business').price;
              this.shadowRoot.querySelector('#cardContainer > #businessCard > .interval').innerHTML = `per ${this.planDetails('business').interval}`;
          });
      }
  }

  if (!customElements.get('pricing-cards')) {
      customElements.define('pricing-cards', PricingCards);
  }

  class PricingDetails extends HTMLElement {
      constructor() {
          super();
          this.attachShadow({mode: 'open'});
      }

      connectedCallback() {
          this.render();
      }

      render() {
          this.shadowRoot.innerHTML += `
            <generic-hero-section
                desktopImage="../src/assets/pricing/desktop/hero.jpg"
                tabletImage="../src/assets/pricing/tablet/hero.jpg"
                mobileImage="../src/assets/pricing/mobile/hero.jpg"
                title="PRICING"
                paragraph="Create a your stories, Photosnap is a platform for photographers and visual storytellers. It’s the simple way to create and share your photos."
            ></generic-hero-section>
            <pricing-cards></pricing-cards>
            <compare-pricing-plan-table></compare-pricing-plan-table>
            <beta-cta-banner></beta-cta-banner>
        `;
      }
  }

  if (!customElements.get('pricing-details')) {
      customElements.define('pricing-details', PricingDetails);
  }

  class PhotosnapApp extends HTMLElement {
      constructor() {
          super();
          this.attachShadow({mode: 'open'});
      }

      connectedCallback() {
          this.render();
          this.routerInitialize();
      }

      render() {
          this.shadowRoot.innerHTML += `
            <site-header></site-header>
            <div id="outlet"></div>
            <site-footer></site-footer>
        `;
      }

      routerInitialize() {
          const outlet = this.shadowRoot.querySelector('#outlet');
          const router = new Router(outlet);

          router.setRoutes([
              { path: '/', component: 'home-section' },
              { path: '/stories', component: 'stories-section' },
              { path: '/features', component: 'features-section' },
              { path: '/pricing', component: 'pricing-details' },
          ]);
      }
  }

  if (!customElements.get('photosnap-app')) {
      customElements.define('photosnap-app', PhotosnapApp);
  }

})));
//# sourceMappingURL=PhotosnapApp.js.map
