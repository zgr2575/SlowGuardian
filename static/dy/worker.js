"use strict";
(() => {
  var Ls = Object.create;
  var Xe = Object.defineProperty;
  var Ts = Object.getOwnPropertyDescriptor;
  var Ds = Object.getOwnPropertyNames;
  var Os = Object.getPrototypeOf,
    Bs = Object.prototype.hasOwnProperty;
  var Vs = (e, t, i) =>
    t in e
      ? Xe(e, t, { enumerable: !0, configurable: !0, writable: !0, value: i })
      : (e[t] = i);
  var St = (e, t) => () => (
      t || e((t = { exports: {} }).exports, t), t.exports
    ),
    $i = (e, t) => {
      for (var i in t) Xe(e, i, { get: t[i], enumerable: !0 });
    },
    Ms = (e, t, i, r) => {
      if ((t && typeof t == "object") || typeof t == "function")
        for (let s of Ds(t))
          !Bs.call(e, s) &&
            s !== i &&
            Xe(e, s, {
              get: () => t[s],
              enumerable: !(r = Ts(t, s)) || r.enumerable,
            });
      return e;
    };
  var Je = (e, t, i) => (
    (i = e != null ? Ls(Os(e)) : {}),
    Ms(
      t || !e || !e.__esModule
        ? Xe(i, "default", { value: e, enumerable: !0 })
        : i,
      e
    )
  );
  var z = (e, t, i) => (Vs(e, typeof t != "symbol" ? t + "" : t, i), i);
  var kt = St(($n, Wi) => {
    "use strict";
    function re(e) {
      if (typeof e != "string")
        throw new TypeError(
          "Path must be a string. Received " + JSON.stringify(e)
        );
    }
    function Hi(e, t) {
      for (var i = "", r = 0, s = -1, a = 0, n, u = 0; u <= e.length; ++u) {
        if (u < e.length) n = e.charCodeAt(u);
        else {
          if (n === 47) break;
          n = 47;
        }
        if (n === 47) {
          if (!(s === u - 1 || a === 1))
            if (s !== u - 1 && a === 2) {
              if (
                i.length < 2 ||
                r !== 2 ||
                i.charCodeAt(i.length - 1) !== 46 ||
                i.charCodeAt(i.length - 2) !== 46
              ) {
                if (i.length > 2) {
                  var c = i.lastIndexOf("/");
                  if (c !== i.length - 1) {
                    c === -1
                      ? ((i = ""), (r = 0))
                      : ((i = i.slice(0, c)),
                        (r = i.length - 1 - i.lastIndexOf("/"))),
                      (s = u),
                      (a = 0);
                    continue;
                  }
                } else if (i.length === 2 || i.length === 1) {
                  (i = ""), (r = 0), (s = u), (a = 0);
                  continue;
                }
              }
              t && (i.length > 0 ? (i += "/..") : (i = ".."), (r = 2));
            } else
              i.length > 0
                ? (i += "/" + e.slice(s + 1, u))
                : (i = e.slice(s + 1, u)),
                (r = u - s - 1);
          (s = u), (a = 0);
        } else n === 46 && a !== -1 ? ++a : (a = -1);
      }
      return i;
    }
    function js(e, t) {
      var i = t.dir || t.root,
        r = t.base || (t.name || "") + (t.ext || "");
      return i ? (i === t.root ? i + r : i + e + r) : r;
    }
    var be = {
      resolve: function () {
        for (
          var t = "", i = !1, r, s = arguments.length - 1;
          s >= -1 && !i;
          s--
        ) {
          var a;
          s >= 0
            ? (a = arguments[s])
            : (r === void 0 && (r = process.cwd()), (a = r)),
            re(a),
            a.length !== 0 && ((t = a + "/" + t), (i = a.charCodeAt(0) === 47));
        }
        return (
          (t = Hi(t, !i)),
          i ? (t.length > 0 ? "/" + t : "/") : t.length > 0 ? t : "."
        );
      },
      normalize: function (t) {
        if ((re(t), t.length === 0)) return ".";
        var i = t.charCodeAt(0) === 47,
          r = t.charCodeAt(t.length - 1) === 47;
        return (
          (t = Hi(t, !i)),
          t.length === 0 && !i && (t = "."),
          t.length > 0 && r && (t += "/"),
          i ? "/" + t : t
        );
      },
      isAbsolute: function (t) {
        return re(t), t.length > 0 && t.charCodeAt(0) === 47;
      },
      join: function () {
        if (arguments.length === 0) return ".";
        for (var t, i = 0; i < arguments.length; ++i) {
          var r = arguments[i];
          re(r), r.length > 0 && (t === void 0 ? (t = r) : (t += "/" + r));
        }
        return t === void 0 ? "." : be.normalize(t);
      },
      relative: function (t, i) {
        if (
          (re(t),
          re(i),
          t === i || ((t = be.resolve(t)), (i = be.resolve(i)), t === i))
        )
          return "";
        for (var r = 1; r < t.length && t.charCodeAt(r) === 47; ++r);
        for (
          var s = t.length, a = s - r, n = 1;
          n < i.length && i.charCodeAt(n) === 47;
          ++n
        );
        for (
          var u = i.length, c = u - n, l = a < c ? a : c, h = -1, y = 0;
          y <= l;
          ++y
        ) {
          if (y === l) {
            if (c > l) {
              if (i.charCodeAt(n + y) === 47) return i.slice(n + y + 1);
              if (y === 0) return i.slice(n + y);
            } else
              a > l &&
                (t.charCodeAt(r + y) === 47 ? (h = y) : y === 0 && (h = 0));
            break;
          }
          var S = t.charCodeAt(r + y),
            x = i.charCodeAt(n + y);
          if (S !== x) break;
          S === 47 && (h = y);
        }
        var f = "";
        for (y = r + h + 1; y <= s; ++y)
          (y === s || t.charCodeAt(y) === 47) &&
            (f.length === 0 ? (f += "..") : (f += "/.."));
        return f.length > 0
          ? f + i.slice(n + h)
          : ((n += h), i.charCodeAt(n) === 47 && ++n, i.slice(n));
      },
      _makeLong: function (t) {
        return t;
      },
      dirname: function (t) {
        if ((re(t), t.length === 0)) return ".";
        for (
          var i = t.charCodeAt(0),
            r = i === 47,
            s = -1,
            a = !0,
            n = t.length - 1;
          n >= 1;
          --n
        )
          if (((i = t.charCodeAt(n)), i === 47)) {
            if (!a) {
              s = n;
              break;
            }
          } else a = !1;
        return s === -1 ? (r ? "/" : ".") : r && s === 1 ? "//" : t.slice(0, s);
      },
      basename: function (t, i) {
        if (i !== void 0 && typeof i != "string")
          throw new TypeError('"ext" argument must be a string');
        re(t);
        var r = 0,
          s = -1,
          a = !0,
          n;
        if (i !== void 0 && i.length > 0 && i.length <= t.length) {
          if (i.length === t.length && i === t) return "";
          var u = i.length - 1,
            c = -1;
          for (n = t.length - 1; n >= 0; --n) {
            var l = t.charCodeAt(n);
            if (l === 47) {
              if (!a) {
                r = n + 1;
                break;
              }
            } else
              c === -1 && ((a = !1), (c = n + 1)),
                u >= 0 &&
                  (l === i.charCodeAt(u)
                    ? --u === -1 && (s = n)
                    : ((u = -1), (s = c)));
          }
          return r === s ? (s = c) : s === -1 && (s = t.length), t.slice(r, s);
        } else {
          for (n = t.length - 1; n >= 0; --n)
            if (t.charCodeAt(n) === 47) {
              if (!a) {
                r = n + 1;
                break;
              }
            } else s === -1 && ((a = !1), (s = n + 1));
          return s === -1 ? "" : t.slice(r, s);
        }
      },
      extname: function (t) {
        re(t);
        for (
          var i = -1, r = 0, s = -1, a = !0, n = 0, u = t.length - 1;
          u >= 0;
          --u
        ) {
          var c = t.charCodeAt(u);
          if (c === 47) {
            if (!a) {
              r = u + 1;
              break;
            }
            continue;
          }
          s === -1 && ((a = !1), (s = u + 1)),
            c === 46
              ? i === -1
                ? (i = u)
                : n !== 1 && (n = 1)
              : i !== -1 && (n = -1);
        }
        return i === -1 ||
          s === -1 ||
          n === 0 ||
          (n === 1 && i === s - 1 && i === r + 1)
          ? ""
          : t.slice(i, s);
      },
      format: function (t) {
        if (t === null || typeof t != "object")
          throw new TypeError(
            'The "pathObject" argument must be of type Object. Received type ' +
              typeof t
          );
        return js("/", t);
      },
      parse: function (t) {
        re(t);
        var i = { root: "", dir: "", base: "", ext: "", name: "" };
        if (t.length === 0) return i;
        var r = t.charCodeAt(0),
          s = r === 47,
          a;
        s ? ((i.root = "/"), (a = 1)) : (a = 0);
        for (
          var n = -1, u = 0, c = -1, l = !0, h = t.length - 1, y = 0;
          h >= a;
          --h
        ) {
          if (((r = t.charCodeAt(h)), r === 47)) {
            if (!l) {
              u = h + 1;
              break;
            }
            continue;
          }
          c === -1 && ((l = !1), (c = h + 1)),
            r === 46
              ? n === -1
                ? (n = h)
                : y !== 1 && (y = 1)
              : n !== -1 && (y = -1);
        }
        return (
          n === -1 ||
          c === -1 ||
          y === 0 ||
          (y === 1 && n === c - 1 && n === u + 1)
            ? c !== -1 &&
              (u === 0 && s
                ? (i.base = i.name = t.slice(1, c))
                : (i.base = i.name = t.slice(u, c)))
            : (u === 0 && s
                ? ((i.name = t.slice(1, n)), (i.base = t.slice(1, c)))
                : ((i.name = t.slice(u, n)), (i.base = t.slice(u, c))),
              (i.ext = t.slice(n, c))),
          u > 0 ? (i.dir = t.slice(0, u - 1)) : s && (i.dir = "/"),
          i
        );
      },
      sep: "/",
      delimiter: ":",
      win32: null,
      posix: null,
    };
    be.posix = be;
    Wi.exports = be;
  });
  var Qr = St((Jt) => {
    "use strict";
    Jt.parse = tn;
    Jt.serialize = rn;
    var en = Object.prototype.toString,
      ft = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
    function tn(e, t) {
      if (typeof e != "string")
        throw new TypeError("argument str must be a string");
      for (var i = {}, r = t || {}, s = r.decode || sn, a = 0; a < e.length; ) {
        var n = e.indexOf("=", a);
        if (n === -1) break;
        var u = e.indexOf(";", a);
        if (u === -1) u = e.length;
        else if (u < n) {
          a = e.lastIndexOf(";", n - 1) + 1;
          continue;
        }
        var c = e.slice(a, n).trim();
        if (i[c] === void 0) {
          var l = e.slice(n + 1, u).trim();
          l.charCodeAt(0) === 34 && (l = l.slice(1, -1)), (i[c] = on(l, s));
        }
        a = u + 1;
      }
      return i;
    }
    function rn(e, t, i) {
      var r = i || {},
        s = r.encode || an;
      if (typeof s != "function")
        throw new TypeError("option encode is invalid");
      if (!ft.test(e)) throw new TypeError("argument name is invalid");
      var a = s(t);
      if (a && !ft.test(a)) throw new TypeError("argument val is invalid");
      var n = e + "=" + a;
      if (r.maxAge != null) {
        var u = r.maxAge - 0;
        if (isNaN(u) || !isFinite(u))
          throw new TypeError("option maxAge is invalid");
        n += "; Max-Age=" + Math.floor(u);
      }
      if (r.domain) {
        if (!ft.test(r.domain)) throw new TypeError("option domain is invalid");
        n += "; Domain=" + r.domain;
      }
      if (r.path) {
        if (!ft.test(r.path)) throw new TypeError("option path is invalid");
        n += "; Path=" + r.path;
      }
      if (r.expires) {
        var c = r.expires;
        if (!nn(c) || isNaN(c.valueOf()))
          throw new TypeError("option expires is invalid");
        n += "; Expires=" + c.toUTCString();
      }
      if (
        (r.httpOnly && (n += "; HttpOnly"),
        r.secure && (n += "; Secure"),
        r.priority)
      ) {
        var l =
          typeof r.priority == "string" ? r.priority.toLowerCase() : r.priority;
        switch (l) {
          case "low":
            n += "; Priority=Low";
            break;
          case "medium":
            n += "; Priority=Medium";
            break;
          case "high":
            n += "; Priority=High";
            break;
          default:
            throw new TypeError("option priority is invalid");
        }
      }
      if (r.sameSite) {
        var h =
          typeof r.sameSite == "string" ? r.sameSite.toLowerCase() : r.sameSite;
        switch (h) {
          case !0:
            n += "; SameSite=Strict";
            break;
          case "lax":
            n += "; SameSite=Lax";
            break;
          case "strict":
            n += "; SameSite=Strict";
            break;
          case "none":
            n += "; SameSite=None";
            break;
          default:
            throw new TypeError("option sameSite is invalid");
        }
      }
      return n;
    }
    function sn(e) {
      return e.indexOf("%") !== -1 ? decodeURIComponent(e) : e;
    }
    function an(e) {
      return encodeURIComponent(e);
    }
    function nn(e) {
      return en.call(e) === "[object Date]" || e instanceof Date;
    }
    function on(e, t) {
      try {
        return t(e);
      } catch {
        return e;
      }
    }
  });
  var Xr = St((Xn, Ve) => {
    "use strict";
    var Se = { decodeValues: !0, map: !1, silent: !1 };
    function Zt(e) {
      return typeof e == "string" && !!e.trim();
    }
    function ei(e, t) {
      var i = e.split(";").filter(Zt),
        r = i.shift(),
        s = cn(r),
        a = s.name,
        n = s.value;
      t = t ? Object.assign({}, Se, t) : Se;
      try {
        n = t.decodeValues ? decodeURIComponent(n) : n;
      } catch (c) {
        console.error(
          "set-cookie-parser encountered an error while decoding a cookie with value '" +
            n +
            "'. Set options.decodeValues to false to disable this feature.",
          c
        );
      }
      var u = { name: a, value: n };
      return (
        i.forEach(function (c) {
          var l = c.split("="),
            h = l.shift().trimLeft().toLowerCase(),
            y = l.join("=");
          h === "expires"
            ? (u.expires = new Date(y))
            : h === "max-age"
              ? (u.maxAge = parseInt(y, 10))
              : h === "secure"
                ? (u.secure = !0)
                : h === "httponly"
                  ? (u.httpOnly = !0)
                  : h === "samesite"
                    ? (u.sameSite = y)
                    : (u[h] = y);
        }),
        u
      );
    }
    function cn(e) {
      var t = "",
        i = "",
        r = e.split("=");
      return (
        r.length > 1 ? ((t = r.shift()), (i = r.join("="))) : (i = e),
        { name: t, value: i }
      );
    }
    function Yr(e, t) {
      if (((t = t ? Object.assign({}, Se, t) : Se), !e)) return t.map ? {} : [];
      if (e.headers)
        if (typeof e.headers.getSetCookie == "function")
          e = e.headers.getSetCookie();
        else if (e.headers["set-cookie"]) e = e.headers["set-cookie"];
        else {
          var i =
            e.headers[
              Object.keys(e.headers).find(function (s) {
                return s.toLowerCase() === "set-cookie";
              })
            ];
          !i &&
            e.headers.cookie &&
            !t.silent &&
            console.warn(
              "Warning: set-cookie-parser appears to have been called on a request object. It is designed to parse Set-Cookie headers from responses, not Cookie headers from requests. Set the option {silent: true} to suppress this warning."
            ),
            (e = i);
        }
      if (
        (Array.isArray(e) || (e = [e]),
        (t = t ? Object.assign({}, Se, t) : Se),
        t.map)
      ) {
        var r = {};
        return e.filter(Zt).reduce(function (s, a) {
          var n = ei(a, t);
          return (s[n.name] = n), s;
        }, r);
      } else
        return e.filter(Zt).map(function (s) {
          return ei(s, t);
        });
    }
    function un(e) {
      if (Array.isArray(e)) return e;
      if (typeof e != "string") return [];
      var t = [],
        i = 0,
        r,
        s,
        a,
        n,
        u;
      function c() {
        for (; i < e.length && /\s/.test(e.charAt(i)); ) i += 1;
        return i < e.length;
      }
      function l() {
        return (s = e.charAt(i)), s !== "=" && s !== ";" && s !== ",";
      }
      for (; i < e.length; ) {
        for (r = i, u = !1; c(); )
          if (((s = e.charAt(i)), s === ",")) {
            for (a = i, i += 1, c(), n = i; i < e.length && l(); ) i += 1;
            i < e.length && e.charAt(i) === "="
              ? ((u = !0), (i = n), t.push(e.substring(r, a)), (r = i))
              : (i = a + 1);
          } else i += 1;
        (!u || i >= e.length) && t.push(e.substring(r, e.length));
      }
      return t;
    }
    Ve.exports = Yr;
    Ve.exports.parse = Yr;
    Ve.exports.parseString = ei;
    Ve.exports.splitCookiesString = un;
  });
  var qi = Je(kt()),
    Ze = {
      "application/ecmascript": {
        source: "apache",
        compressible: !0,
        extensions: ["ecma"],
      },
      "application/gzip": {
        source: "iana",
        compressible: !1,
        extensions: ["gz"],
      },
      "application/http": { source: "iana" },
      "application/javascript": {
        source: "apache",
        charset: "UTF-8",
        compressible: !0,
        extensions: ["js"],
      },
      "application/json": {
        source: "iana",
        charset: "UTF-8",
        compressible: !0,
        extensions: ["json", "map"],
      },
      "application/manifest+json": {
        source: "iana",
        charset: "UTF-8",
        compressible: !0,
        extensions: ["webmanifest"],
      },
      "application/marc": { source: "iana", extensions: ["mrc"] },
      "application/mp4": {
        source: "iana",
        extensions: ["mp4", "mpg4", "mp4s", "m4p"],
      },
      "application/ogg": {
        source: "iana",
        compressible: !1,
        extensions: ["ogx"],
      },
      "application/sql": { source: "iana", extensions: ["sql"] },
      "application/wasm": {
        source: "iana",
        compressible: !0,
        extensions: ["wasm"],
      },
      "application/x-bittorrent": { source: "apache", extensions: ["torrent"] },
      "application/x-gzip": { source: "apache" },
      "application/x-javascript": { compressible: !0 },
      "application/x-web-app-manifest+json": {
        compressible: !0,
        extensions: ["webapp"],
      },
      "application/x-www-form-urlencoded": { source: "iana", compressible: !0 },
      "application/xhtml+xml": {
        source: "iana",
        compressible: !0,
        extensions: ["xhtml", "xht"],
      },
      "application/xhtml-voice+xml": { source: "apache", compressible: !0 },
      "application/xml": {
        source: "iana",
        compressible: !0,
        extensions: ["xml", "xsl", "xsd", "rng"],
      },
      "application/zip": {
        source: "iana",
        compressible: !1,
        extensions: ["zip"],
      },
      "application/zlib": { source: "iana" },
      "audio/midi": {
        source: "apache",
        extensions: ["mid", "midi", "kar", "rmi"],
      },
      "audio/mp3": { compressible: !1, extensions: ["mp3"] },
      "audio/mp4": {
        source: "iana",
        compressible: !1,
        extensions: ["m4a", "mp4a"],
      },
      "audio/mp4a-latm": { source: "iana" },
      "audio/mpa": { source: "iana" },
      "audio/mpa-robust": { source: "iana" },
      "audio/mpeg": {
        source: "iana",
        compressible: !1,
        extensions: ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"],
      },
      "audio/ogg": {
        source: "iana",
        compressible: !1,
        extensions: ["oga", "ogg", "spx", "opus"],
      },
      "audio/red": { source: "iana" },
      "audio/rtx": { source: "iana" },
      "audio/scip": { source: "iana" },
      "audio/silk": { source: "apache", extensions: ["sil"] },
      "audio/smv": { source: "iana" },
      "audio/wav": { compressible: !1, extensions: ["wav"] },
      "audio/wave": { compressible: !1, extensions: ["wav"] },
      "audio/webm": {
        source: "apache",
        compressible: !1,
        extensions: ["weba"],
      },
      "audio/x-aac": {
        source: "apache",
        compressible: !1,
        extensions: ["aac"],
      },
      "audio/x-aiff": { source: "apache", extensions: ["aif", "aiff", "aifc"] },
      "audio/x-caf": {
        source: "apache",
        compressible: !1,
        extensions: ["caf"],
      },
      "audio/x-flac": { source: "apache", extensions: ["flac"] },
      "audio/x-m4a": { source: "nginx", extensions: ["m4a"] },
      "audio/x-matroska": { source: "apache", extensions: ["mka"] },
      "audio/x-mpegurl": { source: "apache", extensions: ["m3u"] },
      "audio/x-ms-wax": { source: "apache", extensions: ["wax"] },
      "audio/x-ms-wma": { source: "apache", extensions: ["wma"] },
      "audio/x-pn-realaudio": { source: "apache", extensions: ["ram", "ra"] },
      "audio/x-pn-realaudio-plugin": { source: "apache", extensions: ["rmp"] },
      "audio/x-realaudio": { source: "nginx", extensions: ["ra"] },
      "audio/x-tta": { source: "apache" },
      "audio/x-wav": { source: "apache", extensions: ["wav"] },
      "audio/xm": { source: "apache", extensions: ["xm"] },
      "font/collection": { source: "iana", extensions: ["ttc"] },
      "font/otf": { source: "iana", compressible: !0, extensions: ["otf"] },
      "font/sfnt": { source: "iana" },
      "font/ttf": { source: "iana", compressible: !0, extensions: ["ttf"] },
      "font/woff": { source: "iana", extensions: ["woff"] },
      "font/woff2": { source: "iana", extensions: ["woff2"] },
      "image/gif": { source: "iana", compressible: !1, extensions: ["gif"] },
      "image/heic": { source: "iana", extensions: ["heic"] },
      "image/heic-sequence": { source: "iana", extensions: ["heics"] },
      "image/heif": { source: "iana", extensions: ["heif"] },
      "image/jpeg": {
        source: "iana",
        compressible: !1,
        extensions: ["jpeg", "jpg", "jpe"],
      },
      "image/png": { source: "iana", compressible: !1, extensions: ["png"] },
      "image/svg+xml": {
        source: "iana",
        compressible: !0,
        extensions: ["svg", "svgz"],
      },
      "image/webp": { source: "iana", extensions: ["webp"] },
      "text/coffeescript": { extensions: ["coffee", "litcoffee"] },
      "text/css": {
        source: "iana",
        charset: "UTF-8",
        compressible: !0,
        extensions: ["css"],
      },
      "text/ecmascript": { source: "apache" },
      "text/html": {
        source: "iana",
        compressible: !0,
        extensions: ["html", "htm", "shtml"],
      },
      "text/jade": { extensions: ["jade"] },
      "text/javascript": {
        source: "iana",
        charset: "UTF-8",
        compressible: !0,
        extensions: ["js", "mjs"],
      },
      "text/markdown": {
        source: "iana",
        compressible: !0,
        extensions: ["md", "markdown"],
      },
    },
    zi = /^\s*([^;\s]*)(?:;|\s|$)/,
    Fs = /^text\//i,
    G = {};
  function Gi(e) {
    if (!e || typeof e != "string") return !1;
    var t = zi.exec(e),
      i = t && Ze[t[1].toLowerCase()];
    return i && i.charset ? i.charset : !(!t || !Fs.test(t[1])) && "UTF-8";
  }
  function Us(e) {
    if (!e || typeof e != "string") return !1;
    var t = e.indexOf("/") === -1 ? G.lookup(e) : e;
    if (!t) return !1;
    if (t.indexOf("charset") === -1) {
      var i = G.charset(t);
      i && (t += "; charset=" + i.toLowerCase());
    }
    return t;
  }
  function $s(e) {
    if (!e || typeof e != "string") return !1;
    var t = zi.exec(e),
      i = t && G.extensions[t[1].toLowerCase()];
    return !(!i || !i.length) && i[0];
  }
  function Hs(e) {
    if (!e || typeof e != "string") return !1;
    var t = (0, qi.extname)("x." + e)
      .toLowerCase()
      .substr(1);
    return (t && G.types[t]) || !1;
  }
  function Ws(e, t) {
    var i = ["nginx", "apache", void 0, "iana"];
    Object.keys(Ze).forEach(function (r) {
      var s = Ze[r],
        a = s.extensions;
      if (a && a.length) {
        e[r] = a;
        for (var n = 0; n < a.length; n++) {
          var u = a[n];
          if (t[u]) {
            var c = i.indexOf(Ze[t[u]].source),
              l = i.indexOf(s.source);
            if (
              t[u] !== "application/octet-stream" &&
              (c > l || (c === l && t[u].substr(0, 12) === "application/"))
            )
              continue;
          }
          t[u] = r;
        }
      }
    });
  }
  (G.charset = Gi),
    (G.charsets = { lookup: Gi }),
    (G.contentType = Us),
    (G.extension = $s),
    (G.extensions = Object.create(null)),
    (G.lookup = Hs),
    (G.types = Object.create(null)),
    Ws(G.extensions, G.types);
  var Ki = G;
  var gn = Je(kt(), 1);
  var et = {};
  $i(et, {
    deleteDB: () => Js,
    openDB: () => Nt,
    unwrap: () => Pe,
    wrap: () => K,
  });
  var Gs = (e, t) => t.some((i) => e instanceof i),
    Qi,
    Yi;
  function qs() {
    return (
      Qi ||
      (Qi = [IDBDatabase, IDBObjectStore, IDBIndex, IDBCursor, IDBTransaction])
    );
  }
  function zs() {
    return (
      Yi ||
      (Yi = [
        IDBCursor.prototype.advance,
        IDBCursor.prototype.continue,
        IDBCursor.prototype.continuePrimaryKey,
      ])
    );
  }
  var Xi = new WeakMap(),
    At = new WeakMap(),
    Ji = new WeakMap(),
    Et = new WeakMap(),
    Pt = new WeakMap();
  function Ks(e) {
    let t = new Promise((i, r) => {
      let s = () => {
          e.removeEventListener("success", a),
            e.removeEventListener("error", n);
        },
        a = () => {
          i(K(e.result)), s();
        },
        n = () => {
          r(e.error), s();
        };
      e.addEventListener("success", a), e.addEventListener("error", n);
    });
    return (
      t
        .then((i) => {
          i instanceof IDBCursor && Xi.set(i, e);
        })
        .catch(() => {}),
      Pt.set(t, e),
      t
    );
  }
  function Qs(e) {
    if (At.has(e)) return;
    let t = new Promise((i, r) => {
      let s = () => {
          e.removeEventListener("complete", a),
            e.removeEventListener("error", n),
            e.removeEventListener("abort", n);
        },
        a = () => {
          i(), s();
        },
        n = () => {
          r(e.error || new DOMException("AbortError", "AbortError")), s();
        };
      e.addEventListener("complete", a),
        e.addEventListener("error", n),
        e.addEventListener("abort", n);
    });
    At.set(e, t);
  }
  var It = {
    get(e, t, i) {
      if (e instanceof IDBTransaction) {
        if (t === "done") return At.get(e);
        if (t === "objectStoreNames") return e.objectStoreNames || Ji.get(e);
        if (t === "store")
          return i.objectStoreNames[1]
            ? void 0
            : i.objectStore(i.objectStoreNames[0]);
      }
      return K(e[t]);
    },
    set(e, t, i) {
      return (e[t] = i), !0;
    },
    has(e, t) {
      return e instanceof IDBTransaction && (t === "done" || t === "store")
        ? !0
        : t in e;
    },
  };
  function Zi(e) {
    It = e(It);
  }
  function Ys(e) {
    return e === IDBDatabase.prototype.transaction &&
      !("objectStoreNames" in IDBTransaction.prototype)
      ? function (t, ...i) {
          let r = e.call(Pe(this), t, ...i);
          return Ji.set(r, t.sort ? t.sort() : [t]), K(r);
        }
      : zs().includes(e)
        ? function (...t) {
            return e.apply(Pe(this), t), K(Xi.get(this));
          }
        : function (...t) {
            return K(e.apply(Pe(this), t));
          };
  }
  function Xs(e) {
    return typeof e == "function"
      ? Ys(e)
      : (e instanceof IDBTransaction && Qs(e),
        Gs(e, qs()) ? new Proxy(e, It) : e);
  }
  function K(e) {
    if (e instanceof IDBRequest) return Ks(e);
    if (Et.has(e)) return Et.get(e);
    let t = Xs(e);
    return t !== e && (Et.set(e, t), Pt.set(t, e)), t;
  }
  var Pe = (e) => Pt.get(e);
  function Nt(
    e,
    t,
    { blocked: i, upgrade: r, blocking: s, terminated: a } = {}
  ) {
    let n = indexedDB.open(e, t),
      u = K(n);
    return (
      r &&
        n.addEventListener("upgradeneeded", (c) => {
          r(K(n.result), c.oldVersion, c.newVersion, K(n.transaction), c);
        }),
      i &&
        n.addEventListener("blocked", (c) => i(c.oldVersion, c.newVersion, c)),
      u
        .then((c) => {
          a && c.addEventListener("close", () => a()),
            s &&
              c.addEventListener("versionchange", (l) =>
                s(l.oldVersion, l.newVersion, l)
              );
        })
        .catch(() => {}),
      u
    );
  }
  function Js(e, { blocked: t } = {}) {
    let i = indexedDB.deleteDatabase(e);
    return (
      t && i.addEventListener("blocked", (r) => t(r.oldVersion, r)),
      K(i).then(() => {})
    );
  }
  var Zs = ["get", "getKey", "getAll", "getAllKeys", "count"],
    ea = ["put", "add", "delete", "clear"],
    Rt = new Map();
  function er(e, t) {
    if (!(e instanceof IDBDatabase && !(t in e) && typeof t == "string"))
      return;
    if (Rt.get(t)) return Rt.get(t);
    let i = t.replace(/FromIndex$/, ""),
      r = t !== i,
      s = ea.includes(i);
    if (
      !(i in (r ? IDBIndex : IDBObjectStore).prototype) ||
      !(s || Zs.includes(i))
    )
      return;
    let a = async function (n, ...u) {
      let c = this.transaction(n, s ? "readwrite" : "readonly"),
        l = c.store;
      return (
        r && (l = l.index(u.shift())),
        (await Promise.all([l[i](...u), s && c.done]))[0]
      );
    };
    return Rt.set(t, a), a;
  }
  Zi((e) => ({
    ...e,
    get: (t, i, r) => er(t, i) || e.get(t, i, r),
    has: (t, i) => !!er(t, i) || e.has(t, i),
  }));
  var ta = [
      509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1,
      574, 3, 9, 9, 370, 1, 81, 2, 71, 10, 50, 3, 123, 2, 54, 14, 32, 10, 3, 1,
      11, 3, 46, 10, 8, 0, 46, 9, 7, 2, 37, 13, 2, 9, 6, 1, 45, 0, 13, 2, 49,
      13, 9, 3, 2, 11, 83, 11, 7, 0, 3, 0, 158, 11, 6, 9, 7, 3, 56, 1, 2, 6, 3,
      1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 193, 17, 10, 9, 5, 0, 82, 19, 13, 9,
      214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 84, 14, 5, 9, 243, 14,
      166, 9, 71, 5, 2, 1, 3, 3, 2, 0, 2, 1, 13, 9, 120, 6, 3, 6, 4, 0, 29, 9,
      41, 6, 2, 3, 9, 0, 10, 10, 47, 15, 406, 7, 2, 7, 17, 9, 57, 21, 2, 13,
      123, 5, 4, 0, 2, 1, 2, 6, 2, 0, 9, 9, 49, 4, 2, 1, 2, 4, 9, 9, 330, 3, 10,
      1, 2, 0, 49, 6, 4, 4, 14, 9, 5351, 0, 7, 14, 13835, 9, 87, 9, 39, 4, 60,
      6, 26, 9, 1014, 0, 2, 54, 8, 3, 82, 0, 12, 1, 19628, 1, 4706, 45, 3, 22,
      543, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0,
      15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 101, 0, 161, 6, 10,
      9, 357, 0, 62, 13, 499, 13, 983, 6, 110, 6, 6, 9, 4759, 9, 787719, 239,
    ],
    ar = [
      0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48,
      48, 31, 14, 29, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35,
      5, 39, 9, 51, 13, 10, 2, 14, 2, 6, 2, 1, 2, 10, 2, 14, 2, 6, 2, 1, 68,
      310, 10, 21, 11, 7, 25, 5, 2, 41, 2, 8, 70, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3,
      22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16,
      3, 2, 2, 2, 28, 43, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14,
      17, 111, 72, 56, 50, 14, 50, 14, 35, 349, 41, 7, 1, 79, 28, 11, 0, 9, 21,
      43, 17, 47, 20, 28, 22, 13, 52, 58, 1, 3, 0, 14, 44, 33, 24, 27, 35, 30,
      0, 3, 0, 9, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 20, 1,
      64, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2,
      4, 4, 0, 19, 0, 13, 4, 159, 52, 19, 3, 21, 2, 31, 47, 21, 1, 2, 0, 185,
      46, 42, 3, 37, 47, 21, 0, 60, 42, 14, 0, 72, 26, 38, 6, 186, 43, 117, 63,
      32, 7, 3, 0, 3, 7, 2, 1, 2, 23, 16, 0, 2, 0, 95, 7, 3, 38, 17, 0, 2, 0,
      29, 0, 11, 39, 8, 0, 22, 0, 12, 45, 20, 0, 19, 72, 264, 8, 2, 36, 18, 0,
      50, 29, 113, 6, 2, 1, 2, 37, 22, 0, 26, 5, 2, 1, 2, 31, 15, 0, 328, 18,
      16, 0, 2, 12, 2, 33, 125, 0, 80, 921, 103, 110, 18, 195, 2637, 96, 16,
      1071, 18, 5, 4026, 582, 8634, 568, 8, 30, 18, 78, 18, 29, 19, 47, 17, 3,
      32, 20, 6, 18, 689, 63, 129, 74, 6, 0, 67, 12, 65, 1, 2, 0, 29, 6135, 9,
      1237, 43, 8, 8936, 3, 2, 6, 2, 1, 2, 290, 16, 0, 30, 2, 3, 0, 15, 3, 9,
      395, 2309, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3,
      3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4,
      6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30,
      2, 24, 2, 7, 1845, 30, 7, 5, 262, 61, 147, 44, 11, 6, 17, 0, 322, 29, 19,
      43, 485, 27, 757, 6, 2, 3, 2, 1, 2, 14, 2, 196, 60, 67, 8, 0, 1205, 3, 2,
      26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2,
      2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3,
      2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42719, 33, 4153, 7, 221,
      3, 5761, 15, 7472, 3104, 541, 1507, 4938, 6, 4191,
    ],
    ia =
      "\u200C\u200D\xB7\u0300-\u036F\u0387\u0483-\u0487\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u0669\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u06F0-\u06F9\u0711\u0730-\u074A\u07A6-\u07B0\u07C0-\u07C9\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u0898-\u089F\u08CA-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0966-\u096F\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09E6-\u09EF\u09FE\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A66-\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AE6-\u0AEF\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B55-\u0B57\u0B62\u0B63\u0B66-\u0B6F\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0BE6-\u0BEF\u0C00-\u0C04\u0C3C\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0CE6-\u0CEF\u0CF3\u0D00-\u0D03\u0D3B\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D66-\u0D6F\u0D81-\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0E50-\u0E59\u0EB1\u0EB4-\u0EBC\u0EC8-\u0ECE\u0ED0-\u0ED9\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1040-\u1049\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109D\u135D-\u135F\u1369-\u1371\u1712-\u1715\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u17E0-\u17E9\u180B-\u180D\u180F-\u1819\u18A9\u1920-\u192B\u1930-\u193B\u1946-\u194F\u19D0-\u19DA\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AB0-\u1ABD\u1ABF-\u1ACE\u1B00-\u1B04\u1B34-\u1B44\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BF3\u1C24-\u1C37\u1C40-\u1C49\u1C50-\u1C59\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1DC0-\u1DFF\u203F\u2040\u2054\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA620-\uA629\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA82C\uA880\uA881\uA8B4-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F1\uA8FF-\uA909\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9D0-\uA9D9\uA9E5\uA9F0-\uA9F9\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA50-\uAA59\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uABF0-\uABF9\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFF10-\uFF19\uFF3F",
    nr =
      "\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088E\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7CA\uA7D0\uA7D1\uA7D3\uA7D5-\uA7D9\uA7F2-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC",
    Lt = {
      3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
      5: "class enum extends super const export import",
      6: "enum",
      strict:
        "implements interface let package private protected public static yield",
      strictBind: "eval arguments",
    },
    Tt =
      "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this",
    ra = {
      5: Tt,
      "5module": Tt + " export import",
      6: Tt + " const class extends export import super",
    },
    sa = /^in(stanceof)?$/,
    aa = new RegExp("[" + nr + "]"),
    na = new RegExp("[" + nr + ia + "]");
  function Ot(e, t) {
    for (var i = 65536, r = 0; r < t.length; r += 2) {
      if (((i += t[r]), i > e)) return !1;
      if (((i += t[r + 1]), i >= e)) return !0;
    }
    return !1;
  }
  function ce(e, t) {
    return e < 65
      ? e === 36
      : e < 91
        ? !0
        : e < 97
          ? e === 95
          : e < 123
            ? !0
            : e <= 65535
              ? e >= 170 && aa.test(String.fromCharCode(e))
              : t === !1
                ? !1
                : Ot(e, ar);
  }
  function ve(e, t) {
    return e < 48
      ? e === 36
      : e < 58
        ? !0
        : e < 65
          ? !1
          : e < 91
            ? !0
            : e < 97
              ? e === 95
              : e < 123
                ? !0
                : e <= 65535
                  ? e >= 170 && na.test(String.fromCharCode(e))
                  : t === !1
                    ? !1
                    : Ot(e, ar) || Ot(e, ta);
  }
  var I = function (t, i) {
    i === void 0 && (i = {}),
      (this.label = t),
      (this.keyword = i.keyword),
      (this.beforeExpr = !!i.beforeExpr),
      (this.startsExpr = !!i.startsExpr),
      (this.isLoop = !!i.isLoop),
      (this.isAssign = !!i.isAssign),
      (this.prefix = !!i.prefix),
      (this.postfix = !!i.postfix),
      (this.binop = i.binop || null),
      (this.updateContext = null);
  };
  function Q(e, t) {
    return new I(e, { beforeExpr: !0, binop: t });
  }
  var Y = { beforeExpr: !0 },
    q = { startsExpr: !0 },
    Mt = {};
  function A(e, t) {
    return t === void 0 && (t = {}), (t.keyword = e), (Mt[e] = new I(e, t));
  }
  var o = {
      num: new I("num", q),
      regexp: new I("regexp", q),
      string: new I("string", q),
      name: new I("name", q),
      privateId: new I("privateId", q),
      eof: new I("eof"),
      bracketL: new I("[", { beforeExpr: !0, startsExpr: !0 }),
      bracketR: new I("]"),
      braceL: new I("{", { beforeExpr: !0, startsExpr: !0 }),
      braceR: new I("}"),
      parenL: new I("(", { beforeExpr: !0, startsExpr: !0 }),
      parenR: new I(")"),
      comma: new I(",", Y),
      semi: new I(";", Y),
      colon: new I(":", Y),
      dot: new I("."),
      question: new I("?", Y),
      questionDot: new I("?."),
      arrow: new I("=>", Y),
      template: new I("template"),
      invalidTemplate: new I("invalidTemplate"),
      ellipsis: new I("...", Y),
      backQuote: new I("`", q),
      dollarBraceL: new I("${", { beforeExpr: !0, startsExpr: !0 }),
      eq: new I("=", { beforeExpr: !0, isAssign: !0 }),
      assign: new I("_=", { beforeExpr: !0, isAssign: !0 }),
      incDec: new I("++/--", { prefix: !0, postfix: !0, startsExpr: !0 }),
      prefix: new I("!/~", { beforeExpr: !0, prefix: !0, startsExpr: !0 }),
      logicalOR: Q("||", 1),
      logicalAND: Q("&&", 2),
      bitwiseOR: Q("|", 3),
      bitwiseXOR: Q("^", 4),
      bitwiseAND: Q("&", 5),
      equality: Q("==/!=/===/!==", 6),
      relational: Q("</>/<=/>=", 7),
      bitShift: Q("<</>>/>>>", 8),
      plusMin: new I("+/-", {
        beforeExpr: !0,
        binop: 9,
        prefix: !0,
        startsExpr: !0,
      }),
      modulo: Q("%", 10),
      star: Q("*", 10),
      slash: Q("/", 10),
      starstar: new I("**", { beforeExpr: !0 }),
      coalesce: Q("??", 1),
      _break: A("break"),
      _case: A("case", Y),
      _catch: A("catch"),
      _continue: A("continue"),
      _debugger: A("debugger"),
      _default: A("default", Y),
      _do: A("do", { isLoop: !0, beforeExpr: !0 }),
      _else: A("else", Y),
      _finally: A("finally"),
      _for: A("for", { isLoop: !0 }),
      _function: A("function", q),
      _if: A("if"),
      _return: A("return", Y),
      _switch: A("switch"),
      _throw: A("throw", Y),
      _try: A("try"),
      _var: A("var"),
      _const: A("const"),
      _while: A("while", { isLoop: !0 }),
      _with: A("with"),
      _new: A("new", { beforeExpr: !0, startsExpr: !0 }),
      _this: A("this", q),
      _super: A("super", q),
      _class: A("class", q),
      _extends: A("extends", Y),
      _export: A("export"),
      _import: A("import", q),
      _null: A("null", q),
      _true: A("true", q),
      _false: A("false", q),
      _in: A("in", { beforeExpr: !0, binop: 7 }),
      _instanceof: A("instanceof", { beforeExpr: !0, binop: 7 }),
      _typeof: A("typeof", { beforeExpr: !0, prefix: !0, startsExpr: !0 }),
      _void: A("void", { beforeExpr: !0, prefix: !0, startsExpr: !0 }),
      _delete: A("delete", { beforeExpr: !0, prefix: !0, startsExpr: !0 }),
    },
    Z = /\r\n?|\n|\u2028|\u2029/,
    oa = new RegExp(Z.source, "g");
  function we(e) {
    return e === 10 || e === 13 || e === 8232 || e === 8233;
  }
  function or(e, t, i) {
    i === void 0 && (i = e.length);
    for (var r = t; r < i; r++) {
      var s = e.charCodeAt(r);
      if (we(s))
        return r < i - 1 && s === 13 && e.charCodeAt(r + 1) === 10
          ? r + 2
          : r + 1;
    }
    return -1;
  }
  var cr = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/,
    X = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g,
    ur = Object.prototype,
    ca = ur.hasOwnProperty,
    ua = ur.toString,
    Te =
      Object.hasOwn ||
      function (e, t) {
        return ca.call(e, t);
      },
    tr =
      Array.isArray ||
      function (e) {
        return ua.call(e) === "[object Array]";
      };
  function fe(e) {
    return new RegExp("^(?:" + e.replace(/ /g, "|") + ")$");
  }
  function pe(e) {
    return e <= 65535
      ? String.fromCharCode(e)
      : ((e -= 65536),
        String.fromCharCode((e >> 10) + 55296, (e & 1023) + 56320));
  }
  var la =
      /(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/,
    Ne = function (t, i) {
      (this.line = t), (this.column = i);
    };
  Ne.prototype.offset = function (t) {
    return new Ne(this.line, this.column + t);
  };
  var at = function (t, i, r) {
    (this.start = i),
      (this.end = r),
      t.sourceFile !== null && (this.source = t.sourceFile);
  };
  function lr(e, t) {
    for (var i = 1, r = 0; ; ) {
      var s = or(e, r, t);
      if (s < 0) return new Ne(i, t - r);
      ++i, (r = s);
    }
  }
  var Bt = {
      ecmaVersion: null,
      sourceType: "script",
      onInsertedSemicolon: null,
      onTrailingComma: null,
      allowReserved: null,
      allowReturnOutsideFunction: !1,
      allowImportExportEverywhere: !1,
      allowAwaitOutsideFunction: null,
      allowSuperOutsideMethod: null,
      allowHashBang: !1,
      checkPrivateFields: !0,
      locations: !1,
      onToken: null,
      onComment: null,
      ranges: !1,
      program: null,
      sourceFile: null,
      directSourceFile: null,
      preserveParens: !1,
    },
    ir = !1;
  function ha(e) {
    var t = {};
    for (var i in Bt) t[i] = e && Te(e, i) ? e[i] : Bt[i];
    if (
      (t.ecmaVersion === "latest"
        ? (t.ecmaVersion = 1e8)
        : t.ecmaVersion == null
          ? (!ir &&
              typeof console == "object" &&
              console.warn &&
              ((ir = !0),
              console.warn(`Since Acorn 8.0.0, options.ecmaVersion is required.
Defaulting to 2020, but this will stop working in the future.`)),
            (t.ecmaVersion = 11))
          : t.ecmaVersion >= 2015 && (t.ecmaVersion -= 2009),
      t.allowReserved == null && (t.allowReserved = t.ecmaVersion < 5),
      (!e || e.allowHashBang == null) &&
        (t.allowHashBang = t.ecmaVersion >= 14),
      tr(t.onToken))
    ) {
      var r = t.onToken;
      t.onToken = function (s) {
        return r.push(s);
      };
    }
    return tr(t.onComment) && (t.onComment = fa(t, t.onComment)), t;
  }
  function fa(e, t) {
    return function (i, r, s, a, n, u) {
      var c = { type: i ? "Block" : "Line", value: r, start: s, end: a };
      e.locations && (c.loc = new at(this, n, u)),
        e.ranges && (c.range = [s, a]),
        t.push(c);
    };
  }
  var Le = 1,
    _e = 2,
    jt = 4,
    hr = 8,
    fr = 16,
    pr = 32,
    Ft = 64,
    dr = 128,
    De = 256,
    Ut = Le | _e | De;
  function $t(e, t) {
    return _e | (e ? jt : 0) | (t ? hr : 0);
  }
  var it = 0,
    Ht = 1,
    le = 2,
    mr = 3,
    gr = 4,
    xr = 5,
    T = function (t, i, r) {
      (this.options = t = ha(t)),
        (this.sourceFile = t.sourceFile),
        (this.keywords = fe(
          ra[t.ecmaVersion >= 6 ? 6 : t.sourceType === "module" ? "5module" : 5]
        ));
      var s = "";
      t.allowReserved !== !0 &&
        ((s = Lt[t.ecmaVersion >= 6 ? 6 : t.ecmaVersion === 5 ? 5 : 3]),
        t.sourceType === "module" && (s += " await")),
        (this.reservedWords = fe(s));
      var a = (s ? s + " " : "") + Lt.strict;
      (this.reservedWordsStrict = fe(a)),
        (this.reservedWordsStrictBind = fe(a + " " + Lt.strictBind)),
        (this.input = String(i)),
        (this.containsEsc = !1),
        r
          ? ((this.pos = r),
            (this.lineStart =
              this.input.lastIndexOf(
                `
`,
                r - 1
              ) + 1),
            (this.curLine = this.input
              .slice(0, this.lineStart)
              .split(Z).length))
          : ((this.pos = this.lineStart = 0), (this.curLine = 1)),
        (this.type = o.eof),
        (this.value = null),
        (this.start = this.end = this.pos),
        (this.startLoc = this.endLoc = this.curPosition()),
        (this.lastTokEndLoc = this.lastTokStartLoc = null),
        (this.lastTokStart = this.lastTokEnd = this.pos),
        (this.context = this.initialContext()),
        (this.exprAllowed = !0),
        (this.inModule = t.sourceType === "module"),
        (this.strict = this.inModule || this.strictDirective(this.pos)),
        (this.potentialArrowAt = -1),
        (this.potentialArrowInForAwait = !1),
        (this.yieldPos = this.awaitPos = this.awaitIdentPos = 0),
        (this.labels = []),
        (this.undefinedExports = Object.create(null)),
        this.pos === 0 &&
          t.allowHashBang &&
          this.input.slice(0, 2) === "#!" &&
          this.skipLineComment(2),
        (this.scopeStack = []),
        this.enterScope(Le),
        (this.regexpState = null),
        (this.privateNameStack = []);
    },
    se = {
      inFunction: { configurable: !0 },
      inGenerator: { configurable: !0 },
      inAsync: { configurable: !0 },
      canAwait: { configurable: !0 },
      allowSuper: { configurable: !0 },
      allowDirectSuper: { configurable: !0 },
      treatFunctionsAsVar: { configurable: !0 },
      allowNewDotTarget: { configurable: !0 },
      inClassStaticBlock: { configurable: !0 },
    };
  T.prototype.parse = function () {
    var t = this.options.program || this.startNode();
    return this.nextToken(), this.parseTopLevel(t);
  };
  se.inFunction.get = function () {
    return (this.currentVarScope().flags & _e) > 0;
  };
  se.inGenerator.get = function () {
    return (
      (this.currentVarScope().flags & hr) > 0 &&
      !this.currentVarScope().inClassFieldInit
    );
  };
  se.inAsync.get = function () {
    return (
      (this.currentVarScope().flags & jt) > 0 &&
      !this.currentVarScope().inClassFieldInit
    );
  };
  se.canAwait.get = function () {
    for (var e = this.scopeStack.length - 1; e >= 0; e--) {
      var t = this.scopeStack[e];
      if (t.inClassFieldInit || t.flags & De) return !1;
      if (t.flags & _e) return (t.flags & jt) > 0;
    }
    return (
      (this.inModule && this.options.ecmaVersion >= 13) ||
      this.options.allowAwaitOutsideFunction
    );
  };
  se.allowSuper.get = function () {
    var e = this.currentThisScope(),
      t = e.flags,
      i = e.inClassFieldInit;
    return (t & Ft) > 0 || i || this.options.allowSuperOutsideMethod;
  };
  se.allowDirectSuper.get = function () {
    return (this.currentThisScope().flags & dr) > 0;
  };
  se.treatFunctionsAsVar.get = function () {
    return this.treatFunctionsAsVarInScope(this.currentScope());
  };
  se.allowNewDotTarget.get = function () {
    var e = this.currentThisScope(),
      t = e.flags,
      i = e.inClassFieldInit;
    return (t & (_e | De)) > 0 || i;
  };
  se.inClassStaticBlock.get = function () {
    return (this.currentVarScope().flags & De) > 0;
  };
  T.extend = function () {
    for (var t = [], i = arguments.length; i--; ) t[i] = arguments[i];
    for (var r = this, s = 0; s < t.length; s++) r = t[s](r);
    return r;
  };
  T.parse = function (t, i) {
    return new this(i, t).parse();
  };
  T.parseExpressionAt = function (t, i, r) {
    var s = new this(r, t, i);
    return s.nextToken(), s.parseExpression();
  };
  T.tokenizer = function (t, i) {
    return new this(i, t);
  };
  Object.defineProperties(T.prototype, se);
  var $ = T.prototype,
    pa = /^(?:'((?:\\.|[^'\\])*?)'|"((?:\\.|[^"\\])*?)")/;
  $.strictDirective = function (e) {
    if (this.options.ecmaVersion < 5) return !1;
    for (;;) {
      (X.lastIndex = e), (e += X.exec(this.input)[0].length);
      var t = pa.exec(this.input.slice(e));
      if (!t) return !1;
      if ((t[1] || t[2]) === "use strict") {
        X.lastIndex = e + t[0].length;
        var i = X.exec(this.input),
          r = i.index + i[0].length,
          s = this.input.charAt(r);
        return (
          s === ";" ||
          s === "}" ||
          (Z.test(i[0]) &&
            !(
              /[(`.[+\-/*%<>=,?^&]/.test(s) ||
              (s === "!" && this.input.charAt(r + 1) === "=")
            ))
        );
      }
      (e += t[0].length),
        (X.lastIndex = e),
        (e += X.exec(this.input)[0].length),
        this.input[e] === ";" && e++;
    }
  };
  $.eat = function (e) {
    return this.type === e ? (this.next(), !0) : !1;
  };
  $.isContextual = function (e) {
    return this.type === o.name && this.value === e && !this.containsEsc;
  };
  $.eatContextual = function (e) {
    return this.isContextual(e) ? (this.next(), !0) : !1;
  };
  $.expectContextual = function (e) {
    this.eatContextual(e) || this.unexpected();
  };
  $.canInsertSemicolon = function () {
    return (
      this.type === o.eof ||
      this.type === o.braceR ||
      Z.test(this.input.slice(this.lastTokEnd, this.start))
    );
  };
  $.insertSemicolon = function () {
    if (this.canInsertSemicolon())
      return (
        this.options.onInsertedSemicolon &&
          this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc),
        !0
      );
  };
  $.semicolon = function () {
    !this.eat(o.semi) && !this.insertSemicolon() && this.unexpected();
  };
  $.afterTrailingComma = function (e, t) {
    if (this.type === e)
      return (
        this.options.onTrailingComma &&
          this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc),
        t || this.next(),
        !0
      );
  };
  $.expect = function (e) {
    this.eat(e) || this.unexpected();
  };
  $.unexpected = function (e) {
    this.raise(e ?? this.start, "Unexpected token");
  };
  var nt = function () {
    this.shorthandAssign =
      this.trailingComma =
      this.parenthesizedAssign =
      this.parenthesizedBind =
      this.doubleProto =
        -1;
  };
  $.checkPatternErrors = function (e, t) {
    if (e) {
      e.trailingComma > -1 &&
        this.raiseRecoverable(
          e.trailingComma,
          "Comma is not permitted after the rest element"
        );
      var i = t ? e.parenthesizedAssign : e.parenthesizedBind;
      i > -1 &&
        this.raiseRecoverable(
          i,
          t ? "Assigning to rvalue" : "Parenthesized pattern"
        );
    }
  };
  $.checkExpressionErrors = function (e, t) {
    if (!e) return !1;
    var i = e.shorthandAssign,
      r = e.doubleProto;
    if (!t) return i >= 0 || r >= 0;
    i >= 0 &&
      this.raise(
        i,
        "Shorthand property assignments are valid only in destructuring patterns"
      ),
      r >= 0 && this.raiseRecoverable(r, "Redefinition of __proto__ property");
  };
  $.checkYieldAwaitInDefaultParams = function () {
    this.yieldPos &&
      (!this.awaitPos || this.yieldPos < this.awaitPos) &&
      this.raise(this.yieldPos, "Yield expression cannot be a default value"),
      this.awaitPos &&
        this.raise(this.awaitPos, "Await expression cannot be a default value");
  };
  $.isSimpleAssignTarget = function (e) {
    return e.type === "ParenthesizedExpression"
      ? this.isSimpleAssignTarget(e.expression)
      : e.type === "Identifier" || e.type === "MemberExpression";
  };
  var w = T.prototype;
  w.parseTopLevel = function (e) {
    var t = Object.create(null);
    for (e.body || (e.body = []); this.type !== o.eof; ) {
      var i = this.parseStatement(null, !0, t);
      e.body.push(i);
    }
    if (this.inModule)
      for (
        var r = 0, s = Object.keys(this.undefinedExports);
        r < s.length;
        r += 1
      ) {
        var a = s[r];
        this.raiseRecoverable(
          this.undefinedExports[a].start,
          "Export '" + a + "' is not defined"
        );
      }
    return (
      this.adaptDirectivePrologue(e.body),
      this.next(),
      (e.sourceType = this.options.sourceType),
      this.finishNode(e, "Program")
    );
  };
  var Wt = { kind: "loop" },
    da = { kind: "switch" };
  w.isLet = function (e) {
    if (this.options.ecmaVersion < 6 || !this.isContextual("let")) return !1;
    X.lastIndex = this.pos;
    var t = X.exec(this.input),
      i = this.pos + t[0].length,
      r = this.input.charCodeAt(i);
    if (r === 91 || r === 92) return !0;
    if (e) return !1;
    if (r === 123 || (r > 55295 && r < 56320)) return !0;
    if (ce(r, !0)) {
      for (var s = i + 1; ve((r = this.input.charCodeAt(s)), !0); ) ++s;
      if (r === 92 || (r > 55295 && r < 56320)) return !0;
      var a = this.input.slice(i, s);
      if (!sa.test(a)) return !0;
    }
    return !1;
  };
  w.isAsyncFunction = function () {
    if (this.options.ecmaVersion < 8 || !this.isContextual("async")) return !1;
    X.lastIndex = this.pos;
    var e = X.exec(this.input),
      t = this.pos + e[0].length,
      i;
    return (
      !Z.test(this.input.slice(this.pos, t)) &&
      this.input.slice(t, t + 8) === "function" &&
      (t + 8 === this.input.length ||
        !(ve((i = this.input.charCodeAt(t + 8))) || (i > 55295 && i < 56320)))
    );
  };
  w.parseStatement = function (e, t, i) {
    var r = this.type,
      s = this.startNode(),
      a;
    switch ((this.isLet(e) && ((r = o._var), (a = "let")), r)) {
      case o._break:
      case o._continue:
        return this.parseBreakContinueStatement(s, r.keyword);
      case o._debugger:
        return this.parseDebuggerStatement(s);
      case o._do:
        return this.parseDoStatement(s);
      case o._for:
        return this.parseForStatement(s);
      case o._function:
        return (
          e &&
            (this.strict || (e !== "if" && e !== "label")) &&
            this.options.ecmaVersion >= 6 &&
            this.unexpected(),
          this.parseFunctionStatement(s, !1, !e)
        );
      case o._class:
        return e && this.unexpected(), this.parseClass(s, !0);
      case o._if:
        return this.parseIfStatement(s);
      case o._return:
        return this.parseReturnStatement(s);
      case o._switch:
        return this.parseSwitchStatement(s);
      case o._throw:
        return this.parseThrowStatement(s);
      case o._try:
        return this.parseTryStatement(s);
      case o._const:
      case o._var:
        return (
          (a = a || this.value),
          e && a !== "var" && this.unexpected(),
          this.parseVarStatement(s, a)
        );
      case o._while:
        return this.parseWhileStatement(s);
      case o._with:
        return this.parseWithStatement(s);
      case o.braceL:
        return this.parseBlock(!0, s);
      case o.semi:
        return this.parseEmptyStatement(s);
      case o._export:
      case o._import:
        if (this.options.ecmaVersion > 10 && r === o._import) {
          X.lastIndex = this.pos;
          var n = X.exec(this.input),
            u = this.pos + n[0].length,
            c = this.input.charCodeAt(u);
          if (c === 40 || c === 46)
            return this.parseExpressionStatement(s, this.parseExpression());
        }
        return (
          this.options.allowImportExportEverywhere ||
            (t ||
              this.raise(
                this.start,
                "'import' and 'export' may only appear at the top level"
              ),
            this.inModule ||
              this.raise(
                this.start,
                "'import' and 'export' may appear only with 'sourceType: module'"
              )),
          r === o._import ? this.parseImport(s) : this.parseExport(s, i)
        );
      default:
        if (this.isAsyncFunction())
          return (
            e && this.unexpected(),
            this.next(),
            this.parseFunctionStatement(s, !0, !e)
          );
        var l = this.value,
          h = this.parseExpression();
        return r === o.name && h.type === "Identifier" && this.eat(o.colon)
          ? this.parseLabeledStatement(s, l, h, e)
          : this.parseExpressionStatement(s, h);
    }
  };
  w.parseBreakContinueStatement = function (e, t) {
    var i = t === "break";
    this.next(),
      this.eat(o.semi) || this.insertSemicolon()
        ? (e.label = null)
        : this.type !== o.name
          ? this.unexpected()
          : ((e.label = this.parseIdent()), this.semicolon());
    for (var r = 0; r < this.labels.length; ++r) {
      var s = this.labels[r];
      if (
        (e.label == null || s.name === e.label.name) &&
        ((s.kind != null && (i || s.kind === "loop")) || (e.label && i))
      )
        break;
    }
    return (
      r === this.labels.length && this.raise(e.start, "Unsyntactic " + t),
      this.finishNode(e, i ? "BreakStatement" : "ContinueStatement")
    );
  };
  w.parseDebuggerStatement = function (e) {
    return (
      this.next(), this.semicolon(), this.finishNode(e, "DebuggerStatement")
    );
  };
  w.parseDoStatement = function (e) {
    return (
      this.next(),
      this.labels.push(Wt),
      (e.body = this.parseStatement("do")),
      this.labels.pop(),
      this.expect(o._while),
      (e.test = this.parseParenExpression()),
      this.options.ecmaVersion >= 6 ? this.eat(o.semi) : this.semicolon(),
      this.finishNode(e, "DoWhileStatement")
    );
  };
  w.parseForStatement = function (e) {
    this.next();
    var t =
      this.options.ecmaVersion >= 9 &&
      this.canAwait &&
      this.eatContextual("await")
        ? this.lastTokStart
        : -1;
    if (
      (this.labels.push(Wt),
      this.enterScope(0),
      this.expect(o.parenL),
      this.type === o.semi)
    )
      return t > -1 && this.unexpected(t), this.parseFor(e, null);
    var i = this.isLet();
    if (this.type === o._var || this.type === o._const || i) {
      var r = this.startNode(),
        s = i ? "let" : this.value;
      return (
        this.next(),
        this.parseVar(r, !0, s),
        this.finishNode(r, "VariableDeclaration"),
        (this.type === o._in ||
          (this.options.ecmaVersion >= 6 && this.isContextual("of"))) &&
        r.declarations.length === 1
          ? (this.options.ecmaVersion >= 9 &&
              (this.type === o._in
                ? t > -1 && this.unexpected(t)
                : (e.await = t > -1)),
            this.parseForIn(e, r))
          : (t > -1 && this.unexpected(t), this.parseFor(e, r))
      );
    }
    var a = this.isContextual("let"),
      n = !1,
      u = new nt(),
      c = this.parseExpression(t > -1 ? "await" : !0, u);
    return this.type === o._in ||
      (n = this.options.ecmaVersion >= 6 && this.isContextual("of"))
      ? (this.options.ecmaVersion >= 9 &&
          (this.type === o._in
            ? t > -1 && this.unexpected(t)
            : (e.await = t > -1)),
        a &&
          n &&
          this.raise(
            c.start,
            "The left-hand side of a for-of loop may not start with 'let'."
          ),
        this.toAssignable(c, !1, u),
        this.checkLValPattern(c),
        this.parseForIn(e, c))
      : (this.checkExpressionErrors(u, !0),
        t > -1 && this.unexpected(t),
        this.parseFor(e, c));
  };
  w.parseFunctionStatement = function (e, t, i) {
    return this.next(), this.parseFunction(e, Re | (i ? 0 : Vt), !1, t);
  };
  w.parseIfStatement = function (e) {
    return (
      this.next(),
      (e.test = this.parseParenExpression()),
      (e.consequent = this.parseStatement("if")),
      (e.alternate = this.eat(o._else) ? this.parseStatement("if") : null),
      this.finishNode(e, "IfStatement")
    );
  };
  w.parseReturnStatement = function (e) {
    return (
      !this.inFunction &&
        !this.options.allowReturnOutsideFunction &&
        this.raise(this.start, "'return' outside of function"),
      this.next(),
      this.eat(o.semi) || this.insertSemicolon()
        ? (e.argument = null)
        : ((e.argument = this.parseExpression()), this.semicolon()),
      this.finishNode(e, "ReturnStatement")
    );
  };
  w.parseSwitchStatement = function (e) {
    this.next(),
      (e.discriminant = this.parseParenExpression()),
      (e.cases = []),
      this.expect(o.braceL),
      this.labels.push(da),
      this.enterScope(0);
    for (var t, i = !1; this.type !== o.braceR; )
      if (this.type === o._case || this.type === o._default) {
        var r = this.type === o._case;
        t && this.finishNode(t, "SwitchCase"),
          e.cases.push((t = this.startNode())),
          (t.consequent = []),
          this.next(),
          r
            ? (t.test = this.parseExpression())
            : (i &&
                this.raiseRecoverable(
                  this.lastTokStart,
                  "Multiple default clauses"
                ),
              (i = !0),
              (t.test = null)),
          this.expect(o.colon);
      } else
        t || this.unexpected(), t.consequent.push(this.parseStatement(null));
    return (
      this.exitScope(),
      t && this.finishNode(t, "SwitchCase"),
      this.next(),
      this.labels.pop(),
      this.finishNode(e, "SwitchStatement")
    );
  };
  w.parseThrowStatement = function (e) {
    return (
      this.next(),
      Z.test(this.input.slice(this.lastTokEnd, this.start)) &&
        this.raise(this.lastTokEnd, "Illegal newline after throw"),
      (e.argument = this.parseExpression()),
      this.semicolon(),
      this.finishNode(e, "ThrowStatement")
    );
  };
  var ma = [];
  w.parseCatchClauseParam = function () {
    var e = this.parseBindingAtom(),
      t = e.type === "Identifier";
    return (
      this.enterScope(t ? pr : 0),
      this.checkLValPattern(e, t ? gr : le),
      this.expect(o.parenR),
      e
    );
  };
  w.parseTryStatement = function (e) {
    if (
      (this.next(),
      (e.block = this.parseBlock()),
      (e.handler = null),
      this.type === o._catch)
    ) {
      var t = this.startNode();
      this.next(),
        this.eat(o.parenL)
          ? (t.param = this.parseCatchClauseParam())
          : (this.options.ecmaVersion < 10 && this.unexpected(),
            (t.param = null),
            this.enterScope(0)),
        (t.body = this.parseBlock(!1)),
        this.exitScope(),
        (e.handler = this.finishNode(t, "CatchClause"));
    }
    return (
      (e.finalizer = this.eat(o._finally) ? this.parseBlock() : null),
      !e.handler &&
        !e.finalizer &&
        this.raise(e.start, "Missing catch or finally clause"),
      this.finishNode(e, "TryStatement")
    );
  };
  w.parseVarStatement = function (e, t, i) {
    return (
      this.next(),
      this.parseVar(e, !1, t, i),
      this.semicolon(),
      this.finishNode(e, "VariableDeclaration")
    );
  };
  w.parseWhileStatement = function (e) {
    return (
      this.next(),
      (e.test = this.parseParenExpression()),
      this.labels.push(Wt),
      (e.body = this.parseStatement("while")),
      this.labels.pop(),
      this.finishNode(e, "WhileStatement")
    );
  };
  w.parseWithStatement = function (e) {
    return (
      this.strict && this.raise(this.start, "'with' in strict mode"),
      this.next(),
      (e.object = this.parseParenExpression()),
      (e.body = this.parseStatement("with")),
      this.finishNode(e, "WithStatement")
    );
  };
  w.parseEmptyStatement = function (e) {
    return this.next(), this.finishNode(e, "EmptyStatement");
  };
  w.parseLabeledStatement = function (e, t, i, r) {
    for (var s = 0, a = this.labels; s < a.length; s += 1) {
      var n = a[s];
      n.name === t &&
        this.raise(i.start, "Label '" + t + "' is already declared");
    }
    for (
      var u = this.type.isLoop
          ? "loop"
          : this.type === o._switch
            ? "switch"
            : null,
        c = this.labels.length - 1;
      c >= 0;
      c--
    ) {
      var l = this.labels[c];
      if (l.statementStart === e.start)
        (l.statementStart = this.start), (l.kind = u);
      else break;
    }
    return (
      this.labels.push({ name: t, kind: u, statementStart: this.start }),
      (e.body = this.parseStatement(
        r ? (r.indexOf("label") === -1 ? r + "label" : r) : "label"
      )),
      this.labels.pop(),
      (e.label = i),
      this.finishNode(e, "LabeledStatement")
    );
  };
  w.parseExpressionStatement = function (e, t) {
    return (
      (e.expression = t),
      this.semicolon(),
      this.finishNode(e, "ExpressionStatement")
    );
  };
  w.parseBlock = function (e, t, i) {
    for (
      e === void 0 && (e = !0),
        t === void 0 && (t = this.startNode()),
        t.body = [],
        this.expect(o.braceL),
        e && this.enterScope(0);
      this.type !== o.braceR;

    ) {
      var r = this.parseStatement(null);
      t.body.push(r);
    }
    return (
      i && (this.strict = !1),
      this.next(),
      e && this.exitScope(),
      this.finishNode(t, "BlockStatement")
    );
  };
  w.parseFor = function (e, t) {
    return (
      (e.init = t),
      this.expect(o.semi),
      (e.test = this.type === o.semi ? null : this.parseExpression()),
      this.expect(o.semi),
      (e.update = this.type === o.parenR ? null : this.parseExpression()),
      this.expect(o.parenR),
      (e.body = this.parseStatement("for")),
      this.exitScope(),
      this.labels.pop(),
      this.finishNode(e, "ForStatement")
    );
  };
  w.parseForIn = function (e, t) {
    var i = this.type === o._in;
    return (
      this.next(),
      t.type === "VariableDeclaration" &&
        t.declarations[0].init != null &&
        (!i ||
          this.options.ecmaVersion < 8 ||
          this.strict ||
          t.kind !== "var" ||
          t.declarations[0].id.type !== "Identifier") &&
        this.raise(
          t.start,
          (i ? "for-in" : "for-of") +
            " loop variable declaration may not have an initializer"
        ),
      (e.left = t),
      (e.right = i ? this.parseExpression() : this.parseMaybeAssign()),
      this.expect(o.parenR),
      (e.body = this.parseStatement("for")),
      this.exitScope(),
      this.labels.pop(),
      this.finishNode(e, i ? "ForInStatement" : "ForOfStatement")
    );
  };
  w.parseVar = function (e, t, i, r) {
    for (e.declarations = [], e.kind = i; ; ) {
      var s = this.startNode();
      if (
        (this.parseVarId(s, i),
        this.eat(o.eq)
          ? (s.init = this.parseMaybeAssign(t))
          : !r &&
              i === "const" &&
              !(
                this.type === o._in ||
                (this.options.ecmaVersion >= 6 && this.isContextual("of"))
              )
            ? this.unexpected()
            : !r &&
                s.id.type !== "Identifier" &&
                !(t && (this.type === o._in || this.isContextual("of")))
              ? this.raise(
                  this.lastTokEnd,
                  "Complex binding patterns require an initialization value"
                )
              : (s.init = null),
        e.declarations.push(this.finishNode(s, "VariableDeclarator")),
        !this.eat(o.comma))
      )
        break;
    }
    return e;
  };
  w.parseVarId = function (e, t) {
    (e.id = this.parseBindingAtom()),
      this.checkLValPattern(e.id, t === "var" ? Ht : le, !1);
  };
  var Re = 1,
    Vt = 2,
    yr = 4;
  w.parseFunction = function (e, t, i, r, s) {
    this.initFunction(e),
      (this.options.ecmaVersion >= 9 ||
        (this.options.ecmaVersion >= 6 && !r)) &&
        (this.type === o.star && t & Vt && this.unexpected(),
        (e.generator = this.eat(o.star))),
      this.options.ecmaVersion >= 8 && (e.async = !!r),
      t & Re &&
        ((e.id = t & yr && this.type !== o.name ? null : this.parseIdent()),
        e.id &&
          !(t & Vt) &&
          this.checkLValSimple(
            e.id,
            this.strict || e.generator || e.async
              ? this.treatFunctionsAsVar
                ? Ht
                : le
              : mr
          ));
    var a = this.yieldPos,
      n = this.awaitPos,
      u = this.awaitIdentPos;
    return (
      (this.yieldPos = 0),
      (this.awaitPos = 0),
      (this.awaitIdentPos = 0),
      this.enterScope($t(e.async, e.generator)),
      t & Re || (e.id = this.type === o.name ? this.parseIdent() : null),
      this.parseFunctionParams(e),
      this.parseFunctionBody(e, i, !1, s),
      (this.yieldPos = a),
      (this.awaitPos = n),
      (this.awaitIdentPos = u),
      this.finishNode(e, t & Re ? "FunctionDeclaration" : "FunctionExpression")
    );
  };
  w.parseFunctionParams = function (e) {
    this.expect(o.parenL),
      (e.params = this.parseBindingList(
        o.parenR,
        !1,
        this.options.ecmaVersion >= 8
      )),
      this.checkYieldAwaitInDefaultParams();
  };
  w.parseClass = function (e, t) {
    this.next();
    var i = this.strict;
    (this.strict = !0), this.parseClassId(e, t), this.parseClassSuper(e);
    var r = this.enterClassBody(),
      s = this.startNode(),
      a = !1;
    for (s.body = [], this.expect(o.braceL); this.type !== o.braceR; ) {
      var n = this.parseClassElement(e.superClass !== null);
      n &&
        (s.body.push(n),
        n.type === "MethodDefinition" && n.kind === "constructor"
          ? (a &&
              this.raiseRecoverable(
                n.start,
                "Duplicate constructor in the same class"
              ),
            (a = !0))
          : n.key &&
            n.key.type === "PrivateIdentifier" &&
            ga(r, n) &&
            this.raiseRecoverable(
              n.key.start,
              "Identifier '#" + n.key.name + "' has already been declared"
            ));
    }
    return (
      (this.strict = i),
      this.next(),
      (e.body = this.finishNode(s, "ClassBody")),
      this.exitClassBody(),
      this.finishNode(e, t ? "ClassDeclaration" : "ClassExpression")
    );
  };
  w.parseClassElement = function (e) {
    if (this.eat(o.semi)) return null;
    var t = this.options.ecmaVersion,
      i = this.startNode(),
      r = "",
      s = !1,
      a = !1,
      n = "method",
      u = !1;
    if (this.eatContextual("static")) {
      if (t >= 13 && this.eat(o.braceL))
        return this.parseClassStaticBlock(i), i;
      this.isClassElementNameStart() || this.type === o.star
        ? (u = !0)
        : (r = "static");
    }
    if (
      ((i.static = u),
      !r &&
        t >= 8 &&
        this.eatContextual("async") &&
        ((this.isClassElementNameStart() || this.type === o.star) &&
        !this.canInsertSemicolon()
          ? (a = !0)
          : (r = "async")),
      !r && (t >= 9 || !a) && this.eat(o.star) && (s = !0),
      !r && !a && !s)
    ) {
      var c = this.value;
      (this.eatContextual("get") || this.eatContextual("set")) &&
        (this.isClassElementNameStart() ? (n = c) : (r = c));
    }
    if (
      (r
        ? ((i.computed = !1),
          (i.key = this.startNodeAt(this.lastTokStart, this.lastTokStartLoc)),
          (i.key.name = r),
          this.finishNode(i.key, "Identifier"))
        : this.parseClassElementName(i),
      t < 13 || this.type === o.parenL || n !== "method" || s || a)
    ) {
      var l = !i.static && rt(i, "constructor"),
        h = l && e;
      l &&
        n !== "method" &&
        this.raise(i.key.start, "Constructor can't have get/set modifier"),
        (i.kind = l ? "constructor" : n),
        this.parseClassMethod(i, s, a, h);
    } else this.parseClassField(i);
    return i;
  };
  w.isClassElementNameStart = function () {
    return (
      this.type === o.name ||
      this.type === o.privateId ||
      this.type === o.num ||
      this.type === o.string ||
      this.type === o.bracketL ||
      this.type.keyword
    );
  };
  w.parseClassElementName = function (e) {
    this.type === o.privateId
      ? (this.value === "constructor" &&
          this.raise(
            this.start,
            "Classes can't have an element named '#constructor'"
          ),
        (e.computed = !1),
        (e.key = this.parsePrivateIdent()))
      : this.parsePropertyName(e);
  };
  w.parseClassMethod = function (e, t, i, r) {
    var s = e.key;
    e.kind === "constructor"
      ? (t && this.raise(s.start, "Constructor can't be a generator"),
        i && this.raise(s.start, "Constructor can't be an async method"))
      : e.static &&
        rt(e, "prototype") &&
        this.raise(
          s.start,
          "Classes may not have a static property named prototype"
        );
    var a = (e.value = this.parseMethod(t, i, r));
    return (
      e.kind === "get" &&
        a.params.length !== 0 &&
        this.raiseRecoverable(a.start, "getter should have no params"),
      e.kind === "set" &&
        a.params.length !== 1 &&
        this.raiseRecoverable(a.start, "setter should have exactly one param"),
      e.kind === "set" &&
        a.params[0].type === "RestElement" &&
        this.raiseRecoverable(
          a.params[0].start,
          "Setter cannot use rest params"
        ),
      this.finishNode(e, "MethodDefinition")
    );
  };
  w.parseClassField = function (e) {
    if (
      (rt(e, "constructor")
        ? this.raise(
            e.key.start,
            "Classes can't have a field named 'constructor'"
          )
        : e.static &&
          rt(e, "prototype") &&
          this.raise(
            e.key.start,
            "Classes can't have a static field named 'prototype'"
          ),
      this.eat(o.eq))
    ) {
      var t = this.currentThisScope(),
        i = t.inClassFieldInit;
      (t.inClassFieldInit = !0),
        (e.value = this.parseMaybeAssign()),
        (t.inClassFieldInit = i);
    } else e.value = null;
    return this.semicolon(), this.finishNode(e, "PropertyDefinition");
  };
  w.parseClassStaticBlock = function (e) {
    e.body = [];
    var t = this.labels;
    for (this.labels = [], this.enterScope(De | Ft); this.type !== o.braceR; ) {
      var i = this.parseStatement(null);
      e.body.push(i);
    }
    return (
      this.next(),
      this.exitScope(),
      (this.labels = t),
      this.finishNode(e, "StaticBlock")
    );
  };
  w.parseClassId = function (e, t) {
    this.type === o.name
      ? ((e.id = this.parseIdent()), t && this.checkLValSimple(e.id, le, !1))
      : (t === !0 && this.unexpected(), (e.id = null));
  };
  w.parseClassSuper = function (e) {
    e.superClass = this.eat(o._extends)
      ? this.parseExprSubscripts(null, !1)
      : null;
  };
  w.enterClassBody = function () {
    var e = { declared: Object.create(null), used: [] };
    return this.privateNameStack.push(e), e.declared;
  };
  w.exitClassBody = function () {
    var e = this.privateNameStack.pop(),
      t = e.declared,
      i = e.used;
    if (this.options.checkPrivateFields)
      for (
        var r = this.privateNameStack.length,
          s = r === 0 ? null : this.privateNameStack[r - 1],
          a = 0;
        a < i.length;
        ++a
      ) {
        var n = i[a];
        Te(t, n.name) ||
          (s
            ? s.used.push(n)
            : this.raiseRecoverable(
                n.start,
                "Private field '#" +
                  n.name +
                  "' must be declared in an enclosing class"
              ));
      }
  };
  function ga(e, t) {
    var i = t.key.name,
      r = e[i],
      s = "true";
    return (
      t.type === "MethodDefinition" &&
        (t.kind === "get" || t.kind === "set") &&
        (s = (t.static ? "s" : "i") + t.kind),
      (r === "iget" && s === "iset") ||
      (r === "iset" && s === "iget") ||
      (r === "sget" && s === "sset") ||
      (r === "sset" && s === "sget")
        ? ((e[i] = "true"), !1)
        : r
          ? !0
          : ((e[i] = s), !1)
    );
  }
  function rt(e, t) {
    var i = e.computed,
      r = e.key;
    return (
      !i &&
      ((r.type === "Identifier" && r.name === t) ||
        (r.type === "Literal" && r.value === t))
    );
  }
  w.parseExportAllDeclaration = function (e, t) {
    return (
      this.options.ecmaVersion >= 11 &&
        (this.eatContextual("as")
          ? ((e.exported = this.parseModuleExportName()),
            this.checkExport(t, e.exported, this.lastTokStart))
          : (e.exported = null)),
      this.expectContextual("from"),
      this.type !== o.string && this.unexpected(),
      (e.source = this.parseExprAtom()),
      this.semicolon(),
      this.finishNode(e, "ExportAllDeclaration")
    );
  };
  w.parseExport = function (e, t) {
    if ((this.next(), this.eat(o.star)))
      return this.parseExportAllDeclaration(e, t);
    if (this.eat(o._default))
      return (
        this.checkExport(t, "default", this.lastTokStart),
        (e.declaration = this.parseExportDefaultDeclaration()),
        this.finishNode(e, "ExportDefaultDeclaration")
      );
    if (this.shouldParseExportStatement())
      (e.declaration = this.parseExportDeclaration(e)),
        e.declaration.type === "VariableDeclaration"
          ? this.checkVariableExport(t, e.declaration.declarations)
          : this.checkExport(t, e.declaration.id, e.declaration.id.start),
        (e.specifiers = []),
        (e.source = null);
    else {
      if (
        ((e.declaration = null),
        (e.specifiers = this.parseExportSpecifiers(t)),
        this.eatContextual("from"))
      )
        this.type !== o.string && this.unexpected(),
          (e.source = this.parseExprAtom());
      else {
        for (var i = 0, r = e.specifiers; i < r.length; i += 1) {
          var s = r[i];
          this.checkUnreserved(s.local),
            this.checkLocalExport(s.local),
            s.local.type === "Literal" &&
              this.raise(
                s.local.start,
                "A string literal cannot be used as an exported binding without `from`."
              );
        }
        e.source = null;
      }
      this.semicolon();
    }
    return this.finishNode(e, "ExportNamedDeclaration");
  };
  w.parseExportDeclaration = function (e) {
    return this.parseStatement(null);
  };
  w.parseExportDefaultDeclaration = function () {
    var e;
    if (this.type === o._function || (e = this.isAsyncFunction())) {
      var t = this.startNode();
      return (
        this.next(), e && this.next(), this.parseFunction(t, Re | yr, !1, e)
      );
    } else if (this.type === o._class) {
      var i = this.startNode();
      return this.parseClass(i, "nullableID");
    } else {
      var r = this.parseMaybeAssign();
      return this.semicolon(), r;
    }
  };
  w.checkExport = function (e, t, i) {
    e &&
      (typeof t != "string" && (t = t.type === "Identifier" ? t.name : t.value),
      Te(e, t) && this.raiseRecoverable(i, "Duplicate export '" + t + "'"),
      (e[t] = !0));
  };
  w.checkPatternExport = function (e, t) {
    var i = t.type;
    if (i === "Identifier") this.checkExport(e, t, t.start);
    else if (i === "ObjectPattern")
      for (var r = 0, s = t.properties; r < s.length; r += 1) {
        var a = s[r];
        this.checkPatternExport(e, a);
      }
    else if (i === "ArrayPattern")
      for (var n = 0, u = t.elements; n < u.length; n += 1) {
        var c = u[n];
        c && this.checkPatternExport(e, c);
      }
    else
      i === "Property"
        ? this.checkPatternExport(e, t.value)
        : i === "AssignmentPattern"
          ? this.checkPatternExport(e, t.left)
          : i === "RestElement"
            ? this.checkPatternExport(e, t.argument)
            : i === "ParenthesizedExpression" &&
              this.checkPatternExport(e, t.expression);
  };
  w.checkVariableExport = function (e, t) {
    if (e)
      for (var i = 0, r = t; i < r.length; i += 1) {
        var s = r[i];
        this.checkPatternExport(e, s.id);
      }
  };
  w.shouldParseExportStatement = function () {
    return (
      this.type.keyword === "var" ||
      this.type.keyword === "const" ||
      this.type.keyword === "class" ||
      this.type.keyword === "function" ||
      this.isLet() ||
      this.isAsyncFunction()
    );
  };
  w.parseExportSpecifier = function (e) {
    var t = this.startNode();
    return (
      (t.local = this.parseModuleExportName()),
      (t.exported = this.eatContextual("as")
        ? this.parseModuleExportName()
        : t.local),
      this.checkExport(e, t.exported, t.exported.start),
      this.finishNode(t, "ExportSpecifier")
    );
  };
  w.parseExportSpecifiers = function (e) {
    var t = [],
      i = !0;
    for (this.expect(o.braceL); !this.eat(o.braceR); ) {
      if (i) i = !1;
      else if ((this.expect(o.comma), this.afterTrailingComma(o.braceR))) break;
      t.push(this.parseExportSpecifier(e));
    }
    return t;
  };
  w.parseImport = function (e) {
    return (
      this.next(),
      this.type === o.string
        ? ((e.specifiers = ma), (e.source = this.parseExprAtom()))
        : ((e.specifiers = this.parseImportSpecifiers()),
          this.expectContextual("from"),
          (e.source =
            this.type === o.string ? this.parseExprAtom() : this.unexpected())),
      this.semicolon(),
      this.finishNode(e, "ImportDeclaration")
    );
  };
  w.parseImportSpecifier = function () {
    var e = this.startNode();
    return (
      (e.imported = this.parseModuleExportName()),
      this.eatContextual("as")
        ? (e.local = this.parseIdent())
        : (this.checkUnreserved(e.imported), (e.local = e.imported)),
      this.checkLValSimple(e.local, le),
      this.finishNode(e, "ImportSpecifier")
    );
  };
  w.parseImportDefaultSpecifier = function () {
    var e = this.startNode();
    return (
      (e.local = this.parseIdent()),
      this.checkLValSimple(e.local, le),
      this.finishNode(e, "ImportDefaultSpecifier")
    );
  };
  w.parseImportNamespaceSpecifier = function () {
    var e = this.startNode();
    return (
      this.next(),
      this.expectContextual("as"),
      (e.local = this.parseIdent()),
      this.checkLValSimple(e.local, le),
      this.finishNode(e, "ImportNamespaceSpecifier")
    );
  };
  w.parseImportSpecifiers = function () {
    var e = [],
      t = !0;
    if (
      this.type === o.name &&
      (e.push(this.parseImportDefaultSpecifier()), !this.eat(o.comma))
    )
      return e;
    if (this.type === o.star)
      return e.push(this.parseImportNamespaceSpecifier()), e;
    for (this.expect(o.braceL); !this.eat(o.braceR); ) {
      if (t) t = !1;
      else if ((this.expect(o.comma), this.afterTrailingComma(o.braceR))) break;
      e.push(this.parseImportSpecifier());
    }
    return e;
  };
  w.parseModuleExportName = function () {
    if (this.options.ecmaVersion >= 13 && this.type === o.string) {
      var e = this.parseLiteral(this.value);
      return (
        la.test(e.value) &&
          this.raise(
            e.start,
            "An export name cannot include a lone surrogate."
          ),
        e
      );
    }
    return this.parseIdent(!0);
  };
  w.adaptDirectivePrologue = function (e) {
    for (var t = 0; t < e.length && this.isDirectiveCandidate(e[t]); ++t)
      e[t].directive = e[t].expression.raw.slice(1, -1);
  };
  w.isDirectiveCandidate = function (e) {
    return (
      this.options.ecmaVersion >= 5 &&
      e.type === "ExpressionStatement" &&
      e.expression.type === "Literal" &&
      typeof e.expression.value == "string" &&
      (this.input[e.start] === '"' || this.input[e.start] === "'")
    );
  };
  var ee = T.prototype;
  ee.toAssignable = function (e, t, i) {
    if (this.options.ecmaVersion >= 6 && e)
      switch (e.type) {
        case "Identifier":
          this.inAsync &&
            e.name === "await" &&
            this.raise(
              e.start,
              "Cannot use 'await' as identifier inside an async function"
            );
          break;
        case "ObjectPattern":
        case "ArrayPattern":
        case "AssignmentPattern":
        case "RestElement":
          break;
        case "ObjectExpression":
          (e.type = "ObjectPattern"), i && this.checkPatternErrors(i, !0);
          for (var r = 0, s = e.properties; r < s.length; r += 1) {
            var a = s[r];
            this.toAssignable(a, t),
              a.type === "RestElement" &&
                (a.argument.type === "ArrayPattern" ||
                  a.argument.type === "ObjectPattern") &&
                this.raise(a.argument.start, "Unexpected token");
          }
          break;
        case "Property":
          e.kind !== "init" &&
            this.raise(
              e.key.start,
              "Object pattern can't contain getter or setter"
            ),
            this.toAssignable(e.value, t);
          break;
        case "ArrayExpression":
          (e.type = "ArrayPattern"),
            i && this.checkPatternErrors(i, !0),
            this.toAssignableList(e.elements, t);
          break;
        case "SpreadElement":
          (e.type = "RestElement"),
            this.toAssignable(e.argument, t),
            e.argument.type === "AssignmentPattern" &&
              this.raise(
                e.argument.start,
                "Rest elements cannot have a default value"
              );
          break;
        case "AssignmentExpression":
          e.operator !== "=" &&
            this.raise(
              e.left.end,
              "Only '=' operator can be used for specifying default value."
            ),
            (e.type = "AssignmentPattern"),
            delete e.operator,
            this.toAssignable(e.left, t);
          break;
        case "ParenthesizedExpression":
          this.toAssignable(e.expression, t, i);
          break;
        case "ChainExpression":
          this.raiseRecoverable(
            e.start,
            "Optional chaining cannot appear in left-hand side"
          );
          break;
        case "MemberExpression":
          if (!t) break;
        default:
          this.raise(e.start, "Assigning to rvalue");
      }
    else i && this.checkPatternErrors(i, !0);
    return e;
  };
  ee.toAssignableList = function (e, t) {
    for (var i = e.length, r = 0; r < i; r++) {
      var s = e[r];
      s && this.toAssignable(s, t);
    }
    if (i) {
      var a = e[i - 1];
      this.options.ecmaVersion === 6 &&
        t &&
        a &&
        a.type === "RestElement" &&
        a.argument.type !== "Identifier" &&
        this.unexpected(a.argument.start);
    }
    return e;
  };
  ee.parseSpread = function (e) {
    var t = this.startNode();
    return (
      this.next(),
      (t.argument = this.parseMaybeAssign(!1, e)),
      this.finishNode(t, "SpreadElement")
    );
  };
  ee.parseRestBinding = function () {
    var e = this.startNode();
    return (
      this.next(),
      this.options.ecmaVersion === 6 &&
        this.type !== o.name &&
        this.unexpected(),
      (e.argument = this.parseBindingAtom()),
      this.finishNode(e, "RestElement")
    );
  };
  ee.parseBindingAtom = function () {
    if (this.options.ecmaVersion >= 6)
      switch (this.type) {
        case o.bracketL:
          var e = this.startNode();
          return (
            this.next(),
            (e.elements = this.parseBindingList(o.bracketR, !0, !0)),
            this.finishNode(e, "ArrayPattern")
          );
        case o.braceL:
          return this.parseObj(!0);
      }
    return this.parseIdent();
  };
  ee.parseBindingList = function (e, t, i, r) {
    for (var s = [], a = !0; !this.eat(e); )
      if ((a ? (a = !1) : this.expect(o.comma), t && this.type === o.comma))
        s.push(null);
      else {
        if (i && this.afterTrailingComma(e)) break;
        if (this.type === o.ellipsis) {
          var n = this.parseRestBinding();
          this.parseBindingListItem(n),
            s.push(n),
            this.type === o.comma &&
              this.raiseRecoverable(
                this.start,
                "Comma is not permitted after the rest element"
              ),
            this.expect(e);
          break;
        } else s.push(this.parseAssignableListItem(r));
      }
    return s;
  };
  ee.parseAssignableListItem = function (e) {
    var t = this.parseMaybeDefault(this.start, this.startLoc);
    return this.parseBindingListItem(t), t;
  };
  ee.parseBindingListItem = function (e) {
    return e;
  };
  ee.parseMaybeDefault = function (e, t, i) {
    if (
      ((i = i || this.parseBindingAtom()),
      this.options.ecmaVersion < 6 || !this.eat(o.eq))
    )
      return i;
    var r = this.startNodeAt(e, t);
    return (
      (r.left = i),
      (r.right = this.parseMaybeAssign()),
      this.finishNode(r, "AssignmentPattern")
    );
  };
  ee.checkLValSimple = function (e, t, i) {
    t === void 0 && (t = it);
    var r = t !== it;
    switch (e.type) {
      case "Identifier":
        this.strict &&
          this.reservedWordsStrictBind.test(e.name) &&
          this.raiseRecoverable(
            e.start,
            (r ? "Binding " : "Assigning to ") + e.name + " in strict mode"
          ),
          r &&
            (t === le &&
              e.name === "let" &&
              this.raiseRecoverable(
                e.start,
                "let is disallowed as a lexically bound name"
              ),
            i &&
              (Te(i, e.name) &&
                this.raiseRecoverable(e.start, "Argument name clash"),
              (i[e.name] = !0)),
            t !== xr && this.declareName(e.name, t, e.start));
        break;
      case "ChainExpression":
        this.raiseRecoverable(
          e.start,
          "Optional chaining cannot appear in left-hand side"
        );
        break;
      case "MemberExpression":
        r && this.raiseRecoverable(e.start, "Binding member expression");
        break;
      case "ParenthesizedExpression":
        return (
          r &&
            this.raiseRecoverable(e.start, "Binding parenthesized expression"),
          this.checkLValSimple(e.expression, t, i)
        );
      default:
        this.raise(e.start, (r ? "Binding" : "Assigning to") + " rvalue");
    }
  };
  ee.checkLValPattern = function (e, t, i) {
    switch ((t === void 0 && (t = it), e.type)) {
      case "ObjectPattern":
        for (var r = 0, s = e.properties; r < s.length; r += 1) {
          var a = s[r];
          this.checkLValInnerPattern(a, t, i);
        }
        break;
      case "ArrayPattern":
        for (var n = 0, u = e.elements; n < u.length; n += 1) {
          var c = u[n];
          c && this.checkLValInnerPattern(c, t, i);
        }
        break;
      default:
        this.checkLValSimple(e, t, i);
    }
  };
  ee.checkLValInnerPattern = function (e, t, i) {
    switch ((t === void 0 && (t = it), e.type)) {
      case "Property":
        this.checkLValInnerPattern(e.value, t, i);
        break;
      case "AssignmentPattern":
        this.checkLValPattern(e.left, t, i);
        break;
      case "RestElement":
        this.checkLValPattern(e.argument, t, i);
        break;
      default:
        this.checkLValPattern(e, t, i);
    }
  };
  var te = function (t, i, r, s, a) {
      (this.token = t),
        (this.isExpr = !!i),
        (this.preserveSpace = !!r),
        (this.override = s),
        (this.generator = !!a);
    },
    N = {
      b_stat: new te("{", !1),
      b_expr: new te("{", !0),
      b_tmpl: new te("${", !1),
      p_stat: new te("(", !1),
      p_expr: new te("(", !0),
      q_tmpl: new te("`", !0, !0, function (e) {
        return e.tryReadTemplateToken();
      }),
      f_stat: new te("function", !1),
      f_expr: new te("function", !0),
      f_expr_gen: new te("function", !0, !1, null, !0),
      f_gen: new te("function", !1, !1, null, !0),
    },
    Ce = T.prototype;
  Ce.initialContext = function () {
    return [N.b_stat];
  };
  Ce.curContext = function () {
    return this.context[this.context.length - 1];
  };
  Ce.braceIsBlock = function (e) {
    var t = this.curContext();
    return t === N.f_expr || t === N.f_stat
      ? !0
      : e === o.colon && (t === N.b_stat || t === N.b_expr)
        ? !t.isExpr
        : e === o._return || (e === o.name && this.exprAllowed)
          ? Z.test(this.input.slice(this.lastTokEnd, this.start))
          : e === o._else ||
              e === o.semi ||
              e === o.eof ||
              e === o.parenR ||
              e === o.arrow
            ? !0
            : e === o.braceL
              ? t === N.b_stat
              : e === o._var || e === o._const || e === o.name
                ? !1
                : !this.exprAllowed;
  };
  Ce.inGeneratorContext = function () {
    for (var e = this.context.length - 1; e >= 1; e--) {
      var t = this.context[e];
      if (t.token === "function") return t.generator;
    }
    return !1;
  };
  Ce.updateContext = function (e) {
    var t,
      i = this.type;
    i.keyword && e === o.dot
      ? (this.exprAllowed = !1)
      : (t = i.updateContext)
        ? t.call(this, e)
        : (this.exprAllowed = i.beforeExpr);
  };
  Ce.overrideContext = function (e) {
    this.curContext() !== e && (this.context[this.context.length - 1] = e);
  };
  o.parenR.updateContext = o.braceR.updateContext = function () {
    if (this.context.length === 1) {
      this.exprAllowed = !0;
      return;
    }
    var e = this.context.pop();
    e === N.b_stat &&
      this.curContext().token === "function" &&
      (e = this.context.pop()),
      (this.exprAllowed = !e.isExpr);
  };
  o.braceL.updateContext = function (e) {
    this.context.push(this.braceIsBlock(e) ? N.b_stat : N.b_expr),
      (this.exprAllowed = !0);
  };
  o.dollarBraceL.updateContext = function () {
    this.context.push(N.b_tmpl), (this.exprAllowed = !0);
  };
  o.parenL.updateContext = function (e) {
    var t = e === o._if || e === o._for || e === o._with || e === o._while;
    this.context.push(t ? N.p_stat : N.p_expr), (this.exprAllowed = !0);
  };
  o.incDec.updateContext = function () {};
  o._function.updateContext = o._class.updateContext = function (e) {
    e.beforeExpr &&
    e !== o._else &&
    !(e === o.semi && this.curContext() !== N.p_stat) &&
    !(
      e === o._return && Z.test(this.input.slice(this.lastTokEnd, this.start))
    ) &&
    !((e === o.colon || e === o.braceL) && this.curContext() === N.b_stat)
      ? this.context.push(N.f_expr)
      : this.context.push(N.f_stat),
      (this.exprAllowed = !1);
  };
  o.backQuote.updateContext = function () {
    this.curContext() === N.q_tmpl
      ? this.context.pop()
      : this.context.push(N.q_tmpl),
      (this.exprAllowed = !1);
  };
  o.star.updateContext = function (e) {
    if (e === o._function) {
      var t = this.context.length - 1;
      this.context[t] === N.f_expr
        ? (this.context[t] = N.f_expr_gen)
        : (this.context[t] = N.f_gen);
    }
    this.exprAllowed = !0;
  };
  o.name.updateContext = function (e) {
    var t = !1;
    this.options.ecmaVersion >= 6 &&
      e !== o.dot &&
      ((this.value === "of" && !this.exprAllowed) ||
        (this.value === "yield" && this.inGeneratorContext())) &&
      (t = !0),
      (this.exprAllowed = t);
  };
  var _ = T.prototype;
  _.checkPropClash = function (e, t, i) {
    if (
      !(this.options.ecmaVersion >= 9 && e.type === "SpreadElement") &&
      !(
        this.options.ecmaVersion >= 6 &&
        (e.computed || e.method || e.shorthand)
      )
    ) {
      var r = e.key,
        s;
      switch (r.type) {
        case "Identifier":
          s = r.name;
          break;
        case "Literal":
          s = String(r.value);
          break;
        default:
          return;
      }
      var a = e.kind;
      if (this.options.ecmaVersion >= 6) {
        s === "__proto__" &&
          a === "init" &&
          (t.proto &&
            (i
              ? i.doubleProto < 0 && (i.doubleProto = r.start)
              : this.raiseRecoverable(
                  r.start,
                  "Redefinition of __proto__ property"
                )),
          (t.proto = !0));
        return;
      }
      s = "$" + s;
      var n = t[s];
      if (n) {
        var u;
        a === "init"
          ? (u = (this.strict && n.init) || n.get || n.set)
          : (u = n.init || n[a]),
          u && this.raiseRecoverable(r.start, "Redefinition of property");
      } else n = t[s] = { init: !1, get: !1, set: !1 };
      n[a] = !0;
    }
  };
  _.parseExpression = function (e, t) {
    var i = this.start,
      r = this.startLoc,
      s = this.parseMaybeAssign(e, t);
    if (this.type === o.comma) {
      var a = this.startNodeAt(i, r);
      for (a.expressions = [s]; this.eat(o.comma); )
        a.expressions.push(this.parseMaybeAssign(e, t));
      return this.finishNode(a, "SequenceExpression");
    }
    return s;
  };
  _.parseMaybeAssign = function (e, t, i) {
    if (this.isContextual("yield")) {
      if (this.inGenerator) return this.parseYield(e);
      this.exprAllowed = !1;
    }
    var r = !1,
      s = -1,
      a = -1,
      n = -1;
    t
      ? ((s = t.parenthesizedAssign),
        (a = t.trailingComma),
        (n = t.doubleProto),
        (t.parenthesizedAssign = t.trailingComma = -1))
      : ((t = new nt()), (r = !0));
    var u = this.start,
      c = this.startLoc;
    (this.type === o.parenL || this.type === o.name) &&
      ((this.potentialArrowAt = this.start),
      (this.potentialArrowInForAwait = e === "await"));
    var l = this.parseMaybeConditional(e, t);
    if ((i && (l = i.call(this, l, u, c)), this.type.isAssign)) {
      var h = this.startNodeAt(u, c);
      return (
        (h.operator = this.value),
        this.type === o.eq && (l = this.toAssignable(l, !1, t)),
        r || (t.parenthesizedAssign = t.trailingComma = t.doubleProto = -1),
        t.shorthandAssign >= l.start && (t.shorthandAssign = -1),
        this.type === o.eq ? this.checkLValPattern(l) : this.checkLValSimple(l),
        (h.left = l),
        this.next(),
        (h.right = this.parseMaybeAssign(e)),
        n > -1 && (t.doubleProto = n),
        this.finishNode(h, "AssignmentExpression")
      );
    } else r && this.checkExpressionErrors(t, !0);
    return (
      s > -1 && (t.parenthesizedAssign = s), a > -1 && (t.trailingComma = a), l
    );
  };
  _.parseMaybeConditional = function (e, t) {
    var i = this.start,
      r = this.startLoc,
      s = this.parseExprOps(e, t);
    if (this.checkExpressionErrors(t)) return s;
    if (this.eat(o.question)) {
      var a = this.startNodeAt(i, r);
      return (
        (a.test = s),
        (a.consequent = this.parseMaybeAssign()),
        this.expect(o.colon),
        (a.alternate = this.parseMaybeAssign(e)),
        this.finishNode(a, "ConditionalExpression")
      );
    }
    return s;
  };
  _.parseExprOps = function (e, t) {
    var i = this.start,
      r = this.startLoc,
      s = this.parseMaybeUnary(t, !1, !1, e);
    return this.checkExpressionErrors(t) ||
      (s.start === i && s.type === "ArrowFunctionExpression")
      ? s
      : this.parseExprOp(s, i, r, -1, e);
  };
  _.parseExprOp = function (e, t, i, r, s) {
    var a = this.type.binop;
    if (a != null && (!s || this.type !== o._in) && a > r) {
      var n = this.type === o.logicalOR || this.type === o.logicalAND,
        u = this.type === o.coalesce;
      u && (a = o.logicalAND.binop);
      var c = this.value;
      this.next();
      var l = this.start,
        h = this.startLoc,
        y = this.parseExprOp(this.parseMaybeUnary(null, !1, !1, s), l, h, a, s),
        S = this.buildBinary(t, i, e, y, c, n || u);
      return (
        ((n && this.type === o.coalesce) ||
          (u && (this.type === o.logicalOR || this.type === o.logicalAND))) &&
          this.raiseRecoverable(
            this.start,
            "Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses"
          ),
        this.parseExprOp(S, t, i, r, s)
      );
    }
    return e;
  };
  _.buildBinary = function (e, t, i, r, s, a) {
    r.type === "PrivateIdentifier" &&
      this.raise(
        r.start,
        "Private identifier can only be left side of binary expression"
      );
    var n = this.startNodeAt(e, t);
    return (
      (n.left = i),
      (n.operator = s),
      (n.right = r),
      this.finishNode(n, a ? "LogicalExpression" : "BinaryExpression")
    );
  };
  _.parseMaybeUnary = function (e, t, i, r) {
    var s = this.start,
      a = this.startLoc,
      n;
    if (this.isContextual("await") && this.canAwait)
      (n = this.parseAwait(r)), (t = !0);
    else if (this.type.prefix) {
      var u = this.startNode(),
        c = this.type === o.incDec;
      (u.operator = this.value),
        (u.prefix = !0),
        this.next(),
        (u.argument = this.parseMaybeUnary(null, !0, c, r)),
        this.checkExpressionErrors(e, !0),
        c
          ? this.checkLValSimple(u.argument)
          : this.strict &&
              u.operator === "delete" &&
              u.argument.type === "Identifier"
            ? this.raiseRecoverable(
                u.start,
                "Deleting local variable in strict mode"
              )
            : u.operator === "delete" && br(u.argument)
              ? this.raiseRecoverable(
                  u.start,
                  "Private fields can not be deleted"
                )
              : (t = !0),
        (n = this.finishNode(u, c ? "UpdateExpression" : "UnaryExpression"));
    } else if (!t && this.type === o.privateId)
      (r || this.privateNameStack.length === 0) &&
        this.options.checkPrivateFields &&
        this.unexpected(),
        (n = this.parsePrivateIdent()),
        this.type !== o._in && this.unexpected();
    else {
      if (((n = this.parseExprSubscripts(e, r)), this.checkExpressionErrors(e)))
        return n;
      for (; this.type.postfix && !this.canInsertSemicolon(); ) {
        var l = this.startNodeAt(s, a);
        (l.operator = this.value),
          (l.prefix = !1),
          (l.argument = n),
          this.checkLValSimple(n),
          this.next(),
          (n = this.finishNode(l, "UpdateExpression"));
      }
    }
    if (!i && this.eat(o.starstar))
      if (t) this.unexpected(this.lastTokStart);
      else
        return this.buildBinary(
          s,
          a,
          n,
          this.parseMaybeUnary(null, !1, !1, r),
          "**",
          !1
        );
    else return n;
  };
  function br(e) {
    return (
      (e.type === "MemberExpression" &&
        e.property.type === "PrivateIdentifier") ||
      (e.type === "ChainExpression" && br(e.expression))
    );
  }
  _.parseExprSubscripts = function (e, t) {
    var i = this.start,
      r = this.startLoc,
      s = this.parseExprAtom(e, t);
    if (
      s.type === "ArrowFunctionExpression" &&
      this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")"
    )
      return s;
    var a = this.parseSubscripts(s, i, r, !1, t);
    return (
      e &&
        a.type === "MemberExpression" &&
        (e.parenthesizedAssign >= a.start && (e.parenthesizedAssign = -1),
        e.parenthesizedBind >= a.start && (e.parenthesizedBind = -1),
        e.trailingComma >= a.start && (e.trailingComma = -1)),
      a
    );
  };
  _.parseSubscripts = function (e, t, i, r, s) {
    for (
      var a =
          this.options.ecmaVersion >= 8 &&
          e.type === "Identifier" &&
          e.name === "async" &&
          this.lastTokEnd === e.end &&
          !this.canInsertSemicolon() &&
          e.end - e.start === 5 &&
          this.potentialArrowAt === e.start,
        n = !1;
      ;

    ) {
      var u = this.parseSubscript(e, t, i, r, a, n, s);
      if (
        (u.optional && (n = !0),
        u === e || u.type === "ArrowFunctionExpression")
      ) {
        if (n) {
          var c = this.startNodeAt(t, i);
          (c.expression = u), (u = this.finishNode(c, "ChainExpression"));
        }
        return u;
      }
      e = u;
    }
  };
  _.shouldParseAsyncArrow = function () {
    return !this.canInsertSemicolon() && this.eat(o.arrow);
  };
  _.parseSubscriptAsyncArrow = function (e, t, i, r) {
    return this.parseArrowExpression(this.startNodeAt(e, t), i, !0, r);
  };
  _.parseSubscript = function (e, t, i, r, s, a, n) {
    var u = this.options.ecmaVersion >= 11,
      c = u && this.eat(o.questionDot);
    r &&
      c &&
      this.raise(
        this.lastTokStart,
        "Optional chaining cannot appear in the callee of new expressions"
      );
    var l = this.eat(o.bracketL);
    if (
      l ||
      (c && this.type !== o.parenL && this.type !== o.backQuote) ||
      this.eat(o.dot)
    ) {
      var h = this.startNodeAt(t, i);
      (h.object = e),
        l
          ? ((h.property = this.parseExpression()), this.expect(o.bracketR))
          : this.type === o.privateId && e.type !== "Super"
            ? (h.property = this.parsePrivateIdent())
            : (h.property = this.parseIdent(
                this.options.allowReserved !== "never"
              )),
        (h.computed = !!l),
        u && (h.optional = c),
        (e = this.finishNode(h, "MemberExpression"));
    } else if (!r && this.eat(o.parenL)) {
      var y = new nt(),
        S = this.yieldPos,
        x = this.awaitPos,
        f = this.awaitIdentPos;
      (this.yieldPos = 0), (this.awaitPos = 0), (this.awaitIdentPos = 0);
      var O = this.parseExprList(
        o.parenR,
        this.options.ecmaVersion >= 8,
        !1,
        y
      );
      if (s && !c && this.shouldParseAsyncArrow())
        return (
          this.checkPatternErrors(y, !1),
          this.checkYieldAwaitInDefaultParams(),
          this.awaitIdentPos > 0 &&
            this.raise(
              this.awaitIdentPos,
              "Cannot use 'await' as identifier inside an async function"
            ),
          (this.yieldPos = S),
          (this.awaitPos = x),
          (this.awaitIdentPos = f),
          this.parseSubscriptAsyncArrow(t, i, O, n)
        );
      this.checkExpressionErrors(y, !0),
        (this.yieldPos = S || this.yieldPos),
        (this.awaitPos = x || this.awaitPos),
        (this.awaitIdentPos = f || this.awaitIdentPos);
      var W = this.startNodeAt(t, i);
      (W.callee = e),
        (W.arguments = O),
        u && (W.optional = c),
        (e = this.finishNode(W, "CallExpression"));
    } else if (this.type === o.backQuote) {
      (c || a) &&
        this.raise(
          this.start,
          "Optional chaining cannot appear in the tag of tagged template expressions"
        );
      var R = this.startNodeAt(t, i);
      (R.tag = e),
        (R.quasi = this.parseTemplate({ isTagged: !0 })),
        (e = this.finishNode(R, "TaggedTemplateExpression"));
    }
    return e;
  };
  _.parseExprAtom = function (e, t, i) {
    this.type === o.slash && this.readRegexp();
    var r,
      s = this.potentialArrowAt === this.start;
    switch (this.type) {
      case o._super:
        return (
          this.allowSuper ||
            this.raise(this.start, "'super' keyword outside a method"),
          (r = this.startNode()),
          this.next(),
          this.type === o.parenL &&
            !this.allowDirectSuper &&
            this.raise(
              r.start,
              "super() call outside constructor of a subclass"
            ),
          this.type !== o.dot &&
            this.type !== o.bracketL &&
            this.type !== o.parenL &&
            this.unexpected(),
          this.finishNode(r, "Super")
        );
      case o._this:
        return (
          (r = this.startNode()),
          this.next(),
          this.finishNode(r, "ThisExpression")
        );
      case o.name:
        var a = this.start,
          n = this.startLoc,
          u = this.containsEsc,
          c = this.parseIdent(!1);
        if (
          this.options.ecmaVersion >= 8 &&
          !u &&
          c.name === "async" &&
          !this.canInsertSemicolon() &&
          this.eat(o._function)
        )
          return (
            this.overrideContext(N.f_expr),
            this.parseFunction(this.startNodeAt(a, n), 0, !1, !0, t)
          );
        if (s && !this.canInsertSemicolon()) {
          if (this.eat(o.arrow))
            return this.parseArrowExpression(
              this.startNodeAt(a, n),
              [c],
              !1,
              t
            );
          if (
            this.options.ecmaVersion >= 8 &&
            c.name === "async" &&
            this.type === o.name &&
            !u &&
            (!this.potentialArrowInForAwait ||
              this.value !== "of" ||
              this.containsEsc)
          )
            return (
              (c = this.parseIdent(!1)),
              (this.canInsertSemicolon() || !this.eat(o.arrow)) &&
                this.unexpected(),
              this.parseArrowExpression(this.startNodeAt(a, n), [c], !0, t)
            );
        }
        return c;
      case o.regexp:
        var l = this.value;
        return (
          (r = this.parseLiteral(l.value)),
          (r.regex = { pattern: l.pattern, flags: l.flags }),
          r
        );
      case o.num:
      case o.string:
        return this.parseLiteral(this.value);
      case o._null:
      case o._true:
      case o._false:
        return (
          (r = this.startNode()),
          (r.value = this.type === o._null ? null : this.type === o._true),
          (r.raw = this.type.keyword),
          this.next(),
          this.finishNode(r, "Literal")
        );
      case o.parenL:
        var h = this.start,
          y = this.parseParenAndDistinguishExpression(s, t);
        return (
          e &&
            (e.parenthesizedAssign < 0 &&
              !this.isSimpleAssignTarget(y) &&
              (e.parenthesizedAssign = h),
            e.parenthesizedBind < 0 && (e.parenthesizedBind = h)),
          y
        );
      case o.bracketL:
        return (
          (r = this.startNode()),
          this.next(),
          (r.elements = this.parseExprList(o.bracketR, !0, !0, e)),
          this.finishNode(r, "ArrayExpression")
        );
      case o.braceL:
        return this.overrideContext(N.b_expr), this.parseObj(!1, e);
      case o._function:
        return (r = this.startNode()), this.next(), this.parseFunction(r, 0);
      case o._class:
        return this.parseClass(this.startNode(), !1);
      case o._new:
        return this.parseNew();
      case o.backQuote:
        return this.parseTemplate();
      case o._import:
        return this.options.ecmaVersion >= 11
          ? this.parseExprImport(i)
          : this.unexpected();
      default:
        return this.parseExprAtomDefault();
    }
  };
  _.parseExprAtomDefault = function () {
    this.unexpected();
  };
  _.parseExprImport = function (e) {
    var t = this.startNode();
    this.containsEsc &&
      this.raiseRecoverable(this.start, "Escape sequence in keyword import");
    var i = this.parseIdent(!0);
    if (this.type === o.parenL && !e) return this.parseDynamicImport(t);
    if (this.type === o.dot) return (t.meta = i), this.parseImportMeta(t);
    this.unexpected();
  };
  _.parseDynamicImport = function (e) {
    if (
      (this.next(), (e.source = this.parseMaybeAssign()), !this.eat(o.parenR))
    ) {
      var t = this.start;
      this.eat(o.comma) && this.eat(o.parenR)
        ? this.raiseRecoverable(t, "Trailing comma is not allowed in import()")
        : this.unexpected(t);
    }
    return this.finishNode(e, "ImportExpression");
  };
  _.parseImportMeta = function (e) {
    this.next();
    var t = this.containsEsc;
    return (
      (e.property = this.parseIdent(!0)),
      e.property.name !== "meta" &&
        this.raiseRecoverable(
          e.property.start,
          "The only valid meta property for import is 'import.meta'"
        ),
      t &&
        this.raiseRecoverable(
          e.start,
          "'import.meta' must not contain escaped characters"
        ),
      this.options.sourceType !== "module" &&
        !this.options.allowImportExportEverywhere &&
        this.raiseRecoverable(
          e.start,
          "Cannot use 'import.meta' outside a module"
        ),
      this.finishNode(e, "MetaProperty")
    );
  };
  _.parseLiteral = function (e) {
    var t = this.startNode();
    return (
      (t.value = e),
      (t.raw = this.input.slice(this.start, this.end)),
      t.raw.charCodeAt(t.raw.length - 1) === 110 &&
        (t.bigint = t.raw.slice(0, -1).replace(/_/g, "")),
      this.next(),
      this.finishNode(t, "Literal")
    );
  };
  _.parseParenExpression = function () {
    this.expect(o.parenL);
    var e = this.parseExpression();
    return this.expect(o.parenR), e;
  };
  _.shouldParseArrow = function (e) {
    return !this.canInsertSemicolon();
  };
  _.parseParenAndDistinguishExpression = function (e, t) {
    var i = this.start,
      r = this.startLoc,
      s,
      a = this.options.ecmaVersion >= 8;
    if (this.options.ecmaVersion >= 6) {
      this.next();
      var n = this.start,
        u = this.startLoc,
        c = [],
        l = !0,
        h = !1,
        y = new nt(),
        S = this.yieldPos,
        x = this.awaitPos,
        f;
      for (this.yieldPos = 0, this.awaitPos = 0; this.type !== o.parenR; )
        if (
          (l ? (l = !1) : this.expect(o.comma),
          a && this.afterTrailingComma(o.parenR, !0))
        ) {
          h = !0;
          break;
        } else if (this.type === o.ellipsis) {
          (f = this.start),
            c.push(this.parseParenItem(this.parseRestBinding())),
            this.type === o.comma &&
              this.raiseRecoverable(
                this.start,
                "Comma is not permitted after the rest element"
              );
          break;
        } else c.push(this.parseMaybeAssign(!1, y, this.parseParenItem));
      var O = this.lastTokEnd,
        W = this.lastTokEndLoc;
      if (
        (this.expect(o.parenR),
        e && this.shouldParseArrow(c) && this.eat(o.arrow))
      )
        return (
          this.checkPatternErrors(y, !1),
          this.checkYieldAwaitInDefaultParams(),
          (this.yieldPos = S),
          (this.awaitPos = x),
          this.parseParenArrowList(i, r, c, t)
        );
      (!c.length || h) && this.unexpected(this.lastTokStart),
        f && this.unexpected(f),
        this.checkExpressionErrors(y, !0),
        (this.yieldPos = S || this.yieldPos),
        (this.awaitPos = x || this.awaitPos),
        c.length > 1
          ? ((s = this.startNodeAt(n, u)),
            (s.expressions = c),
            this.finishNodeAt(s, "SequenceExpression", O, W))
          : (s = c[0]);
    } else s = this.parseParenExpression();
    if (this.options.preserveParens) {
      var R = this.startNodeAt(i, r);
      return (R.expression = s), this.finishNode(R, "ParenthesizedExpression");
    } else return s;
  };
  _.parseParenItem = function (e) {
    return e;
  };
  _.parseParenArrowList = function (e, t, i, r) {
    return this.parseArrowExpression(this.startNodeAt(e, t), i, !1, r);
  };
  var xa = [];
  _.parseNew = function () {
    this.containsEsc &&
      this.raiseRecoverable(this.start, "Escape sequence in keyword new");
    var e = this.startNode(),
      t = this.parseIdent(!0);
    if (this.options.ecmaVersion >= 6 && this.eat(o.dot)) {
      e.meta = t;
      var i = this.containsEsc;
      return (
        (e.property = this.parseIdent(!0)),
        e.property.name !== "target" &&
          this.raiseRecoverable(
            e.property.start,
            "The only valid meta property for new is 'new.target'"
          ),
        i &&
          this.raiseRecoverable(
            e.start,
            "'new.target' must not contain escaped characters"
          ),
        this.allowNewDotTarget ||
          this.raiseRecoverable(
            e.start,
            "'new.target' can only be used in functions and class static block"
          ),
        this.finishNode(e, "MetaProperty")
      );
    }
    var r = this.start,
      s = this.startLoc;
    return (
      (e.callee = this.parseSubscripts(
        this.parseExprAtom(null, !1, !0),
        r,
        s,
        !0,
        !1
      )),
      this.eat(o.parenL)
        ? (e.arguments = this.parseExprList(
            o.parenR,
            this.options.ecmaVersion >= 8,
            !1
          ))
        : (e.arguments = xa),
      this.finishNode(e, "NewExpression")
    );
  };
  _.parseTemplateElement = function (e) {
    var t = e.isTagged,
      i = this.startNode();
    return (
      this.type === o.invalidTemplate
        ? (t ||
            this.raiseRecoverable(
              this.start,
              "Bad escape sequence in untagged template literal"
            ),
          (i.value = { raw: this.value, cooked: null }))
        : (i.value = {
            raw: this.input.slice(this.start, this.end).replace(
              /\r\n?/g,
              `
`
            ),
            cooked: this.value,
          }),
      this.next(),
      (i.tail = this.type === o.backQuote),
      this.finishNode(i, "TemplateElement")
    );
  };
  _.parseTemplate = function (e) {
    e === void 0 && (e = {});
    var t = e.isTagged;
    t === void 0 && (t = !1);
    var i = this.startNode();
    this.next(), (i.expressions = []);
    var r = this.parseTemplateElement({ isTagged: t });
    for (i.quasis = [r]; !r.tail; )
      this.type === o.eof &&
        this.raise(this.pos, "Unterminated template literal"),
        this.expect(o.dollarBraceL),
        i.expressions.push(this.parseExpression()),
        this.expect(o.braceR),
        i.quasis.push((r = this.parseTemplateElement({ isTagged: t })));
    return this.next(), this.finishNode(i, "TemplateLiteral");
  };
  _.isAsyncProp = function (e) {
    return (
      !e.computed &&
      e.key.type === "Identifier" &&
      e.key.name === "async" &&
      (this.type === o.name ||
        this.type === o.num ||
        this.type === o.string ||
        this.type === o.bracketL ||
        this.type.keyword ||
        (this.options.ecmaVersion >= 9 && this.type === o.star)) &&
      !Z.test(this.input.slice(this.lastTokEnd, this.start))
    );
  };
  _.parseObj = function (e, t) {
    var i = this.startNode(),
      r = !0,
      s = {};
    for (i.properties = [], this.next(); !this.eat(o.braceR); ) {
      if (r) r = !1;
      else if (
        (this.expect(o.comma),
        this.options.ecmaVersion >= 5 && this.afterTrailingComma(o.braceR))
      )
        break;
      var a = this.parseProperty(e, t);
      e || this.checkPropClash(a, s, t), i.properties.push(a);
    }
    return this.finishNode(i, e ? "ObjectPattern" : "ObjectExpression");
  };
  _.parseProperty = function (e, t) {
    var i = this.startNode(),
      r,
      s,
      a,
      n;
    if (this.options.ecmaVersion >= 9 && this.eat(o.ellipsis))
      return e
        ? ((i.argument = this.parseIdent(!1)),
          this.type === o.comma &&
            this.raiseRecoverable(
              this.start,
              "Comma is not permitted after the rest element"
            ),
          this.finishNode(i, "RestElement"))
        : ((i.argument = this.parseMaybeAssign(!1, t)),
          this.type === o.comma &&
            t &&
            t.trailingComma < 0 &&
            (t.trailingComma = this.start),
          this.finishNode(i, "SpreadElement"));
    this.options.ecmaVersion >= 6 &&
      ((i.method = !1),
      (i.shorthand = !1),
      (e || t) && ((a = this.start), (n = this.startLoc)),
      e || (r = this.eat(o.star)));
    var u = this.containsEsc;
    return (
      this.parsePropertyName(i),
      !e && !u && this.options.ecmaVersion >= 8 && !r && this.isAsyncProp(i)
        ? ((s = !0),
          (r = this.options.ecmaVersion >= 9 && this.eat(o.star)),
          this.parsePropertyName(i))
        : (s = !1),
      this.parsePropertyValue(i, e, r, s, a, n, t, u),
      this.finishNode(i, "Property")
    );
  };
  _.parseGetterSetter = function (e) {
    (e.kind = e.key.name),
      this.parsePropertyName(e),
      (e.value = this.parseMethod(!1));
    var t = e.kind === "get" ? 0 : 1;
    if (e.value.params.length !== t) {
      var i = e.value.start;
      e.kind === "get"
        ? this.raiseRecoverable(i, "getter should have no params")
        : this.raiseRecoverable(i, "setter should have exactly one param");
    } else
      e.kind === "set" &&
        e.value.params[0].type === "RestElement" &&
        this.raiseRecoverable(
          e.value.params[0].start,
          "Setter cannot use rest params"
        );
  };
  _.parsePropertyValue = function (e, t, i, r, s, a, n, u) {
    (i || r) && this.type === o.colon && this.unexpected(),
      this.eat(o.colon)
        ? ((e.value = t
            ? this.parseMaybeDefault(this.start, this.startLoc)
            : this.parseMaybeAssign(!1, n)),
          (e.kind = "init"))
        : this.options.ecmaVersion >= 6 && this.type === o.parenL
          ? (t && this.unexpected(),
            (e.kind = "init"),
            (e.method = !0),
            (e.value = this.parseMethod(i, r)))
          : !t &&
              !u &&
              this.options.ecmaVersion >= 5 &&
              !e.computed &&
              e.key.type === "Identifier" &&
              (e.key.name === "get" || e.key.name === "set") &&
              this.type !== o.comma &&
              this.type !== o.braceR &&
              this.type !== o.eq
            ? ((i || r) && this.unexpected(), this.parseGetterSetter(e))
            : this.options.ecmaVersion >= 6 &&
                !e.computed &&
                e.key.type === "Identifier"
              ? ((i || r) && this.unexpected(),
                this.checkUnreserved(e.key),
                e.key.name === "await" &&
                  !this.awaitIdentPos &&
                  (this.awaitIdentPos = s),
                (e.kind = "init"),
                t
                  ? (e.value = this.parseMaybeDefault(
                      s,
                      a,
                      this.copyNode(e.key)
                    ))
                  : this.type === o.eq && n
                    ? (n.shorthandAssign < 0 &&
                        (n.shorthandAssign = this.start),
                      (e.value = this.parseMaybeDefault(
                        s,
                        a,
                        this.copyNode(e.key)
                      )))
                    : (e.value = this.copyNode(e.key)),
                (e.shorthand = !0))
              : this.unexpected();
  };
  _.parsePropertyName = function (e) {
    if (this.options.ecmaVersion >= 6) {
      if (this.eat(o.bracketL))
        return (
          (e.computed = !0),
          (e.key = this.parseMaybeAssign()),
          this.expect(o.bracketR),
          e.key
        );
      e.computed = !1;
    }
    return (e.key =
      this.type === o.num || this.type === o.string
        ? this.parseExprAtom()
        : this.parseIdent(this.options.allowReserved !== "never"));
  };
  _.initFunction = function (e) {
    (e.id = null),
      this.options.ecmaVersion >= 6 && (e.generator = e.expression = !1),
      this.options.ecmaVersion >= 8 && (e.async = !1);
  };
  _.parseMethod = function (e, t, i) {
    var r = this.startNode(),
      s = this.yieldPos,
      a = this.awaitPos,
      n = this.awaitIdentPos;
    return (
      this.initFunction(r),
      this.options.ecmaVersion >= 6 && (r.generator = e),
      this.options.ecmaVersion >= 8 && (r.async = !!t),
      (this.yieldPos = 0),
      (this.awaitPos = 0),
      (this.awaitIdentPos = 0),
      this.enterScope($t(t, r.generator) | Ft | (i ? dr : 0)),
      this.expect(o.parenL),
      (r.params = this.parseBindingList(
        o.parenR,
        !1,
        this.options.ecmaVersion >= 8
      )),
      this.checkYieldAwaitInDefaultParams(),
      this.parseFunctionBody(r, !1, !0, !1),
      (this.yieldPos = s),
      (this.awaitPos = a),
      (this.awaitIdentPos = n),
      this.finishNode(r, "FunctionExpression")
    );
  };
  _.parseArrowExpression = function (e, t, i, r) {
    var s = this.yieldPos,
      a = this.awaitPos,
      n = this.awaitIdentPos;
    return (
      this.enterScope($t(i, !1) | fr),
      this.initFunction(e),
      this.options.ecmaVersion >= 8 && (e.async = !!i),
      (this.yieldPos = 0),
      (this.awaitPos = 0),
      (this.awaitIdentPos = 0),
      (e.params = this.toAssignableList(t, !0)),
      this.parseFunctionBody(e, !0, !1, r),
      (this.yieldPos = s),
      (this.awaitPos = a),
      (this.awaitIdentPos = n),
      this.finishNode(e, "ArrowFunctionExpression")
    );
  };
  _.parseFunctionBody = function (e, t, i, r) {
    var s = t && this.type !== o.braceL,
      a = this.strict,
      n = !1;
    if (s)
      (e.body = this.parseMaybeAssign(r)),
        (e.expression = !0),
        this.checkParams(e, !1);
    else {
      var u =
        this.options.ecmaVersion >= 7 && !this.isSimpleParamList(e.params);
      (!a || u) &&
        ((n = this.strictDirective(this.end)),
        n &&
          u &&
          this.raiseRecoverable(
            e.start,
            "Illegal 'use strict' directive in function with non-simple parameter list"
          ));
      var c = this.labels;
      (this.labels = []),
        n && (this.strict = !0),
        this.checkParams(
          e,
          !a && !n && !t && !i && this.isSimpleParamList(e.params)
        ),
        this.strict && e.id && this.checkLValSimple(e.id, xr),
        (e.body = this.parseBlock(!1, void 0, n && !a)),
        (e.expression = !1),
        this.adaptDirectivePrologue(e.body.body),
        (this.labels = c);
    }
    this.exitScope();
  };
  _.isSimpleParamList = function (e) {
    for (var t = 0, i = e; t < i.length; t += 1) {
      var r = i[t];
      if (r.type !== "Identifier") return !1;
    }
    return !0;
  };
  _.checkParams = function (e, t) {
    for (
      var i = Object.create(null), r = 0, s = e.params;
      r < s.length;
      r += 1
    ) {
      var a = s[r];
      this.checkLValInnerPattern(a, Ht, t ? null : i);
    }
  };
  _.parseExprList = function (e, t, i, r) {
    for (var s = [], a = !0; !this.eat(e); ) {
      if (a) a = !1;
      else if ((this.expect(o.comma), t && this.afterTrailingComma(e))) break;
      var n = void 0;
      i && this.type === o.comma
        ? (n = null)
        : this.type === o.ellipsis
          ? ((n = this.parseSpread(r)),
            r &&
              this.type === o.comma &&
              r.trailingComma < 0 &&
              (r.trailingComma = this.start))
          : (n = this.parseMaybeAssign(!1, r)),
        s.push(n);
    }
    return s;
  };
  _.checkUnreserved = function (e) {
    var t = e.start,
      i = e.end,
      r = e.name;
    if (
      (this.inGenerator &&
        r === "yield" &&
        this.raiseRecoverable(
          t,
          "Cannot use 'yield' as identifier inside a generator"
        ),
      this.inAsync &&
        r === "await" &&
        this.raiseRecoverable(
          t,
          "Cannot use 'await' as identifier inside an async function"
        ),
      this.currentThisScope().inClassFieldInit &&
        r === "arguments" &&
        this.raiseRecoverable(
          t,
          "Cannot use 'arguments' in class field initializer"
        ),
      this.inClassStaticBlock &&
        (r === "arguments" || r === "await") &&
        this.raise(
          t,
          "Cannot use " + r + " in class static initialization block"
        ),
      this.keywords.test(r) && this.raise(t, "Unexpected keyword '" + r + "'"),
      !(
        this.options.ecmaVersion < 6 &&
        this.input.slice(t, i).indexOf("\\") !== -1
      ))
    ) {
      var s = this.strict ? this.reservedWordsStrict : this.reservedWords;
      s.test(r) &&
        (!this.inAsync &&
          r === "await" &&
          this.raiseRecoverable(
            t,
            "Cannot use keyword 'await' outside an async function"
          ),
        this.raiseRecoverable(t, "The keyword '" + r + "' is reserved"));
    }
  };
  _.parseIdent = function (e) {
    var t = this.parseIdentNode();
    return (
      this.next(!!e),
      this.finishNode(t, "Identifier"),
      e ||
        (this.checkUnreserved(t),
        t.name === "await" &&
          !this.awaitIdentPos &&
          (this.awaitIdentPos = t.start)),
      t
    );
  };
  _.parseIdentNode = function () {
    var e = this.startNode();
    return (
      this.type === o.name
        ? (e.name = this.value)
        : this.type.keyword
          ? ((e.name = this.type.keyword),
            (e.name === "class" || e.name === "function") &&
              (this.lastTokEnd !== this.lastTokStart + 1 ||
                this.input.charCodeAt(this.lastTokStart) !== 46) &&
              this.context.pop())
          : this.unexpected(),
      e
    );
  };
  _.parsePrivateIdent = function () {
    var e = this.startNode();
    return (
      this.type === o.privateId ? (e.name = this.value) : this.unexpected(),
      this.next(),
      this.finishNode(e, "PrivateIdentifier"),
      this.options.checkPrivateFields &&
        (this.privateNameStack.length === 0
          ? this.raise(
              e.start,
              "Private field '#" +
                e.name +
                "' must be declared in an enclosing class"
            )
          : this.privateNameStack[this.privateNameStack.length - 1].used.push(
              e
            )),
      e
    );
  };
  _.parseYield = function (e) {
    this.yieldPos || (this.yieldPos = this.start);
    var t = this.startNode();
    return (
      this.next(),
      this.type === o.semi ||
      this.canInsertSemicolon() ||
      (this.type !== o.star && !this.type.startsExpr)
        ? ((t.delegate = !1), (t.argument = null))
        : ((t.delegate = this.eat(o.star)),
          (t.argument = this.parseMaybeAssign(e))),
      this.finishNode(t, "YieldExpression")
    );
  };
  _.parseAwait = function (e) {
    this.awaitPos || (this.awaitPos = this.start);
    var t = this.startNode();
    return (
      this.next(),
      (t.argument = this.parseMaybeUnary(null, !0, !1, e)),
      this.finishNode(t, "AwaitExpression")
    );
  };
  var st = T.prototype;
  st.raise = function (e, t) {
    var i = lr(this.input, e);
    t += " (" + i.line + ":" + i.column + ")";
    var r = new SyntaxError(t);
    throw ((r.pos = e), (r.loc = i), (r.raisedAt = this.pos), r);
  };
  st.raiseRecoverable = st.raise;
  st.curPosition = function () {
    if (this.options.locations)
      return new Ne(this.curLine, this.pos - this.lineStart);
  };
  var de = T.prototype,
    ya = function (t) {
      (this.flags = t),
        (this.var = []),
        (this.lexical = []),
        (this.functions = []),
        (this.inClassFieldInit = !1);
    };
  de.enterScope = function (e) {
    this.scopeStack.push(new ya(e));
  };
  de.exitScope = function () {
    this.scopeStack.pop();
  };
  de.treatFunctionsAsVarInScope = function (e) {
    return e.flags & _e || (!this.inModule && e.flags & Le);
  };
  de.declareName = function (e, t, i) {
    var r = !1;
    if (t === le) {
      var s = this.currentScope();
      (r =
        s.lexical.indexOf(e) > -1 ||
        s.functions.indexOf(e) > -1 ||
        s.var.indexOf(e) > -1),
        s.lexical.push(e),
        this.inModule && s.flags & Le && delete this.undefinedExports[e];
    } else if (t === gr) {
      var a = this.currentScope();
      a.lexical.push(e);
    } else if (t === mr) {
      var n = this.currentScope();
      this.treatFunctionsAsVar
        ? (r = n.lexical.indexOf(e) > -1)
        : (r = n.lexical.indexOf(e) > -1 || n.var.indexOf(e) > -1),
        n.functions.push(e);
    } else
      for (var u = this.scopeStack.length - 1; u >= 0; --u) {
        var c = this.scopeStack[u];
        if (
          (c.lexical.indexOf(e) > -1 &&
            !(c.flags & pr && c.lexical[0] === e)) ||
          (!this.treatFunctionsAsVarInScope(c) && c.functions.indexOf(e) > -1)
        ) {
          r = !0;
          break;
        }
        if (
          (c.var.push(e),
          this.inModule && c.flags & Le && delete this.undefinedExports[e],
          c.flags & Ut)
        )
          break;
      }
    r &&
      this.raiseRecoverable(
        i,
        "Identifier '" + e + "' has already been declared"
      );
  };
  de.checkLocalExport = function (e) {
    this.scopeStack[0].lexical.indexOf(e.name) === -1 &&
      this.scopeStack[0].var.indexOf(e.name) === -1 &&
      (this.undefinedExports[e.name] = e);
  };
  de.currentScope = function () {
    return this.scopeStack[this.scopeStack.length - 1];
  };
  de.currentVarScope = function () {
    for (var e = this.scopeStack.length - 1; ; e--) {
      var t = this.scopeStack[e];
      if (t.flags & Ut) return t;
    }
  };
  de.currentThisScope = function () {
    for (var e = this.scopeStack.length - 1; ; e--) {
      var t = this.scopeStack[e];
      if (t.flags & Ut && !(t.flags & fr)) return t;
    }
  };
  var ot = function (t, i, r) {
      (this.type = ""),
        (this.start = i),
        (this.end = 0),
        t.options.locations && (this.loc = new at(t, r)),
        t.options.directSourceFile &&
          (this.sourceFile = t.options.directSourceFile),
        t.options.ranges && (this.range = [i, 0]);
    },
    Oe = T.prototype;
  Oe.startNode = function () {
    return new ot(this, this.start, this.startLoc);
  };
  Oe.startNodeAt = function (e, t) {
    return new ot(this, e, t);
  };
  function vr(e, t, i, r) {
    return (
      (e.type = t),
      (e.end = i),
      this.options.locations && (e.loc.end = r),
      this.options.ranges && (e.range[1] = i),
      e
    );
  }
  Oe.finishNode = function (e, t) {
    return vr.call(this, e, t, this.lastTokEnd, this.lastTokEndLoc);
  };
  Oe.finishNodeAt = function (e, t, i, r) {
    return vr.call(this, e, t, i, r);
  };
  Oe.copyNode = function (e) {
    var t = new ot(this, e.start, this.startLoc);
    for (var i in e) t[i] = e[i];
    return t;
  };
  var wr =
      "ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS",
    _r = wr + " Extended_Pictographic",
    Cr = _r,
    Sr = Cr + " EBase EComp EMod EPres ExtPict",
    kr = Sr,
    ba = kr,
    va = { 9: wr, 10: _r, 11: Cr, 12: Sr, 13: kr, 14: ba },
    wa =
      "Basic_Emoji Emoji_Keycap_Sequence RGI_Emoji_Modifier_Sequence RGI_Emoji_Flag_Sequence RGI_Emoji_Tag_Sequence RGI_Emoji_ZWJ_Sequence RGI_Emoji",
    _a = { 9: "", 10: "", 11: "", 12: "", 13: "", 14: wa },
    rr =
      "Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu",
    Er =
      "Adlam Adlm Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb",
    Ar =
      Er +
      " Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd",
    Ir =
      Ar +
      " Elymaic Elym Nandinagari Nand Nyiakeng_Puachue_Hmong Hmnp Wancho Wcho",
    Pr =
      Ir +
      " Chorasmian Chrs Diak Dives_Akuru Khitan_Small_Script Kits Yezi Yezidi",
    Rr =
      Pr + " Cypro_Minoan Cpmn Old_Uyghur Ougr Tangsa Tnsa Toto Vithkuqi Vith",
    Ca = Rr + " Hrkt Katakana_Or_Hiragana Kawi Nag_Mundari Nagm Unknown Zzzz",
    Sa = { 9: Er, 10: Ar, 11: Ir, 12: Pr, 13: Rr, 14: Ca },
    Nr = {};
  function ka(e) {
    var t = (Nr[e] = {
      binary: fe(va[e] + " " + rr),
      binaryOfStrings: fe(_a[e]),
      nonBinary: { General_Category: fe(rr), Script: fe(Sa[e]) },
    });
    (t.nonBinary.Script_Extensions = t.nonBinary.Script),
      (t.nonBinary.gc = t.nonBinary.General_Category),
      (t.nonBinary.sc = t.nonBinary.Script),
      (t.nonBinary.scx = t.nonBinary.Script_Extensions);
  }
  for (tt = 0, Dt = [9, 10, 11, 12, 13, 14]; tt < Dt.length; tt += 1)
    (sr = Dt[tt]), ka(sr);
  var sr,
    tt,
    Dt,
    v = T.prototype,
    ae = function (t) {
      (this.parser = t),
        (this.validFlags =
          "gim" +
          (t.options.ecmaVersion >= 6 ? "uy" : "") +
          (t.options.ecmaVersion >= 9 ? "s" : "") +
          (t.options.ecmaVersion >= 13 ? "d" : "") +
          (t.options.ecmaVersion >= 15 ? "v" : "")),
        (this.unicodeProperties =
          Nr[t.options.ecmaVersion >= 14 ? 14 : t.options.ecmaVersion]),
        (this.source = ""),
        (this.flags = ""),
        (this.start = 0),
        (this.switchU = !1),
        (this.switchV = !1),
        (this.switchN = !1),
        (this.pos = 0),
        (this.lastIntValue = 0),
        (this.lastStringValue = ""),
        (this.lastAssertionIsQuantifiable = !1),
        (this.numCapturingParens = 0),
        (this.maxBackReference = 0),
        (this.groupNames = []),
        (this.backReferenceNames = []);
    };
  ae.prototype.reset = function (t, i, r) {
    var s = r.indexOf("v") !== -1,
      a = r.indexOf("u") !== -1;
    (this.start = t | 0),
      (this.source = i + ""),
      (this.flags = r),
      s && this.parser.options.ecmaVersion >= 15
        ? ((this.switchU = !0), (this.switchV = !0), (this.switchN = !0))
        : ((this.switchU = a && this.parser.options.ecmaVersion >= 6),
          (this.switchV = !1),
          (this.switchN = a && this.parser.options.ecmaVersion >= 9));
  };
  ae.prototype.raise = function (t) {
    this.parser.raiseRecoverable(
      this.start,
      "Invalid regular expression: /" + this.source + "/: " + t
    );
  };
  ae.prototype.at = function (t, i) {
    i === void 0 && (i = !1);
    var r = this.source,
      s = r.length;
    if (t >= s) return -1;
    var a = r.charCodeAt(t);
    if (!(i || this.switchU) || a <= 55295 || a >= 57344 || t + 1 >= s)
      return a;
    var n = r.charCodeAt(t + 1);
    return n >= 56320 && n <= 57343 ? (a << 10) + n - 56613888 : a;
  };
  ae.prototype.nextIndex = function (t, i) {
    i === void 0 && (i = !1);
    var r = this.source,
      s = r.length;
    if (t >= s) return s;
    var a = r.charCodeAt(t),
      n;
    return !(i || this.switchU) ||
      a <= 55295 ||
      a >= 57344 ||
      t + 1 >= s ||
      (n = r.charCodeAt(t + 1)) < 56320 ||
      n > 57343
      ? t + 1
      : t + 2;
  };
  ae.prototype.current = function (t) {
    return t === void 0 && (t = !1), this.at(this.pos, t);
  };
  ae.prototype.lookahead = function (t) {
    return t === void 0 && (t = !1), this.at(this.nextIndex(this.pos, t), t);
  };
  ae.prototype.advance = function (t) {
    t === void 0 && (t = !1), (this.pos = this.nextIndex(this.pos, t));
  };
  ae.prototype.eat = function (t, i) {
    return (
      i === void 0 && (i = !1),
      this.current(i) === t ? (this.advance(i), !0) : !1
    );
  };
  ae.prototype.eatChars = function (t, i) {
    i === void 0 && (i = !1);
    for (var r = this.pos, s = 0, a = t; s < a.length; s += 1) {
      var n = a[s],
        u = this.at(r, i);
      if (u === -1 || u !== n) return !1;
      r = this.nextIndex(r, i);
    }
    return (this.pos = r), !0;
  };
  v.validateRegExpFlags = function (e) {
    for (
      var t = e.validFlags, i = e.flags, r = !1, s = !1, a = 0;
      a < i.length;
      a++
    ) {
      var n = i.charAt(a);
      t.indexOf(n) === -1 &&
        this.raise(e.start, "Invalid regular expression flag"),
        i.indexOf(n, a + 1) > -1 &&
          this.raise(e.start, "Duplicate regular expression flag"),
        n === "u" && (r = !0),
        n === "v" && (s = !0);
    }
    this.options.ecmaVersion >= 15 &&
      r &&
      s &&
      this.raise(e.start, "Invalid regular expression flag");
  };
  v.validateRegExpPattern = function (e) {
    this.regexp_pattern(e),
      !e.switchN &&
        this.options.ecmaVersion >= 9 &&
        e.groupNames.length > 0 &&
        ((e.switchN = !0), this.regexp_pattern(e));
  };
  v.regexp_pattern = function (e) {
    (e.pos = 0),
      (e.lastIntValue = 0),
      (e.lastStringValue = ""),
      (e.lastAssertionIsQuantifiable = !1),
      (e.numCapturingParens = 0),
      (e.maxBackReference = 0),
      (e.groupNames.length = 0),
      (e.backReferenceNames.length = 0),
      this.regexp_disjunction(e),
      e.pos !== e.source.length &&
        (e.eat(41) && e.raise("Unmatched ')'"),
        (e.eat(93) || e.eat(125)) && e.raise("Lone quantifier brackets")),
      e.maxBackReference > e.numCapturingParens && e.raise("Invalid escape");
    for (var t = 0, i = e.backReferenceNames; t < i.length; t += 1) {
      var r = i[t];
      e.groupNames.indexOf(r) === -1 &&
        e.raise("Invalid named capture referenced");
    }
  };
  v.regexp_disjunction = function (e) {
    for (this.regexp_alternative(e); e.eat(124); ) this.regexp_alternative(e);
    this.regexp_eatQuantifier(e, !0) && e.raise("Nothing to repeat"),
      e.eat(123) && e.raise("Lone quantifier brackets");
  };
  v.regexp_alternative = function (e) {
    for (; e.pos < e.source.length && this.regexp_eatTerm(e); );
  };
  v.regexp_eatTerm = function (e) {
    return this.regexp_eatAssertion(e)
      ? (e.lastAssertionIsQuantifiable &&
          this.regexp_eatQuantifier(e) &&
          e.switchU &&
          e.raise("Invalid quantifier"),
        !0)
      : (e.switchU ? this.regexp_eatAtom(e) : this.regexp_eatExtendedAtom(e))
        ? (this.regexp_eatQuantifier(e), !0)
        : !1;
  };
  v.regexp_eatAssertion = function (e) {
    var t = e.pos;
    if (((e.lastAssertionIsQuantifiable = !1), e.eat(94) || e.eat(36)))
      return !0;
    if (e.eat(92)) {
      if (e.eat(66) || e.eat(98)) return !0;
      e.pos = t;
    }
    if (e.eat(40) && e.eat(63)) {
      var i = !1;
      if (
        (this.options.ecmaVersion >= 9 && (i = e.eat(60)),
        e.eat(61) || e.eat(33))
      )
        return (
          this.regexp_disjunction(e),
          e.eat(41) || e.raise("Unterminated group"),
          (e.lastAssertionIsQuantifiable = !i),
          !0
        );
    }
    return (e.pos = t), !1;
  };
  v.regexp_eatQuantifier = function (e, t) {
    return (
      t === void 0 && (t = !1),
      this.regexp_eatQuantifierPrefix(e, t) ? (e.eat(63), !0) : !1
    );
  };
  v.regexp_eatQuantifierPrefix = function (e, t) {
    return (
      e.eat(42) ||
      e.eat(43) ||
      e.eat(63) ||
      this.regexp_eatBracedQuantifier(e, t)
    );
  };
  v.regexp_eatBracedQuantifier = function (e, t) {
    var i = e.pos;
    if (e.eat(123)) {
      var r = 0,
        s = -1;
      if (
        this.regexp_eatDecimalDigits(e) &&
        ((r = e.lastIntValue),
        e.eat(44) && this.regexp_eatDecimalDigits(e) && (s = e.lastIntValue),
        e.eat(125))
      )
        return (
          s !== -1 &&
            s < r &&
            !t &&
            e.raise("numbers out of order in {} quantifier"),
          !0
        );
      e.switchU && !t && e.raise("Incomplete quantifier"), (e.pos = i);
    }
    return !1;
  };
  v.regexp_eatAtom = function (e) {
    return (
      this.regexp_eatPatternCharacters(e) ||
      e.eat(46) ||
      this.regexp_eatReverseSolidusAtomEscape(e) ||
      this.regexp_eatCharacterClass(e) ||
      this.regexp_eatUncapturingGroup(e) ||
      this.regexp_eatCapturingGroup(e)
    );
  };
  v.regexp_eatReverseSolidusAtomEscape = function (e) {
    var t = e.pos;
    if (e.eat(92)) {
      if (this.regexp_eatAtomEscape(e)) return !0;
      e.pos = t;
    }
    return !1;
  };
  v.regexp_eatUncapturingGroup = function (e) {
    var t = e.pos;
    if (e.eat(40)) {
      if (e.eat(63) && e.eat(58)) {
        if ((this.regexp_disjunction(e), e.eat(41))) return !0;
        e.raise("Unterminated group");
      }
      e.pos = t;
    }
    return !1;
  };
  v.regexp_eatCapturingGroup = function (e) {
    if (e.eat(40)) {
      if (
        (this.options.ecmaVersion >= 9
          ? this.regexp_groupSpecifier(e)
          : e.current() === 63 && e.raise("Invalid group"),
        this.regexp_disjunction(e),
        e.eat(41))
      )
        return (e.numCapturingParens += 1), !0;
      e.raise("Unterminated group");
    }
    return !1;
  };
  v.regexp_eatExtendedAtom = function (e) {
    return (
      e.eat(46) ||
      this.regexp_eatReverseSolidusAtomEscape(e) ||
      this.regexp_eatCharacterClass(e) ||
      this.regexp_eatUncapturingGroup(e) ||
      this.regexp_eatCapturingGroup(e) ||
      this.regexp_eatInvalidBracedQuantifier(e) ||
      this.regexp_eatExtendedPatternCharacter(e)
    );
  };
  v.regexp_eatInvalidBracedQuantifier = function (e) {
    return (
      this.regexp_eatBracedQuantifier(e, !0) && e.raise("Nothing to repeat"), !1
    );
  };
  v.regexp_eatSyntaxCharacter = function (e) {
    var t = e.current();
    return Lr(t) ? ((e.lastIntValue = t), e.advance(), !0) : !1;
  };
  function Lr(e) {
    return (
      e === 36 ||
      (e >= 40 && e <= 43) ||
      e === 46 ||
      e === 63 ||
      (e >= 91 && e <= 94) ||
      (e >= 123 && e <= 125)
    );
  }
  v.regexp_eatPatternCharacters = function (e) {
    for (var t = e.pos, i = 0; (i = e.current()) !== -1 && !Lr(i); )
      e.advance();
    return e.pos !== t;
  };
  v.regexp_eatExtendedPatternCharacter = function (e) {
    var t = e.current();
    return t !== -1 &&
      t !== 36 &&
      !(t >= 40 && t <= 43) &&
      t !== 46 &&
      t !== 63 &&
      t !== 91 &&
      t !== 94 &&
      t !== 124
      ? (e.advance(), !0)
      : !1;
  };
  v.regexp_groupSpecifier = function (e) {
    if (e.eat(63)) {
      if (this.regexp_eatGroupName(e)) {
        e.groupNames.indexOf(e.lastStringValue) !== -1 &&
          e.raise("Duplicate capture group name"),
          e.groupNames.push(e.lastStringValue);
        return;
      }
      e.raise("Invalid group");
    }
  };
  v.regexp_eatGroupName = function (e) {
    if (((e.lastStringValue = ""), e.eat(60))) {
      if (this.regexp_eatRegExpIdentifierName(e) && e.eat(62)) return !0;
      e.raise("Invalid capture group name");
    }
    return !1;
  };
  v.regexp_eatRegExpIdentifierName = function (e) {
    if (((e.lastStringValue = ""), this.regexp_eatRegExpIdentifierStart(e))) {
      for (
        e.lastStringValue += pe(e.lastIntValue);
        this.regexp_eatRegExpIdentifierPart(e);

      )
        e.lastStringValue += pe(e.lastIntValue);
      return !0;
    }
    return !1;
  };
  v.regexp_eatRegExpIdentifierStart = function (e) {
    var t = e.pos,
      i = this.options.ecmaVersion >= 11,
      r = e.current(i);
    return (
      e.advance(i),
      r === 92 &&
        this.regexp_eatRegExpUnicodeEscapeSequence(e, i) &&
        (r = e.lastIntValue),
      Ea(r) ? ((e.lastIntValue = r), !0) : ((e.pos = t), !1)
    );
  };
  function Ea(e) {
    return ce(e, !0) || e === 36 || e === 95;
  }
  v.regexp_eatRegExpIdentifierPart = function (e) {
    var t = e.pos,
      i = this.options.ecmaVersion >= 11,
      r = e.current(i);
    return (
      e.advance(i),
      r === 92 &&
        this.regexp_eatRegExpUnicodeEscapeSequence(e, i) &&
        (r = e.lastIntValue),
      Aa(r) ? ((e.lastIntValue = r), !0) : ((e.pos = t), !1)
    );
  };
  function Aa(e) {
    return ve(e, !0) || e === 36 || e === 95 || e === 8204 || e === 8205;
  }
  v.regexp_eatAtomEscape = function (e) {
    return this.regexp_eatBackReference(e) ||
      this.regexp_eatCharacterClassEscape(e) ||
      this.regexp_eatCharacterEscape(e) ||
      (e.switchN && this.regexp_eatKGroupName(e))
      ? !0
      : (e.switchU &&
          (e.current() === 99 && e.raise("Invalid unicode escape"),
          e.raise("Invalid escape")),
        !1);
  };
  v.regexp_eatBackReference = function (e) {
    var t = e.pos;
    if (this.regexp_eatDecimalEscape(e)) {
      var i = e.lastIntValue;
      if (e.switchU)
        return i > e.maxBackReference && (e.maxBackReference = i), !0;
      if (i <= e.numCapturingParens) return !0;
      e.pos = t;
    }
    return !1;
  };
  v.regexp_eatKGroupName = function (e) {
    if (e.eat(107)) {
      if (this.regexp_eatGroupName(e))
        return e.backReferenceNames.push(e.lastStringValue), !0;
      e.raise("Invalid named reference");
    }
    return !1;
  };
  v.regexp_eatCharacterEscape = function (e) {
    return (
      this.regexp_eatControlEscape(e) ||
      this.regexp_eatCControlLetter(e) ||
      this.regexp_eatZero(e) ||
      this.regexp_eatHexEscapeSequence(e) ||
      this.regexp_eatRegExpUnicodeEscapeSequence(e, !1) ||
      (!e.switchU && this.regexp_eatLegacyOctalEscapeSequence(e)) ||
      this.regexp_eatIdentityEscape(e)
    );
  };
  v.regexp_eatCControlLetter = function (e) {
    var t = e.pos;
    if (e.eat(99)) {
      if (this.regexp_eatControlLetter(e)) return !0;
      e.pos = t;
    }
    return !1;
  };
  v.regexp_eatZero = function (e) {
    return e.current() === 48 && !ct(e.lookahead())
      ? ((e.lastIntValue = 0), e.advance(), !0)
      : !1;
  };
  v.regexp_eatControlEscape = function (e) {
    var t = e.current();
    return t === 116
      ? ((e.lastIntValue = 9), e.advance(), !0)
      : t === 110
        ? ((e.lastIntValue = 10), e.advance(), !0)
        : t === 118
          ? ((e.lastIntValue = 11), e.advance(), !0)
          : t === 102
            ? ((e.lastIntValue = 12), e.advance(), !0)
            : t === 114
              ? ((e.lastIntValue = 13), e.advance(), !0)
              : !1;
  };
  v.regexp_eatControlLetter = function (e) {
    var t = e.current();
    return Tr(t) ? ((e.lastIntValue = t % 32), e.advance(), !0) : !1;
  };
  function Tr(e) {
    return (e >= 65 && e <= 90) || (e >= 97 && e <= 122);
  }
  v.regexp_eatRegExpUnicodeEscapeSequence = function (e, t) {
    t === void 0 && (t = !1);
    var i = e.pos,
      r = t || e.switchU;
    if (e.eat(117)) {
      if (this.regexp_eatFixedHexDigits(e, 4)) {
        var s = e.lastIntValue;
        if (r && s >= 55296 && s <= 56319) {
          var a = e.pos;
          if (e.eat(92) && e.eat(117) && this.regexp_eatFixedHexDigits(e, 4)) {
            var n = e.lastIntValue;
            if (n >= 56320 && n <= 57343)
              return (
                (e.lastIntValue = (s - 55296) * 1024 + (n - 56320) + 65536), !0
              );
          }
          (e.pos = a), (e.lastIntValue = s);
        }
        return !0;
      }
      if (
        r &&
        e.eat(123) &&
        this.regexp_eatHexDigits(e) &&
        e.eat(125) &&
        Ia(e.lastIntValue)
      )
        return !0;
      r && e.raise("Invalid unicode escape"), (e.pos = i);
    }
    return !1;
  };
  function Ia(e) {
    return e >= 0 && e <= 1114111;
  }
  v.regexp_eatIdentityEscape = function (e) {
    if (e.switchU)
      return this.regexp_eatSyntaxCharacter(e)
        ? !0
        : e.eat(47)
          ? ((e.lastIntValue = 47), !0)
          : !1;
    var t = e.current();
    return t !== 99 && (!e.switchN || t !== 107)
      ? ((e.lastIntValue = t), e.advance(), !0)
      : !1;
  };
  v.regexp_eatDecimalEscape = function (e) {
    e.lastIntValue = 0;
    var t = e.current();
    if (t >= 49 && t <= 57) {
      do (e.lastIntValue = 10 * e.lastIntValue + (t - 48)), e.advance();
      while ((t = e.current()) >= 48 && t <= 57);
      return !0;
    }
    return !1;
  };
  var Dr = 0,
    ue = 1,
    J = 2;
  v.regexp_eatCharacterClassEscape = function (e) {
    var t = e.current();
    if (Pa(t)) return (e.lastIntValue = -1), e.advance(), ue;
    var i = !1;
    if (
      e.switchU &&
      this.options.ecmaVersion >= 9 &&
      ((i = t === 80) || t === 112)
    ) {
      (e.lastIntValue = -1), e.advance();
      var r;
      if (
        e.eat(123) &&
        (r = this.regexp_eatUnicodePropertyValueExpression(e)) &&
        e.eat(125)
      )
        return i && r === J && e.raise("Invalid property name"), r;
      e.raise("Invalid property name");
    }
    return Dr;
  };
  function Pa(e) {
    return (
      e === 100 || e === 68 || e === 115 || e === 83 || e === 119 || e === 87
    );
  }
  v.regexp_eatUnicodePropertyValueExpression = function (e) {
    var t = e.pos;
    if (this.regexp_eatUnicodePropertyName(e) && e.eat(61)) {
      var i = e.lastStringValue;
      if (this.regexp_eatUnicodePropertyValue(e)) {
        var r = e.lastStringValue;
        return this.regexp_validateUnicodePropertyNameAndValue(e, i, r), ue;
      }
    }
    if (((e.pos = t), this.regexp_eatLoneUnicodePropertyNameOrValue(e))) {
      var s = e.lastStringValue;
      return this.regexp_validateUnicodePropertyNameOrValue(e, s);
    }
    return Dr;
  };
  v.regexp_validateUnicodePropertyNameAndValue = function (e, t, i) {
    Te(e.unicodeProperties.nonBinary, t) || e.raise("Invalid property name"),
      e.unicodeProperties.nonBinary[t].test(i) ||
        e.raise("Invalid property value");
  };
  v.regexp_validateUnicodePropertyNameOrValue = function (e, t) {
    if (e.unicodeProperties.binary.test(t)) return ue;
    if (e.switchV && e.unicodeProperties.binaryOfStrings.test(t)) return J;
    e.raise("Invalid property name");
  };
  v.regexp_eatUnicodePropertyName = function (e) {
    var t = 0;
    for (e.lastStringValue = ""; Or((t = e.current())); )
      (e.lastStringValue += pe(t)), e.advance();
    return e.lastStringValue !== "";
  };
  function Or(e) {
    return Tr(e) || e === 95;
  }
  v.regexp_eatUnicodePropertyValue = function (e) {
    var t = 0;
    for (e.lastStringValue = ""; Ra((t = e.current())); )
      (e.lastStringValue += pe(t)), e.advance();
    return e.lastStringValue !== "";
  };
  function Ra(e) {
    return Or(e) || ct(e);
  }
  v.regexp_eatLoneUnicodePropertyNameOrValue = function (e) {
    return this.regexp_eatUnicodePropertyValue(e);
  };
  v.regexp_eatCharacterClass = function (e) {
    if (e.eat(91)) {
      var t = e.eat(94),
        i = this.regexp_classContents(e);
      return (
        e.eat(93) || e.raise("Unterminated character class"),
        t && i === J && e.raise("Negated character class may contain strings"),
        !0
      );
    }
    return !1;
  };
  v.regexp_classContents = function (e) {
    return e.current() === 93
      ? ue
      : e.switchV
        ? this.regexp_classSetExpression(e)
        : (this.regexp_nonEmptyClassRanges(e), ue);
  };
  v.regexp_nonEmptyClassRanges = function (e) {
    for (; this.regexp_eatClassAtom(e); ) {
      var t = e.lastIntValue;
      if (e.eat(45) && this.regexp_eatClassAtom(e)) {
        var i = e.lastIntValue;
        e.switchU &&
          (t === -1 || i === -1) &&
          e.raise("Invalid character class"),
          t !== -1 &&
            i !== -1 &&
            t > i &&
            e.raise("Range out of order in character class");
      }
    }
  };
  v.regexp_eatClassAtom = function (e) {
    var t = e.pos;
    if (e.eat(92)) {
      if (this.regexp_eatClassEscape(e)) return !0;
      if (e.switchU) {
        var i = e.current();
        (i === 99 || Mr(i)) && e.raise("Invalid class escape"),
          e.raise("Invalid escape");
      }
      e.pos = t;
    }
    var r = e.current();
    return r !== 93 ? ((e.lastIntValue = r), e.advance(), !0) : !1;
  };
  v.regexp_eatClassEscape = function (e) {
    var t = e.pos;
    if (e.eat(98)) return (e.lastIntValue = 8), !0;
    if (e.switchU && e.eat(45)) return (e.lastIntValue = 45), !0;
    if (!e.switchU && e.eat(99)) {
      if (this.regexp_eatClassControlLetter(e)) return !0;
      e.pos = t;
    }
    return (
      this.regexp_eatCharacterClassEscape(e) ||
      this.regexp_eatCharacterEscape(e)
    );
  };
  v.regexp_classSetExpression = function (e) {
    var t = ue,
      i;
    if (!this.regexp_eatClassSetRange(e))
      if ((i = this.regexp_eatClassSetOperand(e))) {
        i === J && (t = J);
        for (var r = e.pos; e.eatChars([38, 38]); ) {
          if (e.current() !== 38 && (i = this.regexp_eatClassSetOperand(e))) {
            i !== J && (t = ue);
            continue;
          }
          e.raise("Invalid character in character class");
        }
        if (r !== e.pos) return t;
        for (; e.eatChars([45, 45]); )
          this.regexp_eatClassSetOperand(e) ||
            e.raise("Invalid character in character class");
        if (r !== e.pos) return t;
      } else e.raise("Invalid character in character class");
    for (;;)
      if (!this.regexp_eatClassSetRange(e)) {
        if (((i = this.regexp_eatClassSetOperand(e)), !i)) return t;
        i === J && (t = J);
      }
  };
  v.regexp_eatClassSetRange = function (e) {
    var t = e.pos;
    if (this.regexp_eatClassSetCharacter(e)) {
      var i = e.lastIntValue;
      if (e.eat(45) && this.regexp_eatClassSetCharacter(e)) {
        var r = e.lastIntValue;
        return (
          i !== -1 &&
            r !== -1 &&
            i > r &&
            e.raise("Range out of order in character class"),
          !0
        );
      }
      e.pos = t;
    }
    return !1;
  };
  v.regexp_eatClassSetOperand = function (e) {
    return this.regexp_eatClassSetCharacter(e)
      ? ue
      : this.regexp_eatClassStringDisjunction(e) ||
          this.regexp_eatNestedClass(e);
  };
  v.regexp_eatNestedClass = function (e) {
    var t = e.pos;
    if (e.eat(91)) {
      var i = e.eat(94),
        r = this.regexp_classContents(e);
      if (e.eat(93))
        return (
          i &&
            r === J &&
            e.raise("Negated character class may contain strings"),
          r
        );
      e.pos = t;
    }
    if (e.eat(92)) {
      var s = this.regexp_eatCharacterClassEscape(e);
      if (s) return s;
      e.pos = t;
    }
    return null;
  };
  v.regexp_eatClassStringDisjunction = function (e) {
    var t = e.pos;
    if (e.eatChars([92, 113])) {
      if (e.eat(123)) {
        var i = this.regexp_classStringDisjunctionContents(e);
        if (e.eat(125)) return i;
      } else e.raise("Invalid escape");
      e.pos = t;
    }
    return null;
  };
  v.regexp_classStringDisjunctionContents = function (e) {
    for (var t = this.regexp_classString(e); e.eat(124); )
      this.regexp_classString(e) === J && (t = J);
    return t;
  };
  v.regexp_classString = function (e) {
    for (var t = 0; this.regexp_eatClassSetCharacter(e); ) t++;
    return t === 1 ? ue : J;
  };
  v.regexp_eatClassSetCharacter = function (e) {
    var t = e.pos;
    if (e.eat(92))
      return this.regexp_eatCharacterEscape(e) ||
        this.regexp_eatClassSetReservedPunctuator(e)
        ? !0
        : e.eat(98)
          ? ((e.lastIntValue = 8), !0)
          : ((e.pos = t), !1);
    var i = e.current();
    return i < 0 || (i === e.lookahead() && Na(i)) || La(i)
      ? !1
      : (e.advance(), (e.lastIntValue = i), !0);
  };
  function Na(e) {
    return (
      e === 33 ||
      (e >= 35 && e <= 38) ||
      (e >= 42 && e <= 44) ||
      e === 46 ||
      (e >= 58 && e <= 64) ||
      e === 94 ||
      e === 96 ||
      e === 126
    );
  }
  function La(e) {
    return (
      e === 40 ||
      e === 41 ||
      e === 45 ||
      e === 47 ||
      (e >= 91 && e <= 93) ||
      (e >= 123 && e <= 125)
    );
  }
  v.regexp_eatClassSetReservedPunctuator = function (e) {
    var t = e.current();
    return Ta(t) ? ((e.lastIntValue = t), e.advance(), !0) : !1;
  };
  function Ta(e) {
    return (
      e === 33 ||
      e === 35 ||
      e === 37 ||
      e === 38 ||
      e === 44 ||
      e === 45 ||
      (e >= 58 && e <= 62) ||
      e === 64 ||
      e === 96 ||
      e === 126
    );
  }
  v.regexp_eatClassControlLetter = function (e) {
    var t = e.current();
    return ct(t) || t === 95
      ? ((e.lastIntValue = t % 32), e.advance(), !0)
      : !1;
  };
  v.regexp_eatHexEscapeSequence = function (e) {
    var t = e.pos;
    if (e.eat(120)) {
      if (this.regexp_eatFixedHexDigits(e, 2)) return !0;
      e.switchU && e.raise("Invalid escape"), (e.pos = t);
    }
    return !1;
  };
  v.regexp_eatDecimalDigits = function (e) {
    var t = e.pos,
      i = 0;
    for (e.lastIntValue = 0; ct((i = e.current())); )
      (e.lastIntValue = 10 * e.lastIntValue + (i - 48)), e.advance();
    return e.pos !== t;
  };
  function ct(e) {
    return e >= 48 && e <= 57;
  }
  v.regexp_eatHexDigits = function (e) {
    var t = e.pos,
      i = 0;
    for (e.lastIntValue = 0; Br((i = e.current())); )
      (e.lastIntValue = 16 * e.lastIntValue + Vr(i)), e.advance();
    return e.pos !== t;
  };
  function Br(e) {
    return (
      (e >= 48 && e <= 57) || (e >= 65 && e <= 70) || (e >= 97 && e <= 102)
    );
  }
  function Vr(e) {
    return e >= 65 && e <= 70
      ? 10 + (e - 65)
      : e >= 97 && e <= 102
        ? 10 + (e - 97)
        : e - 48;
  }
  v.regexp_eatLegacyOctalEscapeSequence = function (e) {
    if (this.regexp_eatOctalDigit(e)) {
      var t = e.lastIntValue;
      if (this.regexp_eatOctalDigit(e)) {
        var i = e.lastIntValue;
        t <= 3 && this.regexp_eatOctalDigit(e)
          ? (e.lastIntValue = t * 64 + i * 8 + e.lastIntValue)
          : (e.lastIntValue = t * 8 + i);
      } else e.lastIntValue = t;
      return !0;
    }
    return !1;
  };
  v.regexp_eatOctalDigit = function (e) {
    var t = e.current();
    return Mr(t)
      ? ((e.lastIntValue = t - 48), e.advance(), !0)
      : ((e.lastIntValue = 0), !1);
  };
  function Mr(e) {
    return e >= 48 && e <= 55;
  }
  v.regexp_eatFixedHexDigits = function (e, t) {
    var i = e.pos;
    e.lastIntValue = 0;
    for (var r = 0; r < t; ++r) {
      var s = e.current();
      if (!Br(s)) return (e.pos = i), !1;
      (e.lastIntValue = 16 * e.lastIntValue + Vr(s)), e.advance();
    }
    return !0;
  };
  var Gt = function (t) {
      (this.type = t.type),
        (this.value = t.value),
        (this.start = t.start),
        (this.end = t.end),
        t.options.locations && (this.loc = new at(t, t.startLoc, t.endLoc)),
        t.options.ranges && (this.range = [t.start, t.end]);
    },
    E = T.prototype;
  E.next = function (e) {
    !e &&
      this.type.keyword &&
      this.containsEsc &&
      this.raiseRecoverable(
        this.start,
        "Escape sequence in keyword " + this.type.keyword
      ),
      this.options.onToken && this.options.onToken(new Gt(this)),
      (this.lastTokEnd = this.end),
      (this.lastTokStart = this.start),
      (this.lastTokEndLoc = this.endLoc),
      (this.lastTokStartLoc = this.startLoc),
      this.nextToken();
  };
  E.getToken = function () {
    return this.next(), new Gt(this);
  };
  typeof Symbol < "u" &&
    (E[Symbol.iterator] = function () {
      var e = this;
      return {
        next: function () {
          var t = e.getToken();
          return { done: t.type === o.eof, value: t };
        },
      };
    });
  E.nextToken = function () {
    var e = this.curContext();
    if (
      ((!e || !e.preserveSpace) && this.skipSpace(),
      (this.start = this.pos),
      this.options.locations && (this.startLoc = this.curPosition()),
      this.pos >= this.input.length)
    )
      return this.finishToken(o.eof);
    if (e.override) return e.override(this);
    this.readToken(this.fullCharCodeAtPos());
  };
  E.readToken = function (e) {
    return ce(e, this.options.ecmaVersion >= 6) || e === 92
      ? this.readWord()
      : this.getTokenFromCode(e);
  };
  E.fullCharCodeAtPos = function () {
    var e = this.input.charCodeAt(this.pos);
    if (e <= 55295 || e >= 56320) return e;
    var t = this.input.charCodeAt(this.pos + 1);
    return t <= 56319 || t >= 57344 ? e : (e << 10) + t - 56613888;
  };
  E.skipBlockComment = function () {
    var e = this.options.onComment && this.curPosition(),
      t = this.pos,
      i = this.input.indexOf("*/", (this.pos += 2));
    if (
      (i === -1 && this.raise(this.pos - 2, "Unterminated comment"),
      (this.pos = i + 2),
      this.options.locations)
    )
      for (var r = void 0, s = t; (r = or(this.input, s, this.pos)) > -1; )
        ++this.curLine, (s = this.lineStart = r);
    this.options.onComment &&
      this.options.onComment(
        !0,
        this.input.slice(t + 2, i),
        t,
        this.pos,
        e,
        this.curPosition()
      );
  };
  E.skipLineComment = function (e) {
    for (
      var t = this.pos,
        i = this.options.onComment && this.curPosition(),
        r = this.input.charCodeAt((this.pos += e));
      this.pos < this.input.length && !we(r);

    )
      r = this.input.charCodeAt(++this.pos);
    this.options.onComment &&
      this.options.onComment(
        !1,
        this.input.slice(t + e, this.pos),
        t,
        this.pos,
        i,
        this.curPosition()
      );
  };
  E.skipSpace = function () {
    e: for (; this.pos < this.input.length; ) {
      var e = this.input.charCodeAt(this.pos);
      switch (e) {
        case 32:
        case 160:
          ++this.pos;
          break;
        case 13:
          this.input.charCodeAt(this.pos + 1) === 10 && ++this.pos;
        case 10:
        case 8232:
        case 8233:
          ++this.pos,
            this.options.locations &&
              (++this.curLine, (this.lineStart = this.pos));
          break;
        case 47:
          switch (this.input.charCodeAt(this.pos + 1)) {
            case 42:
              this.skipBlockComment();
              break;
            case 47:
              this.skipLineComment(2);
              break;
            default:
              break e;
          }
          break;
        default:
          if (
            (e > 8 && e < 14) ||
            (e >= 5760 && cr.test(String.fromCharCode(e)))
          )
            ++this.pos;
          else break e;
      }
    }
  };
  E.finishToken = function (e, t) {
    (this.end = this.pos),
      this.options.locations && (this.endLoc = this.curPosition());
    var i = this.type;
    (this.type = e), (this.value = t), this.updateContext(i);
  };
  E.readToken_dot = function () {
    var e = this.input.charCodeAt(this.pos + 1);
    if (e >= 48 && e <= 57) return this.readNumber(!0);
    var t = this.input.charCodeAt(this.pos + 2);
    return this.options.ecmaVersion >= 6 && e === 46 && t === 46
      ? ((this.pos += 3), this.finishToken(o.ellipsis))
      : (++this.pos, this.finishToken(o.dot));
  };
  E.readToken_slash = function () {
    var e = this.input.charCodeAt(this.pos + 1);
    return this.exprAllowed
      ? (++this.pos, this.readRegexp())
      : e === 61
        ? this.finishOp(o.assign, 2)
        : this.finishOp(o.slash, 1);
  };
  E.readToken_mult_modulo_exp = function (e) {
    var t = this.input.charCodeAt(this.pos + 1),
      i = 1,
      r = e === 42 ? o.star : o.modulo;
    return (
      this.options.ecmaVersion >= 7 &&
        e === 42 &&
        t === 42 &&
        (++i, (r = o.starstar), (t = this.input.charCodeAt(this.pos + 2))),
      t === 61 ? this.finishOp(o.assign, i + 1) : this.finishOp(r, i)
    );
  };
  E.readToken_pipe_amp = function (e) {
    var t = this.input.charCodeAt(this.pos + 1);
    if (t === e) {
      if (this.options.ecmaVersion >= 12) {
        var i = this.input.charCodeAt(this.pos + 2);
        if (i === 61) return this.finishOp(o.assign, 3);
      }
      return this.finishOp(e === 124 ? o.logicalOR : o.logicalAND, 2);
    }
    return t === 61
      ? this.finishOp(o.assign, 2)
      : this.finishOp(e === 124 ? o.bitwiseOR : o.bitwiseAND, 1);
  };
  E.readToken_caret = function () {
    var e = this.input.charCodeAt(this.pos + 1);
    return e === 61
      ? this.finishOp(o.assign, 2)
      : this.finishOp(o.bitwiseXOR, 1);
  };
  E.readToken_plus_min = function (e) {
    var t = this.input.charCodeAt(this.pos + 1);
    return t === e
      ? t === 45 &&
        !this.inModule &&
        this.input.charCodeAt(this.pos + 2) === 62 &&
        (this.lastTokEnd === 0 ||
          Z.test(this.input.slice(this.lastTokEnd, this.pos)))
        ? (this.skipLineComment(3), this.skipSpace(), this.nextToken())
        : this.finishOp(o.incDec, 2)
      : t === 61
        ? this.finishOp(o.assign, 2)
        : this.finishOp(o.plusMin, 1);
  };
  E.readToken_lt_gt = function (e) {
    var t = this.input.charCodeAt(this.pos + 1),
      i = 1;
    return t === e
      ? ((i = e === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2),
        this.input.charCodeAt(this.pos + i) === 61
          ? this.finishOp(o.assign, i + 1)
          : this.finishOp(o.bitShift, i))
      : t === 33 &&
          e === 60 &&
          !this.inModule &&
          this.input.charCodeAt(this.pos + 2) === 45 &&
          this.input.charCodeAt(this.pos + 3) === 45
        ? (this.skipLineComment(4), this.skipSpace(), this.nextToken())
        : (t === 61 && (i = 2), this.finishOp(o.relational, i));
  };
  E.readToken_eq_excl = function (e) {
    var t = this.input.charCodeAt(this.pos + 1);
    return t === 61
      ? this.finishOp(
          o.equality,
          this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2
        )
      : e === 61 && t === 62 && this.options.ecmaVersion >= 6
        ? ((this.pos += 2), this.finishToken(o.arrow))
        : this.finishOp(e === 61 ? o.eq : o.prefix, 1);
  };
  E.readToken_question = function () {
    var e = this.options.ecmaVersion;
    if (e >= 11) {
      var t = this.input.charCodeAt(this.pos + 1);
      if (t === 46) {
        var i = this.input.charCodeAt(this.pos + 2);
        if (i < 48 || i > 57) return this.finishOp(o.questionDot, 2);
      }
      if (t === 63) {
        if (e >= 12) {
          var r = this.input.charCodeAt(this.pos + 2);
          if (r === 61) return this.finishOp(o.assign, 3);
        }
        return this.finishOp(o.coalesce, 2);
      }
    }
    return this.finishOp(o.question, 1);
  };
  E.readToken_numberSign = function () {
    var e = this.options.ecmaVersion,
      t = 35;
    if (
      e >= 13 &&
      (++this.pos, (t = this.fullCharCodeAtPos()), ce(t, !0) || t === 92)
    )
      return this.finishToken(o.privateId, this.readWord1());
    this.raise(this.pos, "Unexpected character '" + pe(t) + "'");
  };
  E.getTokenFromCode = function (e) {
    switch (e) {
      case 46:
        return this.readToken_dot();
      case 40:
        return ++this.pos, this.finishToken(o.parenL);
      case 41:
        return ++this.pos, this.finishToken(o.parenR);
      case 59:
        return ++this.pos, this.finishToken(o.semi);
      case 44:
        return ++this.pos, this.finishToken(o.comma);
      case 91:
        return ++this.pos, this.finishToken(o.bracketL);
      case 93:
        return ++this.pos, this.finishToken(o.bracketR);
      case 123:
        return ++this.pos, this.finishToken(o.braceL);
      case 125:
        return ++this.pos, this.finishToken(o.braceR);
      case 58:
        return ++this.pos, this.finishToken(o.colon);
      case 96:
        if (this.options.ecmaVersion < 6) break;
        return ++this.pos, this.finishToken(o.backQuote);
      case 48:
        var t = this.input.charCodeAt(this.pos + 1);
        if (t === 120 || t === 88) return this.readRadixNumber(16);
        if (this.options.ecmaVersion >= 6) {
          if (t === 111 || t === 79) return this.readRadixNumber(8);
          if (t === 98 || t === 66) return this.readRadixNumber(2);
        }
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
        return this.readNumber(!1);
      case 34:
      case 39:
        return this.readString(e);
      case 47:
        return this.readToken_slash();
      case 37:
      case 42:
        return this.readToken_mult_modulo_exp(e);
      case 124:
      case 38:
        return this.readToken_pipe_amp(e);
      case 94:
        return this.readToken_caret();
      case 43:
      case 45:
        return this.readToken_plus_min(e);
      case 60:
      case 62:
        return this.readToken_lt_gt(e);
      case 61:
      case 33:
        return this.readToken_eq_excl(e);
      case 63:
        return this.readToken_question();
      case 126:
        return this.finishOp(o.prefix, 1);
      case 35:
        return this.readToken_numberSign();
    }
    this.raise(this.pos, "Unexpected character '" + pe(e) + "'");
  };
  E.finishOp = function (e, t) {
    var i = this.input.slice(this.pos, this.pos + t);
    return (this.pos += t), this.finishToken(e, i);
  };
  E.readRegexp = function () {
    for (var e, t, i = this.pos; ; ) {
      this.pos >= this.input.length &&
        this.raise(i, "Unterminated regular expression");
      var r = this.input.charAt(this.pos);
      if ((Z.test(r) && this.raise(i, "Unterminated regular expression"), e))
        e = !1;
      else {
        if (r === "[") t = !0;
        else if (r === "]" && t) t = !1;
        else if (r === "/" && !t) break;
        e = r === "\\";
      }
      ++this.pos;
    }
    var s = this.input.slice(i, this.pos);
    ++this.pos;
    var a = this.pos,
      n = this.readWord1();
    this.containsEsc && this.unexpected(a);
    var u = this.regexpState || (this.regexpState = new ae(this));
    u.reset(i, s, n),
      this.validateRegExpFlags(u),
      this.validateRegExpPattern(u);
    var c = null;
    try {
      c = new RegExp(s, n);
    } catch {}
    return this.finishToken(o.regexp, { pattern: s, flags: n, value: c });
  };
  E.readInt = function (e, t, i) {
    for (
      var r = this.options.ecmaVersion >= 12 && t === void 0,
        s = i && this.input.charCodeAt(this.pos) === 48,
        a = this.pos,
        n = 0,
        u = 0,
        c = 0,
        l = t ?? 1 / 0;
      c < l;
      ++c, ++this.pos
    ) {
      var h = this.input.charCodeAt(this.pos),
        y = void 0;
      if (r && h === 95) {
        s &&
          this.raiseRecoverable(
            this.pos,
            "Numeric separator is not allowed in legacy octal numeric literals"
          ),
          u === 95 &&
            this.raiseRecoverable(
              this.pos,
              "Numeric separator must be exactly one underscore"
            ),
          c === 0 &&
            this.raiseRecoverable(
              this.pos,
              "Numeric separator is not allowed at the first of digits"
            ),
          (u = h);
        continue;
      }
      if (
        (h >= 97
          ? (y = h - 97 + 10)
          : h >= 65
            ? (y = h - 65 + 10)
            : h >= 48 && h <= 57
              ? (y = h - 48)
              : (y = 1 / 0),
        y >= e)
      )
        break;
      (u = h), (n = n * e + y);
    }
    return (
      r &&
        u === 95 &&
        this.raiseRecoverable(
          this.pos - 1,
          "Numeric separator is not allowed at the last of digits"
        ),
      this.pos === a || (t != null && this.pos - a !== t) ? null : n
    );
  };
  function Da(e, t) {
    return t ? parseInt(e, 8) : parseFloat(e.replace(/_/g, ""));
  }
  function jr(e) {
    return typeof BigInt != "function" ? null : BigInt(e.replace(/_/g, ""));
  }
  E.readRadixNumber = function (e) {
    var t = this.pos;
    this.pos += 2;
    var i = this.readInt(e);
    return (
      i == null && this.raise(this.start + 2, "Expected number in radix " + e),
      this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110
        ? ((i = jr(this.input.slice(t, this.pos))), ++this.pos)
        : ce(this.fullCharCodeAtPos()) &&
          this.raise(this.pos, "Identifier directly after number"),
      this.finishToken(o.num, i)
    );
  };
  E.readNumber = function (e) {
    var t = this.pos;
    !e &&
      this.readInt(10, void 0, !0) === null &&
      this.raise(t, "Invalid number");
    var i = this.pos - t >= 2 && this.input.charCodeAt(t) === 48;
    i && this.strict && this.raise(t, "Invalid number");
    var r = this.input.charCodeAt(this.pos);
    if (!i && !e && this.options.ecmaVersion >= 11 && r === 110) {
      var s = jr(this.input.slice(t, this.pos));
      return (
        ++this.pos,
        ce(this.fullCharCodeAtPos()) &&
          this.raise(this.pos, "Identifier directly after number"),
        this.finishToken(o.num, s)
      );
    }
    i && /[89]/.test(this.input.slice(t, this.pos)) && (i = !1),
      r === 46 &&
        !i &&
        (++this.pos, this.readInt(10), (r = this.input.charCodeAt(this.pos))),
      (r === 69 || r === 101) &&
        !i &&
        ((r = this.input.charCodeAt(++this.pos)),
        (r === 43 || r === 45) && ++this.pos,
        this.readInt(10) === null && this.raise(t, "Invalid number")),
      ce(this.fullCharCodeAtPos()) &&
        this.raise(this.pos, "Identifier directly after number");
    var a = Da(this.input.slice(t, this.pos), i);
    return this.finishToken(o.num, a);
  };
  E.readCodePoint = function () {
    var e = this.input.charCodeAt(this.pos),
      t;
    if (e === 123) {
      this.options.ecmaVersion < 6 && this.unexpected();
      var i = ++this.pos;
      (t = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos)),
        ++this.pos,
        t > 1114111 && this.invalidStringToken(i, "Code point out of bounds");
    } else t = this.readHexChar(4);
    return t;
  };
  E.readString = function (e) {
    for (var t = "", i = ++this.pos; ; ) {
      this.pos >= this.input.length &&
        this.raise(this.start, "Unterminated string constant");
      var r = this.input.charCodeAt(this.pos);
      if (r === e) break;
      r === 92
        ? ((t += this.input.slice(i, this.pos)),
          (t += this.readEscapedChar(!1)),
          (i = this.pos))
        : r === 8232 || r === 8233
          ? (this.options.ecmaVersion < 10 &&
              this.raise(this.start, "Unterminated string constant"),
            ++this.pos,
            this.options.locations &&
              (this.curLine++, (this.lineStart = this.pos)))
          : (we(r) && this.raise(this.start, "Unterminated string constant"),
            ++this.pos);
    }
    return (
      (t += this.input.slice(i, this.pos++)), this.finishToken(o.string, t)
    );
  };
  var Fr = {};
  E.tryReadTemplateToken = function () {
    this.inTemplateElement = !0;
    try {
      this.readTmplToken();
    } catch (e) {
      if (e === Fr) this.readInvalidTemplateToken();
      else throw e;
    }
    this.inTemplateElement = !1;
  };
  E.invalidStringToken = function (e, t) {
    if (this.inTemplateElement && this.options.ecmaVersion >= 9) throw Fr;
    this.raise(e, t);
  };
  E.readTmplToken = function () {
    for (var e = "", t = this.pos; ; ) {
      this.pos >= this.input.length &&
        this.raise(this.start, "Unterminated template");
      var i = this.input.charCodeAt(this.pos);
      if (i === 96 || (i === 36 && this.input.charCodeAt(this.pos + 1) === 123))
        return this.pos === this.start &&
          (this.type === o.template || this.type === o.invalidTemplate)
          ? i === 36
            ? ((this.pos += 2), this.finishToken(o.dollarBraceL))
            : (++this.pos, this.finishToken(o.backQuote))
          : ((e += this.input.slice(t, this.pos)),
            this.finishToken(o.template, e));
      if (i === 92)
        (e += this.input.slice(t, this.pos)),
          (e += this.readEscapedChar(!0)),
          (t = this.pos);
      else if (we(i)) {
        switch (((e += this.input.slice(t, this.pos)), ++this.pos, i)) {
          case 13:
            this.input.charCodeAt(this.pos) === 10 && ++this.pos;
          case 10:
            e += `
`;
            break;
          default:
            e += String.fromCharCode(i);
            break;
        }
        this.options.locations && (++this.curLine, (this.lineStart = this.pos)),
          (t = this.pos);
      } else ++this.pos;
    }
  };
  E.readInvalidTemplateToken = function () {
    for (; this.pos < this.input.length; this.pos++)
      switch (this.input[this.pos]) {
        case "\\":
          ++this.pos;
          break;
        case "$":
          if (this.input[this.pos + 1] !== "{") break;
        case "`":
          return this.finishToken(
            o.invalidTemplate,
            this.input.slice(this.start, this.pos)
          );
      }
    this.raise(this.start, "Unterminated template");
  };
  E.readEscapedChar = function (e) {
    var t = this.input.charCodeAt(++this.pos);
    switch ((++this.pos, t)) {
      case 110:
        return `
`;
      case 114:
        return "\r";
      case 120:
        return String.fromCharCode(this.readHexChar(2));
      case 117:
        return pe(this.readCodePoint());
      case 116:
        return "	";
      case 98:
        return "\b";
      case 118:
        return "\v";
      case 102:
        return "\f";
      case 13:
        this.input.charCodeAt(this.pos) === 10 && ++this.pos;
      case 10:
        return (
          this.options.locations &&
            ((this.lineStart = this.pos), ++this.curLine),
          ""
        );
      case 56:
      case 57:
        if (
          (this.strict &&
            this.invalidStringToken(this.pos - 1, "Invalid escape sequence"),
          e)
        ) {
          var i = this.pos - 1;
          this.invalidStringToken(
            i,
            "Invalid escape sequence in template string"
          );
        }
      default:
        if (t >= 48 && t <= 55) {
          var r = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0],
            s = parseInt(r, 8);
          return (
            s > 255 && ((r = r.slice(0, -1)), (s = parseInt(r, 8))),
            (this.pos += r.length - 1),
            (t = this.input.charCodeAt(this.pos)),
            (r !== "0" || t === 56 || t === 57) &&
              (this.strict || e) &&
              this.invalidStringToken(
                this.pos - 1 - r.length,
                e
                  ? "Octal literal in template string"
                  : "Octal literal in strict mode"
              ),
            String.fromCharCode(s)
          );
        }
        return we(t) ? "" : String.fromCharCode(t);
    }
  };
  E.readHexChar = function (e) {
    var t = this.pos,
      i = this.readInt(16, e);
    return (
      i === null && this.invalidStringToken(t, "Bad character escape sequence"),
      i
    );
  };
  E.readWord1 = function () {
    this.containsEsc = !1;
    for (
      var e = "", t = !0, i = this.pos, r = this.options.ecmaVersion >= 6;
      this.pos < this.input.length;

    ) {
      var s = this.fullCharCodeAtPos();
      if (ve(s, r)) this.pos += s <= 65535 ? 1 : 2;
      else if (s === 92) {
        (this.containsEsc = !0), (e += this.input.slice(i, this.pos));
        var a = this.pos;
        this.input.charCodeAt(++this.pos) !== 117 &&
          this.invalidStringToken(
            this.pos,
            "Expecting Unicode escape sequence \\uXXXX"
          ),
          ++this.pos;
        var n = this.readCodePoint();
        (t ? ce : ve)(n, r) ||
          this.invalidStringToken(a, "Invalid Unicode escape"),
          (e += pe(n)),
          (i = this.pos);
      } else break;
      t = !1;
    }
    return e + this.input.slice(i, this.pos);
  };
  E.readWord = function () {
    var e = this.readWord1(),
      t = o.name;
    return this.keywords.test(e) && (t = Mt[e]), this.finishToken(t, e);
  };
  var Oa = "8.10.0";
  T.acorn = {
    Parser: T,
    version: Oa,
    defaultOptions: Bt,
    Position: Ne,
    SourceLocation: at,
    getLineInfo: lr,
    Node: ot,
    TokenType: I,
    tokTypes: o,
    keywordTypes: Mt,
    TokContext: te,
    tokContexts: N,
    isIdentifierChar: ve,
    isIdentifierStart: ce,
    Token: Gt,
    isNewLine: we,
    lineBreak: Z,
    lineBreakG: oa,
    nonASCIIwhitespace: cr,
  };
  function Ur(e, t) {
    return T.parse(e, t);
  }
  var zt = globalThis.fetch,
    me = globalThis.WebSocket,
    Ba = globalThis.Request,
    $r = globalThis.Response,
    xe = {
      prototype: { send: me.prototype.send },
      CLOSED: me.CLOSED,
      CLOSING: me.CLOSING,
      CONNECTING: me.CONNECTING,
      OPEN: me.OPEN,
    },
    Va = 20,
    Ma = [101, 204, 205, 304],
    ja = [301, 302, 303, 307, 308],
    lt = class extends Error {
      constructor(i, r) {
        super(r.message || r.code);
        z(this, "status");
        z(this, "body");
        (this.status = i), (this.body = r);
      }
    },
    Kt = class {
      constructor(t, i) {
        z(this, "base");
        this.base = new URL(`./v${t}/`, i);
      }
    };
  function ge(e, t) {
    let i = (e & 65535) + (t & 65535);
    return (((e >> 16) + (t >> 16) + (i >> 16)) << 16) | (i & 65535);
  }
  function Fa(e, t) {
    return (e << t) | (e >>> (32 - t));
  }
  function ht(e, t, i, r, s, a) {
    return ge(Fa(ge(ge(t, e), ge(r, a)), s), i);
  }
  function V(e, t, i, r, s, a, n) {
    return ht((t & i) | (~t & r), e, t, s, a, n);
  }
  function M(e, t, i, r, s, a, n) {
    return ht((t & r) | (i & ~r), e, t, s, a, n);
  }
  function j(e, t, i, r, s, a, n) {
    return ht(t ^ i ^ r, e, t, s, a, n);
  }
  function F(e, t, i, r, s, a, n) {
    return ht(i ^ (t | ~r), e, t, s, a, n);
  }
  function ut(e, t) {
    (e[t >> 5] |= 128 << t % 32), (e[(((t + 64) >>> 9) << 4) + 14] = t);
    let i = 1732584193,
      r = -271733879,
      s = -1732584194,
      a = 271733878;
    for (let n = 0; n < e.length; n += 16) {
      let u = i,
        c = r,
        l = s,
        h = a;
      (i = V(i, r, s, a, e[n], 7, -680876936)),
        (a = V(a, i, r, s, e[n + 1], 12, -389564586)),
        (s = V(s, a, i, r, e[n + 2], 17, 606105819)),
        (r = V(r, s, a, i, e[n + 3], 22, -1044525330)),
        (i = V(i, r, s, a, e[n + 4], 7, -176418897)),
        (a = V(a, i, r, s, e[n + 5], 12, 1200080426)),
        (s = V(s, a, i, r, e[n + 6], 17, -1473231341)),
        (r = V(r, s, a, i, e[n + 7], 22, -45705983)),
        (i = V(i, r, s, a, e[n + 8], 7, 1770035416)),
        (a = V(a, i, r, s, e[n + 9], 12, -1958414417)),
        (s = V(s, a, i, r, e[n + 10], 17, -42063)),
        (r = V(r, s, a, i, e[n + 11], 22, -1990404162)),
        (i = V(i, r, s, a, e[n + 12], 7, 1804603682)),
        (a = V(a, i, r, s, e[n + 13], 12, -40341101)),
        (s = V(s, a, i, r, e[n + 14], 17, -1502002290)),
        (r = V(r, s, a, i, e[n + 15], 22, 1236535329)),
        (i = M(i, r, s, a, e[n + 1], 5, -165796510)),
        (a = M(a, i, r, s, e[n + 6], 9, -1069501632)),
        (s = M(s, a, i, r, e[n + 11], 14, 643717713)),
        (r = M(r, s, a, i, e[n], 20, -373897302)),
        (i = M(i, r, s, a, e[n + 5], 5, -701558691)),
        (a = M(a, i, r, s, e[n + 10], 9, 38016083)),
        (s = M(s, a, i, r, e[n + 15], 14, -660478335)),
        (r = M(r, s, a, i, e[n + 4], 20, -405537848)),
        (i = M(i, r, s, a, e[n + 9], 5, 568446438)),
        (a = M(a, i, r, s, e[n + 14], 9, -1019803690)),
        (s = M(s, a, i, r, e[n + 3], 14, -187363961)),
        (r = M(r, s, a, i, e[n + 8], 20, 1163531501)),
        (i = M(i, r, s, a, e[n + 13], 5, -1444681467)),
        (a = M(a, i, r, s, e[n + 2], 9, -51403784)),
        (s = M(s, a, i, r, e[n + 7], 14, 1735328473)),
        (r = M(r, s, a, i, e[n + 12], 20, -1926607734)),
        (i = j(i, r, s, a, e[n + 5], 4, -378558)),
        (a = j(a, i, r, s, e[n + 8], 11, -2022574463)),
        (s = j(s, a, i, r, e[n + 11], 16, 1839030562)),
        (r = j(r, s, a, i, e[n + 14], 23, -35309556)),
        (i = j(i, r, s, a, e[n + 1], 4, -1530992060)),
        (a = j(a, i, r, s, e[n + 4], 11, 1272893353)),
        (s = j(s, a, i, r, e[n + 7], 16, -155497632)),
        (r = j(r, s, a, i, e[n + 10], 23, -1094730640)),
        (i = j(i, r, s, a, e[n + 13], 4, 681279174)),
        (a = j(a, i, r, s, e[n], 11, -358537222)),
        (s = j(s, a, i, r, e[n + 3], 16, -722521979)),
        (r = j(r, s, a, i, e[n + 6], 23, 76029189)),
        (i = j(i, r, s, a, e[n + 9], 4, -640364487)),
        (a = j(a, i, r, s, e[n + 12], 11, -421815835)),
        (s = j(s, a, i, r, e[n + 15], 16, 530742520)),
        (r = j(r, s, a, i, e[n + 2], 23, -995338651)),
        (i = F(i, r, s, a, e[n], 6, -198630844)),
        (a = F(a, i, r, s, e[n + 7], 10, 1126891415)),
        (s = F(s, a, i, r, e[n + 14], 15, -1416354905)),
        (r = F(r, s, a, i, e[n + 5], 21, -57434055)),
        (i = F(i, r, s, a, e[n + 12], 6, 1700485571)),
        (a = F(a, i, r, s, e[n + 3], 10, -1894986606)),
        (s = F(s, a, i, r, e[n + 10], 15, -1051523)),
        (r = F(r, s, a, i, e[n + 1], 21, -2054922799)),
        (i = F(i, r, s, a, e[n + 8], 6, 1873313359)),
        (a = F(a, i, r, s, e[n + 15], 10, -30611744)),
        (s = F(s, a, i, r, e[n + 6], 15, -1560198380)),
        (r = F(r, s, a, i, e[n + 13], 21, 1309151649)),
        (i = F(i, r, s, a, e[n + 4], 6, -145523070)),
        (a = F(a, i, r, s, e[n + 11], 10, -1120210379)),
        (s = F(s, a, i, r, e[n + 2], 15, 718787259)),
        (r = F(r, s, a, i, e[n + 9], 21, -343485551)),
        (i = ge(i, u)),
        (r = ge(r, c)),
        (s = ge(s, l)),
        (a = ge(a, h));
    }
    return [i, r, s, a];
  }
  function Hr(e) {
    let t = "",
      i = e.length * 32;
    for (let r = 0; r < i; r += 8)
      t += String.fromCharCode((e[r >> 5] >>> r % 32) & 255);
    return t;
  }
  function Qt(e) {
    let t = [],
      i = e.length >> 2;
    for (let s = 0; s < i; s += 1) t[s] = 0;
    let r = e.length * 8;
    for (let s = 0; s < r; s += 8)
      t[s >> 5] |= (e.charCodeAt(s / 8) & 255) << s % 32;
    return t;
  }
  function Ua(e) {
    return Hr(ut(Qt(e), e.length * 8));
  }
  function $a(e, t) {
    let i = Qt(e),
      r = [],
      s = [];
    i.length > 16 && (i = ut(i, e.length * 8));
    for (let n = 0; n < 16; n += 1)
      (r[n] = i[n] ^ 909522486), (s[n] = i[n] ^ 1549556828);
    let a = ut(r.concat(Qt(t)), 512 + t.length * 8);
    return Hr(ut(s.concat(a), 512 + 128));
  }
  function Wr(e) {
    let t = "0123456789abcdef",
      i = "";
    for (let r = 0; r < e.length; r += 1) {
      let s = e.charCodeAt(r);
      i += t.charAt((s >>> 4) & 15) + t.charAt(s & 15);
    }
    return i;
  }
  function Yt(e) {
    return unescape(encodeURIComponent(e));
  }
  function Gr(e) {
    return Ua(Yt(e));
  }
  function Ha(e) {
    return Wr(Gr(e));
  }
  function qr(e, t) {
    return $a(Yt(e), Yt(t));
  }
  function Wa(e, t) {
    return Wr(qr(e, t));
  }
  function Ga(e, t, i) {
    return t ? (i ? qr(t, e) : Wa(t, e)) : i ? Gr(e) : Ha(e);
  }
  var qt = 3072;
  function qa(e) {
    let t = new Headers(e);
    if (e.has("x-bare-headers")) {
      let i = e.get("x-bare-headers");
      if (i.length > qt) {
        t.delete("x-bare-headers");
        let r = 0;
        for (let s = 0; s < i.length; s += qt) {
          let a = i.slice(s, s + qt),
            n = r++;
          t.set(`x-bare-headers-${n}`, `;${a}`);
        }
      }
    }
    return t;
  }
  function za(e) {
    let t = new Headers(e),
      i = "x-bare-headers";
    if (e.has(`${i}-0`)) {
      let r = [];
      for (let [s, a] of e) {
        if (!s.startsWith(i)) continue;
        if (!a.startsWith(";"))
          throw new lt(400, {
            code: "INVALID_BARE_HEADER",
            id: `request.headers.${s}`,
            message: "Value didn't begin with semi-colon.",
          });
        let n = parseInt(s.slice(i.length + 1));
        (r[n] = a.slice(1)), t.delete(s);
      }
      t.set(i, r.join(""));
    }
    return t;
  }
  var Xt = class extends Kt {
      constructor(i) {
        super(3, i);
        z(this, "ws");
        z(this, "http");
        (this.ws = new URL(this.base)),
          (this.http = new URL(this.base)),
          this.ws.protocol === "https:"
            ? (this.ws.protocol = "wss:")
            : (this.ws.protocol = "ws:");
      }
      connect(i, r, s, a, n) {
        let u = new me(this.ws),
          c = () => {
            u.removeEventListener("close", l),
              u.removeEventListener("message", h);
          },
          l = () => {
            c();
          },
          h = (y) => {
            if ((c(), typeof y.data != "string"))
              throw new TypeError(
                "the first websocket message was not a text frame"
              );
            let S = JSON.parse(y.data);
            if (S.type !== "open")
              throw new TypeError("message was not of open type");
            y.stopImmediatePropagation(),
              a({ protocol: S.protocol, setCookies: S.setCookies }),
              n(xe.OPEN),
              u.dispatchEvent(new Event("open"));
          };
        return (
          u.addEventListener("close", l),
          u.addEventListener("message", h),
          u.addEventListener(
            "open",
            (y) => {
              y.stopImmediatePropagation(),
                n(xe.CONNECTING),
                s().then((S) =>
                  xe.prototype.send.call(
                    u,
                    JSON.stringify({
                      type: "connect",
                      remote: i.toString(),
                      protocols: r,
                      headers: S,
                      forwardHeaders: [],
                    })
                  )
                );
            },
            { once: !0 }
          ),
          u
        );
      }
      async request(i, r, s, a, n, u, c) {
        if (a.protocol.startsWith("blob:")) {
          let f = await zt(a),
            O = new $r(f.body, f);
          return (
            (O.rawHeaders = Object.fromEntries(f.headers)),
            (O.rawResponse = f),
            O
          );
        }
        let l = {};
        if (r instanceof Headers) for (let [f, O] of r) l[f] = O;
        else for (let f in r) l[f] = r[f];
        let h = { credentials: "omit", method: i, signal: c };
        n !== "only-if-cached" && (h.cache = n),
          s !== void 0 && (h.body = s),
          u !== void 0 && (h.duplex = u),
          (h.headers = this.createBareHeaders(a, l));
        let y = await zt(this.http + "?cache=" + Ga(a.toString()), h),
          S = await this.readBareResponse(y),
          x = new $r(Ma.includes(S.status) ? void 0 : y.body, {
            status: S.status,
            statusText: S.statusText ?? void 0,
            headers: new Headers(S.headers),
          });
        return (x.rawHeaders = S.headers), (x.rawResponse = y), x;
      }
      async readBareResponse(i) {
        if (!i.ok) throw new lt(i.status, await i.json());
        let r = za(i.headers),
          s = {},
          a = r.get("x-bare-status");
        a !== null && (s.status = parseInt(a));
        let n = r.get("x-bare-status-text");
        n !== null && (s.statusText = n);
        let u = r.get("x-bare-headers");
        return u !== null && (s.headers = JSON.parse(u)), s;
      }
      createBareHeaders(i, r, s = [], a = [], n = []) {
        let u = new Headers();
        u.set("x-bare-url", i.toString()),
          u.set("x-bare-headers", JSON.stringify(r));
        for (let c of s) u.append("x-bare-forward-headers", c);
        for (let c of a) u.append("x-bare-pass-headers", c);
        for (let c of n) u.append("x-bare-pass-status", c.toString());
        return qa(u), u;
      }
    },
    Ka =
      "!#$%&'*+-.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ^_`abcdefghijklmnopqrstuvwxyz|~";
  function Qa(e) {
    for (let t = 0; t < e.length; t++) {
      let i = e[t];
      if (!Ka.includes(i)) return !1;
    }
    return !0;
  }
  var Ya = [["v3", Xt]];
  async function zr(e, t) {
    let i = await zt(e, { signal: t });
    if (!i.ok)
      throw new Error(
        `Unable to fetch Bare meta: ${i.status} ${await i.text()}`
      );
    return await i.json();
  }
  var Xa = Object.getOwnPropertyDescriptor(me.prototype, "readyState").get,
    Ja = ["ws:", "wss:"],
    Be = class {
      constructor(t, i) {
        z(this, "manifest");
        z(this, "client");
        z(this, "server");
        z(this, "working");
        z(this, "onDemand");
        z(this, "onDemandSignal");
        (this.server = new URL(t)),
          !i || i instanceof AbortSignal
            ? ((this.onDemand = !0), (this.onDemandSignal = i))
            : ((this.onDemand = !1), this.loadManifest(i));
      }
      loadManifest(t) {
        return (
          (this.manifest = t), (this.client = this.getClient()), this.client
        );
      }
      demand() {
        return this.onDemand
          ? (this.working ||
              (this.working = zr(this.server, this.onDemandSignal)
                .then((t) => this.loadManifest(t))
                .catch((t) => {
                  throw (delete this.working, t);
                })),
            this.working)
          : this.client;
      }
      getClient() {
        for (let [t, i] of Ya)
          if (this.manifest.versions.includes(t)) return new i(this.server);
        throw new Error(
          "Unable to find compatible client version. Starting from v2.0.0, @tomphttp/bare-client only supports Bare servers v3+. For more information, see https://github.com/tomphttp/bare-client/"
        );
      }
      createWebSocket(t, i = [], r) {
        if (!this.client)
          throw new TypeError(
            "You need to wait for the client to finish fetching the manifest before creating any WebSockets. Try caching the manifest data before making this request."
          );
        try {
          t = new URL(t);
        } catch {
          throw new DOMException(
            `Faiiled to construct 'WebSocket': The URL '${t}' is invalid.`
          );
        }
        if (!Ja.includes(t.protocol))
          throw new DOMException(
            `Failed to construct 'WebSocket': The URL's scheme must be either 'ws' or 'wss'. '${t.protocol}' is not allowed.`
          );
        Array.isArray(i) || (i = [i]), (i = i.map(String));
        for (let h of i)
          if (!Qa(h))
            throw new DOMException(
              `Failed to construct 'WebSocket': The subprotocol '${h}' is invalid.`
            );
        let s = this.client.connect(
            t,
            i,
            async () => {
              let h =
                  typeof r.headers == "function"
                    ? await r.headers()
                    : r.headers || {},
                y = h instanceof Headers ? Object.fromEntries(h) : h;
              return (
                (y.Host = t.host),
                (y.Pragma = "no-cache"),
                (y["Cache-Control"] = "no-cache"),
                (y.Upgrade = "websocket"),
                (y.Connection = "Upgrade"),
                y
              );
            },
            (h) => {
              (a = h.protocol),
                r.setCookiesCallback && r.setCookiesCallback(h.setCookies);
            },
            (h) => {
              n = h;
            },
            r.webSocketImpl || me
          ),
          a = "",
          n = xe.CONNECTING,
          u = () => {
            let h = Xa.call(s);
            return h === xe.OPEN ? n : h;
          };
        r.readyStateHook
          ? r.readyStateHook(s, u)
          : Object.defineProperty(s, "readyState", {
              get: u,
              configurable: !0,
              enumerable: !0,
            });
        let c = () => {
          if (u() === xe.CONNECTING)
            return new DOMException(
              "Failed to execute 'send' on 'WebSocket': Still in CONNECTING state."
            );
        };
        r.sendErrorHook
          ? r.sendErrorHook(s, c)
          : (s.send = function (...h) {
              let y = c();
              if (y) throw y;
              xe.prototype.send.call(this, ...h);
            }),
          r.urlHook
            ? r.urlHook(s, t)
            : Object.defineProperty(s, "url", {
                get: () => t.toString(),
                configurable: !0,
                enumerable: !0,
              });
        let l = () => a;
        return (
          r.protocolHook
            ? r.protocolHook(s, l)
            : Object.defineProperty(s, "protocol", {
                get: l,
                configurable: !0,
                enumerable: !0,
              }),
          s
        );
      }
      async fetch(t, i) {
        let r = Za(t) ? new Ba(t, i) : t,
          s = i?.headers || r.headers,
          a = s instanceof Headers ? Object.fromEntries(s) : s,
          n = i?.duplex,
          u = i?.body || r.body,
          c = new URL(r.url),
          l = await this.demand();
        for (let h = 0; ; h++) {
          "host" in a ? (a.host = c.host) : (a.Host = c.host);
          let y = await l.request(r.method, a, u, c, r.cache, n, r.signal);
          y.finalURL = c.toString();
          let S = i?.redirect || r.redirect;
          if (ja.includes(y.status))
            switch (S) {
              case "follow": {
                let x = y.headers.get("location");
                if (Va > h && x !== null) {
                  c = new URL(x, c);
                  continue;
                } else throw new TypeError("Failed to fetch");
              }
              case "error":
                throw new TypeError("Failed to fetch");
              case "manual":
                return y;
            }
          else return y;
        }
      }
    };
  function Za(e) {
    return typeof e == "string" || e instanceof URL;
  }
  async function Kr(e, t) {
    let i = await zr(e, t);
    return new Be(e, i);
  }
  var xn = Je(Qr(), 1),
    ns = Je(Xr(), 1);
  var { stringify: ln } = JSON;
  if (!String.prototype.repeat)
    throw new Error(
      "String.prototype.repeat is undefined, see https://github.com/davidbonnet/astring#installation"
    );
  if (!String.prototype.endsWith)
    throw new Error(
      "String.prototype.endsWith is undefined, see https://github.com/davidbonnet/astring#installation"
    );
  var pt = {
      "||": 2,
      "??": 3,
      "&&": 4,
      "|": 5,
      "^": 6,
      "&": 7,
      "==": 8,
      "!=": 8,
      "===": 8,
      "!==": 8,
      "<": 9,
      ">": 9,
      "<=": 9,
      ">=": 9,
      in: 9,
      instanceof: 9,
      "<<": 10,
      ">>": 10,
      ">>>": 10,
      "+": 11,
      "-": 11,
      "*": 12,
      "%": 12,
      "/": 12,
      "**": 13,
    },
    ie = 17,
    hn = {
      ArrayExpression: 20,
      TaggedTemplateExpression: 20,
      ThisExpression: 20,
      Identifier: 20,
      PrivateIdentifier: 20,
      Literal: 18,
      TemplateLiteral: 20,
      Super: 20,
      SequenceExpression: 20,
      MemberExpression: 19,
      ChainExpression: 19,
      CallExpression: 19,
      NewExpression: 19,
      ArrowFunctionExpression: ie,
      ClassExpression: ie,
      FunctionExpression: ie,
      ObjectExpression: ie,
      UpdateExpression: 16,
      UnaryExpression: 15,
      AwaitExpression: 15,
      BinaryExpression: 14,
      LogicalExpression: 13,
      ConditionalExpression: 4,
      AssignmentExpression: 3,
      YieldExpression: 2,
      RestElement: 1,
    };
  function ke(e, t) {
    let { generator: i } = e;
    if ((e.write("("), t != null && t.length > 0)) {
      i[t[0].type](t[0], e);
      let { length: r } = t;
      for (let s = 1; s < r; s++) {
        let a = t[s];
        e.write(", "), i[a.type](a, e);
      }
    }
    e.write(")");
  }
  function ss(e, t, i, r) {
    let s = e.expressionsPrecedence[t.type];
    if (s === ie) return !0;
    let a = e.expressionsPrecedence[i.type];
    return s !== a
      ? (!r && s === 15 && a === 14 && i.operator === "**") || s < a
      : s !== 13 && s !== 14
        ? !1
        : t.operator === "**" && i.operator === "**"
          ? !r
          : s === 13 && a === 13 && (t.operator === "??" || i.operator === "??")
            ? !0
            : r
              ? pt[t.operator] <= pt[i.operator]
              : pt[t.operator] < pt[i.operator];
  }
  function dt(e, t, i, r) {
    let { generator: s } = e;
    ss(e, t, i, r)
      ? (e.write("("), s[t.type](t, e), e.write(")"))
      : s[t.type](t, e);
  }
  function fn(e, t, i, r) {
    let s = t.split(`
`),
      a = s.length - 1;
    if ((e.write(s[0].trim()), a > 0)) {
      e.write(r);
      for (let n = 1; n < a; n++) e.write(i + s[n].trim() + r);
      e.write(i + s[a].trim());
    }
  }
  function H(e, t, i, r) {
    let { length: s } = t;
    for (let a = 0; a < s; a++) {
      let n = t[a];
      e.write(i),
        n.type[0] === "L"
          ? e.write(
              "// " +
                n.value.trim() +
                `
`,
              n
            )
          : (e.write("/*"), fn(e, n.value, i, r), e.write("*/" + r));
    }
  }
  function pn(e) {
    let t = e;
    for (; t != null; ) {
      let { type: i } = t;
      if (i[0] === "C" && i[1] === "a") return !0;
      if (i[0] === "M" && i[1] === "e" && i[2] === "m") t = t.object;
      else return !1;
    }
  }
  function ti(e, t) {
    let { generator: i } = e,
      { declarations: r } = t;
    e.write(t.kind + " ");
    let { length: s } = r;
    if (s > 0) {
      i.VariableDeclarator(r[0], e);
      for (let a = 1; a < s; a++) e.write(", "), i.VariableDeclarator(r[a], e);
    }
  }
  var Jr,
    Zr,
    es,
    ts,
    is,
    rs,
    dn = {
      Program(e, t) {
        let i = t.indent.repeat(t.indentLevel),
          { lineEnd: r, writeComments: s } = t;
        s && e.comments != null && H(t, e.comments, i, r);
        let a = e.body,
          { length: n } = a;
        for (let u = 0; u < n; u++) {
          let c = a[u];
          s && c.comments != null && H(t, c.comments, i, r),
            t.write(i),
            this[c.type](c, t),
            t.write(r);
        }
        s && e.trailingComments != null && H(t, e.trailingComments, i, r);
      },
      BlockStatement: (rs = function (e, t) {
        let i = t.indent.repeat(t.indentLevel++),
          { lineEnd: r, writeComments: s } = t,
          a = i + t.indent;
        t.write("{");
        let n = e.body;
        if (n != null && n.length > 0) {
          t.write(r), s && e.comments != null && H(t, e.comments, a, r);
          let { length: u } = n;
          for (let c = 0; c < u; c++) {
            let l = n[c];
            s && l.comments != null && H(t, l.comments, a, r),
              t.write(a),
              this[l.type](l, t),
              t.write(r);
          }
          t.write(i);
        } else
          s &&
            e.comments != null &&
            (t.write(r), H(t, e.comments, a, r), t.write(i));
        s && e.trailingComments != null && H(t, e.trailingComments, a, r),
          t.write("}"),
          t.indentLevel--;
      }),
      ClassBody: rs,
      StaticBlock(e, t) {
        t.write("static "), this.BlockStatement(e, t);
      },
      EmptyStatement(e, t) {
        t.write(";");
      },
      ExpressionStatement(e, t) {
        let i = t.expressionsPrecedence[e.expression.type];
        i === ie || (i === 3 && e.expression.left.type[0] === "O")
          ? (t.write("("),
            this[e.expression.type](e.expression, t),
            t.write(")"))
          : this[e.expression.type](e.expression, t),
          t.write(";");
      },
      IfStatement(e, t) {
        t.write("if ("),
          this[e.test.type](e.test, t),
          t.write(") "),
          this[e.consequent.type](e.consequent, t),
          e.alternate != null &&
            (t.write(" else "), this[e.alternate.type](e.alternate, t));
      },
      LabeledStatement(e, t) {
        this[e.label.type](e.label, t),
          t.write(": "),
          this[e.body.type](e.body, t);
      },
      BreakStatement(e, t) {
        t.write("break"),
          e.label != null && (t.write(" "), this[e.label.type](e.label, t)),
          t.write(";");
      },
      ContinueStatement(e, t) {
        t.write("continue"),
          e.label != null && (t.write(" "), this[e.label.type](e.label, t)),
          t.write(";");
      },
      WithStatement(e, t) {
        t.write("with ("),
          this[e.object.type](e.object, t),
          t.write(") "),
          this[e.body.type](e.body, t);
      },
      SwitchStatement(e, t) {
        let i = t.indent.repeat(t.indentLevel++),
          { lineEnd: r, writeComments: s } = t;
        t.indentLevel++;
        let a = i + t.indent,
          n = a + t.indent;
        t.write("switch ("),
          this[e.discriminant.type](e.discriminant, t),
          t.write(") {" + r);
        let { cases: u } = e,
          { length: c } = u;
        for (let l = 0; l < c; l++) {
          let h = u[l];
          s && h.comments != null && H(t, h.comments, a, r),
            h.test
              ? (t.write(a + "case "),
                this[h.test.type](h.test, t),
                t.write(":" + r))
              : t.write(a + "default:" + r);
          let { consequent: y } = h,
            { length: S } = y;
          for (let x = 0; x < S; x++) {
            let f = y[x];
            s && f.comments != null && H(t, f.comments, n, r),
              t.write(n),
              this[f.type](f, t),
              t.write(r);
          }
        }
        (t.indentLevel -= 2), t.write(i + "}");
      },
      ReturnStatement(e, t) {
        t.write("return"),
          e.argument && (t.write(" "), this[e.argument.type](e.argument, t)),
          t.write(";");
      },
      ThrowStatement(e, t) {
        t.write("throw "), this[e.argument.type](e.argument, t), t.write(";");
      },
      TryStatement(e, t) {
        if ((t.write("try "), this[e.block.type](e.block, t), e.handler)) {
          let { handler: i } = e;
          i.param == null
            ? t.write(" catch ")
            : (t.write(" catch ("),
              this[i.param.type](i.param, t),
              t.write(") ")),
            this[i.body.type](i.body, t);
        }
        e.finalizer &&
          (t.write(" finally "), this[e.finalizer.type](e.finalizer, t));
      },
      WhileStatement(e, t) {
        t.write("while ("),
          this[e.test.type](e.test, t),
          t.write(") "),
          this[e.body.type](e.body, t);
      },
      DoWhileStatement(e, t) {
        t.write("do "),
          this[e.body.type](e.body, t),
          t.write(" while ("),
          this[e.test.type](e.test, t),
          t.write(");");
      },
      ForStatement(e, t) {
        if ((t.write("for ("), e.init != null)) {
          let { init: i } = e;
          i.type[0] === "V" ? ti(t, i) : this[i.type](i, t);
        }
        t.write("; "),
          e.test && this[e.test.type](e.test, t),
          t.write("; "),
          e.update && this[e.update.type](e.update, t),
          t.write(") "),
          this[e.body.type](e.body, t);
      },
      ForInStatement: (Jr = function (e, t) {
        t.write(`for ${e.await ? "await " : ""}(`);
        let { left: i } = e;
        i.type[0] === "V" ? ti(t, i) : this[i.type](i, t),
          t.write(e.type[3] === "I" ? " in " : " of "),
          this[e.right.type](e.right, t),
          t.write(") "),
          this[e.body.type](e.body, t);
      }),
      ForOfStatement: Jr,
      DebuggerStatement(e, t) {
        t.write("debugger;", e);
      },
      FunctionDeclaration: (Zr = function (e, t) {
        t.write(
          (e.async ? "async " : "") +
            (e.generator ? "function* " : "function ") +
            (e.id ? e.id.name : ""),
          e
        ),
          ke(t, e.params),
          t.write(" "),
          this[e.body.type](e.body, t);
      }),
      FunctionExpression: Zr,
      VariableDeclaration(e, t) {
        ti(t, e), t.write(";");
      },
      VariableDeclarator(e, t) {
        this[e.id.type](e.id, t),
          e.init != null && (t.write(" = "), this[e.init.type](e.init, t));
      },
      ClassDeclaration(e, t) {
        if (
          (t.write("class " + (e.id ? `${e.id.name} ` : ""), e), e.superClass)
        ) {
          t.write("extends ");
          let { superClass: i } = e,
            { type: r } = i,
            s = t.expressionsPrecedence[r];
          (r[0] !== "C" || r[1] !== "l" || r[5] !== "E") &&
          (s === ie || s < t.expressionsPrecedence.ClassExpression)
            ? (t.write("("), this[e.superClass.type](i, t), t.write(")"))
            : this[i.type](i, t),
            t.write(" ");
        }
        this.ClassBody(e.body, t);
      },
      ImportDeclaration(e, t) {
        t.write("import ");
        let { specifiers: i } = e,
          { length: r } = i,
          s = 0;
        if (r > 0) {
          for (; s < r; ) {
            s > 0 && t.write(", ");
            let a = i[s],
              n = a.type[6];
            if (n === "D") t.write(a.local.name, a), s++;
            else if (n === "N") t.write("* as " + a.local.name, a), s++;
            else break;
          }
          if (s < r) {
            for (t.write("{"); ; ) {
              let a = i[s],
                { name: n } = a.imported;
              if (
                (t.write(n, a),
                n !== a.local.name && t.write(" as " + a.local.name),
                ++s < r)
              )
                t.write(", ");
              else break;
            }
            t.write("}");
          }
          t.write(" from ");
        }
        this.Literal(e.source, t), t.write(";");
      },
      ImportExpression(e, t) {
        t.write("import("), this[e.source.type](e.source, t), t.write(")");
      },
      ExportDefaultDeclaration(e, t) {
        t.write("export default "),
          this[e.declaration.type](e.declaration, t),
          t.expressionsPrecedence[e.declaration.type] != null &&
            e.declaration.type[0] !== "F" &&
            t.write(";");
      },
      ExportNamedDeclaration(e, t) {
        if ((t.write("export "), e.declaration))
          this[e.declaration.type](e.declaration, t);
        else {
          t.write("{");
          let { specifiers: i } = e,
            { length: r } = i;
          if (r > 0)
            for (let s = 0; ; ) {
              let a = i[s],
                { name: n } = a.local;
              if (
                (t.write(n, a),
                n !== a.exported.name && t.write(" as " + a.exported.name),
                ++s < r)
              )
                t.write(", ");
              else break;
            }
          t.write("}"),
            e.source && (t.write(" from "), this.Literal(e.source, t)),
            t.write(";");
        }
      },
      ExportAllDeclaration(e, t) {
        e.exported != null
          ? t.write("export * as " + e.exported.name + " from ")
          : t.write("export * from "),
          this.Literal(e.source, t),
          t.write(";");
      },
      MethodDefinition(e, t) {
        e.static && t.write("static ");
        let i = e.kind[0];
        (i === "g" || i === "s") && t.write(e.kind + " "),
          e.value.async && t.write("async "),
          e.value.generator && t.write("*"),
          e.computed
            ? (t.write("["), this[e.key.type](e.key, t), t.write("]"))
            : this[e.key.type](e.key, t),
          ke(t, e.value.params),
          t.write(" "),
          this[e.value.body.type](e.value.body, t);
      },
      ClassExpression(e, t) {
        this.ClassDeclaration(e, t);
      },
      ArrowFunctionExpression(e, t) {
        t.write(e.async ? "async " : "", e);
        let { params: i } = e;
        i != null &&
          (i.length === 1 && i[0].type[0] === "I"
            ? t.write(i[0].name, i[0])
            : ke(t, e.params)),
          t.write(" => "),
          e.body.type[0] === "O"
            ? (t.write("("), this.ObjectExpression(e.body, t), t.write(")"))
            : this[e.body.type](e.body, t);
      },
      ThisExpression(e, t) {
        t.write("this", e);
      },
      Super(e, t) {
        t.write("super", e);
      },
      RestElement: (es = function (e, t) {
        t.write("..."), this[e.argument.type](e.argument, t);
      }),
      SpreadElement: es,
      YieldExpression(e, t) {
        t.write(e.delegate ? "yield*" : "yield"),
          e.argument && (t.write(" "), this[e.argument.type](e.argument, t));
      },
      AwaitExpression(e, t) {
        t.write("await ", e), dt(t, e.argument, e);
      },
      TemplateLiteral(e, t) {
        let { quasis: i, expressions: r } = e;
        t.write("`");
        let { length: s } = r;
        for (let n = 0; n < s; n++) {
          let u = r[n],
            c = i[n];
          t.write(c.value.raw, c),
            t.write("${"),
            this[u.type](u, t),
            t.write("}");
        }
        let a = i[i.length - 1];
        t.write(a.value.raw, a), t.write("`");
      },
      TemplateElement(e, t) {
        t.write(e.value.raw, e);
      },
      TaggedTemplateExpression(e, t) {
        dt(t, e.tag, e), this[e.quasi.type](e.quasi, t);
      },
      ArrayExpression: (is = function (e, t) {
        if ((t.write("["), e.elements.length > 0)) {
          let { elements: i } = e,
            { length: r } = i;
          for (let s = 0; ; ) {
            let a = i[s];
            if ((a != null && this[a.type](a, t), ++s < r)) t.write(", ");
            else {
              a == null && t.write(", ");
              break;
            }
          }
        }
        t.write("]");
      }),
      ArrayPattern: is,
      ObjectExpression(e, t) {
        let i = t.indent.repeat(t.indentLevel++),
          { lineEnd: r, writeComments: s } = t,
          a = i + t.indent;
        if ((t.write("{"), e.properties.length > 0)) {
          t.write(r), s && e.comments != null && H(t, e.comments, a, r);
          let n = "," + r,
            { properties: u } = e,
            { length: c } = u;
          for (let l = 0; ; ) {
            let h = u[l];
            if (
              (s && h.comments != null && H(t, h.comments, a, r),
              t.write(a),
              this[h.type](h, t),
              ++l < c)
            )
              t.write(n);
            else break;
          }
          t.write(r),
            s && e.trailingComments != null && H(t, e.trailingComments, a, r),
            t.write(i + "}");
        } else
          s
            ? e.comments != null
              ? (t.write(r),
                H(t, e.comments, a, r),
                e.trailingComments != null && H(t, e.trailingComments, a, r),
                t.write(i + "}"))
              : e.trailingComments != null
                ? (t.write(r), H(t, e.trailingComments, a, r), t.write(i + "}"))
                : t.write("}")
            : t.write("}");
        t.indentLevel--;
      },
      Property(e, t) {
        e.method || e.kind[0] !== "i"
          ? this.MethodDefinition(e, t)
          : (e.shorthand ||
              (e.computed
                ? (t.write("["), this[e.key.type](e.key, t), t.write("]"))
                : this[e.key.type](e.key, t),
              t.write(": ")),
            this[e.value.type](e.value, t));
      },
      PropertyDefinition(e, t) {
        if (
          (e.static && t.write("static "),
          e.computed && t.write("["),
          this[e.key.type](e.key, t),
          e.computed && t.write("]"),
          e.value == null)
        ) {
          e.key.type[0] !== "F" && t.write(";");
          return;
        }
        t.write(" = "), this[e.value.type](e.value, t), t.write(";");
      },
      ObjectPattern(e, t) {
        if ((t.write("{"), e.properties.length > 0)) {
          let { properties: i } = e,
            { length: r } = i;
          for (let s = 0; this[i[s].type](i[s], t), ++s < r; ) t.write(", ");
        }
        t.write("}");
      },
      SequenceExpression(e, t) {
        ke(t, e.expressions);
      },
      UnaryExpression(e, t) {
        if (e.prefix) {
          let {
            operator: i,
            argument: r,
            argument: { type: s },
          } = e;
          t.write(i);
          let a = ss(t, r, e);
          !a &&
            (i.length > 1 ||
              (s[0] === "U" &&
                (s[1] === "n" || s[1] === "p") &&
                r.prefix &&
                r.operator[0] === i &&
                (i === "+" || i === "-"))) &&
            t.write(" "),
            a
              ? (t.write(i.length > 1 ? " (" : "("),
                this[s](r, t),
                t.write(")"))
              : this[s](r, t);
        } else this[e.argument.type](e.argument, t), t.write(e.operator);
      },
      UpdateExpression(e, t) {
        e.prefix
          ? (t.write(e.operator), this[e.argument.type](e.argument, t))
          : (this[e.argument.type](e.argument, t), t.write(e.operator));
      },
      AssignmentExpression(e, t) {
        this[e.left.type](e.left, t),
          t.write(" " + e.operator + " "),
          this[e.right.type](e.right, t);
      },
      AssignmentPattern(e, t) {
        this[e.left.type](e.left, t),
          t.write(" = "),
          this[e.right.type](e.right, t);
      },
      BinaryExpression: (ts = function (e, t) {
        let i = e.operator === "in";
        i && t.write("("),
          dt(t, e.left, e, !1),
          t.write(" " + e.operator + " "),
          dt(t, e.right, e, !0),
          i && t.write(")");
      }),
      LogicalExpression: ts,
      ConditionalExpression(e, t) {
        let { test: i } = e,
          r = t.expressionsPrecedence[i.type];
        r === ie || r <= t.expressionsPrecedence.ConditionalExpression
          ? (t.write("("), this[i.type](i, t), t.write(")"))
          : this[i.type](i, t),
          t.write(" ? "),
          this[e.consequent.type](e.consequent, t),
          t.write(" : "),
          this[e.alternate.type](e.alternate, t);
      },
      NewExpression(e, t) {
        t.write("new ");
        let i = t.expressionsPrecedence[e.callee.type];
        i === ie || i < t.expressionsPrecedence.CallExpression || pn(e.callee)
          ? (t.write("("), this[e.callee.type](e.callee, t), t.write(")"))
          : this[e.callee.type](e.callee, t),
          ke(t, e.arguments);
      },
      CallExpression(e, t) {
        let i = t.expressionsPrecedence[e.callee.type];
        i === ie || i < t.expressionsPrecedence.CallExpression
          ? (t.write("("), this[e.callee.type](e.callee, t), t.write(")"))
          : this[e.callee.type](e.callee, t),
          e.optional && t.write("?."),
          ke(t, e.arguments);
      },
      ChainExpression(e, t) {
        this[e.expression.type](e.expression, t);
      },
      MemberExpression(e, t) {
        let i = t.expressionsPrecedence[e.object.type];
        i === ie || i < t.expressionsPrecedence.MemberExpression
          ? (t.write("("), this[e.object.type](e.object, t), t.write(")"))
          : this[e.object.type](e.object, t),
          e.computed
            ? (e.optional && t.write("?."),
              t.write("["),
              this[e.property.type](e.property, t),
              t.write("]"))
            : (e.optional ? t.write("?.") : t.write("."),
              this[e.property.type](e.property, t));
      },
      MetaProperty(e, t) {
        t.write(e.meta.name + "." + e.property.name, e);
      },
      Identifier(e, t) {
        t.write(e.name, e);
      },
      PrivateIdentifier(e, t) {
        t.write(`#${e.name}`, e);
      },
      Literal(e, t) {
        e.raw != null
          ? t.write(e.raw, e)
          : e.regex != null
            ? this.RegExpLiteral(e, t)
            : e.bigint != null
              ? t.write(e.bigint + "n", e)
              : t.write(ln(e.value), e);
      },
      RegExpLiteral(e, t) {
        let { regex: i } = e;
        t.write(`/${i.pattern}/${i.flags}`, e);
      },
    },
    mn = {};
  var ii = class {
    constructor(t) {
      let i = t ?? mn;
      (this.output = ""),
        i.output != null
          ? ((this.output = i.output), (this.write = this.writeToStream))
          : (this.output = ""),
        (this.generator = i.generator != null ? i.generator : dn),
        (this.expressionsPrecedence =
          i.expressionsPrecedence != null ? i.expressionsPrecedence : hn),
        (this.indent = i.indent != null ? i.indent : "  "),
        (this.lineEnd =
          i.lineEnd != null
            ? i.lineEnd
            : `
`),
        (this.indentLevel =
          i.startingIndentLevel != null ? i.startingIndentLevel : 0),
        (this.writeComments = i.comments ? i.comments : !1),
        i.sourceMap != null &&
          ((this.write =
            i.output == null ? this.writeAndMap : this.writeToStreamAndMap),
          (this.sourceMap = i.sourceMap),
          (this.line = 1),
          (this.column = 0),
          (this.lineEndSize =
            this.lineEnd.split(`
`).length - 1),
          (this.mapping = {
            original: null,
            generated: this,
            name: void 0,
            source: i.sourceMap.file || i.sourceMap._file,
          }));
    }
    write(t) {
      this.output += t;
    }
    writeToStream(t) {
      this.output.write(t);
    }
    writeAndMap(t, i) {
      (this.output += t), this.map(t, i);
    }
    writeToStreamAndMap(t, i) {
      this.output.write(t), this.map(t, i);
    }
    map(t, i) {
      if (i != null) {
        let { type: a } = i;
        if (a[0] === "L" && a[2] === "n") {
          (this.column = 0), this.line++;
          return;
        }
        if (i.loc != null) {
          let { mapping: n } = this;
          (n.original = i.loc.start),
            (n.name = i.name),
            this.sourceMap.addMapping(n);
        }
        if (
          (a[0] === "T" && a[8] === "E") ||
          (a[0] === "L" && a[1] === "i" && typeof i.value == "string")
        ) {
          let { length: n } = t,
            { column: u, line: c } = this;
          for (let l = 0; l < n; l++)
            t[l] ===
            `
`
              ? ((u = 0), c++)
              : u++;
          (this.column = u), (this.line = c);
          return;
        }
      }
      let { length: r } = t,
        { lineEnd: s } = this;
      r > 0 &&
        (this.lineEndSize > 0 &&
        (s.length === 1 ? t[r - 1] === s : t.endsWith(s))
          ? ((this.line += this.lineEndSize), (this.column = 0))
          : (this.column += r));
    }
    toString() {
      return this.output;
    }
  };
  function as(e, t) {
    let i = new ii(t);
    return i.generator[e.type](e, i), i.output;
  }
  var ri = class {
      constructor(t) {
        this.mime = Ki;
        this.idb = et;
        this.path = gn;
        this.acorn = { parse: Ur };
        this.bare = { createBareClient: Kr, BareClient: Be };
        this.base64 = { encode: btoa, decode: atob };
        this.estree = { generate: as };
        this.cookie = xn;
        this.setCookieParser = ns.parse;
        this.ctx = t;
      }
    },
    os = ri;
  function si(e, t, i, r, s = "", a = !1, n = "") {
    if (self.__dynamic$config)
      var u = self.__dynamic$config.mode == "development";
    else var u = !1;
    if (a) {
      var c = [
        {
          nodeName: "script",
          tagName: "script",
          namespaceURI: "http://www.w3.org/1999/xhtml",
          childNodes: [],
          attrs: [
            {
              name: "src",
              value:
                e + (u ? "?" + Math.floor(Math.random() * 89999 + 1e4) : ""),
            },
          ],
        },
        {
          nodeName: "script",
          tagName: "script",
          namespaceURI: "http://www.w3.org/1999/xhtml",
          childNodes: [],
          attrs: [
            {
              name: "src",
              value:
                t + (u ? "?" + Math.floor(Math.random() * 89999 + 1e4) : ""),
            },
          ],
        },
      ];
      return (
        this.ctx.config.assets.files.inject &&
          c.unshift({
            nodeName: "script",
            tagName: "script",
            namespaceURI: "http://www.w3.org/1999/xhtml",
            childNodes: [],
            attrs: [
              {
                name: "src",
                value:
                  this.ctx.config.assets.files.inject +
                  (u
                    ? "?" + Math.floor(Math.random() * (99999 - 1e4) + 1e4)
                    : ""),
              },
            ],
          }),
        r &&
          c.unshift({
            nodeName: "script",
            tagName: "script",
            namespaceURI: "http://www.w3.org/1999/xhtml",
            childNodes: [],
            attrs: [
              {
                name: "src",
                value:
                  "data:application/javascript;base64," +
                  btoa(
                    `self.__dynamic$cookies = atob("${btoa(r)}");document.currentScript?.remove();`
                  ),
              },
            ],
          }),
        s &&
          c.unshift({
            nodeName: "script",
            tagName: "script",
            namespaceURI: "http://www.w3.org/1999/xhtml",
            childNodes: [],
            attrs: [
              {
                name: "src",
                value:
                  "data:application/javascript;base64," +
                  btoa(s + ";document.currentScript?.remove();"),
              },
            ],
          }),
        n &&
          c.unshift({
            nodeName: "script",
            tagName: "script",
            namespaceURI: "http://www.w3.org/1999/xhtml",
            childNodes: [],
            attrs: [
              {
                name: "src",
                value:
                  "data:application/javascript;base64," +
                  btoa(n + ";document.currentScript?.remove();"),
              },
            ],
          }),
        c
      );
    } else {
      var l = [
        `<script src="${t + (u ? "?" + Math.floor(Math.random() * 89999 + 1e4) : "")}"><\/script>`,
        `<script src="${e + (u ? "?" + Math.floor(Math.random() * 89999 + 1e4) : "")}"><\/script>`,
      ];
      return (
        this.ctx.config.assets.files.inject &&
          l.unshift(
            `<script src="${this.ctx.config.assets.files.inject + (u ? "?" + Math.floor(Math.random() * (99999 - 1e4) + 1e4) : "")}"><\/script>`
          ),
        r &&
          l.unshift(
            `<script src="${"data:application/javascript;base64," + btoa(`self.__dynamic$cookies = atob("${btoa(r)}");document.currentScript?.remove();`)}"><\/script>`
          ),
        s &&
          l.unshift(
            `<script src="${"data:application/javascript;base64," + btoa(s + ";document.currentScript?.remove();")}"><\/script>`
          ),
        n &&
          l.unshift(
            `<script src="${"data:application/javascript;base64," + btoa(n + ";document.currentScript?.remove();")}"><\/script>`
          ),
        l
      );
    }
  }
  var Me = class {
    constructor(t) {
      this.generateHead = si;
      this.config = [
        { elements: "all", tags: ["style"], action: "css" },
        {
          elements: [
            "script",
            "iframe",
            "embed",
            "input",
            "track",
            "media",
            "source",
            "img",
            "a",
            "link",
            "area",
            "form",
            "object",
          ],
          tags: ["src", "href", "action", "data"],
          action: "url",
        },
        { elements: ["source", "img"], tags: ["srcset"], action: "srcset" },
        {
          elements: ["script", "link"],
          tags: ["integrity"],
          action: "rewrite",
          new: "nointegrity",
        },
        {
          elements: ["script", "link"],
          tags: ["nonce"],
          action: "rewrite",
          new: "nononce",
        },
        { elements: ["meta"], tags: ["http-equiv"], action: "http-equiv" },
        { elements: ["iframe"], tags: ["srcdoc"], action: "html" },
        { elements: ["link"], tags: ["imagesrcset"], action: "srcset" },
        { elements: "all", tags: ["onclick"], action: "js" },
      ];
      this.ctx = t.ctx;
    }
    generateRedirect(t) {
      return `
<HTML><HEAD><meta http-equiv="content-type" content="text/html;charset=utf-8">
<TITLE>301 Moved</TITLE></HEAD><BODY>
<H1>301 Moved</H1>
The document has moved
<A HREF="${t}">here</A>.
</BODY></HTML>
    `;
    }
    iterate(t, i) {
      function r(s = t) {
        for (var a = 0; a < s.childNodes.length; a++)
          i(s.childNodes[a]),
            s.childNodes[a].childNodes &&
              s.childNodes[a].childNodes.length &&
              r(s.childNodes[a]);
      }
      r(t);
    }
    rewrite(t, i, r = []) {
      return (
        Array.isArray(t) && (t = t[0]),
        t &&
          ((t = t.toString()),
          t.match(/<\!DOCTYPE[^>]*>/gi) || (t = "<!DOCTYPE html>" + t),
          t
            .replace(
              /(<!DOCTYPE html>|<html(.*?)>)/im,
              `$1${r.join("")}
`
            )
            .replace(/<(script|link)\b[^>]*>/g, (s, a) =>
              s
                .replace(/\snonce\s*=\s*"[^"]*"/, (n) =>
                  n.replace("nonce", "nononce")
                )
                .replace(/\sintegrity\s*=\s*"[^"]*"/, (n) =>
                  n.replace("integrity", "nointegrity")
                )
            ))
      );
    }
  };
  var je = class {
    constructor(t) {
      this.ctx = t.ctx;
    }
    rewrite(t, i, r = {}) {
      return (
        t &&
        t
          .toString()
          .replace(/(?:@import\s?|url\(?)['"]?(.*?)['")]/gim, (...s) => {
            try {
              return s[0].replace(s[3], this.ctx.url.encode(s[3], i));
            } catch {
              return s[0];
            }
          })
      );
    }
  };
  function ai(e, t) {
    if (typeof e != "object" || !t) return;
    i(e, null, t);
    function i(r, s, a) {
      if (!(typeof r != "object" || !a)) {
        (r.parent = s), a(r, s, a);
        for (let n in r)
          n !== "parent" &&
            (Array.isArray(r[n])
              ? r[n].forEach((u) => {
                  u && i(u, r, a);
                })
              : r[n] && i(r[n], r, a));
        typeof r.iterateEnd == "function" && r.iterateEnd();
      }
    }
  }
  function ni(e, t = {}, i, r) {
    var s = this.ctx.modules.acorn.parse(e.toString(), {
      sourceType: t.module ? "module" : "script",
      allowImportExportEverywhere: !0,
      allowAwaitOutsideFunction: !0,
      allowReturnOutsideFunction: !0,
      ecmaVersion: "latest",
      preserveParens: !1,
      loose: !0,
      allowReserved: !0,
    });
    return (
      this.iterate(s, (a, n = null) => {
        this.emit(a, a.type, n, i, r, t);
      }),
      (e = this.ctx.modules.estree.generate(s)),
      e
    );
  }
  function oi(e, t = {}) {
    if (typeof e.name != "string") return !1;
    if (e.__dynamic !== !0) {
      if (
        ![
          "parent",
          "top",
          "postMessage",
          "opener",
          "window",
          "self",
          "globalThis",
          "parent",
          "location",
        ].includes(e.name)
      )
        return !1;
      if (
        !(t.type == "CallExpression" && t.callee == e) &&
        !(
          t.type == "MemberExpression" &&
          t.object !== e &&
          !["document", "window", "self", "globalThis"].includes(t.object.name)
        ) &&
        t.type != "FunctionDeclaration" &&
        t.type != "VariableDeclaration" &&
        !(t.type == "VariableDeclarator" && t.id == e) &&
        t.type != "LabeledStatement" &&
        !(t.type == "Property" && t.key == e) &&
        !(t.type == "ArrowFunctionExpression" && t.params.includes(e)) &&
        !(t.type == "FunctionExpression" && t.params.includes(e)) &&
        !(t.type == "FunctionExpression" && t.id == e) &&
        !(t.type == "CatchClause" && t.param == e) &&
        t.type != "ContinueStatement" &&
        t.type != "BreakStatement" &&
        !(t.type == "AssignmentExpression" && t.left == e) &&
        t.type != "UpdateExpression" &&
        t.type != "UpdateExpression" &&
        !(t.type == "ForInStatement" && t.left == e) &&
        !(t.type == "MethodDefinition" && t.key == e) &&
        !(t.type == "AssignmentPattern" && t.left == e) &&
        t.type != "NewExpression" &&
        t?.parent?.type != "NewExpression" &&
        !(t.type == "UnaryExpression" && t.argument == e) &&
        !(t.type == "Property" && t.shorthand == !0 && t.value == e)
      ) {
        if (e.name == "__dynamic") return (e.name = "undefined");
        if (e.name == "eval" && t.right !== e)
          return (e.name = "__dynamic$eval");
        e.name = `dg$(${e.name})`;
      }
    }
  }
  function Ee(e, t = {}) {
    Object.entries({
      type: "CallExpression",
      callee: {
        type: "MemberExpression",
        object: { type: "Identifier", name: "self" },
        property: { type: "Identifier", name: "__dynamic$message" },
      },
      arguments: [
        e.object || e,
        { type: "Identifier", name: "self", __dynamic: !0 },
      ],
    }).forEach(([i, r]) => (e[i] = r));
  }
  function ci(e, t = {}, i = {}) {
    if (
      ((e.object.name += ""), t.type !== "AssignmentExpression" && t.left !== e)
    ) {
      if (
        e.property.value == "postMessage" &&
        t.type == "CallExpression" &&
        t.callee == e
      )
        return Ee(e, t);
      if (
        e.object.value == "postMessage" &&
        t.type == "CallExpression" &&
        t.callee == e
      )
        return Ee(e, t);
      if (
        (e.property.name == "postMessage" || e.object.name == "postMessage") &&
        e.object.type !== "Super"
      ) {
        var r = e.object?.name;
        (e.type = "CallExpression"),
          (e.callee = { type: "Identifier", name: "__dynamic$message" }),
          (e.arguments = [
            { type: "Identifier", name: r },
            { type: "Identifier", name: "self", __dynamic: !0 },
          ]),
          t.type == "CallExpression" && (t.arguments = t.arguments);
        return;
      }
    }
    if (
      (e.property.name == "eval" && (e.property.name = "__dynamic$eval"),
      e.object.name == "eval" && (e.object.name = "__dynamic$eval"),
      i.destination !== "worker" &&
        (e.property.name == "window" &&
          e.object.name != "top" &&
          (e.object.name == "self" || e.object.name == "globalThis") &&
          t.type !== "NewExpression" &&
          (t.type !== "CallExpression" ||
            (t.type == "CallExpression" && e !== t.callee)) &&
          (e.property.name = "__dynamic$window"),
        e.object.name == "top" &&
          t.type !== "NewExpression" &&
          (t.type !== "CallExpression" ||
            (t.type == "CallExpression" && e !== t.callee)) &&
          (e.object.name = "top.__dynamic$window"),
        e.property.name == "top" &&
          (e.object.name == "self" || e.object.name == "globalThis") &&
          t.type !== "NewExpression" &&
          (t.type !== "CallExpression" ||
            (t.type == "CallExpression" && e !== t.callee)) &&
          (e.property.name = "top.__dynamic$window"),
        t.type !== "NewExpression" &&
          (t.type !== "CallExpression" ||
            (t.type == "CallExpression" && e !== t.callee)) &&
          (e.object.name == "window" &&
            (e.object = {
              type: "CallExpression",
              callee: { type: "Identifier", name: "dg$" },
              arguments: [e.object],
              __dynamic: !0,
            }),
          e.object.name == "parent" &&
            (e.object = {
              type: "CallExpression",
              callee: { type: "Identifier", name: "dg$" },
              arguments: [e.object],
              __dynamic: !0,
            }),
          e.property.name == "__dynamic" && (e.property.name = "undefined"),
          e.object.name == "self" &&
            (e.object = {
              type: "CallExpression",
              callee: { type: "Identifier", name: "dg$" },
              arguments: [e.object],
              __dynamic: !0,
            }),
          e.object.name == "document" &&
            (e.object = {
              type: "CallExpression",
              callee: { type: "Identifier", name: "dg$" },
              arguments: [e.object],
              __dynamic: !0,
            }),
          e.object.name == "globalThis" &&
            (e.object = {
              type: "CallExpression",
              callee: { type: "Identifier", name: "dg$" },
              arguments: [e.object],
              __dynamic: !0,
            })),
        e.object.name == "location" &&
          (e.object = {
            type: "CallExpression",
            callee: { type: "Identifier", name: "dg$" },
            arguments: [e.object],
            __dynamic: !0,
          }),
        e.property.name == "location" &&
          t.type !== "BinaryExpression" &&
          t.type !== "AssignmentExpression"))
    ) {
      (e.property.__dynamic = !0), (e.__dynamic = !0);
      let s = Object.assign({}, e);
      (e.type = "CallExpression"),
        (e.callee = { type: "Identifier", name: "dg$", __dynamic: !0 }),
        (e.arguments = [s]),
        (e.__dynamic = !0);
    }
    e.computed &&
      i.destination !== "worker" &&
      (e.property = {
        type: "CallExpression",
        callee: { type: "Identifier", name: "dp$" },
        arguments: [e.property],
        __dynamic: !0,
      });
  }
  function ui(e, t = {}) {
    if (
      !(e.value instanceof String) ||
      (e.value == "__dynamic" && (e.value = "undefined"),
      !["location", "parent", "top", "postMessage"].includes(e.value))
    )
      return !1;
    e.value == "postMessage" &&
      t.type != "AssignmentExpression" &&
      t.left != e &&
      Ee(e, t),
      e.value == "location" && (e.value = "__dynamic$location"),
      e.value == "__dynamic" && (e.value = "undefined"),
      e.value == "eval" && (e.value = "__dynamic$eval");
  }
  function mt(e, t = {}) {
    e.__dynamic ||
      (e.arguments.length &&
        ((e.arguments = [
          {
            type: "CallExpression",
            callee: {
              type: "Identifier",
              name: "__dynamic$wrapEval",
              __dynamic: !0,
            },
            arguments: e.arguments,
            __dynamic: !0,
          },
        ]),
        (e.__dynamic = !0)));
  }
  function li(e, t = {}) {
    if (!(t.type == "AssignmentExpression" && t.left == e)) {
      if (e.callee.type == "Identifier") {
        if (e.callee.name == "postMessage") {
          let i = "undefined";
          (e.callee.type = "CallExpression"),
            (e.callee.callee = {
              type: "Identifier",
              name: "__dynamic$message",
            }),
            (e.callee.arguments = [
              { type: "Identifier", name: i },
              { type: "Identifier", name: "self", __dynamic: !0 },
            ]);
          return;
        }
        e.callee.name == "eval" && mt(e);
      }
      if (e.callee.type == "MemberExpression") {
        if (
          e.callee.property.name == "postMessage" &&
          e.callee.object.type !== "Super"
        ) {
          let i = e.callee.object;
          (e.callee.type = "CallExpression"),
            (e.callee.callee = {
              type: "Identifier",
              name: "__dynamic$message",
            }),
            (e.callee.arguments = [
              i,
              { type: "Identifier", name: "self", __dynamic: !0 },
            ]);
          return;
        }
        e.callee.object.name == "eval" && mt(e);
      }
      e.arguments.length > 0 && e.arguments.length < 4;
      try {
      } catch {}
    }
  }
  function hi(e, t = {}) {
    if (e.left.type == "Identifier") {
      if (e.left.__dynamic === !0) return;
      if (e.left.name == "location") {
        var i = structuredClone(e.left),
          r = structuredClone(e.right);
        (e.right.type = "CallExpression"),
          (e.right.callee = { type: "Identifier", name: "ds$" }),
          (e.right.arguments = [i, r]);
      }
    }
  }
  function fi(e, t = {}) {
    e.parent.type != "ObjectPattern" &&
      e.parent?.parent?.type != "AssignmentExpression" &&
      (e.shorthand = !1);
  }
  function pi(e, t = {}, i = {}, r = {}) {
    if (
      e.type == "Literal" &&
      (t.type == "ImportDeclaration" ||
        t.type == "ExportNamedDeclaration" ||
        t.type == "ExportAllDeclaration")
    ) {
      var s = e.value + "";
      (e.value = i.url.encode(e.value, r.meta)),
        (e.raw = e.raw.replace(s, e.value)),
        (e.__dynamic = !0);
    }
    e.type == "ImportExpression" &&
      ((e.source = {
        type: "CallExpression",
        callee: { type: "Identifier", name: "__dynamic$import" },
        arguments: [
          e.source,
          { type: "Literal", __dynamic: !0, value: i.meta.href },
        ],
      }),
      (e.__dynamic = !0));
  }
  function di(e, t = {}) {
    if (e.id.type !== "Identifier") return !1;
    e.id.__dynamic !== !0 && e.id.name != "location";
  }
  function yn(e, t, i = {}, r = {}, s = {}, a = {}) {
    if (!e.__dynamic) {
      switch (t) {
        case "Identifier":
          oi(e, i);
          break;
        case "MemberExpression":
          ci(e, i, a);
          break;
        case "Literal":
          ui(e, i);
          break;
        case "CallExpression":
          li(e, i);
          break;
        case "AssignmentExpression":
          hi(e, i);
          break;
        case "ThisExpression":
          break;
        case "Property":
          fi(e, i);
          break;
        case "VariableDeclarator":
          di(e, i);
          break;
        case "CatchClause":
          break;
        default:
          break;
      }
      pi(e, i, r, s);
    }
  }
  var cs = yn;
  var Fe = class {
    constructor(t) {
      this.iterate = ai;
      this.process = ni;
      this.emit = cs;
      this.ctx = t.ctx;
    }
    rewrite(t, i = {}, r = !0, s = {}) {
      if (
        !t ||
        t instanceof Object ||
        ((t = t.toString()), t.includes("/* dynamic.js */"))
      )
        return t;
      t = `/* dynamic.js */ 

${t}`;
      try {
        try {
          t = this.process(t, i, { module: !0, ...this.ctx }, s);
        } catch {
          t = this.process(t, i, { module: !1, ...this.ctx }, s);
        }
      } catch {}
      return (
        r &&
          (t = `
      if (typeof self !== undefined && typeof self.importScripts == 'function' && typeof self.__dynamic == 'undefined') importScripts('/dy/config.js', '/dy/handler.js?'+Math.floor(Math.random()*(99999-10000)+10000));

      ${t}`),
        t
      );
    }
  };
  var Ue = class {
    constructor(t) {
      this.config = {
        rewrite: [
          ["icons", "urlit"],
          ["name", " - Dynamic"],
          ["start_url", "url"],
          ["scope", "url"],
          ["short_name", " - Dynamic"],
          ["shortcuts", "urlev"],
        ],
        delete: ["serviceworker"],
      };
      this.ctx = t.ctx;
    }
    rewrite(t, i) {
      let r = JSON.parse(t);
      for (let u in this.config)
        if (u == "rewrite")
          for (var [s, a] of this.config[u]) {
            if (a == "urlit" && r[s]) {
              for (var n = 0; n < r[s].length; n++)
                r[s][n].src = this.ctx.url.encode(r[s][n].src, i);
              continue;
            }
            if (a == "urlev" && r[s]) {
              for (var n = 0; n < r[s].length; n++)
                r[s][n].url = this.ctx.url.encode(r[s][n].url, i);
              continue;
            }
            if (a == "url" && r[s]) {
              r[s] = this.ctx.url.encode(r[s], i);
              continue;
            }
            a == "url" || a == "urlit" || a == "urlev" || (r[s] = r[s] + a);
          }
        else if (u == "delete")
          for (var s of this.config[u]) r[s] && delete r[s];
      return JSON.stringify(r);
    }
  };
  var us = {
    encode(e, t) {
      return !e || !e.toString()
        ? e
        : e
            .split(", ")
            .map((i) =>
              i
                .split(" ")
                .map((r, s) =>
                  s == 0 ? t.url.encode(r, t.baseURL || t.meta) : r
                )
                .join(" ")
            )
            .join(", ");
    },
    decode(e) {
      return e;
    },
  };
  var mi = class {
      constructor(t) {
        (this.ctx = t),
          (this.html = new Me(this)),
          (this.srcset = us),
          (this.js = new Fe(this)),
          (this.css = new je(this)),
          (this.man = new Ue(this));
      }
    },
    ls = mi;
  async function hs(e) {
    var t;
    if (e.method === "GET") {
      var i = new URL(e.url);
      t = i.searchParams.get("url");
    } else if (e.method === "POST") {
      if (((t = (await e.formData()).get("url")), t === null)) {
        var i = new URL(e.url);
        t = i.searchParams.get("url");
      }
      if (!t)
        return new Response("Error: Invalid or Unfound url", { status: 400 });
    } else return new Response("Error: Invalid method", { status: 405 });
    return new Response("", {
      status: 301,
      headers: {
        location:
          location.origin +
          this.ctx.config.prefix +
          this.ctx.encoding.encode(t),
      },
    });
  }
  function fs({ url: e }) {
    return !e
      .toString()
      .substr(location.origin.length, (this.ctx.config.prefix + "route").length)
      .startsWith(this.ctx.config.prefix + "route");
  }
  function gi({ url: e }) {
    return !e
      .toString()
      .substr(location.origin.length, this.ctx.config.prefix.length)
      .startsWith(this.ctx.config.prefix);
  }
  async function xi(e, t, i) {
    for (let s in e) {
      if (
        (this.ctx.headers.csp.indexOf(s.toLowerCase()) !== -1 && delete e[s],
        s.toLowerCase() == "location")
      ) {
        e[s] = this.ctx.url.encode(e[s], t);
        continue;
      }
      if (s.toLowerCase() === "set-cookie") {
        Array.isArray(e[s])
          ? (e[s] = e[s].map(
              (a) =>
                this.ctx.modules.setCookieParser(a, { decodeValues: !1 })[0]
            ))
          : (e[s] = this.ctx.modules.setCookieParser(e[s], {
              decodeValues: !1,
            }));
        for await (var r of e[s])
          await i.set(
            t.host,
            this.ctx.modules.cookie.serialize(r.name, r.value, {
              ...r,
              encode: (a) => a,
            })
          );
        delete e[s];
        continue;
      }
    }
    return new Headers(e);
  }
  function yi(e, t, i, r) {
    let { referrer: s } = i;
    if (
      (["origin", "Origin", "host", "Host", "referer", "Referer"].forEach(
        (a) => {
          e[a] && delete e[a];
        }
      ),
      (e.Origin = `${t.protocol}//${t.host}${t.port ? ":" + t.port : ""}`),
      (e.Host = t.host + (t.port ? ":" + t.port : "")),
      (e.Referer = t.href),
      i.referrerPolicy == "strict-origin-when-cross-origin" &&
        (e.Referer = `${t.protocol}//${t.host}/`),
      i.referrerPolicy == "origin" && t.origin && (s = t.origin + "/"),
      r)
    ) {
      switch (i.credentials) {
        case "omit":
          break;
        case "same-origin":
          i.client &&
            t.origin == i.client.__dynamic$location.origin &&
            (e.Cookie = r),
            i.client || (e.Cookie = r);
          break;
        case "include":
          e.Cookie = r;
          break;
        default:
          break;
      }
      e.Cookie = r;
    }
    if (s && s != location.origin + "/")
      try {
        (e.Referer = this.ctx.url.decode(s)),
          i.referrerPolicy == "strict-origin-when-cross-origin" &&
            (e.Referer = new URL(this.ctx.url.decode(s)).origin),
          (e.Origin = new URL(this.ctx.url.decode(s)).origin);
      } catch {}
    return (
      i.client &&
        ((e.Origin = i.client.__dynamic$location.origin),
        (e.Referer = i.client.__dynamic$location.href),
        i.referrerPolicy == "strict-origin-when-cross-origin" &&
          (e.Referer = i.client.__dynamic$location.origin)),
      this.ctx.config.tab &&
        this.ctx.config.tab.ua &&
        (delete e["user-agent"],
        delete e["User-Agent"],
        (e["user-agent"] = this.ctx.config.tab.ua)),
      (e["sec-fetch-dest"] = i.destination || "empty"),
      (e["sec-fetch-mode"] = i.mode || "cors"),
      (e["sec-fetch-site"] = i.client
        ? i.client.__dynamic$location.origin == t.origin
          ? i.client.__dynamic$location.port == t.port
            ? "same-origin"
            : "same-site"
          : "cross-origin"
        : "none"),
      i.mode == "navigate" && (e["sec-fetch-site"] = "same-origin"),
      (e["sec-fetch-user"] = "?1"),
      new Headers(e)
    );
  }
  function bi(e) {
    var t = Object.assign(Object.create(Object.getPrototypeOf(e)), e);
    return t;
  }
  function vi(e) {
    try {
      if (
        (new new Proxy(e, { construct: () => ({}) })(),
        !Object.getOwnPropertyNames(e).includes("arguments"))
      )
        throw new Error("");
      return !0;
    } catch {
      return !1;
    }
  }
  function wi(e) {
    return e.url
      .toString()
      .substr(location.origin.length, e.url.toString().length)
      .startsWith(self.__dynamic$config.assets.prefix);
  }
  async function _i(e) {
    let t;
    if (self.__dynamic$config.mode !== "development") {
      var i = await caches.open("__dynamic$files");
      i
        ? (t = (await i.match(e.url)) || (await fetch(e)))
        : (t = await fetch(e));
    } else t = await fetch(e);
    let r = await t.blob();
    return (
      (e.url.startsWith(location.origin + "/dy/config.js") ||
        e.url.startsWith(location.origin + "/dy/client.j")) &&
        (r = new Blob(
          [
            `${await r.text()}
self.document?.currentScript?.remove();`,
          ],
          { type: "application/javascript" }
        )),
      new Response(r, {
        headers: t.headers,
        status: t.status,
        statusText: t.statusText,
      })
    );
  }
  async function Ci(e, t) {}
  var $e = class {
    constructor(t) {
      this.rawHeaders = {};
      this.headers = new Headers({});
      this.status = 200;
      this.statusText = "OK";
      this.body = t;
    }
    async blob() {
      return this.body;
    }
    async text() {
      return await this.body.text();
    }
  };
  function Si(e) {
    var t = this.ctx.encoding;
    return (
      typeof this.ctx.config.encoding == "object"
        ? (t = { ...t, ...this.ctx.encoding })
        : (t = { ...this.ctx.encoding[this.ctx.config.encoding] }),
      (this.ctx.encoding = { ...this.ctx.encoding, ...t }),
      this.ctx.encoding
    );
  }
  function ki(e, t, i) {
    if (!e.url.startsWith("http")) return e.url;
    let r = e.url.toString();
    return (
      e.url.startsWith(location.origin) &&
        (r = r.substr(self.location.origin.length)),
      (r = new URL(r, new URL(t.__dynamic$location.href)).href),
      this.ctx.url.encode(r, i)
    );
  }
  var Ei = class {
      constructor(t) {
        this.route = hs;
        this.routePath = fs;
        this.path = gi;
        this.resHeader = xi;
        this.reqHeader = yi;
        this.clone = bi;
        this.class = vi;
        this.file = wi;
        this.edit = _i;
        this.error = Ci;
        this.encode = Si;
        this.rewritePath = ki;
        this.about = $e;
        this.ctx = t;
      }
    },
    ps = Ei;
  function Ai(e, t) {
    if (!e) return e;
    if (((e = new String(e).toString()), e.startsWith("about:blank")))
      return location.origin + this.ctx.config.prefix + e;
    if (
      (!e.match(this.ctx.regex.ProtocolRegex) &&
        e.match(/^([a-zA-Z0-9\-]+)\:\/\//g)) ||
      e.startsWith("chrome-extension://")
    )
      return e;
    if (
      e.startsWith("javascript:") &&
      !e.startsWith("javascript:__dynamic$eval")
    ) {
      let c = new URL(e);
      return `javascript:__dynamic$eval(${JSON.stringify(c.pathname)})`;
    }
    if (e.match(this.ctx.regex.WeirdRegex)) {
      var i = this.ctx.regex.WeirdRegex.exec(e);
      i && (e = i[2]);
    }
    if (
      e.startsWith(location.origin + this.ctx.config.prefix) ||
      e.startsWith(this.ctx.config.prefix) ||
      e.startsWith(
        location.origin + this.ctx.config.assets.prefix + "dynamic."
      ) ||
      e.match(this.ctx.regex.BypassRegex)
    )
      return e;
    if (e.match(this.ctx.regex.DataRegex)) {
      try {
        var i = this.ctx.regex.DataRegex.exec(e);
        if (i) {
          var [r, s, a, n, u] = i;
          n == "base64"
            ? (u = this.ctx.modules.base64.atob(decodeURIComponent(u)))
            : (u = decodeURIComponent(u)),
            s &&
              (s == "text/html"
                ? (u = this.ctx.rewrite.html.rewrite(
                    u,
                    t,
                    this.ctx.rewrite.html.generateHead(
                      location.origin + "/dy/client.j",
                      location.origin + "/dy/config.js",
                      "",
                      `window.__dynamic$url = "${t.href}"; window.__dynamic$parentURL = "${location.href}";`
                    )
                  ))
                : s == "text/css"
                  ? (u = this.ctx.rewrite.css.rewrite(u, t))
                  : (s == "text/javascript" || s == "application/javascript") &&
                    (u = this.ctx.rewrite.js.rewrite(u, t))),
            n == "base64"
              ? (u = this.ctx.modules.base64.btoa(u))
              : (u = encodeURIComponent(u)),
            a
              ? n
                ? (e = `data:${s};${a};${n},${u}`)
                : (e = `data:${s};${a},${u}`)
              : n
                ? (e = `data:${s};${n},${u}`)
                : (e = `data:${s},${u}`);
        }
      } catch {}
      return e;
    }
    return (
      (e = new String(e).toString()),
      t.href.match(this.ctx.regex.BypassRegex) &&
        (e = new URL(
          e,
          new URL((this.ctx.parent.__dynamic || this.ctx).meta.href)
        ).href),
      (e = new URL(e, t.href)),
      (this.ctx._location?.origin ||
        (location.origin == "null"
          ? location.ancestorOrigins[0]
          : location.origin)) +
        this.ctx.config.prefix +
        (this.ctx.encoding.encode(e.origin + e.pathname) + e.search + e.hash)
    );
  }
  function Ii(e) {
    if (
      !e ||
      ((e = new String(e).toString()), e.match(this.ctx.regex.BypassRegex))
    )
      return e;
    var t = e.indexOf(this.ctx.config.prefix);
    if (t == -1) return e;
    try {
      if (
        ((e = new URL(e, new URL(self.location.origin)).href),
        (t = e.indexOf(this.ctx.config.prefix)),
        e.slice(t + this.ctx.config.prefix.length).trim() == "about:blank")
      )
        return "about:blank";
      var i = new URL(e).search + new URL(e).hash || "",
        r = new URL(
          this.ctx.encoding.decode(
            e
              .slice(t + this.ctx.config.prefix.length)
              .replace("https://", "https:/")
              .replace("https:/", "https://")
              .split("?")[0]
          )
        );
    } catch {
      return e;
    }
    return (
      (e =
        r.origin +
        r.pathname +
        i +
        (new URL(e).search ? r.search.replace("?", "&") : r.search)),
      e
    );
  }
  var Pi = class {
      constructor(t) {
        this.encode = Ai;
        this.decode = Ii;
        this.ctx = t;
      }
    },
    ds = Pi;
  function Ri(e) {
    e = new URL(e.href);
    for (var t in e) this.ctx.meta[t] = e[t];
    return !0;
  }
  var He = class {
    constructor() {}
  };
  var Ni = class extends He {
      constructor(i) {
        super();
        this.load = Ri;
        this.ctx = i;
      }
    },
    ms = Ni;
  var We = class {
    constructor(t = "", i = new Request("")) {
      this.headers = new Headers({});
      this.redirect = "manual";
      this.body = null;
      this.method = "GET";
      i.headers && (this.headers = i.headers),
        i.redirect && (this.redirect = i.redirect),
        i.body && (this.body = i.body),
        (this.method = i.method || "GET"),
        (this.url = new String(t));
    }
    get init() {
      return {
        headers: this.headers || new Headers({}),
        redirect: this.redirect || "manual",
        body: this.body || null,
        method: this.method || "GET",
      };
    }
  };
  var Ge = class extends Response {
    constructor(i = "", r = new Response("")) {
      super(i, r);
      this.status = 200;
      this.statusText = "OK";
      this.headers = new Headers({});
      (this.body = i),
        r.status && (this.status = r.status),
        r.statusText && (this.statusText = r.statusText),
        r.headers && (this.headers = r.headers);
    }
    get init() {
      return {
        headers: this.headers || new Headers({}),
        statusText: this.statusText || 200,
        body: this.body || new Blob([]),
        status: this.statusText || "OK",
      };
    }
  };
  var Li = class {
      constructor(t) {
        this.Request = We;
        this.Response = Ge;
        this.ctx = t;
      }
    },
    gs = Li;
  var bn = /^(#|about:|mailto:|blob:|javascript:)/g,
    vn =
      /^data:([a-z\/A-Z0-9\-\+]+);?(charset\=[\-A-Za-z0-9]+)?;?(base64)?[;,]*(.*)/g,
    wn = /^([\/A-Za-z0-9\-%]+)(http[s]?:\/\/.*)/g,
    qe = class {
      constructor(t) {
        this.BypassRegex = bn;
        this.DataRegex = vn;
        this.WeirdRegex = wn;
        this.ctx = t;
      }
    };
  var Ti = class {
      constructor(t) {
        this.ctx = t;
      }
    },
    xs = Ti;
  function Di(e, t = "") {
    return (
      (this.ctx.modules.mime.contentType(t || e.pathname) || "text/css").split(
        ";"
      )[0] === "text/css"
    );
  }
  function Oi(e, t = "", i = "") {
    let r;
    return !t && this.ctx.modules.mime.contentType(e.pathname) == e.pathname
      ? i.trim().match(/<(html|script|body)[^>]*>/g) &&
          ((r = i
            .trim()
            .indexOf((i.trim().match(/<(html|script|body)[^>]*>/g) || [])[0])),
          r > -1 && r < 100)
      : (
          this.ctx.modules.mime.contentType(t || e.pathname) || "text/html"
        ).split(";")[0] === "text/html" ||
          i.trim().match(/\<\!(doctype|DOCTYPE) html\>/g);
  }
  function Bi(e, t = "") {
    if (e.pathname.endsWith(".js") && t == "text/plain") return !0;
    var i = (
      this.ctx.modules.mime.contentType(t || e.pathname) ||
      "application/javascript"
    ).split(";")[0];
    return (
      i == "text/javascript" ||
      i == "application/javascript" ||
      i == "application/x-javascript"
    );
  }
  var Vi = class {
      constructor(t) {
        this.html = Oi;
        this.js = Bi;
        this.css = Di;
        this.ctx = t;
      }
    },
    ys = Vi;
  function _n(e, t) {
    return (
      e || (e = []),
      e.find((i) => i.name == t.name)
        ? (e[e.findIndex((i) => i.name == t.name)] = {
            name: t.name,
            value: t.value,
            expires: t.expires,
          })
        : e.push({ name: t.name, value: t.value, expires: t.expires }),
      e
    );
  }
  var he = {
    open: async () =>
      Nt("__dynamic$cookies", 1, {
        async upgrade(e) {
          await e.createObjectStore("__dynamic$cookies");
        },
      }),
    set: async (e, t, i) => {
      if (
        (t.domain && (e = t.domain),
        e.startsWith(".") && (e = e.slice(1)),
        t.expires)
      ) {
        var r = new Date(t.expires);
        if (r < new Date()) return he.remove(e, t, i);
      }
      return (
        await (
          await i
        ).put(
          "__dynamic$cookies",
          _n(await (await i).get("__dynamic$cookies", e), t),
          e
        ),
        !0
      );
    },
    get: async (e, t) => {
      var i = e.replace(/^(.*\.)?([^.]*\..*)$/g, "$2"),
        r = (await (await t).get("__dynamic$cookies", e)) || [];
      if (e !== i && e !== "." + i) {
        var s = await (await t).get("__dynamic$cookies", i);
        if (s)
          for (var { name: a, value: n, expires: u } of s) {
            if (u) {
              var c = new Date(u);
              if (c <= new Date()) {
                he.remove(
                  e,
                  s.find((l) => l.name == a && l.value == n && l.expires == u),
                  t
                );
                continue;
              }
            }
            r.find((l) => l.name == a && l.value == n) ||
              r.push({ name: a, value: n, expires: u || new Date(1e13) });
          }
      }
      return r;
    },
    remove: async (e, t, i) => {
      t.domain && (e = t.domain), e.startsWith(".") && (e = e.slice(1));
      var r = await (await i).get("__dynamic$cookies", e);
      return r
        ? ((r = r.filter((s) => s.name !== t.name)),
          await (await i).put("__dynamic$cookies", r, e),
          !0)
        : !1;
    },
    update: async (e, t) => {
      var i = e.replace(/^(.*\.)?([^.]*\..*)$/g, "$2"),
        r = await (await t).get("__dynamic$cookies", i);
      if (r) {
        for (var { name: s, value: a, expires: n } of r)
          if (n) {
            var u = new Date(n);
            if (u <= new Date()) {
              he.remove(e, { name: s, value: a, expires: n }, t);
              continue;
            }
          }
      }
      return r;
    },
  };
  var bs = (e = []) => e.map((t) => `${t.name}=${t.value}`).join("; ");
  var ze = class {
    constructor(t) {
      this.db = he;
      this.ctx = t;
    }
    async get(t) {
      this._db || (this._db = this.db.open());
      let i = await he.get(t, this._db);
      return bs(i);
    }
    async set(t, i = "") {
      return (
        (i = this.ctx.modules.setCookieParser.parse(i, {
          decodeValues: !1,
        })[0]),
        this._db || (this._db = this.db.open()),
        await he.set(t, i, this._db)
      );
    }
    async open() {
      await he.open();
    }
    async update(t) {
      return (
        this._db || (this._db = this.db.open()), await he.update(t, this._db)
      );
    }
  };
  var vs = {
    csp: [
      "cross-origin-embedder-policy",
      "cross-origin-opener-policy",
      "cross-origin-resource-policy",
      "content-security-policy",
      "content-security-policy-report-only",
      "expect-ct",
      "feature-policy",
      "origin-isolation",
      "strict-transport-security",
      "upgrade-insecure-requests",
      "x-content-type-options",
      "x-frame-options",
      "x-permitted-cross-domain-policies",
      "x-xss-protection",
    ],
    status: { empty: [204, 101, 205, 304] },
    method: { body: ["GET", "HEAD"] },
  };
  var Ui = {};
  $i(Ui, {
    aes: () => Mn,
    base64: () => Fn,
    none: () => jn,
    plain: () => Vn,
    xor: () => Bn,
  });
  var ye = 14,
    ne = 8,
    Ke = !1,
    Cn = function (e) {
      try {
        return unescape(encodeURIComponent(e));
      } catch {
        throw "Error on UTF-8 encode";
      }
    },
    Sn = function (e) {
      try {
        return decodeURIComponent(escape(e));
      } catch {
        throw "Bad Key";
      }
    },
    kn = function (e) {
      var t = [],
        i,
        r;
      for (
        e.length < 16 &&
          ((i = 16 - e.length),
          (t = [i, i, i, i, i, i, i, i, i, i, i, i, i, i, i, i])),
          r = 0;
        r < e.length;
        r++
      )
        t[r] = e[r];
      return t;
    },
    ws = function (e, t) {
      var i = "",
        r,
        s;
      if (t) {
        if (((r = e[15]), r > 16)) throw "Decryption error: Maybe bad key";
        if (r === 16) return "";
        for (s = 0; s < 16 - r; s++) i += String.fromCharCode(e[s]);
      } else for (s = 0; s < 16; s++) i += String.fromCharCode(e[s]);
      return i;
    };
  var Mi = function (e, t) {
    var i = [],
      r;
    for (t || (e = Cn(e)), r = 0; r < e.length; r++) i[r] = e.charCodeAt(r);
    return i;
  };
  var En = function (e) {
      var t = [],
        i;
      for (i = 0; i < e; i++) t = t.concat(Math.floor(Math.random() * 256));
      return t;
    },
    Ss = function (e, t) {
      var i = ye >= 12 ? 3 : 2,
        r = [],
        s = [],
        a = [],
        n = [],
        u = e.concat(t),
        c;
      for (a[0] = Cs(u), n = a[0], c = 1; c < i; c++)
        (a[c] = Cs(a[c - 1].concat(u))), (n = n.concat(a[c]));
      return (
        (r = n.slice(0, 4 * ne)),
        (s = n.slice(4 * ne, 4 * ne + 16)),
        { key: r, iv: s }
      );
    },
    An = function (e, t, i) {
      t = Is(t);
      var r = Math.ceil(e.length / 16),
        s = [],
        a,
        n = [];
      for (a = 0; a < r; a++) s[a] = kn(e.slice(a * 16, a * 16 + 16));
      for (
        e.length % 16 === 0 &&
          (s.push([
            16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16,
          ]),
          r++),
          a = 0;
        a < s.length;
        a++
      )
        (s[a] = a === 0 ? Ct(s[a], i) : Ct(s[a], n[a - 1])),
          (n[a] = Pn(s[a], t));
      return n;
    },
    In = function (e, t, i, r) {
      t = Is(t);
      var s = e.length / 16,
        a = [],
        n,
        u = [],
        c = "";
      for (n = 0; n < s; n++) a.push(e.slice(n * 16, (n + 1) * 16));
      for (n = a.length - 1; n >= 0; n--)
        (u[n] = Rn(a[n], t)),
          (u[n] = n === 0 ? Ct(u[n], i) : Ct(u[n], a[n - 1]));
      for (n = 0; n < s - 1; n++) c += ws(u[n], !1);
      return (c += ws(u[n], !0)), r ? c : Sn(c);
    },
    Pn = function (e, t) {
      Ke = !1;
      var i = _t(e, t, 0),
        r;
      for (r = 1; r < ye + 1; r++)
        (i = ks(i)), (i = Es(i)), r < ye && (i = As(i)), (i = _t(i, t, r));
      return i;
    },
    Rn = function (e, t) {
      Ke = !0;
      var i = _t(e, t, ye),
        r;
      for (r = ye - 1; r > -1; r--)
        (i = Es(i)), (i = ks(i)), (i = _t(i, t, r)), r > 0 && (i = As(i));
      return i;
    },
    ks = function (e) {
      var t = Ke ? Dn : Fi,
        i = [],
        r;
      for (r = 0; r < 16; r++) i[r] = t[e[r]];
      return i;
    },
    Es = function (e) {
      var t = [],
        i = Ke
          ? [0, 13, 10, 7, 4, 1, 14, 11, 8, 5, 2, 15, 12, 9, 6, 3]
          : [0, 5, 10, 15, 4, 9, 14, 3, 8, 13, 2, 7, 12, 1, 6, 11],
        r;
      for (r = 0; r < 16; r++) t[r] = e[i[r]];
      return t;
    },
    As = function (e) {
      var t = [],
        i;
      if (Ke)
        for (i = 0; i < 4; i++)
          (t[i * 4] =
            wt[e[i * 4]] ^
            bt[e[1 + i * 4]] ^
            vt[e[2 + i * 4]] ^
            yt[e[3 + i * 4]]),
            (t[1 + i * 4] =
              yt[e[i * 4]] ^
              wt[e[1 + i * 4]] ^
              bt[e[2 + i * 4]] ^
              vt[e[3 + i * 4]]),
            (t[2 + i * 4] =
              vt[e[i * 4]] ^
              yt[e[1 + i * 4]] ^
              wt[e[2 + i * 4]] ^
              bt[e[3 + i * 4]]),
            (t[3 + i * 4] =
              bt[e[i * 4]] ^
              vt[e[1 + i * 4]] ^
              yt[e[2 + i * 4]] ^
              wt[e[3 + i * 4]]);
      else
        for (i = 0; i < 4; i++)
          (t[i * 4] =
            gt[e[i * 4]] ^ xt[e[1 + i * 4]] ^ e[2 + i * 4] ^ e[3 + i * 4]),
            (t[1 + i * 4] =
              e[i * 4] ^ gt[e[1 + i * 4]] ^ xt[e[2 + i * 4]] ^ e[3 + i * 4]),
            (t[2 + i * 4] =
              e[i * 4] ^ e[1 + i * 4] ^ gt[e[2 + i * 4]] ^ xt[e[3 + i * 4]]),
            (t[3 + i * 4] =
              xt[e[i * 4]] ^ e[1 + i * 4] ^ e[2 + i * 4] ^ gt[e[3 + i * 4]]);
      return t;
    },
    _t = function (e, t, i) {
      var r = [],
        s;
      for (s = 0; s < 16; s++) r[s] = e[s] ^ t[i][s];
      return r;
    },
    Ct = function (e, t) {
      var i = [],
        r;
      for (r = 0; r < 16; r++) i[r] = e[r] ^ t[r];
      return i;
    },
    Is = function (e) {
      var t = [],
        i = [],
        r,
        s,
        a,
        n = [],
        u;
      for (r = 0; r < ne; r++)
        (s = [e[4 * r], e[4 * r + 1], e[4 * r + 2], e[4 * r + 3]]), (t[r] = s);
      for (r = ne; r < 4 * (ye + 1); r++) {
        for (t[r] = [], a = 0; a < 4; a++) i[a] = t[r - 1][a];
        for (
          r % ne === 0
            ? ((i = _s(Nn(i))), (i[0] ^= On[r / ne - 1]))
            : ne > 6 && r % ne === 4 && (i = _s(i)),
            a = 0;
          a < 4;
          a++
        )
          t[r][a] = t[r - ne][a] ^ i[a];
      }
      for (r = 0; r < ye + 1; r++)
        for (n[r] = [], u = 0; u < 4; u++)
          n[r].push(
            t[r * 4 + u][0],
            t[r * 4 + u][1],
            t[r * 4 + u][2],
            t[r * 4 + u][3]
          );
      return n;
    },
    _s = function (e) {
      for (var t = 0; t < 4; t++) e[t] = Fi[e[t]];
      return e;
    },
    Nn = function (e) {
      var t = e[0],
        i;
      for (i = 0; i < 3; i++) e[i] = e[i + 1];
      return (e[3] = t), e;
    },
    ji = function (e, t) {
      var i,
        r = [];
      for (i = 0; i < e.length; i += t) r[i / t] = parseInt(e.substr(i, t), 16);
      return r;
    },
    Ln = function (e) {
      var t,
        i = [];
      for (t = 0; t < e.length; t++) i[e[t]] = t;
      return i;
    },
    Tn = function (e, t) {
      var i, r;
      for (r = 0, i = 0; i < 8; i++)
        (r = (t & 1) === 1 ? r ^ e : r),
          (e = e > 127 ? 283 ^ (e << 1) : e << 1),
          (t >>>= 1);
      return r;
    },
    Ae = function (e) {
      var t,
        i = [];
      for (t = 0; t < 256; t++) i[t] = Tn(e, t);
      return i;
    },
    Fi = ji(
      "637c777bf26b6fc53001672bfed7ab76ca82c97dfa5947f0add4a2af9ca472c0b7fd9326363ff7cc34a5e5f171d8311504c723c31896059a071280e2eb27b27509832c1a1b6e5aa0523bd6b329e32f8453d100ed20fcb15b6acbbe394a4c58cfd0efaafb434d338545f9027f503c9fa851a3408f929d38f5bcb6da2110fff3d2cd0c13ec5f974417c4a77e3d645d197360814fdc222a908846eeb814de5e0bdbe0323a0a4906245cc2d3ac629195e479e7c8376d8dd54ea96c56f4ea657aae08ba78252e1ca6b4c6e8dd741f4bbd8b8a703eb5664803f60e613557b986c11d9ee1f8981169d98e949b1e87e9ce5528df8ca1890dbfe6426841992d0fb054bb16",
      2
    ),
    Dn = Ln(Fi),
    On = ji("01020408102040801b366cd8ab4d9a2f5ebc63c697356ad4b37dfaefc591", 2),
    gt = Ae(2),
    xt = Ae(3),
    yt = Ae(9),
    bt = Ae(11),
    vt = Ae(13),
    wt = Ae(14),
    Ps = function (e, t, i) {
      var r = En(8),
        s = Ss(Mi(t, i), r),
        a = s.key,
        n = s.iv,
        u,
        c = [[83, 97, 108, 116, 101, 100, 95, 95].concat(r)];
      return (e = Mi(e, i)), (u = An(e, a, n)), (u = c.concat(u)), Ns.encode(u);
    },
    Rs = function (e, t, i) {
      var r = Ns.decode(e),
        s = r.slice(8, 16),
        a = Ss(Mi(t, i), s),
        n = a.key,
        u = a.iv;
      return (r = r.slice(16, r.length)), (e = In(r, n, u, i)), e;
    },
    Cs = function (e) {
      function t(C, k) {
        return (C << k) | (C >>> (32 - k));
      }
      function i(C, k) {
        var P, D, U, B, L;
        return (
          (U = C & 2147483648),
          (B = k & 2147483648),
          (P = C & 1073741824),
          (D = k & 1073741824),
          (L = (C & 1073741823) + (k & 1073741823)),
          P & D
            ? L ^ 2147483648 ^ U ^ B
            : P | D
              ? L & 1073741824
                ? L ^ 3221225472 ^ U ^ B
                : L ^ 1073741824 ^ U ^ B
              : L ^ U ^ B
        );
      }
      function r(C, k, P) {
        return (C & k) | (~C & P);
      }
      function s(C, k, P) {
        return (C & P) | (k & ~P);
      }
      function a(C, k, P) {
        return C ^ k ^ P;
      }
      function n(C, k, P) {
        return k ^ (C | ~P);
      }
      function u(C, k, P, D, U, B, L) {
        return (C = i(C, i(i(r(k, P, D), U), L))), i(t(C, B), k);
      }
      function c(C, k, P, D, U, B, L) {
        return (C = i(C, i(i(s(k, P, D), U), L))), i(t(C, B), k);
      }
      function l(C, k, P, D, U, B, L) {
        return (C = i(C, i(i(a(k, P, D), U), L))), i(t(C, B), k);
      }
      function h(C, k, P, D, U, B, L) {
        return (C = i(C, i(i(n(k, P, D), U), L))), i(t(C, B), k);
      }
      function y(C) {
        for (
          var k,
            P = C.length,
            D = P + 8,
            U = (D - (D % 64)) / 64,
            B = (U + 1) * 16,
            L = [],
            Ye = 0,
            oe = 0;
          oe < P;

        )
          (k = (oe - (oe % 4)) / 4),
            (Ye = (oe % 4) * 8),
            (L[k] = L[k] | (C[oe] << Ye)),
            oe++;
        return (
          (k = (oe - (oe % 4)) / 4),
          (Ye = (oe % 4) * 8),
          (L[k] = L[k] | (128 << Ye)),
          (L[B - 2] = P << 3),
          (L[B - 1] = P >>> 29),
          L
        );
      }
      function S(C) {
        var k,
          P,
          D = [];
        for (P = 0; P <= 3; P++) (k = (C >>> (P * 8)) & 255), (D = D.concat(k));
        return D;
      }
      var x = [],
        f,
        O,
        W,
        R,
        Ie,
        d,
        p,
        g,
        m,
        b = ji(
          "67452301efcdab8998badcfe10325476d76aa478e8c7b756242070dbc1bdceeef57c0faf4787c62aa8304613fd469501698098d88b44f7afffff5bb1895cd7be6b901122fd987193a679438e49b40821f61e2562c040b340265e5a51e9b6c7aad62f105d02441453d8a1e681e7d3fbc821e1cde6c33707d6f4d50d87455a14eda9e3e905fcefa3f8676f02d98d2a4c8afffa39428771f6816d9d6122fde5380ca4beea444bdecfa9f6bb4b60bebfbc70289b7ec6eaa127fad4ef308504881d05d9d4d039e6db99e51fa27cf8c4ac5665f4292244432aff97ab9423a7fc93a039655b59c38f0ccc92ffeff47d85845dd16fa87e4ffe2ce6e0a30143144e0811a1f7537e82bd3af2352ad7d2bbeb86d391",
          8
        );
      for (
        x = y(e), d = b[0], p = b[1], g = b[2], m = b[3], f = 0;
        f < x.length;
        f += 16
      )
        (O = d),
          (W = p),
          (R = g),
          (Ie = m),
          (d = u(d, p, g, m, x[f + 0], 7, b[4])),
          (m = u(m, d, p, g, x[f + 1], 12, b[5])),
          (g = u(g, m, d, p, x[f + 2], 17, b[6])),
          (p = u(p, g, m, d, x[f + 3], 22, b[7])),
          (d = u(d, p, g, m, x[f + 4], 7, b[8])),
          (m = u(m, d, p, g, x[f + 5], 12, b[9])),
          (g = u(g, m, d, p, x[f + 6], 17, b[10])),
          (p = u(p, g, m, d, x[f + 7], 22, b[11])),
          (d = u(d, p, g, m, x[f + 8], 7, b[12])),
          (m = u(m, d, p, g, x[f + 9], 12, b[13])),
          (g = u(g, m, d, p, x[f + 10], 17, b[14])),
          (p = u(p, g, m, d, x[f + 11], 22, b[15])),
          (d = u(d, p, g, m, x[f + 12], 7, b[16])),
          (m = u(m, d, p, g, x[f + 13], 12, b[17])),
          (g = u(g, m, d, p, x[f + 14], 17, b[18])),
          (p = u(p, g, m, d, x[f + 15], 22, b[19])),
          (d = c(d, p, g, m, x[f + 1], 5, b[20])),
          (m = c(m, d, p, g, x[f + 6], 9, b[21])),
          (g = c(g, m, d, p, x[f + 11], 14, b[22])),
          (p = c(p, g, m, d, x[f + 0], 20, b[23])),
          (d = c(d, p, g, m, x[f + 5], 5, b[24])),
          (m = c(m, d, p, g, x[f + 10], 9, b[25])),
          (g = c(g, m, d, p, x[f + 15], 14, b[26])),
          (p = c(p, g, m, d, x[f + 4], 20, b[27])),
          (d = c(d, p, g, m, x[f + 9], 5, b[28])),
          (m = c(m, d, p, g, x[f + 14], 9, b[29])),
          (g = c(g, m, d, p, x[f + 3], 14, b[30])),
          (p = c(p, g, m, d, x[f + 8], 20, b[31])),
          (d = c(d, p, g, m, x[f + 13], 5, b[32])),
          (m = c(m, d, p, g, x[f + 2], 9, b[33])),
          (g = c(g, m, d, p, x[f + 7], 14, b[34])),
          (p = c(p, g, m, d, x[f + 12], 20, b[35])),
          (d = l(d, p, g, m, x[f + 5], 4, b[36])),
          (m = l(m, d, p, g, x[f + 8], 11, b[37])),
          (g = l(g, m, d, p, x[f + 11], 16, b[38])),
          (p = l(p, g, m, d, x[f + 14], 23, b[39])),
          (d = l(d, p, g, m, x[f + 1], 4, b[40])),
          (m = l(m, d, p, g, x[f + 4], 11, b[41])),
          (g = l(g, m, d, p, x[f + 7], 16, b[42])),
          (p = l(p, g, m, d, x[f + 10], 23, b[43])),
          (d = l(d, p, g, m, x[f + 13], 4, b[44])),
          (m = l(m, d, p, g, x[f + 0], 11, b[45])),
          (g = l(g, m, d, p, x[f + 3], 16, b[46])),
          (p = l(p, g, m, d, x[f + 6], 23, b[47])),
          (d = l(d, p, g, m, x[f + 9], 4, b[48])),
          (m = l(m, d, p, g, x[f + 12], 11, b[49])),
          (g = l(g, m, d, p, x[f + 15], 16, b[50])),
          (p = l(p, g, m, d, x[f + 2], 23, b[51])),
          (d = h(d, p, g, m, x[f + 0], 6, b[52])),
          (m = h(m, d, p, g, x[f + 7], 10, b[53])),
          (g = h(g, m, d, p, x[f + 14], 15, b[54])),
          (p = h(p, g, m, d, x[f + 5], 21, b[55])),
          (d = h(d, p, g, m, x[f + 12], 6, b[56])),
          (m = h(m, d, p, g, x[f + 3], 10, b[57])),
          (g = h(g, m, d, p, x[f + 10], 15, b[58])),
          (p = h(p, g, m, d, x[f + 1], 21, b[59])),
          (d = h(d, p, g, m, x[f + 8], 6, b[60])),
          (m = h(m, d, p, g, x[f + 15], 10, b[61])),
          (g = h(g, m, d, p, x[f + 6], 15, b[62])),
          (p = h(p, g, m, d, x[f + 13], 21, b[63])),
          (d = h(d, p, g, m, x[f + 4], 6, b[64])),
          (m = h(m, d, p, g, x[f + 11], 10, b[65])),
          (g = h(g, m, d, p, x[f + 2], 15, b[66])),
          (p = h(p, g, m, d, x[f + 9], 21, b[67])),
          (d = i(d, O)),
          (p = i(p, W)),
          (g = i(g, R)),
          (m = i(m, Ie));
      return S(d).concat(S(p), S(g), S(m));
    };
  var Ns = (function () {
    var e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
      t = e.split(""),
      i = function (s, a) {
        var n = [],
          u = "",
          c,
          l,
          h = Math.floor((s.length * 16) / 3);
        for (c = 0; c < s.length * 16; c++)
          n.push(s[Math.floor(c / 16)][c % 16]);
        for (c = 0; c < n.length; c = c + 3)
          (u += t[n[c] >> 2]),
            (u += t[((n[c] & 3) << 4) | (n[c + 1] >> 4)]),
            n[c + 1] !== void 0
              ? (u += t[((n[c + 1] & 15) << 2) | (n[c + 2] >> 6)])
              : (u += "="),
            n[c + 2] !== void 0 ? (u += t[n[c + 2] & 63]) : (u += "=");
        for (
          l =
            u.slice(0, 64) +
            `
`,
            c = 1;
          c < Math.ceil(u.length / 64);
          c++
        )
          l +=
            u.slice(c * 64, c * 64 + 64) +
            (Math.ceil(u.length / 64) === c + 1
              ? ""
              : `
`);
        return l;
      },
      r = function (s) {
        s = s.replace(/\n/g, "");
        var a = [],
          n = [],
          u = [],
          c;
        for (c = 0; c < s.length; c = c + 4)
          (n[0] = e.indexOf(s.charAt(c))),
            (n[1] = e.indexOf(s.charAt(c + 1))),
            (n[2] = e.indexOf(s.charAt(c + 2))),
            (n[3] = e.indexOf(s.charAt(c + 3))),
            (u[0] = (n[0] << 2) | (n[1] >> 4)),
            (u[1] = ((n[1] & 15) << 4) | (n[2] >> 2)),
            (u[2] = ((n[2] & 3) << 6) | n[3]),
            a.push(u[0], u[1], u[2]);
        return (a = a.slice(0, a.length - (a.length % 16))), a;
      };
    return (
      typeof Array.indexOf == "function" && (e = t), { encode: i, decode: r }
    );
  })();
  var Bn = {
      encode: (e, t = 2) =>
        e &&
        encodeURIComponent(
          e
            .split("")
            .map((i, r) =>
              r % t ? String.fromCharCode(i.charCodeAt(0) ^ t) : i
            )
            .join("")
        ),
      decode: (e, t = 2) =>
        e &&
        decodeURIComponent(e)
          .split("")
          .map((i, r) => (r % t ? String.fromCharCode(i.charCodeAt(0) ^ t) : i))
          .join(""),
    },
    Vn = {
      encode: (e) => e && encodeURIComponent(e),
      decode: (e) => e && decodeURIComponent(e),
    },
    Mn = {
      encode: (e) => e && encodeURIComponent(Ps(e, "dynamic").substring(10)),
      decode: (e) => e && Rs("U2FsdGVkX1" + decodeURIComponent(e), "dynamic"),
    },
    jn = { encode: (e) => e, decode: (e) => e },
    Fn = {
      encode: (e) => e && decodeURIComponent(btoa(e)),
      decode: (e) => e && atob(e),
    };
  var Qe = class {
    constructor(t) {
      this.listeners = [];
      this.modules = new os(this);
      this.util = new ps(this);
      this.http = new gs(this);
      this.meta = new ms(this);
      this.rewrite = new ls(this);
      this.url = new ds(this);
      this.is = new ys(this);
      this.cookies = new ze(this);
      this.regex = new qe(this);
      this.headers = vs;
      this.encoding = Ui;
      this.middleware = new xs(this);
      t && !this.config && (this.config = t), t && this.util.encode(self);
    }
    on(t, i) {
      this.listeners.push({ event: t, cb: i });
    }
    fire(t, i) {
      for (let r of this.listeners)
        if (r.event === t) return (i = r.cb(...i)), i;
      return null;
    }
  };
  (function (e) {
    e.skipWaiting(),
      e.addEventListener("install", async (r, s) => {
        let a = e.__dynamic$config.logLevel || 0;
        if (
          (a > 1 &&
            console[
              e.__dynamic$config.mode == "development"
                ? "group"
                : "groupCollapsed"
            ]("Dynamic Install Sequence:"),
          typeof e.ORIGINS == "object")
        )
          if (e.ORIGINS.length)
            if (e.ORIGINS[0] == "*") console.log("Wildcard Origin Accepted");
            else if (e.ORIGINS.includes(location.origin))
              a > 1 && console.log("Origin Verified: " + location.origin);
            else
              return (
                console.error("Illegal Origin: " + location.origin),
                console.log("Status: Aborting Install"),
                console.groupEnd(),
                await e.registration.unregister()
              );
          else console.warn("Warning: No Origins Specified");
        else
          typeof e.ORIGINS == "string"
            ? e.ORIGINS == "*" &&
              a > 1 &&
              console.log("Wildcard Origin Accepted")
            : a > 0 && console.warn("Warning: No Origins Specified");
        a > 1 && console.log("ServiceWorker Installed:", r),
          a > 1 && console.log("Configuration Loaded:", e.__dynamic$config),
          await e.skipWaiting(),
          a > 1 && console.groupCollapsed("Loading Dynamic Modules:");
        for await (var n of [["html", "html.js"]]) {
          var [u, c] = n;
          (c = new URL(
            c,
            new URL(
              location.origin + e.__dynamic$config.assets.prefix + "worker.js"
            )
          ).href),
            (e[u] = fetch(c)
              .then(
                (h) => (
                  a > 1 && console.log("Loaded Dynamic Module: " + u, h),
                  (e[u] = h.text())
                )
              )
              .then((h) => (0, eval)(h))),
            a > 1 && console.log("Loading: " + u, c);
        }
        if ((console.groupEnd(), e.__dynamic$config.mode == "development"))
          return console.groupEnd();
        let l = await caches.open("__dynamic$files");
        a > 1 && console.groupCollapsed("Dynamic File Cache:");
        for await (var n of Object.values(e.__dynamic$config.assets.files)) {
          if (!n) continue;
          var c = n;
          c = new URL(
            c,
            new URL(
              location.origin + e.__dynamic$config.assets.prefix + "worker.js"
            )
          ).href;
          let S = await fetch(c);
          await l.put(c, S),
            a > 1 && console.log("Cache Installed: " + c.split("/").pop(), S);
        }
        console.groupEnd(), console.groupEnd();
      }),
      e.addEventListener("activate", (r) => {
        e.skipWaiting(), r.waitUntil(e.clients.claim());
      }),
      e.addEventListener("message", async (r) => {
        let { data: s } = r;
        if (s.type == "createBlobHandler") {
          var a = new Response(s.blob, {
              headers: {
                "Content-Type": "text/html",
                "Content-Length": s.blob.size,
                "x-dynamic-location": s.location,
              },
            }),
            n = await caches.open("__dynamic$blob"),
            u = t.config.prefix + "caches/" + s.url;
          await n.put(u, a),
            e.clients.matchAll().then((c) => {
              c.forEach((l) => {
                l.postMessage({ url: u });
              });
            });
        }
      }),
      e.__dynamic$config || importScripts("/dy/config.js");
    let t = new Qe(e.__dynamic$config),
      i = e.__dynamic$config.block || [];
    return (
      (t.config = e.__dynamic$config),
      (t.config.bare.path =
        typeof t.config.bare.path == "string"
          ? [new URL(t.config.bare.path, e.location)][0]
          : t.config.bare.path.map((r) => new URL(r, e.location))),
      (t.encoding = {
        ...t.encoding,
        ...t.encoding[t.config.encoding || "none"],
      }),
      (e.__dynamic = t),
      e.Object.defineProperty(e.WindowClient.prototype, "__dynamic$location", {
        get() {
          return new URL(t.url.decode(this.url));
        },
      }),
      (e.Dynamic = class {
        constructor(r = e.__dynamic$config) {
          this.listeners = [];
          this.middleware = t.middleware;
          this.on = e.__dynamic.on;
          this.fire = e.__dynamic.fire;
          (t.bare = t.modules.bare.createBareClient(t.config.bare.path)),
            (e.__dynamic$config = r);
        }
        async route(r) {
          let { request: s } = r;
          if (s.url.startsWith(t.config.bare.path.toString())) return !1;
          if (s.url.startsWith(location.origin + e.__dynamic$config.prefix))
            return !0;
          if (
            (s.mode !== "navigate" &&
              (s.client = (await e.clients.matchAll()).find(
                (a) => a.id == r.clientId
              )),
            !s.url.startsWith(location.origin + e.__dynamic$config.prefix))
          )
            return s.client
              ? !!s.client.url.startsWith(
                  location.origin + e.__dynamic$config.prefix
                )
              : !1;
        }
        async fetch(r) {
          let { request: s } = r;
          try {
            if (
              (s.mode !== "navigate" &&
                (s.client = (await e.clients.matchAll()).find(
                  (d) => d.id == r.clientId
                )),
              t.util.file(s))
            )
              return await t.util.edit(s);
            if (s.url.startsWith(e.__dynamic$config.bare.path.toString()))
              return await fetch(s);
            if (t.util.path(s)) {
              if (!s.client || !s.url.startsWith("http")) return await fetch(s);
              Object.defineProperty(s, "url", {
                value: t.util.rewritePath(
                  s,
                  s.client,
                  new URL(e.__dynamic.url.decode(new URL(s.url)))
                ),
              });
            }
            if (!t.util.routePath(s)) return await t.util.route(s);
            await t.bare.working;
            let c = new Qe(t.config);
            (c.encoding = {
              ...c.encoding,
              ...c.encoding[t.config.encoding || "none"],
            }),
              (c.on = (d, p) => e.__dynamic.on(d, p)),
              (c.fire = (d, ...p) => e.__dynamic.fire(d, p));
            let l = c.fire("request", [s]);
            if (l) return l;
            if (
              s.url.startsWith(location.origin + t.config.prefix + "caches/")
            ) {
              let p = await (
                await caches.open("__dynamic")
              ).match(new URL(s.url).pathname);
              if (!p) return new Response(null, { status: 201 });
              var a;
              let g = await p.blob(),
                m = await g.text(),
                b = c.rewrite.html.generateHead(
                  location.origin +
                    e.__dynamic$config.assets.prefix +
                    e.__dynamic$config.assets.files.client,
                  location.origin +
                    e.__dynamic$config.assets.prefix +
                    e.__dynamic$config.assets.files.config,
                  location.origin +
                    e.__dynamic$config.assets.prefix +
                    e.__dynamic$config.assets.files.config,
                  "",
                  `window.__dynamic$url = "${p.headers.get("x-dynamic-location")}"`
                );
              return (
                c.meta.load(new URL(p.headers.get("x-dynamic-location"))),
                c.is.html(c.meta, p.headers.get("content-type"), m)
                  ? (a = new Blob([c.rewrite.html.rewrite(m, c.meta, b)]))
                  : (a = g),
                new Response(a, {
                  status: p.status,
                  statusText: p.statusText,
                  headers: p.headers,
                })
              );
            }
            if (
              (c.meta.load(new URL(c.url.decode(new URL(s.url)))),
              i.indexOf(c.meta.host) !== -1 ||
                i.find((d) => d instanceof RegExp && d.test(c.meta.host)))
            )
              return (
                this.fire("blocked", [c.meta, s]) ||
                new Response(null, { status: 403, statusText: "Forbidden" })
              );
            let h = c.cookies;
            await h.open(), await h.update(c.meta.host);
            let y = Object.fromEntries(s.headers.entries()),
              S = t.util.reqHeader(
                y,
                c.meta,
                s,
                await h.get(
                  s.client ? s.client.__dynamic$location.host : c.meta.host
                )
              ),
              x = new t.http.Request(c.meta.href, {
                headers: S,
                redirect: s.redirect || "manual",
                method: s.method,
                credentials: s.credentials,
                body: null,
                cache: s.cache,
              }),
              f;
            t.headers.method.body.indexOf(s.method.toUpperCase()) == -1 &&
              (x.body = await s.blob()),
              c.meta.protocol !== "about:"
                ? (f = await (await t.bare).fetch(c.meta.href, x.init))
                : (f = new t.util.about(
                    new Blob(["<html><head></head><body></body></html>"])
                  ));
            let O = this.fire("fetched", [c.meta, f, s]);
            if (O) return O;
            let W = await c.util.resHeader(f.rawHeaders, c.meta, h);
            var n = await e.clients.matchAll();
            for await (var u of n)
              u.postMessage({
                type: "cookies",
                host: c.meta.host,
                cookies: await h.get(c.meta.host),
              });
            let R = !1;
            switch (s.destination) {
              case "document":
                let d = await f.blob(),
                  p = await d.text(),
                  g = c.rewrite.html.generateHead(
                    location.origin +
                      e.__dynamic$config.assets.prefix +
                      e.__dynamic$config.assets.files.client,
                    location.origin +
                      e.__dynamic$config.assets.prefix +
                      e.__dynamic$config.assets.files.config,
                    location.origin +
                      e.__dynamic$config.assets.prefix +
                      e.__dynamic$config.assets.files.client,
                    await h.get(c.meta.host),
                    "",
                    !1,
                    "self.__dynamic$bare = JSON.parse('" +
                      JSON.stringify((await t.bare).manifest) +
                      "');"
                  );
                c.is.html(c.meta, f.headers.get("content-type"), p)
                  ? (R = new Blob([c.rewrite.html.rewrite(p, c.meta, g)], {
                      type:
                        f.headers.get("content-type") ||
                        "text/html; charset=utf-8",
                    }))
                  : (R = d);
                break;
              case "iframe": {
                let m = await f.blob(),
                  b = await m.text();
                if (c.is.html(c.meta, f.headers.get("content-type"), b)) {
                  try {
                    let C = c.rewrite.html.generateHead(
                      location.origin +
                        e.__dynamic$config.assets.prefix +
                        e.__dynamic$config.assets.files.client,
                      location.origin +
                        e.__dynamic$config.assets.prefix +
                        e.__dynamic$config.assets.files.config,
                      location.origin +
                        e.__dynamic$config.assets.prefix +
                        e.__dynamic$config.assets.files.client,
                      await h.get(c.meta.host),
                      "",
                      !0,
                      "self.__dynamic$bare = JSON.parse('" +
                        JSON.stringify((await t.bare).manifest) +
                        "');"
                    );
                    R = new Blob(
                      [new (await e.html)({ ctx: c }).rewrite(b, c.meta, C)],
                      {
                        type:
                          f.headers.get("content-type") ||
                          "text/html; charset=utf-8",
                      }
                    );
                  } catch {
                    R = m;
                  }
                  break;
                }
                R = m;
                break;
              }
              case "worker":
              case "script":
                c.is.js(c.meta, f.headers.get("content-type")) &&
                  (R = new Blob(
                    [c.rewrite.js.rewrite(await f.text(), s, !0, c)],
                    {
                      type:
                        f.headers.get("content-type") ||
                        "application/javascript",
                    }
                  ));
                break;
              case "style":
                c.is.css(c.meta, f.headers.get("content-type")) &&
                  (R = new Blob(
                    [c.rewrite.css.rewrite(await f.text(), c.meta)],
                    { type: f.headers.get("content-type") || "text/css" }
                  ));
                break;
              case "manifest":
                R = new Blob([c.rewrite.man.rewrite(await f.text(), c.meta)], {
                  type: f.headers.get("content-type") || "application/json",
                });
                break;
              default: {
                let m = await f.blob(),
                  b = await m.text();
                if (c.is.html(c.meta, f.headers.get("content-type"), b)) {
                  try {
                    R = new Blob(
                      [new (await e.html)({ ctx: c }).rewrite(b, c.meta, [])],
                      {
                        type:
                          f.headers.get("content-type") ||
                          "text/html; charset=utf-8",
                      }
                    );
                  } catch {
                    R = m;
                  }
                  break;
                }
                R = m;
                break;
              }
            }
            R == !1 && (R = await f.blob()),
              t.headers.status.empty.indexOf(f.status) !== -1 && (R = null),
              S.get("accept") === "text/event-stream" &&
                W.set("content-type", "text/event-stream"),
              R && W.set("content-length", R.size);
            let Ie = this.fire("response", [c.meta, f, s, W, R]);
            return (
              Ie ||
              new Response(R, {
                status: f.status,
                statusText: f.statusText,
                headers: W,
              })
            );
          } catch (c) {
            return (
              e.__dynamic$config.logLevel >= 1 && console.error(c),
              new Response(c, {
                status: 500,
                statusText: "error",
                headers: new Headers({}),
              })
            );
          }
        }
      })
    );
  })(self);
})();
/*! Bundled license information:

cookie/index.js:
  (*!
   * cookie
   * Copyright(c) 2012-2014 Roman Shtylman
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)
*/
//# sourceMappingURL=worker.js.map
