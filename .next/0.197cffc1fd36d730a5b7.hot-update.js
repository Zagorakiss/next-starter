webpackHotUpdate(0,{

/***/ 550:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var encode = __webpack_require__(572);
var decode = __webpack_require__(571);

var C_BACKSLASH = 92;

var decodeHTML = __webpack_require__(552).decodeHTML;

var ENTITY = "&(?:#x[a-f0-9]{1,8}|#[0-9]{1,8}|[a-z][a-z0-9]{1,31});";

var TAGNAME = '[A-Za-z][A-Za-z0-9-]*';
var ATTRIBUTENAME = '[a-zA-Z_:][a-zA-Z0-9:._-]*';
var UNQUOTEDVALUE = "[^\"'=<>`\\x00-\\x20]+";
var SINGLEQUOTEDVALUE = "'[^']*'";
var DOUBLEQUOTEDVALUE = '"[^"]*"';
var ATTRIBUTEVALUE = "(?:" + UNQUOTEDVALUE + "|" + SINGLEQUOTEDVALUE + "|" + DOUBLEQUOTEDVALUE + ")";
var ATTRIBUTEVALUESPEC = "(?:" + "\\s*=" + "\\s*" + ATTRIBUTEVALUE + ")";
var ATTRIBUTE = "(?:" + "\\s+" + ATTRIBUTENAME + ATTRIBUTEVALUESPEC + "?)";
var OPENTAG = "<" + TAGNAME + ATTRIBUTE + "*" + "\\s*/?>";
var CLOSETAG = "</" + TAGNAME + "\\s*[>]";
var HTMLCOMMENT = "<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->";
var PROCESSINGINSTRUCTION = "[<][?].*?[?][>]";
var DECLARATION = "<![A-Z]+" + "\\s+[^>]*>";
var CDATA = "<!\\[CDATA\\[[\\s\\S]*?\\]\\]>";
var HTMLTAG = "(?:" + OPENTAG + "|" + CLOSETAG + "|" + HTMLCOMMENT + "|" +
        PROCESSINGINSTRUCTION + "|" + DECLARATION + "|" + CDATA + ")";
var reHtmlTag = new RegExp('^' + HTMLTAG, 'i');

var reBackslashOrAmp = /[\\&]/;

var ESCAPABLE = '[!"#$%&\'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]';

var reEntityOrEscapedChar = new RegExp('\\\\' + ESCAPABLE + '|' + ENTITY, 'gi');

var XMLSPECIAL = '[&<>"]';

var reXmlSpecial = new RegExp(XMLSPECIAL, 'g');

var reXmlSpecialOrEntity = new RegExp(ENTITY + '|' + XMLSPECIAL, 'gi');

var unescapeChar = function(s) {
    if (s.charCodeAt(0) === C_BACKSLASH) {
        return s.charAt(1);
    } else {
        return decodeHTML(s);
    }
};

// Replace entities and backslash escapes with literal characters.
var unescapeString = function(s) {
    if (reBackslashOrAmp.test(s)) {
        return s.replace(reEntityOrEscapedChar, unescapeChar);
    } else {
        return s;
    }
};

var normalizeURI = function(uri) {
    try {
        return encode(decode(uri));
    }
    catch(err) {
        return uri;
    }
};

var replaceUnsafeChar = function(s) {
    switch (s) {
    case '&':
        return '&amp;';
    case '<':
        return '&lt;';
    case '>':
        return '&gt;';
    case '"':
        return '&quot;';
    default:
        return s;
    }
};

var escapeXml = function(s, preserve_entities) {
    if (reXmlSpecial.test(s)) {
        if (preserve_entities) {
            return s.replace(reXmlSpecialOrEntity, replaceUnsafeChar);
        } else {
            return s.replace(reXmlSpecial, replaceUnsafeChar);
        }
    } else {
        return s;
    }
};

module.exports = { unescapeString: unescapeString,
                   normalizeURI: normalizeURI,
                   escapeXml: escapeXml,
                   reHtmlTag: reHtmlTag,
                   OPENTAG: OPENTAG,
                   CLOSETAG: CLOSETAG,
                   ENTITY: ENTITY,
                   ESCAPABLE: ESCAPABLE
                 };


/***/ }),

/***/ 551:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function isContainer(node) {
    switch (node._type) {
    case 'Document':
    case 'BlockQuote':
    case 'List':
    case 'Item':
    case 'Paragraph':
    case 'Heading':
    case 'Emph':
    case 'Strong':
    case 'Link':
    case 'Image':
    case 'CustomInline':
    case 'CustomBlock':
        return true;
    default:
        return false;
    }
}

var resumeAt = function(node, entering) {
    this.current = node;
    this.entering = (entering === true);
};

var next = function(){
    var cur = this.current;
    var entering = this.entering;

    if (cur === null) {
        return null;
    }

    var container = isContainer(cur);

    if (entering && container) {
        if (cur._firstChild) {
            this.current = cur._firstChild;
            this.entering = true;
        } else {
            // stay on node but exit
            this.entering = false;
        }

    } else if (cur === this.root) {
        this.current = null;

    } else if (cur._next === null) {
        this.current = cur._parent;
        this.entering = false;

    } else {
        this.current = cur._next;
        this.entering = true;
    }

    return {entering: entering, node: cur};
};

var NodeWalker = function(root) {
    return { current: root,
             root: root,
             entering: true,
             next: next,
             resumeAt: resumeAt };
};

var Node = function(nodeType, sourcepos) {
    this._type = nodeType;
    this._parent = null;
    this._firstChild = null;
    this._lastChild = null;
    this._prev = null;
    this._next = null;
    this._sourcepos = sourcepos;
    this._lastLineBlank = false;
    this._open = true;
    this._string_content = null;
    this._literal = null;
    this._listData = {};
    this._info = null;
    this._destination = null;
    this._title = null;
    this._isFenced = false;
    this._fenceChar = null;
    this._fenceLength = 0;
    this._fenceOffset = null;
    this._level = null;
    this._onEnter = null;
    this._onExit = null;
};

var proto = Node.prototype;

Object.defineProperty(proto, 'isContainer', {
    get: function () { return isContainer(this); }
});

Object.defineProperty(proto, 'type', {
    get: function() { return this._type; }
});

Object.defineProperty(proto, 'firstChild', {
    get: function() { return this._firstChild; }
});

Object.defineProperty(proto, 'lastChild', {
    get: function() { return this._lastChild; }
});

Object.defineProperty(proto, 'next', {
    get: function() { return this._next; }
});

Object.defineProperty(proto, 'prev', {
    get: function() { return this._prev; }
});

Object.defineProperty(proto, 'parent', {
    get: function() { return this._parent; }
});

Object.defineProperty(proto, 'sourcepos', {
    get: function() { return this._sourcepos; }
});

Object.defineProperty(proto, 'literal', {
    get: function() { return this._literal; },
    set: function(s) { this._literal = s; }
});

Object.defineProperty(proto, 'destination', {
    get: function() { return this._destination; },
    set: function(s) { this._destination = s; }
});

Object.defineProperty(proto, 'title', {
    get: function() { return this._title; },
    set: function(s) { this._title = s; }
});

Object.defineProperty(proto, 'info', {
    get: function() { return this._info; },
    set: function(s) { this._info = s; }
});

Object.defineProperty(proto, 'level', {
    get: function() { return this._level; },
    set: function(s) { this._level = s; }
});

Object.defineProperty(proto, 'listType', {
    get: function() { return this._listData.type; },
    set: function(t) { this._listData.type = t; }
});

Object.defineProperty(proto, 'listTight', {
    get: function() { return this._listData.tight; },
    set: function(t) { this._listData.tight = t; }
});

Object.defineProperty(proto, 'listStart', {
    get: function() { return this._listData.start; },
    set: function(n) { this._listData.start = n; }
});

Object.defineProperty(proto, 'listDelimiter', {
    get: function() { return this._listData.delimiter; },
    set: function(delim) { this._listData.delimiter = delim; }
});

Object.defineProperty(proto, 'onEnter', {
    get: function() { return this._onEnter; },
    set: function(s) { this._onEnter = s; }
});

Object.defineProperty(proto, 'onExit', {
    get: function() { return this._onExit; },
    set: function(s) { this._onExit = s; }
});

Node.prototype.appendChild = function(child) {
    child.unlink();
    child._parent = this;
    if (this._lastChild) {
        this._lastChild._next = child;
        child._prev = this._lastChild;
        this._lastChild = child;
    } else {
        this._firstChild = child;
        this._lastChild = child;
    }
};

Node.prototype.prependChild = function(child) {
    child.unlink();
    child._parent = this;
    if (this._firstChild) {
        this._firstChild._prev = child;
        child._next = this._firstChild;
        this._firstChild = child;
    } else {
        this._firstChild = child;
        this._lastChild = child;
    }
};

Node.prototype.unlink = function() {
    if (this._prev) {
        this._prev._next = this._next;
    } else if (this._parent) {
        this._parent._firstChild = this._next;
    }
    if (this._next) {
        this._next._prev = this._prev;
    } else if (this._parent) {
        this._parent._lastChild = this._prev;
    }
    this._parent = null;
    this._next = null;
    this._prev = null;
};

Node.prototype.insertAfter = function(sibling) {
    sibling.unlink();
    sibling._next = this._next;
    if (sibling._next) {
        sibling._next._prev = sibling;
    }
    sibling._prev = this;
    this._next = sibling;
    sibling._parent = this._parent;
    if (!sibling._next) {
        sibling._parent._lastChild = sibling;
    }
};

Node.prototype.insertBefore = function(sibling) {
    sibling.unlink();
    sibling._prev = this._prev;
    if (sibling._prev) {
        sibling._prev._next = sibling;
    }
    sibling._next = this;
    this._prev = sibling;
    sibling._parent = this._parent;
    if (!sibling._prev) {
        sibling._parent._firstChild = sibling;
    }
};

Node.prototype.walker = function() {
    var walker = new NodeWalker(this);
    return walker;
};

module.exports = Node;


/* Example of use of walker:

 var walker = w.walker();
 var event;

 while (event = walker.next()) {
 console.log(event.entering, event.node.type);
 }

 */


/***/ }),

/***/ 552:
/***/ (function(module, exports, __webpack_require__) {

var encode = __webpack_require__(566),
    decode = __webpack_require__(564);

exports.decode = function(data, level){
	return (!level || level <= 0 ? decode.XML : decode.HTML)(data);
};

exports.decodeStrict = function(data, level){
	return (!level || level <= 0 ? decode.XML : decode.HTMLStrict)(data);
};

exports.encode = function(data, level){
	return (!level || level <= 0 ? encode.XML : encode.HTML)(data);
};

exports.encodeXML = encode.XML;

exports.encodeHTML4 =
exports.encodeHTML5 =
exports.encodeHTML  = encode.HTML;

exports.decodeXML =
exports.decodeXMLStrict = decode.XML;

exports.decodeHTML4 =
exports.decodeHTML5 =
exports.decodeHTML = decode.HTML;

exports.decodeHTML4Strict =
exports.decodeHTML5Strict =
exports.decodeHTMLStrict = decode.HTMLStrict;

exports.escape = encode.escape;


/***/ }),

/***/ 553:
/***/ (function(module, exports) {

module.exports = {
	"Aacute": "Á",
	"aacute": "á",
	"Abreve": "Ă",
	"abreve": "ă",
	"ac": "∾",
	"acd": "∿",
	"acE": "∾̳",
	"Acirc": "Â",
	"acirc": "â",
	"acute": "´",
	"Acy": "А",
	"acy": "а",
	"AElig": "Æ",
	"aelig": "æ",
	"af": "⁡",
	"Afr": "𝔄",
	"afr": "𝔞",
	"Agrave": "À",
	"agrave": "à",
	"alefsym": "ℵ",
	"aleph": "ℵ",
	"Alpha": "Α",
	"alpha": "α",
	"Amacr": "Ā",
	"amacr": "ā",
	"amalg": "⨿",
	"amp": "&",
	"AMP": "&",
	"andand": "⩕",
	"And": "⩓",
	"and": "∧",
	"andd": "⩜",
	"andslope": "⩘",
	"andv": "⩚",
	"ang": "∠",
	"ange": "⦤",
	"angle": "∠",
	"angmsdaa": "⦨",
	"angmsdab": "⦩",
	"angmsdac": "⦪",
	"angmsdad": "⦫",
	"angmsdae": "⦬",
	"angmsdaf": "⦭",
	"angmsdag": "⦮",
	"angmsdah": "⦯",
	"angmsd": "∡",
	"angrt": "∟",
	"angrtvb": "⊾",
	"angrtvbd": "⦝",
	"angsph": "∢",
	"angst": "Å",
	"angzarr": "⍼",
	"Aogon": "Ą",
	"aogon": "ą",
	"Aopf": "𝔸",
	"aopf": "𝕒",
	"apacir": "⩯",
	"ap": "≈",
	"apE": "⩰",
	"ape": "≊",
	"apid": "≋",
	"apos": "'",
	"ApplyFunction": "⁡",
	"approx": "≈",
	"approxeq": "≊",
	"Aring": "Å",
	"aring": "å",
	"Ascr": "𝒜",
	"ascr": "𝒶",
	"Assign": "≔",
	"ast": "*",
	"asymp": "≈",
	"asympeq": "≍",
	"Atilde": "Ã",
	"atilde": "ã",
	"Auml": "Ä",
	"auml": "ä",
	"awconint": "∳",
	"awint": "⨑",
	"backcong": "≌",
	"backepsilon": "϶",
	"backprime": "‵",
	"backsim": "∽",
	"backsimeq": "⋍",
	"Backslash": "∖",
	"Barv": "⫧",
	"barvee": "⊽",
	"barwed": "⌅",
	"Barwed": "⌆",
	"barwedge": "⌅",
	"bbrk": "⎵",
	"bbrktbrk": "⎶",
	"bcong": "≌",
	"Bcy": "Б",
	"bcy": "б",
	"bdquo": "„",
	"becaus": "∵",
	"because": "∵",
	"Because": "∵",
	"bemptyv": "⦰",
	"bepsi": "϶",
	"bernou": "ℬ",
	"Bernoullis": "ℬ",
	"Beta": "Β",
	"beta": "β",
	"beth": "ℶ",
	"between": "≬",
	"Bfr": "𝔅",
	"bfr": "𝔟",
	"bigcap": "⋂",
	"bigcirc": "◯",
	"bigcup": "⋃",
	"bigodot": "⨀",
	"bigoplus": "⨁",
	"bigotimes": "⨂",
	"bigsqcup": "⨆",
	"bigstar": "★",
	"bigtriangledown": "▽",
	"bigtriangleup": "△",
	"biguplus": "⨄",
	"bigvee": "⋁",
	"bigwedge": "⋀",
	"bkarow": "⤍",
	"blacklozenge": "⧫",
	"blacksquare": "▪",
	"blacktriangle": "▴",
	"blacktriangledown": "▾",
	"blacktriangleleft": "◂",
	"blacktriangleright": "▸",
	"blank": "␣",
	"blk12": "▒",
	"blk14": "░",
	"blk34": "▓",
	"block": "█",
	"bne": "=⃥",
	"bnequiv": "≡⃥",
	"bNot": "⫭",
	"bnot": "⌐",
	"Bopf": "𝔹",
	"bopf": "𝕓",
	"bot": "⊥",
	"bottom": "⊥",
	"bowtie": "⋈",
	"boxbox": "⧉",
	"boxdl": "┐",
	"boxdL": "╕",
	"boxDl": "╖",
	"boxDL": "╗",
	"boxdr": "┌",
	"boxdR": "╒",
	"boxDr": "╓",
	"boxDR": "╔",
	"boxh": "─",
	"boxH": "═",
	"boxhd": "┬",
	"boxHd": "╤",
	"boxhD": "╥",
	"boxHD": "╦",
	"boxhu": "┴",
	"boxHu": "╧",
	"boxhU": "╨",
	"boxHU": "╩",
	"boxminus": "⊟",
	"boxplus": "⊞",
	"boxtimes": "⊠",
	"boxul": "┘",
	"boxuL": "╛",
	"boxUl": "╜",
	"boxUL": "╝",
	"boxur": "└",
	"boxuR": "╘",
	"boxUr": "╙",
	"boxUR": "╚",
	"boxv": "│",
	"boxV": "║",
	"boxvh": "┼",
	"boxvH": "╪",
	"boxVh": "╫",
	"boxVH": "╬",
	"boxvl": "┤",
	"boxvL": "╡",
	"boxVl": "╢",
	"boxVL": "╣",
	"boxvr": "├",
	"boxvR": "╞",
	"boxVr": "╟",
	"boxVR": "╠",
	"bprime": "‵",
	"breve": "˘",
	"Breve": "˘",
	"brvbar": "¦",
	"bscr": "𝒷",
	"Bscr": "ℬ",
	"bsemi": "⁏",
	"bsim": "∽",
	"bsime": "⋍",
	"bsolb": "⧅",
	"bsol": "\\",
	"bsolhsub": "⟈",
	"bull": "•",
	"bullet": "•",
	"bump": "≎",
	"bumpE": "⪮",
	"bumpe": "≏",
	"Bumpeq": "≎",
	"bumpeq": "≏",
	"Cacute": "Ć",
	"cacute": "ć",
	"capand": "⩄",
	"capbrcup": "⩉",
	"capcap": "⩋",
	"cap": "∩",
	"Cap": "⋒",
	"capcup": "⩇",
	"capdot": "⩀",
	"CapitalDifferentialD": "ⅅ",
	"caps": "∩︀",
	"caret": "⁁",
	"caron": "ˇ",
	"Cayleys": "ℭ",
	"ccaps": "⩍",
	"Ccaron": "Č",
	"ccaron": "č",
	"Ccedil": "Ç",
	"ccedil": "ç",
	"Ccirc": "Ĉ",
	"ccirc": "ĉ",
	"Cconint": "∰",
	"ccups": "⩌",
	"ccupssm": "⩐",
	"Cdot": "Ċ",
	"cdot": "ċ",
	"cedil": "¸",
	"Cedilla": "¸",
	"cemptyv": "⦲",
	"cent": "¢",
	"centerdot": "·",
	"CenterDot": "·",
	"cfr": "𝔠",
	"Cfr": "ℭ",
	"CHcy": "Ч",
	"chcy": "ч",
	"check": "✓",
	"checkmark": "✓",
	"Chi": "Χ",
	"chi": "χ",
	"circ": "ˆ",
	"circeq": "≗",
	"circlearrowleft": "↺",
	"circlearrowright": "↻",
	"circledast": "⊛",
	"circledcirc": "⊚",
	"circleddash": "⊝",
	"CircleDot": "⊙",
	"circledR": "®",
	"circledS": "Ⓢ",
	"CircleMinus": "⊖",
	"CirclePlus": "⊕",
	"CircleTimes": "⊗",
	"cir": "○",
	"cirE": "⧃",
	"cire": "≗",
	"cirfnint": "⨐",
	"cirmid": "⫯",
	"cirscir": "⧂",
	"ClockwiseContourIntegral": "∲",
	"CloseCurlyDoubleQuote": "”",
	"CloseCurlyQuote": "’",
	"clubs": "♣",
	"clubsuit": "♣",
	"colon": ":",
	"Colon": "∷",
	"Colone": "⩴",
	"colone": "≔",
	"coloneq": "≔",
	"comma": ",",
	"commat": "@",
	"comp": "∁",
	"compfn": "∘",
	"complement": "∁",
	"complexes": "ℂ",
	"cong": "≅",
	"congdot": "⩭",
	"Congruent": "≡",
	"conint": "∮",
	"Conint": "∯",
	"ContourIntegral": "∮",
	"copf": "𝕔",
	"Copf": "ℂ",
	"coprod": "∐",
	"Coproduct": "∐",
	"copy": "©",
	"COPY": "©",
	"copysr": "℗",
	"CounterClockwiseContourIntegral": "∳",
	"crarr": "↵",
	"cross": "✗",
	"Cross": "⨯",
	"Cscr": "𝒞",
	"cscr": "𝒸",
	"csub": "⫏",
	"csube": "⫑",
	"csup": "⫐",
	"csupe": "⫒",
	"ctdot": "⋯",
	"cudarrl": "⤸",
	"cudarrr": "⤵",
	"cuepr": "⋞",
	"cuesc": "⋟",
	"cularr": "↶",
	"cularrp": "⤽",
	"cupbrcap": "⩈",
	"cupcap": "⩆",
	"CupCap": "≍",
	"cup": "∪",
	"Cup": "⋓",
	"cupcup": "⩊",
	"cupdot": "⊍",
	"cupor": "⩅",
	"cups": "∪︀",
	"curarr": "↷",
	"curarrm": "⤼",
	"curlyeqprec": "⋞",
	"curlyeqsucc": "⋟",
	"curlyvee": "⋎",
	"curlywedge": "⋏",
	"curren": "¤",
	"curvearrowleft": "↶",
	"curvearrowright": "↷",
	"cuvee": "⋎",
	"cuwed": "⋏",
	"cwconint": "∲",
	"cwint": "∱",
	"cylcty": "⌭",
	"dagger": "†",
	"Dagger": "‡",
	"daleth": "ℸ",
	"darr": "↓",
	"Darr": "↡",
	"dArr": "⇓",
	"dash": "‐",
	"Dashv": "⫤",
	"dashv": "⊣",
	"dbkarow": "⤏",
	"dblac": "˝",
	"Dcaron": "Ď",
	"dcaron": "ď",
	"Dcy": "Д",
	"dcy": "д",
	"ddagger": "‡",
	"ddarr": "⇊",
	"DD": "ⅅ",
	"dd": "ⅆ",
	"DDotrahd": "⤑",
	"ddotseq": "⩷",
	"deg": "°",
	"Del": "∇",
	"Delta": "Δ",
	"delta": "δ",
	"demptyv": "⦱",
	"dfisht": "⥿",
	"Dfr": "𝔇",
	"dfr": "𝔡",
	"dHar": "⥥",
	"dharl": "⇃",
	"dharr": "⇂",
	"DiacriticalAcute": "´",
	"DiacriticalDot": "˙",
	"DiacriticalDoubleAcute": "˝",
	"DiacriticalGrave": "`",
	"DiacriticalTilde": "˜",
	"diam": "⋄",
	"diamond": "⋄",
	"Diamond": "⋄",
	"diamondsuit": "♦",
	"diams": "♦",
	"die": "¨",
	"DifferentialD": "ⅆ",
	"digamma": "ϝ",
	"disin": "⋲",
	"div": "÷",
	"divide": "÷",
	"divideontimes": "⋇",
	"divonx": "⋇",
	"DJcy": "Ђ",
	"djcy": "ђ",
	"dlcorn": "⌞",
	"dlcrop": "⌍",
	"dollar": "$",
	"Dopf": "𝔻",
	"dopf": "𝕕",
	"Dot": "¨",
	"dot": "˙",
	"DotDot": "⃜",
	"doteq": "≐",
	"doteqdot": "≑",
	"DotEqual": "≐",
	"dotminus": "∸",
	"dotplus": "∔",
	"dotsquare": "⊡",
	"doublebarwedge": "⌆",
	"DoubleContourIntegral": "∯",
	"DoubleDot": "¨",
	"DoubleDownArrow": "⇓",
	"DoubleLeftArrow": "⇐",
	"DoubleLeftRightArrow": "⇔",
	"DoubleLeftTee": "⫤",
	"DoubleLongLeftArrow": "⟸",
	"DoubleLongLeftRightArrow": "⟺",
	"DoubleLongRightArrow": "⟹",
	"DoubleRightArrow": "⇒",
	"DoubleRightTee": "⊨",
	"DoubleUpArrow": "⇑",
	"DoubleUpDownArrow": "⇕",
	"DoubleVerticalBar": "∥",
	"DownArrowBar": "⤓",
	"downarrow": "↓",
	"DownArrow": "↓",
	"Downarrow": "⇓",
	"DownArrowUpArrow": "⇵",
	"DownBreve": "̑",
	"downdownarrows": "⇊",
	"downharpoonleft": "⇃",
	"downharpoonright": "⇂",
	"DownLeftRightVector": "⥐",
	"DownLeftTeeVector": "⥞",
	"DownLeftVectorBar": "⥖",
	"DownLeftVector": "↽",
	"DownRightTeeVector": "⥟",
	"DownRightVectorBar": "⥗",
	"DownRightVector": "⇁",
	"DownTeeArrow": "↧",
	"DownTee": "⊤",
	"drbkarow": "⤐",
	"drcorn": "⌟",
	"drcrop": "⌌",
	"Dscr": "𝒟",
	"dscr": "𝒹",
	"DScy": "Ѕ",
	"dscy": "ѕ",
	"dsol": "⧶",
	"Dstrok": "Đ",
	"dstrok": "đ",
	"dtdot": "⋱",
	"dtri": "▿",
	"dtrif": "▾",
	"duarr": "⇵",
	"duhar": "⥯",
	"dwangle": "⦦",
	"DZcy": "Џ",
	"dzcy": "џ",
	"dzigrarr": "⟿",
	"Eacute": "É",
	"eacute": "é",
	"easter": "⩮",
	"Ecaron": "Ě",
	"ecaron": "ě",
	"Ecirc": "Ê",
	"ecirc": "ê",
	"ecir": "≖",
	"ecolon": "≕",
	"Ecy": "Э",
	"ecy": "э",
	"eDDot": "⩷",
	"Edot": "Ė",
	"edot": "ė",
	"eDot": "≑",
	"ee": "ⅇ",
	"efDot": "≒",
	"Efr": "𝔈",
	"efr": "𝔢",
	"eg": "⪚",
	"Egrave": "È",
	"egrave": "è",
	"egs": "⪖",
	"egsdot": "⪘",
	"el": "⪙",
	"Element": "∈",
	"elinters": "⏧",
	"ell": "ℓ",
	"els": "⪕",
	"elsdot": "⪗",
	"Emacr": "Ē",
	"emacr": "ē",
	"empty": "∅",
	"emptyset": "∅",
	"EmptySmallSquare": "◻",
	"emptyv": "∅",
	"EmptyVerySmallSquare": "▫",
	"emsp13": " ",
	"emsp14": " ",
	"emsp": " ",
	"ENG": "Ŋ",
	"eng": "ŋ",
	"ensp": " ",
	"Eogon": "Ę",
	"eogon": "ę",
	"Eopf": "𝔼",
	"eopf": "𝕖",
	"epar": "⋕",
	"eparsl": "⧣",
	"eplus": "⩱",
	"epsi": "ε",
	"Epsilon": "Ε",
	"epsilon": "ε",
	"epsiv": "ϵ",
	"eqcirc": "≖",
	"eqcolon": "≕",
	"eqsim": "≂",
	"eqslantgtr": "⪖",
	"eqslantless": "⪕",
	"Equal": "⩵",
	"equals": "=",
	"EqualTilde": "≂",
	"equest": "≟",
	"Equilibrium": "⇌",
	"equiv": "≡",
	"equivDD": "⩸",
	"eqvparsl": "⧥",
	"erarr": "⥱",
	"erDot": "≓",
	"escr": "ℯ",
	"Escr": "ℰ",
	"esdot": "≐",
	"Esim": "⩳",
	"esim": "≂",
	"Eta": "Η",
	"eta": "η",
	"ETH": "Ð",
	"eth": "ð",
	"Euml": "Ë",
	"euml": "ë",
	"euro": "€",
	"excl": "!",
	"exist": "∃",
	"Exists": "∃",
	"expectation": "ℰ",
	"exponentiale": "ⅇ",
	"ExponentialE": "ⅇ",
	"fallingdotseq": "≒",
	"Fcy": "Ф",
	"fcy": "ф",
	"female": "♀",
	"ffilig": "ﬃ",
	"fflig": "ﬀ",
	"ffllig": "ﬄ",
	"Ffr": "𝔉",
	"ffr": "𝔣",
	"filig": "ﬁ",
	"FilledSmallSquare": "◼",
	"FilledVerySmallSquare": "▪",
	"fjlig": "fj",
	"flat": "♭",
	"fllig": "ﬂ",
	"fltns": "▱",
	"fnof": "ƒ",
	"Fopf": "𝔽",
	"fopf": "𝕗",
	"forall": "∀",
	"ForAll": "∀",
	"fork": "⋔",
	"forkv": "⫙",
	"Fouriertrf": "ℱ",
	"fpartint": "⨍",
	"frac12": "½",
	"frac13": "⅓",
	"frac14": "¼",
	"frac15": "⅕",
	"frac16": "⅙",
	"frac18": "⅛",
	"frac23": "⅔",
	"frac25": "⅖",
	"frac34": "¾",
	"frac35": "⅗",
	"frac38": "⅜",
	"frac45": "⅘",
	"frac56": "⅚",
	"frac58": "⅝",
	"frac78": "⅞",
	"frasl": "⁄",
	"frown": "⌢",
	"fscr": "𝒻",
	"Fscr": "ℱ",
	"gacute": "ǵ",
	"Gamma": "Γ",
	"gamma": "γ",
	"Gammad": "Ϝ",
	"gammad": "ϝ",
	"gap": "⪆",
	"Gbreve": "Ğ",
	"gbreve": "ğ",
	"Gcedil": "Ģ",
	"Gcirc": "Ĝ",
	"gcirc": "ĝ",
	"Gcy": "Г",
	"gcy": "г",
	"Gdot": "Ġ",
	"gdot": "ġ",
	"ge": "≥",
	"gE": "≧",
	"gEl": "⪌",
	"gel": "⋛",
	"geq": "≥",
	"geqq": "≧",
	"geqslant": "⩾",
	"gescc": "⪩",
	"ges": "⩾",
	"gesdot": "⪀",
	"gesdoto": "⪂",
	"gesdotol": "⪄",
	"gesl": "⋛︀",
	"gesles": "⪔",
	"Gfr": "𝔊",
	"gfr": "𝔤",
	"gg": "≫",
	"Gg": "⋙",
	"ggg": "⋙",
	"gimel": "ℷ",
	"GJcy": "Ѓ",
	"gjcy": "ѓ",
	"gla": "⪥",
	"gl": "≷",
	"glE": "⪒",
	"glj": "⪤",
	"gnap": "⪊",
	"gnapprox": "⪊",
	"gne": "⪈",
	"gnE": "≩",
	"gneq": "⪈",
	"gneqq": "≩",
	"gnsim": "⋧",
	"Gopf": "𝔾",
	"gopf": "𝕘",
	"grave": "`",
	"GreaterEqual": "≥",
	"GreaterEqualLess": "⋛",
	"GreaterFullEqual": "≧",
	"GreaterGreater": "⪢",
	"GreaterLess": "≷",
	"GreaterSlantEqual": "⩾",
	"GreaterTilde": "≳",
	"Gscr": "𝒢",
	"gscr": "ℊ",
	"gsim": "≳",
	"gsime": "⪎",
	"gsiml": "⪐",
	"gtcc": "⪧",
	"gtcir": "⩺",
	"gt": ">",
	"GT": ">",
	"Gt": "≫",
	"gtdot": "⋗",
	"gtlPar": "⦕",
	"gtquest": "⩼",
	"gtrapprox": "⪆",
	"gtrarr": "⥸",
	"gtrdot": "⋗",
	"gtreqless": "⋛",
	"gtreqqless": "⪌",
	"gtrless": "≷",
	"gtrsim": "≳",
	"gvertneqq": "≩︀",
	"gvnE": "≩︀",
	"Hacek": "ˇ",
	"hairsp": " ",
	"half": "½",
	"hamilt": "ℋ",
	"HARDcy": "Ъ",
	"hardcy": "ъ",
	"harrcir": "⥈",
	"harr": "↔",
	"hArr": "⇔",
	"harrw": "↭",
	"Hat": "^",
	"hbar": "ℏ",
	"Hcirc": "Ĥ",
	"hcirc": "ĥ",
	"hearts": "♥",
	"heartsuit": "♥",
	"hellip": "…",
	"hercon": "⊹",
	"hfr": "𝔥",
	"Hfr": "ℌ",
	"HilbertSpace": "ℋ",
	"hksearow": "⤥",
	"hkswarow": "⤦",
	"hoarr": "⇿",
	"homtht": "∻",
	"hookleftarrow": "↩",
	"hookrightarrow": "↪",
	"hopf": "𝕙",
	"Hopf": "ℍ",
	"horbar": "―",
	"HorizontalLine": "─",
	"hscr": "𝒽",
	"Hscr": "ℋ",
	"hslash": "ℏ",
	"Hstrok": "Ħ",
	"hstrok": "ħ",
	"HumpDownHump": "≎",
	"HumpEqual": "≏",
	"hybull": "⁃",
	"hyphen": "‐",
	"Iacute": "Í",
	"iacute": "í",
	"ic": "⁣",
	"Icirc": "Î",
	"icirc": "î",
	"Icy": "И",
	"icy": "и",
	"Idot": "İ",
	"IEcy": "Е",
	"iecy": "е",
	"iexcl": "¡",
	"iff": "⇔",
	"ifr": "𝔦",
	"Ifr": "ℑ",
	"Igrave": "Ì",
	"igrave": "ì",
	"ii": "ⅈ",
	"iiiint": "⨌",
	"iiint": "∭",
	"iinfin": "⧜",
	"iiota": "℩",
	"IJlig": "Ĳ",
	"ijlig": "ĳ",
	"Imacr": "Ī",
	"imacr": "ī",
	"image": "ℑ",
	"ImaginaryI": "ⅈ",
	"imagline": "ℐ",
	"imagpart": "ℑ",
	"imath": "ı",
	"Im": "ℑ",
	"imof": "⊷",
	"imped": "Ƶ",
	"Implies": "⇒",
	"incare": "℅",
	"in": "∈",
	"infin": "∞",
	"infintie": "⧝",
	"inodot": "ı",
	"intcal": "⊺",
	"int": "∫",
	"Int": "∬",
	"integers": "ℤ",
	"Integral": "∫",
	"intercal": "⊺",
	"Intersection": "⋂",
	"intlarhk": "⨗",
	"intprod": "⨼",
	"InvisibleComma": "⁣",
	"InvisibleTimes": "⁢",
	"IOcy": "Ё",
	"iocy": "ё",
	"Iogon": "Į",
	"iogon": "į",
	"Iopf": "𝕀",
	"iopf": "𝕚",
	"Iota": "Ι",
	"iota": "ι",
	"iprod": "⨼",
	"iquest": "¿",
	"iscr": "𝒾",
	"Iscr": "ℐ",
	"isin": "∈",
	"isindot": "⋵",
	"isinE": "⋹",
	"isins": "⋴",
	"isinsv": "⋳",
	"isinv": "∈",
	"it": "⁢",
	"Itilde": "Ĩ",
	"itilde": "ĩ",
	"Iukcy": "І",
	"iukcy": "і",
	"Iuml": "Ï",
	"iuml": "ï",
	"Jcirc": "Ĵ",
	"jcirc": "ĵ",
	"Jcy": "Й",
	"jcy": "й",
	"Jfr": "𝔍",
	"jfr": "𝔧",
	"jmath": "ȷ",
	"Jopf": "𝕁",
	"jopf": "𝕛",
	"Jscr": "𝒥",
	"jscr": "𝒿",
	"Jsercy": "Ј",
	"jsercy": "ј",
	"Jukcy": "Є",
	"jukcy": "є",
	"Kappa": "Κ",
	"kappa": "κ",
	"kappav": "ϰ",
	"Kcedil": "Ķ",
	"kcedil": "ķ",
	"Kcy": "К",
	"kcy": "к",
	"Kfr": "𝔎",
	"kfr": "𝔨",
	"kgreen": "ĸ",
	"KHcy": "Х",
	"khcy": "х",
	"KJcy": "Ќ",
	"kjcy": "ќ",
	"Kopf": "𝕂",
	"kopf": "𝕜",
	"Kscr": "𝒦",
	"kscr": "𝓀",
	"lAarr": "⇚",
	"Lacute": "Ĺ",
	"lacute": "ĺ",
	"laemptyv": "⦴",
	"lagran": "ℒ",
	"Lambda": "Λ",
	"lambda": "λ",
	"lang": "⟨",
	"Lang": "⟪",
	"langd": "⦑",
	"langle": "⟨",
	"lap": "⪅",
	"Laplacetrf": "ℒ",
	"laquo": "«",
	"larrb": "⇤",
	"larrbfs": "⤟",
	"larr": "←",
	"Larr": "↞",
	"lArr": "⇐",
	"larrfs": "⤝",
	"larrhk": "↩",
	"larrlp": "↫",
	"larrpl": "⤹",
	"larrsim": "⥳",
	"larrtl": "↢",
	"latail": "⤙",
	"lAtail": "⤛",
	"lat": "⪫",
	"late": "⪭",
	"lates": "⪭︀",
	"lbarr": "⤌",
	"lBarr": "⤎",
	"lbbrk": "❲",
	"lbrace": "{",
	"lbrack": "[",
	"lbrke": "⦋",
	"lbrksld": "⦏",
	"lbrkslu": "⦍",
	"Lcaron": "Ľ",
	"lcaron": "ľ",
	"Lcedil": "Ļ",
	"lcedil": "ļ",
	"lceil": "⌈",
	"lcub": "{",
	"Lcy": "Л",
	"lcy": "л",
	"ldca": "⤶",
	"ldquo": "“",
	"ldquor": "„",
	"ldrdhar": "⥧",
	"ldrushar": "⥋",
	"ldsh": "↲",
	"le": "≤",
	"lE": "≦",
	"LeftAngleBracket": "⟨",
	"LeftArrowBar": "⇤",
	"leftarrow": "←",
	"LeftArrow": "←",
	"Leftarrow": "⇐",
	"LeftArrowRightArrow": "⇆",
	"leftarrowtail": "↢",
	"LeftCeiling": "⌈",
	"LeftDoubleBracket": "⟦",
	"LeftDownTeeVector": "⥡",
	"LeftDownVectorBar": "⥙",
	"LeftDownVector": "⇃",
	"LeftFloor": "⌊",
	"leftharpoondown": "↽",
	"leftharpoonup": "↼",
	"leftleftarrows": "⇇",
	"leftrightarrow": "↔",
	"LeftRightArrow": "↔",
	"Leftrightarrow": "⇔",
	"leftrightarrows": "⇆",
	"leftrightharpoons": "⇋",
	"leftrightsquigarrow": "↭",
	"LeftRightVector": "⥎",
	"LeftTeeArrow": "↤",
	"LeftTee": "⊣",
	"LeftTeeVector": "⥚",
	"leftthreetimes": "⋋",
	"LeftTriangleBar": "⧏",
	"LeftTriangle": "⊲",
	"LeftTriangleEqual": "⊴",
	"LeftUpDownVector": "⥑",
	"LeftUpTeeVector": "⥠",
	"LeftUpVectorBar": "⥘",
	"LeftUpVector": "↿",
	"LeftVectorBar": "⥒",
	"LeftVector": "↼",
	"lEg": "⪋",
	"leg": "⋚",
	"leq": "≤",
	"leqq": "≦",
	"leqslant": "⩽",
	"lescc": "⪨",
	"les": "⩽",
	"lesdot": "⩿",
	"lesdoto": "⪁",
	"lesdotor": "⪃",
	"lesg": "⋚︀",
	"lesges": "⪓",
	"lessapprox": "⪅",
	"lessdot": "⋖",
	"lesseqgtr": "⋚",
	"lesseqqgtr": "⪋",
	"LessEqualGreater": "⋚",
	"LessFullEqual": "≦",
	"LessGreater": "≶",
	"lessgtr": "≶",
	"LessLess": "⪡",
	"lesssim": "≲",
	"LessSlantEqual": "⩽",
	"LessTilde": "≲",
	"lfisht": "⥼",
	"lfloor": "⌊",
	"Lfr": "𝔏",
	"lfr": "𝔩",
	"lg": "≶",
	"lgE": "⪑",
	"lHar": "⥢",
	"lhard": "↽",
	"lharu": "↼",
	"lharul": "⥪",
	"lhblk": "▄",
	"LJcy": "Љ",
	"ljcy": "љ",
	"llarr": "⇇",
	"ll": "≪",
	"Ll": "⋘",
	"llcorner": "⌞",
	"Lleftarrow": "⇚",
	"llhard": "⥫",
	"lltri": "◺",
	"Lmidot": "Ŀ",
	"lmidot": "ŀ",
	"lmoustache": "⎰",
	"lmoust": "⎰",
	"lnap": "⪉",
	"lnapprox": "⪉",
	"lne": "⪇",
	"lnE": "≨",
	"lneq": "⪇",
	"lneqq": "≨",
	"lnsim": "⋦",
	"loang": "⟬",
	"loarr": "⇽",
	"lobrk": "⟦",
	"longleftarrow": "⟵",
	"LongLeftArrow": "⟵",
	"Longleftarrow": "⟸",
	"longleftrightarrow": "⟷",
	"LongLeftRightArrow": "⟷",
	"Longleftrightarrow": "⟺",
	"longmapsto": "⟼",
	"longrightarrow": "⟶",
	"LongRightArrow": "⟶",
	"Longrightarrow": "⟹",
	"looparrowleft": "↫",
	"looparrowright": "↬",
	"lopar": "⦅",
	"Lopf": "𝕃",
	"lopf": "𝕝",
	"loplus": "⨭",
	"lotimes": "⨴",
	"lowast": "∗",
	"lowbar": "_",
	"LowerLeftArrow": "↙",
	"LowerRightArrow": "↘",
	"loz": "◊",
	"lozenge": "◊",
	"lozf": "⧫",
	"lpar": "(",
	"lparlt": "⦓",
	"lrarr": "⇆",
	"lrcorner": "⌟",
	"lrhar": "⇋",
	"lrhard": "⥭",
	"lrm": "‎",
	"lrtri": "⊿",
	"lsaquo": "‹",
	"lscr": "𝓁",
	"Lscr": "ℒ",
	"lsh": "↰",
	"Lsh": "↰",
	"lsim": "≲",
	"lsime": "⪍",
	"lsimg": "⪏",
	"lsqb": "[",
	"lsquo": "‘",
	"lsquor": "‚",
	"Lstrok": "Ł",
	"lstrok": "ł",
	"ltcc": "⪦",
	"ltcir": "⩹",
	"lt": "<",
	"LT": "<",
	"Lt": "≪",
	"ltdot": "⋖",
	"lthree": "⋋",
	"ltimes": "⋉",
	"ltlarr": "⥶",
	"ltquest": "⩻",
	"ltri": "◃",
	"ltrie": "⊴",
	"ltrif": "◂",
	"ltrPar": "⦖",
	"lurdshar": "⥊",
	"luruhar": "⥦",
	"lvertneqq": "≨︀",
	"lvnE": "≨︀",
	"macr": "¯",
	"male": "♂",
	"malt": "✠",
	"maltese": "✠",
	"Map": "⤅",
	"map": "↦",
	"mapsto": "↦",
	"mapstodown": "↧",
	"mapstoleft": "↤",
	"mapstoup": "↥",
	"marker": "▮",
	"mcomma": "⨩",
	"Mcy": "М",
	"mcy": "м",
	"mdash": "—",
	"mDDot": "∺",
	"measuredangle": "∡",
	"MediumSpace": " ",
	"Mellintrf": "ℳ",
	"Mfr": "𝔐",
	"mfr": "𝔪",
	"mho": "℧",
	"micro": "µ",
	"midast": "*",
	"midcir": "⫰",
	"mid": "∣",
	"middot": "·",
	"minusb": "⊟",
	"minus": "−",
	"minusd": "∸",
	"minusdu": "⨪",
	"MinusPlus": "∓",
	"mlcp": "⫛",
	"mldr": "…",
	"mnplus": "∓",
	"models": "⊧",
	"Mopf": "𝕄",
	"mopf": "𝕞",
	"mp": "∓",
	"mscr": "𝓂",
	"Mscr": "ℳ",
	"mstpos": "∾",
	"Mu": "Μ",
	"mu": "μ",
	"multimap": "⊸",
	"mumap": "⊸",
	"nabla": "∇",
	"Nacute": "Ń",
	"nacute": "ń",
	"nang": "∠⃒",
	"nap": "≉",
	"napE": "⩰̸",
	"napid": "≋̸",
	"napos": "ŉ",
	"napprox": "≉",
	"natural": "♮",
	"naturals": "ℕ",
	"natur": "♮",
	"nbsp": " ",
	"nbump": "≎̸",
	"nbumpe": "≏̸",
	"ncap": "⩃",
	"Ncaron": "Ň",
	"ncaron": "ň",
	"Ncedil": "Ņ",
	"ncedil": "ņ",
	"ncong": "≇",
	"ncongdot": "⩭̸",
	"ncup": "⩂",
	"Ncy": "Н",
	"ncy": "н",
	"ndash": "–",
	"nearhk": "⤤",
	"nearr": "↗",
	"neArr": "⇗",
	"nearrow": "↗",
	"ne": "≠",
	"nedot": "≐̸",
	"NegativeMediumSpace": "​",
	"NegativeThickSpace": "​",
	"NegativeThinSpace": "​",
	"NegativeVeryThinSpace": "​",
	"nequiv": "≢",
	"nesear": "⤨",
	"nesim": "≂̸",
	"NestedGreaterGreater": "≫",
	"NestedLessLess": "≪",
	"NewLine": "\n",
	"nexist": "∄",
	"nexists": "∄",
	"Nfr": "𝔑",
	"nfr": "𝔫",
	"ngE": "≧̸",
	"nge": "≱",
	"ngeq": "≱",
	"ngeqq": "≧̸",
	"ngeqslant": "⩾̸",
	"nges": "⩾̸",
	"nGg": "⋙̸",
	"ngsim": "≵",
	"nGt": "≫⃒",
	"ngt": "≯",
	"ngtr": "≯",
	"nGtv": "≫̸",
	"nharr": "↮",
	"nhArr": "⇎",
	"nhpar": "⫲",
	"ni": "∋",
	"nis": "⋼",
	"nisd": "⋺",
	"niv": "∋",
	"NJcy": "Њ",
	"njcy": "њ",
	"nlarr": "↚",
	"nlArr": "⇍",
	"nldr": "‥",
	"nlE": "≦̸",
	"nle": "≰",
	"nleftarrow": "↚",
	"nLeftarrow": "⇍",
	"nleftrightarrow": "↮",
	"nLeftrightarrow": "⇎",
	"nleq": "≰",
	"nleqq": "≦̸",
	"nleqslant": "⩽̸",
	"nles": "⩽̸",
	"nless": "≮",
	"nLl": "⋘̸",
	"nlsim": "≴",
	"nLt": "≪⃒",
	"nlt": "≮",
	"nltri": "⋪",
	"nltrie": "⋬",
	"nLtv": "≪̸",
	"nmid": "∤",
	"NoBreak": "⁠",
	"NonBreakingSpace": " ",
	"nopf": "𝕟",
	"Nopf": "ℕ",
	"Not": "⫬",
	"not": "¬",
	"NotCongruent": "≢",
	"NotCupCap": "≭",
	"NotDoubleVerticalBar": "∦",
	"NotElement": "∉",
	"NotEqual": "≠",
	"NotEqualTilde": "≂̸",
	"NotExists": "∄",
	"NotGreater": "≯",
	"NotGreaterEqual": "≱",
	"NotGreaterFullEqual": "≧̸",
	"NotGreaterGreater": "≫̸",
	"NotGreaterLess": "≹",
	"NotGreaterSlantEqual": "⩾̸",
	"NotGreaterTilde": "≵",
	"NotHumpDownHump": "≎̸",
	"NotHumpEqual": "≏̸",
	"notin": "∉",
	"notindot": "⋵̸",
	"notinE": "⋹̸",
	"notinva": "∉",
	"notinvb": "⋷",
	"notinvc": "⋶",
	"NotLeftTriangleBar": "⧏̸",
	"NotLeftTriangle": "⋪",
	"NotLeftTriangleEqual": "⋬",
	"NotLess": "≮",
	"NotLessEqual": "≰",
	"NotLessGreater": "≸",
	"NotLessLess": "≪̸",
	"NotLessSlantEqual": "⩽̸",
	"NotLessTilde": "≴",
	"NotNestedGreaterGreater": "⪢̸",
	"NotNestedLessLess": "⪡̸",
	"notni": "∌",
	"notniva": "∌",
	"notnivb": "⋾",
	"notnivc": "⋽",
	"NotPrecedes": "⊀",
	"NotPrecedesEqual": "⪯̸",
	"NotPrecedesSlantEqual": "⋠",
	"NotReverseElement": "∌",
	"NotRightTriangleBar": "⧐̸",
	"NotRightTriangle": "⋫",
	"NotRightTriangleEqual": "⋭",
	"NotSquareSubset": "⊏̸",
	"NotSquareSubsetEqual": "⋢",
	"NotSquareSuperset": "⊐̸",
	"NotSquareSupersetEqual": "⋣",
	"NotSubset": "⊂⃒",
	"NotSubsetEqual": "⊈",
	"NotSucceeds": "⊁",
	"NotSucceedsEqual": "⪰̸",
	"NotSucceedsSlantEqual": "⋡",
	"NotSucceedsTilde": "≿̸",
	"NotSuperset": "⊃⃒",
	"NotSupersetEqual": "⊉",
	"NotTilde": "≁",
	"NotTildeEqual": "≄",
	"NotTildeFullEqual": "≇",
	"NotTildeTilde": "≉",
	"NotVerticalBar": "∤",
	"nparallel": "∦",
	"npar": "∦",
	"nparsl": "⫽⃥",
	"npart": "∂̸",
	"npolint": "⨔",
	"npr": "⊀",
	"nprcue": "⋠",
	"nprec": "⊀",
	"npreceq": "⪯̸",
	"npre": "⪯̸",
	"nrarrc": "⤳̸",
	"nrarr": "↛",
	"nrArr": "⇏",
	"nrarrw": "↝̸",
	"nrightarrow": "↛",
	"nRightarrow": "⇏",
	"nrtri": "⋫",
	"nrtrie": "⋭",
	"nsc": "⊁",
	"nsccue": "⋡",
	"nsce": "⪰̸",
	"Nscr": "𝒩",
	"nscr": "𝓃",
	"nshortmid": "∤",
	"nshortparallel": "∦",
	"nsim": "≁",
	"nsime": "≄",
	"nsimeq": "≄",
	"nsmid": "∤",
	"nspar": "∦",
	"nsqsube": "⋢",
	"nsqsupe": "⋣",
	"nsub": "⊄",
	"nsubE": "⫅̸",
	"nsube": "⊈",
	"nsubset": "⊂⃒",
	"nsubseteq": "⊈",
	"nsubseteqq": "⫅̸",
	"nsucc": "⊁",
	"nsucceq": "⪰̸",
	"nsup": "⊅",
	"nsupE": "⫆̸",
	"nsupe": "⊉",
	"nsupset": "⊃⃒",
	"nsupseteq": "⊉",
	"nsupseteqq": "⫆̸",
	"ntgl": "≹",
	"Ntilde": "Ñ",
	"ntilde": "ñ",
	"ntlg": "≸",
	"ntriangleleft": "⋪",
	"ntrianglelefteq": "⋬",
	"ntriangleright": "⋫",
	"ntrianglerighteq": "⋭",
	"Nu": "Ν",
	"nu": "ν",
	"num": "#",
	"numero": "№",
	"numsp": " ",
	"nvap": "≍⃒",
	"nvdash": "⊬",
	"nvDash": "⊭",
	"nVdash": "⊮",
	"nVDash": "⊯",
	"nvge": "≥⃒",
	"nvgt": ">⃒",
	"nvHarr": "⤄",
	"nvinfin": "⧞",
	"nvlArr": "⤂",
	"nvle": "≤⃒",
	"nvlt": "<⃒",
	"nvltrie": "⊴⃒",
	"nvrArr": "⤃",
	"nvrtrie": "⊵⃒",
	"nvsim": "∼⃒",
	"nwarhk": "⤣",
	"nwarr": "↖",
	"nwArr": "⇖",
	"nwarrow": "↖",
	"nwnear": "⤧",
	"Oacute": "Ó",
	"oacute": "ó",
	"oast": "⊛",
	"Ocirc": "Ô",
	"ocirc": "ô",
	"ocir": "⊚",
	"Ocy": "О",
	"ocy": "о",
	"odash": "⊝",
	"Odblac": "Ő",
	"odblac": "ő",
	"odiv": "⨸",
	"odot": "⊙",
	"odsold": "⦼",
	"OElig": "Œ",
	"oelig": "œ",
	"ofcir": "⦿",
	"Ofr": "𝔒",
	"ofr": "𝔬",
	"ogon": "˛",
	"Ograve": "Ò",
	"ograve": "ò",
	"ogt": "⧁",
	"ohbar": "⦵",
	"ohm": "Ω",
	"oint": "∮",
	"olarr": "↺",
	"olcir": "⦾",
	"olcross": "⦻",
	"oline": "‾",
	"olt": "⧀",
	"Omacr": "Ō",
	"omacr": "ō",
	"Omega": "Ω",
	"omega": "ω",
	"Omicron": "Ο",
	"omicron": "ο",
	"omid": "⦶",
	"ominus": "⊖",
	"Oopf": "𝕆",
	"oopf": "𝕠",
	"opar": "⦷",
	"OpenCurlyDoubleQuote": "“",
	"OpenCurlyQuote": "‘",
	"operp": "⦹",
	"oplus": "⊕",
	"orarr": "↻",
	"Or": "⩔",
	"or": "∨",
	"ord": "⩝",
	"order": "ℴ",
	"orderof": "ℴ",
	"ordf": "ª",
	"ordm": "º",
	"origof": "⊶",
	"oror": "⩖",
	"orslope": "⩗",
	"orv": "⩛",
	"oS": "Ⓢ",
	"Oscr": "𝒪",
	"oscr": "ℴ",
	"Oslash": "Ø",
	"oslash": "ø",
	"osol": "⊘",
	"Otilde": "Õ",
	"otilde": "õ",
	"otimesas": "⨶",
	"Otimes": "⨷",
	"otimes": "⊗",
	"Ouml": "Ö",
	"ouml": "ö",
	"ovbar": "⌽",
	"OverBar": "‾",
	"OverBrace": "⏞",
	"OverBracket": "⎴",
	"OverParenthesis": "⏜",
	"para": "¶",
	"parallel": "∥",
	"par": "∥",
	"parsim": "⫳",
	"parsl": "⫽",
	"part": "∂",
	"PartialD": "∂",
	"Pcy": "П",
	"pcy": "п",
	"percnt": "%",
	"period": ".",
	"permil": "‰",
	"perp": "⊥",
	"pertenk": "‱",
	"Pfr": "𝔓",
	"pfr": "𝔭",
	"Phi": "Φ",
	"phi": "φ",
	"phiv": "ϕ",
	"phmmat": "ℳ",
	"phone": "☎",
	"Pi": "Π",
	"pi": "π",
	"pitchfork": "⋔",
	"piv": "ϖ",
	"planck": "ℏ",
	"planckh": "ℎ",
	"plankv": "ℏ",
	"plusacir": "⨣",
	"plusb": "⊞",
	"pluscir": "⨢",
	"plus": "+",
	"plusdo": "∔",
	"plusdu": "⨥",
	"pluse": "⩲",
	"PlusMinus": "±",
	"plusmn": "±",
	"plussim": "⨦",
	"plustwo": "⨧",
	"pm": "±",
	"Poincareplane": "ℌ",
	"pointint": "⨕",
	"popf": "𝕡",
	"Popf": "ℙ",
	"pound": "£",
	"prap": "⪷",
	"Pr": "⪻",
	"pr": "≺",
	"prcue": "≼",
	"precapprox": "⪷",
	"prec": "≺",
	"preccurlyeq": "≼",
	"Precedes": "≺",
	"PrecedesEqual": "⪯",
	"PrecedesSlantEqual": "≼",
	"PrecedesTilde": "≾",
	"preceq": "⪯",
	"precnapprox": "⪹",
	"precneqq": "⪵",
	"precnsim": "⋨",
	"pre": "⪯",
	"prE": "⪳",
	"precsim": "≾",
	"prime": "′",
	"Prime": "″",
	"primes": "ℙ",
	"prnap": "⪹",
	"prnE": "⪵",
	"prnsim": "⋨",
	"prod": "∏",
	"Product": "∏",
	"profalar": "⌮",
	"profline": "⌒",
	"profsurf": "⌓",
	"prop": "∝",
	"Proportional": "∝",
	"Proportion": "∷",
	"propto": "∝",
	"prsim": "≾",
	"prurel": "⊰",
	"Pscr": "𝒫",
	"pscr": "𝓅",
	"Psi": "Ψ",
	"psi": "ψ",
	"puncsp": " ",
	"Qfr": "𝔔",
	"qfr": "𝔮",
	"qint": "⨌",
	"qopf": "𝕢",
	"Qopf": "ℚ",
	"qprime": "⁗",
	"Qscr": "𝒬",
	"qscr": "𝓆",
	"quaternions": "ℍ",
	"quatint": "⨖",
	"quest": "?",
	"questeq": "≟",
	"quot": "\"",
	"QUOT": "\"",
	"rAarr": "⇛",
	"race": "∽̱",
	"Racute": "Ŕ",
	"racute": "ŕ",
	"radic": "√",
	"raemptyv": "⦳",
	"rang": "⟩",
	"Rang": "⟫",
	"rangd": "⦒",
	"range": "⦥",
	"rangle": "⟩",
	"raquo": "»",
	"rarrap": "⥵",
	"rarrb": "⇥",
	"rarrbfs": "⤠",
	"rarrc": "⤳",
	"rarr": "→",
	"Rarr": "↠",
	"rArr": "⇒",
	"rarrfs": "⤞",
	"rarrhk": "↪",
	"rarrlp": "↬",
	"rarrpl": "⥅",
	"rarrsim": "⥴",
	"Rarrtl": "⤖",
	"rarrtl": "↣",
	"rarrw": "↝",
	"ratail": "⤚",
	"rAtail": "⤜",
	"ratio": "∶",
	"rationals": "ℚ",
	"rbarr": "⤍",
	"rBarr": "⤏",
	"RBarr": "⤐",
	"rbbrk": "❳",
	"rbrace": "}",
	"rbrack": "]",
	"rbrke": "⦌",
	"rbrksld": "⦎",
	"rbrkslu": "⦐",
	"Rcaron": "Ř",
	"rcaron": "ř",
	"Rcedil": "Ŗ",
	"rcedil": "ŗ",
	"rceil": "⌉",
	"rcub": "}",
	"Rcy": "Р",
	"rcy": "р",
	"rdca": "⤷",
	"rdldhar": "⥩",
	"rdquo": "”",
	"rdquor": "”",
	"rdsh": "↳",
	"real": "ℜ",
	"realine": "ℛ",
	"realpart": "ℜ",
	"reals": "ℝ",
	"Re": "ℜ",
	"rect": "▭",
	"reg": "®",
	"REG": "®",
	"ReverseElement": "∋",
	"ReverseEquilibrium": "⇋",
	"ReverseUpEquilibrium": "⥯",
	"rfisht": "⥽",
	"rfloor": "⌋",
	"rfr": "𝔯",
	"Rfr": "ℜ",
	"rHar": "⥤",
	"rhard": "⇁",
	"rharu": "⇀",
	"rharul": "⥬",
	"Rho": "Ρ",
	"rho": "ρ",
	"rhov": "ϱ",
	"RightAngleBracket": "⟩",
	"RightArrowBar": "⇥",
	"rightarrow": "→",
	"RightArrow": "→",
	"Rightarrow": "⇒",
	"RightArrowLeftArrow": "⇄",
	"rightarrowtail": "↣",
	"RightCeiling": "⌉",
	"RightDoubleBracket": "⟧",
	"RightDownTeeVector": "⥝",
	"RightDownVectorBar": "⥕",
	"RightDownVector": "⇂",
	"RightFloor": "⌋",
	"rightharpoondown": "⇁",
	"rightharpoonup": "⇀",
	"rightleftarrows": "⇄",
	"rightleftharpoons": "⇌",
	"rightrightarrows": "⇉",
	"rightsquigarrow": "↝",
	"RightTeeArrow": "↦",
	"RightTee": "⊢",
	"RightTeeVector": "⥛",
	"rightthreetimes": "⋌",
	"RightTriangleBar": "⧐",
	"RightTriangle": "⊳",
	"RightTriangleEqual": "⊵",
	"RightUpDownVector": "⥏",
	"RightUpTeeVector": "⥜",
	"RightUpVectorBar": "⥔",
	"RightUpVector": "↾",
	"RightVectorBar": "⥓",
	"RightVector": "⇀",
	"ring": "˚",
	"risingdotseq": "≓",
	"rlarr": "⇄",
	"rlhar": "⇌",
	"rlm": "‏",
	"rmoustache": "⎱",
	"rmoust": "⎱",
	"rnmid": "⫮",
	"roang": "⟭",
	"roarr": "⇾",
	"robrk": "⟧",
	"ropar": "⦆",
	"ropf": "𝕣",
	"Ropf": "ℝ",
	"roplus": "⨮",
	"rotimes": "⨵",
	"RoundImplies": "⥰",
	"rpar": ")",
	"rpargt": "⦔",
	"rppolint": "⨒",
	"rrarr": "⇉",
	"Rrightarrow": "⇛",
	"rsaquo": "›",
	"rscr": "𝓇",
	"Rscr": "ℛ",
	"rsh": "↱",
	"Rsh": "↱",
	"rsqb": "]",
	"rsquo": "’",
	"rsquor": "’",
	"rthree": "⋌",
	"rtimes": "⋊",
	"rtri": "▹",
	"rtrie": "⊵",
	"rtrif": "▸",
	"rtriltri": "⧎",
	"RuleDelayed": "⧴",
	"ruluhar": "⥨",
	"rx": "℞",
	"Sacute": "Ś",
	"sacute": "ś",
	"sbquo": "‚",
	"scap": "⪸",
	"Scaron": "Š",
	"scaron": "š",
	"Sc": "⪼",
	"sc": "≻",
	"sccue": "≽",
	"sce": "⪰",
	"scE": "⪴",
	"Scedil": "Ş",
	"scedil": "ş",
	"Scirc": "Ŝ",
	"scirc": "ŝ",
	"scnap": "⪺",
	"scnE": "⪶",
	"scnsim": "⋩",
	"scpolint": "⨓",
	"scsim": "≿",
	"Scy": "С",
	"scy": "с",
	"sdotb": "⊡",
	"sdot": "⋅",
	"sdote": "⩦",
	"searhk": "⤥",
	"searr": "↘",
	"seArr": "⇘",
	"searrow": "↘",
	"sect": "§",
	"semi": ";",
	"seswar": "⤩",
	"setminus": "∖",
	"setmn": "∖",
	"sext": "✶",
	"Sfr": "𝔖",
	"sfr": "𝔰",
	"sfrown": "⌢",
	"sharp": "♯",
	"SHCHcy": "Щ",
	"shchcy": "щ",
	"SHcy": "Ш",
	"shcy": "ш",
	"ShortDownArrow": "↓",
	"ShortLeftArrow": "←",
	"shortmid": "∣",
	"shortparallel": "∥",
	"ShortRightArrow": "→",
	"ShortUpArrow": "↑",
	"shy": "­",
	"Sigma": "Σ",
	"sigma": "σ",
	"sigmaf": "ς",
	"sigmav": "ς",
	"sim": "∼",
	"simdot": "⩪",
	"sime": "≃",
	"simeq": "≃",
	"simg": "⪞",
	"simgE": "⪠",
	"siml": "⪝",
	"simlE": "⪟",
	"simne": "≆",
	"simplus": "⨤",
	"simrarr": "⥲",
	"slarr": "←",
	"SmallCircle": "∘",
	"smallsetminus": "∖",
	"smashp": "⨳",
	"smeparsl": "⧤",
	"smid": "∣",
	"smile": "⌣",
	"smt": "⪪",
	"smte": "⪬",
	"smtes": "⪬︀",
	"SOFTcy": "Ь",
	"softcy": "ь",
	"solbar": "⌿",
	"solb": "⧄",
	"sol": "/",
	"Sopf": "𝕊",
	"sopf": "𝕤",
	"spades": "♠",
	"spadesuit": "♠",
	"spar": "∥",
	"sqcap": "⊓",
	"sqcaps": "⊓︀",
	"sqcup": "⊔",
	"sqcups": "⊔︀",
	"Sqrt": "√",
	"sqsub": "⊏",
	"sqsube": "⊑",
	"sqsubset": "⊏",
	"sqsubseteq": "⊑",
	"sqsup": "⊐",
	"sqsupe": "⊒",
	"sqsupset": "⊐",
	"sqsupseteq": "⊒",
	"square": "□",
	"Square": "□",
	"SquareIntersection": "⊓",
	"SquareSubset": "⊏",
	"SquareSubsetEqual": "⊑",
	"SquareSuperset": "⊐",
	"SquareSupersetEqual": "⊒",
	"SquareUnion": "⊔",
	"squarf": "▪",
	"squ": "□",
	"squf": "▪",
	"srarr": "→",
	"Sscr": "𝒮",
	"sscr": "𝓈",
	"ssetmn": "∖",
	"ssmile": "⌣",
	"sstarf": "⋆",
	"Star": "⋆",
	"star": "☆",
	"starf": "★",
	"straightepsilon": "ϵ",
	"straightphi": "ϕ",
	"strns": "¯",
	"sub": "⊂",
	"Sub": "⋐",
	"subdot": "⪽",
	"subE": "⫅",
	"sube": "⊆",
	"subedot": "⫃",
	"submult": "⫁",
	"subnE": "⫋",
	"subne": "⊊",
	"subplus": "⪿",
	"subrarr": "⥹",
	"subset": "⊂",
	"Subset": "⋐",
	"subseteq": "⊆",
	"subseteqq": "⫅",
	"SubsetEqual": "⊆",
	"subsetneq": "⊊",
	"subsetneqq": "⫋",
	"subsim": "⫇",
	"subsub": "⫕",
	"subsup": "⫓",
	"succapprox": "⪸",
	"succ": "≻",
	"succcurlyeq": "≽",
	"Succeeds": "≻",
	"SucceedsEqual": "⪰",
	"SucceedsSlantEqual": "≽",
	"SucceedsTilde": "≿",
	"succeq": "⪰",
	"succnapprox": "⪺",
	"succneqq": "⪶",
	"succnsim": "⋩",
	"succsim": "≿",
	"SuchThat": "∋",
	"sum": "∑",
	"Sum": "∑",
	"sung": "♪",
	"sup1": "¹",
	"sup2": "²",
	"sup3": "³",
	"sup": "⊃",
	"Sup": "⋑",
	"supdot": "⪾",
	"supdsub": "⫘",
	"supE": "⫆",
	"supe": "⊇",
	"supedot": "⫄",
	"Superset": "⊃",
	"SupersetEqual": "⊇",
	"suphsol": "⟉",
	"suphsub": "⫗",
	"suplarr": "⥻",
	"supmult": "⫂",
	"supnE": "⫌",
	"supne": "⊋",
	"supplus": "⫀",
	"supset": "⊃",
	"Supset": "⋑",
	"supseteq": "⊇",
	"supseteqq": "⫆",
	"supsetneq": "⊋",
	"supsetneqq": "⫌",
	"supsim": "⫈",
	"supsub": "⫔",
	"supsup": "⫖",
	"swarhk": "⤦",
	"swarr": "↙",
	"swArr": "⇙",
	"swarrow": "↙",
	"swnwar": "⤪",
	"szlig": "ß",
	"Tab": "\t",
	"target": "⌖",
	"Tau": "Τ",
	"tau": "τ",
	"tbrk": "⎴",
	"Tcaron": "Ť",
	"tcaron": "ť",
	"Tcedil": "Ţ",
	"tcedil": "ţ",
	"Tcy": "Т",
	"tcy": "т",
	"tdot": "⃛",
	"telrec": "⌕",
	"Tfr": "𝔗",
	"tfr": "𝔱",
	"there4": "∴",
	"therefore": "∴",
	"Therefore": "∴",
	"Theta": "Θ",
	"theta": "θ",
	"thetasym": "ϑ",
	"thetav": "ϑ",
	"thickapprox": "≈",
	"thicksim": "∼",
	"ThickSpace": "  ",
	"ThinSpace": " ",
	"thinsp": " ",
	"thkap": "≈",
	"thksim": "∼",
	"THORN": "Þ",
	"thorn": "þ",
	"tilde": "˜",
	"Tilde": "∼",
	"TildeEqual": "≃",
	"TildeFullEqual": "≅",
	"TildeTilde": "≈",
	"timesbar": "⨱",
	"timesb": "⊠",
	"times": "×",
	"timesd": "⨰",
	"tint": "∭",
	"toea": "⤨",
	"topbot": "⌶",
	"topcir": "⫱",
	"top": "⊤",
	"Topf": "𝕋",
	"topf": "𝕥",
	"topfork": "⫚",
	"tosa": "⤩",
	"tprime": "‴",
	"trade": "™",
	"TRADE": "™",
	"triangle": "▵",
	"triangledown": "▿",
	"triangleleft": "◃",
	"trianglelefteq": "⊴",
	"triangleq": "≜",
	"triangleright": "▹",
	"trianglerighteq": "⊵",
	"tridot": "◬",
	"trie": "≜",
	"triminus": "⨺",
	"TripleDot": "⃛",
	"triplus": "⨹",
	"trisb": "⧍",
	"tritime": "⨻",
	"trpezium": "⏢",
	"Tscr": "𝒯",
	"tscr": "𝓉",
	"TScy": "Ц",
	"tscy": "ц",
	"TSHcy": "Ћ",
	"tshcy": "ћ",
	"Tstrok": "Ŧ",
	"tstrok": "ŧ",
	"twixt": "≬",
	"twoheadleftarrow": "↞",
	"twoheadrightarrow": "↠",
	"Uacute": "Ú",
	"uacute": "ú",
	"uarr": "↑",
	"Uarr": "↟",
	"uArr": "⇑",
	"Uarrocir": "⥉",
	"Ubrcy": "Ў",
	"ubrcy": "ў",
	"Ubreve": "Ŭ",
	"ubreve": "ŭ",
	"Ucirc": "Û",
	"ucirc": "û",
	"Ucy": "У",
	"ucy": "у",
	"udarr": "⇅",
	"Udblac": "Ű",
	"udblac": "ű",
	"udhar": "⥮",
	"ufisht": "⥾",
	"Ufr": "𝔘",
	"ufr": "𝔲",
	"Ugrave": "Ù",
	"ugrave": "ù",
	"uHar": "⥣",
	"uharl": "↿",
	"uharr": "↾",
	"uhblk": "▀",
	"ulcorn": "⌜",
	"ulcorner": "⌜",
	"ulcrop": "⌏",
	"ultri": "◸",
	"Umacr": "Ū",
	"umacr": "ū",
	"uml": "¨",
	"UnderBar": "_",
	"UnderBrace": "⏟",
	"UnderBracket": "⎵",
	"UnderParenthesis": "⏝",
	"Union": "⋃",
	"UnionPlus": "⊎",
	"Uogon": "Ų",
	"uogon": "ų",
	"Uopf": "𝕌",
	"uopf": "𝕦",
	"UpArrowBar": "⤒",
	"uparrow": "↑",
	"UpArrow": "↑",
	"Uparrow": "⇑",
	"UpArrowDownArrow": "⇅",
	"updownarrow": "↕",
	"UpDownArrow": "↕",
	"Updownarrow": "⇕",
	"UpEquilibrium": "⥮",
	"upharpoonleft": "↿",
	"upharpoonright": "↾",
	"uplus": "⊎",
	"UpperLeftArrow": "↖",
	"UpperRightArrow": "↗",
	"upsi": "υ",
	"Upsi": "ϒ",
	"upsih": "ϒ",
	"Upsilon": "Υ",
	"upsilon": "υ",
	"UpTeeArrow": "↥",
	"UpTee": "⊥",
	"upuparrows": "⇈",
	"urcorn": "⌝",
	"urcorner": "⌝",
	"urcrop": "⌎",
	"Uring": "Ů",
	"uring": "ů",
	"urtri": "◹",
	"Uscr": "𝒰",
	"uscr": "𝓊",
	"utdot": "⋰",
	"Utilde": "Ũ",
	"utilde": "ũ",
	"utri": "▵",
	"utrif": "▴",
	"uuarr": "⇈",
	"Uuml": "Ü",
	"uuml": "ü",
	"uwangle": "⦧",
	"vangrt": "⦜",
	"varepsilon": "ϵ",
	"varkappa": "ϰ",
	"varnothing": "∅",
	"varphi": "ϕ",
	"varpi": "ϖ",
	"varpropto": "∝",
	"varr": "↕",
	"vArr": "⇕",
	"varrho": "ϱ",
	"varsigma": "ς",
	"varsubsetneq": "⊊︀",
	"varsubsetneqq": "⫋︀",
	"varsupsetneq": "⊋︀",
	"varsupsetneqq": "⫌︀",
	"vartheta": "ϑ",
	"vartriangleleft": "⊲",
	"vartriangleright": "⊳",
	"vBar": "⫨",
	"Vbar": "⫫",
	"vBarv": "⫩",
	"Vcy": "В",
	"vcy": "в",
	"vdash": "⊢",
	"vDash": "⊨",
	"Vdash": "⊩",
	"VDash": "⊫",
	"Vdashl": "⫦",
	"veebar": "⊻",
	"vee": "∨",
	"Vee": "⋁",
	"veeeq": "≚",
	"vellip": "⋮",
	"verbar": "|",
	"Verbar": "‖",
	"vert": "|",
	"Vert": "‖",
	"VerticalBar": "∣",
	"VerticalLine": "|",
	"VerticalSeparator": "❘",
	"VerticalTilde": "≀",
	"VeryThinSpace": " ",
	"Vfr": "𝔙",
	"vfr": "𝔳",
	"vltri": "⊲",
	"vnsub": "⊂⃒",
	"vnsup": "⊃⃒",
	"Vopf": "𝕍",
	"vopf": "𝕧",
	"vprop": "∝",
	"vrtri": "⊳",
	"Vscr": "𝒱",
	"vscr": "𝓋",
	"vsubnE": "⫋︀",
	"vsubne": "⊊︀",
	"vsupnE": "⫌︀",
	"vsupne": "⊋︀",
	"Vvdash": "⊪",
	"vzigzag": "⦚",
	"Wcirc": "Ŵ",
	"wcirc": "ŵ",
	"wedbar": "⩟",
	"wedge": "∧",
	"Wedge": "⋀",
	"wedgeq": "≙",
	"weierp": "℘",
	"Wfr": "𝔚",
	"wfr": "𝔴",
	"Wopf": "𝕎",
	"wopf": "𝕨",
	"wp": "℘",
	"wr": "≀",
	"wreath": "≀",
	"Wscr": "𝒲",
	"wscr": "𝓌",
	"xcap": "⋂",
	"xcirc": "◯",
	"xcup": "⋃",
	"xdtri": "▽",
	"Xfr": "𝔛",
	"xfr": "𝔵",
	"xharr": "⟷",
	"xhArr": "⟺",
	"Xi": "Ξ",
	"xi": "ξ",
	"xlarr": "⟵",
	"xlArr": "⟸",
	"xmap": "⟼",
	"xnis": "⋻",
	"xodot": "⨀",
	"Xopf": "𝕏",
	"xopf": "𝕩",
	"xoplus": "⨁",
	"xotime": "⨂",
	"xrarr": "⟶",
	"xrArr": "⟹",
	"Xscr": "𝒳",
	"xscr": "𝓍",
	"xsqcup": "⨆",
	"xuplus": "⨄",
	"xutri": "△",
	"xvee": "⋁",
	"xwedge": "⋀",
	"Yacute": "Ý",
	"yacute": "ý",
	"YAcy": "Я",
	"yacy": "я",
	"Ycirc": "Ŷ",
	"ycirc": "ŷ",
	"Ycy": "Ы",
	"ycy": "ы",
	"yen": "¥",
	"Yfr": "𝔜",
	"yfr": "𝔶",
	"YIcy": "Ї",
	"yicy": "ї",
	"Yopf": "𝕐",
	"yopf": "𝕪",
	"Yscr": "𝒴",
	"yscr": "𝓎",
	"YUcy": "Ю",
	"yucy": "ю",
	"yuml": "ÿ",
	"Yuml": "Ÿ",
	"Zacute": "Ź",
	"zacute": "ź",
	"Zcaron": "Ž",
	"zcaron": "ž",
	"Zcy": "З",
	"zcy": "з",
	"Zdot": "Ż",
	"zdot": "ż",
	"zeetrf": "ℨ",
	"ZeroWidthSpace": "​",
	"Zeta": "Ζ",
	"zeta": "ζ",
	"zfr": "𝔷",
	"Zfr": "ℨ",
	"ZHcy": "Ж",
	"zhcy": "ж",
	"zigrarr": "⇝",
	"zopf": "𝕫",
	"Zopf": "ℤ",
	"Zscr": "𝒵",
	"zscr": "𝓏",
	"zwj": "‍",
	"zwnj": "‌"
};

/***/ }),

/***/ 554:
/***/ (function(module, exports) {

module.exports = {
	"amp": "&",
	"apos": "'",
	"gt": ">",
	"lt": "<",
	"quot": "\""
};

/***/ }),

/***/ 556:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var React = __webpack_require__(12);
var assign = __webpack_require__(569);
var isPlainObject = __webpack_require__(570);
var xssFilters = __webpack_require__(576);
var pascalCase = __webpack_require__(573);

var typeAliases = {
    blockquote: 'block_quote',
    thematicbreak: 'thematic_break',
    htmlblock: 'html_block',
    htmlinline: 'html_inline',
    codeblock: 'code_block',
    hardbreak: 'linebreak'
};

var defaultRenderers = {
    block_quote: 'blockquote', // eslint-disable-line camelcase
    emph: 'em',
    linebreak: 'br',
    image: 'img',
    item: 'li',
    link: 'a',
    paragraph: 'p',
    strong: 'strong',
    thematic_break: 'hr', // eslint-disable-line camelcase

    html_block: HtmlRenderer, // eslint-disable-line camelcase
    html_inline: HtmlRenderer, // eslint-disable-line camelcase

    list: function List(props) {
        var tag = props.type.toLowerCase() === 'bullet' ? 'ul' : 'ol';
        var attrs = getCoreProps(props);

        if (props.start !== null && props.start !== 1) {
            attrs.start = props.start.toString();
        }

        return createElement(tag, attrs, props.children);
    },
    code_block: function CodeBlock(props) { // eslint-disable-line camelcase
        var className = props.language && 'language-' + props.language;
        var code = createElement('code', { className: className }, props.literal);
        return createElement('pre', getCoreProps(props), code);
    },
    code: function Code(props) {
        return createElement('code', getCoreProps(props), props.children);
    },
    heading: function Heading(props) {
        return createElement('h' + props.level, getCoreProps(props), props.children);
    },

    text: null,
    softbreak: null
};

var coreTypes = Object.keys(defaultRenderers);

function getCoreProps(props) {
    return {
        'key': props.nodeKey,
        'className': props.className,
        'data-sourcepos': props['data-sourcepos']
    };
}

function normalizeTypeName(typeName) {
    var norm = typeName.toLowerCase();
    var type = typeAliases[norm] || norm;
    return typeof defaultRenderers[type] !== 'undefined' ? type : typeName;
}

function normalizeRenderers(renderers) {
    return Object.keys(renderers || {}).reduce(function(normalized, type) {
        var norm = normalizeTypeName(type);
        normalized[norm] = renderers[type];
        return normalized;
    }, {});
}

function HtmlRenderer(props) {
    var coreProps = getCoreProps(props);
    var nodeProps = props.escapeHtml ? {} : { dangerouslySetInnerHTML: { __html: props.literal } };
    var children = props.escapeHtml ? [props.literal] : null;

    if (props.escapeHtml || !props.skipHtml) {
        var actualProps = assign(coreProps, nodeProps);
        return createElement(props.isBlock ? 'div' : 'span', actualProps, children);
    }
}

function isGrandChildOfList(node) {
    var grandparent = node.parent.parent;
    return (
        grandparent &&
        grandparent.type.toLowerCase() === 'list' &&
        grandparent.listTight
    );
}

function addChild(node, child) {
    var parent = node;
    do {
        parent = parent.parent;
    } while (!parent.react);

    parent.react.children.push(child);
}

function createElement(tagName, props, children) {
    var nodeChildren = Array.isArray(children) && children.reduce(reduceChildren, []);
    var args = [tagName, props].concat(nodeChildren || children);
    return React.createElement.apply(React, args);
}

function reduceChildren(children, child) {
    var lastIndex = children.length - 1;
    if (typeof child === 'string' && typeof children[lastIndex] === 'string') {
        children[lastIndex] += child;
    } else {
        children.push(child);
    }

    return children;
}

function flattenPosition(pos) {
    return [
        pos[0][0], ':', pos[0][1], '-',
        pos[1][0], ':', pos[1][1]
    ].map(String).join('');
}

// For some nodes, we want to include more props than for others
function getNodeProps(node, key, opts, renderer) {
    var props = { key: key }, undef;

    // `sourcePos` is true if the user wants source information (line/column info from markdown source)
    if (opts.sourcePos && node.sourcepos) {
        props['data-sourcepos'] = flattenPosition(node.sourcepos);
    }

    var type = normalizeTypeName(node.type);

    switch (type) {
        case 'html_inline':
        case 'html_block':
            props.isBlock = type === 'html_block';
            props.escapeHtml = opts.escapeHtml;
            props.skipHtml = opts.skipHtml;
            break;
        case 'code_block':
            var codeInfo = node.info ? node.info.split(/ +/) : [];
            if (codeInfo.length > 0 && codeInfo[0].length > 0) {
                props.language = codeInfo[0];
                props.codeinfo = codeInfo;
            }
            break;
        case 'code':
            props.children = node.literal;
            props.inline = true;
            break;
        case 'heading':
            props.level = node.level;
            break;
        case 'softbreak':
            props.softBreak = opts.softBreak;
            break;
        case 'link':
            props.href = opts.transformLinkUri ? opts.transformLinkUri(node.destination) : node.destination;
            props.title = node.title || undef;
            if (opts.linkTarget) {
                props.target = opts.linkTarget;
            }
            break;
        case 'image':
            props.src = opts.transformImageUri ? opts.transformImageUri(node.destination) : node.destination;
            props.title = node.title || undef;

            // Commonmark treats image description as children. We just want the text
            props.alt = node.react.children.join('');
            node.react.children = undef;
            break;
        case 'list':
            props.start = node.listStart;
            props.type = node.listType;
            props.tight = node.listTight;
            break;
        default:
    }

    if (typeof renderer !== 'string') {
        props.literal = node.literal;
    }

    var children = props.children || (node.react && node.react.children);
    if (Array.isArray(children)) {
        props.children = children.reduce(reduceChildren, []) || null;
    }

    return props;
}

function getPosition(node) {
    if (!node) {
        return null;
    }

    if (node.sourcepos) {
        return flattenPosition(node.sourcepos);
    }

    return getPosition(node.parent);
}

function renderNodes(block) {
    var walker = block.walker();

    // Softbreaks are usually treated as newlines, but in HTML we might want explicit linebreaks
    var softBreak = (
        this.softBreak === 'br' ?
        React.createElement('br') :
        this.softBreak
    );

    var propOptions = {
        sourcePos: this.sourcePos,
        escapeHtml: this.escapeHtml,
        skipHtml: this.skipHtml,
        transformLinkUri: this.transformLinkUri,
        transformImageUri: this.transformImageUri,
        softBreak: softBreak,
        linkTarget: this.linkTarget
    };

    var e, node, entering, leaving, type, doc, key, nodeProps, prevPos, prevIndex = 0;
    while ((e = walker.next())) {
        var pos = getPosition(e.node.sourcepos ? e.node : e.node.parent);
        if (prevPos === pos) {
            key = pos + prevIndex;
            prevIndex++;
        } else {
            key = pos;
            prevIndex = 0;
        }

        prevPos = pos;
        entering = e.entering;
        leaving = !entering;
        node = e.node;
        type = normalizeTypeName(node.type);
        nodeProps = null;

        // If we have not assigned a document yet, assume the current node is just that
        if (!doc) {
            doc = node;
            node.react = { children: [] };
            continue;
        } else if (node === doc) {
            // When we're leaving...
            continue;
        }

        // In HTML, we don't want paragraphs inside of list items
        if (type === 'paragraph' && isGrandChildOfList(node)) {
            continue;
        }

        // If we're skipping HTML nodes, don't keep processing
        if (this.skipHtml && (type === 'html_block' || type === 'html_inline')) {
            continue;
        }

        var isDocument = node === doc;
        var disallowedByConfig = this.allowedTypes.indexOf(type) === -1;
        var disallowedByUser = false;

        // Do we have a user-defined function?
        var isCompleteParent = node.isContainer && leaving;
        var renderer = this.renderers[type];
        if (this.allowNode && (isCompleteParent || !node.isContainer)) {
            var nodeChildren = isCompleteParent ? node.react.children : [];

            nodeProps = getNodeProps(node, key, propOptions, renderer);
            disallowedByUser = !this.allowNode({
                type: pascalCase(type),
                renderer: this.renderers[type],
                props: nodeProps,
                children: nodeChildren
            });
        }

        if (!isDocument && (disallowedByUser || disallowedByConfig)) {
            if (!this.unwrapDisallowed && entering && node.isContainer) {
                walker.resumeAt(node, false);
            }

            continue;
        }

        var isSimpleNode = type === 'text' || type === 'softbreak';
        if (typeof renderer !== 'function' && !isSimpleNode && typeof renderer !== 'string') {
            throw new Error(
                'Renderer for type `' + pascalCase(node.type) + '` not defined or is not renderable'
            );
        }

        if (node.isContainer && entering) {
            node.react = {
                component: renderer,
                props: {},
                children: []
            };
        } else {
            var childProps = nodeProps || getNodeProps(node, key, propOptions, renderer);
            if (renderer) {
                childProps = typeof renderer === 'string'
                    ? childProps
                    : assign(childProps, {nodeKey: childProps.key});

                addChild(node, React.createElement(renderer, childProps));
            } else if (type === 'text') {
                addChild(node, node.literal);
            } else if (type === 'softbreak') {
                addChild(node, softBreak);
            }
        }
    }

    return doc.react.children;
}

function defaultLinkUriFilter(uri) {
    var url = uri.replace(/file:\/\//g, 'x-file://');

    // React does a pretty swell job of escaping attributes,
    // so to prevent double-escaping, we need to decode
    return decodeURI(xssFilters.uriInDoubleQuotedAttr(url));
}

function ReactRenderer(options) {
    var opts = options || {};

    if (opts.allowedTypes && opts.disallowedTypes) {
        throw new Error('Only one of `allowedTypes` and `disallowedTypes` should be defined');
    }

    if (opts.allowedTypes && !Array.isArray(opts.allowedTypes)) {
        throw new Error('`allowedTypes` must be an array');
    }

    if (opts.disallowedTypes && !Array.isArray(opts.disallowedTypes)) {
        throw new Error('`disallowedTypes` must be an array');
    }

    if (opts.allowNode && typeof opts.allowNode !== 'function') {
        throw new Error('`allowNode` must be a function');
    }

    var linkFilter = opts.transformLinkUri;
    if (typeof linkFilter === 'undefined') {
        linkFilter = defaultLinkUriFilter;
    } else if (linkFilter && typeof linkFilter !== 'function') {
        throw new Error('`transformLinkUri` must either be a function, or `null` to disable');
    }

    var imageFilter = opts.transformImageUri;
    if (typeof imageFilter !== 'undefined' && typeof imageFilter !== 'function') {
        throw new Error('`transformImageUri` must be a function');
    }

    if (opts.renderers && !isPlainObject(opts.renderers)) {
        throw new Error('`renderers` must be a plain object of `Type`: `Renderer` pairs');
    }

    var allowedTypes = (opts.allowedTypes && opts.allowedTypes.map(normalizeTypeName)) || coreTypes;
    if (opts.disallowedTypes) {
        var disallowed = opts.disallowedTypes.map(normalizeTypeName);
        allowedTypes = allowedTypes.filter(function filterDisallowed(type) {
            return disallowed.indexOf(type) === -1;
        });
    }

    return {
        sourcePos: Boolean(opts.sourcePos),
        softBreak: opts.softBreak || '\n',
        renderers: assign({}, defaultRenderers, normalizeRenderers(opts.renderers)),
        escapeHtml: Boolean(opts.escapeHtml),
        skipHtml: Boolean(opts.skipHtml),
        transformLinkUri: linkFilter,
        transformImageUri: imageFilter,
        allowNode: opts.allowNode,
        allowedTypes: allowedTypes,
        unwrapDisallowed: Boolean(opts.unwrapDisallowed),
        render: renderNodes,
        linkTarget: opts.linkTarget || false
    };
}

ReactRenderer.uriTransformer = defaultLinkUriFilter;
ReactRenderer.types = coreTypes.map(pascalCase);
ReactRenderer.renderers = coreTypes.reduce(function(renderers, type) {
    renderers[pascalCase(type)] = defaultRenderers[type];
    return renderers;
}, {});

module.exports = ReactRenderer;


/***/ }),

/***/ 557:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(551);
var unescapeString = __webpack_require__(550).unescapeString;
var OPENTAG = __webpack_require__(550).OPENTAG;
var CLOSETAG = __webpack_require__(550).CLOSETAG;

var CODE_INDENT = 4;

var C_TAB = 9;
var C_NEWLINE = 10;
var C_GREATERTHAN = 62;
var C_LESSTHAN = 60;
var C_SPACE = 32;
var C_OPEN_BRACKET = 91;

var InlineParser = __webpack_require__(561);

var reHtmlBlockOpen = [
   /./, // dummy for 0
   /^<(?:script|pre|style)(?:\s|>|$)/i,
   /^<!--/,
   /^<[?]/,
   /^<![A-Z]/,
   /^<!\[CDATA\[/,
   /^<[/]?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h1|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|title|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|[/]?[>]|$)/i,
    new RegExp('^(?:' + OPENTAG + '|' + CLOSETAG + ')\s*$', 'i')
];

var reHtmlBlockClose = [
   /./, // dummy for 0
   /<\/(?:script|pre|style)>/i,
   /-->/,
   /\?>/,
   />/,
   /\]\]>/
];

var reThematicBreak = /^(?:(?:\* *){3,}|(?:_ *){3,}|(?:- *){3,}) *$/;

var reMaybeSpecial = /^[#`~*+_=<>0-9-]/;

var reNonSpace = /[^ \t\f\v\r\n]/;

var reBulletListMarker = /^[*+-]/;

var reOrderedListMarker = /^(\d{1,9})([.)])/;

var reATXHeadingMarker = /^#{1,6}(?: +|$)/;

var reCodeFence = /^`{3,}(?!.*`)|^~{3,}(?!.*~)/;

var reClosingCodeFence = /^(?:`{3,}|~{3,})(?= *$)/;

var reSetextHeadingLine = /^(?:=+|-+) *$/;

var reLineEnding = /\r\n|\n|\r/;

// Returns true if string contains only space characters.
var isBlank = function(s) {
    return !(reNonSpace.test(s));
};

var peek = function(ln, pos) {
    if (pos < ln.length) {
        return ln.charCodeAt(pos);
    } else {
        return -1;
    }
};

// DOC PARSER

// These are methods of a Parser object, defined below.

// Returns true if block ends with a blank line, descending if needed
// into lists and sublists.
var endsWithBlankLine = function(block) {
    while (block) {
        if (block._lastLineBlank) {
            return true;
        }
        var t = block.type;
        if (t === 'List' || t === 'Item') {
            block = block._lastChild;
        } else {
            break;
        }
    }
    return false;
};

// Break out of all containing lists, resetting the tip of the
// document to the parent of the highest list, and finalizing
// all the lists.  (This is used to implement the "two blank lines
// break out of all lists" feature.)
var breakOutOfLists = function(block) {
    var b = block;
    var last_list = null;
    do {
        if (b.type === 'List') {
            last_list = b;
        }
        b = b._parent;
    } while (b);

    if (last_list) {
        while (block !== last_list) {
            this.finalize(block, this.lineNumber);
            block = block._parent;
        }
        this.finalize(last_list, this.lineNumber);
        this.tip = last_list._parent;
    }
};

// Add a line to the block at the tip.  We assume the tip
// can accept lines -- that check should be done before calling this.
var addLine = function() {
    this.tip._string_content += this.currentLine.slice(this.offset) + '\n';
};

// Add block of type tag as a child of the tip.  If the tip can't
// accept children, close and finalize it and try its parent,
// and so on til we find a block that can accept children.
var addChild = function(tag, offset) {
    while (!this.blocks[this.tip.type].canContain(tag)) {
        this.finalize(this.tip, this.lineNumber - 1);
    }

    var column_number = offset + 1; // offset 0 = column 1
    var newBlock = new Node(tag, [[this.lineNumber, column_number], [0, 0]]);
    newBlock._string_content = '';
    this.tip.appendChild(newBlock);
    this.tip = newBlock;
    return newBlock;
};

// Parse a list marker and return data on the marker (type,
// start, delimiter, bullet character, padding) or null.
var parseListMarker = function(parser) {
    var rest = parser.currentLine.slice(parser.nextNonspace);
    var match;
    var nextc;
    var spacesStartCol;
    var spacesStartOffset;
    var data = { type: null,
                 tight: true,  // lists are tight by default
                 bulletChar: null,
                 start: null,
                 delimiter: null,
                 padding: null,
                 markerOffset: parser.indent };
    if ((match = rest.match(reBulletListMarker))) {
        data.type = 'Bullet';
        data.bulletChar = match[0][0];

    } else if ((match = rest.match(reOrderedListMarker))) {
        data.type = 'Ordered';
        data.start = parseInt(match[1]);
        data.delimiter = match[2];
    } else {
        return null;
    }
    // make sure we have spaces after
    nextc = peek(parser.currentLine, parser.nextNonspace + match[0].length);
    if (!(nextc === -1 || nextc === C_TAB || nextc === C_SPACE)) {
        return null;
    }

    // we've got a match! advance offset and calculate padding
    parser.advanceNextNonspace(); // to start of marker
    parser.advanceOffset(match[0].length, true); // to end of marker
    spacesStartCol = parser.column;
    spacesStartOffset = parser.offset;
    do {
        parser.advanceOffset(1, true);
        nextc = peek(parser.currentLine, parser.offset);
    } while (parser.column - spacesStartCol < 5 &&
           (nextc === C_SPACE || nextc === C_TAB));
    var blank_item = peek(parser.currentLine, parser.offset) === -1;
    var spaces_after_marker = parser.column - spacesStartCol;
    if (spaces_after_marker >= 5 ||
        spaces_after_marker < 1 ||
        blank_item) {
        data.padding = match[0].length + 1;
        parser.column = spacesStartCol;
        parser.offset = spacesStartOffset;
        if (peek(parser.currentLine, parser.offset) === C_SPACE) {
            parser.advanceOffset(1, true);
        }
    } else {
        data.padding = match[0].length + spaces_after_marker;
    }
    return data;
};

// Returns true if the two list items are of the same type,
// with the same delimiter and bullet character.  This is used
// in agglomerating list items into lists.
var listsMatch = function(list_data, item_data) {
    return (list_data.type === item_data.type &&
            list_data.delimiter === item_data.delimiter &&
            list_data.bulletChar === item_data.bulletChar);
};

// Finalize and close any unmatched blocks.
var closeUnmatchedBlocks = function() {
    if (!this.allClosed) {
        // finalize any blocks not matched
        while (this.oldtip !== this.lastMatchedContainer) {
            var parent = this.oldtip._parent;
            this.finalize(this.oldtip, this.lineNumber - 1);
            this.oldtip = parent;
        }
        this.allClosed = true;
    }
};

// 'finalize' is run when the block is closed.
// 'continue' is run to check whether the block is continuing
// at a certain line and offset (e.g. whether a block quote
// contains a `>`.  It returns 0 for matched, 1 for not matched,
// and 2 for "we've dealt with this line completely, go to next."
var blocks = {
    Document: {
        continue: function() { return 0; },
        finalize: function() { return; },
        canContain: function(t) { return (t !== 'Item'); },
        acceptsLines: false
    },
    List: {
        continue: function() { return 0; },
        finalize: function(parser, block) {
            var item = block._firstChild;
            while (item) {
                // check for non-final list item ending with blank line:
                if (endsWithBlankLine(item) && item._next) {
                    block._listData.tight = false;
                    break;
                }
                // recurse into children of list item, to see if there are
                // spaces between any of them:
                var subitem = item._firstChild;
                while (subitem) {
                    if (endsWithBlankLine(subitem) &&
                        (item._next || subitem._next)) {
                        block._listData.tight = false;
                        break;
                    }
                    subitem = subitem._next;
                }
                item = item._next;
            }
        },
        canContain: function(t) { return (t === 'Item'); },
        acceptsLines: false
    },
    BlockQuote: {
        continue: function(parser) {
            var ln = parser.currentLine;
            if (!parser.indented &&
                peek(ln, parser.nextNonspace) === C_GREATERTHAN) {
                parser.advanceNextNonspace();
                parser.advanceOffset(1, false);
                if (peek(ln, parser.offset) === C_SPACE) {
                    parser.offset++;
                }
            } else {
                return 1;
            }
            return 0;
        },
        finalize: function() { return; },
        canContain: function(t) { return (t !== 'Item'); },
        acceptsLines: false
    },
    Item: {
        continue: function(parser, container) {
            if (parser.blank && container._firstChild !== null) {
                parser.advanceNextNonspace();
            } else if (parser.indent >=
                       container._listData.markerOffset +
                       container._listData.padding) {
                parser.advanceOffset(container._listData.markerOffset +
                    container._listData.padding, true);
            } else {
                return 1;
            }
            return 0;
        },
        finalize: function() { return; },
        canContain: function(t) { return (t !== 'Item'); },
        acceptsLines: false
    },
    Heading: {
        continue: function() {
            // a heading can never container > 1 line, so fail to match:
            return 1;
        },
        finalize: function() { return; },
        canContain: function() { return false; },
        acceptsLines: false
    },
    ThematicBreak: {
        continue: function() {
            // a thematic break can never container > 1 line, so fail to match:
            return 1;
        },
        finalize: function() { return; },
        canContain: function() { return false; },
        acceptsLines: false
    },
    CodeBlock: {
        continue: function(parser, container) {
            var ln = parser.currentLine;
            var indent = parser.indent;
            if (container._isFenced) { // fenced
                var match = (indent <= 3 &&
                    ln.charAt(parser.nextNonspace) === container._fenceChar &&
                    ln.slice(parser.nextNonspace).match(reClosingCodeFence));
                if (match && match[0].length >= container._fenceLength) {
                    // closing fence - we're at end of line, so we can return
                    parser.finalize(container, parser.lineNumber);
                    return 2;
                } else {
                    // skip optional spaces of fence offset
                    var i = container._fenceOffset;
                    while (i > 0 && peek(ln, parser.offset) === C_SPACE) {
                        parser.advanceOffset(1, false);
                        i--;
                    }
                }
            } else { // indented
                if (indent >= CODE_INDENT) {
                    parser.advanceOffset(CODE_INDENT, true);
                } else if (parser.blank) {
                    parser.advanceNextNonspace();
                } else {
                    return 1;
                }
            }
            return 0;
        },
        finalize: function(parser, block) {
            if (block._isFenced) { // fenced
                // first line becomes info string
                var content = block._string_content;
                var newlinePos = content.indexOf('\n');
                var firstLine = content.slice(0, newlinePos);
                var rest = content.slice(newlinePos + 1);
                block.info = unescapeString(firstLine.trim());
                block._literal = rest;
            } else { // indented
                block._literal = block._string_content.replace(/(\n *)+$/, '\n');
            }
            block._string_content = null; // allow GC
        },
        canContain: function() { return false; },
        acceptsLines: true
    },
    HtmlBlock: {
        continue: function(parser, container) {
            return ((parser.blank &&
                     (container._htmlBlockType === 6 ||
                      container._htmlBlockType === 7)) ? 1 : 0);
        },
        finalize: function(parser, block) {
            block._literal = block._string_content.replace(/(\n *)+$/, '');
            block._string_content = null; // allow GC
        },
        canContain: function() { return false; },
        acceptsLines: true
    },
    Paragraph: {
        continue: function(parser) {
            return (parser.blank ? 1 : 0);
        },
        finalize: function(parser, block) {
            var pos;
            var hasReferenceDefs = false;

            // try parsing the beginning as link reference definitions:
            while (peek(block._string_content, 0) === C_OPEN_BRACKET &&
                   (pos =
                    parser.inlineParser.parseReference(block._string_content,
                                                       parser.refmap))) {
                block._string_content = block._string_content.slice(pos);
                hasReferenceDefs = true;
            }
            if (hasReferenceDefs && isBlank(block._string_content)) {
                block.unlink();
            }
        },
        canContain: function() { return false; },
        acceptsLines: true
    }
};

// block start functions.  Return values:
// 0 = no match
// 1 = matched container, keep going
// 2 = matched leaf, no more block starts
var blockStarts = [
    // block quote
    function(parser) {
        if (!parser.indented &&
            peek(parser.currentLine, parser.nextNonspace) === C_GREATERTHAN) {
            parser.advanceNextNonspace();
            parser.advanceOffset(1, false);
            // optional following space
            if (peek(parser.currentLine, parser.offset) === C_SPACE) {
                parser.advanceOffset(1, false);
            }
            parser.closeUnmatchedBlocks();
            parser.addChild('BlockQuote', parser.nextNonspace);
            return 1;
        } else {
            return 0;
        }
    },

    // ATX heading
    function(parser) {
        var match;
        if (!parser.indented &&
            (match = parser.currentLine.slice(parser.nextNonspace).match(reATXHeadingMarker))) {
            parser.advanceNextNonspace();
            parser.advanceOffset(match[0].length, false);
            parser.closeUnmatchedBlocks();
            var container = parser.addChild('Heading', parser.nextNonspace);
            container.level = match[0].trim().length; // number of #s
            // remove trailing ###s:
            container._string_content =
                parser.currentLine.slice(parser.offset).replace(/^ *#+ *$/, '').replace(/ +#+ *$/, '');
            parser.advanceOffset(parser.currentLine.length - parser.offset);
            return 2;
        } else {
            return 0;
        }
    },

    // Fenced code block
    function(parser) {
        var match;
        if (!parser.indented &&
            (match = parser.currentLine.slice(parser.nextNonspace).match(reCodeFence))) {
            var fenceLength = match[0].length;
            parser.closeUnmatchedBlocks();
            var container = parser.addChild('CodeBlock', parser.nextNonspace);
            container._isFenced = true;
            container._fenceLength = fenceLength;
            container._fenceChar = match[0][0];
            container._fenceOffset = parser.indent;
            parser.advanceNextNonspace();
            parser.advanceOffset(fenceLength, false);
            return 2;
        } else {
            return 0;
        }
    },

    // HTML block
    function(parser, container) {
        if (!parser.indented &&
            peek(parser.currentLine, parser.nextNonspace) === C_LESSTHAN) {
            var s = parser.currentLine.slice(parser.nextNonspace);
            var blockType;

            for (blockType = 1; blockType <= 7; blockType++) {
                if (reHtmlBlockOpen[blockType].test(s) &&
                    (blockType < 7 ||
                     container.type !== 'Paragraph')) {
                    parser.closeUnmatchedBlocks();
                    // We don't adjust parser.offset;
                    // spaces are part of the HTML block:
                    var b = parser.addChild('HtmlBlock',
                                            parser.offset);
                    b._htmlBlockType = blockType;
                    return 2;
                }
            }
        }

        return 0;

    },

    // Setext heading
    function(parser, container) {
        var match;
        if (!parser.indented &&
            container.type === 'Paragraph' &&
                   ((match = parser.currentLine.slice(parser.nextNonspace).match(reSetextHeadingLine)))) {
            parser.closeUnmatchedBlocks();
            var heading = new Node('Heading', container.sourcepos);
            heading.level = match[0][0] === '=' ? 1 : 2;
            heading._string_content = container._string_content;
            container.insertAfter(heading);
            container.unlink();
            parser.tip = heading;
            parser.advanceOffset(parser.currentLine.length - parser.offset, false);
            return 2;
        } else {
            return 0;
        }
    },

    // thematic break
    function(parser) {
        if (!parser.indented &&
            reThematicBreak.test(parser.currentLine.slice(parser.nextNonspace))) {
            parser.closeUnmatchedBlocks();
            parser.addChild('ThematicBreak', parser.nextNonspace);
            parser.advanceOffset(parser.currentLine.length - parser.offset, false);
            return 2;
        } else {
            return 0;
        }
    },

    // list item
    function(parser, container) {
        var data;

        if ((!parser.indented || container.type === 'List')
                && (data = parseListMarker(parser))) {
            parser.closeUnmatchedBlocks();

            // add the list if needed
            if (parser.tip.type !== 'List' ||
                !(listsMatch(container._listData, data))) {
                container = parser.addChild('List', parser.nextNonspace);
                container._listData = data;
            }

            // add the list item
            container = parser.addChild('Item', parser.nextNonspace);
            container._listData = data;
            return 1;
        } else {
            return 0;
        }
    },

    // indented code block
    function(parser) {
        if (parser.indented &&
            parser.tip.type !== 'Paragraph' &&
            !parser.blank) {
            // indented code
            parser.advanceOffset(CODE_INDENT, true);
            parser.closeUnmatchedBlocks();
            parser.addChild('CodeBlock', parser.offset);
            return 2;
        } else {
            return 0;
        }
     }

];

var advanceOffset = function(count, columns) {
    var cols = 0;
    var currentLine = this.currentLine;
    var charsToTab;
    var c;
    while (count > 0 && (c = currentLine[this.offset])) {
        if (c === '\t') {
            charsToTab = 4 - (this.column % 4);
            this.column += charsToTab;
            this.offset += 1;
            count -= (columns ? charsToTab : 1);
        } else {
            cols += 1;
            this.offset += 1;
            this.column += 1; // assume ascii; block starts are ascii
            count -= 1;
        }
    }
};

var advanceNextNonspace = function() {
    this.offset = this.nextNonspace;
    this.column = this.nextNonspaceColumn;
};

var findNextNonspace = function() {
    var currentLine = this.currentLine;
    var i = this.offset;
    var cols = this.column;
    var c;

    while ((c = currentLine.charAt(i)) !== '') {
        if (c === ' ') {
            i++;
            cols++;
        } else if (c === '\t') {
            i++;
            cols += (4 - (cols % 4));
        } else {
            break;
        }
    }
    this.blank = (c === '\n' || c === '\r' || c === '');
    this.nextNonspace = i;
    this.nextNonspaceColumn = cols;
    this.indent = this.nextNonspaceColumn - this.column;
    this.indented = this.indent >= CODE_INDENT;
};

// Analyze a line of text and update the document appropriately.
// We parse markdown text by calling this on each line of input,
// then finalizing the document.
var incorporateLine = function(ln) {
    var all_matched = true;
    var t;

    var container = this.doc;
    this.oldtip = this.tip;
    this.offset = 0;
    this.column = 0;
    this.lineNumber += 1;

    // replace NUL characters for security
    if (ln.indexOf('\u0000') !== -1) {
        ln = ln.replace(/\0/g, '\uFFFD');
    }

    this.currentLine = ln;

    // For each containing block, try to parse the associated line start.
    // Bail out on failure: container will point to the last matching block.
    // Set all_matched to false if not all containers match.
    var lastChild;
    while ((lastChild = container._lastChild) && lastChild._open) {
        container = lastChild;

        this.findNextNonspace();

        switch (this.blocks[container.type].continue(this, container)) {
        case 0: // we've matched, keep going
            break;
        case 1: // we've failed to match a block
            all_matched = false;
            break;
        case 2: // we've hit end of line for fenced code close and can return
            this.lastLineLength = ln.length;
            return;
        default:
            throw 'continue returned illegal value, must be 0, 1, or 2';
        }
        if (!all_matched) {
            container = container._parent; // back up to last matching block
            break;
        }
    }

    this.allClosed = (container === this.oldtip);
    this.lastMatchedContainer = container;

    // Check to see if we've hit 2nd blank line; if so break out of list:
    if (this.blank && container._lastLineBlank) {
        this.breakOutOfLists(container);
        container = this.tip;
    }

    var matchedLeaf = container.type !== 'Paragraph' &&
            blocks[container.type].acceptsLines;
    var starts = this.blockStarts;
    var startsLen = starts.length;
    // Unless last matched container is a code block, try new container starts,
    // adding children to the last matched container:
    while (!matchedLeaf) {

        this.findNextNonspace();

        // this is a little performance optimization:
        if (!this.indented &&
            !reMaybeSpecial.test(ln.slice(this.nextNonspace))) {
            this.advanceNextNonspace();
            break;
        }

        var i = 0;
        while (i < startsLen) {
            var res = starts[i](this, container);
            if (res === 1) {
                container = this.tip;
                break;
            } else if (res === 2) {
                container = this.tip;
                matchedLeaf = true;
                break;
            } else {
                i++;
            }
        }

        if (i === startsLen) { // nothing matched
            this.advanceNextNonspace();
            break;
        }
    }

    // What remains at the offset is a text line.  Add the text to the
    // appropriate container.

   // First check for a lazy paragraph continuation:
    if (!this.allClosed && !this.blank &&
        this.tip.type === 'Paragraph') {
        // lazy paragraph continuation
        this.addLine();

    } else { // not a lazy continuation

        // finalize any blocks not matched
        this.closeUnmatchedBlocks();
        if (this.blank && container.lastChild) {
            container.lastChild._lastLineBlank = true;
        }

        t = container.type;

        // Block quote lines are never blank as they start with >
        // and we don't count blanks in fenced code for purposes of tight/loose
        // lists or breaking out of lists.  We also don't set _lastLineBlank
        // on an empty list item, or if we just closed a fenced block.
        var lastLineBlank = this.blank &&
            !(t === 'BlockQuote' ||
              (t === 'CodeBlock' && container._isFenced) ||
              (t === 'Item' &&
               !container._firstChild &&
               container.sourcepos[0][0] === this.lineNumber));

        // propagate lastLineBlank up through parents:
        var cont = container;
        while (cont) {
            cont._lastLineBlank = lastLineBlank;
            cont = cont._parent;
        }

        if (this.blocks[t].acceptsLines) {
            this.addLine();
            // if HtmlBlock, check for end condition
            if (t === 'HtmlBlock' &&
                container._htmlBlockType >= 1 &&
                container._htmlBlockType <= 5 &&
                reHtmlBlockClose[container._htmlBlockType].test(this.currentLine.slice(this.offset))) {
                this.finalize(container, this.lineNumber);
            }

        } else if (this.offset < ln.length && !this.blank) {
            // create paragraph container for line
            container = this.addChild('Paragraph', this.offset);
            this.advanceNextNonspace();
            this.addLine();
        }
    }
    this.lastLineLength = ln.length;
};

// Finalize a block.  Close it and do any necessary postprocessing,
// e.g. creating string_content from strings, setting the 'tight'
// or 'loose' status of a list, and parsing the beginnings
// of paragraphs for reference definitions.  Reset the tip to the
// parent of the closed block.
var finalize = function(block, lineNumber) {
    var above = block._parent;
    block._open = false;
    block.sourcepos[1] = [lineNumber, this.lastLineLength];

    this.blocks[block.type].finalize(this, block);

    this.tip = above;
};

// Walk through a block & children recursively, parsing string content
// into inline content where appropriate.
var processInlines = function(block) {
    var node, event, t;
    var walker = block.walker();
    this.inlineParser.refmap = this.refmap;
    this.inlineParser.options = this.options;
    while ((event = walker.next())) {
        node = event.node;
        t = node.type;
        if (!event.entering && (t === 'Paragraph' || t === 'Heading')) {
            this.inlineParser.parse(node);
        }
    }
};

var Document = function() {
    var doc = new Node('Document', [[1, 1], [0, 0]]);
    return doc;
};

// The main parsing function.  Returns a parsed document AST.
var parse = function(input) {
    this.doc = new Document();
    this.tip = this.doc;
    this.refmap = {};
    this.lineNumber = 0;
    this.lastLineLength = 0;
    this.offset = 0;
    this.column = 0;
    this.lastMatchedContainer = this.doc;
    this.currentLine = "";
    if (this.options.time) { console.time("preparing input"); }
    var lines = input.split(reLineEnding);
    var len = lines.length;
    if (input.charCodeAt(input.length - 1) === C_NEWLINE) {
        // ignore last blank line created by final newline
        len -= 1;
    }
    if (this.options.time) { console.timeEnd("preparing input"); }
    if (this.options.time) { console.time("block parsing"); }
    for (var i = 0; i < len; i++) {
        this.incorporateLine(lines[i]);
    }
    while (this.tip) {
        this.finalize(this.tip, len);
    }
    if (this.options.time) { console.timeEnd("block parsing"); }
    if (this.options.time) { console.time("inline parsing"); }
    this.processInlines(this.doc);
    if (this.options.time) { console.timeEnd("inline parsing"); }
    return this.doc;
};


// The Parser object.
function Parser(options){
    return {
        doc: new Document(),
        blocks: blocks,
        blockStarts: blockStarts,
        tip: this.doc,
        oldtip: this.doc,
        currentLine: "",
        lineNumber: 0,
        offset: 0,
        column: 0,
        nextNonspace: 0,
        nextNonspaceColumn: 0,
        indent: 0,
        indented: false,
        blank: false,
        allClosed: true,
        lastMatchedContainer: this.doc,
        refmap: {},
        lastLineLength: 0,
        inlineParser: new InlineParser(options),
        findNextNonspace: findNextNonspace,
        advanceOffset: advanceOffset,
        advanceNextNonspace: advanceNextNonspace,
        breakOutOfLists: breakOutOfLists,
        addLine: addLine,
        addChild: addChild,
        incorporateLine: incorporateLine,
        finalize: finalize,
        processInlines: processInlines,
        closeUnmatchedBlocks: closeUnmatchedBlocks,
        parse: parse,
        options: options || {}
    };
}

module.exports = Parser;


/***/ }),

/***/ 558:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// derived from https://github.com/mathiasbynens/String.fromCodePoint
/*! http://mths.be/fromcodepoint v0.2.1 by @mathias */
if (String.fromCodePoint) {
    module.exports = function (_) {
        try {
            return String.fromCodePoint(_);
        } catch (e) {
            if (e instanceof RangeError) {
                return String.fromCharCode(0xFFFD);
            }
            throw e;
        }
    };

} else {

  var stringFromCharCode = String.fromCharCode;
  var floor = Math.floor;
  var fromCodePoint = function() {
      var MAX_SIZE = 0x4000;
      var codeUnits = [];
      var highSurrogate;
      var lowSurrogate;
      var index = -1;
      var length = arguments.length;
      if (!length) {
          return '';
      }
      var result = '';
      while (++index < length) {
          var codePoint = Number(arguments[index]);
          if (
              !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
                  codePoint < 0 || // not a valid Unicode code point
                  codePoint > 0x10FFFF || // not a valid Unicode code point
                  floor(codePoint) !== codePoint // not an integer
          ) {
              return String.fromCharCode(0xFFFD);
          }
          if (codePoint <= 0xFFFF) { // BMP code point
              codeUnits.push(codePoint);
          } else { // Astral code point; split in surrogate halves
              // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
              codePoint -= 0x10000;
              highSurrogate = (codePoint >> 10) + 0xD800;
              lowSurrogate = (codePoint % 0x400) + 0xDC00;
              codeUnits.push(highSurrogate, lowSurrogate);
          }
          if (index + 1 === length || codeUnits.length > MAX_SIZE) {
              result += stringFromCharCode.apply(null, codeUnits);
              codeUnits.length = 0;
          }
      }
      return result;
  };
  module.exports = fromCodePoint;
}


/***/ }),

/***/ 559:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var escapeXml = __webpack_require__(550).escapeXml;

// Helper function to produce an HTML tag.
var tag = function(name, attrs, selfclosing) {
    var result = '<' + name;
    if (attrs && attrs.length > 0) {
        var i = 0;
        var attrib;
        while ((attrib = attrs[i]) !== undefined) {
            result += ' ' + attrib[0] + '="' + attrib[1] + '"';
            i++;
        }
    }
    if (selfclosing) {
        result += ' /';
    }

    result += '>';
    return result;
};

var reHtmlTag = /\<[^>]*\>/;
var reUnsafeProtocol = /^javascript:|vbscript:|file:|data:/i;
var reSafeDataProtocol = /^data:image\/(?:png|gif|jpeg|webp)/i;

var potentiallyUnsafe = function(url) {
    return reUnsafeProtocol.test(url) &&
        !reSafeDataProtocol.test(url);
};

var renderNodes = function(block) {

    var attrs;
    var info_words;
    var tagname;
    var walker = block.walker();
    var event, node, entering;
    var buffer = "";
    var lastOut = "\n";
    var disableTags = 0;
    var grandparent;
    var out = function(s) {
        if (disableTags > 0) {
            buffer += s.replace(reHtmlTag, '');
        } else {
            buffer += s;
        }
        lastOut = s;
    };
    var esc = this.escape;
    var cr = function() {
        if (lastOut !== '\n') {
            buffer += '\n';
            lastOut = '\n';
        }
    };

    var options = this.options;

    if (options.time) { console.time("rendering"); }

    while ((event = walker.next())) {
        entering = event.entering;
        node = event.node;

        attrs = [];
        if (options.sourcepos) {
            var pos = node.sourcepos;
            if (pos) {
                attrs.push(['data-sourcepos', String(pos[0][0]) + ':' +
                            String(pos[0][1]) + '-' + String(pos[1][0]) + ':' +
                            String(pos[1][1])]);
            }
        }

        switch (node.type) {
        case 'Text':
            out(esc(node.literal, false));
            break;

        case 'Softbreak':
            out(this.softbreak);
            break;

        case 'Hardbreak':
            out(tag('br', [], true));
            cr();
            break;

        case 'Emph':
            out(tag(entering ? 'em' : '/em'));
            break;

        case 'Strong':
            out(tag(entering ? 'strong' : '/strong'));
            break;

        case 'HtmlInline':
            if (options.safe) {
                out('<!-- raw HTML omitted -->');
            } else {
                out(node.literal);
            }
            break;

        case 'CustomInline':
            if (entering && node.onEnter) {
                out(node.onEnter);
            } else if (!entering && node.onExit) {
                out(node.onExit);
            }
            break;

        case 'Link':
            if (entering) {
                if (!(options.safe && potentiallyUnsafe(node.destination))) {
                    attrs.push(['href', esc(node.destination, true)]);
                }
                if (node.title) {
                    attrs.push(['title', esc(node.title, true)]);
                }
                out(tag('a', attrs));
            } else {
                out(tag('/a'));
            }
            break;

        case 'Image':
            if (entering) {
                if (disableTags === 0) {
                    if (options.safe &&
                         potentiallyUnsafe(node.destination)) {
                        out('<img src="" alt="');
                    } else {
                        out('<img src="' + esc(node.destination, true) +
                            '" alt="');
                    }
                }
                disableTags += 1;
            } else {
                disableTags -= 1;
                if (disableTags === 0) {
                    if (node.title) {
                        out('" title="' + esc(node.title, true));
                    }
                    out('" />');
                }
            }
            break;

        case 'Code':
            out(tag('code') + esc(node.literal, false) + tag('/code'));
            break;

        case 'Document':
            break;

        case 'Paragraph':
            grandparent = node.parent.parent;
            if (grandparent !== null &&
                grandparent.type === 'List') {
                if (grandparent.listTight) {
                    break;
                }
            }
            if (entering) {
                cr();
                out(tag('p', attrs));
            } else {
                out(tag('/p'));
                cr();
            }
            break;

        case 'BlockQuote':
            if (entering) {
                cr();
                out(tag('blockquote', attrs));
                cr();
            } else {
                cr();
                out(tag('/blockquote'));
                cr();
            }
            break;

        case 'Item':
            if (entering) {
                out(tag('li', attrs));
            } else {
                out(tag('/li'));
                cr();
            }
            break;

        case 'List':
            tagname = node.listType === 'Bullet' ? 'ul' : 'ol';
            if (entering) {
                var start = node.listStart;
                if (start !== null && start !== 1) {
                    attrs.push(['start', start.toString()]);
                }
                cr();
                out(tag(tagname, attrs));
                cr();
            } else {
                cr();
                out(tag('/' + tagname));
                cr();
            }
            break;

        case 'Heading':
            tagname = 'h' + node.level;
            if (entering) {
                cr();
                out(tag(tagname, attrs));
            } else {
                out(tag('/' + tagname));
                cr();
            }
            break;

        case 'CodeBlock':
            info_words = node.info ? node.info.split(/\s+/) : [];
            if (info_words.length > 0 && info_words[0].length > 0) {
                attrs.push(['class', 'language-' + esc(info_words[0], true)]);
            }
            cr();
            out(tag('pre') + tag('code', attrs));
            out(esc(node.literal, false));
            out(tag('/code') + tag('/pre'));
            cr();
            break;

        case 'HtmlBlock':
            cr();
            if (options.safe) {
                out('<!-- raw HTML omitted -->');
            } else {
                out(node.literal);
            }
            cr();
            break;

        case 'CustomBlock':
            cr();
            if (entering && node.onEnter) {
                out(node.onEnter);
            } else if (!entering && node.onExit) {
                out(node.onExit);
            }
            cr();
            break;

        case 'ThematicBreak':
            cr();
            out(tag('hr', attrs, true));
            cr();
            break;

        default:
            throw "Unknown node type " + node.type;
        }

    }
    if (options.time) { console.timeEnd("rendering"); }
    return buffer;
};

// The HtmlRenderer object.
function HtmlRenderer(options){
    return {
        // default options:
        softbreak: '\n', // by default, soft breaks are rendered as newlines in HTML
        // set to "<br />" to make them hard breaks
        // set to " " if you want to ignore line wrapping in source
        escape: escapeXml,
        options: options || {},
        render: renderNodes
    };
}

module.exports = HtmlRenderer;


/***/ }),

/***/ 560:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// commonmark.js - CommomMark in JavaScript
// Copyright (C) 2014 John MacFarlane
// License: BSD3.

// Basic usage:
//
// var commonmark = require('commonmark');
// var parser = new commonmark.Parser();
// var renderer = new commonmark.HtmlRenderer();
// console.log(renderer.render(parser.parse('Hello *world*')));

module.exports.version = '0.24.0'
module.exports.Node = __webpack_require__(551);
module.exports.Parser = __webpack_require__(557);
module.exports.HtmlRenderer = __webpack_require__(559);
module.exports.XmlRenderer = __webpack_require__(563);


/***/ }),

/***/ 561:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(551);
var common = __webpack_require__(550);
var normalizeReference = __webpack_require__(562);

var normalizeURI = common.normalizeURI;
var unescapeString = common.unescapeString;
var fromCodePoint = __webpack_require__(558);
var decodeHTML = __webpack_require__(552).decodeHTML;
__webpack_require__(575); // Polyfill for String.prototype.repeat

// Constants for character codes:

var C_NEWLINE = 10;
var C_ASTERISK = 42;
var C_UNDERSCORE = 95;
var C_BACKTICK = 96;
var C_OPEN_BRACKET = 91;
var C_CLOSE_BRACKET = 93;
var C_LESSTHAN = 60;
var C_BANG = 33;
var C_BACKSLASH = 92;
var C_AMPERSAND = 38;
var C_OPEN_PAREN = 40;
var C_CLOSE_PAREN = 41;
var C_COLON = 58;
var C_SINGLEQUOTE = 39;
var C_DOUBLEQUOTE = 34;

// Some regexps used in inline parser:

var ESCAPABLE = common.ESCAPABLE;
var ESCAPED_CHAR = '\\\\' + ESCAPABLE;
var REG_CHAR = '[^\\\\()\\x00-\\x20]';
var IN_PARENS_NOSP = '\\((' + REG_CHAR + '|' + ESCAPED_CHAR + '|\\\\)*\\)';

var ENTITY = common.ENTITY;
var reHtmlTag = common.reHtmlTag;

var rePunctuation = new RegExp(/^[\u2000-\u206F\u2E00-\u2E7F\\'!"#\$%&\(\)\*\+,\-\.\/:;<=>\?@\[\]\^_`\{\|\}~]/);

var reLinkTitle = new RegExp(
    '^(?:"(' + ESCAPED_CHAR + '|[^"\\x00])*"' +
        '|' +
        '\'(' + ESCAPED_CHAR + '|[^\'\\x00])*\'' +
        '|' +
        '\\((' + ESCAPED_CHAR + '|[^)\\x00])*\\))');

var reLinkDestinationBraces = new RegExp(
    '^(?:[<](?:[^ <>\\t\\n\\\\\\x00]' + '|' + ESCAPED_CHAR + '|' + '\\\\)*[>])');

var reLinkDestination = new RegExp(
    '^(?:' + REG_CHAR + '+|' + ESCAPED_CHAR + '|\\\\|' + IN_PARENS_NOSP + ')*');

var reEscapable = new RegExp('^' + ESCAPABLE);

var reEntityHere = new RegExp('^' + ENTITY, 'i');

var reTicks = /`+/;

var reTicksHere = /^`+/;

var reEllipses = /\.\.\./g;

var reDash = /--+/g;

var reEmailAutolink = /^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/;

var reAutolink = /^<[A-Za-z][A-Za-z0-9.+-]{1,31}:[^<>\x00-\x20]*>/i;

var reSpnl = /^ *(?:\n *)?/;

var reWhitespaceChar = /^\s/;

var reWhitespace = /\s+/g;

var reFinalSpace = / *$/;

var reInitialSpace = /^ */;

var reSpaceAtEndOfLine = /^ *(?:\n|$)/;

var reLinkLabel = new RegExp('^\\[(?:[^\\\\\\[\\]]|' + ESCAPED_CHAR +
  '|\\\\){0,1000}\\]');

// Matches a string of non-special characters.
var reMain = /^[^\n`\[\]\\!<&*_'"]+/m;

var text = function(s) {
    var node = new Node('Text');
    node._literal = s;
    return node;
};

// INLINE PARSER

// These are methods of an InlineParser object, defined below.
// An InlineParser keeps track of a subject (a string to be
// parsed) and a position in that subject.

// If re matches at current position in the subject, advance
// position in subject and return the match; otherwise return null.
var match = function(re) {
    var m = re.exec(this.subject.slice(this.pos));
    if (m === null) {
        return null;
    } else {
        this.pos += m.index + m[0].length;
        return m[0];
    }
};

// Returns the code for the character at the current subject position, or -1
// there are no more characters.
var peek = function() {
    if (this.pos < this.subject.length) {
        return this.subject.charCodeAt(this.pos);
    } else {
        return -1;
    }
};

// Parse zero or more space characters, including at most one newline
var spnl = function() {
    this.match(reSpnl);
    return true;
};

// All of the parsers below try to match something at the current position
// in the subject.  If they succeed in matching anything, they
// return the inline matched, advancing the subject.

// Attempt to parse backticks, adding either a backtick code span or a
// literal sequence of backticks.
var parseBackticks = function(block) {
    var ticks = this.match(reTicksHere);
    if (ticks === null) {
        return false;
    }
    var afterOpenTicks = this.pos;
    var matched;
    var node;
    while ((matched = this.match(reTicks)) !== null) {
        if (matched === ticks) {
            node = new Node('Code');
            node._literal = this.subject.slice(afterOpenTicks,
                                        this.pos - ticks.length)
                          .trim().replace(reWhitespace, ' ');
            block.appendChild(node);
            return true;
        }
    }
    // If we got here, we didn't match a closing backtick sequence.
    this.pos = afterOpenTicks;
    block.appendChild(text(ticks));
    return true;
};

// Parse a backslash-escaped special character, adding either the escaped
// character, a hard line break (if the backslash is followed by a newline),
// or a literal backslash to the block's children.  Assumes current character
// is a backslash.
var parseBackslash = function(block) {
    var subj = this.subject;
    var node;
    this.pos += 1;
    if (this.peek() === C_NEWLINE) {
        this.pos += 1;
        node = new Node('Hardbreak');
        block.appendChild(node);
    } else if (reEscapable.test(subj.charAt(this.pos))) {
        block.appendChild(text(subj.charAt(this.pos)));
        this.pos += 1;
    } else {
        block.appendChild(text('\\'));
    }
    return true;
};

// Attempt to parse an autolink (URL or email in pointy brackets).
var parseAutolink = function(block) {
    var m;
    var dest;
    var node;
    if ((m = this.match(reEmailAutolink))) {
        dest = m.slice(1, m.length - 1);
        node = new Node('Link');
        node._destination = normalizeURI('mailto:' + dest);
        node._title = '';
        node.appendChild(text(dest));
        block.appendChild(node);
        return true;
    } else if ((m = this.match(reAutolink))) {
        dest = m.slice(1, m.length - 1);
        node = new Node('Link');
        node._destination = normalizeURI(dest);
        node._title = '';
        node.appendChild(text(dest));
        block.appendChild(node);
        return true;
    } else {
        return false;
    }
};

// Attempt to parse a raw HTML tag.
var parseHtmlTag = function(block) {
    var m = this.match(reHtmlTag);
    if (m === null) {
        return false;
    } else {
        var node = new Node('HtmlInline');
        node._literal = m;
        block.appendChild(node);
        return true;
    }
};

// Scan a sequence of characters with code cc, and return information about
// the number of delimiters and whether they are positioned such that
// they can open and/or close emphasis or strong emphasis.  A utility
// function for strong/emph parsing.
var scanDelims = function(cc) {
    var numdelims = 0;
    var char_before, char_after, cc_after;
    var startpos = this.pos;
    var left_flanking, right_flanking, can_open, can_close;
    var after_is_whitespace, after_is_punctuation, before_is_whitespace, before_is_punctuation;

    if (cc === C_SINGLEQUOTE || cc === C_DOUBLEQUOTE) {
        numdelims++;
        this.pos++;
    } else {
        while (this.peek() === cc) {
            numdelims++;
            this.pos++;
        }
    }

    if (numdelims === 0) {
        return null;
    }

    char_before = startpos === 0 ? '\n' : this.subject.charAt(startpos - 1);

    cc_after = this.peek();
    if (cc_after === -1) {
        char_after = '\n';
    } else {
        char_after = fromCodePoint(cc_after);
    }

    after_is_whitespace = reWhitespaceChar.test(char_after);
    after_is_punctuation = rePunctuation.test(char_after);
    before_is_whitespace = reWhitespaceChar.test(char_before);
    before_is_punctuation = rePunctuation.test(char_before);

    left_flanking = !after_is_whitespace &&
            !(after_is_punctuation && !before_is_whitespace && !before_is_punctuation);
    right_flanking = !before_is_whitespace &&
            !(before_is_punctuation && !after_is_whitespace && !after_is_punctuation);
    if (cc === C_UNDERSCORE) {
        can_open = left_flanking &&
            (!right_flanking || before_is_punctuation);
        can_close = right_flanking &&
            (!left_flanking || after_is_punctuation);
    } else if (cc === C_SINGLEQUOTE || cc === C_DOUBLEQUOTE) {
        can_open = left_flanking && !right_flanking;
        can_close = right_flanking;
    } else {
        can_open = left_flanking;
        can_close = right_flanking;
    }
    this.pos = startpos;
    return { numdelims: numdelims,
             can_open: can_open,
             can_close: can_close };
};

// Handle a delimiter marker for emphasis or a quote.
var handleDelim = function(cc, block) {
    var res = this.scanDelims(cc);
    if (!res) {
        return false;
    }
    var numdelims = res.numdelims;
    var startpos = this.pos;
    var contents;

    this.pos += numdelims;
    if (cc === C_SINGLEQUOTE) {
        contents = "\u2019";
    } else if (cc === C_DOUBLEQUOTE) {
        contents = "\u201C";
    } else {
        contents = this.subject.slice(startpos, this.pos);
    }
    var node = text(contents);
    block.appendChild(node);

    // Add entry to stack for this opener
    this.delimiters = { cc: cc,
                        numdelims: numdelims,
                        node: node,
                        previous: this.delimiters,
                        next: null,
                        can_open: res.can_open,
                        can_close: res.can_close,
                        active: true };
    if (this.delimiters.previous !== null) {
        this.delimiters.previous.next = this.delimiters;
    }

    return true;

};

var removeDelimiter = function(delim) {
    if (delim.previous !== null) {
        delim.previous.next = delim.next;
    }
    if (delim.next === null) {
        // top of stack
        this.delimiters = delim.previous;
    } else {
        delim.next.previous = delim.previous;
    }
};

var removeDelimitersBetween = function(bottom, top) {
    if (bottom.next !== top) {
        bottom.next = top;
        top.previous = bottom;
    }
};

var processEmphasis = function(stack_bottom) {
    var opener, closer, old_closer;
    var opener_inl, closer_inl;
    var tempstack;
    var use_delims;
    var tmp, next;
    var opener_found;
    var openers_bottom = [];

    openers_bottom[C_UNDERSCORE] = stack_bottom;
    openers_bottom[C_ASTERISK] = stack_bottom;
    openers_bottom[C_SINGLEQUOTE] = stack_bottom;
    openers_bottom[C_DOUBLEQUOTE] = stack_bottom;

    // find first closer above stack_bottom:
    closer = this.delimiters;
    while (closer !== null && closer.previous !== stack_bottom) {
        closer = closer.previous;
    }
    // move forward, looking for closers, and handling each
    while (closer !== null) {
        var closercc = closer.cc;
        if (!(closer.can_close && (closercc === C_UNDERSCORE ||
                                   closercc === C_ASTERISK ||
                                   closercc === C_SINGLEQUOTE ||
                                   closercc === C_DOUBLEQUOTE))) {
            closer = closer.next;
        } else {
            // found emphasis closer. now look back for first matching opener:
            opener = closer.previous;
            opener_found = false;
            while (opener !== null && opener !== stack_bottom &&
                   opener !== openers_bottom[closercc]) {
                if (opener.cc === closer.cc && opener.can_open) {
                    opener_found = true;
                    break;
                }
                opener = opener.previous;
            }
            old_closer = closer;

            if (closercc === C_ASTERISK || closercc === C_UNDERSCORE) {
                if (!opener_found) {
                    closer = closer.next;
                } else {
                    // calculate actual number of delimiters used from closer
                    if (closer.numdelims < 3 || opener.numdelims < 3) {
                        use_delims = closer.numdelims <= opener.numdelims ?
                            closer.numdelims : opener.numdelims;
                    } else {
                        use_delims = closer.numdelims % 2 === 0 ? 2 : 1;
                    }

                    opener_inl = opener.node;
                    closer_inl = closer.node;

                    // remove used delimiters from stack elts and inlines
                    opener.numdelims -= use_delims;
                    closer.numdelims -= use_delims;
                    opener_inl._literal =
                        opener_inl._literal.slice(0,
                                                  opener_inl._literal.length - use_delims);
                    closer_inl._literal =
                        closer_inl._literal.slice(0,
                                                  closer_inl._literal.length - use_delims);

                    // build contents for new emph element
                    var emph = new Node(use_delims === 1 ? 'Emph' : 'Strong');

                    tmp = opener_inl._next;
                    while (tmp && tmp !== closer_inl) {
                        next = tmp._next;
                        tmp.unlink();
                        emph.appendChild(tmp);
                        tmp = next;
                    }

                    opener_inl.insertAfter(emph);

                    // remove elts between opener and closer in delimiters stack
                    removeDelimitersBetween(opener, closer);

                    // if opener has 0 delims, remove it and the inline
                    if (opener.numdelims === 0) {
                        opener_inl.unlink();
                        this.removeDelimiter(opener);
                    }

                    if (closer.numdelims === 0) {
                        closer_inl.unlink();
                        tempstack = closer.next;
                        this.removeDelimiter(closer);
                        closer = tempstack;
                    }

                }

            } else if (closercc === C_SINGLEQUOTE) {
                closer.node._literal = "\u2019";
                if (opener_found) {
                    opener.node._literal = "\u2018";
                }
                closer = closer.next;

            } else if (closercc === C_DOUBLEQUOTE) {
                closer.node._literal = "\u201D";
                if (opener_found) {
                    opener.node.literal = "\u201C";
                }
                closer = closer.next;

            }
            if (!opener_found) {
                // Set lower bound for future searches for openers:
                openers_bottom[closercc] = old_closer.previous;
                if (!old_closer.can_open) {
                    // We can remove a closer that can't be an opener,
                    // once we've seen there's no matching opener:
                    this.removeDelimiter(old_closer);
                }
            }
        }

    }

    // remove all delimiters
    while (this.delimiters !== null && this.delimiters !== stack_bottom) {
        this.removeDelimiter(this.delimiters);
    }
};

// Attempt to parse link title (sans quotes), returning the string
// or null if no match.
var parseLinkTitle = function() {
    var title = this.match(reLinkTitle);
    if (title === null) {
        return null;
    } else {
        // chop off quotes from title and unescape:
        return unescapeString(title.substr(1, title.length - 2));
    }
};

// Attempt to parse link destination, returning the string or
// null if no match.
var parseLinkDestination = function() {
    var res = this.match(reLinkDestinationBraces);
    if (res === null) {
        res = this.match(reLinkDestination);
        if (res === null) {
            return null;
        } else {
            return normalizeURI(unescapeString(res));
        }
    } else {  // chop off surrounding <..>:
        return normalizeURI(unescapeString(res.substr(1, res.length - 2)));
    }
};

// Attempt to parse a link label, returning number of characters parsed.
var parseLinkLabel = function() {
    var m = this.match(reLinkLabel);
    if (m === null || m.length > 1001) {
        return 0;
    } else {
        return m.length;
    }
};

// Add open bracket to delimiter stack and add a text node to block's children.
var parseOpenBracket = function(block) {
    var startpos = this.pos;
    this.pos += 1;

    var node = text('[');
    block.appendChild(node);

    // Add entry to stack for this opener
    this.delimiters = { cc: C_OPEN_BRACKET,
                        numdelims: 1,
                        node: node,
                        previous: this.delimiters,
                        next: null,
                        can_open: true,
                        can_close: false,
                        index: startpos,
                        active: true };
    if (this.delimiters.previous !== null) {
        this.delimiters.previous.next = this.delimiters;
    }

    return true;

};

// IF next character is [, and ! delimiter to delimiter stack and
// add a text node to block's children.  Otherwise just add a text node.
var parseBang = function(block) {
    var startpos = this.pos;
    this.pos += 1;
    if (this.peek() === C_OPEN_BRACKET) {
        this.pos += 1;

        var node = text('![');
        block.appendChild(node);

        // Add entry to stack for this opener
        this.delimiters = { cc: C_BANG,
                            numdelims: 1,
                            node: node,
                            previous: this.delimiters,
                            next: null,
                            can_open: true,
                            can_close: false,
                            index: startpos + 1,
                            active: true };
        if (this.delimiters.previous !== null) {
            this.delimiters.previous.next = this.delimiters;
        }
    } else {
        block.appendChild(text('!'));
    }
    return true;
};

// Try to match close bracket against an opening in the delimiter
// stack.  Add either a link or image, or a plain [ character,
// to block's children.  If there is a matching delimiter,
// remove it from the delimiter stack.
var parseCloseBracket = function(block) {
    var startpos;
    var is_image;
    var dest;
    var title;
    var matched = false;
    var reflabel;
    var opener;

    this.pos += 1;
    startpos = this.pos;

    // look through stack of delimiters for a [ or ![
    opener = this.delimiters;

    while (opener !== null) {
        if (opener.cc === C_OPEN_BRACKET || opener.cc === C_BANG) {
            break;
        }
        opener = opener.previous;
    }

    if (opener === null) {
        // no matched opener, just return a literal
        block.appendChild(text(']'));
        return true;
    }

    if (!opener.active) {
        // no matched opener, just return a literal
        block.appendChild(text(']'));
        // take opener off emphasis stack
        this.removeDelimiter(opener);
        return true;
    }

    // If we got here, open is a potential opener
    is_image = opener.cc === C_BANG;

    // Check to see if we have a link/image

    // Inline link?
    if (this.peek() === C_OPEN_PAREN) {
        this.pos++;
        if (this.spnl() &&
            ((dest = this.parseLinkDestination()) !== null) &&
            this.spnl() &&
            // make sure there's a space before the title:
            (reWhitespaceChar.test(this.subject.charAt(this.pos - 1)) &&
             (title = this.parseLinkTitle()) || true) &&
            this.spnl() &&
            this.peek() === C_CLOSE_PAREN) {
            this.pos += 1;
            matched = true;
        }
    } else {

        // Next, see if there's a link label
        var savepos = this.pos;
        var beforelabel = this.pos;
        var n = this.parseLinkLabel();
        if (n === 0 || n === 2) {
            // empty or missing second label
            reflabel = this.subject.slice(opener.index, startpos);
        } else {
            reflabel = this.subject.slice(beforelabel, beforelabel + n);
        }
        if (n === 0) {
            // If shortcut reference link, rewind before spaces we skipped.
            this.pos = savepos;
        }

        // lookup rawlabel in refmap
        var link = this.refmap[normalizeReference(reflabel)];
        if (link) {
            dest = link.destination;
            title = link.title;
            matched = true;
        }
    }

    if (matched) {
        var node = new Node(is_image ? 'Image' : 'Link');
        node._destination = dest;
        node._title = title || '';

        var tmp, next;
        tmp = opener.node._next;
        while (tmp) {
            next = tmp._next;
            tmp.unlink();
            node.appendChild(tmp);
            tmp = next;
        }
        block.appendChild(node);
        this.processEmphasis(opener.previous);

        opener.node.unlink();

        // processEmphasis will remove this and later delimiters.
        // Now, for a link, we also deactivate earlier link openers.
        // (no links in links)
        if (!is_image) {
          opener = this.delimiters;
          while (opener !== null) {
            if (opener.cc === C_OPEN_BRACKET) {
                opener.active = false; // deactivate this opener
            }
            opener = opener.previous;
          }
        }

        return true;

    } else { // no match

        this.removeDelimiter(opener);  // remove this opener from stack
        this.pos = startpos;
        block.appendChild(text(']'));
        return true;
    }

};

// Attempt to parse an entity.
var parseEntity = function(block) {
    var m;
    if ((m = this.match(reEntityHere))) {
        block.appendChild(text(decodeHTML(m)));
        return true;
    } else {
        return false;
    }
};

// Parse a run of ordinary characters, or a single character with
// a special meaning in markdown, as a plain string.
var parseString = function(block) {
    var m;
    if ((m = this.match(reMain))) {
        if (this.options.smart) {
            block.appendChild(text(
                m.replace(reEllipses, "\u2026")
                    .replace(reDash, function(chars) {
                        var enCount = 0;
                        var emCount = 0;
                        if (chars.length % 3 === 0) { // If divisible by 3, use all em dashes
                            emCount = chars.length / 3;
                        } else if (chars.length % 2 === 0) { // If divisible by 2, use all en dashes
                            enCount = chars.length / 2;
                        } else if (chars.length % 3 === 2) { // If 2 extra dashes, use en dash for last 2; em dashes for rest
                            enCount = 1;
                            emCount = (chars.length - 2) / 3;
                        } else { // Use en dashes for last 4 hyphens; em dashes for rest
                            enCount = 2;
                            emCount = (chars.length - 4) / 3;
                        }
                        return "\u2014".repeat(emCount) + "\u2013".repeat(enCount);
                    })));
        } else {
            block.appendChild(text(m));
        }
        return true;
    } else {
        return false;
    }
};

// Parse a newline.  If it was preceded by two spaces, return a hard
// line break; otherwise a soft line break.
var parseNewline = function(block) {
    this.pos += 1; // assume we're at a \n
    // check previous node for trailing spaces
    var lastc = block._lastChild;
    if (lastc && lastc.type === 'Text' && lastc._literal[lastc._literal.length - 1] === ' ') {
        var hardbreak = lastc._literal[lastc._literal.length - 2] === ' ';
        lastc._literal = lastc._literal.replace(reFinalSpace, '');
        block.appendChild(new Node(hardbreak ? 'Hardbreak' : 'Softbreak'));
    } else {
        block.appendChild(new Node('Softbreak'));
    }
    this.match(reInitialSpace); // gobble leading spaces in next line
    return true;
};

// Attempt to parse a link reference, modifying refmap.
var parseReference = function(s, refmap) {
    this.subject = s;
    this.pos = 0;
    var rawlabel;
    var dest;
    var title;
    var matchChars;
    var startpos = this.pos;

    // label:
    matchChars = this.parseLinkLabel();
    if (matchChars === 0) {
        return 0;
    } else {
        rawlabel = this.subject.substr(0, matchChars);
    }

    // colon:
    if (this.peek() === C_COLON) {
        this.pos++;
    } else {
        this.pos = startpos;
        return 0;
    }

    //  link url
    this.spnl();

    dest = this.parseLinkDestination();
    if (dest === null || dest.length === 0) {
        this.pos = startpos;
        return 0;
    }

    var beforetitle = this.pos;
    this.spnl();
    title = this.parseLinkTitle();
    if (title === null) {
        title = '';
        // rewind before spaces
        this.pos = beforetitle;
    }

    // make sure we're at line end:
    var atLineEnd = true;
    if (this.match(reSpaceAtEndOfLine) === null) {
        if (title === '') {
            atLineEnd = false;
        } else {
            // the potential title we found is not at the line end,
            // but it could still be a legal link reference if we
            // discard the title
            title = '';
            // rewind before spaces
            this.pos = beforetitle;
            // and instead check if the link URL is at the line end
            atLineEnd = this.match(reSpaceAtEndOfLine) !== null;
        }
    }

    if (!atLineEnd) {
        this.pos = startpos;
        return 0;
    }

    var normlabel = normalizeReference(rawlabel);
    if (normlabel === '') {
        // label must contain non-whitespace characters
        this.pos = startpos;
        return 0;
    }

    if (!refmap[normlabel]) {
        refmap[normlabel] = { destination: dest, title: title };
    }
    return this.pos - startpos;
};

// Parse the next inline element in subject, advancing subject position.
// On success, add the result to block's children and return true.
// On failure, return false.
var parseInline = function(block) {
    var res = false;
    var c = this.peek();
    if (c === -1) {
        return false;
    }
    switch(c) {
    case C_NEWLINE:
        res = this.parseNewline(block);
        break;
    case C_BACKSLASH:
        res = this.parseBackslash(block);
        break;
    case C_BACKTICK:
        res = this.parseBackticks(block);
        break;
    case C_ASTERISK:
    case C_UNDERSCORE:
        res = this.handleDelim(c, block);
        break;
    case C_SINGLEQUOTE:
    case C_DOUBLEQUOTE:
        res = this.options.smart && this.handleDelim(c, block);
        break;
    case C_OPEN_BRACKET:
        res = this.parseOpenBracket(block);
        break;
    case C_BANG:
        res = this.parseBang(block);
        break;
    case C_CLOSE_BRACKET:
        res = this.parseCloseBracket(block);
        break;
    case C_LESSTHAN:
        res = this.parseAutolink(block) || this.parseHtmlTag(block);
        break;
    case C_AMPERSAND:
        res = this.parseEntity(block);
        break;
    default:
        res = this.parseString(block);
        break;
    }
    if (!res) {
        this.pos += 1;
        block.appendChild(text(fromCodePoint(c)));
    }

    return true;
};

// Parse string content in block into inline children,
// using refmap to resolve references.
var parseInlines = function(block) {
    this.subject = block._string_content.trim();
    this.pos = 0;
    this.delimiters = null;
    while (this.parseInline(block)) {
    }
    block._string_content = null; // allow raw string to be garbage collected
    this.processEmphasis(null);
};

// The InlineParser object.
function InlineParser(options){
    return {
        subject: '',
        delimiters: null,  // used by handleDelim method
        pos: 0,
        refmap: {},
        match: match,
        peek: peek,
        spnl: spnl,
        parseBackticks: parseBackticks,
        parseBackslash: parseBackslash,
        parseAutolink: parseAutolink,
        parseHtmlTag: parseHtmlTag,
        scanDelims: scanDelims,
        handleDelim: handleDelim,
        parseLinkTitle: parseLinkTitle,
        parseLinkDestination: parseLinkDestination,
        parseLinkLabel: parseLinkLabel,
        parseOpenBracket: parseOpenBracket,
        parseCloseBracket: parseCloseBracket,
        parseBang: parseBang,
        parseEntity: parseEntity,
        parseString: parseString,
        parseNewline: parseNewline,
        parseReference: parseReference,
        parseInline: parseInline,
        processEmphasis: processEmphasis,
        removeDelimiter: removeDelimiter,
        options: options || {},
        parse: parseInlines
    };
}

module.exports = InlineParser;


/***/ }),

/***/ 562:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* The bulk of this code derives from https://github.com/dmoscrop/fold-case
But in addition to case-folding, we also normalize whitespace.

fold-case is Copyright Mathias Bynens <https://mathiasbynens.be/>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*eslint-disable  key-spacing, comma-spacing */

var regex = /[ \t\r\n]+|[A-Z\xB5\xC0-\xD6\xD8-\xDF\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u0149\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u017F\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C5\u01C7\u01C8\u01CA\u01CB\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F0-\u01F2\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0345\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03AB\u03B0\u03C2\u03CF-\u03D1\u03D5\u03D6\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F0\u03F1\u03F4\u03F5\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u0587\u10A0-\u10C5\u10C7\u10CD\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E96-\u1E9B\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F50\u1F52\u1F54\u1F56\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1F80-\u1FAF\u1FB2-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD2\u1FD3\u1FD6-\u1FDB\u1FE2-\u1FE4\u1FE6-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2126\u212A\u212B\u2132\u2160-\u216F\u2183\u24B6-\u24CF\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AD\uA7B0\uA7B1\uFB00-\uFB06\uFB13-\uFB17\uFF21-\uFF3A]|\uD801[\uDC00-\uDC27]|\uD806[\uDCA0-\uDCBF]/g;

var map = {'A':'a','B':'b','C':'c','D':'d','E':'e','F':'f','G':'g','H':'h','I':'i','J':'j','K':'k','L':'l','M':'m','N':'n','O':'o','P':'p','Q':'q','R':'r','S':'s','T':'t','U':'u','V':'v','W':'w','X':'x','Y':'y','Z':'z','\xB5':'\u03BC','\xC0':'\xE0','\xC1':'\xE1','\xC2':'\xE2','\xC3':'\xE3','\xC4':'\xE4','\xC5':'\xE5','\xC6':'\xE6','\xC7':'\xE7','\xC8':'\xE8','\xC9':'\xE9','\xCA':'\xEA','\xCB':'\xEB','\xCC':'\xEC','\xCD':'\xED','\xCE':'\xEE','\xCF':'\xEF','\xD0':'\xF0','\xD1':'\xF1','\xD2':'\xF2','\xD3':'\xF3','\xD4':'\xF4','\xD5':'\xF5','\xD6':'\xF6','\xD8':'\xF8','\xD9':'\xF9','\xDA':'\xFA','\xDB':'\xFB','\xDC':'\xFC','\xDD':'\xFD','\xDE':'\xFE','\u0100':'\u0101','\u0102':'\u0103','\u0104':'\u0105','\u0106':'\u0107','\u0108':'\u0109','\u010A':'\u010B','\u010C':'\u010D','\u010E':'\u010F','\u0110':'\u0111','\u0112':'\u0113','\u0114':'\u0115','\u0116':'\u0117','\u0118':'\u0119','\u011A':'\u011B','\u011C':'\u011D','\u011E':'\u011F','\u0120':'\u0121','\u0122':'\u0123','\u0124':'\u0125','\u0126':'\u0127','\u0128':'\u0129','\u012A':'\u012B','\u012C':'\u012D','\u012E':'\u012F','\u0132':'\u0133','\u0134':'\u0135','\u0136':'\u0137','\u0139':'\u013A','\u013B':'\u013C','\u013D':'\u013E','\u013F':'\u0140','\u0141':'\u0142','\u0143':'\u0144','\u0145':'\u0146','\u0147':'\u0148','\u014A':'\u014B','\u014C':'\u014D','\u014E':'\u014F','\u0150':'\u0151','\u0152':'\u0153','\u0154':'\u0155','\u0156':'\u0157','\u0158':'\u0159','\u015A':'\u015B','\u015C':'\u015D','\u015E':'\u015F','\u0160':'\u0161','\u0162':'\u0163','\u0164':'\u0165','\u0166':'\u0167','\u0168':'\u0169','\u016A':'\u016B','\u016C':'\u016D','\u016E':'\u016F','\u0170':'\u0171','\u0172':'\u0173','\u0174':'\u0175','\u0176':'\u0177','\u0178':'\xFF','\u0179':'\u017A','\u017B':'\u017C','\u017D':'\u017E','\u017F':'s','\u0181':'\u0253','\u0182':'\u0183','\u0184':'\u0185','\u0186':'\u0254','\u0187':'\u0188','\u0189':'\u0256','\u018A':'\u0257','\u018B':'\u018C','\u018E':'\u01DD','\u018F':'\u0259','\u0190':'\u025B','\u0191':'\u0192','\u0193':'\u0260','\u0194':'\u0263','\u0196':'\u0269','\u0197':'\u0268','\u0198':'\u0199','\u019C':'\u026F','\u019D':'\u0272','\u019F':'\u0275','\u01A0':'\u01A1','\u01A2':'\u01A3','\u01A4':'\u01A5','\u01A6':'\u0280','\u01A7':'\u01A8','\u01A9':'\u0283','\u01AC':'\u01AD','\u01AE':'\u0288','\u01AF':'\u01B0','\u01B1':'\u028A','\u01B2':'\u028B','\u01B3':'\u01B4','\u01B5':'\u01B6','\u01B7':'\u0292','\u01B8':'\u01B9','\u01BC':'\u01BD','\u01C4':'\u01C6','\u01C5':'\u01C6','\u01C7':'\u01C9','\u01C8':'\u01C9','\u01CA':'\u01CC','\u01CB':'\u01CC','\u01CD':'\u01CE','\u01CF':'\u01D0','\u01D1':'\u01D2','\u01D3':'\u01D4','\u01D5':'\u01D6','\u01D7':'\u01D8','\u01D9':'\u01DA','\u01DB':'\u01DC','\u01DE':'\u01DF','\u01E0':'\u01E1','\u01E2':'\u01E3','\u01E4':'\u01E5','\u01E6':'\u01E7','\u01E8':'\u01E9','\u01EA':'\u01EB','\u01EC':'\u01ED','\u01EE':'\u01EF','\u01F1':'\u01F3','\u01F2':'\u01F3','\u01F4':'\u01F5','\u01F6':'\u0195','\u01F7':'\u01BF','\u01F8':'\u01F9','\u01FA':'\u01FB','\u01FC':'\u01FD','\u01FE':'\u01FF','\u0200':'\u0201','\u0202':'\u0203','\u0204':'\u0205','\u0206':'\u0207','\u0208':'\u0209','\u020A':'\u020B','\u020C':'\u020D','\u020E':'\u020F','\u0210':'\u0211','\u0212':'\u0213','\u0214':'\u0215','\u0216':'\u0217','\u0218':'\u0219','\u021A':'\u021B','\u021C':'\u021D','\u021E':'\u021F','\u0220':'\u019E','\u0222':'\u0223','\u0224':'\u0225','\u0226':'\u0227','\u0228':'\u0229','\u022A':'\u022B','\u022C':'\u022D','\u022E':'\u022F','\u0230':'\u0231','\u0232':'\u0233','\u023A':'\u2C65','\u023B':'\u023C','\u023D':'\u019A','\u023E':'\u2C66','\u0241':'\u0242','\u0243':'\u0180','\u0244':'\u0289','\u0245':'\u028C','\u0246':'\u0247','\u0248':'\u0249','\u024A':'\u024B','\u024C':'\u024D','\u024E':'\u024F','\u0345':'\u03B9','\u0370':'\u0371','\u0372':'\u0373','\u0376':'\u0377','\u037F':'\u03F3','\u0386':'\u03AC','\u0388':'\u03AD','\u0389':'\u03AE','\u038A':'\u03AF','\u038C':'\u03CC','\u038E':'\u03CD','\u038F':'\u03CE','\u0391':'\u03B1','\u0392':'\u03B2','\u0393':'\u03B3','\u0394':'\u03B4','\u0395':'\u03B5','\u0396':'\u03B6','\u0397':'\u03B7','\u0398':'\u03B8','\u0399':'\u03B9','\u039A':'\u03BA','\u039B':'\u03BB','\u039C':'\u03BC','\u039D':'\u03BD','\u039E':'\u03BE','\u039F':'\u03BF','\u03A0':'\u03C0','\u03A1':'\u03C1','\u03A3':'\u03C3','\u03A4':'\u03C4','\u03A5':'\u03C5','\u03A6':'\u03C6','\u03A7':'\u03C7','\u03A8':'\u03C8','\u03A9':'\u03C9','\u03AA':'\u03CA','\u03AB':'\u03CB','\u03C2':'\u03C3','\u03CF':'\u03D7','\u03D0':'\u03B2','\u03D1':'\u03B8','\u03D5':'\u03C6','\u03D6':'\u03C0','\u03D8':'\u03D9','\u03DA':'\u03DB','\u03DC':'\u03DD','\u03DE':'\u03DF','\u03E0':'\u03E1','\u03E2':'\u03E3','\u03E4':'\u03E5','\u03E6':'\u03E7','\u03E8':'\u03E9','\u03EA':'\u03EB','\u03EC':'\u03ED','\u03EE':'\u03EF','\u03F0':'\u03BA','\u03F1':'\u03C1','\u03F4':'\u03B8','\u03F5':'\u03B5','\u03F7':'\u03F8','\u03F9':'\u03F2','\u03FA':'\u03FB','\u03FD':'\u037B','\u03FE':'\u037C','\u03FF':'\u037D','\u0400':'\u0450','\u0401':'\u0451','\u0402':'\u0452','\u0403':'\u0453','\u0404':'\u0454','\u0405':'\u0455','\u0406':'\u0456','\u0407':'\u0457','\u0408':'\u0458','\u0409':'\u0459','\u040A':'\u045A','\u040B':'\u045B','\u040C':'\u045C','\u040D':'\u045D','\u040E':'\u045E','\u040F':'\u045F','\u0410':'\u0430','\u0411':'\u0431','\u0412':'\u0432','\u0413':'\u0433','\u0414':'\u0434','\u0415':'\u0435','\u0416':'\u0436','\u0417':'\u0437','\u0418':'\u0438','\u0419':'\u0439','\u041A':'\u043A','\u041B':'\u043B','\u041C':'\u043C','\u041D':'\u043D','\u041E':'\u043E','\u041F':'\u043F','\u0420':'\u0440','\u0421':'\u0441','\u0422':'\u0442','\u0423':'\u0443','\u0424':'\u0444','\u0425':'\u0445','\u0426':'\u0446','\u0427':'\u0447','\u0428':'\u0448','\u0429':'\u0449','\u042A':'\u044A','\u042B':'\u044B','\u042C':'\u044C','\u042D':'\u044D','\u042E':'\u044E','\u042F':'\u044F','\u0460':'\u0461','\u0462':'\u0463','\u0464':'\u0465','\u0466':'\u0467','\u0468':'\u0469','\u046A':'\u046B','\u046C':'\u046D','\u046E':'\u046F','\u0470':'\u0471','\u0472':'\u0473','\u0474':'\u0475','\u0476':'\u0477','\u0478':'\u0479','\u047A':'\u047B','\u047C':'\u047D','\u047E':'\u047F','\u0480':'\u0481','\u048A':'\u048B','\u048C':'\u048D','\u048E':'\u048F','\u0490':'\u0491','\u0492':'\u0493','\u0494':'\u0495','\u0496':'\u0497','\u0498':'\u0499','\u049A':'\u049B','\u049C':'\u049D','\u049E':'\u049F','\u04A0':'\u04A1','\u04A2':'\u04A3','\u04A4':'\u04A5','\u04A6':'\u04A7','\u04A8':'\u04A9','\u04AA':'\u04AB','\u04AC':'\u04AD','\u04AE':'\u04AF','\u04B0':'\u04B1','\u04B2':'\u04B3','\u04B4':'\u04B5','\u04B6':'\u04B7','\u04B8':'\u04B9','\u04BA':'\u04BB','\u04BC':'\u04BD','\u04BE':'\u04BF','\u04C0':'\u04CF','\u04C1':'\u04C2','\u04C3':'\u04C4','\u04C5':'\u04C6','\u04C7':'\u04C8','\u04C9':'\u04CA','\u04CB':'\u04CC','\u04CD':'\u04CE','\u04D0':'\u04D1','\u04D2':'\u04D3','\u04D4':'\u04D5','\u04D6':'\u04D7','\u04D8':'\u04D9','\u04DA':'\u04DB','\u04DC':'\u04DD','\u04DE':'\u04DF','\u04E0':'\u04E1','\u04E2':'\u04E3','\u04E4':'\u04E5','\u04E6':'\u04E7','\u04E8':'\u04E9','\u04EA':'\u04EB','\u04EC':'\u04ED','\u04EE':'\u04EF','\u04F0':'\u04F1','\u04F2':'\u04F3','\u04F4':'\u04F5','\u04F6':'\u04F7','\u04F8':'\u04F9','\u04FA':'\u04FB','\u04FC':'\u04FD','\u04FE':'\u04FF','\u0500':'\u0501','\u0502':'\u0503','\u0504':'\u0505','\u0506':'\u0507','\u0508':'\u0509','\u050A':'\u050B','\u050C':'\u050D','\u050E':'\u050F','\u0510':'\u0511','\u0512':'\u0513','\u0514':'\u0515','\u0516':'\u0517','\u0518':'\u0519','\u051A':'\u051B','\u051C':'\u051D','\u051E':'\u051F','\u0520':'\u0521','\u0522':'\u0523','\u0524':'\u0525','\u0526':'\u0527','\u0528':'\u0529','\u052A':'\u052B','\u052C':'\u052D','\u052E':'\u052F','\u0531':'\u0561','\u0532':'\u0562','\u0533':'\u0563','\u0534':'\u0564','\u0535':'\u0565','\u0536':'\u0566','\u0537':'\u0567','\u0538':'\u0568','\u0539':'\u0569','\u053A':'\u056A','\u053B':'\u056B','\u053C':'\u056C','\u053D':'\u056D','\u053E':'\u056E','\u053F':'\u056F','\u0540':'\u0570','\u0541':'\u0571','\u0542':'\u0572','\u0543':'\u0573','\u0544':'\u0574','\u0545':'\u0575','\u0546':'\u0576','\u0547':'\u0577','\u0548':'\u0578','\u0549':'\u0579','\u054A':'\u057A','\u054B':'\u057B','\u054C':'\u057C','\u054D':'\u057D','\u054E':'\u057E','\u054F':'\u057F','\u0550':'\u0580','\u0551':'\u0581','\u0552':'\u0582','\u0553':'\u0583','\u0554':'\u0584','\u0555':'\u0585','\u0556':'\u0586','\u10A0':'\u2D00','\u10A1':'\u2D01','\u10A2':'\u2D02','\u10A3':'\u2D03','\u10A4':'\u2D04','\u10A5':'\u2D05','\u10A6':'\u2D06','\u10A7':'\u2D07','\u10A8':'\u2D08','\u10A9':'\u2D09','\u10AA':'\u2D0A','\u10AB':'\u2D0B','\u10AC':'\u2D0C','\u10AD':'\u2D0D','\u10AE':'\u2D0E','\u10AF':'\u2D0F','\u10B0':'\u2D10','\u10B1':'\u2D11','\u10B2':'\u2D12','\u10B3':'\u2D13','\u10B4':'\u2D14','\u10B5':'\u2D15','\u10B6':'\u2D16','\u10B7':'\u2D17','\u10B8':'\u2D18','\u10B9':'\u2D19','\u10BA':'\u2D1A','\u10BB':'\u2D1B','\u10BC':'\u2D1C','\u10BD':'\u2D1D','\u10BE':'\u2D1E','\u10BF':'\u2D1F','\u10C0':'\u2D20','\u10C1':'\u2D21','\u10C2':'\u2D22','\u10C3':'\u2D23','\u10C4':'\u2D24','\u10C5':'\u2D25','\u10C7':'\u2D27','\u10CD':'\u2D2D','\u1E00':'\u1E01','\u1E02':'\u1E03','\u1E04':'\u1E05','\u1E06':'\u1E07','\u1E08':'\u1E09','\u1E0A':'\u1E0B','\u1E0C':'\u1E0D','\u1E0E':'\u1E0F','\u1E10':'\u1E11','\u1E12':'\u1E13','\u1E14':'\u1E15','\u1E16':'\u1E17','\u1E18':'\u1E19','\u1E1A':'\u1E1B','\u1E1C':'\u1E1D','\u1E1E':'\u1E1F','\u1E20':'\u1E21','\u1E22':'\u1E23','\u1E24':'\u1E25','\u1E26':'\u1E27','\u1E28':'\u1E29','\u1E2A':'\u1E2B','\u1E2C':'\u1E2D','\u1E2E':'\u1E2F','\u1E30':'\u1E31','\u1E32':'\u1E33','\u1E34':'\u1E35','\u1E36':'\u1E37','\u1E38':'\u1E39','\u1E3A':'\u1E3B','\u1E3C':'\u1E3D','\u1E3E':'\u1E3F','\u1E40':'\u1E41','\u1E42':'\u1E43','\u1E44':'\u1E45','\u1E46':'\u1E47','\u1E48':'\u1E49','\u1E4A':'\u1E4B','\u1E4C':'\u1E4D','\u1E4E':'\u1E4F','\u1E50':'\u1E51','\u1E52':'\u1E53','\u1E54':'\u1E55','\u1E56':'\u1E57','\u1E58':'\u1E59','\u1E5A':'\u1E5B','\u1E5C':'\u1E5D','\u1E5E':'\u1E5F','\u1E60':'\u1E61','\u1E62':'\u1E63','\u1E64':'\u1E65','\u1E66':'\u1E67','\u1E68':'\u1E69','\u1E6A':'\u1E6B','\u1E6C':'\u1E6D','\u1E6E':'\u1E6F','\u1E70':'\u1E71','\u1E72':'\u1E73','\u1E74':'\u1E75','\u1E76':'\u1E77','\u1E78':'\u1E79','\u1E7A':'\u1E7B','\u1E7C':'\u1E7D','\u1E7E':'\u1E7F','\u1E80':'\u1E81','\u1E82':'\u1E83','\u1E84':'\u1E85','\u1E86':'\u1E87','\u1E88':'\u1E89','\u1E8A':'\u1E8B','\u1E8C':'\u1E8D','\u1E8E':'\u1E8F','\u1E90':'\u1E91','\u1E92':'\u1E93','\u1E94':'\u1E95','\u1E9B':'\u1E61','\u1EA0':'\u1EA1','\u1EA2':'\u1EA3','\u1EA4':'\u1EA5','\u1EA6':'\u1EA7','\u1EA8':'\u1EA9','\u1EAA':'\u1EAB','\u1EAC':'\u1EAD','\u1EAE':'\u1EAF','\u1EB0':'\u1EB1','\u1EB2':'\u1EB3','\u1EB4':'\u1EB5','\u1EB6':'\u1EB7','\u1EB8':'\u1EB9','\u1EBA':'\u1EBB','\u1EBC':'\u1EBD','\u1EBE':'\u1EBF','\u1EC0':'\u1EC1','\u1EC2':'\u1EC3','\u1EC4':'\u1EC5','\u1EC6':'\u1EC7','\u1EC8':'\u1EC9','\u1ECA':'\u1ECB','\u1ECC':'\u1ECD','\u1ECE':'\u1ECF','\u1ED0':'\u1ED1','\u1ED2':'\u1ED3','\u1ED4':'\u1ED5','\u1ED6':'\u1ED7','\u1ED8':'\u1ED9','\u1EDA':'\u1EDB','\u1EDC':'\u1EDD','\u1EDE':'\u1EDF','\u1EE0':'\u1EE1','\u1EE2':'\u1EE3','\u1EE4':'\u1EE5','\u1EE6':'\u1EE7','\u1EE8':'\u1EE9','\u1EEA':'\u1EEB','\u1EEC':'\u1EED','\u1EEE':'\u1EEF','\u1EF0':'\u1EF1','\u1EF2':'\u1EF3','\u1EF4':'\u1EF5','\u1EF6':'\u1EF7','\u1EF8':'\u1EF9','\u1EFA':'\u1EFB','\u1EFC':'\u1EFD','\u1EFE':'\u1EFF','\u1F08':'\u1F00','\u1F09':'\u1F01','\u1F0A':'\u1F02','\u1F0B':'\u1F03','\u1F0C':'\u1F04','\u1F0D':'\u1F05','\u1F0E':'\u1F06','\u1F0F':'\u1F07','\u1F18':'\u1F10','\u1F19':'\u1F11','\u1F1A':'\u1F12','\u1F1B':'\u1F13','\u1F1C':'\u1F14','\u1F1D':'\u1F15','\u1F28':'\u1F20','\u1F29':'\u1F21','\u1F2A':'\u1F22','\u1F2B':'\u1F23','\u1F2C':'\u1F24','\u1F2D':'\u1F25','\u1F2E':'\u1F26','\u1F2F':'\u1F27','\u1F38':'\u1F30','\u1F39':'\u1F31','\u1F3A':'\u1F32','\u1F3B':'\u1F33','\u1F3C':'\u1F34','\u1F3D':'\u1F35','\u1F3E':'\u1F36','\u1F3F':'\u1F37','\u1F48':'\u1F40','\u1F49':'\u1F41','\u1F4A':'\u1F42','\u1F4B':'\u1F43','\u1F4C':'\u1F44','\u1F4D':'\u1F45','\u1F59':'\u1F51','\u1F5B':'\u1F53','\u1F5D':'\u1F55','\u1F5F':'\u1F57','\u1F68':'\u1F60','\u1F69':'\u1F61','\u1F6A':'\u1F62','\u1F6B':'\u1F63','\u1F6C':'\u1F64','\u1F6D':'\u1F65','\u1F6E':'\u1F66','\u1F6F':'\u1F67','\u1FB8':'\u1FB0','\u1FB9':'\u1FB1','\u1FBA':'\u1F70','\u1FBB':'\u1F71','\u1FBE':'\u03B9','\u1FC8':'\u1F72','\u1FC9':'\u1F73','\u1FCA':'\u1F74','\u1FCB':'\u1F75','\u1FD8':'\u1FD0','\u1FD9':'\u1FD1','\u1FDA':'\u1F76','\u1FDB':'\u1F77','\u1FE8':'\u1FE0','\u1FE9':'\u1FE1','\u1FEA':'\u1F7A','\u1FEB':'\u1F7B','\u1FEC':'\u1FE5','\u1FF8':'\u1F78','\u1FF9':'\u1F79','\u1FFA':'\u1F7C','\u1FFB':'\u1F7D','\u2126':'\u03C9','\u212A':'k','\u212B':'\xE5','\u2132':'\u214E','\u2160':'\u2170','\u2161':'\u2171','\u2162':'\u2172','\u2163':'\u2173','\u2164':'\u2174','\u2165':'\u2175','\u2166':'\u2176','\u2167':'\u2177','\u2168':'\u2178','\u2169':'\u2179','\u216A':'\u217A','\u216B':'\u217B','\u216C':'\u217C','\u216D':'\u217D','\u216E':'\u217E','\u216F':'\u217F','\u2183':'\u2184','\u24B6':'\u24D0','\u24B7':'\u24D1','\u24B8':'\u24D2','\u24B9':'\u24D3','\u24BA':'\u24D4','\u24BB':'\u24D5','\u24BC':'\u24D6','\u24BD':'\u24D7','\u24BE':'\u24D8','\u24BF':'\u24D9','\u24C0':'\u24DA','\u24C1':'\u24DB','\u24C2':'\u24DC','\u24C3':'\u24DD','\u24C4':'\u24DE','\u24C5':'\u24DF','\u24C6':'\u24E0','\u24C7':'\u24E1','\u24C8':'\u24E2','\u24C9':'\u24E3','\u24CA':'\u24E4','\u24CB':'\u24E5','\u24CC':'\u24E6','\u24CD':'\u24E7','\u24CE':'\u24E8','\u24CF':'\u24E9','\u2C00':'\u2C30','\u2C01':'\u2C31','\u2C02':'\u2C32','\u2C03':'\u2C33','\u2C04':'\u2C34','\u2C05':'\u2C35','\u2C06':'\u2C36','\u2C07':'\u2C37','\u2C08':'\u2C38','\u2C09':'\u2C39','\u2C0A':'\u2C3A','\u2C0B':'\u2C3B','\u2C0C':'\u2C3C','\u2C0D':'\u2C3D','\u2C0E':'\u2C3E','\u2C0F':'\u2C3F','\u2C10':'\u2C40','\u2C11':'\u2C41','\u2C12':'\u2C42','\u2C13':'\u2C43','\u2C14':'\u2C44','\u2C15':'\u2C45','\u2C16':'\u2C46','\u2C17':'\u2C47','\u2C18':'\u2C48','\u2C19':'\u2C49','\u2C1A':'\u2C4A','\u2C1B':'\u2C4B','\u2C1C':'\u2C4C','\u2C1D':'\u2C4D','\u2C1E':'\u2C4E','\u2C1F':'\u2C4F','\u2C20':'\u2C50','\u2C21':'\u2C51','\u2C22':'\u2C52','\u2C23':'\u2C53','\u2C24':'\u2C54','\u2C25':'\u2C55','\u2C26':'\u2C56','\u2C27':'\u2C57','\u2C28':'\u2C58','\u2C29':'\u2C59','\u2C2A':'\u2C5A','\u2C2B':'\u2C5B','\u2C2C':'\u2C5C','\u2C2D':'\u2C5D','\u2C2E':'\u2C5E','\u2C60':'\u2C61','\u2C62':'\u026B','\u2C63':'\u1D7D','\u2C64':'\u027D','\u2C67':'\u2C68','\u2C69':'\u2C6A','\u2C6B':'\u2C6C','\u2C6D':'\u0251','\u2C6E':'\u0271','\u2C6F':'\u0250','\u2C70':'\u0252','\u2C72':'\u2C73','\u2C75':'\u2C76','\u2C7E':'\u023F','\u2C7F':'\u0240','\u2C80':'\u2C81','\u2C82':'\u2C83','\u2C84':'\u2C85','\u2C86':'\u2C87','\u2C88':'\u2C89','\u2C8A':'\u2C8B','\u2C8C':'\u2C8D','\u2C8E':'\u2C8F','\u2C90':'\u2C91','\u2C92':'\u2C93','\u2C94':'\u2C95','\u2C96':'\u2C97','\u2C98':'\u2C99','\u2C9A':'\u2C9B','\u2C9C':'\u2C9D','\u2C9E':'\u2C9F','\u2CA0':'\u2CA1','\u2CA2':'\u2CA3','\u2CA4':'\u2CA5','\u2CA6':'\u2CA7','\u2CA8':'\u2CA9','\u2CAA':'\u2CAB','\u2CAC':'\u2CAD','\u2CAE':'\u2CAF','\u2CB0':'\u2CB1','\u2CB2':'\u2CB3','\u2CB4':'\u2CB5','\u2CB6':'\u2CB7','\u2CB8':'\u2CB9','\u2CBA':'\u2CBB','\u2CBC':'\u2CBD','\u2CBE':'\u2CBF','\u2CC0':'\u2CC1','\u2CC2':'\u2CC3','\u2CC4':'\u2CC5','\u2CC6':'\u2CC7','\u2CC8':'\u2CC9','\u2CCA':'\u2CCB','\u2CCC':'\u2CCD','\u2CCE':'\u2CCF','\u2CD0':'\u2CD1','\u2CD2':'\u2CD3','\u2CD4':'\u2CD5','\u2CD6':'\u2CD7','\u2CD8':'\u2CD9','\u2CDA':'\u2CDB','\u2CDC':'\u2CDD','\u2CDE':'\u2CDF','\u2CE0':'\u2CE1','\u2CE2':'\u2CE3','\u2CEB':'\u2CEC','\u2CED':'\u2CEE','\u2CF2':'\u2CF3','\uA640':'\uA641','\uA642':'\uA643','\uA644':'\uA645','\uA646':'\uA647','\uA648':'\uA649','\uA64A':'\uA64B','\uA64C':'\uA64D','\uA64E':'\uA64F','\uA650':'\uA651','\uA652':'\uA653','\uA654':'\uA655','\uA656':'\uA657','\uA658':'\uA659','\uA65A':'\uA65B','\uA65C':'\uA65D','\uA65E':'\uA65F','\uA660':'\uA661','\uA662':'\uA663','\uA664':'\uA665','\uA666':'\uA667','\uA668':'\uA669','\uA66A':'\uA66B','\uA66C':'\uA66D','\uA680':'\uA681','\uA682':'\uA683','\uA684':'\uA685','\uA686':'\uA687','\uA688':'\uA689','\uA68A':'\uA68B','\uA68C':'\uA68D','\uA68E':'\uA68F','\uA690':'\uA691','\uA692':'\uA693','\uA694':'\uA695','\uA696':'\uA697','\uA698':'\uA699','\uA69A':'\uA69B','\uA722':'\uA723','\uA724':'\uA725','\uA726':'\uA727','\uA728':'\uA729','\uA72A':'\uA72B','\uA72C':'\uA72D','\uA72E':'\uA72F','\uA732':'\uA733','\uA734':'\uA735','\uA736':'\uA737','\uA738':'\uA739','\uA73A':'\uA73B','\uA73C':'\uA73D','\uA73E':'\uA73F','\uA740':'\uA741','\uA742':'\uA743','\uA744':'\uA745','\uA746':'\uA747','\uA748':'\uA749','\uA74A':'\uA74B','\uA74C':'\uA74D','\uA74E':'\uA74F','\uA750':'\uA751','\uA752':'\uA753','\uA754':'\uA755','\uA756':'\uA757','\uA758':'\uA759','\uA75A':'\uA75B','\uA75C':'\uA75D','\uA75E':'\uA75F','\uA760':'\uA761','\uA762':'\uA763','\uA764':'\uA765','\uA766':'\uA767','\uA768':'\uA769','\uA76A':'\uA76B','\uA76C':'\uA76D','\uA76E':'\uA76F','\uA779':'\uA77A','\uA77B':'\uA77C','\uA77D':'\u1D79','\uA77E':'\uA77F','\uA780':'\uA781','\uA782':'\uA783','\uA784':'\uA785','\uA786':'\uA787','\uA78B':'\uA78C','\uA78D':'\u0265','\uA790':'\uA791','\uA792':'\uA793','\uA796':'\uA797','\uA798':'\uA799','\uA79A':'\uA79B','\uA79C':'\uA79D','\uA79E':'\uA79F','\uA7A0':'\uA7A1','\uA7A2':'\uA7A3','\uA7A4':'\uA7A5','\uA7A6':'\uA7A7','\uA7A8':'\uA7A9','\uA7AA':'\u0266','\uA7AB':'\u025C','\uA7AC':'\u0261','\uA7AD':'\u026C','\uA7B0':'\u029E','\uA7B1':'\u0287','\uFF21':'\uFF41','\uFF22':'\uFF42','\uFF23':'\uFF43','\uFF24':'\uFF44','\uFF25':'\uFF45','\uFF26':'\uFF46','\uFF27':'\uFF47','\uFF28':'\uFF48','\uFF29':'\uFF49','\uFF2A':'\uFF4A','\uFF2B':'\uFF4B','\uFF2C':'\uFF4C','\uFF2D':'\uFF4D','\uFF2E':'\uFF4E','\uFF2F':'\uFF4F','\uFF30':'\uFF50','\uFF31':'\uFF51','\uFF32':'\uFF52','\uFF33':'\uFF53','\uFF34':'\uFF54','\uFF35':'\uFF55','\uFF36':'\uFF56','\uFF37':'\uFF57','\uFF38':'\uFF58','\uFF39':'\uFF59','\uFF3A':'\uFF5A','\uD801\uDC00':'\uD801\uDC28','\uD801\uDC01':'\uD801\uDC29','\uD801\uDC02':'\uD801\uDC2A','\uD801\uDC03':'\uD801\uDC2B','\uD801\uDC04':'\uD801\uDC2C','\uD801\uDC05':'\uD801\uDC2D','\uD801\uDC06':'\uD801\uDC2E','\uD801\uDC07':'\uD801\uDC2F','\uD801\uDC08':'\uD801\uDC30','\uD801\uDC09':'\uD801\uDC31','\uD801\uDC0A':'\uD801\uDC32','\uD801\uDC0B':'\uD801\uDC33','\uD801\uDC0C':'\uD801\uDC34','\uD801\uDC0D':'\uD801\uDC35','\uD801\uDC0E':'\uD801\uDC36','\uD801\uDC0F':'\uD801\uDC37','\uD801\uDC10':'\uD801\uDC38','\uD801\uDC11':'\uD801\uDC39','\uD801\uDC12':'\uD801\uDC3A','\uD801\uDC13':'\uD801\uDC3B','\uD801\uDC14':'\uD801\uDC3C','\uD801\uDC15':'\uD801\uDC3D','\uD801\uDC16':'\uD801\uDC3E','\uD801\uDC17':'\uD801\uDC3F','\uD801\uDC18':'\uD801\uDC40','\uD801\uDC19':'\uD801\uDC41','\uD801\uDC1A':'\uD801\uDC42','\uD801\uDC1B':'\uD801\uDC43','\uD801\uDC1C':'\uD801\uDC44','\uD801\uDC1D':'\uD801\uDC45','\uD801\uDC1E':'\uD801\uDC46','\uD801\uDC1F':'\uD801\uDC47','\uD801\uDC20':'\uD801\uDC48','\uD801\uDC21':'\uD801\uDC49','\uD801\uDC22':'\uD801\uDC4A','\uD801\uDC23':'\uD801\uDC4B','\uD801\uDC24':'\uD801\uDC4C','\uD801\uDC25':'\uD801\uDC4D','\uD801\uDC26':'\uD801\uDC4E','\uD801\uDC27':'\uD801\uDC4F','\uD806\uDCA0':'\uD806\uDCC0','\uD806\uDCA1':'\uD806\uDCC1','\uD806\uDCA2':'\uD806\uDCC2','\uD806\uDCA3':'\uD806\uDCC3','\uD806\uDCA4':'\uD806\uDCC4','\uD806\uDCA5':'\uD806\uDCC5','\uD806\uDCA6':'\uD806\uDCC6','\uD806\uDCA7':'\uD806\uDCC7','\uD806\uDCA8':'\uD806\uDCC8','\uD806\uDCA9':'\uD806\uDCC9','\uD806\uDCAA':'\uD806\uDCCA','\uD806\uDCAB':'\uD806\uDCCB','\uD806\uDCAC':'\uD806\uDCCC','\uD806\uDCAD':'\uD806\uDCCD','\uD806\uDCAE':'\uD806\uDCCE','\uD806\uDCAF':'\uD806\uDCCF','\uD806\uDCB0':'\uD806\uDCD0','\uD806\uDCB1':'\uD806\uDCD1','\uD806\uDCB2':'\uD806\uDCD2','\uD806\uDCB3':'\uD806\uDCD3','\uD806\uDCB4':'\uD806\uDCD4','\uD806\uDCB5':'\uD806\uDCD5','\uD806\uDCB6':'\uD806\uDCD6','\uD806\uDCB7':'\uD806\uDCD7','\uD806\uDCB8':'\uD806\uDCD8','\uD806\uDCB9':'\uD806\uDCD9','\uD806\uDCBA':'\uD806\uDCDA','\uD806\uDCBB':'\uD806\uDCDB','\uD806\uDCBC':'\uD806\uDCDC','\uD806\uDCBD':'\uD806\uDCDD','\uD806\uDCBE':'\uD806\uDCDE','\uD806\uDCBF':'\uD806\uDCDF','\xDF':'ss','\u0130':'i\u0307','\u0149':'\u02BCn','\u01F0':'j\u030C','\u0390':'\u03B9\u0308\u0301','\u03B0':'\u03C5\u0308\u0301','\u0587':'\u0565\u0582','\u1E96':'h\u0331','\u1E97':'t\u0308','\u1E98':'w\u030A','\u1E99':'y\u030A','\u1E9A':'a\u02BE','\u1E9E':'ss','\u1F50':'\u03C5\u0313','\u1F52':'\u03C5\u0313\u0300','\u1F54':'\u03C5\u0313\u0301','\u1F56':'\u03C5\u0313\u0342','\u1F80':'\u1F00\u03B9','\u1F81':'\u1F01\u03B9','\u1F82':'\u1F02\u03B9','\u1F83':'\u1F03\u03B9','\u1F84':'\u1F04\u03B9','\u1F85':'\u1F05\u03B9','\u1F86':'\u1F06\u03B9','\u1F87':'\u1F07\u03B9','\u1F88':'\u1F00\u03B9','\u1F89':'\u1F01\u03B9','\u1F8A':'\u1F02\u03B9','\u1F8B':'\u1F03\u03B9','\u1F8C':'\u1F04\u03B9','\u1F8D':'\u1F05\u03B9','\u1F8E':'\u1F06\u03B9','\u1F8F':'\u1F07\u03B9','\u1F90':'\u1F20\u03B9','\u1F91':'\u1F21\u03B9','\u1F92':'\u1F22\u03B9','\u1F93':'\u1F23\u03B9','\u1F94':'\u1F24\u03B9','\u1F95':'\u1F25\u03B9','\u1F96':'\u1F26\u03B9','\u1F97':'\u1F27\u03B9','\u1F98':'\u1F20\u03B9','\u1F99':'\u1F21\u03B9','\u1F9A':'\u1F22\u03B9','\u1F9B':'\u1F23\u03B9','\u1F9C':'\u1F24\u03B9','\u1F9D':'\u1F25\u03B9','\u1F9E':'\u1F26\u03B9','\u1F9F':'\u1F27\u03B9','\u1FA0':'\u1F60\u03B9','\u1FA1':'\u1F61\u03B9','\u1FA2':'\u1F62\u03B9','\u1FA3':'\u1F63\u03B9','\u1FA4':'\u1F64\u03B9','\u1FA5':'\u1F65\u03B9','\u1FA6':'\u1F66\u03B9','\u1FA7':'\u1F67\u03B9','\u1FA8':'\u1F60\u03B9','\u1FA9':'\u1F61\u03B9','\u1FAA':'\u1F62\u03B9','\u1FAB':'\u1F63\u03B9','\u1FAC':'\u1F64\u03B9','\u1FAD':'\u1F65\u03B9','\u1FAE':'\u1F66\u03B9','\u1FAF':'\u1F67\u03B9','\u1FB2':'\u1F70\u03B9','\u1FB3':'\u03B1\u03B9','\u1FB4':'\u03AC\u03B9','\u1FB6':'\u03B1\u0342','\u1FB7':'\u03B1\u0342\u03B9','\u1FBC':'\u03B1\u03B9','\u1FC2':'\u1F74\u03B9','\u1FC3':'\u03B7\u03B9','\u1FC4':'\u03AE\u03B9','\u1FC6':'\u03B7\u0342','\u1FC7':'\u03B7\u0342\u03B9','\u1FCC':'\u03B7\u03B9','\u1FD2':'\u03B9\u0308\u0300','\u1FD3':'\u03B9\u0308\u0301','\u1FD6':'\u03B9\u0342','\u1FD7':'\u03B9\u0308\u0342','\u1FE2':'\u03C5\u0308\u0300','\u1FE3':'\u03C5\u0308\u0301','\u1FE4':'\u03C1\u0313','\u1FE6':'\u03C5\u0342','\u1FE7':'\u03C5\u0308\u0342','\u1FF2':'\u1F7C\u03B9','\u1FF3':'\u03C9\u03B9','\u1FF4':'\u03CE\u03B9','\u1FF6':'\u03C9\u0342','\u1FF7':'\u03C9\u0342\u03B9','\u1FFC':'\u03C9\u03B9','\uFB00':'ff','\uFB01':'fi','\uFB02':'fl','\uFB03':'ffi','\uFB04':'ffl','\uFB05':'st','\uFB06':'st','\uFB13':'\u0574\u0576','\uFB14':'\u0574\u0565','\uFB15':'\u0574\u056B','\uFB16':'\u057E\u0576','\uFB17':'\u0574\u056D'};

// Normalize reference label: collapse internal whitespace
// to single space, remove leading/trailing whitespace, case fold.
module.exports = function(string) {
    return string.slice(1, string.length - 1).trim().replace(regex, function($0) {
        // Note: there is no need to check `hasOwnProperty($0)` here.
        // If character not found in lookup table, it must be whitespace.
        return map[$0] || ' ';
    });
};


/***/ }),

/***/ 563:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var escapeXml = __webpack_require__(550).escapeXml;

// Helper function to produce an XML tag.
var tag = function(name, attrs, selfclosing) {
    var result = '<' + name;
    if (attrs && attrs.length > 0) {
        var i = 0;
        var attrib;
        while ((attrib = attrs[i]) !== undefined) {
            result += ' ' + attrib[0] + '="' + attrib[1] + '"';
            i++;
        }
    }
    if (selfclosing) {
        result += ' /';
    }

    result += '>';
    return result;
};

var reXMLTag = /\<[^>]*\>/;

var toTagName = function(s) {
    return s.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
};

var renderNodes = function(block) {

    var attrs;
    var tagname;
    var walker = block.walker();
    var event, node, entering;
    var buffer = "";
    var lastOut = "\n";
    var disableTags = 0;
    var indentLevel = 0;
    var indent = '  ';
    var container;
    var selfClosing;
    var nodetype;

    var out = function(s) {
        if (disableTags > 0) {
            buffer += s.replace(reXMLTag, '');
        } else {
            buffer += s;
        }
        lastOut = s;
    };
    var esc = this.escape;
    var cr = function() {
        if (lastOut !== '\n') {
            buffer += '\n';
            lastOut = '\n';
            for (var i = indentLevel; i > 0; i--) {
                buffer += indent;
            }
        }
    };

    var options = this.options;

    if (options.time) { console.time("rendering"); }

    buffer += '<?xml version="1.0" encoding="UTF-8"?>\n';
    buffer += '<!DOCTYPE CommonMark SYSTEM "CommonMark.dtd">\n';

    while ((event = walker.next())) {
        entering = event.entering;
        node = event.node;
        nodetype = node.type;

        container = node.isContainer;
        selfClosing = nodetype === 'ThematicBreak' || nodetype === 'Hardbreak' ||
            nodetype === 'Softbreak';
        tagname = toTagName(nodetype);

        if (entering) {

            attrs = [];

            switch (nodetype) {
            case 'Document':
                attrs.push(['xmlns', 'http://commonmark.org/xml/1.0']);
                break;
            case 'List':
                if (node.listType !== null) {
                    attrs.push(['type', node.listType.toLowerCase()]);
                }
                if (node.listStart !== null) {
                    attrs.push(['start', String(node.listStart)]);
                }
                if (node.listTight !== null) {
                    attrs.push(['tight', (node.listTight ? 'true' : 'false')]);
                }
                var delim = node.listDelimiter;
                if (delim !== null) {
                    var delimword = '';
                    if (delim === '.') {
                        delimword = 'period';
                    } else {
                        delimword = 'paren';
                    }
                    attrs.push(['delimiter', delimword]);
                }
                break;
            case 'CodeBlock':
                if (node.info) {
                    attrs.push(['info', node.info]);
                }
                break;
            case 'Heading':
                attrs.push(['level', String(node.level)]);
                break;
            case 'Link':
            case 'Image':
                attrs.push(['destination', node.destination]);
                attrs.push(['title', node.title]);
                break;
            case 'CustomInline':
            case 'CustomBlock':
                attrs.push(['on_enter', node.onEnter]);
                attrs.push(['on_exit', node.onExit]);
                break;
            default:
                break;
            }
            if (options.sourcepos) {
                var pos = node.sourcepos;
                if (pos) {
                    attrs.push(['sourcepos', String(pos[0][0]) + ':' +
                                String(pos[0][1]) + '-' + String(pos[1][0]) + ':' +
                                String(pos[1][1])]);
                }
            }

            cr();
            out(tag(tagname, attrs, selfClosing));
            if (container) {
                indentLevel += 1;
            } else if (!container && !selfClosing) {
                var lit = node.literal;
                if (lit) {
                    out(esc(lit));
                }
                out(tag('/' + tagname));
            }
        } else {
            indentLevel -= 1;
            cr();
            out(tag('/' + tagname));
        }


    }
    if (options.time) { console.timeEnd("rendering"); }
    buffer += '\n';
    return buffer;
};

// The XmlRenderer object.
function XmlRenderer(options){
    return {
        // default options:
        softbreak: '\n', // by default, soft breaks are rendered as newlines in HTML
        // set to "<br />" to make them hard breaks
        // set to " " if you want to ignore line wrapping in source
        escape: escapeXml,
        options: options || {},
        render: renderNodes
    };
}

module.exports = XmlRenderer;


/***/ }),

/***/ 564:
/***/ (function(module, exports, __webpack_require__) {

var entityMap = __webpack_require__(553),
    legacyMap = __webpack_require__(568),
    xmlMap    = __webpack_require__(554),
    decodeCodePoint = __webpack_require__(565);

var decodeXMLStrict  = getStrictDecoder(xmlMap),
    decodeHTMLStrict = getStrictDecoder(entityMap);

function getStrictDecoder(map){
	var keys = Object.keys(map).join("|"),
	    replace = getReplacer(map);

	keys += "|#[xX][\\da-fA-F]+|#\\d+";

	var re = new RegExp("&(?:" + keys + ");", "g");

	return function(str){
		return String(str).replace(re, replace);
	};
}

var decodeHTML = (function(){
	var legacy = Object.keys(legacyMap)
		.sort(sorter);

	var keys = Object.keys(entityMap)
		.sort(sorter);

	for(var i = 0, j = 0; i < keys.length; i++){
		if(legacy[j] === keys[i]){
			keys[i] += ";?";
			j++;
		} else {
			keys[i] += ";";
		}
	}

	var re = new RegExp("&(?:" + keys.join("|") + "|#[xX][\\da-fA-F]+;?|#\\d+;?)", "g"),
	    replace = getReplacer(entityMap);

	function replacer(str){
		if(str.substr(-1) !== ";") str += ";";
		return replace(str);
	}

	//TODO consider creating a merged map
	return function(str){
		return String(str).replace(re, replacer);
	};
}());

function sorter(a, b){
	return a < b ? 1 : -1;
}

function getReplacer(map){
	return function replace(str){
		if(str.charAt(1) === "#"){
			if(str.charAt(2) === "X" || str.charAt(2) === "x"){
				return decodeCodePoint(parseInt(str.substr(3), 16));
			}
			return decodeCodePoint(parseInt(str.substr(2), 10));
		}
		return map[str.slice(1, -1)];
	};
}

module.exports = {
	XML: decodeXMLStrict,
	HTML: decodeHTML,
	HTMLStrict: decodeHTMLStrict
};

/***/ }),

/***/ 565:
/***/ (function(module, exports, __webpack_require__) {

var decodeMap = __webpack_require__(567);

module.exports = decodeCodePoint;

// modified version of https://github.com/mathiasbynens/he/blob/master/src/he.js#L94-L119
function decodeCodePoint(codePoint){

	if((codePoint >= 0xD800 && codePoint <= 0xDFFF) || codePoint > 0x10FFFF){
		return "\uFFFD";
	}

	if(codePoint in decodeMap){
		codePoint = decodeMap[codePoint];
	}

	var output = "";

	if(codePoint > 0xFFFF){
		codePoint -= 0x10000;
		output += String.fromCharCode(codePoint >>> 10 & 0x3FF | 0xD800);
		codePoint = 0xDC00 | codePoint & 0x3FF;
	}

	output += String.fromCharCode(codePoint);
	return output;
}


/***/ }),

/***/ 566:
/***/ (function(module, exports, __webpack_require__) {

var inverseXML = getInverseObj(__webpack_require__(554)),
    xmlReplacer = getInverseReplacer(inverseXML);

exports.XML = getInverse(inverseXML, xmlReplacer);

var inverseHTML = getInverseObj(__webpack_require__(553)),
    htmlReplacer = getInverseReplacer(inverseHTML);

exports.HTML = getInverse(inverseHTML, htmlReplacer);

function getInverseObj(obj){
	return Object.keys(obj).sort().reduce(function(inverse, name){
		inverse[obj[name]] = "&" + name + ";";
		return inverse;
	}, {});
}

function getInverseReplacer(inverse){
	var single = [],
	    multiple = [];

	Object.keys(inverse).forEach(function(k){
		if(k.length === 1){
			single.push("\\" + k);
		} else {
			multiple.push(k);
		}
	});

	//TODO add ranges
	multiple.unshift("[" + single.join("") + "]");

	return new RegExp(multiple.join("|"), "g");
}

var re_nonASCII = /[^\0-\x7F]/g,
    re_astralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

function singleCharReplacer(c){
	return "&#x" + c.charCodeAt(0).toString(16).toUpperCase() + ";";
}

function astralReplacer(c){
	// http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
	var high = c.charCodeAt(0);
	var low  = c.charCodeAt(1);
	var codePoint = (high - 0xD800) * 0x400 + low - 0xDC00 + 0x10000;
	return "&#x" + codePoint.toString(16).toUpperCase() + ";";
}

function getInverse(inverse, re){
	function func(name){
		return inverse[name];
	}

	return function(data){
		return data
				.replace(re, func)
				.replace(re_astralSymbols, astralReplacer)
				.replace(re_nonASCII, singleCharReplacer);
	};
}

var re_xmlChars = getInverseReplacer(inverseXML);

function escapeXML(data){
	return data
			.replace(re_xmlChars, singleCharReplacer)
			.replace(re_astralSymbols, astralReplacer)
			.replace(re_nonASCII, singleCharReplacer);
}

exports.escape = escapeXML;


/***/ }),

/***/ 567:
/***/ (function(module, exports) {

module.exports = {
	"0": 65533,
	"128": 8364,
	"130": 8218,
	"131": 402,
	"132": 8222,
	"133": 8230,
	"134": 8224,
	"135": 8225,
	"136": 710,
	"137": 8240,
	"138": 352,
	"139": 8249,
	"140": 338,
	"142": 381,
	"145": 8216,
	"146": 8217,
	"147": 8220,
	"148": 8221,
	"149": 8226,
	"150": 8211,
	"151": 8212,
	"152": 732,
	"153": 8482,
	"154": 353,
	"155": 8250,
	"156": 339,
	"158": 382,
	"159": 376
};

/***/ }),

/***/ 568:
/***/ (function(module, exports) {

module.exports = {
	"Aacute": "Á",
	"aacute": "á",
	"Acirc": "Â",
	"acirc": "â",
	"acute": "´",
	"AElig": "Æ",
	"aelig": "æ",
	"Agrave": "À",
	"agrave": "à",
	"amp": "&",
	"AMP": "&",
	"Aring": "Å",
	"aring": "å",
	"Atilde": "Ã",
	"atilde": "ã",
	"Auml": "Ä",
	"auml": "ä",
	"brvbar": "¦",
	"Ccedil": "Ç",
	"ccedil": "ç",
	"cedil": "¸",
	"cent": "¢",
	"copy": "©",
	"COPY": "©",
	"curren": "¤",
	"deg": "°",
	"divide": "÷",
	"Eacute": "É",
	"eacute": "é",
	"Ecirc": "Ê",
	"ecirc": "ê",
	"Egrave": "È",
	"egrave": "è",
	"ETH": "Ð",
	"eth": "ð",
	"Euml": "Ë",
	"euml": "ë",
	"frac12": "½",
	"frac14": "¼",
	"frac34": "¾",
	"gt": ">",
	"GT": ">",
	"Iacute": "Í",
	"iacute": "í",
	"Icirc": "Î",
	"icirc": "î",
	"iexcl": "¡",
	"Igrave": "Ì",
	"igrave": "ì",
	"iquest": "¿",
	"Iuml": "Ï",
	"iuml": "ï",
	"laquo": "«",
	"lt": "<",
	"LT": "<",
	"macr": "¯",
	"micro": "µ",
	"middot": "·",
	"nbsp": " ",
	"not": "¬",
	"Ntilde": "Ñ",
	"ntilde": "ñ",
	"Oacute": "Ó",
	"oacute": "ó",
	"Ocirc": "Ô",
	"ocirc": "ô",
	"Ograve": "Ò",
	"ograve": "ò",
	"ordf": "ª",
	"ordm": "º",
	"Oslash": "Ø",
	"oslash": "ø",
	"Otilde": "Õ",
	"otilde": "õ",
	"Ouml": "Ö",
	"ouml": "ö",
	"para": "¶",
	"plusmn": "±",
	"pound": "£",
	"quot": "\"",
	"QUOT": "\"",
	"raquo": "»",
	"reg": "®",
	"REG": "®",
	"sect": "§",
	"shy": "­",
	"sup1": "¹",
	"sup2": "²",
	"sup3": "³",
	"szlig": "ß",
	"THORN": "Þ",
	"thorn": "þ",
	"times": "×",
	"Uacute": "Ú",
	"uacute": "ú",
	"Ucirc": "Û",
	"ucirc": "û",
	"Ugrave": "Ù",
	"ugrave": "ù",
	"uml": "¨",
	"Uuml": "Ü",
	"uuml": "ü",
	"Yacute": "Ý",
	"yacute": "ý",
	"yen": "¥",
	"yuml": "ÿ"
};

/***/ }),

/***/ 569:
/***/ (function(module, exports) {

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object),
    nativeMax = Math.max;

/** Detect if properties shadowing those on `Object.prototype` are non-enumerable. */
var nonEnumShadows = !propertyIsEnumerable.call({ 'valueOf': 1 }, 'valueOf');

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = (isArray(value) || isArguments(value))
    ? baseTimes(value.length, String)
    : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    object[key] = value;
  }
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = array;
    return apply(func, this, otherArgs);
  };
}

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    assignValue(object, key, newValue === undefined ? source[key] : newValue);
  }
  return object;
}

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return baseRest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq(object[index], value);
  }
  return false;
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Assigns own enumerable string keyed properties of source objects to the
 * destination object. Source objects are applied from left to right.
 * Subsequent sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object` and is loosely based on
 * [`Object.assign`](https://mdn.io/Object/assign).
 *
 * @static
 * @memberOf _
 * @since 0.10.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.assignIn
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * function Bar() {
 *   this.c = 3;
 * }
 *
 * Foo.prototype.b = 2;
 * Bar.prototype.d = 4;
 *
 * _.assign({ 'a': 0 }, new Foo, new Bar);
 * // => { 'a': 1, 'c': 3 }
 */
var assign = createAssigner(function(object, source) {
  if (nonEnumShadows || isPrototype(source) || isArrayLike(source)) {
    copyObject(source, keys(source), object);
    return;
  }
  for (var key in source) {
    if (hasOwnProperty.call(source, key)) {
      assignValue(object, key, source[key]);
    }
  }
});

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

module.exports = assign;


/***/ }),

/***/ 570:
/***/ (function(module, exports) {

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) ||
      objectToString.call(value) != objectTag || isHostObject(value)) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return (typeof Ctor == 'function' &&
    Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString);
}

module.exports = isPlainObject;


/***/ }),

/***/ 571:
/***/ (function(module, exports, __webpack_require__) {

"use strict";




/* eslint-disable no-bitwise */

var decodeCache = {};

function getDecodeCache(exclude) {
  var i, ch, cache = decodeCache[exclude];
  if (cache) { return cache; }

  cache = decodeCache[exclude] = [];

  for (i = 0; i < 128; i++) {
    ch = String.fromCharCode(i);
    cache.push(ch);
  }

  for (i = 0; i < exclude.length; i++) {
    ch = exclude.charCodeAt(i);
    cache[ch] = '%' + ('0' + ch.toString(16).toUpperCase()).slice(-2);
  }

  return cache;
}


// Decode percent-encoded string.
//
function decode(string, exclude) {
  var cache;

  if (typeof exclude !== 'string') {
    exclude = decode.defaultChars;
  }

  cache = getDecodeCache(exclude);

  return string.replace(/(%[a-f0-9]{2})+/gi, function(seq) {
    var i, l, b1, b2, b3, b4, chr,
        result = '';

    for (i = 0, l = seq.length; i < l; i += 3) {
      b1 = parseInt(seq.slice(i + 1, i + 3), 16);

      if (b1 < 0x80) {
        result += cache[b1];
        continue;
      }

      if ((b1 & 0xE0) === 0xC0 && (i + 3 < l)) {
        // 110xxxxx 10xxxxxx
        b2 = parseInt(seq.slice(i + 4, i + 6), 16);

        if ((b2 & 0xC0) === 0x80) {
          chr = ((b1 << 6) & 0x7C0) | (b2 & 0x3F);

          if (chr < 0x80) {
            result += '\ufffd\ufffd';
          } else {
            result += String.fromCharCode(chr);
          }

          i += 3;
          continue;
        }
      }

      if ((b1 & 0xF0) === 0xE0 && (i + 6 < l)) {
        // 1110xxxx 10xxxxxx 10xxxxxx
        b2 = parseInt(seq.slice(i + 4, i + 6), 16);
        b3 = parseInt(seq.slice(i + 7, i + 9), 16);

        if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80) {
          chr = ((b1 << 12) & 0xF000) | ((b2 << 6) & 0xFC0) | (b3 & 0x3F);

          if (chr < 0x800 || (chr >= 0xD800 && chr <= 0xDFFF)) {
            result += '\ufffd\ufffd\ufffd';
          } else {
            result += String.fromCharCode(chr);
          }

          i += 6;
          continue;
        }
      }

      if ((b1 & 0xF8) === 0xF0 && (i + 9 < l)) {
        // 111110xx 10xxxxxx 10xxxxxx 10xxxxxx
        b2 = parseInt(seq.slice(i + 4, i + 6), 16);
        b3 = parseInt(seq.slice(i + 7, i + 9), 16);
        b4 = parseInt(seq.slice(i + 10, i + 12), 16);

        if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80 && (b4 & 0xC0) === 0x80) {
          chr = ((b1 << 18) & 0x1C0000) | ((b2 << 12) & 0x3F000) | ((b3 << 6) & 0xFC0) | (b4 & 0x3F);

          if (chr < 0x10000 || chr > 0x10FFFF) {
            result += '\ufffd\ufffd\ufffd\ufffd';
          } else {
            chr -= 0x10000;
            result += String.fromCharCode(0xD800 + (chr >> 10), 0xDC00 + (chr & 0x3FF));
          }

          i += 9;
          continue;
        }
      }

      result += '\ufffd';
    }

    return result;
  });
}


decode.defaultChars   = ';/?:@&=+$,#';
decode.componentChars = '';


module.exports = decode;


/***/ }),

/***/ 572:
/***/ (function(module, exports, __webpack_require__) {

"use strict";




var encodeCache = {};


// Create a lookup array where anything but characters in `chars` string
// and alphanumeric chars is percent-encoded.
//
function getEncodeCache(exclude) {
  var i, ch, cache = encodeCache[exclude];
  if (cache) { return cache; }

  cache = encodeCache[exclude] = [];

  for (i = 0; i < 128; i++) {
    ch = String.fromCharCode(i);

    if (/^[0-9a-z]$/i.test(ch)) {
      // always allow unencoded alphanumeric characters
      cache.push(ch);
    } else {
      cache.push('%' + ('0' + i.toString(16).toUpperCase()).slice(-2));
    }
  }

  for (i = 0; i < exclude.length; i++) {
    cache[exclude.charCodeAt(i)] = exclude[i];
  }

  return cache;
}


// Encode unsafe characters with percent-encoding, skipping already
// encoded sequences.
//
//  - string       - string to encode
//  - exclude      - list of characters to ignore (in addition to a-zA-Z0-9)
//  - keepEscaped  - don't encode '%' in a correct escape sequence (default: true)
//
function encode(string, exclude, keepEscaped) {
  var i, l, code, nextCode, cache,
      result = '';

  if (typeof exclude !== 'string') {
    // encode(string, keepEscaped)
    keepEscaped  = exclude;
    exclude = encode.defaultChars;
  }

  if (typeof keepEscaped === 'undefined') {
    keepEscaped = true;
  }

  cache = getEncodeCache(exclude);

  for (i = 0, l = string.length; i < l; i++) {
    code = string.charCodeAt(i);

    if (keepEscaped && code === 0x25 /* % */ && i + 2 < l) {
      if (/^[0-9a-f]{2}$/i.test(string.slice(i + 1, i + 3))) {
        result += string.slice(i, i + 3);
        i += 2;
        continue;
      }
    }

    if (code < 128) {
      result += cache[code];
      continue;
    }

    if (code >= 0xD800 && code <= 0xDFFF) {
      if (code >= 0xD800 && code <= 0xDBFF && i + 1 < l) {
        nextCode = string.charCodeAt(i + 1);
        if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
          result += encodeURIComponent(string[i] + string[i + 1]);
          i++;
          continue;
        }
      }
      result += '%EF%BF%BD';
      continue;
    }

    result += encodeURIComponent(string[i]);
  }

  return result;
}

encode.defaultChars   = ";/?:@&=+$,-_.!~*'()#";
encode.componentChars = "-_.!~*'()";


module.exports = encode;


/***/ }),

/***/ 573:
/***/ (function(module, exports) {

/*!
 * pascalcase <https://github.com/jonschlinkert/pascalcase>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

function pascalcase(str) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string.');
  }
  str = str.replace(/([A-Z])/g, ' $1');
  if (str.length === 1) { return str.toUpperCase(); }
  str = str.replace(/^[\W_]+|[\W_]+$/g, '').toLowerCase();
  str = str.charAt(0).toUpperCase() + str.slice(1);
  return str.replace(/[\W_]+(\w|$)/g, function (_, ch) {
    return ch.toUpperCase();
  });
}

module.exports = pascalcase;


/***/ }),

/***/ 574:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var React = __webpack_require__(12);
var Parser = __webpack_require__(560).Parser;
var ReactRenderer = __webpack_require__(556);
var propTypes = __webpack_require__(84);

function ReactMarkdown(props) {
    React.Component.call(this, props);
}

ReactMarkdown.prototype = Object.create(React.Component.prototype);
ReactMarkdown.prototype.constructor = ReactMarkdown;

ReactMarkdown.prototype.render = function() {
    var containerProps = this.props.containerProps || {};
    var renderer = new ReactRenderer(this.props);
    var parser = new Parser(this.props.parserOptions);
    var ast = parser.parse(this.props.source || '');

    if (this.props.walker) {
        var walker = ast.walker();
        var event;

        while ((event = walker.next())) {
            this.props.walker.call(this, event, walker);
        }
    }

    if (this.props.className) {
        containerProps.className = this.props.className;
    }

    return React.createElement.apply(React,
        [this.props.containerTagName, containerProps, this.props.childBefore]
            .concat(renderer.render(ast).concat(
                [this.props.childAfter]
            ))
    );
};

ReactMarkdown.propTypes = {
    className: propTypes.string,
    containerProps: propTypes.object,
    source: propTypes.string.isRequired,
    containerTagName: propTypes.string,
    childBefore: propTypes.object,
    childAfter: propTypes.object,
    sourcePos: propTypes.bool,
    escapeHtml: propTypes.bool,
    skipHtml: propTypes.bool,
    softBreak: propTypes.string,
    allowNode: propTypes.func,
    allowedTypes: propTypes.array,
    disallowedTypes: propTypes.array,
    transformLinkUri: propTypes.func,
    transformImageUri: propTypes.func,
    unwrapDisallowed: propTypes.bool,
    renderers: propTypes.object,
    walker: propTypes.func,
    parserOptions: propTypes.object
};

ReactMarkdown.defaultProps = {
    containerTagName: 'div',
    parserOptions: {}
};

ReactMarkdown.types = ReactRenderer.types;
ReactMarkdown.renderers = ReactRenderer.renderers;
ReactMarkdown.uriTransformer = ReactRenderer.uriTransformer;

module.exports = ReactMarkdown;


/***/ }),

/***/ 575:
/***/ (function(module, exports) {

/*! http://mths.be/repeat v0.2.0 by @mathias */
if (!String.prototype.repeat) {
	(function() {
		'use strict'; // needed to support `apply`/`call` with `undefined`/`null`
		var defineProperty = (function() {
			// IE 8 only supports `Object.defineProperty` on DOM elements
			try {
				var object = {};
				var $defineProperty = Object.defineProperty;
				var result = $defineProperty(object, object, object) && $defineProperty;
			} catch(error) {}
			return result;
		}());
		var repeat = function(count) {
			if (this == null) {
				throw TypeError();
			}
			var string = String(this);
			// `ToInteger`
			var n = count ? Number(count) : 0;
			if (n != n) { // better `isNaN`
				n = 0;
			}
			// Account for out-of-bounds indices
			if (n < 0 || n == Infinity) {
				throw RangeError();
			}
			var result = '';
			while (n) {
				if (n % 2 == 1) {
					result += string;
				}
				if (n > 1) {
					string += string;
				}
				n >>= 1;
			}
			return result;
		};
		if (defineProperty) {
			defineProperty(String.prototype, 'repeat', {
				'value': repeat,
				'configurable': true,
				'writable': true
			});
		} else {
			String.prototype.repeat = repeat;
		}
	}());
}


/***/ }),

/***/ 576:
/***/ (function(module, exports) {

/*
Copyright (c) 2015, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.

Authors: Nera Liu <neraliu@yahoo-inc.com>
         Adonis Fung <adon@yahoo-inc.com>
         Albert Yu <albertyu@yahoo-inc.com>
*/
/*jshint node: true */

exports._getPrivFilters = function () {

    var LT     = /</g,
        QUOT   = /"/g,
        SQUOT  = /'/g,
        AMP    = /&/g,
        NULL   = /\x00/g,
        SPECIAL_ATTR_VALUE_UNQUOTED_CHARS = /(?:^$|[\x00\x09-\x0D "'`=<>])/g,
        SPECIAL_HTML_CHARS = /[&<>"'`]/g, 
        SPECIAL_COMMENT_CHARS = /(?:\x00|^-*!?>|--!?>|--?!?$|\]>|\]$)/g;

    // CSS sensitive chars: ()"'/,!*@{}:;
    // By CSS: (Tab|NewLine|colon|semi|lpar|rpar|apos|sol|comma|excl|ast|midast);|(quot|QUOT)
    // By URI_PROTOCOL: (Tab|NewLine);
    var SENSITIVE_HTML_ENTITIES = /&(?:#([xX][0-9A-Fa-f]+|\d+);?|(Tab|NewLine|colon|semi|lpar|rpar|apos|sol|comma|excl|ast|midast|ensp|emsp|thinsp);|(nbsp|amp|AMP|lt|LT|gt|GT|quot|QUOT);?)/g,
        SENSITIVE_NAMED_REF_MAP = {Tab: '\t', NewLine: '\n', colon: ':', semi: ';', lpar: '(', rpar: ')', apos: '\'', sol: '/', comma: ',', excl: '!', ast: '*', midast: '*', ensp: '\u2002', emsp: '\u2003', thinsp: '\u2009', nbsp: '\xA0', amp: '&', lt: '<', gt: '>', quot: '"', QUOT: '"'};

    // var CSS_VALID_VALUE = 
    //     /^(?:
    //     (?!-*expression)#?[-\w]+
    //     |[+-]?(?:\d+|\d*\.\d+)(?:em|ex|ch|rem|px|mm|cm|in|pt|pc|%|vh|vw|vmin|vmax)?
    //     |!important
    //     | //empty
    //     )$/i;
    var CSS_VALID_VALUE = /^(?:(?!-*expression)#?[-\w]+|[+-]?(?:\d+|\d*\.\d+)(?:r?em|ex|ch|cm|mm|in|px|pt|pc|%|vh|vw|vmin|vmax)?|!important|)$/i,
        // TODO: prevent double css escaping by not encoding \ again, but this may require CSS decoding
        // \x7F and \x01-\x1F less \x09 are for Safari 5.0, added []{}/* for unbalanced quote
        CSS_DOUBLE_QUOTED_CHARS = /[\x00-\x1F\x7F\[\]{}\\"]/g,
        CSS_SINGLE_QUOTED_CHARS = /[\x00-\x1F\x7F\[\]{}\\']/g,
        // (, \u207D and \u208D can be used in background: 'url(...)' in IE, assumed all \ chars are encoded by QUOTED_CHARS, and null is already replaced with \uFFFD
        // otherwise, use this CSS_BLACKLIST instead (enhance it with url matching): /(?:\\?\(|[\u207D\u208D]|\\0{0,4}28 ?|\\0{0,2}20[78][Dd] ?)+/g
        CSS_BLACKLIST = /url[\(\u207D\u208D]+/g,
        // this assumes encodeURI() and encodeURIComponent() has escaped 1-32, 127 for IE8
        CSS_UNQUOTED_URL = /['\(\)]/g; // " \ treated by encodeURI()

    // Given a full URI, need to support "[" ( IPv6address ) "]" in URI as per RFC3986
    // Reference: https://tools.ietf.org/html/rfc3986
    var URL_IPV6 = /\/\/%5[Bb]([A-Fa-f0-9:]+)%5[Dd]/;


    // Reference: http://shazzer.co.uk/database/All/characters-allowd-in-html-entities
    // Reference: http://shazzer.co.uk/vector/Characters-allowed-after-ampersand-in-named-character-references
    // Reference: http://shazzer.co.uk/database/All/Characters-before-javascript-uri
    // Reference: http://shazzer.co.uk/database/All/Characters-after-javascript-uri
    // Reference: https://html.spec.whatwg.org/multipage/syntax.html#consume-a-character-reference
    // Reference for named characters: https://html.spec.whatwg.org/multipage/entities.json
    var URI_BLACKLIST_PROTOCOLS = {'javascript':1, 'data':1, 'vbscript':1, 'mhtml':1, 'x-schema':1},
        URI_PROTOCOL_COLON = /(?::|&#[xX]0*3[aA];?|&#0*58;?|&colon;)/,
        URI_PROTOCOL_WHITESPACES = /(?:^[\x00-\x20]+|[\t\n\r\x00]+)/g,
        URI_PROTOCOL_NAMED_REF_MAP = {Tab: '\t', NewLine: '\n'};

    var x, 
        strReplace = function (s, regexp, callback) {
            return s === undefined ? 'undefined'
                    : s === null            ? 'null'
                    : s.toString().replace(regexp, callback);
        },
        fromCodePoint = String.fromCodePoint || function(codePoint) {
            if (arguments.length === 0) {
                return '';
            }
            if (codePoint <= 0xFFFF) { // BMP code point
                return String.fromCharCode(codePoint);
            }

            // Astral code point; split in surrogate halves
            // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            codePoint -= 0x10000;
            return String.fromCharCode((codePoint >> 10) + 0xD800, (codePoint % 0x400) + 0xDC00);
        };


    function getProtocol(str) {
        var s = str.split(URI_PROTOCOL_COLON, 2);
        // str.length !== s[0].length is for older IE (e.g., v8), where delimeter residing at last will result in length equals 1, but not 2
        return (s[0] && (s.length === 2 || str.length !== s[0].length)) ? s[0] : null;
    }

    function htmlDecode(s, namedRefMap, reNamedRef, skipReplacement) {
        
        namedRefMap = namedRefMap || SENSITIVE_NAMED_REF_MAP;
        reNamedRef = reNamedRef || SENSITIVE_HTML_ENTITIES;

        function regExpFunction(m, num, named, named1) {
            if (num) {
                num = Number(num[0] <= '9' ? num : '0' + num);
                // switch(num) {
                //     case 0x80: return '\u20AC';  // EURO SIGN (€)
                //     case 0x82: return '\u201A';  // SINGLE LOW-9 QUOTATION MARK (‚)
                //     case 0x83: return '\u0192';  // LATIN SMALL LETTER F WITH HOOK (ƒ)
                //     case 0x84: return '\u201E';  // DOUBLE LOW-9 QUOTATION MARK („)
                //     case 0x85: return '\u2026';  // HORIZONTAL ELLIPSIS (…)
                //     case 0x86: return '\u2020';  // DAGGER (†)
                //     case 0x87: return '\u2021';  // DOUBLE DAGGER (‡)
                //     case 0x88: return '\u02C6';  // MODIFIER LETTER CIRCUMFLEX ACCENT (ˆ)
                //     case 0x89: return '\u2030';  // PER MILLE SIGN (‰)
                //     case 0x8A: return '\u0160';  // LATIN CAPITAL LETTER S WITH CARON (Š)
                //     case 0x8B: return '\u2039';  // SINGLE LEFT-POINTING ANGLE QUOTATION MARK (‹)
                //     case 0x8C: return '\u0152';  // LATIN CAPITAL LIGATURE OE (Œ)
                //     case 0x8E: return '\u017D';  // LATIN CAPITAL LETTER Z WITH CARON (Ž)
                //     case 0x91: return '\u2018';  // LEFT SINGLE QUOTATION MARK (‘)
                //     case 0x92: return '\u2019';  // RIGHT SINGLE QUOTATION MARK (’)
                //     case 0x93: return '\u201C';  // LEFT DOUBLE QUOTATION MARK (“)
                //     case 0x94: return '\u201D';  // RIGHT DOUBLE QUOTATION MARK (”)
                //     case 0x95: return '\u2022';  // BULLET (•)
                //     case 0x96: return '\u2013';  // EN DASH (–)
                //     case 0x97: return '\u2014';  // EM DASH (—)
                //     case 0x98: return '\u02DC';  // SMALL TILDE (˜)
                //     case 0x99: return '\u2122';  // TRADE MARK SIGN (™)
                //     case 0x9A: return '\u0161';  // LATIN SMALL LETTER S WITH CARON (š)
                //     case 0x9B: return '\u203A';  // SINGLE RIGHT-POINTING ANGLE QUOTATION MARK (›)
                //     case 0x9C: return '\u0153';  // LATIN SMALL LIGATURE OE (œ)
                //     case 0x9E: return '\u017E';  // LATIN SMALL LETTER Z WITH CARON (ž)
                //     case 0x9F: return '\u0178';  // LATIN CAPITAL LETTER Y WITH DIAERESIS (Ÿ)
                // }
                // // num >= 0xD800 && num <= 0xDFFF, and 0x0D is separately handled, as it doesn't fall into the range of x.pec()
                // return (num >= 0xD800 && num <= 0xDFFF) || num === 0x0D ? '\uFFFD' : x.frCoPt(num);

                return skipReplacement ? fromCodePoint(num)
                        : num === 0x80 ? '\u20AC'  // EURO SIGN (€)
                        : num === 0x82 ? '\u201A'  // SINGLE LOW-9 QUOTATION MARK (‚)
                        : num === 0x83 ? '\u0192'  // LATIN SMALL LETTER F WITH HOOK (ƒ)
                        : num === 0x84 ? '\u201E'  // DOUBLE LOW-9 QUOTATION MARK („)
                        : num === 0x85 ? '\u2026'  // HORIZONTAL ELLIPSIS (…)
                        : num === 0x86 ? '\u2020'  // DAGGER (†)
                        : num === 0x87 ? '\u2021'  // DOUBLE DAGGER (‡)
                        : num === 0x88 ? '\u02C6'  // MODIFIER LETTER CIRCUMFLEX ACCENT (ˆ)
                        : num === 0x89 ? '\u2030'  // PER MILLE SIGN (‰)
                        : num === 0x8A ? '\u0160'  // LATIN CAPITAL LETTER S WITH CARON (Š)
                        : num === 0x8B ? '\u2039'  // SINGLE LEFT-POINTING ANGLE QUOTATION MARK (‹)
                        : num === 0x8C ? '\u0152'  // LATIN CAPITAL LIGATURE OE (Œ)
                        : num === 0x8E ? '\u017D'  // LATIN CAPITAL LETTER Z WITH CARON (Ž)
                        : num === 0x91 ? '\u2018'  // LEFT SINGLE QUOTATION MARK (‘)
                        : num === 0x92 ? '\u2019'  // RIGHT SINGLE QUOTATION MARK (’)
                        : num === 0x93 ? '\u201C'  // LEFT DOUBLE QUOTATION MARK (“)
                        : num === 0x94 ? '\u201D'  // RIGHT DOUBLE QUOTATION MARK (”)
                        : num === 0x95 ? '\u2022'  // BULLET (•)
                        : num === 0x96 ? '\u2013'  // EN DASH (–)
                        : num === 0x97 ? '\u2014'  // EM DASH (—)
                        : num === 0x98 ? '\u02DC'  // SMALL TILDE (˜)
                        : num === 0x99 ? '\u2122'  // TRADE MARK SIGN (™)
                        : num === 0x9A ? '\u0161'  // LATIN SMALL LETTER S WITH CARON (š)
                        : num === 0x9B ? '\u203A'  // SINGLE RIGHT-POINTING ANGLE QUOTATION MARK (›)
                        : num === 0x9C ? '\u0153'  // LATIN SMALL LIGATURE OE (œ)
                        : num === 0x9E ? '\u017E'  // LATIN SMALL LETTER Z WITH CARON (ž)
                        : num === 0x9F ? '\u0178'  // LATIN CAPITAL LETTER Y WITH DIAERESIS (Ÿ)
                        : (num >= 0xD800 && num <= 0xDFFF) || num === 0x0D ? '\uFFFD'
                        : x.frCoPt(num);
            }
            return namedRefMap[named || named1] || m;
        }

        return s === undefined  ? 'undefined'
            : s === null        ? 'null'
            : s.toString().replace(NULL, '\uFFFD').replace(reNamedRef, regExpFunction);
    }

    function cssEncode(chr) {
        // space after \\HEX is needed by spec
        return '\\' + chr.charCodeAt(0).toString(16).toLowerCase() + ' ';
    }
    function cssBlacklist(s) {
        return s.replace(CSS_BLACKLIST, function(m){ return '-x-' + m; });
    }
    function cssUrl(s) {
        // encodeURI() in yufull() will throw error for use of the CSS_UNSUPPORTED_CODE_POINT (i.e., [\uD800-\uDFFF])
        s = x.yufull(htmlDecode(s));
        var protocol = getProtocol(s);

        // prefix ## for blacklisted protocols
        // here .replace(URI_PROTOCOL_WHITESPACES, '') is not needed since yufull has already percent-encoded the whitespaces
        return (protocol && URI_BLACKLIST_PROTOCOLS[protocol.toLowerCase()]) ? '##' + s : s;
    }

    return (x = {
        // turn invalid codePoints and that of non-characters to \uFFFD, and then fromCodePoint()
        frCoPt: function(num) {
            return num === undefined || num === null ? '' :
                !isFinite(num = Number(num)) || // `NaN`, `+Infinity`, or `-Infinity`
                num <= 0 ||                     // not a valid Unicode code point
                num > 0x10FFFF ||               // not a valid Unicode code point
                // Math.floor(num) != num || 

                (num >= 0x01 && num <= 0x08) ||
                (num >= 0x0E && num <= 0x1F) ||
                (num >= 0x7F && num <= 0x9F) ||
                (num >= 0xFDD0 && num <= 0xFDEF) ||
                
                 num === 0x0B || 
                (num & 0xFFFF) === 0xFFFF || 
                (num & 0xFFFF) === 0xFFFE ? '\uFFFD' : fromCodePoint(num);
        },
        d: htmlDecode,
        /*
         * @param {string} s - An untrusted uri input
         * @returns {string} s - null if relative url, otherwise the protocol with whitespaces stripped and lower-cased
         */
        yup: function(s) {
            s = getProtocol(s.replace(NULL, ''));
            // URI_PROTOCOL_WHITESPACES is required for left trim and remove interim whitespaces
            return s ? htmlDecode(s, URI_PROTOCOL_NAMED_REF_MAP, null, true).replace(URI_PROTOCOL_WHITESPACES, '').toLowerCase() : null;
        },

        /*
         * @deprecated
         * @param {string} s - An untrusted user input
         * @returns {string} s - The original user input with & < > " ' ` encoded respectively as &amp; &lt; &gt; &quot; &#39; and &#96;.
         *
         */
        y: function(s) {
            return strReplace(s, SPECIAL_HTML_CHARS, function (m) {
                return m === '&' ? '&amp;'
                    :  m === '<' ? '&lt;'
                    :  m === '>' ? '&gt;'
                    :  m === '"' ? '&quot;'
                    :  m === "'" ? '&#39;'
                    :  /*m === '`'*/ '&#96;';       // in hex: 60
            });
        },

        // This filter is meant to introduce double-encoding, and should be used with extra care.
        ya: function(s) {
            return strReplace(s, AMP, '&amp;');
        },

        // FOR DETAILS, refer to inHTMLData()
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#data-state
        yd: function (s) {
            return strReplace(s, LT, '&lt;');
        },

        // FOR DETAILS, refer to inHTMLComment()
        // All NULL characters in s are first replaced with \uFFFD.
        // If s contains -->, --!>, or starts with -*>, insert a space right before > to stop state breaking at <!--{{{yc s}}}-->
        // If s ends with --!, --, or -, append a space to stop collaborative state breaking at {{{yc s}}}>, {{{yc s}}}!>, {{{yc s}}}-!>, {{{yc s}}}->
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#comment-state
        // Reference: http://shazzer.co.uk/vector/Characters-that-close-a-HTML-comment-3
        // Reference: http://shazzer.co.uk/vector/Characters-that-close-a-HTML-comment
        // Reference: http://shazzer.co.uk/vector/Characters-that-close-a-HTML-comment-0021
        // If s contains ]> or ends with ], append a space after ] is verified in IE to stop IE conditional comments.
        // Reference: http://msdn.microsoft.com/en-us/library/ms537512%28v=vs.85%29.aspx
        // We do not care --\s>, which can possibly be intepreted as a valid close comment tag in very old browsers (e.g., firefox 3.6), as specified in the html4 spec
        // Reference: http://www.w3.org/TR/html401/intro/sgmltut.html#h-3.2.4
        yc: function (s) {
            return strReplace(s, SPECIAL_COMMENT_CHARS, function(m){
                return m === '\x00' ? '\uFFFD'
                    : m === '--!' || m === '--' || m === '-' || m === ']' ? m + ' '
                    :/*
                    :  m === ']>'   ? '] >'
                    :  m === '-->'  ? '-- >'
                    :  m === '--!>' ? '--! >'
                    : /-*!?>/.test(m) ? */ m.slice(0, -1) + ' >';
            });
        },

        // FOR DETAILS, refer to inDoubleQuotedAttr()
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(double-quoted)-state
        yavd: function (s) {
            return strReplace(s, QUOT, '&quot;');
        },

        // FOR DETAILS, refer to inSingleQuotedAttr()
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(single-quoted)-state
        yavs: function (s) {
            return strReplace(s, SQUOT, '&#39;');
        },

        // FOR DETAILS, refer to inUnQuotedAttr()
        // PART A.
        // if s contains any state breaking chars (\t, \n, \v, \f, \r, space, and >),
        // they are escaped and encoded into their equivalent HTML entity representations. 
        // Reference: http://shazzer.co.uk/database/All/Characters-which-break-attributes-without-quotes
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state
        //
        // PART B. 
        // if s starts with ', " or `, encode it resp. as &#39;, &quot;, or &#96; to 
        // enforce the attr value (unquoted) state
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#before-attribute-value-state
        // Reference: http://shazzer.co.uk/vector/Characters-allowed-attribute-quote
        // 
        // PART C.
        // Inject a \uFFFD character if an empty or all null string is encountered in 
        // unquoted attribute value state.
        // 
        // Rationale 1: our belief is that developers wouldn't expect an 
        //   empty string would result in ' name="passwd"' rendered as 
        //   attribute value, even though this is how HTML5 is specified.
        // Rationale 2: an empty or all null string (for IE) can 
        //   effectively alter its immediate subsequent state, we choose
        //   \uFFFD to end the unquoted attr 
        //   state, which therefore will not mess up later contexts.
        // Rationale 3: Since IE 6, it is verified that NULL chars are stripped.
        // Reference: https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state
        // 
        // Example:
        // <input value={{{yavu s}}} name="passwd"/>
        yavu: function (s) {
            return strReplace(s, SPECIAL_ATTR_VALUE_UNQUOTED_CHARS, function (m) {
                return m === '\t'   ? '&#9;'  // in hex: 09
                    :  m === '\n'   ? '&#10;' // in hex: 0A
                    :  m === '\x0B' ? '&#11;' // in hex: 0B  for IE. IE<9 \v equals v, so use \x0B instead
                    :  m === '\f'   ? '&#12;' // in hex: 0C
                    :  m === '\r'   ? '&#13;' // in hex: 0D
                    :  m === ' '    ? '&#32;' // in hex: 20
                    :  m === '='    ? '&#61;' // in hex: 3D
                    :  m === '<'    ? '&lt;'
                    :  m === '>'    ? '&gt;'
                    :  m === '"'    ? '&quot;'
                    :  m === "'"    ? '&#39;'
                    :  m === '`'    ? '&#96;'
                    : /*empty or null*/ '\uFFFD';
            });
        },

        yu: encodeURI,
        yuc: encodeURIComponent,

        // Notice that yubl MUST BE APPLIED LAST, and will not be used independently (expected output from encodeURI/encodeURIComponent and yavd/yavs/yavu)
        // This is used to disable JS execution capabilities by prefixing x- to ^javascript:, ^vbscript: or ^data: that possibly could trigger script execution in URI attribute context
        yubl: function (s) {
            return URI_BLACKLIST_PROTOCOLS[x.yup(s)] ? 'x-' + s : s;
        },

        // This is NOT a security-critical filter.
        // Reference: https://tools.ietf.org/html/rfc3986
        yufull: function (s) {
            return x.yu(s).replace(URL_IPV6, function(m, p) {
                return '//[' + p + ']';
            });
        },

        // chain yufull() with yubl()
        yublf: function (s) {
            return x.yubl(x.yufull(s));
        },

        // The design principle of the CSS filter MUST meet the following goal(s).
        // (1) The input cannot break out of the context (expr) and this is to fulfill the just sufficient encoding principle.
        // (2) The input cannot introduce CSS parsing error and this is to address the concern of UI redressing.
        //
        // term
        //   : unary_operator?
        //     [ NUMBER S* | PERCENTAGE S* | LENGTH S* | EMS S* | EXS S* | ANGLE S* |
        //     TIME S* | FREQ S* ]
        //   | STRING S* | IDENT S* | URI S* | hexcolor | function
        // 
        // Reference:
        // * http://www.w3.org/TR/CSS21/grammar.html 
        // * http://www.w3.org/TR/css-syntax-3/
        // 
        // NOTE: delimiter in CSS -  \  _  :  ;  (  )  "  '  /  ,  %  #  !  *  @  .  {  }
        //                        2d 5c 5f 3a 3b 28 29 22 27 2f 2c 25 23 21 2a 40 2e 7b 7d

        yceu: function(s) {
            s = htmlDecode(s);
            return CSS_VALID_VALUE.test(s) ? s : ";-x:'" + cssBlacklist(s.replace(CSS_SINGLE_QUOTED_CHARS, cssEncode)) + "';-v:";
        },

        // string1 = \"([^\n\r\f\\"]|\\{nl}|\\[^\n\r\f0-9a-f]|\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?)*\"
        yced: function(s) {
            return cssBlacklist(htmlDecode(s).replace(CSS_DOUBLE_QUOTED_CHARS, cssEncode));
        },

        // string2 = \'([^\n\r\f\\']|\\{nl}|\\[^\n\r\f0-9a-f]|\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?)*\'
        yces: function(s) {
            return cssBlacklist(htmlDecode(s).replace(CSS_SINGLE_QUOTED_CHARS, cssEncode));
        },

        // for url({{{yceuu url}}}
        // unquoted_url = ([!#$%&*-~]|\\{h}{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f])* (CSS 2.1 definition)
        // unquoted_url = ([^"'()\\ \t\n\r\f\v\u0000\u0008\u000b\u000e-\u001f\u007f]|\\{h}{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f])* (CSS 3.0 definition)
        // The state machine in CSS 3.0 is more well defined - http://www.w3.org/TR/css-syntax-3/#consume-a-url-token0
        // CSS_UNQUOTED_URL = /['\(\)]/g; // " \ treated by encodeURI()   
        yceuu: function(s) {
            return cssUrl(s).replace(CSS_UNQUOTED_URL, function (chr) {
                return  chr === '\''        ? '\\27 ' :
                        chr === '('         ? '%28' :
                        /* chr === ')' ? */   '%29';
            });
        },

        // for url("{{{yceud url}}}
        yceud: function(s) { 
            return cssUrl(s);
        },

        // for url('{{{yceus url}}}
        yceus: function(s) { 
            return cssUrl(s).replace(SQUOT, '\\27 ');
        }
    });
};

// exposing privFilters
// this is an undocumented feature, and please use it with extra care
var privFilters = exports._privFilters = exports._getPrivFilters();


/* chaining filters */

// uriInAttr and literally uriPathInAttr
// yubl is always used 
// Rationale: given pattern like this: <a href="{{{uriPathInDoubleQuotedAttr s}}}">
//            developer may expect s is always prefixed with ? or /, but an attacker can abuse it with 'javascript:alert(1)'
function uriInAttr (s, yav, yu) {
    return privFilters.yubl(yav((yu || privFilters.yufull)(s)));
}

/** 
* Yahoo Secure XSS Filters - just sufficient output filtering to prevent XSS!
* @module xss-filters 
*/

/**
* @function module:xss-filters#inHTMLData
*
* @param {string} s - An untrusted user input
* @returns {string} The string s with '<' encoded as '&amp;lt;'
*
* @description
* This filter is to be placed in HTML Data context to encode all '<' characters into '&amp;lt;'
* <ul>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#data-state">HTML5 Data State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <div>{{{inHTMLData htmlData}}}</div>
*
*/
exports.inHTMLData = privFilters.yd;

/**
* @function module:xss-filters#inHTMLComment
*
* @param {string} s - An untrusted user input
* @returns {string} All NULL characters in s are first replaced with \uFFFD. If s contains -->, --!>, or starts with -*>, insert a space right before > to stop state breaking at <!--{{{yc s}}}-->. If s ends with --!, --, or -, append a space to stop collaborative state breaking at {{{yc s}}}>, {{{yc s}}}!>, {{{yc s}}}-!>, {{{yc s}}}->. If s contains ]> or ends with ], append a space after ] is verified in IE to stop IE conditional comments.
*
* @description
* This filter is to be placed in HTML Comment context
* <ul>
* <li><a href="http://shazzer.co.uk/vector/Characters-that-close-a-HTML-comment-3">Shazzer - Closing comments for -.-></a>
* <li><a href="http://shazzer.co.uk/vector/Characters-that-close-a-HTML-comment">Shazzer - Closing comments for --.></a>
* <li><a href="http://shazzer.co.uk/vector/Characters-that-close-a-HTML-comment-0021">Shazzer - Closing comments for .></a>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-start-state">HTML5 Comment Start State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-start-dash-state">HTML5 Comment Start Dash State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-state">HTML5 Comment State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-end-dash-state">HTML5 Comment End Dash State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-end-state">HTML5 Comment End State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-end-bang-state">HTML5 Comment End Bang State</a></li>
* <li><a href="http://msdn.microsoft.com/en-us/library/ms537512%28v=vs.85%29.aspx">Conditional Comments in Internet Explorer</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <!-- {{{inHTMLComment html_comment}}} -->
*
*/
exports.inHTMLComment = privFilters.yc;

/**
* @function module:xss-filters#inSingleQuotedAttr
*
* @param {string} s - An untrusted user input
* @returns {string} The string s with any single-quote characters encoded into '&amp;&#39;'.
*
* @description
* <p class="warning">Warning: This is NOT designed for any onX (e.g., onclick) attributes!</p>
* <p class="warning">Warning: If you're working on URI/components, use the more specific uri___InSingleQuotedAttr filter </p>
* This filter is to be placed in HTML Attribute Value (single-quoted) state to encode all single-quote characters into '&amp;&#39;'
*
* <ul>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(single-quoted)-state">HTML5 Attribute Value (Single-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <input name='firstname' value='{{{inSingleQuotedAttr firstname}}}' />
*
*/
exports.inSingleQuotedAttr = privFilters.yavs;

/**
* @function module:xss-filters#inDoubleQuotedAttr
*
* @param {string} s - An untrusted user input
* @returns {string} The string s with any single-quote characters encoded into '&amp;&quot;'.
*
* @description
* <p class="warning">Warning: This is NOT designed for any onX (e.g., onclick) attributes!</p>
* <p class="warning">Warning: If you're working on URI/components, use the more specific uri___InDoubleQuotedAttr filter </p>
* This filter is to be placed in HTML Attribute Value (double-quoted) state to encode all single-quote characters into '&amp;&quot;'
*
* <ul>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(double-quoted)-state">HTML5 Attribute Value (Double-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <input name="firstname" value="{{{inDoubleQuotedAttr firstname}}}" />
*
*/
exports.inDoubleQuotedAttr = privFilters.yavd;

/**
* @function module:xss-filters#inUnQuotedAttr
*
* @param {string} s - An untrusted user input
* @returns {string} If s contains any state breaking chars (\t, \n, \v, \f, \r, space, null, ', ", `, <, >, and =), they are escaped and encoded into their equivalent HTML entity representations. If the string is empty, inject a \uFFFD character.
*
* @description
* <p class="warning">Warning: This is NOT designed for any onX (e.g., onclick) attributes!</p>
* <p class="warning">Warning: If you're working on URI/components, use the more specific uri___InUnQuotedAttr filter </p>
* <p>Regarding \uFFFD injection, given <a id={{{id}}} name="passwd">,<br/>
*        Rationale 1: our belief is that developers wouldn't expect when id equals an
*          empty string would result in ' name="passwd"' rendered as 
*          attribute value, even though this is how HTML5 is specified.<br/>
*        Rationale 2: an empty or all null string (for IE) can 
*          effectively alter its immediate subsequent state, we choose
*          \uFFFD to end the unquoted attr 
*          state, which therefore will not mess up later contexts.<br/>
*        Rationale 3: Since IE 6, it is verified that NULL chars are stripped.<br/>
*        Reference: https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state</p>
* <ul>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state">HTML5 Attribute Value (Unquoted) State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#before-attribute-value-state">HTML5 Before Attribute Value State</a></li>
* <li><a href="http://shazzer.co.uk/database/All/Characters-which-break-attributes-without-quotes">Shazzer - Characters-which-break-attributes-without-quotes</a></li>
* <li><a href="http://shazzer.co.uk/vector/Characters-allowed-attribute-quote">Shazzer - Characters-allowed-attribute-quote</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <input name="firstname" value={{{inUnQuotedAttr firstname}}} />
*
*/
exports.inUnQuotedAttr = privFilters.yavu;


/**
* @function module:xss-filters#uriInSingleQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly an <strong>absolute</strong> URI
* @returns {string} The string s encoded first by window.encodeURI(), then inSingleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (single-quoted) state for an <strong>absolute</strong> URI.<br/>
* The correct order of encoders is thus: first window.encodeURI(), then inSingleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* <p>Notice: This filter is IPv6 friendly by not encoding '[' and ']'.</p>
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(single-quoted)-state">HTML5 Attribute Value (Single-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href='{{{uriInSingleQuotedAttr full_uri}}}'>link</a>
* 
*/
exports.uriInSingleQuotedAttr = function (s) {
    return uriInAttr(s, privFilters.yavs);
};

/**
* @function module:xss-filters#uriInDoubleQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly an <strong>absolute</strong> URI
* @returns {string} The string s encoded first by window.encodeURI(), then inDoubleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (double-quoted) state for an <strong>absolute</strong> URI.<br/>
* The correct order of encoders is thus: first window.encodeURI(), then inDoubleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* <p>Notice: This filter is IPv6 friendly by not encoding '[' and ']'.</p>
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(double-quoted)-state">HTML5 Attribute Value (Double-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href="{{{uriInDoubleQuotedAttr full_uri}}}">link</a>
* 
*/
exports.uriInDoubleQuotedAttr = function (s) {
    return uriInAttr(s, privFilters.yavd);
};


/**
* @function module:xss-filters#uriInUnQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly an <strong>absolute</strong> URI
* @returns {string} The string s encoded first by window.encodeURI(), then inUnQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (unquoted) state for an <strong>absolute</strong> URI.<br/>
* The correct order of encoders is thus: first the built-in encodeURI(), then inUnQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* <p>Notice: This filter is IPv6 friendly by not encoding '[' and ']'.</p>
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state">HTML5 Attribute Value (Unquoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href={{{uriInUnQuotedAttr full_uri}}}>link</a>
* 
*/
exports.uriInUnQuotedAttr = function (s) {
    return uriInAttr(s, privFilters.yavu);
};

/**
* @function module:xss-filters#uriInHTMLData
*
* @param {string} s - An untrusted user input, supposedly an <strong>absolute</strong> URI
* @returns {string} The string s encoded by window.encodeURI() and then inHTMLData()
*
* @description
* This filter is to be placed in HTML Data state for an <strong>absolute</strong> URI.
*
* <p>Notice: The actual implementation skips inHTMLData(), since '<' is already encoded as '%3C' by encodeURI().</p>
* <p>Notice: This filter is IPv6 friendly by not encoding '[' and ']'.</p>
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#data-state">HTML5 Data State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href="/somewhere">{{{uriInHTMLData full_uri}}}</a>
* 
*/
exports.uriInHTMLData = privFilters.yufull;


/**
* @function module:xss-filters#uriInHTMLComment
*
* @param {string} s - An untrusted user input, supposedly an <strong>absolute</strong> URI
* @returns {string} The string s encoded by window.encodeURI(), and finally inHTMLComment()
*
* @description
* This filter is to be placed in HTML Comment state for an <strong>absolute</strong> URI.
*
* <p>Notice: This filter is IPv6 friendly by not encoding '[' and ']'.</p>
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#data-state">HTML5 Data State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-state">HTML5 Comment State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <!-- {{{uriInHTMLComment full_uri}}} -->
* 
*/
exports.uriInHTMLComment = function (s) {
    return privFilters.yc(privFilters.yufull(s));
};




/**
* @function module:xss-filters#uriPathInSingleQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Path/Query or relative URI
* @returns {string} The string s encoded first by window.encodeURI(), then inSingleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (single-quoted) state for a URI Path/Query or relative URI.<br/>
* The correct order of encoders is thus: first window.encodeURI(), then inSingleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(single-quoted)-state">HTML5 Attribute Value (Single-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href='http://example.com/{{{uriPathInSingleQuotedAttr uri_path}}}'>link</a>
* <a href='http://example.com/?{{{uriQueryInSingleQuotedAttr uri_query}}}'>link</a>
* 
*/
exports.uriPathInSingleQuotedAttr = function (s) {
    return uriInAttr(s, privFilters.yavs, privFilters.yu);
};

/**
* @function module:xss-filters#uriPathInDoubleQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Path/Query or relative URI
* @returns {string} The string s encoded first by window.encodeURI(), then inDoubleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (double-quoted) state for a URI Path/Query or relative URI.<br/>
* The correct order of encoders is thus: first window.encodeURI(), then inDoubleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(double-quoted)-state">HTML5 Attribute Value (Double-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href="http://example.com/{{{uriPathInDoubleQuotedAttr uri_path}}}">link</a>
* <a href="http://example.com/?{{{uriQueryInDoubleQuotedAttr uri_query}}}">link</a>
* 
*/
exports.uriPathInDoubleQuotedAttr = function (s) {
    return uriInAttr(s, privFilters.yavd, privFilters.yu);
};


/**
* @function module:xss-filters#uriPathInUnQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Path/Query or relative URI
* @returns {string} The string s encoded first by window.encodeURI(), then inUnQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (unquoted) state for a URI Path/Query or relative URI.<br/>
* The correct order of encoders is thus: first the built-in encodeURI(), then inUnQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state">HTML5 Attribute Value (Unquoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href=http://example.com/{{{uriPathInUnQuotedAttr uri_path}}}>link</a>
* <a href=http://example.com/?{{{uriQueryInUnQuotedAttr uri_query}}}>link</a>
* 
*/
exports.uriPathInUnQuotedAttr = function (s) {
    return uriInAttr(s, privFilters.yavu, privFilters.yu);
};

/**
* @function module:xss-filters#uriPathInHTMLData
*
* @param {string} s - An untrusted user input, supposedly a URI Path/Query or relative URI
* @returns {string} The string s encoded by window.encodeURI() and then inHTMLData()
*
* @description
* This filter is to be placed in HTML Data state for a URI Path/Query or relative URI.
*
* <p>Notice: The actual implementation skips inHTMLData(), since '<' is already encoded as '%3C' by encodeURI().</p>
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#data-state">HTML5 Data State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href="http://example.com/">http://example.com/{{{uriPathInHTMLData uri_path}}}</a>
* <a href="http://example.com/">http://example.com/?{{{uriQueryInHTMLData uri_query}}}</a>
* 
*/
exports.uriPathInHTMLData = privFilters.yu;


/**
* @function module:xss-filters#uriPathInHTMLComment
*
* @param {string} s - An untrusted user input, supposedly a URI Path/Query or relative URI
* @returns {string} The string s encoded by window.encodeURI(), and finally inHTMLComment()
*
* @description
* This filter is to be placed in HTML Comment state for a URI Path/Query or relative URI.
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI">encodeURI | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#data-state">HTML5 Data State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-state">HTML5 Comment State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <!-- http://example.com/{{{uriPathInHTMLComment uri_path}}} -->
* <!-- http://example.com/?{{{uriQueryInHTMLComment uri_query}}} -->
*/
exports.uriPathInHTMLComment = function (s) {
    return privFilters.yc(privFilters.yu(s));
};


/**
* @function module:xss-filters#uriQueryInSingleQuotedAttr
* @description This is an alias of {@link module:xss-filters#uriPathInSingleQuotedAttr}
* 
* @alias module:xss-filters#uriPathInSingleQuotedAttr
*/
exports.uriQueryInSingleQuotedAttr = exports.uriPathInSingleQuotedAttr;

/**
* @function module:xss-filters#uriQueryInDoubleQuotedAttr
* @description This is an alias of {@link module:xss-filters#uriPathInDoubleQuotedAttr}
* 
* @alias module:xss-filters#uriPathInDoubleQuotedAttr
*/
exports.uriQueryInDoubleQuotedAttr = exports.uriPathInDoubleQuotedAttr;

/**
* @function module:xss-filters#uriQueryInUnQuotedAttr
* @description This is an alias of {@link module:xss-filters#uriPathInUnQuotedAttr}
* 
* @alias module:xss-filters#uriPathInUnQuotedAttr
*/
exports.uriQueryInUnQuotedAttr = exports.uriPathInUnQuotedAttr;

/**
* @function module:xss-filters#uriQueryInHTMLData
* @description This is an alias of {@link module:xss-filters#uriPathInHTMLData}
* 
* @alias module:xss-filters#uriPathInHTMLData
*/
exports.uriQueryInHTMLData = exports.uriPathInHTMLData;

/**
* @function module:xss-filters#uriQueryInHTMLComment
* @description This is an alias of {@link module:xss-filters#uriPathInHTMLComment}
* 
* @alias module:xss-filters#uriPathInHTMLComment
*/
exports.uriQueryInHTMLComment = exports.uriPathInHTMLComment;



/**
* @function module:xss-filters#uriComponentInSingleQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Component
* @returns {string} The string s encoded first by window.encodeURIComponent(), then inSingleQuotedAttr()
*
* @description
* This filter is to be placed in HTML Attribute Value (single-quoted) state for a URI Component.<br/>
* The correct order of encoders is thus: first window.encodeURIComponent(), then inSingleQuotedAttr()
*
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(single-quoted)-state">HTML5 Attribute Value (Single-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href='http://example.com/?q={{{uriComponentInSingleQuotedAttr uri_component}}}'>link</a>
* 
*/
exports.uriComponentInSingleQuotedAttr = function (s) {
    return privFilters.yavs(privFilters.yuc(s));
};

/**
* @function module:xss-filters#uriComponentInDoubleQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Component
* @returns {string} The string s encoded first by window.encodeURIComponent(), then inDoubleQuotedAttr()
*
* @description
* This filter is to be placed in HTML Attribute Value (double-quoted) state for a URI Component.<br/>
* The correct order of encoders is thus: first window.encodeURIComponent(), then inDoubleQuotedAttr()
*
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(double-quoted)-state">HTML5 Attribute Value (Double-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href="http://example.com/?q={{{uriComponentInDoubleQuotedAttr uri_component}}}">link</a>
* 
*/
exports.uriComponentInDoubleQuotedAttr = function (s) {
    return privFilters.yavd(privFilters.yuc(s));
};


/**
* @function module:xss-filters#uriComponentInUnQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Component
* @returns {string} The string s encoded first by window.encodeURIComponent(), then inUnQuotedAttr()
*
* @description
* This filter is to be placed in HTML Attribute Value (unquoted) state for a URI Component.<br/>
* The correct order of encoders is thus: first the built-in encodeURIComponent(), then inUnQuotedAttr()
*
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state">HTML5 Attribute Value (Unquoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href=http://example.com/?q={{{uriComponentInUnQuotedAttr uri_component}}}>link</a>
* 
*/
exports.uriComponentInUnQuotedAttr = function (s) {
    return privFilters.yavu(privFilters.yuc(s));
};

/**
* @function module:xss-filters#uriComponentInHTMLData
*
* @param {string} s - An untrusted user input, supposedly a URI Component
* @returns {string} The string s encoded by window.encodeURIComponent() and then inHTMLData()
*
* @description
* This filter is to be placed in HTML Data state for a URI Component.
*
* <p>Notice: The actual implementation skips inHTMLData(), since '<' is already encoded as '%3C' by encodeURIComponent().</p>
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#data-state">HTML5 Data State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href="http://example.com/">http://example.com/?q={{{uriComponentInHTMLData uri_component}}}</a>
* <a href="http://example.com/">http://example.com/#{{{uriComponentInHTMLData uri_fragment}}}</a>
* 
*/
exports.uriComponentInHTMLData = privFilters.yuc;


/**
* @function module:xss-filters#uriComponentInHTMLComment
*
* @param {string} s - An untrusted user input, supposedly a URI Component
* @returns {string} The string s encoded by window.encodeURIComponent(), and finally inHTMLComment()
*
* @description
* This filter is to be placed in HTML Comment state for a URI Component.
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#data-state">HTML5 Data State</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#comment-state">HTML5 Comment State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <!-- http://example.com/?q={{{uriComponentInHTMLComment uri_component}}} -->
* <!-- http://example.com/#{{{uriComponentInHTMLComment uri_fragment}}} -->
*/
exports.uriComponentInHTMLComment = function (s) {
    return privFilters.yc(privFilters.yuc(s));
};


// uriFragmentInSingleQuotedAttr
// added yubl on top of uriComponentInAttr 
// Rationale: given pattern like this: <a href='{{{uriFragmentInSingleQuotedAttr s}}}'>
//            developer may expect s is always prefixed with #, but an attacker can abuse it with 'javascript:alert(1)'

/**
* @function module:xss-filters#uriFragmentInSingleQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Fragment
* @returns {string} The string s encoded first by window.encodeURIComponent(), then inSingleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (single-quoted) state for a URI Fragment.<br/>
* The correct order of encoders is thus: first window.encodeURIComponent(), then inSingleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(single-quoted)-state">HTML5 Attribute Value (Single-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href='http://example.com/#{{{uriFragmentInSingleQuotedAttr uri_fragment}}}'>link</a>
* 
*/
exports.uriFragmentInSingleQuotedAttr = function (s) {
    return privFilters.yubl(privFilters.yavs(privFilters.yuc(s)));
};

// uriFragmentInDoubleQuotedAttr
// added yubl on top of uriComponentInAttr 
// Rationale: given pattern like this: <a href="{{{uriFragmentInDoubleQuotedAttr s}}}">
//            developer may expect s is always prefixed with #, but an attacker can abuse it with 'javascript:alert(1)'

/**
* @function module:xss-filters#uriFragmentInDoubleQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Fragment
* @returns {string} The string s encoded first by window.encodeURIComponent(), then inDoubleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (double-quoted) state for a URI Fragment.<br/>
* The correct order of encoders is thus: first window.encodeURIComponent(), then inDoubleQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(double-quoted)-state">HTML5 Attribute Value (Double-Quoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href="http://example.com/#{{{uriFragmentInDoubleQuotedAttr uri_fragment}}}">link</a>
* 
*/
exports.uriFragmentInDoubleQuotedAttr = function (s) {
    return privFilters.yubl(privFilters.yavd(privFilters.yuc(s)));
};

// uriFragmentInUnQuotedAttr
// added yubl on top of uriComponentInAttr 
// Rationale: given pattern like this: <a href={{{uriFragmentInUnQuotedAttr s}}}>
//            developer may expect s is always prefixed with #, but an attacker can abuse it with 'javascript:alert(1)'

/**
* @function module:xss-filters#uriFragmentInUnQuotedAttr
*
* @param {string} s - An untrusted user input, supposedly a URI Fragment
* @returns {string} The string s encoded first by window.encodeURIComponent(), then inUnQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* @description
* This filter is to be placed in HTML Attribute Value (unquoted) state for a URI Fragment.<br/>
* The correct order of encoders is thus: first the built-in encodeURIComponent(), then inUnQuotedAttr(), and finally prefix the resulted string with 'x-' if it begins with 'javascript:' or 'vbscript:' that could possibly lead to script execution
*
* <ul>
* <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent">encodeURIComponent | MDN</a></li>
* <li><a href="http://tools.ietf.org/html/rfc3986">RFC 3986</a></li>
* <li><a href="https://html.spec.whatwg.org/multipage/syntax.html#attribute-value-(unquoted)-state">HTML5 Attribute Value (Unquoted) State</a></li>
* </ul>
*
* @example
* // output context to be applied by this filter.
* <a href=http://example.com/#{{{uriFragmentInUnQuotedAttr uri_fragment}}}>link</a>
* 
*/
exports.uriFragmentInUnQuotedAttr = function (s) {
    return privFilters.yubl(privFilters.yavu(privFilters.yuc(s)));
};


/**
* @function module:xss-filters#uriFragmentInHTMLData
* @description This is an alias of {@link module:xss-filters#uriComponentInHTMLData}
* 
* @alias module:xss-filters#uriComponentInHTMLData
*/
exports.uriFragmentInHTMLData = exports.uriComponentInHTMLData;

/**
* @function module:xss-filters#uriFragmentInHTMLComment
* @description This is an alias of {@link module:xss-filters#uriComponentInHTMLComment}
* 
* @alias module:xss-filters#uriComponentInHTMLComment
*/
exports.uriFragmentInHTMLComment = exports.uriComponentInHTMLComment;


/***/ })

})
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMC4xOTdjZmZjMWZkMzZkNzMwYTViNy5ob3QtdXBkYXRlLmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vfi9jb21tb25tYXJrL2xpYi9jb21tb24uanM/ZDkzZiIsIndlYnBhY2s6Ly8vLi9+L2NvbW1vbm1hcmsvbGliL25vZGUuanM/YmQ4YSIsIndlYnBhY2s6Ly8vLi9+L2VudGl0aWVzL2luZGV4LmpzP2Q2NzUiLCJ3ZWJwYWNrOi8vLy4vfi9lbnRpdGllcy9tYXBzL2VudGl0aWVzLmpzb24/MWJiYyIsIndlYnBhY2s6Ly8vLi9+L2VudGl0aWVzL21hcHMveG1sLmpzb24/YTE2MCIsIndlYnBhY2s6Ly8vLi9+L2NvbW1vbm1hcmstcmVhY3QtcmVuZGVyZXIvc3JjL2NvbW1vbm1hcmstcmVhY3QtcmVuZGVyZXIuanM/Nzc4OCIsIndlYnBhY2s6Ly8vLi9+L2NvbW1vbm1hcmsvbGliL2Jsb2Nrcy5qcz81M2I4Iiwid2VicGFjazovLy8uL34vY29tbW9ubWFyay9saWIvZnJvbS1jb2RlLXBvaW50LmpzPzU3MmMiLCJ3ZWJwYWNrOi8vLy4vfi9jb21tb25tYXJrL2xpYi9odG1sLmpzP2I5NzEiLCJ3ZWJwYWNrOi8vLy4vfi9jb21tb25tYXJrL2xpYi9pbmRleC5qcz9jNjYxIiwid2VicGFjazovLy8uL34vY29tbW9ubWFyay9saWIvaW5saW5lcy5qcz9jYTY3Iiwid2VicGFjazovLy8uL34vY29tbW9ubWFyay9saWIvbm9ybWFsaXplLXJlZmVyZW5jZS5qcz84YTBkIiwid2VicGFjazovLy8uL34vY29tbW9ubWFyay9saWIveG1sLmpzPzNjNGUiLCJ3ZWJwYWNrOi8vLy4vfi9lbnRpdGllcy9saWIvZGVjb2RlLmpzP2EzYjYiLCJ3ZWJwYWNrOi8vLy4vfi9lbnRpdGllcy9saWIvZGVjb2RlX2NvZGVwb2ludC5qcz85M2QyIiwid2VicGFjazovLy8uL34vZW50aXRpZXMvbGliL2VuY29kZS5qcz85ODU3Iiwid2VicGFjazovLy8uL34vZW50aXRpZXMvbWFwcy9kZWNvZGUuanNvbj85YWJhIiwid2VicGFjazovLy8uL34vZW50aXRpZXMvbWFwcy9sZWdhY3kuanNvbj8zYmEwIiwid2VicGFjazovLy8uL34vbG9kYXNoLmFzc2lnbi9pbmRleC5qcz83OGI0Iiwid2VicGFjazovLy8uL34vbG9kYXNoLmlzcGxhaW5vYmplY3QvaW5kZXguanM/YmUyOSIsIndlYnBhY2s6Ly8vLi9+L21kdXJsL2RlY29kZS5qcz9jYzYwIiwid2VicGFjazovLy8uL34vbWR1cmwvZW5jb2RlLmpzP2Q4ZTEiLCJ3ZWJwYWNrOi8vLy4vfi9wYXNjYWxjYXNlL2luZGV4LmpzPzZlMzYiLCJ3ZWJwYWNrOi8vLy4vfi9yZWFjdC1tYXJrZG93bi9zcmMvcmVhY3QtbWFya2Rvd24uanM/M2M2YSIsIndlYnBhY2s6Ly8vLi9+L3N0cmluZy5wcm90b3R5cGUucmVwZWF0L3JlcGVhdC5qcz84MjkxIiwid2VicGFjazovLy8uL34veHNzLWZpbHRlcnMvc3JjL3hzcy1maWx0ZXJzLmpzPzRhZTgiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbmNvZGUgPSByZXF1aXJlKCdtZHVybC9lbmNvZGUnKTtcbnZhciBkZWNvZGUgPSByZXF1aXJlKCdtZHVybC9kZWNvZGUnKTtcblxudmFyIENfQkFDS1NMQVNIID0gOTI7XG5cbnZhciBkZWNvZGVIVE1MID0gcmVxdWlyZSgnZW50aXRpZXMnKS5kZWNvZGVIVE1MO1xuXG52YXIgRU5USVRZID0gXCImKD86I3hbYS1mMC05XXsxLDh9fCNbMC05XXsxLDh9fFthLXpdW2EtejAtOV17MSwzMX0pO1wiO1xuXG52YXIgVEFHTkFNRSA9ICdbQS1aYS16XVtBLVphLXowLTktXSonO1xudmFyIEFUVFJJQlVURU5BTUUgPSAnW2EtekEtWl86XVthLXpBLVowLTk6Ll8tXSonO1xudmFyIFVOUVVPVEVEVkFMVUUgPSBcIlteXFxcIic9PD5gXFxcXHgwMC1cXFxceDIwXStcIjtcbnZhciBTSU5HTEVRVU9URURWQUxVRSA9IFwiJ1teJ10qJ1wiO1xudmFyIERPVUJMRVFVT1RFRFZBTFVFID0gJ1wiW15cIl0qXCInO1xudmFyIEFUVFJJQlVURVZBTFVFID0gXCIoPzpcIiArIFVOUVVPVEVEVkFMVUUgKyBcInxcIiArIFNJTkdMRVFVT1RFRFZBTFVFICsgXCJ8XCIgKyBET1VCTEVRVU9URURWQUxVRSArIFwiKVwiO1xudmFyIEFUVFJJQlVURVZBTFVFU1BFQyA9IFwiKD86XCIgKyBcIlxcXFxzKj1cIiArIFwiXFxcXHMqXCIgKyBBVFRSSUJVVEVWQUxVRSArIFwiKVwiO1xudmFyIEFUVFJJQlVURSA9IFwiKD86XCIgKyBcIlxcXFxzK1wiICsgQVRUUklCVVRFTkFNRSArIEFUVFJJQlVURVZBTFVFU1BFQyArIFwiPylcIjtcbnZhciBPUEVOVEFHID0gXCI8XCIgKyBUQUdOQU1FICsgQVRUUklCVVRFICsgXCIqXCIgKyBcIlxcXFxzKi8/PlwiO1xudmFyIENMT1NFVEFHID0gXCI8L1wiICsgVEFHTkFNRSArIFwiXFxcXHMqWz5dXCI7XG52YXIgSFRNTENPTU1FTlQgPSBcIjwhLS0tLT58PCEtLSg/Oi0/W14+LV0pKD86LT9bXi1dKSotLT5cIjtcbnZhciBQUk9DRVNTSU5HSU5TVFJVQ1RJT04gPSBcIls8XVs/XS4qP1s/XVs+XVwiO1xudmFyIERFQ0xBUkFUSU9OID0gXCI8IVtBLVpdK1wiICsgXCJcXFxccytbXj5dKj5cIjtcbnZhciBDREFUQSA9IFwiPCFcXFxcW0NEQVRBXFxcXFtbXFxcXHNcXFxcU10qP1xcXFxdXFxcXF0+XCI7XG52YXIgSFRNTFRBRyA9IFwiKD86XCIgKyBPUEVOVEFHICsgXCJ8XCIgKyBDTE9TRVRBRyArIFwifFwiICsgSFRNTENPTU1FTlQgKyBcInxcIiArXG4gICAgICAgIFBST0NFU1NJTkdJTlNUUlVDVElPTiArIFwifFwiICsgREVDTEFSQVRJT04gKyBcInxcIiArIENEQVRBICsgXCIpXCI7XG52YXIgcmVIdG1sVGFnID0gbmV3IFJlZ0V4cCgnXicgKyBIVE1MVEFHLCAnaScpO1xuXG52YXIgcmVCYWNrc2xhc2hPckFtcCA9IC9bXFxcXCZdLztcblxudmFyIEVTQ0FQQUJMRSA9ICdbIVwiIyQlJlxcJygpKissLi86Ozw9Pj9AW1xcXFxcXFxcXFxcXF1eX2B7fH1+LV0nO1xuXG52YXIgcmVFbnRpdHlPckVzY2FwZWRDaGFyID0gbmV3IFJlZ0V4cCgnXFxcXFxcXFwnICsgRVNDQVBBQkxFICsgJ3wnICsgRU5USVRZLCAnZ2knKTtcblxudmFyIFhNTFNQRUNJQUwgPSAnWyY8PlwiXSc7XG5cbnZhciByZVhtbFNwZWNpYWwgPSBuZXcgUmVnRXhwKFhNTFNQRUNJQUwsICdnJyk7XG5cbnZhciByZVhtbFNwZWNpYWxPckVudGl0eSA9IG5ldyBSZWdFeHAoRU5USVRZICsgJ3wnICsgWE1MU1BFQ0lBTCwgJ2dpJyk7XG5cbnZhciB1bmVzY2FwZUNoYXIgPSBmdW5jdGlvbihzKSB7XG4gICAgaWYgKHMuY2hhckNvZGVBdCgwKSA9PT0gQ19CQUNLU0xBU0gpIHtcbiAgICAgICAgcmV0dXJuIHMuY2hhckF0KDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBkZWNvZGVIVE1MKHMpO1xuICAgIH1cbn07XG5cbi8vIFJlcGxhY2UgZW50aXRpZXMgYW5kIGJhY2tzbGFzaCBlc2NhcGVzIHdpdGggbGl0ZXJhbCBjaGFyYWN0ZXJzLlxudmFyIHVuZXNjYXBlU3RyaW5nID0gZnVuY3Rpb24ocykge1xuICAgIGlmIChyZUJhY2tzbGFzaE9yQW1wLnRlc3QocykpIHtcbiAgICAgICAgcmV0dXJuIHMucmVwbGFjZShyZUVudGl0eU9yRXNjYXBlZENoYXIsIHVuZXNjYXBlQ2hhcik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHM7XG4gICAgfVxufTtcblxudmFyIG5vcm1hbGl6ZVVSSSA9IGZ1bmN0aW9uKHVyaSkge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBlbmNvZGUoZGVjb2RlKHVyaSkpO1xuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgICAgcmV0dXJuIHVyaTtcbiAgICB9XG59O1xuXG52YXIgcmVwbGFjZVVuc2FmZUNoYXIgPSBmdW5jdGlvbihzKSB7XG4gICAgc3dpdGNoIChzKSB7XG4gICAgY2FzZSAnJic6XG4gICAgICAgIHJldHVybiAnJmFtcDsnO1xuICAgIGNhc2UgJzwnOlxuICAgICAgICByZXR1cm4gJyZsdDsnO1xuICAgIGNhc2UgJz4nOlxuICAgICAgICByZXR1cm4gJyZndDsnO1xuICAgIGNhc2UgJ1wiJzpcbiAgICAgICAgcmV0dXJuICcmcXVvdDsnO1xuICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBzO1xuICAgIH1cbn07XG5cbnZhciBlc2NhcGVYbWwgPSBmdW5jdGlvbihzLCBwcmVzZXJ2ZV9lbnRpdGllcykge1xuICAgIGlmIChyZVhtbFNwZWNpYWwudGVzdChzKSkge1xuICAgICAgICBpZiAocHJlc2VydmVfZW50aXRpZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBzLnJlcGxhY2UocmVYbWxTcGVjaWFsT3JFbnRpdHksIHJlcGxhY2VVbnNhZmVDaGFyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzLnJlcGxhY2UocmVYbWxTcGVjaWFsLCByZXBsYWNlVW5zYWZlQ2hhcik7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcztcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHsgdW5lc2NhcGVTdHJpbmc6IHVuZXNjYXBlU3RyaW5nLFxuICAgICAgICAgICAgICAgICAgIG5vcm1hbGl6ZVVSSTogbm9ybWFsaXplVVJJLFxuICAgICAgICAgICAgICAgICAgIGVzY2FwZVhtbDogZXNjYXBlWG1sLFxuICAgICAgICAgICAgICAgICAgIHJlSHRtbFRhZzogcmVIdG1sVGFnLFxuICAgICAgICAgICAgICAgICAgIE9QRU5UQUc6IE9QRU5UQUcsXG4gICAgICAgICAgICAgICAgICAgQ0xPU0VUQUc6IENMT1NFVEFHLFxuICAgICAgICAgICAgICAgICAgIEVOVElUWTogRU5USVRZLFxuICAgICAgICAgICAgICAgICAgIEVTQ0FQQUJMRTogRVNDQVBBQkxFXG4gICAgICAgICAgICAgICAgIH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29tbW9ubWFyay9saWIvY29tbW9uLmpzXG4vLyBtb2R1bGUgaWQgPSA1NTBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIGlzQ29udGFpbmVyKG5vZGUpIHtcbiAgICBzd2l0Y2ggKG5vZGUuX3R5cGUpIHtcbiAgICBjYXNlICdEb2N1bWVudCc6XG4gICAgY2FzZSAnQmxvY2tRdW90ZSc6XG4gICAgY2FzZSAnTGlzdCc6XG4gICAgY2FzZSAnSXRlbSc6XG4gICAgY2FzZSAnUGFyYWdyYXBoJzpcbiAgICBjYXNlICdIZWFkaW5nJzpcbiAgICBjYXNlICdFbXBoJzpcbiAgICBjYXNlICdTdHJvbmcnOlxuICAgIGNhc2UgJ0xpbmsnOlxuICAgIGNhc2UgJ0ltYWdlJzpcbiAgICBjYXNlICdDdXN0b21JbmxpbmUnOlxuICAgIGNhc2UgJ0N1c3RvbUJsb2NrJzpcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxudmFyIHJlc3VtZUF0ID0gZnVuY3Rpb24obm9kZSwgZW50ZXJpbmcpIHtcbiAgICB0aGlzLmN1cnJlbnQgPSBub2RlO1xuICAgIHRoaXMuZW50ZXJpbmcgPSAoZW50ZXJpbmcgPT09IHRydWUpO1xufTtcblxudmFyIG5leHQgPSBmdW5jdGlvbigpe1xuICAgIHZhciBjdXIgPSB0aGlzLmN1cnJlbnQ7XG4gICAgdmFyIGVudGVyaW5nID0gdGhpcy5lbnRlcmluZztcblxuICAgIGlmIChjdXIgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGNvbnRhaW5lciA9IGlzQ29udGFpbmVyKGN1cik7XG5cbiAgICBpZiAoZW50ZXJpbmcgJiYgY29udGFpbmVyKSB7XG4gICAgICAgIGlmIChjdXIuX2ZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IGN1ci5fZmlyc3RDaGlsZDtcbiAgICAgICAgICAgIHRoaXMuZW50ZXJpbmcgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gc3RheSBvbiBub2RlIGJ1dCBleGl0XG4gICAgICAgICAgICB0aGlzLmVudGVyaW5nID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgIH0gZWxzZSBpZiAoY3VyID09PSB0aGlzLnJvb3QpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbnVsbDtcblxuICAgIH0gZWxzZSBpZiAoY3VyLl9uZXh0ID09PSBudWxsKSB7XG4gICAgICAgIHRoaXMuY3VycmVudCA9IGN1ci5fcGFyZW50O1xuICAgICAgICB0aGlzLmVudGVyaW5nID0gZmFsc2U7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmN1cnJlbnQgPSBjdXIuX25leHQ7XG4gICAgICAgIHRoaXMuZW50ZXJpbmcgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiB7ZW50ZXJpbmc6IGVudGVyaW5nLCBub2RlOiBjdXJ9O1xufTtcblxudmFyIE5vZGVXYWxrZXIgPSBmdW5jdGlvbihyb290KSB7XG4gICAgcmV0dXJuIHsgY3VycmVudDogcm9vdCxcbiAgICAgICAgICAgICByb290OiByb290LFxuICAgICAgICAgICAgIGVudGVyaW5nOiB0cnVlLFxuICAgICAgICAgICAgIG5leHQ6IG5leHQsXG4gICAgICAgICAgICAgcmVzdW1lQXQ6IHJlc3VtZUF0IH07XG59O1xuXG52YXIgTm9kZSA9IGZ1bmN0aW9uKG5vZGVUeXBlLCBzb3VyY2Vwb3MpIHtcbiAgICB0aGlzLl90eXBlID0gbm9kZVR5cGU7XG4gICAgdGhpcy5fcGFyZW50ID0gbnVsbDtcbiAgICB0aGlzLl9maXJzdENoaWxkID0gbnVsbDtcbiAgICB0aGlzLl9sYXN0Q2hpbGQgPSBudWxsO1xuICAgIHRoaXMuX3ByZXYgPSBudWxsO1xuICAgIHRoaXMuX25leHQgPSBudWxsO1xuICAgIHRoaXMuX3NvdXJjZXBvcyA9IHNvdXJjZXBvcztcbiAgICB0aGlzLl9sYXN0TGluZUJsYW5rID0gZmFsc2U7XG4gICAgdGhpcy5fb3BlbiA9IHRydWU7XG4gICAgdGhpcy5fc3RyaW5nX2NvbnRlbnQgPSBudWxsO1xuICAgIHRoaXMuX2xpdGVyYWwgPSBudWxsO1xuICAgIHRoaXMuX2xpc3REYXRhID0ge307XG4gICAgdGhpcy5faW5mbyA9IG51bGw7XG4gICAgdGhpcy5fZGVzdGluYXRpb24gPSBudWxsO1xuICAgIHRoaXMuX3RpdGxlID0gbnVsbDtcbiAgICB0aGlzLl9pc0ZlbmNlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2ZlbmNlQ2hhciA9IG51bGw7XG4gICAgdGhpcy5fZmVuY2VMZW5ndGggPSAwO1xuICAgIHRoaXMuX2ZlbmNlT2Zmc2V0ID0gbnVsbDtcbiAgICB0aGlzLl9sZXZlbCA9IG51bGw7XG4gICAgdGhpcy5fb25FbnRlciA9IG51bGw7XG4gICAgdGhpcy5fb25FeGl0ID0gbnVsbDtcbn07XG5cbnZhciBwcm90byA9IE5vZGUucHJvdG90eXBlO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG8sICdpc0NvbnRhaW5lcicsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGlzQ29udGFpbmVyKHRoaXMpOyB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvLCAndHlwZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5fdHlwZTsgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90bywgJ2ZpcnN0Q2hpbGQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX2ZpcnN0Q2hpbGQ7IH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG8sICdsYXN0Q2hpbGQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX2xhc3RDaGlsZDsgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90bywgJ25leHQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX25leHQ7IH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG8sICdwcmV2Jywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl9wcmV2OyB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvLCAncGFyZW50Jywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl9wYXJlbnQ7IH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG8sICdzb3VyY2Vwb3MnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX3NvdXJjZXBvczsgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90bywgJ2xpdGVyYWwnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX2xpdGVyYWw7IH0sXG4gICAgc2V0OiBmdW5jdGlvbihzKSB7IHRoaXMuX2xpdGVyYWwgPSBzOyB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvLCAnZGVzdGluYXRpb24nLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX2Rlc3RpbmF0aW9uOyB9LFxuICAgIHNldDogZnVuY3Rpb24ocykgeyB0aGlzLl9kZXN0aW5hdGlvbiA9IHM7IH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG8sICd0aXRsZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5fdGl0bGU7IH0sXG4gICAgc2V0OiBmdW5jdGlvbihzKSB7IHRoaXMuX3RpdGxlID0gczsgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90bywgJ2luZm8nLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX2luZm87IH0sXG4gICAgc2V0OiBmdW5jdGlvbihzKSB7IHRoaXMuX2luZm8gPSBzOyB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvLCAnbGV2ZWwnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX2xldmVsOyB9LFxuICAgIHNldDogZnVuY3Rpb24ocykgeyB0aGlzLl9sZXZlbCA9IHM7IH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG8sICdsaXN0VHlwZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5fbGlzdERhdGEudHlwZTsgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKHQpIHsgdGhpcy5fbGlzdERhdGEudHlwZSA9IHQ7IH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG8sICdsaXN0VGlnaHQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX2xpc3REYXRhLnRpZ2h0OyB9LFxuICAgIHNldDogZnVuY3Rpb24odCkgeyB0aGlzLl9saXN0RGF0YS50aWdodCA9IHQ7IH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG8sICdsaXN0U3RhcnQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX2xpc3REYXRhLnN0YXJ0OyB9LFxuICAgIHNldDogZnVuY3Rpb24obikgeyB0aGlzLl9saXN0RGF0YS5zdGFydCA9IG47IH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG8sICdsaXN0RGVsaW1pdGVyJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl9saXN0RGF0YS5kZWxpbWl0ZXI7IH0sXG4gICAgc2V0OiBmdW5jdGlvbihkZWxpbSkgeyB0aGlzLl9saXN0RGF0YS5kZWxpbWl0ZXIgPSBkZWxpbTsgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90bywgJ29uRW50ZXInLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX29uRW50ZXI7IH0sXG4gICAgc2V0OiBmdW5jdGlvbihzKSB7IHRoaXMuX29uRW50ZXIgPSBzOyB9XG59KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvLCAnb25FeGl0Jywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl9vbkV4aXQ7IH0sXG4gICAgc2V0OiBmdW5jdGlvbihzKSB7IHRoaXMuX29uRXhpdCA9IHM7IH1cbn0pO1xuXG5Ob2RlLnByb3RvdHlwZS5hcHBlbmRDaGlsZCA9IGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgY2hpbGQudW5saW5rKCk7XG4gICAgY2hpbGQuX3BhcmVudCA9IHRoaXM7XG4gICAgaWYgKHRoaXMuX2xhc3RDaGlsZCkge1xuICAgICAgICB0aGlzLl9sYXN0Q2hpbGQuX25leHQgPSBjaGlsZDtcbiAgICAgICAgY2hpbGQuX3ByZXYgPSB0aGlzLl9sYXN0Q2hpbGQ7XG4gICAgICAgIHRoaXMuX2xhc3RDaGlsZCA9IGNoaWxkO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2ZpcnN0Q2hpbGQgPSBjaGlsZDtcbiAgICAgICAgdGhpcy5fbGFzdENoaWxkID0gY2hpbGQ7XG4gICAgfVxufTtcblxuTm9kZS5wcm90b3R5cGUucHJlcGVuZENoaWxkID0gZnVuY3Rpb24oY2hpbGQpIHtcbiAgICBjaGlsZC51bmxpbmsoKTtcbiAgICBjaGlsZC5fcGFyZW50ID0gdGhpcztcbiAgICBpZiAodGhpcy5fZmlyc3RDaGlsZCkge1xuICAgICAgICB0aGlzLl9maXJzdENoaWxkLl9wcmV2ID0gY2hpbGQ7XG4gICAgICAgIGNoaWxkLl9uZXh0ID0gdGhpcy5fZmlyc3RDaGlsZDtcbiAgICAgICAgdGhpcy5fZmlyc3RDaGlsZCA9IGNoaWxkO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2ZpcnN0Q2hpbGQgPSBjaGlsZDtcbiAgICAgICAgdGhpcy5fbGFzdENoaWxkID0gY2hpbGQ7XG4gICAgfVxufTtcblxuTm9kZS5wcm90b3R5cGUudW5saW5rID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX3ByZXYpIHtcbiAgICAgICAgdGhpcy5fcHJldi5fbmV4dCA9IHRoaXMuX25leHQ7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9wYXJlbnQpIHtcbiAgICAgICAgdGhpcy5fcGFyZW50Ll9maXJzdENoaWxkID0gdGhpcy5fbmV4dDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX25leHQpIHtcbiAgICAgICAgdGhpcy5fbmV4dC5fcHJldiA9IHRoaXMuX3ByZXY7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9wYXJlbnQpIHtcbiAgICAgICAgdGhpcy5fcGFyZW50Ll9sYXN0Q2hpbGQgPSB0aGlzLl9wcmV2O1xuICAgIH1cbiAgICB0aGlzLl9wYXJlbnQgPSBudWxsO1xuICAgIHRoaXMuX25leHQgPSBudWxsO1xuICAgIHRoaXMuX3ByZXYgPSBudWxsO1xufTtcblxuTm9kZS5wcm90b3R5cGUuaW5zZXJ0QWZ0ZXIgPSBmdW5jdGlvbihzaWJsaW5nKSB7XG4gICAgc2libGluZy51bmxpbmsoKTtcbiAgICBzaWJsaW5nLl9uZXh0ID0gdGhpcy5fbmV4dDtcbiAgICBpZiAoc2libGluZy5fbmV4dCkge1xuICAgICAgICBzaWJsaW5nLl9uZXh0Ll9wcmV2ID0gc2libGluZztcbiAgICB9XG4gICAgc2libGluZy5fcHJldiA9IHRoaXM7XG4gICAgdGhpcy5fbmV4dCA9IHNpYmxpbmc7XG4gICAgc2libGluZy5fcGFyZW50ID0gdGhpcy5fcGFyZW50O1xuICAgIGlmICghc2libGluZy5fbmV4dCkge1xuICAgICAgICBzaWJsaW5nLl9wYXJlbnQuX2xhc3RDaGlsZCA9IHNpYmxpbmc7XG4gICAgfVxufTtcblxuTm9kZS5wcm90b3R5cGUuaW5zZXJ0QmVmb3JlID0gZnVuY3Rpb24oc2libGluZykge1xuICAgIHNpYmxpbmcudW5saW5rKCk7XG4gICAgc2libGluZy5fcHJldiA9IHRoaXMuX3ByZXY7XG4gICAgaWYgKHNpYmxpbmcuX3ByZXYpIHtcbiAgICAgICAgc2libGluZy5fcHJldi5fbmV4dCA9IHNpYmxpbmc7XG4gICAgfVxuICAgIHNpYmxpbmcuX25leHQgPSB0aGlzO1xuICAgIHRoaXMuX3ByZXYgPSBzaWJsaW5nO1xuICAgIHNpYmxpbmcuX3BhcmVudCA9IHRoaXMuX3BhcmVudDtcbiAgICBpZiAoIXNpYmxpbmcuX3ByZXYpIHtcbiAgICAgICAgc2libGluZy5fcGFyZW50Ll9maXJzdENoaWxkID0gc2libGluZztcbiAgICB9XG59O1xuXG5Ob2RlLnByb3RvdHlwZS53YWxrZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgd2Fsa2VyID0gbmV3IE5vZGVXYWxrZXIodGhpcyk7XG4gICAgcmV0dXJuIHdhbGtlcjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTm9kZTtcblxuXG4vKiBFeGFtcGxlIG9mIHVzZSBvZiB3YWxrZXI6XG5cbiB2YXIgd2Fsa2VyID0gdy53YWxrZXIoKTtcbiB2YXIgZXZlbnQ7XG5cbiB3aGlsZSAoZXZlbnQgPSB3YWxrZXIubmV4dCgpKSB7XG4gY29uc29sZS5sb2coZXZlbnQuZW50ZXJpbmcsIGV2ZW50Lm5vZGUudHlwZSk7XG4gfVxuXG4gKi9cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb21tb25tYXJrL2xpYi9ub2RlLmpzXG4vLyBtb2R1bGUgaWQgPSA1NTFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGVuY29kZSA9IHJlcXVpcmUoXCIuL2xpYi9lbmNvZGUuanNcIiksXG4gICAgZGVjb2RlID0gcmVxdWlyZShcIi4vbGliL2RlY29kZS5qc1wiKTtcblxuZXhwb3J0cy5kZWNvZGUgPSBmdW5jdGlvbihkYXRhLCBsZXZlbCl7XG5cdHJldHVybiAoIWxldmVsIHx8IGxldmVsIDw9IDAgPyBkZWNvZGUuWE1MIDogZGVjb2RlLkhUTUwpKGRhdGEpO1xufTtcblxuZXhwb3J0cy5kZWNvZGVTdHJpY3QgPSBmdW5jdGlvbihkYXRhLCBsZXZlbCl7XG5cdHJldHVybiAoIWxldmVsIHx8IGxldmVsIDw9IDAgPyBkZWNvZGUuWE1MIDogZGVjb2RlLkhUTUxTdHJpY3QpKGRhdGEpO1xufTtcblxuZXhwb3J0cy5lbmNvZGUgPSBmdW5jdGlvbihkYXRhLCBsZXZlbCl7XG5cdHJldHVybiAoIWxldmVsIHx8IGxldmVsIDw9IDAgPyBlbmNvZGUuWE1MIDogZW5jb2RlLkhUTUwpKGRhdGEpO1xufTtcblxuZXhwb3J0cy5lbmNvZGVYTUwgPSBlbmNvZGUuWE1MO1xuXG5leHBvcnRzLmVuY29kZUhUTUw0ID1cbmV4cG9ydHMuZW5jb2RlSFRNTDUgPVxuZXhwb3J0cy5lbmNvZGVIVE1MICA9IGVuY29kZS5IVE1MO1xuXG5leHBvcnRzLmRlY29kZVhNTCA9XG5leHBvcnRzLmRlY29kZVhNTFN0cmljdCA9IGRlY29kZS5YTUw7XG5cbmV4cG9ydHMuZGVjb2RlSFRNTDQgPVxuZXhwb3J0cy5kZWNvZGVIVE1MNSA9XG5leHBvcnRzLmRlY29kZUhUTUwgPSBkZWNvZGUuSFRNTDtcblxuZXhwb3J0cy5kZWNvZGVIVE1MNFN0cmljdCA9XG5leHBvcnRzLmRlY29kZUhUTUw1U3RyaWN0ID1cbmV4cG9ydHMuZGVjb2RlSFRNTFN0cmljdCA9IGRlY29kZS5IVE1MU3RyaWN0O1xuXG5leHBvcnRzLmVzY2FwZSA9IGVuY29kZS5lc2NhcGU7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vZW50aXRpZXMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDU1MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IHtcblx0XCJBYWN1dGVcIjogXCLDgVwiLFxuXHRcImFhY3V0ZVwiOiBcIsOhXCIsXG5cdFwiQWJyZXZlXCI6IFwixIJcIixcblx0XCJhYnJldmVcIjogXCLEg1wiLFxuXHRcImFjXCI6IFwi4oi+XCIsXG5cdFwiYWNkXCI6IFwi4oi/XCIsXG5cdFwiYWNFXCI6IFwi4oi+zLNcIixcblx0XCJBY2lyY1wiOiBcIsOCXCIsXG5cdFwiYWNpcmNcIjogXCLDolwiLFxuXHRcImFjdXRlXCI6IFwiwrRcIixcblx0XCJBY3lcIjogXCLQkFwiLFxuXHRcImFjeVwiOiBcItCwXCIsXG5cdFwiQUVsaWdcIjogXCLDhlwiLFxuXHRcImFlbGlnXCI6IFwiw6ZcIixcblx0XCJhZlwiOiBcIuKBoVwiLFxuXHRcIkFmclwiOiBcIvCdlIRcIixcblx0XCJhZnJcIjogXCLwnZSeXCIsXG5cdFwiQWdyYXZlXCI6IFwiw4BcIixcblx0XCJhZ3JhdmVcIjogXCLDoFwiLFxuXHRcImFsZWZzeW1cIjogXCLihLVcIixcblx0XCJhbGVwaFwiOiBcIuKEtVwiLFxuXHRcIkFscGhhXCI6IFwizpFcIixcblx0XCJhbHBoYVwiOiBcIs6xXCIsXG5cdFwiQW1hY3JcIjogXCLEgFwiLFxuXHRcImFtYWNyXCI6IFwixIFcIixcblx0XCJhbWFsZ1wiOiBcIuKov1wiLFxuXHRcImFtcFwiOiBcIiZcIixcblx0XCJBTVBcIjogXCImXCIsXG5cdFwiYW5kYW5kXCI6IFwi4qmVXCIsXG5cdFwiQW5kXCI6IFwi4qmTXCIsXG5cdFwiYW5kXCI6IFwi4oinXCIsXG5cdFwiYW5kZFwiOiBcIuKpnFwiLFxuXHRcImFuZHNsb3BlXCI6IFwi4qmYXCIsXG5cdFwiYW5kdlwiOiBcIuKpmlwiLFxuXHRcImFuZ1wiOiBcIuKIoFwiLFxuXHRcImFuZ2VcIjogXCLipqRcIixcblx0XCJhbmdsZVwiOiBcIuKIoFwiLFxuXHRcImFuZ21zZGFhXCI6IFwi4qaoXCIsXG5cdFwiYW5nbXNkYWJcIjogXCLipqlcIixcblx0XCJhbmdtc2RhY1wiOiBcIuKmqlwiLFxuXHRcImFuZ21zZGFkXCI6IFwi4qarXCIsXG5cdFwiYW5nbXNkYWVcIjogXCLipqxcIixcblx0XCJhbmdtc2RhZlwiOiBcIuKmrVwiLFxuXHRcImFuZ21zZGFnXCI6IFwi4qauXCIsXG5cdFwiYW5nbXNkYWhcIjogXCLipq9cIixcblx0XCJhbmdtc2RcIjogXCLiiKFcIixcblx0XCJhbmdydFwiOiBcIuKIn1wiLFxuXHRcImFuZ3J0dmJcIjogXCLiir5cIixcblx0XCJhbmdydHZiZFwiOiBcIuKmnVwiLFxuXHRcImFuZ3NwaFwiOiBcIuKIolwiLFxuXHRcImFuZ3N0XCI6IFwiw4VcIixcblx0XCJhbmd6YXJyXCI6IFwi4o28XCIsXG5cdFwiQW9nb25cIjogXCLEhFwiLFxuXHRcImFvZ29uXCI6IFwixIVcIixcblx0XCJBb3BmXCI6IFwi8J2UuFwiLFxuXHRcImFvcGZcIjogXCLwnZWSXCIsXG5cdFwiYXBhY2lyXCI6IFwi4qmvXCIsXG5cdFwiYXBcIjogXCLiiYhcIixcblx0XCJhcEVcIjogXCLiqbBcIixcblx0XCJhcGVcIjogXCLiiYpcIixcblx0XCJhcGlkXCI6IFwi4omLXCIsXG5cdFwiYXBvc1wiOiBcIidcIixcblx0XCJBcHBseUZ1bmN0aW9uXCI6IFwi4oGhXCIsXG5cdFwiYXBwcm94XCI6IFwi4omIXCIsXG5cdFwiYXBwcm94ZXFcIjogXCLiiYpcIixcblx0XCJBcmluZ1wiOiBcIsOFXCIsXG5cdFwiYXJpbmdcIjogXCLDpVwiLFxuXHRcIkFzY3JcIjogXCLwnZKcXCIsXG5cdFwiYXNjclwiOiBcIvCdkrZcIixcblx0XCJBc3NpZ25cIjogXCLiiZRcIixcblx0XCJhc3RcIjogXCIqXCIsXG5cdFwiYXN5bXBcIjogXCLiiYhcIixcblx0XCJhc3ltcGVxXCI6IFwi4omNXCIsXG5cdFwiQXRpbGRlXCI6IFwiw4NcIixcblx0XCJhdGlsZGVcIjogXCLDo1wiLFxuXHRcIkF1bWxcIjogXCLDhFwiLFxuXHRcImF1bWxcIjogXCLDpFwiLFxuXHRcImF3Y29uaW50XCI6IFwi4oizXCIsXG5cdFwiYXdpbnRcIjogXCLiqJFcIixcblx0XCJiYWNrY29uZ1wiOiBcIuKJjFwiLFxuXHRcImJhY2tlcHNpbG9uXCI6IFwiz7ZcIixcblx0XCJiYWNrcHJpbWVcIjogXCLigLVcIixcblx0XCJiYWNrc2ltXCI6IFwi4oi9XCIsXG5cdFwiYmFja3NpbWVxXCI6IFwi4ouNXCIsXG5cdFwiQmFja3NsYXNoXCI6IFwi4oiWXCIsXG5cdFwiQmFydlwiOiBcIuKrp1wiLFxuXHRcImJhcnZlZVwiOiBcIuKKvVwiLFxuXHRcImJhcndlZFwiOiBcIuKMhVwiLFxuXHRcIkJhcndlZFwiOiBcIuKMhlwiLFxuXHRcImJhcndlZGdlXCI6IFwi4oyFXCIsXG5cdFwiYmJya1wiOiBcIuKOtVwiLFxuXHRcImJicmt0YnJrXCI6IFwi4o62XCIsXG5cdFwiYmNvbmdcIjogXCLiiYxcIixcblx0XCJCY3lcIjogXCLQkVwiLFxuXHRcImJjeVwiOiBcItCxXCIsXG5cdFwiYmRxdW9cIjogXCLigJ5cIixcblx0XCJiZWNhdXNcIjogXCLiiLVcIixcblx0XCJiZWNhdXNlXCI6IFwi4oi1XCIsXG5cdFwiQmVjYXVzZVwiOiBcIuKItVwiLFxuXHRcImJlbXB0eXZcIjogXCLiprBcIixcblx0XCJiZXBzaVwiOiBcIs+2XCIsXG5cdFwiYmVybm91XCI6IFwi4oSsXCIsXG5cdFwiQmVybm91bGxpc1wiOiBcIuKErFwiLFxuXHRcIkJldGFcIjogXCLOklwiLFxuXHRcImJldGFcIjogXCLOslwiLFxuXHRcImJldGhcIjogXCLihLZcIixcblx0XCJiZXR3ZWVuXCI6IFwi4omsXCIsXG5cdFwiQmZyXCI6IFwi8J2UhVwiLFxuXHRcImJmclwiOiBcIvCdlJ9cIixcblx0XCJiaWdjYXBcIjogXCLii4JcIixcblx0XCJiaWdjaXJjXCI6IFwi4pevXCIsXG5cdFwiYmlnY3VwXCI6IFwi4ouDXCIsXG5cdFwiYmlnb2RvdFwiOiBcIuKogFwiLFxuXHRcImJpZ29wbHVzXCI6IFwi4qiBXCIsXG5cdFwiYmlnb3RpbWVzXCI6IFwi4qiCXCIsXG5cdFwiYmlnc3FjdXBcIjogXCLiqIZcIixcblx0XCJiaWdzdGFyXCI6IFwi4piFXCIsXG5cdFwiYmlndHJpYW5nbGVkb3duXCI6IFwi4pa9XCIsXG5cdFwiYmlndHJpYW5nbGV1cFwiOiBcIuKWs1wiLFxuXHRcImJpZ3VwbHVzXCI6IFwi4qiEXCIsXG5cdFwiYmlndmVlXCI6IFwi4ouBXCIsXG5cdFwiYmlnd2VkZ2VcIjogXCLii4BcIixcblx0XCJia2Fyb3dcIjogXCLipI1cIixcblx0XCJibGFja2xvemVuZ2VcIjogXCLip6tcIixcblx0XCJibGFja3NxdWFyZVwiOiBcIuKWqlwiLFxuXHRcImJsYWNrdHJpYW5nbGVcIjogXCLilrRcIixcblx0XCJibGFja3RyaWFuZ2xlZG93blwiOiBcIuKWvlwiLFxuXHRcImJsYWNrdHJpYW5nbGVsZWZ0XCI6IFwi4peCXCIsXG5cdFwiYmxhY2t0cmlhbmdsZXJpZ2h0XCI6IFwi4pa4XCIsXG5cdFwiYmxhbmtcIjogXCLikKNcIixcblx0XCJibGsxMlwiOiBcIuKWklwiLFxuXHRcImJsazE0XCI6IFwi4paRXCIsXG5cdFwiYmxrMzRcIjogXCLilpNcIixcblx0XCJibG9ja1wiOiBcIuKWiFwiLFxuXHRcImJuZVwiOiBcIj3ig6VcIixcblx0XCJibmVxdWl2XCI6IFwi4omh4oOlXCIsXG5cdFwiYk5vdFwiOiBcIuKrrVwiLFxuXHRcImJub3RcIjogXCLijJBcIixcblx0XCJCb3BmXCI6IFwi8J2UuVwiLFxuXHRcImJvcGZcIjogXCLwnZWTXCIsXG5cdFwiYm90XCI6IFwi4oqlXCIsXG5cdFwiYm90dG9tXCI6IFwi4oqlXCIsXG5cdFwiYm93dGllXCI6IFwi4ouIXCIsXG5cdFwiYm94Ym94XCI6IFwi4qeJXCIsXG5cdFwiYm94ZGxcIjogXCLilJBcIixcblx0XCJib3hkTFwiOiBcIuKVlVwiLFxuXHRcImJveERsXCI6IFwi4pWWXCIsXG5cdFwiYm94RExcIjogXCLilZdcIixcblx0XCJib3hkclwiOiBcIuKUjFwiLFxuXHRcImJveGRSXCI6IFwi4pWSXCIsXG5cdFwiYm94RHJcIjogXCLilZNcIixcblx0XCJib3hEUlwiOiBcIuKVlFwiLFxuXHRcImJveGhcIjogXCLilIBcIixcblx0XCJib3hIXCI6IFwi4pWQXCIsXG5cdFwiYm94aGRcIjogXCLilKxcIixcblx0XCJib3hIZFwiOiBcIuKVpFwiLFxuXHRcImJveGhEXCI6IFwi4pWlXCIsXG5cdFwiYm94SERcIjogXCLilaZcIixcblx0XCJib3hodVwiOiBcIuKUtFwiLFxuXHRcImJveEh1XCI6IFwi4pWnXCIsXG5cdFwiYm94aFVcIjogXCLilahcIixcblx0XCJib3hIVVwiOiBcIuKVqVwiLFxuXHRcImJveG1pbnVzXCI6IFwi4oqfXCIsXG5cdFwiYm94cGx1c1wiOiBcIuKKnlwiLFxuXHRcImJveHRpbWVzXCI6IFwi4oqgXCIsXG5cdFwiYm94dWxcIjogXCLilJhcIixcblx0XCJib3h1TFwiOiBcIuKVm1wiLFxuXHRcImJveFVsXCI6IFwi4pWcXCIsXG5cdFwiYm94VUxcIjogXCLilZ1cIixcblx0XCJib3h1clwiOiBcIuKUlFwiLFxuXHRcImJveHVSXCI6IFwi4pWYXCIsXG5cdFwiYm94VXJcIjogXCLilZlcIixcblx0XCJib3hVUlwiOiBcIuKVmlwiLFxuXHRcImJveHZcIjogXCLilIJcIixcblx0XCJib3hWXCI6IFwi4pWRXCIsXG5cdFwiYm94dmhcIjogXCLilLxcIixcblx0XCJib3h2SFwiOiBcIuKVqlwiLFxuXHRcImJveFZoXCI6IFwi4pWrXCIsXG5cdFwiYm94VkhcIjogXCLilaxcIixcblx0XCJib3h2bFwiOiBcIuKUpFwiLFxuXHRcImJveHZMXCI6IFwi4pWhXCIsXG5cdFwiYm94VmxcIjogXCLilaJcIixcblx0XCJib3hWTFwiOiBcIuKVo1wiLFxuXHRcImJveHZyXCI6IFwi4pScXCIsXG5cdFwiYm94dlJcIjogXCLilZ5cIixcblx0XCJib3hWclwiOiBcIuKVn1wiLFxuXHRcImJveFZSXCI6IFwi4pWgXCIsXG5cdFwiYnByaW1lXCI6IFwi4oC1XCIsXG5cdFwiYnJldmVcIjogXCLLmFwiLFxuXHRcIkJyZXZlXCI6IFwiy5hcIixcblx0XCJicnZiYXJcIjogXCLCplwiLFxuXHRcImJzY3JcIjogXCLwnZK3XCIsXG5cdFwiQnNjclwiOiBcIuKErFwiLFxuXHRcImJzZW1pXCI6IFwi4oGPXCIsXG5cdFwiYnNpbVwiOiBcIuKIvVwiLFxuXHRcImJzaW1lXCI6IFwi4ouNXCIsXG5cdFwiYnNvbGJcIjogXCLip4VcIixcblx0XCJic29sXCI6IFwiXFxcXFwiLFxuXHRcImJzb2xoc3ViXCI6IFwi4p+IXCIsXG5cdFwiYnVsbFwiOiBcIuKAolwiLFxuXHRcImJ1bGxldFwiOiBcIuKAolwiLFxuXHRcImJ1bXBcIjogXCLiiY5cIixcblx0XCJidW1wRVwiOiBcIuKqrlwiLFxuXHRcImJ1bXBlXCI6IFwi4omPXCIsXG5cdFwiQnVtcGVxXCI6IFwi4omOXCIsXG5cdFwiYnVtcGVxXCI6IFwi4omPXCIsXG5cdFwiQ2FjdXRlXCI6IFwixIZcIixcblx0XCJjYWN1dGVcIjogXCLEh1wiLFxuXHRcImNhcGFuZFwiOiBcIuKphFwiLFxuXHRcImNhcGJyY3VwXCI6IFwi4qmJXCIsXG5cdFwiY2FwY2FwXCI6IFwi4qmLXCIsXG5cdFwiY2FwXCI6IFwi4oipXCIsXG5cdFwiQ2FwXCI6IFwi4ouSXCIsXG5cdFwiY2FwY3VwXCI6IFwi4qmHXCIsXG5cdFwiY2FwZG90XCI6IFwi4qmAXCIsXG5cdFwiQ2FwaXRhbERpZmZlcmVudGlhbERcIjogXCLihYVcIixcblx0XCJjYXBzXCI6IFwi4oip77iAXCIsXG5cdFwiY2FyZXRcIjogXCLigYFcIixcblx0XCJjYXJvblwiOiBcIsuHXCIsXG5cdFwiQ2F5bGV5c1wiOiBcIuKErVwiLFxuXHRcImNjYXBzXCI6IFwi4qmNXCIsXG5cdFwiQ2Nhcm9uXCI6IFwixIxcIixcblx0XCJjY2Fyb25cIjogXCLEjVwiLFxuXHRcIkNjZWRpbFwiOiBcIsOHXCIsXG5cdFwiY2NlZGlsXCI6IFwiw6dcIixcblx0XCJDY2lyY1wiOiBcIsSIXCIsXG5cdFwiY2NpcmNcIjogXCLEiVwiLFxuXHRcIkNjb25pbnRcIjogXCLiiLBcIixcblx0XCJjY3Vwc1wiOiBcIuKpjFwiLFxuXHRcImNjdXBzc21cIjogXCLiqZBcIixcblx0XCJDZG90XCI6IFwixIpcIixcblx0XCJjZG90XCI6IFwixItcIixcblx0XCJjZWRpbFwiOiBcIsK4XCIsXG5cdFwiQ2VkaWxsYVwiOiBcIsK4XCIsXG5cdFwiY2VtcHR5dlwiOiBcIuKmslwiLFxuXHRcImNlbnRcIjogXCLColwiLFxuXHRcImNlbnRlcmRvdFwiOiBcIsK3XCIsXG5cdFwiQ2VudGVyRG90XCI6IFwiwrdcIixcblx0XCJjZnJcIjogXCLwnZSgXCIsXG5cdFwiQ2ZyXCI6IFwi4oStXCIsXG5cdFwiQ0hjeVwiOiBcItCnXCIsXG5cdFwiY2hjeVwiOiBcItGHXCIsXG5cdFwiY2hlY2tcIjogXCLinJNcIixcblx0XCJjaGVja21hcmtcIjogXCLinJNcIixcblx0XCJDaGlcIjogXCLOp1wiLFxuXHRcImNoaVwiOiBcIs+HXCIsXG5cdFwiY2lyY1wiOiBcIsuGXCIsXG5cdFwiY2lyY2VxXCI6IFwi4omXXCIsXG5cdFwiY2lyY2xlYXJyb3dsZWZ0XCI6IFwi4oa6XCIsXG5cdFwiY2lyY2xlYXJyb3dyaWdodFwiOiBcIuKGu1wiLFxuXHRcImNpcmNsZWRhc3RcIjogXCLiiptcIixcblx0XCJjaXJjbGVkY2lyY1wiOiBcIuKKmlwiLFxuXHRcImNpcmNsZWRkYXNoXCI6IFwi4oqdXCIsXG5cdFwiQ2lyY2xlRG90XCI6IFwi4oqZXCIsXG5cdFwiY2lyY2xlZFJcIjogXCLCrlwiLFxuXHRcImNpcmNsZWRTXCI6IFwi4pOIXCIsXG5cdFwiQ2lyY2xlTWludXNcIjogXCLiipZcIixcblx0XCJDaXJjbGVQbHVzXCI6IFwi4oqVXCIsXG5cdFwiQ2lyY2xlVGltZXNcIjogXCLiipdcIixcblx0XCJjaXJcIjogXCLil4tcIixcblx0XCJjaXJFXCI6IFwi4qeDXCIsXG5cdFwiY2lyZVwiOiBcIuKJl1wiLFxuXHRcImNpcmZuaW50XCI6IFwi4qiQXCIsXG5cdFwiY2lybWlkXCI6IFwi4quvXCIsXG5cdFwiY2lyc2NpclwiOiBcIuKnglwiLFxuXHRcIkNsb2Nrd2lzZUNvbnRvdXJJbnRlZ3JhbFwiOiBcIuKIslwiLFxuXHRcIkNsb3NlQ3VybHlEb3VibGVRdW90ZVwiOiBcIuKAnVwiLFxuXHRcIkNsb3NlQ3VybHlRdW90ZVwiOiBcIuKAmVwiLFxuXHRcImNsdWJzXCI6IFwi4pmjXCIsXG5cdFwiY2x1YnN1aXRcIjogXCLimaNcIixcblx0XCJjb2xvblwiOiBcIjpcIixcblx0XCJDb2xvblwiOiBcIuKIt1wiLFxuXHRcIkNvbG9uZVwiOiBcIuKptFwiLFxuXHRcImNvbG9uZVwiOiBcIuKJlFwiLFxuXHRcImNvbG9uZXFcIjogXCLiiZRcIixcblx0XCJjb21tYVwiOiBcIixcIixcblx0XCJjb21tYXRcIjogXCJAXCIsXG5cdFwiY29tcFwiOiBcIuKIgVwiLFxuXHRcImNvbXBmblwiOiBcIuKImFwiLFxuXHRcImNvbXBsZW1lbnRcIjogXCLiiIFcIixcblx0XCJjb21wbGV4ZXNcIjogXCLihIJcIixcblx0XCJjb25nXCI6IFwi4omFXCIsXG5cdFwiY29uZ2RvdFwiOiBcIuKprVwiLFxuXHRcIkNvbmdydWVudFwiOiBcIuKJoVwiLFxuXHRcImNvbmludFwiOiBcIuKIrlwiLFxuXHRcIkNvbmludFwiOiBcIuKIr1wiLFxuXHRcIkNvbnRvdXJJbnRlZ3JhbFwiOiBcIuKIrlwiLFxuXHRcImNvcGZcIjogXCLwnZWUXCIsXG5cdFwiQ29wZlwiOiBcIuKEglwiLFxuXHRcImNvcHJvZFwiOiBcIuKIkFwiLFxuXHRcIkNvcHJvZHVjdFwiOiBcIuKIkFwiLFxuXHRcImNvcHlcIjogXCLCqVwiLFxuXHRcIkNPUFlcIjogXCLCqVwiLFxuXHRcImNvcHlzclwiOiBcIuKEl1wiLFxuXHRcIkNvdW50ZXJDbG9ja3dpc2VDb250b3VySW50ZWdyYWxcIjogXCLiiLNcIixcblx0XCJjcmFyclwiOiBcIuKGtVwiLFxuXHRcImNyb3NzXCI6IFwi4pyXXCIsXG5cdFwiQ3Jvc3NcIjogXCLiqK9cIixcblx0XCJDc2NyXCI6IFwi8J2SnlwiLFxuXHRcImNzY3JcIjogXCLwnZK4XCIsXG5cdFwiY3N1YlwiOiBcIuKrj1wiLFxuXHRcImNzdWJlXCI6IFwi4quRXCIsXG5cdFwiY3N1cFwiOiBcIuKrkFwiLFxuXHRcImNzdXBlXCI6IFwi4quSXCIsXG5cdFwiY3Rkb3RcIjogXCLii69cIixcblx0XCJjdWRhcnJsXCI6IFwi4qS4XCIsXG5cdFwiY3VkYXJyclwiOiBcIuKktVwiLFxuXHRcImN1ZXByXCI6IFwi4oueXCIsXG5cdFwiY3Vlc2NcIjogXCLii59cIixcblx0XCJjdWxhcnJcIjogXCLihrZcIixcblx0XCJjdWxhcnJwXCI6IFwi4qS9XCIsXG5cdFwiY3VwYnJjYXBcIjogXCLiqYhcIixcblx0XCJjdXBjYXBcIjogXCLiqYZcIixcblx0XCJDdXBDYXBcIjogXCLiiY1cIixcblx0XCJjdXBcIjogXCLiiKpcIixcblx0XCJDdXBcIjogXCLii5NcIixcblx0XCJjdXBjdXBcIjogXCLiqYpcIixcblx0XCJjdXBkb3RcIjogXCLiio1cIixcblx0XCJjdXBvclwiOiBcIuKphVwiLFxuXHRcImN1cHNcIjogXCLiiKrvuIBcIixcblx0XCJjdXJhcnJcIjogXCLihrdcIixcblx0XCJjdXJhcnJtXCI6IFwi4qS8XCIsXG5cdFwiY3VybHllcXByZWNcIjogXCLii55cIixcblx0XCJjdXJseWVxc3VjY1wiOiBcIuKLn1wiLFxuXHRcImN1cmx5dmVlXCI6IFwi4ouOXCIsXG5cdFwiY3VybHl3ZWRnZVwiOiBcIuKLj1wiLFxuXHRcImN1cnJlblwiOiBcIsKkXCIsXG5cdFwiY3VydmVhcnJvd2xlZnRcIjogXCLihrZcIixcblx0XCJjdXJ2ZWFycm93cmlnaHRcIjogXCLihrdcIixcblx0XCJjdXZlZVwiOiBcIuKLjlwiLFxuXHRcImN1d2VkXCI6IFwi4ouPXCIsXG5cdFwiY3djb25pbnRcIjogXCLiiLJcIixcblx0XCJjd2ludFwiOiBcIuKIsVwiLFxuXHRcImN5bGN0eVwiOiBcIuKMrVwiLFxuXHRcImRhZ2dlclwiOiBcIuKAoFwiLFxuXHRcIkRhZ2dlclwiOiBcIuKAoVwiLFxuXHRcImRhbGV0aFwiOiBcIuKEuFwiLFxuXHRcImRhcnJcIjogXCLihpNcIixcblx0XCJEYXJyXCI6IFwi4oahXCIsXG5cdFwiZEFyclwiOiBcIuKHk1wiLFxuXHRcImRhc2hcIjogXCLigJBcIixcblx0XCJEYXNodlwiOiBcIuKrpFwiLFxuXHRcImRhc2h2XCI6IFwi4oqjXCIsXG5cdFwiZGJrYXJvd1wiOiBcIuKkj1wiLFxuXHRcImRibGFjXCI6IFwiy51cIixcblx0XCJEY2Fyb25cIjogXCLEjlwiLFxuXHRcImRjYXJvblwiOiBcIsSPXCIsXG5cdFwiRGN5XCI6IFwi0JRcIixcblx0XCJkY3lcIjogXCLQtFwiLFxuXHRcImRkYWdnZXJcIjogXCLigKFcIixcblx0XCJkZGFyclwiOiBcIuKHilwiLFxuXHRcIkREXCI6IFwi4oWFXCIsXG5cdFwiZGRcIjogXCLihYZcIixcblx0XCJERG90cmFoZFwiOiBcIuKkkVwiLFxuXHRcImRkb3RzZXFcIjogXCLiqbdcIixcblx0XCJkZWdcIjogXCLCsFwiLFxuXHRcIkRlbFwiOiBcIuKIh1wiLFxuXHRcIkRlbHRhXCI6IFwizpRcIixcblx0XCJkZWx0YVwiOiBcIs60XCIsXG5cdFwiZGVtcHR5dlwiOiBcIuKmsVwiLFxuXHRcImRmaXNodFwiOiBcIuKlv1wiLFxuXHRcIkRmclwiOiBcIvCdlIdcIixcblx0XCJkZnJcIjogXCLwnZShXCIsXG5cdFwiZEhhclwiOiBcIuKlpVwiLFxuXHRcImRoYXJsXCI6IFwi4oeDXCIsXG5cdFwiZGhhcnJcIjogXCLih4JcIixcblx0XCJEaWFjcml0aWNhbEFjdXRlXCI6IFwiwrRcIixcblx0XCJEaWFjcml0aWNhbERvdFwiOiBcIsuZXCIsXG5cdFwiRGlhY3JpdGljYWxEb3VibGVBY3V0ZVwiOiBcIsudXCIsXG5cdFwiRGlhY3JpdGljYWxHcmF2ZVwiOiBcImBcIixcblx0XCJEaWFjcml0aWNhbFRpbGRlXCI6IFwiy5xcIixcblx0XCJkaWFtXCI6IFwi4ouEXCIsXG5cdFwiZGlhbW9uZFwiOiBcIuKLhFwiLFxuXHRcIkRpYW1vbmRcIjogXCLii4RcIixcblx0XCJkaWFtb25kc3VpdFwiOiBcIuKZplwiLFxuXHRcImRpYW1zXCI6IFwi4pmmXCIsXG5cdFwiZGllXCI6IFwiwqhcIixcblx0XCJEaWZmZXJlbnRpYWxEXCI6IFwi4oWGXCIsXG5cdFwiZGlnYW1tYVwiOiBcIs+dXCIsXG5cdFwiZGlzaW5cIjogXCLii7JcIixcblx0XCJkaXZcIjogXCLDt1wiLFxuXHRcImRpdmlkZVwiOiBcIsO3XCIsXG5cdFwiZGl2aWRlb250aW1lc1wiOiBcIuKLh1wiLFxuXHRcImRpdm9ueFwiOiBcIuKLh1wiLFxuXHRcIkRKY3lcIjogXCLQglwiLFxuXHRcImRqY3lcIjogXCLRklwiLFxuXHRcImRsY29yblwiOiBcIuKMnlwiLFxuXHRcImRsY3JvcFwiOiBcIuKMjVwiLFxuXHRcImRvbGxhclwiOiBcIiRcIixcblx0XCJEb3BmXCI6IFwi8J2Uu1wiLFxuXHRcImRvcGZcIjogXCLwnZWVXCIsXG5cdFwiRG90XCI6IFwiwqhcIixcblx0XCJkb3RcIjogXCLLmVwiLFxuXHRcIkRvdERvdFwiOiBcIuKDnFwiLFxuXHRcImRvdGVxXCI6IFwi4omQXCIsXG5cdFwiZG90ZXFkb3RcIjogXCLiiZFcIixcblx0XCJEb3RFcXVhbFwiOiBcIuKJkFwiLFxuXHRcImRvdG1pbnVzXCI6IFwi4oi4XCIsXG5cdFwiZG90cGx1c1wiOiBcIuKIlFwiLFxuXHRcImRvdHNxdWFyZVwiOiBcIuKKoVwiLFxuXHRcImRvdWJsZWJhcndlZGdlXCI6IFwi4oyGXCIsXG5cdFwiRG91YmxlQ29udG91ckludGVncmFsXCI6IFwi4oivXCIsXG5cdFwiRG91YmxlRG90XCI6IFwiwqhcIixcblx0XCJEb3VibGVEb3duQXJyb3dcIjogXCLih5NcIixcblx0XCJEb3VibGVMZWZ0QXJyb3dcIjogXCLih5BcIixcblx0XCJEb3VibGVMZWZ0UmlnaHRBcnJvd1wiOiBcIuKHlFwiLFxuXHRcIkRvdWJsZUxlZnRUZWVcIjogXCLiq6RcIixcblx0XCJEb3VibGVMb25nTGVmdEFycm93XCI6IFwi4p+4XCIsXG5cdFwiRG91YmxlTG9uZ0xlZnRSaWdodEFycm93XCI6IFwi4p+6XCIsXG5cdFwiRG91YmxlTG9uZ1JpZ2h0QXJyb3dcIjogXCLin7lcIixcblx0XCJEb3VibGVSaWdodEFycm93XCI6IFwi4oeSXCIsXG5cdFwiRG91YmxlUmlnaHRUZWVcIjogXCLiiqhcIixcblx0XCJEb3VibGVVcEFycm93XCI6IFwi4oeRXCIsXG5cdFwiRG91YmxlVXBEb3duQXJyb3dcIjogXCLih5VcIixcblx0XCJEb3VibGVWZXJ0aWNhbEJhclwiOiBcIuKIpVwiLFxuXHRcIkRvd25BcnJvd0JhclwiOiBcIuKkk1wiLFxuXHRcImRvd25hcnJvd1wiOiBcIuKGk1wiLFxuXHRcIkRvd25BcnJvd1wiOiBcIuKGk1wiLFxuXHRcIkRvd25hcnJvd1wiOiBcIuKHk1wiLFxuXHRcIkRvd25BcnJvd1VwQXJyb3dcIjogXCLih7VcIixcblx0XCJEb3duQnJldmVcIjogXCLMkVwiLFxuXHRcImRvd25kb3duYXJyb3dzXCI6IFwi4oeKXCIsXG5cdFwiZG93bmhhcnBvb25sZWZ0XCI6IFwi4oeDXCIsXG5cdFwiZG93bmhhcnBvb25yaWdodFwiOiBcIuKHglwiLFxuXHRcIkRvd25MZWZ0UmlnaHRWZWN0b3JcIjogXCLipZBcIixcblx0XCJEb3duTGVmdFRlZVZlY3RvclwiOiBcIuKlnlwiLFxuXHRcIkRvd25MZWZ0VmVjdG9yQmFyXCI6IFwi4qWWXCIsXG5cdFwiRG93bkxlZnRWZWN0b3JcIjogXCLihr1cIixcblx0XCJEb3duUmlnaHRUZWVWZWN0b3JcIjogXCLipZ9cIixcblx0XCJEb3duUmlnaHRWZWN0b3JCYXJcIjogXCLipZdcIixcblx0XCJEb3duUmlnaHRWZWN0b3JcIjogXCLih4FcIixcblx0XCJEb3duVGVlQXJyb3dcIjogXCLihqdcIixcblx0XCJEb3duVGVlXCI6IFwi4oqkXCIsXG5cdFwiZHJia2Fyb3dcIjogXCLipJBcIixcblx0XCJkcmNvcm5cIjogXCLijJ9cIixcblx0XCJkcmNyb3BcIjogXCLijIxcIixcblx0XCJEc2NyXCI6IFwi8J2Sn1wiLFxuXHRcImRzY3JcIjogXCLwnZK5XCIsXG5cdFwiRFNjeVwiOiBcItCFXCIsXG5cdFwiZHNjeVwiOiBcItGVXCIsXG5cdFwiZHNvbFwiOiBcIuKntlwiLFxuXHRcIkRzdHJva1wiOiBcIsSQXCIsXG5cdFwiZHN0cm9rXCI6IFwixJFcIixcblx0XCJkdGRvdFwiOiBcIuKLsVwiLFxuXHRcImR0cmlcIjogXCLilr9cIixcblx0XCJkdHJpZlwiOiBcIuKWvlwiLFxuXHRcImR1YXJyXCI6IFwi4oe1XCIsXG5cdFwiZHVoYXJcIjogXCLipa9cIixcblx0XCJkd2FuZ2xlXCI6IFwi4qamXCIsXG5cdFwiRFpjeVwiOiBcItCPXCIsXG5cdFwiZHpjeVwiOiBcItGfXCIsXG5cdFwiZHppZ3JhcnJcIjogXCLin79cIixcblx0XCJFYWN1dGVcIjogXCLDiVwiLFxuXHRcImVhY3V0ZVwiOiBcIsOpXCIsXG5cdFwiZWFzdGVyXCI6IFwi4qmuXCIsXG5cdFwiRWNhcm9uXCI6IFwixJpcIixcblx0XCJlY2Fyb25cIjogXCLEm1wiLFxuXHRcIkVjaXJjXCI6IFwiw4pcIixcblx0XCJlY2lyY1wiOiBcIsOqXCIsXG5cdFwiZWNpclwiOiBcIuKJllwiLFxuXHRcImVjb2xvblwiOiBcIuKJlVwiLFxuXHRcIkVjeVwiOiBcItCtXCIsXG5cdFwiZWN5XCI6IFwi0Y1cIixcblx0XCJlRERvdFwiOiBcIuKpt1wiLFxuXHRcIkVkb3RcIjogXCLEllwiLFxuXHRcImVkb3RcIjogXCLEl1wiLFxuXHRcImVEb3RcIjogXCLiiZFcIixcblx0XCJlZVwiOiBcIuKFh1wiLFxuXHRcImVmRG90XCI6IFwi4omSXCIsXG5cdFwiRWZyXCI6IFwi8J2UiFwiLFxuXHRcImVmclwiOiBcIvCdlKJcIixcblx0XCJlZ1wiOiBcIuKqmlwiLFxuXHRcIkVncmF2ZVwiOiBcIsOIXCIsXG5cdFwiZWdyYXZlXCI6IFwiw6hcIixcblx0XCJlZ3NcIjogXCLiqpZcIixcblx0XCJlZ3Nkb3RcIjogXCLiqphcIixcblx0XCJlbFwiOiBcIuKqmVwiLFxuXHRcIkVsZW1lbnRcIjogXCLiiIhcIixcblx0XCJlbGludGVyc1wiOiBcIuKPp1wiLFxuXHRcImVsbFwiOiBcIuKEk1wiLFxuXHRcImVsc1wiOiBcIuKqlVwiLFxuXHRcImVsc2RvdFwiOiBcIuKql1wiLFxuXHRcIkVtYWNyXCI6IFwixJJcIixcblx0XCJlbWFjclwiOiBcIsSTXCIsXG5cdFwiZW1wdHlcIjogXCLiiIVcIixcblx0XCJlbXB0eXNldFwiOiBcIuKIhVwiLFxuXHRcIkVtcHR5U21hbGxTcXVhcmVcIjogXCLil7tcIixcblx0XCJlbXB0eXZcIjogXCLiiIVcIixcblx0XCJFbXB0eVZlcnlTbWFsbFNxdWFyZVwiOiBcIuKWq1wiLFxuXHRcImVtc3AxM1wiOiBcIuKAhFwiLFxuXHRcImVtc3AxNFwiOiBcIuKAhVwiLFxuXHRcImVtc3BcIjogXCLigINcIixcblx0XCJFTkdcIjogXCLFilwiLFxuXHRcImVuZ1wiOiBcIsWLXCIsXG5cdFwiZW5zcFwiOiBcIuKAglwiLFxuXHRcIkVvZ29uXCI6IFwixJhcIixcblx0XCJlb2dvblwiOiBcIsSZXCIsXG5cdFwiRW9wZlwiOiBcIvCdlLxcIixcblx0XCJlb3BmXCI6IFwi8J2VllwiLFxuXHRcImVwYXJcIjogXCLii5VcIixcblx0XCJlcGFyc2xcIjogXCLip6NcIixcblx0XCJlcGx1c1wiOiBcIuKpsVwiLFxuXHRcImVwc2lcIjogXCLOtVwiLFxuXHRcIkVwc2lsb25cIjogXCLOlVwiLFxuXHRcImVwc2lsb25cIjogXCLOtVwiLFxuXHRcImVwc2l2XCI6IFwiz7VcIixcblx0XCJlcWNpcmNcIjogXCLiiZZcIixcblx0XCJlcWNvbG9uXCI6IFwi4omVXCIsXG5cdFwiZXFzaW1cIjogXCLiiYJcIixcblx0XCJlcXNsYW50Z3RyXCI6IFwi4qqWXCIsXG5cdFwiZXFzbGFudGxlc3NcIjogXCLiqpVcIixcblx0XCJFcXVhbFwiOiBcIuKptVwiLFxuXHRcImVxdWFsc1wiOiBcIj1cIixcblx0XCJFcXVhbFRpbGRlXCI6IFwi4omCXCIsXG5cdFwiZXF1ZXN0XCI6IFwi4omfXCIsXG5cdFwiRXF1aWxpYnJpdW1cIjogXCLih4xcIixcblx0XCJlcXVpdlwiOiBcIuKJoVwiLFxuXHRcImVxdWl2RERcIjogXCLiqbhcIixcblx0XCJlcXZwYXJzbFwiOiBcIuKnpVwiLFxuXHRcImVyYXJyXCI6IFwi4qWxXCIsXG5cdFwiZXJEb3RcIjogXCLiiZNcIixcblx0XCJlc2NyXCI6IFwi4oSvXCIsXG5cdFwiRXNjclwiOiBcIuKEsFwiLFxuXHRcImVzZG90XCI6IFwi4omQXCIsXG5cdFwiRXNpbVwiOiBcIuKps1wiLFxuXHRcImVzaW1cIjogXCLiiYJcIixcblx0XCJFdGFcIjogXCLOl1wiLFxuXHRcImV0YVwiOiBcIs63XCIsXG5cdFwiRVRIXCI6IFwiw5BcIixcblx0XCJldGhcIjogXCLDsFwiLFxuXHRcIkV1bWxcIjogXCLDi1wiLFxuXHRcImV1bWxcIjogXCLDq1wiLFxuXHRcImV1cm9cIjogXCLigqxcIixcblx0XCJleGNsXCI6IFwiIVwiLFxuXHRcImV4aXN0XCI6IFwi4oiDXCIsXG5cdFwiRXhpc3RzXCI6IFwi4oiDXCIsXG5cdFwiZXhwZWN0YXRpb25cIjogXCLihLBcIixcblx0XCJleHBvbmVudGlhbGVcIjogXCLihYdcIixcblx0XCJFeHBvbmVudGlhbEVcIjogXCLihYdcIixcblx0XCJmYWxsaW5nZG90c2VxXCI6IFwi4omSXCIsXG5cdFwiRmN5XCI6IFwi0KRcIixcblx0XCJmY3lcIjogXCLRhFwiLFxuXHRcImZlbWFsZVwiOiBcIuKZgFwiLFxuXHRcImZmaWxpZ1wiOiBcIu+sg1wiLFxuXHRcImZmbGlnXCI6IFwi76yAXCIsXG5cdFwiZmZsbGlnXCI6IFwi76yEXCIsXG5cdFwiRmZyXCI6IFwi8J2UiVwiLFxuXHRcImZmclwiOiBcIvCdlKNcIixcblx0XCJmaWxpZ1wiOiBcIu+sgVwiLFxuXHRcIkZpbGxlZFNtYWxsU3F1YXJlXCI6IFwi4pe8XCIsXG5cdFwiRmlsbGVkVmVyeVNtYWxsU3F1YXJlXCI6IFwi4paqXCIsXG5cdFwiZmpsaWdcIjogXCJmalwiLFxuXHRcImZsYXRcIjogXCLima1cIixcblx0XCJmbGxpZ1wiOiBcIu+sglwiLFxuXHRcImZsdG5zXCI6IFwi4paxXCIsXG5cdFwiZm5vZlwiOiBcIsaSXCIsXG5cdFwiRm9wZlwiOiBcIvCdlL1cIixcblx0XCJmb3BmXCI6IFwi8J2Vl1wiLFxuXHRcImZvcmFsbFwiOiBcIuKIgFwiLFxuXHRcIkZvckFsbFwiOiBcIuKIgFwiLFxuXHRcImZvcmtcIjogXCLii5RcIixcblx0XCJmb3JrdlwiOiBcIuKrmVwiLFxuXHRcIkZvdXJpZXJ0cmZcIjogXCLihLFcIixcblx0XCJmcGFydGludFwiOiBcIuKojVwiLFxuXHRcImZyYWMxMlwiOiBcIsK9XCIsXG5cdFwiZnJhYzEzXCI6IFwi4oWTXCIsXG5cdFwiZnJhYzE0XCI6IFwiwrxcIixcblx0XCJmcmFjMTVcIjogXCLihZVcIixcblx0XCJmcmFjMTZcIjogXCLihZlcIixcblx0XCJmcmFjMThcIjogXCLihZtcIixcblx0XCJmcmFjMjNcIjogXCLihZRcIixcblx0XCJmcmFjMjVcIjogXCLihZZcIixcblx0XCJmcmFjMzRcIjogXCLCvlwiLFxuXHRcImZyYWMzNVwiOiBcIuKFl1wiLFxuXHRcImZyYWMzOFwiOiBcIuKFnFwiLFxuXHRcImZyYWM0NVwiOiBcIuKFmFwiLFxuXHRcImZyYWM1NlwiOiBcIuKFmlwiLFxuXHRcImZyYWM1OFwiOiBcIuKFnVwiLFxuXHRcImZyYWM3OFwiOiBcIuKFnlwiLFxuXHRcImZyYXNsXCI6IFwi4oGEXCIsXG5cdFwiZnJvd25cIjogXCLijKJcIixcblx0XCJmc2NyXCI6IFwi8J2Su1wiLFxuXHRcIkZzY3JcIjogXCLihLFcIixcblx0XCJnYWN1dGVcIjogXCLHtVwiLFxuXHRcIkdhbW1hXCI6IFwizpNcIixcblx0XCJnYW1tYVwiOiBcIs6zXCIsXG5cdFwiR2FtbWFkXCI6IFwiz5xcIixcblx0XCJnYW1tYWRcIjogXCLPnVwiLFxuXHRcImdhcFwiOiBcIuKqhlwiLFxuXHRcIkdicmV2ZVwiOiBcIsSeXCIsXG5cdFwiZ2JyZXZlXCI6IFwixJ9cIixcblx0XCJHY2VkaWxcIjogXCLEolwiLFxuXHRcIkdjaXJjXCI6IFwixJxcIixcblx0XCJnY2lyY1wiOiBcIsSdXCIsXG5cdFwiR2N5XCI6IFwi0JNcIixcblx0XCJnY3lcIjogXCLQs1wiLFxuXHRcIkdkb3RcIjogXCLEoFwiLFxuXHRcImdkb3RcIjogXCLEoVwiLFxuXHRcImdlXCI6IFwi4omlXCIsXG5cdFwiZ0VcIjogXCLiiadcIixcblx0XCJnRWxcIjogXCLiqoxcIixcblx0XCJnZWxcIjogXCLii5tcIixcblx0XCJnZXFcIjogXCLiiaVcIixcblx0XCJnZXFxXCI6IFwi4omnXCIsXG5cdFwiZ2Vxc2xhbnRcIjogXCLiqb5cIixcblx0XCJnZXNjY1wiOiBcIuKqqVwiLFxuXHRcImdlc1wiOiBcIuKpvlwiLFxuXHRcImdlc2RvdFwiOiBcIuKqgFwiLFxuXHRcImdlc2RvdG9cIjogXCLiqoJcIixcblx0XCJnZXNkb3RvbFwiOiBcIuKqhFwiLFxuXHRcImdlc2xcIjogXCLii5vvuIBcIixcblx0XCJnZXNsZXNcIjogXCLiqpRcIixcblx0XCJHZnJcIjogXCLwnZSKXCIsXG5cdFwiZ2ZyXCI6IFwi8J2UpFwiLFxuXHRcImdnXCI6IFwi4omrXCIsXG5cdFwiR2dcIjogXCLii5lcIixcblx0XCJnZ2dcIjogXCLii5lcIixcblx0XCJnaW1lbFwiOiBcIuKEt1wiLFxuXHRcIkdKY3lcIjogXCLQg1wiLFxuXHRcImdqY3lcIjogXCLRk1wiLFxuXHRcImdsYVwiOiBcIuKqpVwiLFxuXHRcImdsXCI6IFwi4om3XCIsXG5cdFwiZ2xFXCI6IFwi4qqSXCIsXG5cdFwiZ2xqXCI6IFwi4qqkXCIsXG5cdFwiZ25hcFwiOiBcIuKqilwiLFxuXHRcImduYXBwcm94XCI6IFwi4qqKXCIsXG5cdFwiZ25lXCI6IFwi4qqIXCIsXG5cdFwiZ25FXCI6IFwi4ompXCIsXG5cdFwiZ25lcVwiOiBcIuKqiFwiLFxuXHRcImduZXFxXCI6IFwi4ompXCIsXG5cdFwiZ25zaW1cIjogXCLii6dcIixcblx0XCJHb3BmXCI6IFwi8J2UvlwiLFxuXHRcImdvcGZcIjogXCLwnZWYXCIsXG5cdFwiZ3JhdmVcIjogXCJgXCIsXG5cdFwiR3JlYXRlckVxdWFsXCI6IFwi4omlXCIsXG5cdFwiR3JlYXRlckVxdWFsTGVzc1wiOiBcIuKLm1wiLFxuXHRcIkdyZWF0ZXJGdWxsRXF1YWxcIjogXCLiiadcIixcblx0XCJHcmVhdGVyR3JlYXRlclwiOiBcIuKqolwiLFxuXHRcIkdyZWF0ZXJMZXNzXCI6IFwi4om3XCIsXG5cdFwiR3JlYXRlclNsYW50RXF1YWxcIjogXCLiqb5cIixcblx0XCJHcmVhdGVyVGlsZGVcIjogXCLiibNcIixcblx0XCJHc2NyXCI6IFwi8J2SolwiLFxuXHRcImdzY3JcIjogXCLihIpcIixcblx0XCJnc2ltXCI6IFwi4omzXCIsXG5cdFwiZ3NpbWVcIjogXCLiqo5cIixcblx0XCJnc2ltbFwiOiBcIuKqkFwiLFxuXHRcImd0Y2NcIjogXCLiqqdcIixcblx0XCJndGNpclwiOiBcIuKpulwiLFxuXHRcImd0XCI6IFwiPlwiLFxuXHRcIkdUXCI6IFwiPlwiLFxuXHRcIkd0XCI6IFwi4omrXCIsXG5cdFwiZ3Rkb3RcIjogXCLii5dcIixcblx0XCJndGxQYXJcIjogXCLippVcIixcblx0XCJndHF1ZXN0XCI6IFwi4qm8XCIsXG5cdFwiZ3RyYXBwcm94XCI6IFwi4qqGXCIsXG5cdFwiZ3RyYXJyXCI6IFwi4qW4XCIsXG5cdFwiZ3RyZG90XCI6IFwi4ouXXCIsXG5cdFwiZ3RyZXFsZXNzXCI6IFwi4oubXCIsXG5cdFwiZ3RyZXFxbGVzc1wiOiBcIuKqjFwiLFxuXHRcImd0cmxlc3NcIjogXCLiibdcIixcblx0XCJndHJzaW1cIjogXCLiibNcIixcblx0XCJndmVydG5lcXFcIjogXCLiianvuIBcIixcblx0XCJndm5FXCI6IFwi4omp77iAXCIsXG5cdFwiSGFjZWtcIjogXCLLh1wiLFxuXHRcImhhaXJzcFwiOiBcIuKAilwiLFxuXHRcImhhbGZcIjogXCLCvVwiLFxuXHRcImhhbWlsdFwiOiBcIuKEi1wiLFxuXHRcIkhBUkRjeVwiOiBcItCqXCIsXG5cdFwiaGFyZGN5XCI6IFwi0YpcIixcblx0XCJoYXJyY2lyXCI6IFwi4qWIXCIsXG5cdFwiaGFyclwiOiBcIuKGlFwiLFxuXHRcImhBcnJcIjogXCLih5RcIixcblx0XCJoYXJyd1wiOiBcIuKGrVwiLFxuXHRcIkhhdFwiOiBcIl5cIixcblx0XCJoYmFyXCI6IFwi4oSPXCIsXG5cdFwiSGNpcmNcIjogXCLEpFwiLFxuXHRcImhjaXJjXCI6IFwixKVcIixcblx0XCJoZWFydHNcIjogXCLimaVcIixcblx0XCJoZWFydHN1aXRcIjogXCLimaVcIixcblx0XCJoZWxsaXBcIjogXCLigKZcIixcblx0XCJoZXJjb25cIjogXCLiirlcIixcblx0XCJoZnJcIjogXCLwnZSlXCIsXG5cdFwiSGZyXCI6IFwi4oSMXCIsXG5cdFwiSGlsYmVydFNwYWNlXCI6IFwi4oSLXCIsXG5cdFwiaGtzZWFyb3dcIjogXCLipKVcIixcblx0XCJoa3N3YXJvd1wiOiBcIuKkplwiLFxuXHRcImhvYXJyXCI6IFwi4oe/XCIsXG5cdFwiaG9tdGh0XCI6IFwi4oi7XCIsXG5cdFwiaG9va2xlZnRhcnJvd1wiOiBcIuKGqVwiLFxuXHRcImhvb2tyaWdodGFycm93XCI6IFwi4oaqXCIsXG5cdFwiaG9wZlwiOiBcIvCdlZlcIixcblx0XCJIb3BmXCI6IFwi4oSNXCIsXG5cdFwiaG9yYmFyXCI6IFwi4oCVXCIsXG5cdFwiSG9yaXpvbnRhbExpbmVcIjogXCLilIBcIixcblx0XCJoc2NyXCI6IFwi8J2SvVwiLFxuXHRcIkhzY3JcIjogXCLihItcIixcblx0XCJoc2xhc2hcIjogXCLihI9cIixcblx0XCJIc3Ryb2tcIjogXCLEplwiLFxuXHRcImhzdHJva1wiOiBcIsSnXCIsXG5cdFwiSHVtcERvd25IdW1wXCI6IFwi4omOXCIsXG5cdFwiSHVtcEVxdWFsXCI6IFwi4omPXCIsXG5cdFwiaHlidWxsXCI6IFwi4oGDXCIsXG5cdFwiaHlwaGVuXCI6IFwi4oCQXCIsXG5cdFwiSWFjdXRlXCI6IFwiw41cIixcblx0XCJpYWN1dGVcIjogXCLDrVwiLFxuXHRcImljXCI6IFwi4oGjXCIsXG5cdFwiSWNpcmNcIjogXCLDjlwiLFxuXHRcImljaXJjXCI6IFwiw65cIixcblx0XCJJY3lcIjogXCLQmFwiLFxuXHRcImljeVwiOiBcItC4XCIsXG5cdFwiSWRvdFwiOiBcIsSwXCIsXG5cdFwiSUVjeVwiOiBcItCVXCIsXG5cdFwiaWVjeVwiOiBcItC1XCIsXG5cdFwiaWV4Y2xcIjogXCLCoVwiLFxuXHRcImlmZlwiOiBcIuKHlFwiLFxuXHRcImlmclwiOiBcIvCdlKZcIixcblx0XCJJZnJcIjogXCLihJFcIixcblx0XCJJZ3JhdmVcIjogXCLDjFwiLFxuXHRcImlncmF2ZVwiOiBcIsOsXCIsXG5cdFwiaWlcIjogXCLihYhcIixcblx0XCJpaWlpbnRcIjogXCLiqIxcIixcblx0XCJpaWludFwiOiBcIuKIrVwiLFxuXHRcImlpbmZpblwiOiBcIuKnnFwiLFxuXHRcImlpb3RhXCI6IFwi4oSpXCIsXG5cdFwiSUpsaWdcIjogXCLEslwiLFxuXHRcImlqbGlnXCI6IFwixLNcIixcblx0XCJJbWFjclwiOiBcIsSqXCIsXG5cdFwiaW1hY3JcIjogXCLEq1wiLFxuXHRcImltYWdlXCI6IFwi4oSRXCIsXG5cdFwiSW1hZ2luYXJ5SVwiOiBcIuKFiFwiLFxuXHRcImltYWdsaW5lXCI6IFwi4oSQXCIsXG5cdFwiaW1hZ3BhcnRcIjogXCLihJFcIixcblx0XCJpbWF0aFwiOiBcIsSxXCIsXG5cdFwiSW1cIjogXCLihJFcIixcblx0XCJpbW9mXCI6IFwi4oq3XCIsXG5cdFwiaW1wZWRcIjogXCLGtVwiLFxuXHRcIkltcGxpZXNcIjogXCLih5JcIixcblx0XCJpbmNhcmVcIjogXCLihIVcIixcblx0XCJpblwiOiBcIuKIiFwiLFxuXHRcImluZmluXCI6IFwi4oieXCIsXG5cdFwiaW5maW50aWVcIjogXCLip51cIixcblx0XCJpbm9kb3RcIjogXCLEsVwiLFxuXHRcImludGNhbFwiOiBcIuKKulwiLFxuXHRcImludFwiOiBcIuKIq1wiLFxuXHRcIkludFwiOiBcIuKIrFwiLFxuXHRcImludGVnZXJzXCI6IFwi4oSkXCIsXG5cdFwiSW50ZWdyYWxcIjogXCLiiKtcIixcblx0XCJpbnRlcmNhbFwiOiBcIuKKulwiLFxuXHRcIkludGVyc2VjdGlvblwiOiBcIuKLglwiLFxuXHRcImludGxhcmhrXCI6IFwi4qiXXCIsXG5cdFwiaW50cHJvZFwiOiBcIuKovFwiLFxuXHRcIkludmlzaWJsZUNvbW1hXCI6IFwi4oGjXCIsXG5cdFwiSW52aXNpYmxlVGltZXNcIjogXCLigaJcIixcblx0XCJJT2N5XCI6IFwi0IFcIixcblx0XCJpb2N5XCI6IFwi0ZFcIixcblx0XCJJb2dvblwiOiBcIsSuXCIsXG5cdFwiaW9nb25cIjogXCLEr1wiLFxuXHRcIklvcGZcIjogXCLwnZWAXCIsXG5cdFwiaW9wZlwiOiBcIvCdlZpcIixcblx0XCJJb3RhXCI6IFwizplcIixcblx0XCJpb3RhXCI6IFwizrlcIixcblx0XCJpcHJvZFwiOiBcIuKovFwiLFxuXHRcImlxdWVzdFwiOiBcIsK/XCIsXG5cdFwiaXNjclwiOiBcIvCdkr5cIixcblx0XCJJc2NyXCI6IFwi4oSQXCIsXG5cdFwiaXNpblwiOiBcIuKIiFwiLFxuXHRcImlzaW5kb3RcIjogXCLii7VcIixcblx0XCJpc2luRVwiOiBcIuKLuVwiLFxuXHRcImlzaW5zXCI6IFwi4ou0XCIsXG5cdFwiaXNpbnN2XCI6IFwi4ouzXCIsXG5cdFwiaXNpbnZcIjogXCLiiIhcIixcblx0XCJpdFwiOiBcIuKBolwiLFxuXHRcIkl0aWxkZVwiOiBcIsSoXCIsXG5cdFwiaXRpbGRlXCI6IFwixKlcIixcblx0XCJJdWtjeVwiOiBcItCGXCIsXG5cdFwiaXVrY3lcIjogXCLRllwiLFxuXHRcIkl1bWxcIjogXCLDj1wiLFxuXHRcIml1bWxcIjogXCLDr1wiLFxuXHRcIkpjaXJjXCI6IFwixLRcIixcblx0XCJqY2lyY1wiOiBcIsS1XCIsXG5cdFwiSmN5XCI6IFwi0JlcIixcblx0XCJqY3lcIjogXCLQuVwiLFxuXHRcIkpmclwiOiBcIvCdlI1cIixcblx0XCJqZnJcIjogXCLwnZSnXCIsXG5cdFwiam1hdGhcIjogXCLIt1wiLFxuXHRcIkpvcGZcIjogXCLwnZWBXCIsXG5cdFwiam9wZlwiOiBcIvCdlZtcIixcblx0XCJKc2NyXCI6IFwi8J2SpVwiLFxuXHRcImpzY3JcIjogXCLwnZK/XCIsXG5cdFwiSnNlcmN5XCI6IFwi0IhcIixcblx0XCJqc2VyY3lcIjogXCLRmFwiLFxuXHRcIkp1a2N5XCI6IFwi0IRcIixcblx0XCJqdWtjeVwiOiBcItGUXCIsXG5cdFwiS2FwcGFcIjogXCLOmlwiLFxuXHRcImthcHBhXCI6IFwizrpcIixcblx0XCJrYXBwYXZcIjogXCLPsFwiLFxuXHRcIktjZWRpbFwiOiBcIsS2XCIsXG5cdFwia2NlZGlsXCI6IFwixLdcIixcblx0XCJLY3lcIjogXCLQmlwiLFxuXHRcImtjeVwiOiBcItC6XCIsXG5cdFwiS2ZyXCI6IFwi8J2UjlwiLFxuXHRcImtmclwiOiBcIvCdlKhcIixcblx0XCJrZ3JlZW5cIjogXCLEuFwiLFxuXHRcIktIY3lcIjogXCLQpVwiLFxuXHRcImtoY3lcIjogXCLRhVwiLFxuXHRcIktKY3lcIjogXCLQjFwiLFxuXHRcImtqY3lcIjogXCLRnFwiLFxuXHRcIktvcGZcIjogXCLwnZWCXCIsXG5cdFwia29wZlwiOiBcIvCdlZxcIixcblx0XCJLc2NyXCI6IFwi8J2SplwiLFxuXHRcImtzY3JcIjogXCLwnZOAXCIsXG5cdFwibEFhcnJcIjogXCLih5pcIixcblx0XCJMYWN1dGVcIjogXCLEuVwiLFxuXHRcImxhY3V0ZVwiOiBcIsS6XCIsXG5cdFwibGFlbXB0eXZcIjogXCLiprRcIixcblx0XCJsYWdyYW5cIjogXCLihJJcIixcblx0XCJMYW1iZGFcIjogXCLOm1wiLFxuXHRcImxhbWJkYVwiOiBcIs67XCIsXG5cdFwibGFuZ1wiOiBcIuKfqFwiLFxuXHRcIkxhbmdcIjogXCLin6pcIixcblx0XCJsYW5nZFwiOiBcIuKmkVwiLFxuXHRcImxhbmdsZVwiOiBcIuKfqFwiLFxuXHRcImxhcFwiOiBcIuKqhVwiLFxuXHRcIkxhcGxhY2V0cmZcIjogXCLihJJcIixcblx0XCJsYXF1b1wiOiBcIsKrXCIsXG5cdFwibGFycmJcIjogXCLih6RcIixcblx0XCJsYXJyYmZzXCI6IFwi4qSfXCIsXG5cdFwibGFyclwiOiBcIuKGkFwiLFxuXHRcIkxhcnJcIjogXCLihp5cIixcblx0XCJsQXJyXCI6IFwi4oeQXCIsXG5cdFwibGFycmZzXCI6IFwi4qSdXCIsXG5cdFwibGFycmhrXCI6IFwi4oapXCIsXG5cdFwibGFycmxwXCI6IFwi4oarXCIsXG5cdFwibGFycnBsXCI6IFwi4qS5XCIsXG5cdFwibGFycnNpbVwiOiBcIuKls1wiLFxuXHRcImxhcnJ0bFwiOiBcIuKGolwiLFxuXHRcImxhdGFpbFwiOiBcIuKkmVwiLFxuXHRcImxBdGFpbFwiOiBcIuKkm1wiLFxuXHRcImxhdFwiOiBcIuKqq1wiLFxuXHRcImxhdGVcIjogXCLiqq1cIixcblx0XCJsYXRlc1wiOiBcIuKqre+4gFwiLFxuXHRcImxiYXJyXCI6IFwi4qSMXCIsXG5cdFwibEJhcnJcIjogXCLipI5cIixcblx0XCJsYmJya1wiOiBcIuKdslwiLFxuXHRcImxicmFjZVwiOiBcIntcIixcblx0XCJsYnJhY2tcIjogXCJbXCIsXG5cdFwibGJya2VcIjogXCLipotcIixcblx0XCJsYnJrc2xkXCI6IFwi4qaPXCIsXG5cdFwibGJya3NsdVwiOiBcIuKmjVwiLFxuXHRcIkxjYXJvblwiOiBcIsS9XCIsXG5cdFwibGNhcm9uXCI6IFwixL5cIixcblx0XCJMY2VkaWxcIjogXCLEu1wiLFxuXHRcImxjZWRpbFwiOiBcIsS8XCIsXG5cdFwibGNlaWxcIjogXCLijIhcIixcblx0XCJsY3ViXCI6IFwie1wiLFxuXHRcIkxjeVwiOiBcItCbXCIsXG5cdFwibGN5XCI6IFwi0LtcIixcblx0XCJsZGNhXCI6IFwi4qS2XCIsXG5cdFwibGRxdW9cIjogXCLigJxcIixcblx0XCJsZHF1b3JcIjogXCLigJ5cIixcblx0XCJsZHJkaGFyXCI6IFwi4qWnXCIsXG5cdFwibGRydXNoYXJcIjogXCLipYtcIixcblx0XCJsZHNoXCI6IFwi4oayXCIsXG5cdFwibGVcIjogXCLiiaRcIixcblx0XCJsRVwiOiBcIuKJplwiLFxuXHRcIkxlZnRBbmdsZUJyYWNrZXRcIjogXCLin6hcIixcblx0XCJMZWZ0QXJyb3dCYXJcIjogXCLih6RcIixcblx0XCJsZWZ0YXJyb3dcIjogXCLihpBcIixcblx0XCJMZWZ0QXJyb3dcIjogXCLihpBcIixcblx0XCJMZWZ0YXJyb3dcIjogXCLih5BcIixcblx0XCJMZWZ0QXJyb3dSaWdodEFycm93XCI6IFwi4oeGXCIsXG5cdFwibGVmdGFycm93dGFpbFwiOiBcIuKGolwiLFxuXHRcIkxlZnRDZWlsaW5nXCI6IFwi4oyIXCIsXG5cdFwiTGVmdERvdWJsZUJyYWNrZXRcIjogXCLin6ZcIixcblx0XCJMZWZ0RG93blRlZVZlY3RvclwiOiBcIuKloVwiLFxuXHRcIkxlZnREb3duVmVjdG9yQmFyXCI6IFwi4qWZXCIsXG5cdFwiTGVmdERvd25WZWN0b3JcIjogXCLih4NcIixcblx0XCJMZWZ0Rmxvb3JcIjogXCLijIpcIixcblx0XCJsZWZ0aGFycG9vbmRvd25cIjogXCLihr1cIixcblx0XCJsZWZ0aGFycG9vbnVwXCI6IFwi4oa8XCIsXG5cdFwibGVmdGxlZnRhcnJvd3NcIjogXCLih4dcIixcblx0XCJsZWZ0cmlnaHRhcnJvd1wiOiBcIuKGlFwiLFxuXHRcIkxlZnRSaWdodEFycm93XCI6IFwi4oaUXCIsXG5cdFwiTGVmdHJpZ2h0YXJyb3dcIjogXCLih5RcIixcblx0XCJsZWZ0cmlnaHRhcnJvd3NcIjogXCLih4ZcIixcblx0XCJsZWZ0cmlnaHRoYXJwb29uc1wiOiBcIuKHi1wiLFxuXHRcImxlZnRyaWdodHNxdWlnYXJyb3dcIjogXCLihq1cIixcblx0XCJMZWZ0UmlnaHRWZWN0b3JcIjogXCLipY5cIixcblx0XCJMZWZ0VGVlQXJyb3dcIjogXCLihqRcIixcblx0XCJMZWZ0VGVlXCI6IFwi4oqjXCIsXG5cdFwiTGVmdFRlZVZlY3RvclwiOiBcIuKlmlwiLFxuXHRcImxlZnR0aHJlZXRpbWVzXCI6IFwi4ouLXCIsXG5cdFwiTGVmdFRyaWFuZ2xlQmFyXCI6IFwi4qePXCIsXG5cdFwiTGVmdFRyaWFuZ2xlXCI6IFwi4oqyXCIsXG5cdFwiTGVmdFRyaWFuZ2xlRXF1YWxcIjogXCLiirRcIixcblx0XCJMZWZ0VXBEb3duVmVjdG9yXCI6IFwi4qWRXCIsXG5cdFwiTGVmdFVwVGVlVmVjdG9yXCI6IFwi4qWgXCIsXG5cdFwiTGVmdFVwVmVjdG9yQmFyXCI6IFwi4qWYXCIsXG5cdFwiTGVmdFVwVmVjdG9yXCI6IFwi4oa/XCIsXG5cdFwiTGVmdFZlY3RvckJhclwiOiBcIuKlklwiLFxuXHRcIkxlZnRWZWN0b3JcIjogXCLihrxcIixcblx0XCJsRWdcIjogXCLiqotcIixcblx0XCJsZWdcIjogXCLii5pcIixcblx0XCJsZXFcIjogXCLiiaRcIixcblx0XCJsZXFxXCI6IFwi4ommXCIsXG5cdFwibGVxc2xhbnRcIjogXCLiqb1cIixcblx0XCJsZXNjY1wiOiBcIuKqqFwiLFxuXHRcImxlc1wiOiBcIuKpvVwiLFxuXHRcImxlc2RvdFwiOiBcIuKpv1wiLFxuXHRcImxlc2RvdG9cIjogXCLiqoFcIixcblx0XCJsZXNkb3RvclwiOiBcIuKqg1wiLFxuXHRcImxlc2dcIjogXCLii5rvuIBcIixcblx0XCJsZXNnZXNcIjogXCLiqpNcIixcblx0XCJsZXNzYXBwcm94XCI6IFwi4qqFXCIsXG5cdFwibGVzc2RvdFwiOiBcIuKLllwiLFxuXHRcImxlc3NlcWd0clwiOiBcIuKLmlwiLFxuXHRcImxlc3NlcXFndHJcIjogXCLiqotcIixcblx0XCJMZXNzRXF1YWxHcmVhdGVyXCI6IFwi4ouaXCIsXG5cdFwiTGVzc0Z1bGxFcXVhbFwiOiBcIuKJplwiLFxuXHRcIkxlc3NHcmVhdGVyXCI6IFwi4om2XCIsXG5cdFwibGVzc2d0clwiOiBcIuKJtlwiLFxuXHRcIkxlc3NMZXNzXCI6IFwi4qqhXCIsXG5cdFwibGVzc3NpbVwiOiBcIuKJslwiLFxuXHRcIkxlc3NTbGFudEVxdWFsXCI6IFwi4qm9XCIsXG5cdFwiTGVzc1RpbGRlXCI6IFwi4omyXCIsXG5cdFwibGZpc2h0XCI6IFwi4qW8XCIsXG5cdFwibGZsb29yXCI6IFwi4oyKXCIsXG5cdFwiTGZyXCI6IFwi8J2Uj1wiLFxuXHRcImxmclwiOiBcIvCdlKlcIixcblx0XCJsZ1wiOiBcIuKJtlwiLFxuXHRcImxnRVwiOiBcIuKqkVwiLFxuXHRcImxIYXJcIjogXCLipaJcIixcblx0XCJsaGFyZFwiOiBcIuKGvVwiLFxuXHRcImxoYXJ1XCI6IFwi4oa8XCIsXG5cdFwibGhhcnVsXCI6IFwi4qWqXCIsXG5cdFwibGhibGtcIjogXCLiloRcIixcblx0XCJMSmN5XCI6IFwi0IlcIixcblx0XCJsamN5XCI6IFwi0ZlcIixcblx0XCJsbGFyclwiOiBcIuKHh1wiLFxuXHRcImxsXCI6IFwi4omqXCIsXG5cdFwiTGxcIjogXCLii5hcIixcblx0XCJsbGNvcm5lclwiOiBcIuKMnlwiLFxuXHRcIkxsZWZ0YXJyb3dcIjogXCLih5pcIixcblx0XCJsbGhhcmRcIjogXCLipatcIixcblx0XCJsbHRyaVwiOiBcIuKXulwiLFxuXHRcIkxtaWRvdFwiOiBcIsS/XCIsXG5cdFwibG1pZG90XCI6IFwixYBcIixcblx0XCJsbW91c3RhY2hlXCI6IFwi4o6wXCIsXG5cdFwibG1vdXN0XCI6IFwi4o6wXCIsXG5cdFwibG5hcFwiOiBcIuKqiVwiLFxuXHRcImxuYXBwcm94XCI6IFwi4qqJXCIsXG5cdFwibG5lXCI6IFwi4qqHXCIsXG5cdFwibG5FXCI6IFwi4omoXCIsXG5cdFwibG5lcVwiOiBcIuKqh1wiLFxuXHRcImxuZXFxXCI6IFwi4omoXCIsXG5cdFwibG5zaW1cIjogXCLii6ZcIixcblx0XCJsb2FuZ1wiOiBcIuKfrFwiLFxuXHRcImxvYXJyXCI6IFwi4oe9XCIsXG5cdFwibG9icmtcIjogXCLin6ZcIixcblx0XCJsb25nbGVmdGFycm93XCI6IFwi4p+1XCIsXG5cdFwiTG9uZ0xlZnRBcnJvd1wiOiBcIuKftVwiLFxuXHRcIkxvbmdsZWZ0YXJyb3dcIjogXCLin7hcIixcblx0XCJsb25nbGVmdHJpZ2h0YXJyb3dcIjogXCLin7dcIixcblx0XCJMb25nTGVmdFJpZ2h0QXJyb3dcIjogXCLin7dcIixcblx0XCJMb25nbGVmdHJpZ2h0YXJyb3dcIjogXCLin7pcIixcblx0XCJsb25nbWFwc3RvXCI6IFwi4p+8XCIsXG5cdFwibG9uZ3JpZ2h0YXJyb3dcIjogXCLin7ZcIixcblx0XCJMb25nUmlnaHRBcnJvd1wiOiBcIuKftlwiLFxuXHRcIkxvbmdyaWdodGFycm93XCI6IFwi4p+5XCIsXG5cdFwibG9vcGFycm93bGVmdFwiOiBcIuKGq1wiLFxuXHRcImxvb3BhcnJvd3JpZ2h0XCI6IFwi4oasXCIsXG5cdFwibG9wYXJcIjogXCLipoVcIixcblx0XCJMb3BmXCI6IFwi8J2Vg1wiLFxuXHRcImxvcGZcIjogXCLwnZWdXCIsXG5cdFwibG9wbHVzXCI6IFwi4qitXCIsXG5cdFwibG90aW1lc1wiOiBcIuKotFwiLFxuXHRcImxvd2FzdFwiOiBcIuKIl1wiLFxuXHRcImxvd2JhclwiOiBcIl9cIixcblx0XCJMb3dlckxlZnRBcnJvd1wiOiBcIuKGmVwiLFxuXHRcIkxvd2VyUmlnaHRBcnJvd1wiOiBcIuKGmFwiLFxuXHRcImxvelwiOiBcIuKXilwiLFxuXHRcImxvemVuZ2VcIjogXCLil4pcIixcblx0XCJsb3pmXCI6IFwi4qerXCIsXG5cdFwibHBhclwiOiBcIihcIixcblx0XCJscGFybHRcIjogXCLippNcIixcblx0XCJscmFyclwiOiBcIuKHhlwiLFxuXHRcImxyY29ybmVyXCI6IFwi4oyfXCIsXG5cdFwibHJoYXJcIjogXCLih4tcIixcblx0XCJscmhhcmRcIjogXCLipa1cIixcblx0XCJscm1cIjogXCLigI5cIixcblx0XCJscnRyaVwiOiBcIuKKv1wiLFxuXHRcImxzYXF1b1wiOiBcIuKAuVwiLFxuXHRcImxzY3JcIjogXCLwnZOBXCIsXG5cdFwiTHNjclwiOiBcIuKEklwiLFxuXHRcImxzaFwiOiBcIuKGsFwiLFxuXHRcIkxzaFwiOiBcIuKGsFwiLFxuXHRcImxzaW1cIjogXCLiibJcIixcblx0XCJsc2ltZVwiOiBcIuKqjVwiLFxuXHRcImxzaW1nXCI6IFwi4qqPXCIsXG5cdFwibHNxYlwiOiBcIltcIixcblx0XCJsc3F1b1wiOiBcIuKAmFwiLFxuXHRcImxzcXVvclwiOiBcIuKAmlwiLFxuXHRcIkxzdHJva1wiOiBcIsWBXCIsXG5cdFwibHN0cm9rXCI6IFwixYJcIixcblx0XCJsdGNjXCI6IFwi4qqmXCIsXG5cdFwibHRjaXJcIjogXCLiqblcIixcblx0XCJsdFwiOiBcIjxcIixcblx0XCJMVFwiOiBcIjxcIixcblx0XCJMdFwiOiBcIuKJqlwiLFxuXHRcImx0ZG90XCI6IFwi4ouWXCIsXG5cdFwibHRocmVlXCI6IFwi4ouLXCIsXG5cdFwibHRpbWVzXCI6IFwi4ouJXCIsXG5cdFwibHRsYXJyXCI6IFwi4qW2XCIsXG5cdFwibHRxdWVzdFwiOiBcIuKpu1wiLFxuXHRcImx0cmlcIjogXCLil4NcIixcblx0XCJsdHJpZVwiOiBcIuKKtFwiLFxuXHRcImx0cmlmXCI6IFwi4peCXCIsXG5cdFwibHRyUGFyXCI6IFwi4qaWXCIsXG5cdFwibHVyZHNoYXJcIjogXCLipYpcIixcblx0XCJsdXJ1aGFyXCI6IFwi4qWmXCIsXG5cdFwibHZlcnRuZXFxXCI6IFwi4omo77iAXCIsXG5cdFwibHZuRVwiOiBcIuKJqO+4gFwiLFxuXHRcIm1hY3JcIjogXCLCr1wiLFxuXHRcIm1hbGVcIjogXCLimYJcIixcblx0XCJtYWx0XCI6IFwi4pygXCIsXG5cdFwibWFsdGVzZVwiOiBcIuKcoFwiLFxuXHRcIk1hcFwiOiBcIuKkhVwiLFxuXHRcIm1hcFwiOiBcIuKGplwiLFxuXHRcIm1hcHN0b1wiOiBcIuKGplwiLFxuXHRcIm1hcHN0b2Rvd25cIjogXCLihqdcIixcblx0XCJtYXBzdG9sZWZ0XCI6IFwi4oakXCIsXG5cdFwibWFwc3RvdXBcIjogXCLihqVcIixcblx0XCJtYXJrZXJcIjogXCLilq5cIixcblx0XCJtY29tbWFcIjogXCLiqKlcIixcblx0XCJNY3lcIjogXCLQnFwiLFxuXHRcIm1jeVwiOiBcItC8XCIsXG5cdFwibWRhc2hcIjogXCLigJRcIixcblx0XCJtRERvdFwiOiBcIuKIulwiLFxuXHRcIm1lYXN1cmVkYW5nbGVcIjogXCLiiKFcIixcblx0XCJNZWRpdW1TcGFjZVwiOiBcIuKBn1wiLFxuXHRcIk1lbGxpbnRyZlwiOiBcIuKEs1wiLFxuXHRcIk1mclwiOiBcIvCdlJBcIixcblx0XCJtZnJcIjogXCLwnZSqXCIsXG5cdFwibWhvXCI6IFwi4oSnXCIsXG5cdFwibWljcm9cIjogXCLCtVwiLFxuXHRcIm1pZGFzdFwiOiBcIipcIixcblx0XCJtaWRjaXJcIjogXCLiq7BcIixcblx0XCJtaWRcIjogXCLiiKNcIixcblx0XCJtaWRkb3RcIjogXCLCt1wiLFxuXHRcIm1pbnVzYlwiOiBcIuKKn1wiLFxuXHRcIm1pbnVzXCI6IFwi4oiSXCIsXG5cdFwibWludXNkXCI6IFwi4oi4XCIsXG5cdFwibWludXNkdVwiOiBcIuKoqlwiLFxuXHRcIk1pbnVzUGx1c1wiOiBcIuKIk1wiLFxuXHRcIm1sY3BcIjogXCLiq5tcIixcblx0XCJtbGRyXCI6IFwi4oCmXCIsXG5cdFwibW5wbHVzXCI6IFwi4oiTXCIsXG5cdFwibW9kZWxzXCI6IFwi4oqnXCIsXG5cdFwiTW9wZlwiOiBcIvCdlYRcIixcblx0XCJtb3BmXCI6IFwi8J2VnlwiLFxuXHRcIm1wXCI6IFwi4oiTXCIsXG5cdFwibXNjclwiOiBcIvCdk4JcIixcblx0XCJNc2NyXCI6IFwi4oSzXCIsXG5cdFwibXN0cG9zXCI6IFwi4oi+XCIsXG5cdFwiTXVcIjogXCLOnFwiLFxuXHRcIm11XCI6IFwizrxcIixcblx0XCJtdWx0aW1hcFwiOiBcIuKKuFwiLFxuXHRcIm11bWFwXCI6IFwi4oq4XCIsXG5cdFwibmFibGFcIjogXCLiiIdcIixcblx0XCJOYWN1dGVcIjogXCLFg1wiLFxuXHRcIm5hY3V0ZVwiOiBcIsWEXCIsXG5cdFwibmFuZ1wiOiBcIuKIoOKDklwiLFxuXHRcIm5hcFwiOiBcIuKJiVwiLFxuXHRcIm5hcEVcIjogXCLiqbDMuFwiLFxuXHRcIm5hcGlkXCI6IFwi4omLzLhcIixcblx0XCJuYXBvc1wiOiBcIsWJXCIsXG5cdFwibmFwcHJveFwiOiBcIuKJiVwiLFxuXHRcIm5hdHVyYWxcIjogXCLima5cIixcblx0XCJuYXR1cmFsc1wiOiBcIuKElVwiLFxuXHRcIm5hdHVyXCI6IFwi4pmuXCIsXG5cdFwibmJzcFwiOiBcIsKgXCIsXG5cdFwibmJ1bXBcIjogXCLiiY7MuFwiLFxuXHRcIm5idW1wZVwiOiBcIuKJj8y4XCIsXG5cdFwibmNhcFwiOiBcIuKpg1wiLFxuXHRcIk5jYXJvblwiOiBcIsWHXCIsXG5cdFwibmNhcm9uXCI6IFwixYhcIixcblx0XCJOY2VkaWxcIjogXCLFhVwiLFxuXHRcIm5jZWRpbFwiOiBcIsWGXCIsXG5cdFwibmNvbmdcIjogXCLiiYdcIixcblx0XCJuY29uZ2RvdFwiOiBcIuKprcy4XCIsXG5cdFwibmN1cFwiOiBcIuKpglwiLFxuXHRcIk5jeVwiOiBcItCdXCIsXG5cdFwibmN5XCI6IFwi0L1cIixcblx0XCJuZGFzaFwiOiBcIuKAk1wiLFxuXHRcIm5lYXJoa1wiOiBcIuKkpFwiLFxuXHRcIm5lYXJyXCI6IFwi4oaXXCIsXG5cdFwibmVBcnJcIjogXCLih5dcIixcblx0XCJuZWFycm93XCI6IFwi4oaXXCIsXG5cdFwibmVcIjogXCLiiaBcIixcblx0XCJuZWRvdFwiOiBcIuKJkMy4XCIsXG5cdFwiTmVnYXRpdmVNZWRpdW1TcGFjZVwiOiBcIuKAi1wiLFxuXHRcIk5lZ2F0aXZlVGhpY2tTcGFjZVwiOiBcIuKAi1wiLFxuXHRcIk5lZ2F0aXZlVGhpblNwYWNlXCI6IFwi4oCLXCIsXG5cdFwiTmVnYXRpdmVWZXJ5VGhpblNwYWNlXCI6IFwi4oCLXCIsXG5cdFwibmVxdWl2XCI6IFwi4omiXCIsXG5cdFwibmVzZWFyXCI6IFwi4qSoXCIsXG5cdFwibmVzaW1cIjogXCLiiYLMuFwiLFxuXHRcIk5lc3RlZEdyZWF0ZXJHcmVhdGVyXCI6IFwi4omrXCIsXG5cdFwiTmVzdGVkTGVzc0xlc3NcIjogXCLiiapcIixcblx0XCJOZXdMaW5lXCI6IFwiXFxuXCIsXG5cdFwibmV4aXN0XCI6IFwi4oiEXCIsXG5cdFwibmV4aXN0c1wiOiBcIuKIhFwiLFxuXHRcIk5mclwiOiBcIvCdlJFcIixcblx0XCJuZnJcIjogXCLwnZSrXCIsXG5cdFwibmdFXCI6IFwi4omnzLhcIixcblx0XCJuZ2VcIjogXCLiibFcIixcblx0XCJuZ2VxXCI6IFwi4omxXCIsXG5cdFwibmdlcXFcIjogXCLiiafMuFwiLFxuXHRcIm5nZXFzbGFudFwiOiBcIuKpvsy4XCIsXG5cdFwibmdlc1wiOiBcIuKpvsy4XCIsXG5cdFwibkdnXCI6IFwi4ouZzLhcIixcblx0XCJuZ3NpbVwiOiBcIuKJtVwiLFxuXHRcIm5HdFwiOiBcIuKJq+KDklwiLFxuXHRcIm5ndFwiOiBcIuKJr1wiLFxuXHRcIm5ndHJcIjogXCLiia9cIixcblx0XCJuR3R2XCI6IFwi4omrzLhcIixcblx0XCJuaGFyclwiOiBcIuKGrlwiLFxuXHRcIm5oQXJyXCI6IFwi4oeOXCIsXG5cdFwibmhwYXJcIjogXCLiq7JcIixcblx0XCJuaVwiOiBcIuKIi1wiLFxuXHRcIm5pc1wiOiBcIuKLvFwiLFxuXHRcIm5pc2RcIjogXCLii7pcIixcblx0XCJuaXZcIjogXCLiiItcIixcblx0XCJOSmN5XCI6IFwi0IpcIixcblx0XCJuamN5XCI6IFwi0ZpcIixcblx0XCJubGFyclwiOiBcIuKGmlwiLFxuXHRcIm5sQXJyXCI6IFwi4oeNXCIsXG5cdFwibmxkclwiOiBcIuKApVwiLFxuXHRcIm5sRVwiOiBcIuKJpsy4XCIsXG5cdFwibmxlXCI6IFwi4omwXCIsXG5cdFwibmxlZnRhcnJvd1wiOiBcIuKGmlwiLFxuXHRcIm5MZWZ0YXJyb3dcIjogXCLih41cIixcblx0XCJubGVmdHJpZ2h0YXJyb3dcIjogXCLihq5cIixcblx0XCJuTGVmdHJpZ2h0YXJyb3dcIjogXCLih45cIixcblx0XCJubGVxXCI6IFwi4omwXCIsXG5cdFwibmxlcXFcIjogXCLiiabMuFwiLFxuXHRcIm5sZXFzbGFudFwiOiBcIuKpvcy4XCIsXG5cdFwibmxlc1wiOiBcIuKpvcy4XCIsXG5cdFwibmxlc3NcIjogXCLiia5cIixcblx0XCJuTGxcIjogXCLii5jMuFwiLFxuXHRcIm5sc2ltXCI6IFwi4om0XCIsXG5cdFwibkx0XCI6IFwi4omq4oOSXCIsXG5cdFwibmx0XCI6IFwi4omuXCIsXG5cdFwibmx0cmlcIjogXCLii6pcIixcblx0XCJubHRyaWVcIjogXCLii6xcIixcblx0XCJuTHR2XCI6IFwi4omqzLhcIixcblx0XCJubWlkXCI6IFwi4oikXCIsXG5cdFwiTm9CcmVha1wiOiBcIuKBoFwiLFxuXHRcIk5vbkJyZWFraW5nU3BhY2VcIjogXCLCoFwiLFxuXHRcIm5vcGZcIjogXCLwnZWfXCIsXG5cdFwiTm9wZlwiOiBcIuKElVwiLFxuXHRcIk5vdFwiOiBcIuKrrFwiLFxuXHRcIm5vdFwiOiBcIsKsXCIsXG5cdFwiTm90Q29uZ3J1ZW50XCI6IFwi4omiXCIsXG5cdFwiTm90Q3VwQ2FwXCI6IFwi4omtXCIsXG5cdFwiTm90RG91YmxlVmVydGljYWxCYXJcIjogXCLiiKZcIixcblx0XCJOb3RFbGVtZW50XCI6IFwi4oiJXCIsXG5cdFwiTm90RXF1YWxcIjogXCLiiaBcIixcblx0XCJOb3RFcXVhbFRpbGRlXCI6IFwi4omCzLhcIixcblx0XCJOb3RFeGlzdHNcIjogXCLiiIRcIixcblx0XCJOb3RHcmVhdGVyXCI6IFwi4omvXCIsXG5cdFwiTm90R3JlYXRlckVxdWFsXCI6IFwi4omxXCIsXG5cdFwiTm90R3JlYXRlckZ1bGxFcXVhbFwiOiBcIuKJp8y4XCIsXG5cdFwiTm90R3JlYXRlckdyZWF0ZXJcIjogXCLiiavMuFwiLFxuXHRcIk5vdEdyZWF0ZXJMZXNzXCI6IFwi4om5XCIsXG5cdFwiTm90R3JlYXRlclNsYW50RXF1YWxcIjogXCLiqb7MuFwiLFxuXHRcIk5vdEdyZWF0ZXJUaWxkZVwiOiBcIuKJtVwiLFxuXHRcIk5vdEh1bXBEb3duSHVtcFwiOiBcIuKJjsy4XCIsXG5cdFwiTm90SHVtcEVxdWFsXCI6IFwi4omPzLhcIixcblx0XCJub3RpblwiOiBcIuKIiVwiLFxuXHRcIm5vdGluZG90XCI6IFwi4ou1zLhcIixcblx0XCJub3RpbkVcIjogXCLii7nMuFwiLFxuXHRcIm5vdGludmFcIjogXCLiiIlcIixcblx0XCJub3RpbnZiXCI6IFwi4ou3XCIsXG5cdFwibm90aW52Y1wiOiBcIuKLtlwiLFxuXHRcIk5vdExlZnRUcmlhbmdsZUJhclwiOiBcIuKnj8y4XCIsXG5cdFwiTm90TGVmdFRyaWFuZ2xlXCI6IFwi4ouqXCIsXG5cdFwiTm90TGVmdFRyaWFuZ2xlRXF1YWxcIjogXCLii6xcIixcblx0XCJOb3RMZXNzXCI6IFwi4omuXCIsXG5cdFwiTm90TGVzc0VxdWFsXCI6IFwi4omwXCIsXG5cdFwiTm90TGVzc0dyZWF0ZXJcIjogXCLiibhcIixcblx0XCJOb3RMZXNzTGVzc1wiOiBcIuKJqsy4XCIsXG5cdFwiTm90TGVzc1NsYW50RXF1YWxcIjogXCLiqb3MuFwiLFxuXHRcIk5vdExlc3NUaWxkZVwiOiBcIuKJtFwiLFxuXHRcIk5vdE5lc3RlZEdyZWF0ZXJHcmVhdGVyXCI6IFwi4qqizLhcIixcblx0XCJOb3ROZXN0ZWRMZXNzTGVzc1wiOiBcIuKqocy4XCIsXG5cdFwibm90bmlcIjogXCLiiIxcIixcblx0XCJub3RuaXZhXCI6IFwi4oiMXCIsXG5cdFwibm90bml2YlwiOiBcIuKLvlwiLFxuXHRcIm5vdG5pdmNcIjogXCLii71cIixcblx0XCJOb3RQcmVjZWRlc1wiOiBcIuKKgFwiLFxuXHRcIk5vdFByZWNlZGVzRXF1YWxcIjogXCLiqq/MuFwiLFxuXHRcIk5vdFByZWNlZGVzU2xhbnRFcXVhbFwiOiBcIuKLoFwiLFxuXHRcIk5vdFJldmVyc2VFbGVtZW50XCI6IFwi4oiMXCIsXG5cdFwiTm90UmlnaHRUcmlhbmdsZUJhclwiOiBcIuKnkMy4XCIsXG5cdFwiTm90UmlnaHRUcmlhbmdsZVwiOiBcIuKLq1wiLFxuXHRcIk5vdFJpZ2h0VHJpYW5nbGVFcXVhbFwiOiBcIuKLrVwiLFxuXHRcIk5vdFNxdWFyZVN1YnNldFwiOiBcIuKKj8y4XCIsXG5cdFwiTm90U3F1YXJlU3Vic2V0RXF1YWxcIjogXCLii6JcIixcblx0XCJOb3RTcXVhcmVTdXBlcnNldFwiOiBcIuKKkMy4XCIsXG5cdFwiTm90U3F1YXJlU3VwZXJzZXRFcXVhbFwiOiBcIuKLo1wiLFxuXHRcIk5vdFN1YnNldFwiOiBcIuKKguKDklwiLFxuXHRcIk5vdFN1YnNldEVxdWFsXCI6IFwi4oqIXCIsXG5cdFwiTm90U3VjY2VlZHNcIjogXCLiioFcIixcblx0XCJOb3RTdWNjZWVkc0VxdWFsXCI6IFwi4qqwzLhcIixcblx0XCJOb3RTdWNjZWVkc1NsYW50RXF1YWxcIjogXCLii6FcIixcblx0XCJOb3RTdWNjZWVkc1RpbGRlXCI6IFwi4om/zLhcIixcblx0XCJOb3RTdXBlcnNldFwiOiBcIuKKg+KDklwiLFxuXHRcIk5vdFN1cGVyc2V0RXF1YWxcIjogXCLiiolcIixcblx0XCJOb3RUaWxkZVwiOiBcIuKJgVwiLFxuXHRcIk5vdFRpbGRlRXF1YWxcIjogXCLiiYRcIixcblx0XCJOb3RUaWxkZUZ1bGxFcXVhbFwiOiBcIuKJh1wiLFxuXHRcIk5vdFRpbGRlVGlsZGVcIjogXCLiiYlcIixcblx0XCJOb3RWZXJ0aWNhbEJhclwiOiBcIuKIpFwiLFxuXHRcIm5wYXJhbGxlbFwiOiBcIuKIplwiLFxuXHRcIm5wYXJcIjogXCLiiKZcIixcblx0XCJucGFyc2xcIjogXCLiq73ig6VcIixcblx0XCJucGFydFwiOiBcIuKIgsy4XCIsXG5cdFwibnBvbGludFwiOiBcIuKolFwiLFxuXHRcIm5wclwiOiBcIuKKgFwiLFxuXHRcIm5wcmN1ZVwiOiBcIuKLoFwiLFxuXHRcIm5wcmVjXCI6IFwi4oqAXCIsXG5cdFwibnByZWNlcVwiOiBcIuKqr8y4XCIsXG5cdFwibnByZVwiOiBcIuKqr8y4XCIsXG5cdFwibnJhcnJjXCI6IFwi4qSzzLhcIixcblx0XCJucmFyclwiOiBcIuKGm1wiLFxuXHRcIm5yQXJyXCI6IFwi4oePXCIsXG5cdFwibnJhcnJ3XCI6IFwi4oadzLhcIixcblx0XCJucmlnaHRhcnJvd1wiOiBcIuKGm1wiLFxuXHRcIm5SaWdodGFycm93XCI6IFwi4oePXCIsXG5cdFwibnJ0cmlcIjogXCLii6tcIixcblx0XCJucnRyaWVcIjogXCLii61cIixcblx0XCJuc2NcIjogXCLiioFcIixcblx0XCJuc2NjdWVcIjogXCLii6FcIixcblx0XCJuc2NlXCI6IFwi4qqwzLhcIixcblx0XCJOc2NyXCI6IFwi8J2SqVwiLFxuXHRcIm5zY3JcIjogXCLwnZODXCIsXG5cdFwibnNob3J0bWlkXCI6IFwi4oikXCIsXG5cdFwibnNob3J0cGFyYWxsZWxcIjogXCLiiKZcIixcblx0XCJuc2ltXCI6IFwi4omBXCIsXG5cdFwibnNpbWVcIjogXCLiiYRcIixcblx0XCJuc2ltZXFcIjogXCLiiYRcIixcblx0XCJuc21pZFwiOiBcIuKIpFwiLFxuXHRcIm5zcGFyXCI6IFwi4oimXCIsXG5cdFwibnNxc3ViZVwiOiBcIuKLolwiLFxuXHRcIm5zcXN1cGVcIjogXCLii6NcIixcblx0XCJuc3ViXCI6IFwi4oqEXCIsXG5cdFwibnN1YkVcIjogXCLiq4XMuFwiLFxuXHRcIm5zdWJlXCI6IFwi4oqIXCIsXG5cdFwibnN1YnNldFwiOiBcIuKKguKDklwiLFxuXHRcIm5zdWJzZXRlcVwiOiBcIuKKiFwiLFxuXHRcIm5zdWJzZXRlcXFcIjogXCLiq4XMuFwiLFxuXHRcIm5zdWNjXCI6IFwi4oqBXCIsXG5cdFwibnN1Y2NlcVwiOiBcIuKqsMy4XCIsXG5cdFwibnN1cFwiOiBcIuKKhVwiLFxuXHRcIm5zdXBFXCI6IFwi4quGzLhcIixcblx0XCJuc3VwZVwiOiBcIuKKiVwiLFxuXHRcIm5zdXBzZXRcIjogXCLiioPig5JcIixcblx0XCJuc3Vwc2V0ZXFcIjogXCLiiolcIixcblx0XCJuc3Vwc2V0ZXFxXCI6IFwi4quGzLhcIixcblx0XCJudGdsXCI6IFwi4om5XCIsXG5cdFwiTnRpbGRlXCI6IFwiw5FcIixcblx0XCJudGlsZGVcIjogXCLDsVwiLFxuXHRcIm50bGdcIjogXCLiibhcIixcblx0XCJudHJpYW5nbGVsZWZ0XCI6IFwi4ouqXCIsXG5cdFwibnRyaWFuZ2xlbGVmdGVxXCI6IFwi4ousXCIsXG5cdFwibnRyaWFuZ2xlcmlnaHRcIjogXCLii6tcIixcblx0XCJudHJpYW5nbGVyaWdodGVxXCI6IFwi4outXCIsXG5cdFwiTnVcIjogXCLOnVwiLFxuXHRcIm51XCI6IFwizr1cIixcblx0XCJudW1cIjogXCIjXCIsXG5cdFwibnVtZXJvXCI6IFwi4oSWXCIsXG5cdFwibnVtc3BcIjogXCLigIdcIixcblx0XCJudmFwXCI6IFwi4omN4oOSXCIsXG5cdFwibnZkYXNoXCI6IFwi4oqsXCIsXG5cdFwibnZEYXNoXCI6IFwi4oqtXCIsXG5cdFwiblZkYXNoXCI6IFwi4oquXCIsXG5cdFwiblZEYXNoXCI6IFwi4oqvXCIsXG5cdFwibnZnZVwiOiBcIuKJpeKDklwiLFxuXHRcIm52Z3RcIjogXCI+4oOSXCIsXG5cdFwibnZIYXJyXCI6IFwi4qSEXCIsXG5cdFwibnZpbmZpblwiOiBcIuKnnlwiLFxuXHRcIm52bEFyclwiOiBcIuKkglwiLFxuXHRcIm52bGVcIjogXCLiiaTig5JcIixcblx0XCJudmx0XCI6IFwiPOKDklwiLFxuXHRcIm52bHRyaWVcIjogXCLiirTig5JcIixcblx0XCJudnJBcnJcIjogXCLipINcIixcblx0XCJudnJ0cmllXCI6IFwi4oq14oOSXCIsXG5cdFwibnZzaW1cIjogXCLiiLzig5JcIixcblx0XCJud2FyaGtcIjogXCLipKNcIixcblx0XCJud2FyclwiOiBcIuKGllwiLFxuXHRcIm53QXJyXCI6IFwi4oeWXCIsXG5cdFwibndhcnJvd1wiOiBcIuKGllwiLFxuXHRcIm53bmVhclwiOiBcIuKkp1wiLFxuXHRcIk9hY3V0ZVwiOiBcIsOTXCIsXG5cdFwib2FjdXRlXCI6IFwiw7NcIixcblx0XCJvYXN0XCI6IFwi4oqbXCIsXG5cdFwiT2NpcmNcIjogXCLDlFwiLFxuXHRcIm9jaXJjXCI6IFwiw7RcIixcblx0XCJvY2lyXCI6IFwi4oqaXCIsXG5cdFwiT2N5XCI6IFwi0J5cIixcblx0XCJvY3lcIjogXCLQvlwiLFxuXHRcIm9kYXNoXCI6IFwi4oqdXCIsXG5cdFwiT2RibGFjXCI6IFwixZBcIixcblx0XCJvZGJsYWNcIjogXCLFkVwiLFxuXHRcIm9kaXZcIjogXCLiqLhcIixcblx0XCJvZG90XCI6IFwi4oqZXCIsXG5cdFwib2Rzb2xkXCI6IFwi4qa8XCIsXG5cdFwiT0VsaWdcIjogXCLFklwiLFxuXHRcIm9lbGlnXCI6IFwixZNcIixcblx0XCJvZmNpclwiOiBcIuKmv1wiLFxuXHRcIk9mclwiOiBcIvCdlJJcIixcblx0XCJvZnJcIjogXCLwnZSsXCIsXG5cdFwib2dvblwiOiBcIsubXCIsXG5cdFwiT2dyYXZlXCI6IFwiw5JcIixcblx0XCJvZ3JhdmVcIjogXCLDslwiLFxuXHRcIm9ndFwiOiBcIuKngVwiLFxuXHRcIm9oYmFyXCI6IFwi4qa1XCIsXG5cdFwib2htXCI6IFwizqlcIixcblx0XCJvaW50XCI6IFwi4oiuXCIsXG5cdFwib2xhcnJcIjogXCLihrpcIixcblx0XCJvbGNpclwiOiBcIuKmvlwiLFxuXHRcIm9sY3Jvc3NcIjogXCLiprtcIixcblx0XCJvbGluZVwiOiBcIuKAvlwiLFxuXHRcIm9sdFwiOiBcIuKngFwiLFxuXHRcIk9tYWNyXCI6IFwixYxcIixcblx0XCJvbWFjclwiOiBcIsWNXCIsXG5cdFwiT21lZ2FcIjogXCLOqVwiLFxuXHRcIm9tZWdhXCI6IFwiz4lcIixcblx0XCJPbWljcm9uXCI6IFwizp9cIixcblx0XCJvbWljcm9uXCI6IFwizr9cIixcblx0XCJvbWlkXCI6IFwi4qa2XCIsXG5cdFwib21pbnVzXCI6IFwi4oqWXCIsXG5cdFwiT29wZlwiOiBcIvCdlYZcIixcblx0XCJvb3BmXCI6IFwi8J2VoFwiLFxuXHRcIm9wYXJcIjogXCLiprdcIixcblx0XCJPcGVuQ3VybHlEb3VibGVRdW90ZVwiOiBcIuKAnFwiLFxuXHRcIk9wZW5DdXJseVF1b3RlXCI6IFwi4oCYXCIsXG5cdFwib3BlcnBcIjogXCLiprlcIixcblx0XCJvcGx1c1wiOiBcIuKKlVwiLFxuXHRcIm9yYXJyXCI6IFwi4oa7XCIsXG5cdFwiT3JcIjogXCLiqZRcIixcblx0XCJvclwiOiBcIuKIqFwiLFxuXHRcIm9yZFwiOiBcIuKpnVwiLFxuXHRcIm9yZGVyXCI6IFwi4oS0XCIsXG5cdFwib3JkZXJvZlwiOiBcIuKEtFwiLFxuXHRcIm9yZGZcIjogXCLCqlwiLFxuXHRcIm9yZG1cIjogXCLCulwiLFxuXHRcIm9yaWdvZlwiOiBcIuKKtlwiLFxuXHRcIm9yb3JcIjogXCLiqZZcIixcblx0XCJvcnNsb3BlXCI6IFwi4qmXXCIsXG5cdFwib3J2XCI6IFwi4qmbXCIsXG5cdFwib1NcIjogXCLik4hcIixcblx0XCJPc2NyXCI6IFwi8J2SqlwiLFxuXHRcIm9zY3JcIjogXCLihLRcIixcblx0XCJPc2xhc2hcIjogXCLDmFwiLFxuXHRcIm9zbGFzaFwiOiBcIsO4XCIsXG5cdFwib3NvbFwiOiBcIuKKmFwiLFxuXHRcIk90aWxkZVwiOiBcIsOVXCIsXG5cdFwib3RpbGRlXCI6IFwiw7VcIixcblx0XCJvdGltZXNhc1wiOiBcIuKotlwiLFxuXHRcIk90aW1lc1wiOiBcIuKot1wiLFxuXHRcIm90aW1lc1wiOiBcIuKKl1wiLFxuXHRcIk91bWxcIjogXCLDllwiLFxuXHRcIm91bWxcIjogXCLDtlwiLFxuXHRcIm92YmFyXCI6IFwi4oy9XCIsXG5cdFwiT3ZlckJhclwiOiBcIuKAvlwiLFxuXHRcIk92ZXJCcmFjZVwiOiBcIuKPnlwiLFxuXHRcIk92ZXJCcmFja2V0XCI6IFwi4o60XCIsXG5cdFwiT3ZlclBhcmVudGhlc2lzXCI6IFwi4o+cXCIsXG5cdFwicGFyYVwiOiBcIsK2XCIsXG5cdFwicGFyYWxsZWxcIjogXCLiiKVcIixcblx0XCJwYXJcIjogXCLiiKVcIixcblx0XCJwYXJzaW1cIjogXCLiq7NcIixcblx0XCJwYXJzbFwiOiBcIuKrvVwiLFxuXHRcInBhcnRcIjogXCLiiIJcIixcblx0XCJQYXJ0aWFsRFwiOiBcIuKIglwiLFxuXHRcIlBjeVwiOiBcItCfXCIsXG5cdFwicGN5XCI6IFwi0L9cIixcblx0XCJwZXJjbnRcIjogXCIlXCIsXG5cdFwicGVyaW9kXCI6IFwiLlwiLFxuXHRcInBlcm1pbFwiOiBcIuKAsFwiLFxuXHRcInBlcnBcIjogXCLiiqVcIixcblx0XCJwZXJ0ZW5rXCI6IFwi4oCxXCIsXG5cdFwiUGZyXCI6IFwi8J2Uk1wiLFxuXHRcInBmclwiOiBcIvCdlK1cIixcblx0XCJQaGlcIjogXCLOplwiLFxuXHRcInBoaVwiOiBcIs+GXCIsXG5cdFwicGhpdlwiOiBcIs+VXCIsXG5cdFwicGhtbWF0XCI6IFwi4oSzXCIsXG5cdFwicGhvbmVcIjogXCLimI5cIixcblx0XCJQaVwiOiBcIs6gXCIsXG5cdFwicGlcIjogXCLPgFwiLFxuXHRcInBpdGNoZm9ya1wiOiBcIuKLlFwiLFxuXHRcInBpdlwiOiBcIs+WXCIsXG5cdFwicGxhbmNrXCI6IFwi4oSPXCIsXG5cdFwicGxhbmNraFwiOiBcIuKEjlwiLFxuXHRcInBsYW5rdlwiOiBcIuKEj1wiLFxuXHRcInBsdXNhY2lyXCI6IFwi4qijXCIsXG5cdFwicGx1c2JcIjogXCLiip5cIixcblx0XCJwbHVzY2lyXCI6IFwi4qiiXCIsXG5cdFwicGx1c1wiOiBcIitcIixcblx0XCJwbHVzZG9cIjogXCLiiJRcIixcblx0XCJwbHVzZHVcIjogXCLiqKVcIixcblx0XCJwbHVzZVwiOiBcIuKpslwiLFxuXHRcIlBsdXNNaW51c1wiOiBcIsKxXCIsXG5cdFwicGx1c21uXCI6IFwiwrFcIixcblx0XCJwbHVzc2ltXCI6IFwi4qimXCIsXG5cdFwicGx1c3R3b1wiOiBcIuKop1wiLFxuXHRcInBtXCI6IFwiwrFcIixcblx0XCJQb2luY2FyZXBsYW5lXCI6IFwi4oSMXCIsXG5cdFwicG9pbnRpbnRcIjogXCLiqJVcIixcblx0XCJwb3BmXCI6IFwi8J2VoVwiLFxuXHRcIlBvcGZcIjogXCLihJlcIixcblx0XCJwb3VuZFwiOiBcIsKjXCIsXG5cdFwicHJhcFwiOiBcIuKqt1wiLFxuXHRcIlByXCI6IFwi4qq7XCIsXG5cdFwicHJcIjogXCLiibpcIixcblx0XCJwcmN1ZVwiOiBcIuKJvFwiLFxuXHRcInByZWNhcHByb3hcIjogXCLiqrdcIixcblx0XCJwcmVjXCI6IFwi4om6XCIsXG5cdFwicHJlY2N1cmx5ZXFcIjogXCLiibxcIixcblx0XCJQcmVjZWRlc1wiOiBcIuKJulwiLFxuXHRcIlByZWNlZGVzRXF1YWxcIjogXCLiqq9cIixcblx0XCJQcmVjZWRlc1NsYW50RXF1YWxcIjogXCLiibxcIixcblx0XCJQcmVjZWRlc1RpbGRlXCI6IFwi4om+XCIsXG5cdFwicHJlY2VxXCI6IFwi4qqvXCIsXG5cdFwicHJlY25hcHByb3hcIjogXCLiqrlcIixcblx0XCJwcmVjbmVxcVwiOiBcIuKqtVwiLFxuXHRcInByZWNuc2ltXCI6IFwi4ouoXCIsXG5cdFwicHJlXCI6IFwi4qqvXCIsXG5cdFwicHJFXCI6IFwi4qqzXCIsXG5cdFwicHJlY3NpbVwiOiBcIuKJvlwiLFxuXHRcInByaW1lXCI6IFwi4oCyXCIsXG5cdFwiUHJpbWVcIjogXCLigLNcIixcblx0XCJwcmltZXNcIjogXCLihJlcIixcblx0XCJwcm5hcFwiOiBcIuKquVwiLFxuXHRcInBybkVcIjogXCLiqrVcIixcblx0XCJwcm5zaW1cIjogXCLii6hcIixcblx0XCJwcm9kXCI6IFwi4oiPXCIsXG5cdFwiUHJvZHVjdFwiOiBcIuKIj1wiLFxuXHRcInByb2ZhbGFyXCI6IFwi4oyuXCIsXG5cdFwicHJvZmxpbmVcIjogXCLijJJcIixcblx0XCJwcm9mc3VyZlwiOiBcIuKMk1wiLFxuXHRcInByb3BcIjogXCLiiJ1cIixcblx0XCJQcm9wb3J0aW9uYWxcIjogXCLiiJ1cIixcblx0XCJQcm9wb3J0aW9uXCI6IFwi4oi3XCIsXG5cdFwicHJvcHRvXCI6IFwi4oidXCIsXG5cdFwicHJzaW1cIjogXCLiib5cIixcblx0XCJwcnVyZWxcIjogXCLiirBcIixcblx0XCJQc2NyXCI6IFwi8J2Sq1wiLFxuXHRcInBzY3JcIjogXCLwnZOFXCIsXG5cdFwiUHNpXCI6IFwizqhcIixcblx0XCJwc2lcIjogXCLPiFwiLFxuXHRcInB1bmNzcFwiOiBcIuKAiFwiLFxuXHRcIlFmclwiOiBcIvCdlJRcIixcblx0XCJxZnJcIjogXCLwnZSuXCIsXG5cdFwicWludFwiOiBcIuKojFwiLFxuXHRcInFvcGZcIjogXCLwnZWiXCIsXG5cdFwiUW9wZlwiOiBcIuKEmlwiLFxuXHRcInFwcmltZVwiOiBcIuKBl1wiLFxuXHRcIlFzY3JcIjogXCLwnZKsXCIsXG5cdFwicXNjclwiOiBcIvCdk4ZcIixcblx0XCJxdWF0ZXJuaW9uc1wiOiBcIuKEjVwiLFxuXHRcInF1YXRpbnRcIjogXCLiqJZcIixcblx0XCJxdWVzdFwiOiBcIj9cIixcblx0XCJxdWVzdGVxXCI6IFwi4omfXCIsXG5cdFwicXVvdFwiOiBcIlxcXCJcIixcblx0XCJRVU9UXCI6IFwiXFxcIlwiLFxuXHRcInJBYXJyXCI6IFwi4oebXCIsXG5cdFwicmFjZVwiOiBcIuKIvcyxXCIsXG5cdFwiUmFjdXRlXCI6IFwixZRcIixcblx0XCJyYWN1dGVcIjogXCLFlVwiLFxuXHRcInJhZGljXCI6IFwi4oiaXCIsXG5cdFwicmFlbXB0eXZcIjogXCLiprNcIixcblx0XCJyYW5nXCI6IFwi4p+pXCIsXG5cdFwiUmFuZ1wiOiBcIuKfq1wiLFxuXHRcInJhbmdkXCI6IFwi4qaSXCIsXG5cdFwicmFuZ2VcIjogXCLipqVcIixcblx0XCJyYW5nbGVcIjogXCLin6lcIixcblx0XCJyYXF1b1wiOiBcIsK7XCIsXG5cdFwicmFycmFwXCI6IFwi4qW1XCIsXG5cdFwicmFycmJcIjogXCLih6VcIixcblx0XCJyYXJyYmZzXCI6IFwi4qSgXCIsXG5cdFwicmFycmNcIjogXCLipLNcIixcblx0XCJyYXJyXCI6IFwi4oaSXCIsXG5cdFwiUmFyclwiOiBcIuKGoFwiLFxuXHRcInJBcnJcIjogXCLih5JcIixcblx0XCJyYXJyZnNcIjogXCLipJ5cIixcblx0XCJyYXJyaGtcIjogXCLihqpcIixcblx0XCJyYXJybHBcIjogXCLihqxcIixcblx0XCJyYXJycGxcIjogXCLipYVcIixcblx0XCJyYXJyc2ltXCI6IFwi4qW0XCIsXG5cdFwiUmFycnRsXCI6IFwi4qSWXCIsXG5cdFwicmFycnRsXCI6IFwi4oajXCIsXG5cdFwicmFycndcIjogXCLihp1cIixcblx0XCJyYXRhaWxcIjogXCLipJpcIixcblx0XCJyQXRhaWxcIjogXCLipJxcIixcblx0XCJyYXRpb1wiOiBcIuKItlwiLFxuXHRcInJhdGlvbmFsc1wiOiBcIuKEmlwiLFxuXHRcInJiYXJyXCI6IFwi4qSNXCIsXG5cdFwickJhcnJcIjogXCLipI9cIixcblx0XCJSQmFyclwiOiBcIuKkkFwiLFxuXHRcInJiYnJrXCI6IFwi4p2zXCIsXG5cdFwicmJyYWNlXCI6IFwifVwiLFxuXHRcInJicmFja1wiOiBcIl1cIixcblx0XCJyYnJrZVwiOiBcIuKmjFwiLFxuXHRcInJicmtzbGRcIjogXCLipo5cIixcblx0XCJyYnJrc2x1XCI6IFwi4qaQXCIsXG5cdFwiUmNhcm9uXCI6IFwixZhcIixcblx0XCJyY2Fyb25cIjogXCLFmVwiLFxuXHRcIlJjZWRpbFwiOiBcIsWWXCIsXG5cdFwicmNlZGlsXCI6IFwixZdcIixcblx0XCJyY2VpbFwiOiBcIuKMiVwiLFxuXHRcInJjdWJcIjogXCJ9XCIsXG5cdFwiUmN5XCI6IFwi0KBcIixcblx0XCJyY3lcIjogXCLRgFwiLFxuXHRcInJkY2FcIjogXCLipLdcIixcblx0XCJyZGxkaGFyXCI6IFwi4qWpXCIsXG5cdFwicmRxdW9cIjogXCLigJ1cIixcblx0XCJyZHF1b3JcIjogXCLigJ1cIixcblx0XCJyZHNoXCI6IFwi4oazXCIsXG5cdFwicmVhbFwiOiBcIuKEnFwiLFxuXHRcInJlYWxpbmVcIjogXCLihJtcIixcblx0XCJyZWFscGFydFwiOiBcIuKEnFwiLFxuXHRcInJlYWxzXCI6IFwi4oSdXCIsXG5cdFwiUmVcIjogXCLihJxcIixcblx0XCJyZWN0XCI6IFwi4patXCIsXG5cdFwicmVnXCI6IFwiwq5cIixcblx0XCJSRUdcIjogXCLCrlwiLFxuXHRcIlJldmVyc2VFbGVtZW50XCI6IFwi4oiLXCIsXG5cdFwiUmV2ZXJzZUVxdWlsaWJyaXVtXCI6IFwi4oeLXCIsXG5cdFwiUmV2ZXJzZVVwRXF1aWxpYnJpdW1cIjogXCLipa9cIixcblx0XCJyZmlzaHRcIjogXCLipb1cIixcblx0XCJyZmxvb3JcIjogXCLijItcIixcblx0XCJyZnJcIjogXCLwnZSvXCIsXG5cdFwiUmZyXCI6IFwi4oScXCIsXG5cdFwickhhclwiOiBcIuKlpFwiLFxuXHRcInJoYXJkXCI6IFwi4oeBXCIsXG5cdFwicmhhcnVcIjogXCLih4BcIixcblx0XCJyaGFydWxcIjogXCLipaxcIixcblx0XCJSaG9cIjogXCLOoVwiLFxuXHRcInJob1wiOiBcIs+BXCIsXG5cdFwicmhvdlwiOiBcIs+xXCIsXG5cdFwiUmlnaHRBbmdsZUJyYWNrZXRcIjogXCLin6lcIixcblx0XCJSaWdodEFycm93QmFyXCI6IFwi4oelXCIsXG5cdFwicmlnaHRhcnJvd1wiOiBcIuKGklwiLFxuXHRcIlJpZ2h0QXJyb3dcIjogXCLihpJcIixcblx0XCJSaWdodGFycm93XCI6IFwi4oeSXCIsXG5cdFwiUmlnaHRBcnJvd0xlZnRBcnJvd1wiOiBcIuKHhFwiLFxuXHRcInJpZ2h0YXJyb3d0YWlsXCI6IFwi4oajXCIsXG5cdFwiUmlnaHRDZWlsaW5nXCI6IFwi4oyJXCIsXG5cdFwiUmlnaHREb3VibGVCcmFja2V0XCI6IFwi4p+nXCIsXG5cdFwiUmlnaHREb3duVGVlVmVjdG9yXCI6IFwi4qWdXCIsXG5cdFwiUmlnaHREb3duVmVjdG9yQmFyXCI6IFwi4qWVXCIsXG5cdFwiUmlnaHREb3duVmVjdG9yXCI6IFwi4oeCXCIsXG5cdFwiUmlnaHRGbG9vclwiOiBcIuKMi1wiLFxuXHRcInJpZ2h0aGFycG9vbmRvd25cIjogXCLih4FcIixcblx0XCJyaWdodGhhcnBvb251cFwiOiBcIuKHgFwiLFxuXHRcInJpZ2h0bGVmdGFycm93c1wiOiBcIuKHhFwiLFxuXHRcInJpZ2h0bGVmdGhhcnBvb25zXCI6IFwi4oeMXCIsXG5cdFwicmlnaHRyaWdodGFycm93c1wiOiBcIuKHiVwiLFxuXHRcInJpZ2h0c3F1aWdhcnJvd1wiOiBcIuKGnVwiLFxuXHRcIlJpZ2h0VGVlQXJyb3dcIjogXCLihqZcIixcblx0XCJSaWdodFRlZVwiOiBcIuKKolwiLFxuXHRcIlJpZ2h0VGVlVmVjdG9yXCI6IFwi4qWbXCIsXG5cdFwicmlnaHR0aHJlZXRpbWVzXCI6IFwi4ouMXCIsXG5cdFwiUmlnaHRUcmlhbmdsZUJhclwiOiBcIuKnkFwiLFxuXHRcIlJpZ2h0VHJpYW5nbGVcIjogXCLiirNcIixcblx0XCJSaWdodFRyaWFuZ2xlRXF1YWxcIjogXCLiirVcIixcblx0XCJSaWdodFVwRG93blZlY3RvclwiOiBcIuKlj1wiLFxuXHRcIlJpZ2h0VXBUZWVWZWN0b3JcIjogXCLipZxcIixcblx0XCJSaWdodFVwVmVjdG9yQmFyXCI6IFwi4qWUXCIsXG5cdFwiUmlnaHRVcFZlY3RvclwiOiBcIuKGvlwiLFxuXHRcIlJpZ2h0VmVjdG9yQmFyXCI6IFwi4qWTXCIsXG5cdFwiUmlnaHRWZWN0b3JcIjogXCLih4BcIixcblx0XCJyaW5nXCI6IFwiy5pcIixcblx0XCJyaXNpbmdkb3RzZXFcIjogXCLiiZNcIixcblx0XCJybGFyclwiOiBcIuKHhFwiLFxuXHRcInJsaGFyXCI6IFwi4oeMXCIsXG5cdFwicmxtXCI6IFwi4oCPXCIsXG5cdFwicm1vdXN0YWNoZVwiOiBcIuKOsVwiLFxuXHRcInJtb3VzdFwiOiBcIuKOsVwiLFxuXHRcInJubWlkXCI6IFwi4quuXCIsXG5cdFwicm9hbmdcIjogXCLin61cIixcblx0XCJyb2FyclwiOiBcIuKHvlwiLFxuXHRcInJvYnJrXCI6IFwi4p+nXCIsXG5cdFwicm9wYXJcIjogXCLipoZcIixcblx0XCJyb3BmXCI6IFwi8J2Vo1wiLFxuXHRcIlJvcGZcIjogXCLihJ1cIixcblx0XCJyb3BsdXNcIjogXCLiqK5cIixcblx0XCJyb3RpbWVzXCI6IFwi4qi1XCIsXG5cdFwiUm91bmRJbXBsaWVzXCI6IFwi4qWwXCIsXG5cdFwicnBhclwiOiBcIilcIixcblx0XCJycGFyZ3RcIjogXCLippRcIixcblx0XCJycHBvbGludFwiOiBcIuKoklwiLFxuXHRcInJyYXJyXCI6IFwi4oeJXCIsXG5cdFwiUnJpZ2h0YXJyb3dcIjogXCLih5tcIixcblx0XCJyc2FxdW9cIjogXCLigLpcIixcblx0XCJyc2NyXCI6IFwi8J2Th1wiLFxuXHRcIlJzY3JcIjogXCLihJtcIixcblx0XCJyc2hcIjogXCLihrFcIixcblx0XCJSc2hcIjogXCLihrFcIixcblx0XCJyc3FiXCI6IFwiXVwiLFxuXHRcInJzcXVvXCI6IFwi4oCZXCIsXG5cdFwicnNxdW9yXCI6IFwi4oCZXCIsXG5cdFwicnRocmVlXCI6IFwi4ouMXCIsXG5cdFwicnRpbWVzXCI6IFwi4ouKXCIsXG5cdFwicnRyaVwiOiBcIuKWuVwiLFxuXHRcInJ0cmllXCI6IFwi4oq1XCIsXG5cdFwicnRyaWZcIjogXCLilrhcIixcblx0XCJydHJpbHRyaVwiOiBcIuKnjlwiLFxuXHRcIlJ1bGVEZWxheWVkXCI6IFwi4qe0XCIsXG5cdFwicnVsdWhhclwiOiBcIuKlqFwiLFxuXHRcInJ4XCI6IFwi4oSeXCIsXG5cdFwiU2FjdXRlXCI6IFwixZpcIixcblx0XCJzYWN1dGVcIjogXCLFm1wiLFxuXHRcInNicXVvXCI6IFwi4oCaXCIsXG5cdFwic2NhcFwiOiBcIuKquFwiLFxuXHRcIlNjYXJvblwiOiBcIsWgXCIsXG5cdFwic2Nhcm9uXCI6IFwixaFcIixcblx0XCJTY1wiOiBcIuKqvFwiLFxuXHRcInNjXCI6IFwi4om7XCIsXG5cdFwic2NjdWVcIjogXCLiib1cIixcblx0XCJzY2VcIjogXCLiqrBcIixcblx0XCJzY0VcIjogXCLiqrRcIixcblx0XCJTY2VkaWxcIjogXCLFnlwiLFxuXHRcInNjZWRpbFwiOiBcIsWfXCIsXG5cdFwiU2NpcmNcIjogXCLFnFwiLFxuXHRcInNjaXJjXCI6IFwixZ1cIixcblx0XCJzY25hcFwiOiBcIuKqulwiLFxuXHRcInNjbkVcIjogXCLiqrZcIixcblx0XCJzY25zaW1cIjogXCLii6lcIixcblx0XCJzY3BvbGludFwiOiBcIuKok1wiLFxuXHRcInNjc2ltXCI6IFwi4om/XCIsXG5cdFwiU2N5XCI6IFwi0KFcIixcblx0XCJzY3lcIjogXCLRgVwiLFxuXHRcInNkb3RiXCI6IFwi4oqhXCIsXG5cdFwic2RvdFwiOiBcIuKLhVwiLFxuXHRcInNkb3RlXCI6IFwi4qmmXCIsXG5cdFwic2VhcmhrXCI6IFwi4qSlXCIsXG5cdFwic2VhcnJcIjogXCLihphcIixcblx0XCJzZUFyclwiOiBcIuKHmFwiLFxuXHRcInNlYXJyb3dcIjogXCLihphcIixcblx0XCJzZWN0XCI6IFwiwqdcIixcblx0XCJzZW1pXCI6IFwiO1wiLFxuXHRcInNlc3dhclwiOiBcIuKkqVwiLFxuXHRcInNldG1pbnVzXCI6IFwi4oiWXCIsXG5cdFwic2V0bW5cIjogXCLiiJZcIixcblx0XCJzZXh0XCI6IFwi4py2XCIsXG5cdFwiU2ZyXCI6IFwi8J2UllwiLFxuXHRcInNmclwiOiBcIvCdlLBcIixcblx0XCJzZnJvd25cIjogXCLijKJcIixcblx0XCJzaGFycFwiOiBcIuKZr1wiLFxuXHRcIlNIQ0hjeVwiOiBcItCpXCIsXG5cdFwic2hjaGN5XCI6IFwi0YlcIixcblx0XCJTSGN5XCI6IFwi0KhcIixcblx0XCJzaGN5XCI6IFwi0YhcIixcblx0XCJTaG9ydERvd25BcnJvd1wiOiBcIuKGk1wiLFxuXHRcIlNob3J0TGVmdEFycm93XCI6IFwi4oaQXCIsXG5cdFwic2hvcnRtaWRcIjogXCLiiKNcIixcblx0XCJzaG9ydHBhcmFsbGVsXCI6IFwi4oilXCIsXG5cdFwiU2hvcnRSaWdodEFycm93XCI6IFwi4oaSXCIsXG5cdFwiU2hvcnRVcEFycm93XCI6IFwi4oaRXCIsXG5cdFwic2h5XCI6IFwiwq1cIixcblx0XCJTaWdtYVwiOiBcIs6jXCIsXG5cdFwic2lnbWFcIjogXCLPg1wiLFxuXHRcInNpZ21hZlwiOiBcIs+CXCIsXG5cdFwic2lnbWF2XCI6IFwiz4JcIixcblx0XCJzaW1cIjogXCLiiLxcIixcblx0XCJzaW1kb3RcIjogXCLiqapcIixcblx0XCJzaW1lXCI6IFwi4omDXCIsXG5cdFwic2ltZXFcIjogXCLiiYNcIixcblx0XCJzaW1nXCI6IFwi4qqeXCIsXG5cdFwic2ltZ0VcIjogXCLiqqBcIixcblx0XCJzaW1sXCI6IFwi4qqdXCIsXG5cdFwic2ltbEVcIjogXCLiqp9cIixcblx0XCJzaW1uZVwiOiBcIuKJhlwiLFxuXHRcInNpbXBsdXNcIjogXCLiqKRcIixcblx0XCJzaW1yYXJyXCI6IFwi4qWyXCIsXG5cdFwic2xhcnJcIjogXCLihpBcIixcblx0XCJTbWFsbENpcmNsZVwiOiBcIuKImFwiLFxuXHRcInNtYWxsc2V0bWludXNcIjogXCLiiJZcIixcblx0XCJzbWFzaHBcIjogXCLiqLNcIixcblx0XCJzbWVwYXJzbFwiOiBcIuKnpFwiLFxuXHRcInNtaWRcIjogXCLiiKNcIixcblx0XCJzbWlsZVwiOiBcIuKMo1wiLFxuXHRcInNtdFwiOiBcIuKqqlwiLFxuXHRcInNtdGVcIjogXCLiqqxcIixcblx0XCJzbXRlc1wiOiBcIuKqrO+4gFwiLFxuXHRcIlNPRlRjeVwiOiBcItCsXCIsXG5cdFwic29mdGN5XCI6IFwi0YxcIixcblx0XCJzb2xiYXJcIjogXCLijL9cIixcblx0XCJzb2xiXCI6IFwi4qeEXCIsXG5cdFwic29sXCI6IFwiL1wiLFxuXHRcIlNvcGZcIjogXCLwnZWKXCIsXG5cdFwic29wZlwiOiBcIvCdlaRcIixcblx0XCJzcGFkZXNcIjogXCLimaBcIixcblx0XCJzcGFkZXN1aXRcIjogXCLimaBcIixcblx0XCJzcGFyXCI6IFwi4oilXCIsXG5cdFwic3FjYXBcIjogXCLiipNcIixcblx0XCJzcWNhcHNcIjogXCLiipPvuIBcIixcblx0XCJzcWN1cFwiOiBcIuKKlFwiLFxuXHRcInNxY3Vwc1wiOiBcIuKKlO+4gFwiLFxuXHRcIlNxcnRcIjogXCLiiJpcIixcblx0XCJzcXN1YlwiOiBcIuKKj1wiLFxuXHRcInNxc3ViZVwiOiBcIuKKkVwiLFxuXHRcInNxc3Vic2V0XCI6IFwi4oqPXCIsXG5cdFwic3FzdWJzZXRlcVwiOiBcIuKKkVwiLFxuXHRcInNxc3VwXCI6IFwi4oqQXCIsXG5cdFwic3FzdXBlXCI6IFwi4oqSXCIsXG5cdFwic3FzdXBzZXRcIjogXCLiipBcIixcblx0XCJzcXN1cHNldGVxXCI6IFwi4oqSXCIsXG5cdFwic3F1YXJlXCI6IFwi4pahXCIsXG5cdFwiU3F1YXJlXCI6IFwi4pahXCIsXG5cdFwiU3F1YXJlSW50ZXJzZWN0aW9uXCI6IFwi4oqTXCIsXG5cdFwiU3F1YXJlU3Vic2V0XCI6IFwi4oqPXCIsXG5cdFwiU3F1YXJlU3Vic2V0RXF1YWxcIjogXCLiipFcIixcblx0XCJTcXVhcmVTdXBlcnNldFwiOiBcIuKKkFwiLFxuXHRcIlNxdWFyZVN1cGVyc2V0RXF1YWxcIjogXCLiipJcIixcblx0XCJTcXVhcmVVbmlvblwiOiBcIuKKlFwiLFxuXHRcInNxdWFyZlwiOiBcIuKWqlwiLFxuXHRcInNxdVwiOiBcIuKWoVwiLFxuXHRcInNxdWZcIjogXCLilqpcIixcblx0XCJzcmFyclwiOiBcIuKGklwiLFxuXHRcIlNzY3JcIjogXCLwnZKuXCIsXG5cdFwic3NjclwiOiBcIvCdk4hcIixcblx0XCJzc2V0bW5cIjogXCLiiJZcIixcblx0XCJzc21pbGVcIjogXCLijKNcIixcblx0XCJzc3RhcmZcIjogXCLii4ZcIixcblx0XCJTdGFyXCI6IFwi4ouGXCIsXG5cdFwic3RhclwiOiBcIuKYhlwiLFxuXHRcInN0YXJmXCI6IFwi4piFXCIsXG5cdFwic3RyYWlnaHRlcHNpbG9uXCI6IFwiz7VcIixcblx0XCJzdHJhaWdodHBoaVwiOiBcIs+VXCIsXG5cdFwic3RybnNcIjogXCLCr1wiLFxuXHRcInN1YlwiOiBcIuKKglwiLFxuXHRcIlN1YlwiOiBcIuKLkFwiLFxuXHRcInN1YmRvdFwiOiBcIuKqvVwiLFxuXHRcInN1YkVcIjogXCLiq4VcIixcblx0XCJzdWJlXCI6IFwi4oqGXCIsXG5cdFwic3ViZWRvdFwiOiBcIuKrg1wiLFxuXHRcInN1Ym11bHRcIjogXCLiq4FcIixcblx0XCJzdWJuRVwiOiBcIuKri1wiLFxuXHRcInN1Ym5lXCI6IFwi4oqKXCIsXG5cdFwic3VicGx1c1wiOiBcIuKqv1wiLFxuXHRcInN1YnJhcnJcIjogXCLipblcIixcblx0XCJzdWJzZXRcIjogXCLiioJcIixcblx0XCJTdWJzZXRcIjogXCLii5BcIixcblx0XCJzdWJzZXRlcVwiOiBcIuKKhlwiLFxuXHRcInN1YnNldGVxcVwiOiBcIuKrhVwiLFxuXHRcIlN1YnNldEVxdWFsXCI6IFwi4oqGXCIsXG5cdFwic3Vic2V0bmVxXCI6IFwi4oqKXCIsXG5cdFwic3Vic2V0bmVxcVwiOiBcIuKri1wiLFxuXHRcInN1YnNpbVwiOiBcIuKrh1wiLFxuXHRcInN1YnN1YlwiOiBcIuKrlVwiLFxuXHRcInN1YnN1cFwiOiBcIuKrk1wiLFxuXHRcInN1Y2NhcHByb3hcIjogXCLiqrhcIixcblx0XCJzdWNjXCI6IFwi4om7XCIsXG5cdFwic3VjY2N1cmx5ZXFcIjogXCLiib1cIixcblx0XCJTdWNjZWVkc1wiOiBcIuKJu1wiLFxuXHRcIlN1Y2NlZWRzRXF1YWxcIjogXCLiqrBcIixcblx0XCJTdWNjZWVkc1NsYW50RXF1YWxcIjogXCLiib1cIixcblx0XCJTdWNjZWVkc1RpbGRlXCI6IFwi4om/XCIsXG5cdFwic3VjY2VxXCI6IFwi4qqwXCIsXG5cdFwic3VjY25hcHByb3hcIjogXCLiqrpcIixcblx0XCJzdWNjbmVxcVwiOiBcIuKqtlwiLFxuXHRcInN1Y2Nuc2ltXCI6IFwi4oupXCIsXG5cdFwic3VjY3NpbVwiOiBcIuKJv1wiLFxuXHRcIlN1Y2hUaGF0XCI6IFwi4oiLXCIsXG5cdFwic3VtXCI6IFwi4oiRXCIsXG5cdFwiU3VtXCI6IFwi4oiRXCIsXG5cdFwic3VuZ1wiOiBcIuKZqlwiLFxuXHRcInN1cDFcIjogXCLCuVwiLFxuXHRcInN1cDJcIjogXCLCslwiLFxuXHRcInN1cDNcIjogXCLCs1wiLFxuXHRcInN1cFwiOiBcIuKKg1wiLFxuXHRcIlN1cFwiOiBcIuKLkVwiLFxuXHRcInN1cGRvdFwiOiBcIuKqvlwiLFxuXHRcInN1cGRzdWJcIjogXCLiq5hcIixcblx0XCJzdXBFXCI6IFwi4quGXCIsXG5cdFwic3VwZVwiOiBcIuKKh1wiLFxuXHRcInN1cGVkb3RcIjogXCLiq4RcIixcblx0XCJTdXBlcnNldFwiOiBcIuKKg1wiLFxuXHRcIlN1cGVyc2V0RXF1YWxcIjogXCLiiodcIixcblx0XCJzdXBoc29sXCI6IFwi4p+JXCIsXG5cdFwic3VwaHN1YlwiOiBcIuKrl1wiLFxuXHRcInN1cGxhcnJcIjogXCLipbtcIixcblx0XCJzdXBtdWx0XCI6IFwi4quCXCIsXG5cdFwic3VwbkVcIjogXCLiq4xcIixcblx0XCJzdXBuZVwiOiBcIuKKi1wiLFxuXHRcInN1cHBsdXNcIjogXCLiq4BcIixcblx0XCJzdXBzZXRcIjogXCLiioNcIixcblx0XCJTdXBzZXRcIjogXCLii5FcIixcblx0XCJzdXBzZXRlcVwiOiBcIuKKh1wiLFxuXHRcInN1cHNldGVxcVwiOiBcIuKrhlwiLFxuXHRcInN1cHNldG5lcVwiOiBcIuKKi1wiLFxuXHRcInN1cHNldG5lcXFcIjogXCLiq4xcIixcblx0XCJzdXBzaW1cIjogXCLiq4hcIixcblx0XCJzdXBzdWJcIjogXCLiq5RcIixcblx0XCJzdXBzdXBcIjogXCLiq5ZcIixcblx0XCJzd2FyaGtcIjogXCLipKZcIixcblx0XCJzd2FyclwiOiBcIuKGmVwiLFxuXHRcInN3QXJyXCI6IFwi4oeZXCIsXG5cdFwic3dhcnJvd1wiOiBcIuKGmVwiLFxuXHRcInN3bndhclwiOiBcIuKkqlwiLFxuXHRcInN6bGlnXCI6IFwiw59cIixcblx0XCJUYWJcIjogXCJcXHRcIixcblx0XCJ0YXJnZXRcIjogXCLijJZcIixcblx0XCJUYXVcIjogXCLOpFwiLFxuXHRcInRhdVwiOiBcIs+EXCIsXG5cdFwidGJya1wiOiBcIuKOtFwiLFxuXHRcIlRjYXJvblwiOiBcIsWkXCIsXG5cdFwidGNhcm9uXCI6IFwixaVcIixcblx0XCJUY2VkaWxcIjogXCLFolwiLFxuXHRcInRjZWRpbFwiOiBcIsWjXCIsXG5cdFwiVGN5XCI6IFwi0KJcIixcblx0XCJ0Y3lcIjogXCLRglwiLFxuXHRcInRkb3RcIjogXCLig5tcIixcblx0XCJ0ZWxyZWNcIjogXCLijJVcIixcblx0XCJUZnJcIjogXCLwnZSXXCIsXG5cdFwidGZyXCI6IFwi8J2UsVwiLFxuXHRcInRoZXJlNFwiOiBcIuKItFwiLFxuXHRcInRoZXJlZm9yZVwiOiBcIuKItFwiLFxuXHRcIlRoZXJlZm9yZVwiOiBcIuKItFwiLFxuXHRcIlRoZXRhXCI6IFwizphcIixcblx0XCJ0aGV0YVwiOiBcIs64XCIsXG5cdFwidGhldGFzeW1cIjogXCLPkVwiLFxuXHRcInRoZXRhdlwiOiBcIs+RXCIsXG5cdFwidGhpY2thcHByb3hcIjogXCLiiYhcIixcblx0XCJ0aGlja3NpbVwiOiBcIuKIvFwiLFxuXHRcIlRoaWNrU3BhY2VcIjogXCLigZ/igIpcIixcblx0XCJUaGluU3BhY2VcIjogXCLigIlcIixcblx0XCJ0aGluc3BcIjogXCLigIlcIixcblx0XCJ0aGthcFwiOiBcIuKJiFwiLFxuXHRcInRoa3NpbVwiOiBcIuKIvFwiLFxuXHRcIlRIT1JOXCI6IFwiw55cIixcblx0XCJ0aG9yblwiOiBcIsO+XCIsXG5cdFwidGlsZGVcIjogXCLLnFwiLFxuXHRcIlRpbGRlXCI6IFwi4oi8XCIsXG5cdFwiVGlsZGVFcXVhbFwiOiBcIuKJg1wiLFxuXHRcIlRpbGRlRnVsbEVxdWFsXCI6IFwi4omFXCIsXG5cdFwiVGlsZGVUaWxkZVwiOiBcIuKJiFwiLFxuXHRcInRpbWVzYmFyXCI6IFwi4qixXCIsXG5cdFwidGltZXNiXCI6IFwi4oqgXCIsXG5cdFwidGltZXNcIjogXCLDl1wiLFxuXHRcInRpbWVzZFwiOiBcIuKosFwiLFxuXHRcInRpbnRcIjogXCLiiK1cIixcblx0XCJ0b2VhXCI6IFwi4qSoXCIsXG5cdFwidG9wYm90XCI6IFwi4oy2XCIsXG5cdFwidG9wY2lyXCI6IFwi4quxXCIsXG5cdFwidG9wXCI6IFwi4oqkXCIsXG5cdFwiVG9wZlwiOiBcIvCdlYtcIixcblx0XCJ0b3BmXCI6IFwi8J2VpVwiLFxuXHRcInRvcGZvcmtcIjogXCLiq5pcIixcblx0XCJ0b3NhXCI6IFwi4qSpXCIsXG5cdFwidHByaW1lXCI6IFwi4oC0XCIsXG5cdFwidHJhZGVcIjogXCLihKJcIixcblx0XCJUUkFERVwiOiBcIuKEolwiLFxuXHRcInRyaWFuZ2xlXCI6IFwi4pa1XCIsXG5cdFwidHJpYW5nbGVkb3duXCI6IFwi4pa/XCIsXG5cdFwidHJpYW5nbGVsZWZ0XCI6IFwi4peDXCIsXG5cdFwidHJpYW5nbGVsZWZ0ZXFcIjogXCLiirRcIixcblx0XCJ0cmlhbmdsZXFcIjogXCLiiZxcIixcblx0XCJ0cmlhbmdsZXJpZ2h0XCI6IFwi4pa5XCIsXG5cdFwidHJpYW5nbGVyaWdodGVxXCI6IFwi4oq1XCIsXG5cdFwidHJpZG90XCI6IFwi4pesXCIsXG5cdFwidHJpZVwiOiBcIuKJnFwiLFxuXHRcInRyaW1pbnVzXCI6IFwi4qi6XCIsXG5cdFwiVHJpcGxlRG90XCI6IFwi4oObXCIsXG5cdFwidHJpcGx1c1wiOiBcIuKouVwiLFxuXHRcInRyaXNiXCI6IFwi4qeNXCIsXG5cdFwidHJpdGltZVwiOiBcIuKou1wiLFxuXHRcInRycGV6aXVtXCI6IFwi4o+iXCIsXG5cdFwiVHNjclwiOiBcIvCdkq9cIixcblx0XCJ0c2NyXCI6IFwi8J2TiVwiLFxuXHRcIlRTY3lcIjogXCLQplwiLFxuXHRcInRzY3lcIjogXCLRhlwiLFxuXHRcIlRTSGN5XCI6IFwi0ItcIixcblx0XCJ0c2hjeVwiOiBcItGbXCIsXG5cdFwiVHN0cm9rXCI6IFwixaZcIixcblx0XCJ0c3Ryb2tcIjogXCLFp1wiLFxuXHRcInR3aXh0XCI6IFwi4omsXCIsXG5cdFwidHdvaGVhZGxlZnRhcnJvd1wiOiBcIuKGnlwiLFxuXHRcInR3b2hlYWRyaWdodGFycm93XCI6IFwi4oagXCIsXG5cdFwiVWFjdXRlXCI6IFwiw5pcIixcblx0XCJ1YWN1dGVcIjogXCLDulwiLFxuXHRcInVhcnJcIjogXCLihpFcIixcblx0XCJVYXJyXCI6IFwi4oafXCIsXG5cdFwidUFyclwiOiBcIuKHkVwiLFxuXHRcIlVhcnJvY2lyXCI6IFwi4qWJXCIsXG5cdFwiVWJyY3lcIjogXCLQjlwiLFxuXHRcInVicmN5XCI6IFwi0Z5cIixcblx0XCJVYnJldmVcIjogXCLFrFwiLFxuXHRcInVicmV2ZVwiOiBcIsWtXCIsXG5cdFwiVWNpcmNcIjogXCLDm1wiLFxuXHRcInVjaXJjXCI6IFwiw7tcIixcblx0XCJVY3lcIjogXCLQo1wiLFxuXHRcInVjeVwiOiBcItGDXCIsXG5cdFwidWRhcnJcIjogXCLih4VcIixcblx0XCJVZGJsYWNcIjogXCLFsFwiLFxuXHRcInVkYmxhY1wiOiBcIsWxXCIsXG5cdFwidWRoYXJcIjogXCLipa5cIixcblx0XCJ1ZmlzaHRcIjogXCLipb5cIixcblx0XCJVZnJcIjogXCLwnZSYXCIsXG5cdFwidWZyXCI6IFwi8J2UslwiLFxuXHRcIlVncmF2ZVwiOiBcIsOZXCIsXG5cdFwidWdyYXZlXCI6IFwiw7lcIixcblx0XCJ1SGFyXCI6IFwi4qWjXCIsXG5cdFwidWhhcmxcIjogXCLihr9cIixcblx0XCJ1aGFyclwiOiBcIuKGvlwiLFxuXHRcInVoYmxrXCI6IFwi4paAXCIsXG5cdFwidWxjb3JuXCI6IFwi4oycXCIsXG5cdFwidWxjb3JuZXJcIjogXCLijJxcIixcblx0XCJ1bGNyb3BcIjogXCLijI9cIixcblx0XCJ1bHRyaVwiOiBcIuKXuFwiLFxuXHRcIlVtYWNyXCI6IFwixapcIixcblx0XCJ1bWFjclwiOiBcIsWrXCIsXG5cdFwidW1sXCI6IFwiwqhcIixcblx0XCJVbmRlckJhclwiOiBcIl9cIixcblx0XCJVbmRlckJyYWNlXCI6IFwi4o+fXCIsXG5cdFwiVW5kZXJCcmFja2V0XCI6IFwi4o61XCIsXG5cdFwiVW5kZXJQYXJlbnRoZXNpc1wiOiBcIuKPnVwiLFxuXHRcIlVuaW9uXCI6IFwi4ouDXCIsXG5cdFwiVW5pb25QbHVzXCI6IFwi4oqOXCIsXG5cdFwiVW9nb25cIjogXCLFslwiLFxuXHRcInVvZ29uXCI6IFwixbNcIixcblx0XCJVb3BmXCI6IFwi8J2VjFwiLFxuXHRcInVvcGZcIjogXCLwnZWmXCIsXG5cdFwiVXBBcnJvd0JhclwiOiBcIuKkklwiLFxuXHRcInVwYXJyb3dcIjogXCLihpFcIixcblx0XCJVcEFycm93XCI6IFwi4oaRXCIsXG5cdFwiVXBhcnJvd1wiOiBcIuKHkVwiLFxuXHRcIlVwQXJyb3dEb3duQXJyb3dcIjogXCLih4VcIixcblx0XCJ1cGRvd25hcnJvd1wiOiBcIuKGlVwiLFxuXHRcIlVwRG93bkFycm93XCI6IFwi4oaVXCIsXG5cdFwiVXBkb3duYXJyb3dcIjogXCLih5VcIixcblx0XCJVcEVxdWlsaWJyaXVtXCI6IFwi4qWuXCIsXG5cdFwidXBoYXJwb29ubGVmdFwiOiBcIuKGv1wiLFxuXHRcInVwaGFycG9vbnJpZ2h0XCI6IFwi4oa+XCIsXG5cdFwidXBsdXNcIjogXCLiio5cIixcblx0XCJVcHBlckxlZnRBcnJvd1wiOiBcIuKGllwiLFxuXHRcIlVwcGVyUmlnaHRBcnJvd1wiOiBcIuKGl1wiLFxuXHRcInVwc2lcIjogXCLPhVwiLFxuXHRcIlVwc2lcIjogXCLPklwiLFxuXHRcInVwc2loXCI6IFwiz5JcIixcblx0XCJVcHNpbG9uXCI6IFwizqVcIixcblx0XCJ1cHNpbG9uXCI6IFwiz4VcIixcblx0XCJVcFRlZUFycm93XCI6IFwi4oalXCIsXG5cdFwiVXBUZWVcIjogXCLiiqVcIixcblx0XCJ1cHVwYXJyb3dzXCI6IFwi4oeIXCIsXG5cdFwidXJjb3JuXCI6IFwi4oydXCIsXG5cdFwidXJjb3JuZXJcIjogXCLijJ1cIixcblx0XCJ1cmNyb3BcIjogXCLijI5cIixcblx0XCJVcmluZ1wiOiBcIsWuXCIsXG5cdFwidXJpbmdcIjogXCLFr1wiLFxuXHRcInVydHJpXCI6IFwi4pe5XCIsXG5cdFwiVXNjclwiOiBcIvCdkrBcIixcblx0XCJ1c2NyXCI6IFwi8J2TilwiLFxuXHRcInV0ZG90XCI6IFwi4ouwXCIsXG5cdFwiVXRpbGRlXCI6IFwixahcIixcblx0XCJ1dGlsZGVcIjogXCLFqVwiLFxuXHRcInV0cmlcIjogXCLilrVcIixcblx0XCJ1dHJpZlwiOiBcIuKWtFwiLFxuXHRcInV1YXJyXCI6IFwi4oeIXCIsXG5cdFwiVXVtbFwiOiBcIsOcXCIsXG5cdFwidXVtbFwiOiBcIsO8XCIsXG5cdFwidXdhbmdsZVwiOiBcIuKmp1wiLFxuXHRcInZhbmdydFwiOiBcIuKmnFwiLFxuXHRcInZhcmVwc2lsb25cIjogXCLPtVwiLFxuXHRcInZhcmthcHBhXCI6IFwiz7BcIixcblx0XCJ2YXJub3RoaW5nXCI6IFwi4oiFXCIsXG5cdFwidmFycGhpXCI6IFwiz5VcIixcblx0XCJ2YXJwaVwiOiBcIs+WXCIsXG5cdFwidmFycHJvcHRvXCI6IFwi4oidXCIsXG5cdFwidmFyclwiOiBcIuKGlVwiLFxuXHRcInZBcnJcIjogXCLih5VcIixcblx0XCJ2YXJyaG9cIjogXCLPsVwiLFxuXHRcInZhcnNpZ21hXCI6IFwiz4JcIixcblx0XCJ2YXJzdWJzZXRuZXFcIjogXCLiiorvuIBcIixcblx0XCJ2YXJzdWJzZXRuZXFxXCI6IFwi4quL77iAXCIsXG5cdFwidmFyc3Vwc2V0bmVxXCI6IFwi4oqL77iAXCIsXG5cdFwidmFyc3Vwc2V0bmVxcVwiOiBcIuKrjO+4gFwiLFxuXHRcInZhcnRoZXRhXCI6IFwiz5FcIixcblx0XCJ2YXJ0cmlhbmdsZWxlZnRcIjogXCLiirJcIixcblx0XCJ2YXJ0cmlhbmdsZXJpZ2h0XCI6IFwi4oqzXCIsXG5cdFwidkJhclwiOiBcIuKrqFwiLFxuXHRcIlZiYXJcIjogXCLiq6tcIixcblx0XCJ2QmFydlwiOiBcIuKrqVwiLFxuXHRcIlZjeVwiOiBcItCSXCIsXG5cdFwidmN5XCI6IFwi0LJcIixcblx0XCJ2ZGFzaFwiOiBcIuKKolwiLFxuXHRcInZEYXNoXCI6IFwi4oqoXCIsXG5cdFwiVmRhc2hcIjogXCLiiqlcIixcblx0XCJWRGFzaFwiOiBcIuKKq1wiLFxuXHRcIlZkYXNobFwiOiBcIuKrplwiLFxuXHRcInZlZWJhclwiOiBcIuKKu1wiLFxuXHRcInZlZVwiOiBcIuKIqFwiLFxuXHRcIlZlZVwiOiBcIuKLgVwiLFxuXHRcInZlZWVxXCI6IFwi4omaXCIsXG5cdFwidmVsbGlwXCI6IFwi4ouuXCIsXG5cdFwidmVyYmFyXCI6IFwifFwiLFxuXHRcIlZlcmJhclwiOiBcIuKAllwiLFxuXHRcInZlcnRcIjogXCJ8XCIsXG5cdFwiVmVydFwiOiBcIuKAllwiLFxuXHRcIlZlcnRpY2FsQmFyXCI6IFwi4oijXCIsXG5cdFwiVmVydGljYWxMaW5lXCI6IFwifFwiLFxuXHRcIlZlcnRpY2FsU2VwYXJhdG9yXCI6IFwi4p2YXCIsXG5cdFwiVmVydGljYWxUaWxkZVwiOiBcIuKJgFwiLFxuXHRcIlZlcnlUaGluU3BhY2VcIjogXCLigIpcIixcblx0XCJWZnJcIjogXCLwnZSZXCIsXG5cdFwidmZyXCI6IFwi8J2Us1wiLFxuXHRcInZsdHJpXCI6IFwi4oqyXCIsXG5cdFwidm5zdWJcIjogXCLiioLig5JcIixcblx0XCJ2bnN1cFwiOiBcIuKKg+KDklwiLFxuXHRcIlZvcGZcIjogXCLwnZWNXCIsXG5cdFwidm9wZlwiOiBcIvCdladcIixcblx0XCJ2cHJvcFwiOiBcIuKInVwiLFxuXHRcInZydHJpXCI6IFwi4oqzXCIsXG5cdFwiVnNjclwiOiBcIvCdkrFcIixcblx0XCJ2c2NyXCI6IFwi8J2Ti1wiLFxuXHRcInZzdWJuRVwiOiBcIuKri++4gFwiLFxuXHRcInZzdWJuZVwiOiBcIuKKiu+4gFwiLFxuXHRcInZzdXBuRVwiOiBcIuKrjO+4gFwiLFxuXHRcInZzdXBuZVwiOiBcIuKKi++4gFwiLFxuXHRcIlZ2ZGFzaFwiOiBcIuKKqlwiLFxuXHRcInZ6aWd6YWdcIjogXCLipppcIixcblx0XCJXY2lyY1wiOiBcIsW0XCIsXG5cdFwid2NpcmNcIjogXCLFtVwiLFxuXHRcIndlZGJhclwiOiBcIuKpn1wiLFxuXHRcIndlZGdlXCI6IFwi4oinXCIsXG5cdFwiV2VkZ2VcIjogXCLii4BcIixcblx0XCJ3ZWRnZXFcIjogXCLiiZlcIixcblx0XCJ3ZWllcnBcIjogXCLihJhcIixcblx0XCJXZnJcIjogXCLwnZSaXCIsXG5cdFwid2ZyXCI6IFwi8J2UtFwiLFxuXHRcIldvcGZcIjogXCLwnZWOXCIsXG5cdFwid29wZlwiOiBcIvCdlahcIixcblx0XCJ3cFwiOiBcIuKEmFwiLFxuXHRcIndyXCI6IFwi4omAXCIsXG5cdFwid3JlYXRoXCI6IFwi4omAXCIsXG5cdFwiV3NjclwiOiBcIvCdkrJcIixcblx0XCJ3c2NyXCI6IFwi8J2TjFwiLFxuXHRcInhjYXBcIjogXCLii4JcIixcblx0XCJ4Y2lyY1wiOiBcIuKXr1wiLFxuXHRcInhjdXBcIjogXCLii4NcIixcblx0XCJ4ZHRyaVwiOiBcIuKWvVwiLFxuXHRcIlhmclwiOiBcIvCdlJtcIixcblx0XCJ4ZnJcIjogXCLwnZS1XCIsXG5cdFwieGhhcnJcIjogXCLin7dcIixcblx0XCJ4aEFyclwiOiBcIuKfulwiLFxuXHRcIlhpXCI6IFwizp5cIixcblx0XCJ4aVwiOiBcIs6+XCIsXG5cdFwieGxhcnJcIjogXCLin7VcIixcblx0XCJ4bEFyclwiOiBcIuKfuFwiLFxuXHRcInhtYXBcIjogXCLin7xcIixcblx0XCJ4bmlzXCI6IFwi4ou7XCIsXG5cdFwieG9kb3RcIjogXCLiqIBcIixcblx0XCJYb3BmXCI6IFwi8J2Vj1wiLFxuXHRcInhvcGZcIjogXCLwnZWpXCIsXG5cdFwieG9wbHVzXCI6IFwi4qiBXCIsXG5cdFwieG90aW1lXCI6IFwi4qiCXCIsXG5cdFwieHJhcnJcIjogXCLin7ZcIixcblx0XCJ4ckFyclwiOiBcIuKfuVwiLFxuXHRcIlhzY3JcIjogXCLwnZKzXCIsXG5cdFwieHNjclwiOiBcIvCdk41cIixcblx0XCJ4c3FjdXBcIjogXCLiqIZcIixcblx0XCJ4dXBsdXNcIjogXCLiqIRcIixcblx0XCJ4dXRyaVwiOiBcIuKWs1wiLFxuXHRcInh2ZWVcIjogXCLii4FcIixcblx0XCJ4d2VkZ2VcIjogXCLii4BcIixcblx0XCJZYWN1dGVcIjogXCLDnVwiLFxuXHRcInlhY3V0ZVwiOiBcIsO9XCIsXG5cdFwiWUFjeVwiOiBcItCvXCIsXG5cdFwieWFjeVwiOiBcItGPXCIsXG5cdFwiWWNpcmNcIjogXCLFtlwiLFxuXHRcInljaXJjXCI6IFwixbdcIixcblx0XCJZY3lcIjogXCLQq1wiLFxuXHRcInljeVwiOiBcItGLXCIsXG5cdFwieWVuXCI6IFwiwqVcIixcblx0XCJZZnJcIjogXCLwnZScXCIsXG5cdFwieWZyXCI6IFwi8J2UtlwiLFxuXHRcIllJY3lcIjogXCLQh1wiLFxuXHRcInlpY3lcIjogXCLRl1wiLFxuXHRcIllvcGZcIjogXCLwnZWQXCIsXG5cdFwieW9wZlwiOiBcIvCdlapcIixcblx0XCJZc2NyXCI6IFwi8J2StFwiLFxuXHRcInlzY3JcIjogXCLwnZOOXCIsXG5cdFwiWVVjeVwiOiBcItCuXCIsXG5cdFwieXVjeVwiOiBcItGOXCIsXG5cdFwieXVtbFwiOiBcIsO/XCIsXG5cdFwiWXVtbFwiOiBcIsW4XCIsXG5cdFwiWmFjdXRlXCI6IFwixblcIixcblx0XCJ6YWN1dGVcIjogXCLFulwiLFxuXHRcIlpjYXJvblwiOiBcIsW9XCIsXG5cdFwiemNhcm9uXCI6IFwixb5cIixcblx0XCJaY3lcIjogXCLQl1wiLFxuXHRcInpjeVwiOiBcItC3XCIsXG5cdFwiWmRvdFwiOiBcIsW7XCIsXG5cdFwiemRvdFwiOiBcIsW8XCIsXG5cdFwiemVldHJmXCI6IFwi4oSoXCIsXG5cdFwiWmVyb1dpZHRoU3BhY2VcIjogXCLigItcIixcblx0XCJaZXRhXCI6IFwizpZcIixcblx0XCJ6ZXRhXCI6IFwizrZcIixcblx0XCJ6ZnJcIjogXCLwnZS3XCIsXG5cdFwiWmZyXCI6IFwi4oSoXCIsXG5cdFwiWkhjeVwiOiBcItCWXCIsXG5cdFwiemhjeVwiOiBcItC2XCIsXG5cdFwiemlncmFyclwiOiBcIuKHnVwiLFxuXHRcInpvcGZcIjogXCLwnZWrXCIsXG5cdFwiWm9wZlwiOiBcIuKEpFwiLFxuXHRcIlpzY3JcIjogXCLwnZK1XCIsXG5cdFwienNjclwiOiBcIvCdk49cIixcblx0XCJ6d2pcIjogXCLigI1cIixcblx0XCJ6d25qXCI6IFwi4oCMXCJcbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2VudGl0aWVzL21hcHMvZW50aXRpZXMuanNvblxuLy8gbW9kdWxlIGlkID0gNTUzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRcImFtcFwiOiBcIiZcIixcblx0XCJhcG9zXCI6IFwiJ1wiLFxuXHRcImd0XCI6IFwiPlwiLFxuXHRcImx0XCI6IFwiPFwiLFxuXHRcInF1b3RcIjogXCJcXFwiXCJcbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2VudGl0aWVzL21hcHMveG1sLmpzb25cbi8vIG1vZHVsZSBpZCA9IDU1NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgYXNzaWduID0gcmVxdWlyZSgnbG9kYXNoLmFzc2lnbicpO1xudmFyIGlzUGxhaW5PYmplY3QgPSByZXF1aXJlKCdsb2Rhc2guaXNwbGFpbm9iamVjdCcpO1xudmFyIHhzc0ZpbHRlcnMgPSByZXF1aXJlKCd4c3MtZmlsdGVycycpO1xudmFyIHBhc2NhbENhc2UgPSByZXF1aXJlKCdwYXNjYWxjYXNlJyk7XG5cbnZhciB0eXBlQWxpYXNlcyA9IHtcbiAgICBibG9ja3F1b3RlOiAnYmxvY2tfcXVvdGUnLFxuICAgIHRoZW1hdGljYnJlYWs6ICd0aGVtYXRpY19icmVhaycsXG4gICAgaHRtbGJsb2NrOiAnaHRtbF9ibG9jaycsXG4gICAgaHRtbGlubGluZTogJ2h0bWxfaW5saW5lJyxcbiAgICBjb2RlYmxvY2s6ICdjb2RlX2Jsb2NrJyxcbiAgICBoYXJkYnJlYWs6ICdsaW5lYnJlYWsnXG59O1xuXG52YXIgZGVmYXVsdFJlbmRlcmVycyA9IHtcbiAgICBibG9ja19xdW90ZTogJ2Jsb2NrcXVvdGUnLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuICAgIGVtcGg6ICdlbScsXG4gICAgbGluZWJyZWFrOiAnYnInLFxuICAgIGltYWdlOiAnaW1nJyxcbiAgICBpdGVtOiAnbGknLFxuICAgIGxpbms6ICdhJyxcbiAgICBwYXJhZ3JhcGg6ICdwJyxcbiAgICBzdHJvbmc6ICdzdHJvbmcnLFxuICAgIHRoZW1hdGljX2JyZWFrOiAnaHInLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuXG4gICAgaHRtbF9ibG9jazogSHRtbFJlbmRlcmVyLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuICAgIGh0bWxfaW5saW5lOiBIdG1sUmVuZGVyZXIsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG5cbiAgICBsaXN0OiBmdW5jdGlvbiBMaXN0KHByb3BzKSB7XG4gICAgICAgIHZhciB0YWcgPSBwcm9wcy50eXBlLnRvTG93ZXJDYXNlKCkgPT09ICdidWxsZXQnID8gJ3VsJyA6ICdvbCc7XG4gICAgICAgIHZhciBhdHRycyA9IGdldENvcmVQcm9wcyhwcm9wcyk7XG5cbiAgICAgICAgaWYgKHByb3BzLnN0YXJ0ICE9PSBudWxsICYmIHByb3BzLnN0YXJ0ICE9PSAxKSB7XG4gICAgICAgICAgICBhdHRycy5zdGFydCA9IHByb3BzLnN0YXJ0LnRvU3RyaW5nKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY3JlYXRlRWxlbWVudCh0YWcsIGF0dHJzLCBwcm9wcy5jaGlsZHJlbik7XG4gICAgfSxcbiAgICBjb2RlX2Jsb2NrOiBmdW5jdGlvbiBDb2RlQmxvY2socHJvcHMpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2VcbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9IHByb3BzLmxhbmd1YWdlICYmICdsYW5ndWFnZS0nICsgcHJvcHMubGFuZ3VhZ2U7XG4gICAgICAgIHZhciBjb2RlID0gY3JlYXRlRWxlbWVudCgnY29kZScsIHsgY2xhc3NOYW1lOiBjbGFzc05hbWUgfSwgcHJvcHMubGl0ZXJhbCk7XG4gICAgICAgIHJldHVybiBjcmVhdGVFbGVtZW50KCdwcmUnLCBnZXRDb3JlUHJvcHMocHJvcHMpLCBjb2RlKTtcbiAgICB9LFxuICAgIGNvZGU6IGZ1bmN0aW9uIENvZGUocHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUVsZW1lbnQoJ2NvZGUnLCBnZXRDb3JlUHJvcHMocHJvcHMpLCBwcm9wcy5jaGlsZHJlbik7XG4gICAgfSxcbiAgICBoZWFkaW5nOiBmdW5jdGlvbiBIZWFkaW5nKHByb3BzKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVFbGVtZW50KCdoJyArIHByb3BzLmxldmVsLCBnZXRDb3JlUHJvcHMocHJvcHMpLCBwcm9wcy5jaGlsZHJlbik7XG4gICAgfSxcblxuICAgIHRleHQ6IG51bGwsXG4gICAgc29mdGJyZWFrOiBudWxsXG59O1xuXG52YXIgY29yZVR5cGVzID0gT2JqZWN0LmtleXMoZGVmYXVsdFJlbmRlcmVycyk7XG5cbmZ1bmN0aW9uIGdldENvcmVQcm9wcyhwcm9wcykge1xuICAgIHJldHVybiB7XG4gICAgICAgICdrZXknOiBwcm9wcy5ub2RlS2V5LFxuICAgICAgICAnY2xhc3NOYW1lJzogcHJvcHMuY2xhc3NOYW1lLFxuICAgICAgICAnZGF0YS1zb3VyY2Vwb3MnOiBwcm9wc1snZGF0YS1zb3VyY2Vwb3MnXVxuICAgIH07XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVR5cGVOYW1lKHR5cGVOYW1lKSB7XG4gICAgdmFyIG5vcm0gPSB0eXBlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhciB0eXBlID0gdHlwZUFsaWFzZXNbbm9ybV0gfHwgbm9ybTtcbiAgICByZXR1cm4gdHlwZW9mIGRlZmF1bHRSZW5kZXJlcnNbdHlwZV0gIT09ICd1bmRlZmluZWQnID8gdHlwZSA6IHR5cGVOYW1lO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVSZW5kZXJlcnMocmVuZGVyZXJzKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHJlbmRlcmVycyB8fCB7fSkucmVkdWNlKGZ1bmN0aW9uKG5vcm1hbGl6ZWQsIHR5cGUpIHtcbiAgICAgICAgdmFyIG5vcm0gPSBub3JtYWxpemVUeXBlTmFtZSh0eXBlKTtcbiAgICAgICAgbm9ybWFsaXplZFtub3JtXSA9IHJlbmRlcmVyc1t0eXBlXTtcbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZWQ7XG4gICAgfSwge30pO1xufVxuXG5mdW5jdGlvbiBIdG1sUmVuZGVyZXIocHJvcHMpIHtcbiAgICB2YXIgY29yZVByb3BzID0gZ2V0Q29yZVByb3BzKHByb3BzKTtcbiAgICB2YXIgbm9kZVByb3BzID0gcHJvcHMuZXNjYXBlSHRtbCA/IHt9IDogeyBkYW5nZXJvdXNseVNldElubmVySFRNTDogeyBfX2h0bWw6IHByb3BzLmxpdGVyYWwgfSB9O1xuICAgIHZhciBjaGlsZHJlbiA9IHByb3BzLmVzY2FwZUh0bWwgPyBbcHJvcHMubGl0ZXJhbF0gOiBudWxsO1xuXG4gICAgaWYgKHByb3BzLmVzY2FwZUh0bWwgfHwgIXByb3BzLnNraXBIdG1sKSB7XG4gICAgICAgIHZhciBhY3R1YWxQcm9wcyA9IGFzc2lnbihjb3JlUHJvcHMsIG5vZGVQcm9wcyk7XG4gICAgICAgIHJldHVybiBjcmVhdGVFbGVtZW50KHByb3BzLmlzQmxvY2sgPyAnZGl2JyA6ICdzcGFuJywgYWN0dWFsUHJvcHMsIGNoaWxkcmVuKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGlzR3JhbmRDaGlsZE9mTGlzdChub2RlKSB7XG4gICAgdmFyIGdyYW5kcGFyZW50ID0gbm9kZS5wYXJlbnQucGFyZW50O1xuICAgIHJldHVybiAoXG4gICAgICAgIGdyYW5kcGFyZW50ICYmXG4gICAgICAgIGdyYW5kcGFyZW50LnR5cGUudG9Mb3dlckNhc2UoKSA9PT0gJ2xpc3QnICYmXG4gICAgICAgIGdyYW5kcGFyZW50Lmxpc3RUaWdodFxuICAgICk7XG59XG5cbmZ1bmN0aW9uIGFkZENoaWxkKG5vZGUsIGNoaWxkKSB7XG4gICAgdmFyIHBhcmVudCA9IG5vZGU7XG4gICAgZG8ge1xuICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xuICAgIH0gd2hpbGUgKCFwYXJlbnQucmVhY3QpO1xuXG4gICAgcGFyZW50LnJlYWN0LmNoaWxkcmVuLnB1c2goY2hpbGQpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50KHRhZ05hbWUsIHByb3BzLCBjaGlsZHJlbikge1xuICAgIHZhciBub2RlQ2hpbGRyZW4gPSBBcnJheS5pc0FycmF5KGNoaWxkcmVuKSAmJiBjaGlsZHJlbi5yZWR1Y2UocmVkdWNlQ2hpbGRyZW4sIFtdKTtcbiAgICB2YXIgYXJncyA9IFt0YWdOYW1lLCBwcm9wc10uY29uY2F0KG5vZGVDaGlsZHJlbiB8fCBjaGlsZHJlbik7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQuYXBwbHkoUmVhY3QsIGFyZ3MpO1xufVxuXG5mdW5jdGlvbiByZWR1Y2VDaGlsZHJlbihjaGlsZHJlbiwgY2hpbGQpIHtcbiAgICB2YXIgbGFzdEluZGV4ID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTtcbiAgICBpZiAodHlwZW9mIGNoaWxkID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgY2hpbGRyZW5bbGFzdEluZGV4XSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgY2hpbGRyZW5bbGFzdEluZGV4XSArPSBjaGlsZDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2hpbGRyZW47XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW5Qb3NpdGlvbihwb3MpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICBwb3NbMF1bMF0sICc6JywgcG9zWzBdWzFdLCAnLScsXG4gICAgICAgIHBvc1sxXVswXSwgJzonLCBwb3NbMV1bMV1cbiAgICBdLm1hcChTdHJpbmcpLmpvaW4oJycpO1xufVxuXG4vLyBGb3Igc29tZSBub2Rlcywgd2Ugd2FudCB0byBpbmNsdWRlIG1vcmUgcHJvcHMgdGhhbiBmb3Igb3RoZXJzXG5mdW5jdGlvbiBnZXROb2RlUHJvcHMobm9kZSwga2V5LCBvcHRzLCByZW5kZXJlcikge1xuICAgIHZhciBwcm9wcyA9IHsga2V5OiBrZXkgfSwgdW5kZWY7XG5cbiAgICAvLyBgc291cmNlUG9zYCBpcyB0cnVlIGlmIHRoZSB1c2VyIHdhbnRzIHNvdXJjZSBpbmZvcm1hdGlvbiAobGluZS9jb2x1bW4gaW5mbyBmcm9tIG1hcmtkb3duIHNvdXJjZSlcbiAgICBpZiAob3B0cy5zb3VyY2VQb3MgJiYgbm9kZS5zb3VyY2Vwb3MpIHtcbiAgICAgICAgcHJvcHNbJ2RhdGEtc291cmNlcG9zJ10gPSBmbGF0dGVuUG9zaXRpb24obm9kZS5zb3VyY2Vwb3MpO1xuICAgIH1cblxuICAgIHZhciB0eXBlID0gbm9ybWFsaXplVHlwZU5hbWUobm9kZS50eXBlKTtcblxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlICdodG1sX2lubGluZSc6XG4gICAgICAgIGNhc2UgJ2h0bWxfYmxvY2snOlxuICAgICAgICAgICAgcHJvcHMuaXNCbG9jayA9IHR5cGUgPT09ICdodG1sX2Jsb2NrJztcbiAgICAgICAgICAgIHByb3BzLmVzY2FwZUh0bWwgPSBvcHRzLmVzY2FwZUh0bWw7XG4gICAgICAgICAgICBwcm9wcy5za2lwSHRtbCA9IG9wdHMuc2tpcEh0bWw7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnY29kZV9ibG9jayc6XG4gICAgICAgICAgICB2YXIgY29kZUluZm8gPSBub2RlLmluZm8gPyBub2RlLmluZm8uc3BsaXQoLyArLykgOiBbXTtcbiAgICAgICAgICAgIGlmIChjb2RlSW5mby5sZW5ndGggPiAwICYmIGNvZGVJbmZvWzBdLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBwcm9wcy5sYW5ndWFnZSA9IGNvZGVJbmZvWzBdO1xuICAgICAgICAgICAgICAgIHByb3BzLmNvZGVpbmZvID0gY29kZUluZm87XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnY29kZSc6XG4gICAgICAgICAgICBwcm9wcy5jaGlsZHJlbiA9IG5vZGUubGl0ZXJhbDtcbiAgICAgICAgICAgIHByb3BzLmlubGluZSA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnaGVhZGluZyc6XG4gICAgICAgICAgICBwcm9wcy5sZXZlbCA9IG5vZGUubGV2ZWw7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc29mdGJyZWFrJzpcbiAgICAgICAgICAgIHByb3BzLnNvZnRCcmVhayA9IG9wdHMuc29mdEJyZWFrO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2xpbmsnOlxuICAgICAgICAgICAgcHJvcHMuaHJlZiA9IG9wdHMudHJhbnNmb3JtTGlua1VyaSA/IG9wdHMudHJhbnNmb3JtTGlua1VyaShub2RlLmRlc3RpbmF0aW9uKSA6IG5vZGUuZGVzdGluYXRpb247XG4gICAgICAgICAgICBwcm9wcy50aXRsZSA9IG5vZGUudGl0bGUgfHwgdW5kZWY7XG4gICAgICAgICAgICBpZiAob3B0cy5saW5rVGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgcHJvcHMudGFyZ2V0ID0gb3B0cy5saW5rVGFyZ2V0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2ltYWdlJzpcbiAgICAgICAgICAgIHByb3BzLnNyYyA9IG9wdHMudHJhbnNmb3JtSW1hZ2VVcmkgPyBvcHRzLnRyYW5zZm9ybUltYWdlVXJpKG5vZGUuZGVzdGluYXRpb24pIDogbm9kZS5kZXN0aW5hdGlvbjtcbiAgICAgICAgICAgIHByb3BzLnRpdGxlID0gbm9kZS50aXRsZSB8fCB1bmRlZjtcblxuICAgICAgICAgICAgLy8gQ29tbW9ubWFyayB0cmVhdHMgaW1hZ2UgZGVzY3JpcHRpb24gYXMgY2hpbGRyZW4uIFdlIGp1c3Qgd2FudCB0aGUgdGV4dFxuICAgICAgICAgICAgcHJvcHMuYWx0ID0gbm9kZS5yZWFjdC5jaGlsZHJlbi5qb2luKCcnKTtcbiAgICAgICAgICAgIG5vZGUucmVhY3QuY2hpbGRyZW4gPSB1bmRlZjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdsaXN0JzpcbiAgICAgICAgICAgIHByb3BzLnN0YXJ0ID0gbm9kZS5saXN0U3RhcnQ7XG4gICAgICAgICAgICBwcm9wcy50eXBlID0gbm9kZS5saXN0VHlwZTtcbiAgICAgICAgICAgIHByb3BzLnRpZ2h0ID0gbm9kZS5saXN0VGlnaHQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHJlbmRlcmVyICE9PSAnc3RyaW5nJykge1xuICAgICAgICBwcm9wcy5saXRlcmFsID0gbm9kZS5saXRlcmFsO1xuICAgIH1cblxuICAgIHZhciBjaGlsZHJlbiA9IHByb3BzLmNoaWxkcmVuIHx8IChub2RlLnJlYWN0ICYmIG5vZGUucmVhY3QuY2hpbGRyZW4pO1xuICAgIGlmIChBcnJheS5pc0FycmF5KGNoaWxkcmVuKSkge1xuICAgICAgICBwcm9wcy5jaGlsZHJlbiA9IGNoaWxkcmVuLnJlZHVjZShyZWR1Y2VDaGlsZHJlbiwgW10pIHx8IG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb3BzO1xufVxuXG5mdW5jdGlvbiBnZXRQb3NpdGlvbihub2RlKSB7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmIChub2RlLnNvdXJjZXBvcykge1xuICAgICAgICByZXR1cm4gZmxhdHRlblBvc2l0aW9uKG5vZGUuc291cmNlcG9zKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2V0UG9zaXRpb24obm9kZS5wYXJlbnQpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJOb2RlcyhibG9jaykge1xuICAgIHZhciB3YWxrZXIgPSBibG9jay53YWxrZXIoKTtcblxuICAgIC8vIFNvZnRicmVha3MgYXJlIHVzdWFsbHkgdHJlYXRlZCBhcyBuZXdsaW5lcywgYnV0IGluIEhUTUwgd2UgbWlnaHQgd2FudCBleHBsaWNpdCBsaW5lYnJlYWtzXG4gICAgdmFyIHNvZnRCcmVhayA9IChcbiAgICAgICAgdGhpcy5zb2Z0QnJlYWsgPT09ICdicicgP1xuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdicicpIDpcbiAgICAgICAgdGhpcy5zb2Z0QnJlYWtcbiAgICApO1xuXG4gICAgdmFyIHByb3BPcHRpb25zID0ge1xuICAgICAgICBzb3VyY2VQb3M6IHRoaXMuc291cmNlUG9zLFxuICAgICAgICBlc2NhcGVIdG1sOiB0aGlzLmVzY2FwZUh0bWwsXG4gICAgICAgIHNraXBIdG1sOiB0aGlzLnNraXBIdG1sLFxuICAgICAgICB0cmFuc2Zvcm1MaW5rVXJpOiB0aGlzLnRyYW5zZm9ybUxpbmtVcmksXG4gICAgICAgIHRyYW5zZm9ybUltYWdlVXJpOiB0aGlzLnRyYW5zZm9ybUltYWdlVXJpLFxuICAgICAgICBzb2Z0QnJlYWs6IHNvZnRCcmVhayxcbiAgICAgICAgbGlua1RhcmdldDogdGhpcy5saW5rVGFyZ2V0XG4gICAgfTtcblxuICAgIHZhciBlLCBub2RlLCBlbnRlcmluZywgbGVhdmluZywgdHlwZSwgZG9jLCBrZXksIG5vZGVQcm9wcywgcHJldlBvcywgcHJldkluZGV4ID0gMDtcbiAgICB3aGlsZSAoKGUgPSB3YWxrZXIubmV4dCgpKSkge1xuICAgICAgICB2YXIgcG9zID0gZ2V0UG9zaXRpb24oZS5ub2RlLnNvdXJjZXBvcyA/IGUubm9kZSA6IGUubm9kZS5wYXJlbnQpO1xuICAgICAgICBpZiAocHJldlBvcyA9PT0gcG9zKSB7XG4gICAgICAgICAgICBrZXkgPSBwb3MgKyBwcmV2SW5kZXg7XG4gICAgICAgICAgICBwcmV2SW5kZXgrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGtleSA9IHBvcztcbiAgICAgICAgICAgIHByZXZJbmRleCA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBwcmV2UG9zID0gcG9zO1xuICAgICAgICBlbnRlcmluZyA9IGUuZW50ZXJpbmc7XG4gICAgICAgIGxlYXZpbmcgPSAhZW50ZXJpbmc7XG4gICAgICAgIG5vZGUgPSBlLm5vZGU7XG4gICAgICAgIHR5cGUgPSBub3JtYWxpemVUeXBlTmFtZShub2RlLnR5cGUpO1xuICAgICAgICBub2RlUHJvcHMgPSBudWxsO1xuXG4gICAgICAgIC8vIElmIHdlIGhhdmUgbm90IGFzc2lnbmVkIGEgZG9jdW1lbnQgeWV0LCBhc3N1bWUgdGhlIGN1cnJlbnQgbm9kZSBpcyBqdXN0IHRoYXRcbiAgICAgICAgaWYgKCFkb2MpIHtcbiAgICAgICAgICAgIGRvYyA9IG5vZGU7XG4gICAgICAgICAgICBub2RlLnJlYWN0ID0geyBjaGlsZHJlbjogW10gfTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9IGVsc2UgaWYgKG5vZGUgPT09IGRvYykge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSdyZSBsZWF2aW5nLi4uXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEluIEhUTUwsIHdlIGRvbid0IHdhbnQgcGFyYWdyYXBocyBpbnNpZGUgb2YgbGlzdCBpdGVtc1xuICAgICAgICBpZiAodHlwZSA9PT0gJ3BhcmFncmFwaCcgJiYgaXNHcmFuZENoaWxkT2ZMaXN0KG5vZGUpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHdlJ3JlIHNraXBwaW5nIEhUTUwgbm9kZXMsIGRvbid0IGtlZXAgcHJvY2Vzc2luZ1xuICAgICAgICBpZiAodGhpcy5za2lwSHRtbCAmJiAodHlwZSA9PT0gJ2h0bWxfYmxvY2snIHx8IHR5cGUgPT09ICdodG1sX2lubGluZScpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBpc0RvY3VtZW50ID0gbm9kZSA9PT0gZG9jO1xuICAgICAgICB2YXIgZGlzYWxsb3dlZEJ5Q29uZmlnID0gdGhpcy5hbGxvd2VkVHlwZXMuaW5kZXhPZih0eXBlKSA9PT0gLTE7XG4gICAgICAgIHZhciBkaXNhbGxvd2VkQnlVc2VyID0gZmFsc2U7XG5cbiAgICAgICAgLy8gRG8gd2UgaGF2ZSBhIHVzZXItZGVmaW5lZCBmdW5jdGlvbj9cbiAgICAgICAgdmFyIGlzQ29tcGxldGVQYXJlbnQgPSBub2RlLmlzQ29udGFpbmVyICYmIGxlYXZpbmc7XG4gICAgICAgIHZhciByZW5kZXJlciA9IHRoaXMucmVuZGVyZXJzW3R5cGVdO1xuICAgICAgICBpZiAodGhpcy5hbGxvd05vZGUgJiYgKGlzQ29tcGxldGVQYXJlbnQgfHwgIW5vZGUuaXNDb250YWluZXIpKSB7XG4gICAgICAgICAgICB2YXIgbm9kZUNoaWxkcmVuID0gaXNDb21wbGV0ZVBhcmVudCA/IG5vZGUucmVhY3QuY2hpbGRyZW4gOiBbXTtcblxuICAgICAgICAgICAgbm9kZVByb3BzID0gZ2V0Tm9kZVByb3BzKG5vZGUsIGtleSwgcHJvcE9wdGlvbnMsIHJlbmRlcmVyKTtcbiAgICAgICAgICAgIGRpc2FsbG93ZWRCeVVzZXIgPSAhdGhpcy5hbGxvd05vZGUoe1xuICAgICAgICAgICAgICAgIHR5cGU6IHBhc2NhbENhc2UodHlwZSksXG4gICAgICAgICAgICAgICAgcmVuZGVyZXI6IHRoaXMucmVuZGVyZXJzW3R5cGVdLFxuICAgICAgICAgICAgICAgIHByb3BzOiBub2RlUHJvcHMsXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IG5vZGVDaGlsZHJlblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWlzRG9jdW1lbnQgJiYgKGRpc2FsbG93ZWRCeVVzZXIgfHwgZGlzYWxsb3dlZEJ5Q29uZmlnKSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnVud3JhcERpc2FsbG93ZWQgJiYgZW50ZXJpbmcgJiYgbm9kZS5pc0NvbnRhaW5lcikge1xuICAgICAgICAgICAgICAgIHdhbGtlci5yZXN1bWVBdChub2RlLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGlzU2ltcGxlTm9kZSA9IHR5cGUgPT09ICd0ZXh0JyB8fCB0eXBlID09PSAnc29mdGJyZWFrJztcbiAgICAgICAgaWYgKHR5cGVvZiByZW5kZXJlciAhPT0gJ2Z1bmN0aW9uJyAmJiAhaXNTaW1wbGVOb2RlICYmIHR5cGVvZiByZW5kZXJlciAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAnUmVuZGVyZXIgZm9yIHR5cGUgYCcgKyBwYXNjYWxDYXNlKG5vZGUudHlwZSkgKyAnYCBub3QgZGVmaW5lZCBvciBpcyBub3QgcmVuZGVyYWJsZSdcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobm9kZS5pc0NvbnRhaW5lciAmJiBlbnRlcmluZykge1xuICAgICAgICAgICAgbm9kZS5yZWFjdCA9IHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQ6IHJlbmRlcmVyLFxuICAgICAgICAgICAgICAgIHByb3BzOiB7fSxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgY2hpbGRQcm9wcyA9IG5vZGVQcm9wcyB8fCBnZXROb2RlUHJvcHMobm9kZSwga2V5LCBwcm9wT3B0aW9ucywgcmVuZGVyZXIpO1xuICAgICAgICAgICAgaWYgKHJlbmRlcmVyKSB7XG4gICAgICAgICAgICAgICAgY2hpbGRQcm9wcyA9IHR5cGVvZiByZW5kZXJlciA9PT0gJ3N0cmluZydcbiAgICAgICAgICAgICAgICAgICAgPyBjaGlsZFByb3BzXG4gICAgICAgICAgICAgICAgICAgIDogYXNzaWduKGNoaWxkUHJvcHMsIHtub2RlS2V5OiBjaGlsZFByb3BzLmtleX0pO1xuXG4gICAgICAgICAgICAgICAgYWRkQ2hpbGQobm9kZSwgUmVhY3QuY3JlYXRlRWxlbWVudChyZW5kZXJlciwgY2hpbGRQcm9wcykpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICAgICAgICBhZGRDaGlsZChub2RlLCBub2RlLmxpdGVyYWwpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnc29mdGJyZWFrJykge1xuICAgICAgICAgICAgICAgIGFkZENoaWxkKG5vZGUsIHNvZnRCcmVhayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZG9jLnJlYWN0LmNoaWxkcmVuO1xufVxuXG5mdW5jdGlvbiBkZWZhdWx0TGlua1VyaUZpbHRlcih1cmkpIHtcbiAgICB2YXIgdXJsID0gdXJpLnJlcGxhY2UoL2ZpbGU6XFwvXFwvL2csICd4LWZpbGU6Ly8nKTtcblxuICAgIC8vIFJlYWN0IGRvZXMgYSBwcmV0dHkgc3dlbGwgam9iIG9mIGVzY2FwaW5nIGF0dHJpYnV0ZXMsXG4gICAgLy8gc28gdG8gcHJldmVudCBkb3VibGUtZXNjYXBpbmcsIHdlIG5lZWQgdG8gZGVjb2RlXG4gICAgcmV0dXJuIGRlY29kZVVSSSh4c3NGaWx0ZXJzLnVyaUluRG91YmxlUXVvdGVkQXR0cih1cmwpKTtcbn1cblxuZnVuY3Rpb24gUmVhY3RSZW5kZXJlcihvcHRpb25zKSB7XG4gICAgdmFyIG9wdHMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgaWYgKG9wdHMuYWxsb3dlZFR5cGVzICYmIG9wdHMuZGlzYWxsb3dlZFR5cGVzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignT25seSBvbmUgb2YgYGFsbG93ZWRUeXBlc2AgYW5kIGBkaXNhbGxvd2VkVHlwZXNgIHNob3VsZCBiZSBkZWZpbmVkJyk7XG4gICAgfVxuXG4gICAgaWYgKG9wdHMuYWxsb3dlZFR5cGVzICYmICFBcnJheS5pc0FycmF5KG9wdHMuYWxsb3dlZFR5cGVzKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2BhbGxvd2VkVHlwZXNgIG11c3QgYmUgYW4gYXJyYXknKTtcbiAgICB9XG5cbiAgICBpZiAob3B0cy5kaXNhbGxvd2VkVHlwZXMgJiYgIUFycmF5LmlzQXJyYXkob3B0cy5kaXNhbGxvd2VkVHlwZXMpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYGRpc2FsbG93ZWRUeXBlc2AgbXVzdCBiZSBhbiBhcnJheScpO1xuICAgIH1cblxuICAgIGlmIChvcHRzLmFsbG93Tm9kZSAmJiB0eXBlb2Ygb3B0cy5hbGxvd05vZGUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgYWxsb3dOb2RlYCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICB9XG5cbiAgICB2YXIgbGlua0ZpbHRlciA9IG9wdHMudHJhbnNmb3JtTGlua1VyaTtcbiAgICBpZiAodHlwZW9mIGxpbmtGaWx0ZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGxpbmtGaWx0ZXIgPSBkZWZhdWx0TGlua1VyaUZpbHRlcjtcbiAgICB9IGVsc2UgaWYgKGxpbmtGaWx0ZXIgJiYgdHlwZW9mIGxpbmtGaWx0ZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgdHJhbnNmb3JtTGlua1VyaWAgbXVzdCBlaXRoZXIgYmUgYSBmdW5jdGlvbiwgb3IgYG51bGxgIHRvIGRpc2FibGUnKTtcbiAgICB9XG5cbiAgICB2YXIgaW1hZ2VGaWx0ZXIgPSBvcHRzLnRyYW5zZm9ybUltYWdlVXJpO1xuICAgIGlmICh0eXBlb2YgaW1hZ2VGaWx0ZXIgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBpbWFnZUZpbHRlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2B0cmFuc2Zvcm1JbWFnZVVyaWAgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgfVxuXG4gICAgaWYgKG9wdHMucmVuZGVyZXJzICYmICFpc1BsYWluT2JqZWN0KG9wdHMucmVuZGVyZXJzKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ByZW5kZXJlcnNgIG11c3QgYmUgYSBwbGFpbiBvYmplY3Qgb2YgYFR5cGVgOiBgUmVuZGVyZXJgIHBhaXJzJyk7XG4gICAgfVxuXG4gICAgdmFyIGFsbG93ZWRUeXBlcyA9IChvcHRzLmFsbG93ZWRUeXBlcyAmJiBvcHRzLmFsbG93ZWRUeXBlcy5tYXAobm9ybWFsaXplVHlwZU5hbWUpKSB8fCBjb3JlVHlwZXM7XG4gICAgaWYgKG9wdHMuZGlzYWxsb3dlZFR5cGVzKSB7XG4gICAgICAgIHZhciBkaXNhbGxvd2VkID0gb3B0cy5kaXNhbGxvd2VkVHlwZXMubWFwKG5vcm1hbGl6ZVR5cGVOYW1lKTtcbiAgICAgICAgYWxsb3dlZFR5cGVzID0gYWxsb3dlZFR5cGVzLmZpbHRlcihmdW5jdGlvbiBmaWx0ZXJEaXNhbGxvd2VkKHR5cGUpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXNhbGxvd2VkLmluZGV4T2YodHlwZSkgPT09IC0xO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBzb3VyY2VQb3M6IEJvb2xlYW4ob3B0cy5zb3VyY2VQb3MpLFxuICAgICAgICBzb2Z0QnJlYWs6IG9wdHMuc29mdEJyZWFrIHx8ICdcXG4nLFxuICAgICAgICByZW5kZXJlcnM6IGFzc2lnbih7fSwgZGVmYXVsdFJlbmRlcmVycywgbm9ybWFsaXplUmVuZGVyZXJzKG9wdHMucmVuZGVyZXJzKSksXG4gICAgICAgIGVzY2FwZUh0bWw6IEJvb2xlYW4ob3B0cy5lc2NhcGVIdG1sKSxcbiAgICAgICAgc2tpcEh0bWw6IEJvb2xlYW4ob3B0cy5za2lwSHRtbCksXG4gICAgICAgIHRyYW5zZm9ybUxpbmtVcmk6IGxpbmtGaWx0ZXIsXG4gICAgICAgIHRyYW5zZm9ybUltYWdlVXJpOiBpbWFnZUZpbHRlcixcbiAgICAgICAgYWxsb3dOb2RlOiBvcHRzLmFsbG93Tm9kZSxcbiAgICAgICAgYWxsb3dlZFR5cGVzOiBhbGxvd2VkVHlwZXMsXG4gICAgICAgIHVud3JhcERpc2FsbG93ZWQ6IEJvb2xlYW4ob3B0cy51bndyYXBEaXNhbGxvd2VkKSxcbiAgICAgICAgcmVuZGVyOiByZW5kZXJOb2RlcyxcbiAgICAgICAgbGlua1RhcmdldDogb3B0cy5saW5rVGFyZ2V0IHx8IGZhbHNlXG4gICAgfTtcbn1cblxuUmVhY3RSZW5kZXJlci51cmlUcmFuc2Zvcm1lciA9IGRlZmF1bHRMaW5rVXJpRmlsdGVyO1xuUmVhY3RSZW5kZXJlci50eXBlcyA9IGNvcmVUeXBlcy5tYXAocGFzY2FsQ2FzZSk7XG5SZWFjdFJlbmRlcmVyLnJlbmRlcmVycyA9IGNvcmVUeXBlcy5yZWR1Y2UoZnVuY3Rpb24ocmVuZGVyZXJzLCB0eXBlKSB7XG4gICAgcmVuZGVyZXJzW3Bhc2NhbENhc2UodHlwZSldID0gZGVmYXVsdFJlbmRlcmVyc1t0eXBlXTtcbiAgICByZXR1cm4gcmVuZGVyZXJzO1xufSwge30pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0UmVuZGVyZXI7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29tbW9ubWFyay1yZWFjdC1yZW5kZXJlci9zcmMvY29tbW9ubWFyay1yZWFjdC1yZW5kZXJlci5qc1xuLy8gbW9kdWxlIGlkID0gNTU2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgTm9kZSA9IHJlcXVpcmUoJy4vbm9kZScpO1xudmFyIHVuZXNjYXBlU3RyaW5nID0gcmVxdWlyZSgnLi9jb21tb24nKS51bmVzY2FwZVN0cmluZztcbnZhciBPUEVOVEFHID0gcmVxdWlyZSgnLi9jb21tb24nKS5PUEVOVEFHO1xudmFyIENMT1NFVEFHID0gcmVxdWlyZSgnLi9jb21tb24nKS5DTE9TRVRBRztcblxudmFyIENPREVfSU5ERU5UID0gNDtcblxudmFyIENfVEFCID0gOTtcbnZhciBDX05FV0xJTkUgPSAxMDtcbnZhciBDX0dSRUFURVJUSEFOID0gNjI7XG52YXIgQ19MRVNTVEhBTiA9IDYwO1xudmFyIENfU1BBQ0UgPSAzMjtcbnZhciBDX09QRU5fQlJBQ0tFVCA9IDkxO1xuXG52YXIgSW5saW5lUGFyc2VyID0gcmVxdWlyZSgnLi9pbmxpbmVzJyk7XG5cbnZhciByZUh0bWxCbG9ja09wZW4gPSBbXG4gICAvLi8sIC8vIGR1bW15IGZvciAwXG4gICAvXjwoPzpzY3JpcHR8cHJlfHN0eWxlKSg/Olxcc3w+fCQpL2ksXG4gICAvXjwhLS0vLFxuICAgL148Wz9dLyxcbiAgIC9ePCFbQS1aXS8sXG4gICAvXjwhXFxbQ0RBVEFcXFsvLFxuICAgL148Wy9dPyg/OmFkZHJlc3N8YXJ0aWNsZXxhc2lkZXxiYXNlfGJhc2Vmb250fGJsb2NrcXVvdGV8Ym9keXxjYXB0aW9ufGNlbnRlcnxjb2x8Y29sZ3JvdXB8ZGR8ZGV0YWlsc3xkaWFsb2d8ZGlyfGRpdnxkbHxkdHxmaWVsZHNldHxmaWdjYXB0aW9ufGZpZ3VyZXxmb290ZXJ8Zm9ybXxmcmFtZXxmcmFtZXNldHxoMXxoZWFkfGhlYWRlcnxocnxodG1sfGlmcmFtZXxsZWdlbmR8bGl8bGlua3xtYWlufG1lbnV8bWVudWl0ZW18bWV0YXxuYXZ8bm9mcmFtZXN8b2x8b3B0Z3JvdXB8b3B0aW9ufHB8cGFyYW18c2VjdGlvbnxzb3VyY2V8dGl0bGV8c3VtbWFyeXx0YWJsZXx0Ym9keXx0ZHx0Zm9vdHx0aHx0aGVhZHx0aXRsZXx0cnx0cmFja3x1bCkoPzpcXHN8Wy9dP1s+XXwkKS9pLFxuICAgIG5ldyBSZWdFeHAoJ14oPzonICsgT1BFTlRBRyArICd8JyArIENMT1NFVEFHICsgJylcXHMqJCcsICdpJylcbl07XG5cbnZhciByZUh0bWxCbG9ja0Nsb3NlID0gW1xuICAgLy4vLCAvLyBkdW1teSBmb3IgMFxuICAgLzxcXC8oPzpzY3JpcHR8cHJlfHN0eWxlKT4vaSxcbiAgIC8tLT4vLFxuICAgL1xcPz4vLFxuICAgLz4vLFxuICAgL1xcXVxcXT4vXG5dO1xuXG52YXIgcmVUaGVtYXRpY0JyZWFrID0gL14oPzooPzpcXCogKil7Myx9fCg/Ol8gKil7Myx9fCg/Oi0gKil7Myx9KSAqJC87XG5cbnZhciByZU1heWJlU3BlY2lhbCA9IC9eWyNgfiorXz08PjAtOS1dLztcblxudmFyIHJlTm9uU3BhY2UgPSAvW14gXFx0XFxmXFx2XFxyXFxuXS87XG5cbnZhciByZUJ1bGxldExpc3RNYXJrZXIgPSAvXlsqKy1dLztcblxudmFyIHJlT3JkZXJlZExpc3RNYXJrZXIgPSAvXihcXGR7MSw5fSkoWy4pXSkvO1xuXG52YXIgcmVBVFhIZWFkaW5nTWFya2VyID0gL14jezEsNn0oPzogK3wkKS87XG5cbnZhciByZUNvZGVGZW5jZSA9IC9eYHszLH0oPyEuKmApfF5+ezMsfSg/IS4qfikvO1xuXG52YXIgcmVDbG9zaW5nQ29kZUZlbmNlID0gL14oPzpgezMsfXx+ezMsfSkoPz0gKiQpLztcblxudmFyIHJlU2V0ZXh0SGVhZGluZ0xpbmUgPSAvXig/Oj0rfC0rKSAqJC87XG5cbnZhciByZUxpbmVFbmRpbmcgPSAvXFxyXFxufFxcbnxcXHIvO1xuXG4vLyBSZXR1cm5zIHRydWUgaWYgc3RyaW5nIGNvbnRhaW5zIG9ubHkgc3BhY2UgY2hhcmFjdGVycy5cbnZhciBpc0JsYW5rID0gZnVuY3Rpb24ocykge1xuICAgIHJldHVybiAhKHJlTm9uU3BhY2UudGVzdChzKSk7XG59O1xuXG52YXIgcGVlayA9IGZ1bmN0aW9uKGxuLCBwb3MpIHtcbiAgICBpZiAocG9zIDwgbG4ubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBsbi5jaGFyQ29kZUF0KHBvcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbn07XG5cbi8vIERPQyBQQVJTRVJcblxuLy8gVGhlc2UgYXJlIG1ldGhvZHMgb2YgYSBQYXJzZXIgb2JqZWN0LCBkZWZpbmVkIGJlbG93LlxuXG4vLyBSZXR1cm5zIHRydWUgaWYgYmxvY2sgZW5kcyB3aXRoIGEgYmxhbmsgbGluZSwgZGVzY2VuZGluZyBpZiBuZWVkZWRcbi8vIGludG8gbGlzdHMgYW5kIHN1Ymxpc3RzLlxudmFyIGVuZHNXaXRoQmxhbmtMaW5lID0gZnVuY3Rpb24oYmxvY2spIHtcbiAgICB3aGlsZSAoYmxvY2spIHtcbiAgICAgICAgaWYgKGJsb2NrLl9sYXN0TGluZUJsYW5rKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdCA9IGJsb2NrLnR5cGU7XG4gICAgICAgIGlmICh0ID09PSAnTGlzdCcgfHwgdCA9PT0gJ0l0ZW0nKSB7XG4gICAgICAgICAgICBibG9jayA9IGJsb2NrLl9sYXN0Q2hpbGQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG4vLyBCcmVhayBvdXQgb2YgYWxsIGNvbnRhaW5pbmcgbGlzdHMsIHJlc2V0dGluZyB0aGUgdGlwIG9mIHRoZVxuLy8gZG9jdW1lbnQgdG8gdGhlIHBhcmVudCBvZiB0aGUgaGlnaGVzdCBsaXN0LCBhbmQgZmluYWxpemluZ1xuLy8gYWxsIHRoZSBsaXN0cy4gIChUaGlzIGlzIHVzZWQgdG8gaW1wbGVtZW50IHRoZSBcInR3byBibGFuayBsaW5lc1xuLy8gYnJlYWsgb3V0IG9mIGFsbCBsaXN0c1wiIGZlYXR1cmUuKVxudmFyIGJyZWFrT3V0T2ZMaXN0cyA9IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgdmFyIGIgPSBibG9jaztcbiAgICB2YXIgbGFzdF9saXN0ID0gbnVsbDtcbiAgICBkbyB7XG4gICAgICAgIGlmIChiLnR5cGUgPT09ICdMaXN0Jykge1xuICAgICAgICAgICAgbGFzdF9saXN0ID0gYjtcbiAgICAgICAgfVxuICAgICAgICBiID0gYi5fcGFyZW50O1xuICAgIH0gd2hpbGUgKGIpO1xuXG4gICAgaWYgKGxhc3RfbGlzdCkge1xuICAgICAgICB3aGlsZSAoYmxvY2sgIT09IGxhc3RfbGlzdCkge1xuICAgICAgICAgICAgdGhpcy5maW5hbGl6ZShibG9jaywgdGhpcy5saW5lTnVtYmVyKTtcbiAgICAgICAgICAgIGJsb2NrID0gYmxvY2suX3BhcmVudDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZpbmFsaXplKGxhc3RfbGlzdCwgdGhpcy5saW5lTnVtYmVyKTtcbiAgICAgICAgdGhpcy50aXAgPSBsYXN0X2xpc3QuX3BhcmVudDtcbiAgICB9XG59O1xuXG4vLyBBZGQgYSBsaW5lIHRvIHRoZSBibG9jayBhdCB0aGUgdGlwLiAgV2UgYXNzdW1lIHRoZSB0aXBcbi8vIGNhbiBhY2NlcHQgbGluZXMgLS0gdGhhdCBjaGVjayBzaG91bGQgYmUgZG9uZSBiZWZvcmUgY2FsbGluZyB0aGlzLlxudmFyIGFkZExpbmUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRpcC5fc3RyaW5nX2NvbnRlbnQgKz0gdGhpcy5jdXJyZW50TGluZS5zbGljZSh0aGlzLm9mZnNldCkgKyAnXFxuJztcbn07XG5cbi8vIEFkZCBibG9jayBvZiB0eXBlIHRhZyBhcyBhIGNoaWxkIG9mIHRoZSB0aXAuICBJZiB0aGUgdGlwIGNhbid0XG4vLyBhY2NlcHQgY2hpbGRyZW4sIGNsb3NlIGFuZCBmaW5hbGl6ZSBpdCBhbmQgdHJ5IGl0cyBwYXJlbnQsXG4vLyBhbmQgc28gb24gdGlsIHdlIGZpbmQgYSBibG9jayB0aGF0IGNhbiBhY2NlcHQgY2hpbGRyZW4uXG52YXIgYWRkQ2hpbGQgPSBmdW5jdGlvbih0YWcsIG9mZnNldCkge1xuICAgIHdoaWxlICghdGhpcy5ibG9ja3NbdGhpcy50aXAudHlwZV0uY2FuQ29udGFpbih0YWcpKSB7XG4gICAgICAgIHRoaXMuZmluYWxpemUodGhpcy50aXAsIHRoaXMubGluZU51bWJlciAtIDEpO1xuICAgIH1cblxuICAgIHZhciBjb2x1bW5fbnVtYmVyID0gb2Zmc2V0ICsgMTsgLy8gb2Zmc2V0IDAgPSBjb2x1bW4gMVxuICAgIHZhciBuZXdCbG9jayA9IG5ldyBOb2RlKHRhZywgW1t0aGlzLmxpbmVOdW1iZXIsIGNvbHVtbl9udW1iZXJdLCBbMCwgMF1dKTtcbiAgICBuZXdCbG9jay5fc3RyaW5nX2NvbnRlbnQgPSAnJztcbiAgICB0aGlzLnRpcC5hcHBlbmRDaGlsZChuZXdCbG9jayk7XG4gICAgdGhpcy50aXAgPSBuZXdCbG9jaztcbiAgICByZXR1cm4gbmV3QmxvY2s7XG59O1xuXG4vLyBQYXJzZSBhIGxpc3QgbWFya2VyIGFuZCByZXR1cm4gZGF0YSBvbiB0aGUgbWFya2VyICh0eXBlLFxuLy8gc3RhcnQsIGRlbGltaXRlciwgYnVsbGV0IGNoYXJhY3RlciwgcGFkZGluZykgb3IgbnVsbC5cbnZhciBwYXJzZUxpc3RNYXJrZXIgPSBmdW5jdGlvbihwYXJzZXIpIHtcbiAgICB2YXIgcmVzdCA9IHBhcnNlci5jdXJyZW50TGluZS5zbGljZShwYXJzZXIubmV4dE5vbnNwYWNlKTtcbiAgICB2YXIgbWF0Y2g7XG4gICAgdmFyIG5leHRjO1xuICAgIHZhciBzcGFjZXNTdGFydENvbDtcbiAgICB2YXIgc3BhY2VzU3RhcnRPZmZzZXQ7XG4gICAgdmFyIGRhdGEgPSB7IHR5cGU6IG51bGwsXG4gICAgICAgICAgICAgICAgIHRpZ2h0OiB0cnVlLCAgLy8gbGlzdHMgYXJlIHRpZ2h0IGJ5IGRlZmF1bHRcbiAgICAgICAgICAgICAgICAgYnVsbGV0Q2hhcjogbnVsbCxcbiAgICAgICAgICAgICAgICAgc3RhcnQ6IG51bGwsXG4gICAgICAgICAgICAgICAgIGRlbGltaXRlcjogbnVsbCxcbiAgICAgICAgICAgICAgICAgcGFkZGluZzogbnVsbCxcbiAgICAgICAgICAgICAgICAgbWFya2VyT2Zmc2V0OiBwYXJzZXIuaW5kZW50IH07XG4gICAgaWYgKChtYXRjaCA9IHJlc3QubWF0Y2gocmVCdWxsZXRMaXN0TWFya2VyKSkpIHtcbiAgICAgICAgZGF0YS50eXBlID0gJ0J1bGxldCc7XG4gICAgICAgIGRhdGEuYnVsbGV0Q2hhciA9IG1hdGNoWzBdWzBdO1xuXG4gICAgfSBlbHNlIGlmICgobWF0Y2ggPSByZXN0Lm1hdGNoKHJlT3JkZXJlZExpc3RNYXJrZXIpKSkge1xuICAgICAgICBkYXRhLnR5cGUgPSAnT3JkZXJlZCc7XG4gICAgICAgIGRhdGEuc3RhcnQgPSBwYXJzZUludChtYXRjaFsxXSk7XG4gICAgICAgIGRhdGEuZGVsaW1pdGVyID0gbWF0Y2hbMl07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8vIG1ha2Ugc3VyZSB3ZSBoYXZlIHNwYWNlcyBhZnRlclxuICAgIG5leHRjID0gcGVlayhwYXJzZXIuY3VycmVudExpbmUsIHBhcnNlci5uZXh0Tm9uc3BhY2UgKyBtYXRjaFswXS5sZW5ndGgpO1xuICAgIGlmICghKG5leHRjID09PSAtMSB8fCBuZXh0YyA9PT0gQ19UQUIgfHwgbmV4dGMgPT09IENfU1BBQ0UpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIHdlJ3ZlIGdvdCBhIG1hdGNoISBhZHZhbmNlIG9mZnNldCBhbmQgY2FsY3VsYXRlIHBhZGRpbmdcbiAgICBwYXJzZXIuYWR2YW5jZU5leHROb25zcGFjZSgpOyAvLyB0byBzdGFydCBvZiBtYXJrZXJcbiAgICBwYXJzZXIuYWR2YW5jZU9mZnNldChtYXRjaFswXS5sZW5ndGgsIHRydWUpOyAvLyB0byBlbmQgb2YgbWFya2VyXG4gICAgc3BhY2VzU3RhcnRDb2wgPSBwYXJzZXIuY29sdW1uO1xuICAgIHNwYWNlc1N0YXJ0T2Zmc2V0ID0gcGFyc2VyLm9mZnNldDtcbiAgICBkbyB7XG4gICAgICAgIHBhcnNlci5hZHZhbmNlT2Zmc2V0KDEsIHRydWUpO1xuICAgICAgICBuZXh0YyA9IHBlZWsocGFyc2VyLmN1cnJlbnRMaW5lLCBwYXJzZXIub2Zmc2V0KTtcbiAgICB9IHdoaWxlIChwYXJzZXIuY29sdW1uIC0gc3BhY2VzU3RhcnRDb2wgPCA1ICYmXG4gICAgICAgICAgIChuZXh0YyA9PT0gQ19TUEFDRSB8fCBuZXh0YyA9PT0gQ19UQUIpKTtcbiAgICB2YXIgYmxhbmtfaXRlbSA9IHBlZWsocGFyc2VyLmN1cnJlbnRMaW5lLCBwYXJzZXIub2Zmc2V0KSA9PT0gLTE7XG4gICAgdmFyIHNwYWNlc19hZnRlcl9tYXJrZXIgPSBwYXJzZXIuY29sdW1uIC0gc3BhY2VzU3RhcnRDb2w7XG4gICAgaWYgKHNwYWNlc19hZnRlcl9tYXJrZXIgPj0gNSB8fFxuICAgICAgICBzcGFjZXNfYWZ0ZXJfbWFya2VyIDwgMSB8fFxuICAgICAgICBibGFua19pdGVtKSB7XG4gICAgICAgIGRhdGEucGFkZGluZyA9IG1hdGNoWzBdLmxlbmd0aCArIDE7XG4gICAgICAgIHBhcnNlci5jb2x1bW4gPSBzcGFjZXNTdGFydENvbDtcbiAgICAgICAgcGFyc2VyLm9mZnNldCA9IHNwYWNlc1N0YXJ0T2Zmc2V0O1xuICAgICAgICBpZiAocGVlayhwYXJzZXIuY3VycmVudExpbmUsIHBhcnNlci5vZmZzZXQpID09PSBDX1NQQUNFKSB7XG4gICAgICAgICAgICBwYXJzZXIuYWR2YW5jZU9mZnNldCgxLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGRhdGEucGFkZGluZyA9IG1hdGNoWzBdLmxlbmd0aCArIHNwYWNlc19hZnRlcl9tYXJrZXI7XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xufTtcblxuLy8gUmV0dXJucyB0cnVlIGlmIHRoZSB0d28gbGlzdCBpdGVtcyBhcmUgb2YgdGhlIHNhbWUgdHlwZSxcbi8vIHdpdGggdGhlIHNhbWUgZGVsaW1pdGVyIGFuZCBidWxsZXQgY2hhcmFjdGVyLiAgVGhpcyBpcyB1c2VkXG4vLyBpbiBhZ2dsb21lcmF0aW5nIGxpc3QgaXRlbXMgaW50byBsaXN0cy5cbnZhciBsaXN0c01hdGNoID0gZnVuY3Rpb24obGlzdF9kYXRhLCBpdGVtX2RhdGEpIHtcbiAgICByZXR1cm4gKGxpc3RfZGF0YS50eXBlID09PSBpdGVtX2RhdGEudHlwZSAmJlxuICAgICAgICAgICAgbGlzdF9kYXRhLmRlbGltaXRlciA9PT0gaXRlbV9kYXRhLmRlbGltaXRlciAmJlxuICAgICAgICAgICAgbGlzdF9kYXRhLmJ1bGxldENoYXIgPT09IGl0ZW1fZGF0YS5idWxsZXRDaGFyKTtcbn07XG5cbi8vIEZpbmFsaXplIGFuZCBjbG9zZSBhbnkgdW5tYXRjaGVkIGJsb2Nrcy5cbnZhciBjbG9zZVVubWF0Y2hlZEJsb2NrcyA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghdGhpcy5hbGxDbG9zZWQpIHtcbiAgICAgICAgLy8gZmluYWxpemUgYW55IGJsb2NrcyBub3QgbWF0Y2hlZFxuICAgICAgICB3aGlsZSAodGhpcy5vbGR0aXAgIT09IHRoaXMubGFzdE1hdGNoZWRDb250YWluZXIpIHtcbiAgICAgICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLm9sZHRpcC5fcGFyZW50O1xuICAgICAgICAgICAgdGhpcy5maW5hbGl6ZSh0aGlzLm9sZHRpcCwgdGhpcy5saW5lTnVtYmVyIC0gMSk7XG4gICAgICAgICAgICB0aGlzLm9sZHRpcCA9IHBhcmVudDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFsbENsb3NlZCA9IHRydWU7XG4gICAgfVxufTtcblxuLy8gJ2ZpbmFsaXplJyBpcyBydW4gd2hlbiB0aGUgYmxvY2sgaXMgY2xvc2VkLlxuLy8gJ2NvbnRpbnVlJyBpcyBydW4gdG8gY2hlY2sgd2hldGhlciB0aGUgYmxvY2sgaXMgY29udGludWluZ1xuLy8gYXQgYSBjZXJ0YWluIGxpbmUgYW5kIG9mZnNldCAoZS5nLiB3aGV0aGVyIGEgYmxvY2sgcXVvdGVcbi8vIGNvbnRhaW5zIGEgYD5gLiAgSXQgcmV0dXJucyAwIGZvciBtYXRjaGVkLCAxIGZvciBub3QgbWF0Y2hlZCxcbi8vIGFuZCAyIGZvciBcIndlJ3ZlIGRlYWx0IHdpdGggdGhpcyBsaW5lIGNvbXBsZXRlbHksIGdvIHRvIG5leHQuXCJcbnZhciBibG9ja3MgPSB7XG4gICAgRG9jdW1lbnQ6IHtcbiAgICAgICAgY29udGludWU6IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfSxcbiAgICAgICAgZmluYWxpemU6IGZ1bmN0aW9uKCkgeyByZXR1cm47IH0sXG4gICAgICAgIGNhbkNvbnRhaW46IGZ1bmN0aW9uKHQpIHsgcmV0dXJuICh0ICE9PSAnSXRlbScpOyB9LFxuICAgICAgICBhY2NlcHRzTGluZXM6IGZhbHNlXG4gICAgfSxcbiAgICBMaXN0OiB7XG4gICAgICAgIGNvbnRpbnVlOiBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH0sXG4gICAgICAgIGZpbmFsaXplOiBmdW5jdGlvbihwYXJzZXIsIGJsb2NrKSB7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IGJsb2NrLl9maXJzdENoaWxkO1xuICAgICAgICAgICAgd2hpbGUgKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAvLyBjaGVjayBmb3Igbm9uLWZpbmFsIGxpc3QgaXRlbSBlbmRpbmcgd2l0aCBibGFuayBsaW5lOlxuICAgICAgICAgICAgICAgIGlmIChlbmRzV2l0aEJsYW5rTGluZShpdGVtKSAmJiBpdGVtLl9uZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIGJsb2NrLl9saXN0RGF0YS50aWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gcmVjdXJzZSBpbnRvIGNoaWxkcmVuIG9mIGxpc3QgaXRlbSwgdG8gc2VlIGlmIHRoZXJlIGFyZVxuICAgICAgICAgICAgICAgIC8vIHNwYWNlcyBiZXR3ZWVuIGFueSBvZiB0aGVtOlxuICAgICAgICAgICAgICAgIHZhciBzdWJpdGVtID0gaXRlbS5fZmlyc3RDaGlsZDtcbiAgICAgICAgICAgICAgICB3aGlsZSAoc3ViaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZW5kc1dpdGhCbGFua0xpbmUoc3ViaXRlbSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIChpdGVtLl9uZXh0IHx8IHN1Yml0ZW0uX25leHQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBibG9jay5fbGlzdERhdGEudGlnaHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHN1Yml0ZW0gPSBzdWJpdGVtLl9uZXh0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpdGVtID0gaXRlbS5fbmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY2FuQ29udGFpbjogZnVuY3Rpb24odCkgeyByZXR1cm4gKHQgPT09ICdJdGVtJyk7IH0sXG4gICAgICAgIGFjY2VwdHNMaW5lczogZmFsc2VcbiAgICB9LFxuICAgIEJsb2NrUXVvdGU6IHtcbiAgICAgICAgY29udGludWU6IGZ1bmN0aW9uKHBhcnNlcikge1xuICAgICAgICAgICAgdmFyIGxuID0gcGFyc2VyLmN1cnJlbnRMaW5lO1xuICAgICAgICAgICAgaWYgKCFwYXJzZXIuaW5kZW50ZWQgJiZcbiAgICAgICAgICAgICAgICBwZWVrKGxuLCBwYXJzZXIubmV4dE5vbnNwYWNlKSA9PT0gQ19HUkVBVEVSVEhBTikge1xuICAgICAgICAgICAgICAgIHBhcnNlci5hZHZhbmNlTmV4dE5vbnNwYWNlKCk7XG4gICAgICAgICAgICAgICAgcGFyc2VyLmFkdmFuY2VPZmZzZXQoMSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIGlmIChwZWVrKGxuLCBwYXJzZXIub2Zmc2V0KSA9PT0gQ19TUEFDRSkge1xuICAgICAgICAgICAgICAgICAgICBwYXJzZXIub2Zmc2V0Kys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9LFxuICAgICAgICBmaW5hbGl6ZTogZnVuY3Rpb24oKSB7IHJldHVybjsgfSxcbiAgICAgICAgY2FuQ29udGFpbjogZnVuY3Rpb24odCkgeyByZXR1cm4gKHQgIT09ICdJdGVtJyk7IH0sXG4gICAgICAgIGFjY2VwdHNMaW5lczogZmFsc2VcbiAgICB9LFxuICAgIEl0ZW06IHtcbiAgICAgICAgY29udGludWU6IGZ1bmN0aW9uKHBhcnNlciwgY29udGFpbmVyKSB7XG4gICAgICAgICAgICBpZiAocGFyc2VyLmJsYW5rICYmIGNvbnRhaW5lci5fZmlyc3RDaGlsZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHBhcnNlci5hZHZhbmNlTmV4dE5vbnNwYWNlKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBhcnNlci5pbmRlbnQgPj1cbiAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLl9saXN0RGF0YS5tYXJrZXJPZmZzZXQgK1xuICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIuX2xpc3REYXRhLnBhZGRpbmcpIHtcbiAgICAgICAgICAgICAgICBwYXJzZXIuYWR2YW5jZU9mZnNldChjb250YWluZXIuX2xpc3REYXRhLm1hcmtlck9mZnNldCArXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5fbGlzdERhdGEucGFkZGluZywgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH0sXG4gICAgICAgIGZpbmFsaXplOiBmdW5jdGlvbigpIHsgcmV0dXJuOyB9LFxuICAgICAgICBjYW5Db250YWluOiBmdW5jdGlvbih0KSB7IHJldHVybiAodCAhPT0gJ0l0ZW0nKTsgfSxcbiAgICAgICAgYWNjZXB0c0xpbmVzOiBmYWxzZVxuICAgIH0sXG4gICAgSGVhZGluZzoge1xuICAgICAgICBjb250aW51ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBhIGhlYWRpbmcgY2FuIG5ldmVyIGNvbnRhaW5lciA+IDEgbGluZSwgc28gZmFpbCB0byBtYXRjaDpcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9LFxuICAgICAgICBmaW5hbGl6ZTogZnVuY3Rpb24oKSB7IHJldHVybjsgfSxcbiAgICAgICAgY2FuQ29udGFpbjogZnVuY3Rpb24oKSB7IHJldHVybiBmYWxzZTsgfSxcbiAgICAgICAgYWNjZXB0c0xpbmVzOiBmYWxzZVxuICAgIH0sXG4gICAgVGhlbWF0aWNCcmVhazoge1xuICAgICAgICBjb250aW51ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBhIHRoZW1hdGljIGJyZWFrIGNhbiBuZXZlciBjb250YWluZXIgPiAxIGxpbmUsIHNvIGZhaWwgdG8gbWF0Y2g6XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfSxcbiAgICAgICAgZmluYWxpemU6IGZ1bmN0aW9uKCkgeyByZXR1cm47IH0sXG4gICAgICAgIGNhbkNvbnRhaW46IGZ1bmN0aW9uKCkgeyByZXR1cm4gZmFsc2U7IH0sXG4gICAgICAgIGFjY2VwdHNMaW5lczogZmFsc2VcbiAgICB9LFxuICAgIENvZGVCbG9jazoge1xuICAgICAgICBjb250aW51ZTogZnVuY3Rpb24ocGFyc2VyLCBjb250YWluZXIpIHtcbiAgICAgICAgICAgIHZhciBsbiA9IHBhcnNlci5jdXJyZW50TGluZTtcbiAgICAgICAgICAgIHZhciBpbmRlbnQgPSBwYXJzZXIuaW5kZW50O1xuICAgICAgICAgICAgaWYgKGNvbnRhaW5lci5faXNGZW5jZWQpIHsgLy8gZmVuY2VkXG4gICAgICAgICAgICAgICAgdmFyIG1hdGNoID0gKGluZGVudCA8PSAzICYmXG4gICAgICAgICAgICAgICAgICAgIGxuLmNoYXJBdChwYXJzZXIubmV4dE5vbnNwYWNlKSA9PT0gY29udGFpbmVyLl9mZW5jZUNoYXIgJiZcbiAgICAgICAgICAgICAgICAgICAgbG4uc2xpY2UocGFyc2VyLm5leHROb25zcGFjZSkubWF0Y2gocmVDbG9zaW5nQ29kZUZlbmNlKSk7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoICYmIG1hdGNoWzBdLmxlbmd0aCA+PSBjb250YWluZXIuX2ZlbmNlTGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNsb3NpbmcgZmVuY2UgLSB3ZSdyZSBhdCBlbmQgb2YgbGluZSwgc28gd2UgY2FuIHJldHVyblxuICAgICAgICAgICAgICAgICAgICBwYXJzZXIuZmluYWxpemUoY29udGFpbmVyLCBwYXJzZXIubGluZU51bWJlcik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAyO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNraXAgb3B0aW9uYWwgc3BhY2VzIG9mIGZlbmNlIG9mZnNldFxuICAgICAgICAgICAgICAgICAgICB2YXIgaSA9IGNvbnRhaW5lci5fZmVuY2VPZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChpID4gMCAmJiBwZWVrKGxuLCBwYXJzZXIub2Zmc2V0KSA9PT0gQ19TUEFDRSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VyLmFkdmFuY2VPZmZzZXQoMSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHsgLy8gaW5kZW50ZWRcbiAgICAgICAgICAgICAgICBpZiAoaW5kZW50ID49IENPREVfSU5ERU5UKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcnNlci5hZHZhbmNlT2Zmc2V0KENPREVfSU5ERU5ULCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhcnNlci5ibGFuaykge1xuICAgICAgICAgICAgICAgICAgICBwYXJzZXIuYWR2YW5jZU5leHROb25zcGFjZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9LFxuICAgICAgICBmaW5hbGl6ZTogZnVuY3Rpb24ocGFyc2VyLCBibG9jaykge1xuICAgICAgICAgICAgaWYgKGJsb2NrLl9pc0ZlbmNlZCkgeyAvLyBmZW5jZWRcbiAgICAgICAgICAgICAgICAvLyBmaXJzdCBsaW5lIGJlY29tZXMgaW5mbyBzdHJpbmdcbiAgICAgICAgICAgICAgICB2YXIgY29udGVudCA9IGJsb2NrLl9zdHJpbmdfY29udGVudDtcbiAgICAgICAgICAgICAgICB2YXIgbmV3bGluZVBvcyA9IGNvbnRlbnQuaW5kZXhPZignXFxuJyk7XG4gICAgICAgICAgICAgICAgdmFyIGZpcnN0TGluZSA9IGNvbnRlbnQuc2xpY2UoMCwgbmV3bGluZVBvcyk7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3QgPSBjb250ZW50LnNsaWNlKG5ld2xpbmVQb3MgKyAxKTtcbiAgICAgICAgICAgICAgICBibG9jay5pbmZvID0gdW5lc2NhcGVTdHJpbmcoZmlyc3RMaW5lLnRyaW0oKSk7XG4gICAgICAgICAgICAgICAgYmxvY2suX2xpdGVyYWwgPSByZXN0O1xuICAgICAgICAgICAgfSBlbHNlIHsgLy8gaW5kZW50ZWRcbiAgICAgICAgICAgICAgICBibG9jay5fbGl0ZXJhbCA9IGJsb2NrLl9zdHJpbmdfY29udGVudC5yZXBsYWNlKC8oXFxuICopKyQvLCAnXFxuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBibG9jay5fc3RyaW5nX2NvbnRlbnQgPSBudWxsOyAvLyBhbGxvdyBHQ1xuICAgICAgICB9LFxuICAgICAgICBjYW5Db250YWluOiBmdW5jdGlvbigpIHsgcmV0dXJuIGZhbHNlOyB9LFxuICAgICAgICBhY2NlcHRzTGluZXM6IHRydWVcbiAgICB9LFxuICAgIEh0bWxCbG9jazoge1xuICAgICAgICBjb250aW51ZTogZnVuY3Rpb24ocGFyc2VyLCBjb250YWluZXIpIHtcbiAgICAgICAgICAgIHJldHVybiAoKHBhcnNlci5ibGFuayAmJlxuICAgICAgICAgICAgICAgICAgICAgKGNvbnRhaW5lci5faHRtbEJsb2NrVHlwZSA9PT0gNiB8fFxuICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5faHRtbEJsb2NrVHlwZSA9PT0gNykpID8gMSA6IDApO1xuICAgICAgICB9LFxuICAgICAgICBmaW5hbGl6ZTogZnVuY3Rpb24ocGFyc2VyLCBibG9jaykge1xuICAgICAgICAgICAgYmxvY2suX2xpdGVyYWwgPSBibG9jay5fc3RyaW5nX2NvbnRlbnQucmVwbGFjZSgvKFxcbiAqKSskLywgJycpO1xuICAgICAgICAgICAgYmxvY2suX3N0cmluZ19jb250ZW50ID0gbnVsbDsgLy8gYWxsb3cgR0NcbiAgICAgICAgfSxcbiAgICAgICAgY2FuQ29udGFpbjogZnVuY3Rpb24oKSB7IHJldHVybiBmYWxzZTsgfSxcbiAgICAgICAgYWNjZXB0c0xpbmVzOiB0cnVlXG4gICAgfSxcbiAgICBQYXJhZ3JhcGg6IHtcbiAgICAgICAgY29udGludWU6IGZ1bmN0aW9uKHBhcnNlcikge1xuICAgICAgICAgICAgcmV0dXJuIChwYXJzZXIuYmxhbmsgPyAxIDogMCk7XG4gICAgICAgIH0sXG4gICAgICAgIGZpbmFsaXplOiBmdW5jdGlvbihwYXJzZXIsIGJsb2NrKSB7XG4gICAgICAgICAgICB2YXIgcG9zO1xuICAgICAgICAgICAgdmFyIGhhc1JlZmVyZW5jZURlZnMgPSBmYWxzZTtcblxuICAgICAgICAgICAgLy8gdHJ5IHBhcnNpbmcgdGhlIGJlZ2lubmluZyBhcyBsaW5rIHJlZmVyZW5jZSBkZWZpbml0aW9uczpcbiAgICAgICAgICAgIHdoaWxlIChwZWVrKGJsb2NrLl9zdHJpbmdfY29udGVudCwgMCkgPT09IENfT1BFTl9CUkFDS0VUICYmXG4gICAgICAgICAgICAgICAgICAgKHBvcyA9XG4gICAgICAgICAgICAgICAgICAgIHBhcnNlci5pbmxpbmVQYXJzZXIucGFyc2VSZWZlcmVuY2UoYmxvY2suX3N0cmluZ19jb250ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlci5yZWZtYXApKSkge1xuICAgICAgICAgICAgICAgIGJsb2NrLl9zdHJpbmdfY29udGVudCA9IGJsb2NrLl9zdHJpbmdfY29udGVudC5zbGljZShwb3MpO1xuICAgICAgICAgICAgICAgIGhhc1JlZmVyZW5jZURlZnMgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGhhc1JlZmVyZW5jZURlZnMgJiYgaXNCbGFuayhibG9jay5fc3RyaW5nX2NvbnRlbnQpKSB7XG4gICAgICAgICAgICAgICAgYmxvY2sudW5saW5rKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNhbkNvbnRhaW46IGZ1bmN0aW9uKCkgeyByZXR1cm4gZmFsc2U7IH0sXG4gICAgICAgIGFjY2VwdHNMaW5lczogdHJ1ZVxuICAgIH1cbn07XG5cbi8vIGJsb2NrIHN0YXJ0IGZ1bmN0aW9ucy4gIFJldHVybiB2YWx1ZXM6XG4vLyAwID0gbm8gbWF0Y2hcbi8vIDEgPSBtYXRjaGVkIGNvbnRhaW5lciwga2VlcCBnb2luZ1xuLy8gMiA9IG1hdGNoZWQgbGVhZiwgbm8gbW9yZSBibG9jayBzdGFydHNcbnZhciBibG9ja1N0YXJ0cyA9IFtcbiAgICAvLyBibG9jayBxdW90ZVxuICAgIGZ1bmN0aW9uKHBhcnNlcikge1xuICAgICAgICBpZiAoIXBhcnNlci5pbmRlbnRlZCAmJlxuICAgICAgICAgICAgcGVlayhwYXJzZXIuY3VycmVudExpbmUsIHBhcnNlci5uZXh0Tm9uc3BhY2UpID09PSBDX0dSRUFURVJUSEFOKSB7XG4gICAgICAgICAgICBwYXJzZXIuYWR2YW5jZU5leHROb25zcGFjZSgpO1xuICAgICAgICAgICAgcGFyc2VyLmFkdmFuY2VPZmZzZXQoMSwgZmFsc2UpO1xuICAgICAgICAgICAgLy8gb3B0aW9uYWwgZm9sbG93aW5nIHNwYWNlXG4gICAgICAgICAgICBpZiAocGVlayhwYXJzZXIuY3VycmVudExpbmUsIHBhcnNlci5vZmZzZXQpID09PSBDX1NQQUNFKSB7XG4gICAgICAgICAgICAgICAgcGFyc2VyLmFkdmFuY2VPZmZzZXQoMSwgZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFyc2VyLmNsb3NlVW5tYXRjaGVkQmxvY2tzKCk7XG4gICAgICAgICAgICBwYXJzZXIuYWRkQ2hpbGQoJ0Jsb2NrUXVvdGUnLCBwYXJzZXIubmV4dE5vbnNwYWNlKTtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gQVRYIGhlYWRpbmdcbiAgICBmdW5jdGlvbihwYXJzZXIpIHtcbiAgICAgICAgdmFyIG1hdGNoO1xuICAgICAgICBpZiAoIXBhcnNlci5pbmRlbnRlZCAmJlxuICAgICAgICAgICAgKG1hdGNoID0gcGFyc2VyLmN1cnJlbnRMaW5lLnNsaWNlKHBhcnNlci5uZXh0Tm9uc3BhY2UpLm1hdGNoKHJlQVRYSGVhZGluZ01hcmtlcikpKSB7XG4gICAgICAgICAgICBwYXJzZXIuYWR2YW5jZU5leHROb25zcGFjZSgpO1xuICAgICAgICAgICAgcGFyc2VyLmFkdmFuY2VPZmZzZXQobWF0Y2hbMF0ubGVuZ3RoLCBmYWxzZSk7XG4gICAgICAgICAgICBwYXJzZXIuY2xvc2VVbm1hdGNoZWRCbG9ja3MoKTtcbiAgICAgICAgICAgIHZhciBjb250YWluZXIgPSBwYXJzZXIuYWRkQ2hpbGQoJ0hlYWRpbmcnLCBwYXJzZXIubmV4dE5vbnNwYWNlKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5sZXZlbCA9IG1hdGNoWzBdLnRyaW0oKS5sZW5ndGg7IC8vIG51bWJlciBvZiAjc1xuICAgICAgICAgICAgLy8gcmVtb3ZlIHRyYWlsaW5nICMjI3M6XG4gICAgICAgICAgICBjb250YWluZXIuX3N0cmluZ19jb250ZW50ID1cbiAgICAgICAgICAgICAgICBwYXJzZXIuY3VycmVudExpbmUuc2xpY2UocGFyc2VyLm9mZnNldCkucmVwbGFjZSgvXiAqIysgKiQvLCAnJykucmVwbGFjZSgvICsjKyAqJC8sICcnKTtcbiAgICAgICAgICAgIHBhcnNlci5hZHZhbmNlT2Zmc2V0KHBhcnNlci5jdXJyZW50TGluZS5sZW5ndGggLSBwYXJzZXIub2Zmc2V0KTtcbiAgICAgICAgICAgIHJldHVybiAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gRmVuY2VkIGNvZGUgYmxvY2tcbiAgICBmdW5jdGlvbihwYXJzZXIpIHtcbiAgICAgICAgdmFyIG1hdGNoO1xuICAgICAgICBpZiAoIXBhcnNlci5pbmRlbnRlZCAmJlxuICAgICAgICAgICAgKG1hdGNoID0gcGFyc2VyLmN1cnJlbnRMaW5lLnNsaWNlKHBhcnNlci5uZXh0Tm9uc3BhY2UpLm1hdGNoKHJlQ29kZUZlbmNlKSkpIHtcbiAgICAgICAgICAgIHZhciBmZW5jZUxlbmd0aCA9IG1hdGNoWzBdLmxlbmd0aDtcbiAgICAgICAgICAgIHBhcnNlci5jbG9zZVVubWF0Y2hlZEJsb2NrcygpO1xuICAgICAgICAgICAgdmFyIGNvbnRhaW5lciA9IHBhcnNlci5hZGRDaGlsZCgnQ29kZUJsb2NrJywgcGFyc2VyLm5leHROb25zcGFjZSk7XG4gICAgICAgICAgICBjb250YWluZXIuX2lzRmVuY2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5fZmVuY2VMZW5ndGggPSBmZW5jZUxlbmd0aDtcbiAgICAgICAgICAgIGNvbnRhaW5lci5fZmVuY2VDaGFyID0gbWF0Y2hbMF1bMF07XG4gICAgICAgICAgICBjb250YWluZXIuX2ZlbmNlT2Zmc2V0ID0gcGFyc2VyLmluZGVudDtcbiAgICAgICAgICAgIHBhcnNlci5hZHZhbmNlTmV4dE5vbnNwYWNlKCk7XG4gICAgICAgICAgICBwYXJzZXIuYWR2YW5jZU9mZnNldChmZW5jZUxlbmd0aCwgZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuIDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBIVE1MIGJsb2NrXG4gICAgZnVuY3Rpb24ocGFyc2VyLCBjb250YWluZXIpIHtcbiAgICAgICAgaWYgKCFwYXJzZXIuaW5kZW50ZWQgJiZcbiAgICAgICAgICAgIHBlZWsocGFyc2VyLmN1cnJlbnRMaW5lLCBwYXJzZXIubmV4dE5vbnNwYWNlKSA9PT0gQ19MRVNTVEhBTikge1xuICAgICAgICAgICAgdmFyIHMgPSBwYXJzZXIuY3VycmVudExpbmUuc2xpY2UocGFyc2VyLm5leHROb25zcGFjZSk7XG4gICAgICAgICAgICB2YXIgYmxvY2tUeXBlO1xuXG4gICAgICAgICAgICBmb3IgKGJsb2NrVHlwZSA9IDE7IGJsb2NrVHlwZSA8PSA3OyBibG9ja1R5cGUrKykge1xuICAgICAgICAgICAgICAgIGlmIChyZUh0bWxCbG9ja09wZW5bYmxvY2tUeXBlXS50ZXN0KHMpICYmXG4gICAgICAgICAgICAgICAgICAgIChibG9ja1R5cGUgPCA3IHx8XG4gICAgICAgICAgICAgICAgICAgICBjb250YWluZXIudHlwZSAhPT0gJ1BhcmFncmFwaCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcnNlci5jbG9zZVVubWF0Y2hlZEJsb2NrcygpO1xuICAgICAgICAgICAgICAgICAgICAvLyBXZSBkb24ndCBhZGp1c3QgcGFyc2VyLm9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgLy8gc3BhY2VzIGFyZSBwYXJ0IG9mIHRoZSBIVE1MIGJsb2NrOlxuICAgICAgICAgICAgICAgICAgICB2YXIgYiA9IHBhcnNlci5hZGRDaGlsZCgnSHRtbEJsb2NrJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VyLm9mZnNldCk7XG4gICAgICAgICAgICAgICAgICAgIGIuX2h0bWxCbG9ja1R5cGUgPSBibG9ja1R5cGU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAwO1xuXG4gICAgfSxcblxuICAgIC8vIFNldGV4dCBoZWFkaW5nXG4gICAgZnVuY3Rpb24ocGFyc2VyLCBjb250YWluZXIpIHtcbiAgICAgICAgdmFyIG1hdGNoO1xuICAgICAgICBpZiAoIXBhcnNlci5pbmRlbnRlZCAmJlxuICAgICAgICAgICAgY29udGFpbmVyLnR5cGUgPT09ICdQYXJhZ3JhcGgnICYmXG4gICAgICAgICAgICAgICAgICAgKChtYXRjaCA9IHBhcnNlci5jdXJyZW50TGluZS5zbGljZShwYXJzZXIubmV4dE5vbnNwYWNlKS5tYXRjaChyZVNldGV4dEhlYWRpbmdMaW5lKSkpKSB7XG4gICAgICAgICAgICBwYXJzZXIuY2xvc2VVbm1hdGNoZWRCbG9ja3MoKTtcbiAgICAgICAgICAgIHZhciBoZWFkaW5nID0gbmV3IE5vZGUoJ0hlYWRpbmcnLCBjb250YWluZXIuc291cmNlcG9zKTtcbiAgICAgICAgICAgIGhlYWRpbmcubGV2ZWwgPSBtYXRjaFswXVswXSA9PT0gJz0nID8gMSA6IDI7XG4gICAgICAgICAgICBoZWFkaW5nLl9zdHJpbmdfY29udGVudCA9IGNvbnRhaW5lci5fc3RyaW5nX2NvbnRlbnQ7XG4gICAgICAgICAgICBjb250YWluZXIuaW5zZXJ0QWZ0ZXIoaGVhZGluZyk7XG4gICAgICAgICAgICBjb250YWluZXIudW5saW5rKCk7XG4gICAgICAgICAgICBwYXJzZXIudGlwID0gaGVhZGluZztcbiAgICAgICAgICAgIHBhcnNlci5hZHZhbmNlT2Zmc2V0KHBhcnNlci5jdXJyZW50TGluZS5sZW5ndGggLSBwYXJzZXIub2Zmc2V0LCBmYWxzZSk7XG4gICAgICAgICAgICByZXR1cm4gMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vIHRoZW1hdGljIGJyZWFrXG4gICAgZnVuY3Rpb24ocGFyc2VyKSB7XG4gICAgICAgIGlmICghcGFyc2VyLmluZGVudGVkICYmXG4gICAgICAgICAgICByZVRoZW1hdGljQnJlYWsudGVzdChwYXJzZXIuY3VycmVudExpbmUuc2xpY2UocGFyc2VyLm5leHROb25zcGFjZSkpKSB7XG4gICAgICAgICAgICBwYXJzZXIuY2xvc2VVbm1hdGNoZWRCbG9ja3MoKTtcbiAgICAgICAgICAgIHBhcnNlci5hZGRDaGlsZCgnVGhlbWF0aWNCcmVhaycsIHBhcnNlci5uZXh0Tm9uc3BhY2UpO1xuICAgICAgICAgICAgcGFyc2VyLmFkdmFuY2VPZmZzZXQocGFyc2VyLmN1cnJlbnRMaW5lLmxlbmd0aCAtIHBhcnNlci5vZmZzZXQsIGZhbHNlKTtcbiAgICAgICAgICAgIHJldHVybiAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gbGlzdCBpdGVtXG4gICAgZnVuY3Rpb24ocGFyc2VyLCBjb250YWluZXIpIHtcbiAgICAgICAgdmFyIGRhdGE7XG5cbiAgICAgICAgaWYgKCghcGFyc2VyLmluZGVudGVkIHx8IGNvbnRhaW5lci50eXBlID09PSAnTGlzdCcpXG4gICAgICAgICAgICAgICAgJiYgKGRhdGEgPSBwYXJzZUxpc3RNYXJrZXIocGFyc2VyKSkpIHtcbiAgICAgICAgICAgIHBhcnNlci5jbG9zZVVubWF0Y2hlZEJsb2NrcygpO1xuXG4gICAgICAgICAgICAvLyBhZGQgdGhlIGxpc3QgaWYgbmVlZGVkXG4gICAgICAgICAgICBpZiAocGFyc2VyLnRpcC50eXBlICE9PSAnTGlzdCcgfHxcbiAgICAgICAgICAgICAgICAhKGxpc3RzTWF0Y2goY29udGFpbmVyLl9saXN0RGF0YSwgZGF0YSkpKSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gcGFyc2VyLmFkZENoaWxkKCdMaXN0JywgcGFyc2VyLm5leHROb25zcGFjZSk7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLl9saXN0RGF0YSA9IGRhdGE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGFkZCB0aGUgbGlzdCBpdGVtXG4gICAgICAgICAgICBjb250YWluZXIgPSBwYXJzZXIuYWRkQ2hpbGQoJ0l0ZW0nLCBwYXJzZXIubmV4dE5vbnNwYWNlKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5fbGlzdERhdGEgPSBkYXRhO1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBpbmRlbnRlZCBjb2RlIGJsb2NrXG4gICAgZnVuY3Rpb24ocGFyc2VyKSB7XG4gICAgICAgIGlmIChwYXJzZXIuaW5kZW50ZWQgJiZcbiAgICAgICAgICAgIHBhcnNlci50aXAudHlwZSAhPT0gJ1BhcmFncmFwaCcgJiZcbiAgICAgICAgICAgICFwYXJzZXIuYmxhbmspIHtcbiAgICAgICAgICAgIC8vIGluZGVudGVkIGNvZGVcbiAgICAgICAgICAgIHBhcnNlci5hZHZhbmNlT2Zmc2V0KENPREVfSU5ERU5ULCB0cnVlKTtcbiAgICAgICAgICAgIHBhcnNlci5jbG9zZVVubWF0Y2hlZEJsb2NrcygpO1xuICAgICAgICAgICAgcGFyc2VyLmFkZENoaWxkKCdDb2RlQmxvY2snLCBwYXJzZXIub2Zmc2V0KTtcbiAgICAgICAgICAgIHJldHVybiAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgfVxuXG5dO1xuXG52YXIgYWR2YW5jZU9mZnNldCA9IGZ1bmN0aW9uKGNvdW50LCBjb2x1bW5zKSB7XG4gICAgdmFyIGNvbHMgPSAwO1xuICAgIHZhciBjdXJyZW50TGluZSA9IHRoaXMuY3VycmVudExpbmU7XG4gICAgdmFyIGNoYXJzVG9UYWI7XG4gICAgdmFyIGM7XG4gICAgd2hpbGUgKGNvdW50ID4gMCAmJiAoYyA9IGN1cnJlbnRMaW5lW3RoaXMub2Zmc2V0XSkpIHtcbiAgICAgICAgaWYgKGMgPT09ICdcXHQnKSB7XG4gICAgICAgICAgICBjaGFyc1RvVGFiID0gNCAtICh0aGlzLmNvbHVtbiAlIDQpO1xuICAgICAgICAgICAgdGhpcy5jb2x1bW4gKz0gY2hhcnNUb1RhYjtcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0ICs9IDE7XG4gICAgICAgICAgICBjb3VudCAtPSAoY29sdW1ucyA/IGNoYXJzVG9UYWIgOiAxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbHMgKz0gMTtcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0ICs9IDE7XG4gICAgICAgICAgICB0aGlzLmNvbHVtbiArPSAxOyAvLyBhc3N1bWUgYXNjaWk7IGJsb2NrIHN0YXJ0cyBhcmUgYXNjaWlcbiAgICAgICAgICAgIGNvdW50IC09IDE7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG52YXIgYWR2YW5jZU5leHROb25zcGFjZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMub2Zmc2V0ID0gdGhpcy5uZXh0Tm9uc3BhY2U7XG4gICAgdGhpcy5jb2x1bW4gPSB0aGlzLm5leHROb25zcGFjZUNvbHVtbjtcbn07XG5cbnZhciBmaW5kTmV4dE5vbnNwYWNlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGN1cnJlbnRMaW5lID0gdGhpcy5jdXJyZW50TGluZTtcbiAgICB2YXIgaSA9IHRoaXMub2Zmc2V0O1xuICAgIHZhciBjb2xzID0gdGhpcy5jb2x1bW47XG4gICAgdmFyIGM7XG5cbiAgICB3aGlsZSAoKGMgPSBjdXJyZW50TGluZS5jaGFyQXQoaSkpICE9PSAnJykge1xuICAgICAgICBpZiAoYyA9PT0gJyAnKSB7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgICBjb2xzKys7XG4gICAgICAgIH0gZWxzZSBpZiAoYyA9PT0gJ1xcdCcpIHtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIGNvbHMgKz0gKDQgLSAoY29scyAlIDQpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMuYmxhbmsgPSAoYyA9PT0gJ1xcbicgfHwgYyA9PT0gJ1xccicgfHwgYyA9PT0gJycpO1xuICAgIHRoaXMubmV4dE5vbnNwYWNlID0gaTtcbiAgICB0aGlzLm5leHROb25zcGFjZUNvbHVtbiA9IGNvbHM7XG4gICAgdGhpcy5pbmRlbnQgPSB0aGlzLm5leHROb25zcGFjZUNvbHVtbiAtIHRoaXMuY29sdW1uO1xuICAgIHRoaXMuaW5kZW50ZWQgPSB0aGlzLmluZGVudCA+PSBDT0RFX0lOREVOVDtcbn07XG5cbi8vIEFuYWx5emUgYSBsaW5lIG9mIHRleHQgYW5kIHVwZGF0ZSB0aGUgZG9jdW1lbnQgYXBwcm9wcmlhdGVseS5cbi8vIFdlIHBhcnNlIG1hcmtkb3duIHRleHQgYnkgY2FsbGluZyB0aGlzIG9uIGVhY2ggbGluZSBvZiBpbnB1dCxcbi8vIHRoZW4gZmluYWxpemluZyB0aGUgZG9jdW1lbnQuXG52YXIgaW5jb3Jwb3JhdGVMaW5lID0gZnVuY3Rpb24obG4pIHtcbiAgICB2YXIgYWxsX21hdGNoZWQgPSB0cnVlO1xuICAgIHZhciB0O1xuXG4gICAgdmFyIGNvbnRhaW5lciA9IHRoaXMuZG9jO1xuICAgIHRoaXMub2xkdGlwID0gdGhpcy50aXA7XG4gICAgdGhpcy5vZmZzZXQgPSAwO1xuICAgIHRoaXMuY29sdW1uID0gMDtcbiAgICB0aGlzLmxpbmVOdW1iZXIgKz0gMTtcblxuICAgIC8vIHJlcGxhY2UgTlVMIGNoYXJhY3RlcnMgZm9yIHNlY3VyaXR5XG4gICAgaWYgKGxuLmluZGV4T2YoJ1xcdTAwMDAnKSAhPT0gLTEpIHtcbiAgICAgICAgbG4gPSBsbi5yZXBsYWNlKC9cXDAvZywgJ1xcdUZGRkQnKTtcbiAgICB9XG5cbiAgICB0aGlzLmN1cnJlbnRMaW5lID0gbG47XG5cbiAgICAvLyBGb3IgZWFjaCBjb250YWluaW5nIGJsb2NrLCB0cnkgdG8gcGFyc2UgdGhlIGFzc29jaWF0ZWQgbGluZSBzdGFydC5cbiAgICAvLyBCYWlsIG91dCBvbiBmYWlsdXJlOiBjb250YWluZXIgd2lsbCBwb2ludCB0byB0aGUgbGFzdCBtYXRjaGluZyBibG9jay5cbiAgICAvLyBTZXQgYWxsX21hdGNoZWQgdG8gZmFsc2UgaWYgbm90IGFsbCBjb250YWluZXJzIG1hdGNoLlxuICAgIHZhciBsYXN0Q2hpbGQ7XG4gICAgd2hpbGUgKChsYXN0Q2hpbGQgPSBjb250YWluZXIuX2xhc3RDaGlsZCkgJiYgbGFzdENoaWxkLl9vcGVuKSB7XG4gICAgICAgIGNvbnRhaW5lciA9IGxhc3RDaGlsZDtcblxuICAgICAgICB0aGlzLmZpbmROZXh0Tm9uc3BhY2UoKTtcblxuICAgICAgICBzd2l0Y2ggKHRoaXMuYmxvY2tzW2NvbnRhaW5lci50eXBlXS5jb250aW51ZSh0aGlzLCBjb250YWluZXIpKSB7XG4gICAgICAgIGNhc2UgMDogLy8gd2UndmUgbWF0Y2hlZCwga2VlcCBnb2luZ1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTogLy8gd2UndmUgZmFpbGVkIHRvIG1hdGNoIGEgYmxvY2tcbiAgICAgICAgICAgIGFsbF9tYXRjaGVkID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOiAvLyB3ZSd2ZSBoaXQgZW5kIG9mIGxpbmUgZm9yIGZlbmNlZCBjb2RlIGNsb3NlIGFuZCBjYW4gcmV0dXJuXG4gICAgICAgICAgICB0aGlzLmxhc3RMaW5lTGVuZ3RoID0gbG4ubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgJ2NvbnRpbnVlIHJldHVybmVkIGlsbGVnYWwgdmFsdWUsIG11c3QgYmUgMCwgMSwgb3IgMic7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFhbGxfbWF0Y2hlZCkge1xuICAgICAgICAgICAgY29udGFpbmVyID0gY29udGFpbmVyLl9wYXJlbnQ7IC8vIGJhY2sgdXAgdG8gbGFzdCBtYXRjaGluZyBibG9ja1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmFsbENsb3NlZCA9IChjb250YWluZXIgPT09IHRoaXMub2xkdGlwKTtcbiAgICB0aGlzLmxhc3RNYXRjaGVkQ29udGFpbmVyID0gY29udGFpbmVyO1xuXG4gICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHdlJ3ZlIGhpdCAybmQgYmxhbmsgbGluZTsgaWYgc28gYnJlYWsgb3V0IG9mIGxpc3Q6XG4gICAgaWYgKHRoaXMuYmxhbmsgJiYgY29udGFpbmVyLl9sYXN0TGluZUJsYW5rKSB7XG4gICAgICAgIHRoaXMuYnJlYWtPdXRPZkxpc3RzKGNvbnRhaW5lcik7XG4gICAgICAgIGNvbnRhaW5lciA9IHRoaXMudGlwO1xuICAgIH1cblxuICAgIHZhciBtYXRjaGVkTGVhZiA9IGNvbnRhaW5lci50eXBlICE9PSAnUGFyYWdyYXBoJyAmJlxuICAgICAgICAgICAgYmxvY2tzW2NvbnRhaW5lci50eXBlXS5hY2NlcHRzTGluZXM7XG4gICAgdmFyIHN0YXJ0cyA9IHRoaXMuYmxvY2tTdGFydHM7XG4gICAgdmFyIHN0YXJ0c0xlbiA9IHN0YXJ0cy5sZW5ndGg7XG4gICAgLy8gVW5sZXNzIGxhc3QgbWF0Y2hlZCBjb250YWluZXIgaXMgYSBjb2RlIGJsb2NrLCB0cnkgbmV3IGNvbnRhaW5lciBzdGFydHMsXG4gICAgLy8gYWRkaW5nIGNoaWxkcmVuIHRvIHRoZSBsYXN0IG1hdGNoZWQgY29udGFpbmVyOlxuICAgIHdoaWxlICghbWF0Y2hlZExlYWYpIHtcblxuICAgICAgICB0aGlzLmZpbmROZXh0Tm9uc3BhY2UoKTtcblxuICAgICAgICAvLyB0aGlzIGlzIGEgbGl0dGxlIHBlcmZvcm1hbmNlIG9wdGltaXphdGlvbjpcbiAgICAgICAgaWYgKCF0aGlzLmluZGVudGVkICYmXG4gICAgICAgICAgICAhcmVNYXliZVNwZWNpYWwudGVzdChsbi5zbGljZSh0aGlzLm5leHROb25zcGFjZSkpKSB7XG4gICAgICAgICAgICB0aGlzLmFkdmFuY2VOZXh0Tm9uc3BhY2UoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICB3aGlsZSAoaSA8IHN0YXJ0c0xlbikge1xuICAgICAgICAgICAgdmFyIHJlcyA9IHN0YXJ0c1tpXSh0aGlzLCBjb250YWluZXIpO1xuICAgICAgICAgICAgaWYgKHJlcyA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9IHRoaXMudGlwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChyZXMgPT09IDIpIHtcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSB0aGlzLnRpcDtcbiAgICAgICAgICAgICAgICBtYXRjaGVkTGVhZiA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpID09PSBzdGFydHNMZW4pIHsgLy8gbm90aGluZyBtYXRjaGVkXG4gICAgICAgICAgICB0aGlzLmFkdmFuY2VOZXh0Tm9uc3BhY2UoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gV2hhdCByZW1haW5zIGF0IHRoZSBvZmZzZXQgaXMgYSB0ZXh0IGxpbmUuICBBZGQgdGhlIHRleHQgdG8gdGhlXG4gICAgLy8gYXBwcm9wcmlhdGUgY29udGFpbmVyLlxuXG4gICAvLyBGaXJzdCBjaGVjayBmb3IgYSBsYXp5IHBhcmFncmFwaCBjb250aW51YXRpb246XG4gICAgaWYgKCF0aGlzLmFsbENsb3NlZCAmJiAhdGhpcy5ibGFuayAmJlxuICAgICAgICB0aGlzLnRpcC50eXBlID09PSAnUGFyYWdyYXBoJykge1xuICAgICAgICAvLyBsYXp5IHBhcmFncmFwaCBjb250aW51YXRpb25cbiAgICAgICAgdGhpcy5hZGRMaW5lKCk7XG5cbiAgICB9IGVsc2UgeyAvLyBub3QgYSBsYXp5IGNvbnRpbnVhdGlvblxuXG4gICAgICAgIC8vIGZpbmFsaXplIGFueSBibG9ja3Mgbm90IG1hdGNoZWRcbiAgICAgICAgdGhpcy5jbG9zZVVubWF0Y2hlZEJsb2NrcygpO1xuICAgICAgICBpZiAodGhpcy5ibGFuayAmJiBjb250YWluZXIubGFzdENoaWxkKSB7XG4gICAgICAgICAgICBjb250YWluZXIubGFzdENoaWxkLl9sYXN0TGluZUJsYW5rID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHQgPSBjb250YWluZXIudHlwZTtcblxuICAgICAgICAvLyBCbG9jayBxdW90ZSBsaW5lcyBhcmUgbmV2ZXIgYmxhbmsgYXMgdGhleSBzdGFydCB3aXRoID5cbiAgICAgICAgLy8gYW5kIHdlIGRvbid0IGNvdW50IGJsYW5rcyBpbiBmZW5jZWQgY29kZSBmb3IgcHVycG9zZXMgb2YgdGlnaHQvbG9vc2VcbiAgICAgICAgLy8gbGlzdHMgb3IgYnJlYWtpbmcgb3V0IG9mIGxpc3RzLiAgV2UgYWxzbyBkb24ndCBzZXQgX2xhc3RMaW5lQmxhbmtcbiAgICAgICAgLy8gb24gYW4gZW1wdHkgbGlzdCBpdGVtLCBvciBpZiB3ZSBqdXN0IGNsb3NlZCBhIGZlbmNlZCBibG9jay5cbiAgICAgICAgdmFyIGxhc3RMaW5lQmxhbmsgPSB0aGlzLmJsYW5rICYmXG4gICAgICAgICAgICAhKHQgPT09ICdCbG9ja1F1b3RlJyB8fFxuICAgICAgICAgICAgICAodCA9PT0gJ0NvZGVCbG9jaycgJiYgY29udGFpbmVyLl9pc0ZlbmNlZCkgfHxcbiAgICAgICAgICAgICAgKHQgPT09ICdJdGVtJyAmJlxuICAgICAgICAgICAgICAgIWNvbnRhaW5lci5fZmlyc3RDaGlsZCAmJlxuICAgICAgICAgICAgICAgY29udGFpbmVyLnNvdXJjZXBvc1swXVswXSA9PT0gdGhpcy5saW5lTnVtYmVyKSk7XG5cbiAgICAgICAgLy8gcHJvcGFnYXRlIGxhc3RMaW5lQmxhbmsgdXAgdGhyb3VnaCBwYXJlbnRzOlxuICAgICAgICB2YXIgY29udCA9IGNvbnRhaW5lcjtcbiAgICAgICAgd2hpbGUgKGNvbnQpIHtcbiAgICAgICAgICAgIGNvbnQuX2xhc3RMaW5lQmxhbmsgPSBsYXN0TGluZUJsYW5rO1xuICAgICAgICAgICAgY29udCA9IGNvbnQuX3BhcmVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmJsb2Nrc1t0XS5hY2NlcHRzTGluZXMpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkTGluZSgpO1xuICAgICAgICAgICAgLy8gaWYgSHRtbEJsb2NrLCBjaGVjayBmb3IgZW5kIGNvbmRpdGlvblxuICAgICAgICAgICAgaWYgKHQgPT09ICdIdG1sQmxvY2snICYmXG4gICAgICAgICAgICAgICAgY29udGFpbmVyLl9odG1sQmxvY2tUeXBlID49IDEgJiZcbiAgICAgICAgICAgICAgICBjb250YWluZXIuX2h0bWxCbG9ja1R5cGUgPD0gNSAmJlxuICAgICAgICAgICAgICAgIHJlSHRtbEJsb2NrQ2xvc2VbY29udGFpbmVyLl9odG1sQmxvY2tUeXBlXS50ZXN0KHRoaXMuY3VycmVudExpbmUuc2xpY2UodGhpcy5vZmZzZXQpKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZmluYWxpemUoY29udGFpbmVyLCB0aGlzLmxpbmVOdW1iZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5vZmZzZXQgPCBsbi5sZW5ndGggJiYgIXRoaXMuYmxhbmspIHtcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBwYXJhZ3JhcGggY29udGFpbmVyIGZvciBsaW5lXG4gICAgICAgICAgICBjb250YWluZXIgPSB0aGlzLmFkZENoaWxkKCdQYXJhZ3JhcGgnLCB0aGlzLm9mZnNldCk7XG4gICAgICAgICAgICB0aGlzLmFkdmFuY2VOZXh0Tm9uc3BhY2UoKTtcbiAgICAgICAgICAgIHRoaXMuYWRkTGluZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMubGFzdExpbmVMZW5ndGggPSBsbi5sZW5ndGg7XG59O1xuXG4vLyBGaW5hbGl6ZSBhIGJsb2NrLiAgQ2xvc2UgaXQgYW5kIGRvIGFueSBuZWNlc3NhcnkgcG9zdHByb2Nlc3NpbmcsXG4vLyBlLmcuIGNyZWF0aW5nIHN0cmluZ19jb250ZW50IGZyb20gc3RyaW5ncywgc2V0dGluZyB0aGUgJ3RpZ2h0J1xuLy8gb3IgJ2xvb3NlJyBzdGF0dXMgb2YgYSBsaXN0LCBhbmQgcGFyc2luZyB0aGUgYmVnaW5uaW5nc1xuLy8gb2YgcGFyYWdyYXBocyBmb3IgcmVmZXJlbmNlIGRlZmluaXRpb25zLiAgUmVzZXQgdGhlIHRpcCB0byB0aGVcbi8vIHBhcmVudCBvZiB0aGUgY2xvc2VkIGJsb2NrLlxudmFyIGZpbmFsaXplID0gZnVuY3Rpb24oYmxvY2ssIGxpbmVOdW1iZXIpIHtcbiAgICB2YXIgYWJvdmUgPSBibG9jay5fcGFyZW50O1xuICAgIGJsb2NrLl9vcGVuID0gZmFsc2U7XG4gICAgYmxvY2suc291cmNlcG9zWzFdID0gW2xpbmVOdW1iZXIsIHRoaXMubGFzdExpbmVMZW5ndGhdO1xuXG4gICAgdGhpcy5ibG9ja3NbYmxvY2sudHlwZV0uZmluYWxpemUodGhpcywgYmxvY2spO1xuXG4gICAgdGhpcy50aXAgPSBhYm92ZTtcbn07XG5cbi8vIFdhbGsgdGhyb3VnaCBhIGJsb2NrICYgY2hpbGRyZW4gcmVjdXJzaXZlbHksIHBhcnNpbmcgc3RyaW5nIGNvbnRlbnRcbi8vIGludG8gaW5saW5lIGNvbnRlbnQgd2hlcmUgYXBwcm9wcmlhdGUuXG52YXIgcHJvY2Vzc0lubGluZXMgPSBmdW5jdGlvbihibG9jaykge1xuICAgIHZhciBub2RlLCBldmVudCwgdDtcbiAgICB2YXIgd2Fsa2VyID0gYmxvY2sud2Fsa2VyKCk7XG4gICAgdGhpcy5pbmxpbmVQYXJzZXIucmVmbWFwID0gdGhpcy5yZWZtYXA7XG4gICAgdGhpcy5pbmxpbmVQYXJzZXIub3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICB3aGlsZSAoKGV2ZW50ID0gd2Fsa2VyLm5leHQoKSkpIHtcbiAgICAgICAgbm9kZSA9IGV2ZW50Lm5vZGU7XG4gICAgICAgIHQgPSBub2RlLnR5cGU7XG4gICAgICAgIGlmICghZXZlbnQuZW50ZXJpbmcgJiYgKHQgPT09ICdQYXJhZ3JhcGgnIHx8IHQgPT09ICdIZWFkaW5nJykpIHtcbiAgICAgICAgICAgIHRoaXMuaW5saW5lUGFyc2VyLnBhcnNlKG5vZGUpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxudmFyIERvY3VtZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRvYyA9IG5ldyBOb2RlKCdEb2N1bWVudCcsIFtbMSwgMV0sIFswLCAwXV0pO1xuICAgIHJldHVybiBkb2M7XG59O1xuXG4vLyBUaGUgbWFpbiBwYXJzaW5nIGZ1bmN0aW9uLiAgUmV0dXJucyBhIHBhcnNlZCBkb2N1bWVudCBBU1QuXG52YXIgcGFyc2UgPSBmdW5jdGlvbihpbnB1dCkge1xuICAgIHRoaXMuZG9jID0gbmV3IERvY3VtZW50KCk7XG4gICAgdGhpcy50aXAgPSB0aGlzLmRvYztcbiAgICB0aGlzLnJlZm1hcCA9IHt9O1xuICAgIHRoaXMubGluZU51bWJlciA9IDA7XG4gICAgdGhpcy5sYXN0TGluZUxlbmd0aCA9IDA7XG4gICAgdGhpcy5vZmZzZXQgPSAwO1xuICAgIHRoaXMuY29sdW1uID0gMDtcbiAgICB0aGlzLmxhc3RNYXRjaGVkQ29udGFpbmVyID0gdGhpcy5kb2M7XG4gICAgdGhpcy5jdXJyZW50TGluZSA9IFwiXCI7XG4gICAgaWYgKHRoaXMub3B0aW9ucy50aW1lKSB7IGNvbnNvbGUudGltZShcInByZXBhcmluZyBpbnB1dFwiKTsgfVxuICAgIHZhciBsaW5lcyA9IGlucHV0LnNwbGl0KHJlTGluZUVuZGluZyk7XG4gICAgdmFyIGxlbiA9IGxpbmVzLmxlbmd0aDtcbiAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChpbnB1dC5sZW5ndGggLSAxKSA9PT0gQ19ORVdMSU5FKSB7XG4gICAgICAgIC8vIGlnbm9yZSBsYXN0IGJsYW5rIGxpbmUgY3JlYXRlZCBieSBmaW5hbCBuZXdsaW5lXG4gICAgICAgIGxlbiAtPSAxO1xuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLnRpbWUpIHsgY29uc29sZS50aW1lRW5kKFwicHJlcGFyaW5nIGlucHV0XCIpOyB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy50aW1lKSB7IGNvbnNvbGUudGltZShcImJsb2NrIHBhcnNpbmdcIik7IH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHRoaXMuaW5jb3Jwb3JhdGVMaW5lKGxpbmVzW2ldKTtcbiAgICB9XG4gICAgd2hpbGUgKHRoaXMudGlwKSB7XG4gICAgICAgIHRoaXMuZmluYWxpemUodGhpcy50aXAsIGxlbik7XG4gICAgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMudGltZSkgeyBjb25zb2xlLnRpbWVFbmQoXCJibG9jayBwYXJzaW5nXCIpOyB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy50aW1lKSB7IGNvbnNvbGUudGltZShcImlubGluZSBwYXJzaW5nXCIpOyB9XG4gICAgdGhpcy5wcm9jZXNzSW5saW5lcyh0aGlzLmRvYyk7XG4gICAgaWYgKHRoaXMub3B0aW9ucy50aW1lKSB7IGNvbnNvbGUudGltZUVuZChcImlubGluZSBwYXJzaW5nXCIpOyB9XG4gICAgcmV0dXJuIHRoaXMuZG9jO1xufTtcblxuXG4vLyBUaGUgUGFyc2VyIG9iamVjdC5cbmZ1bmN0aW9uIFBhcnNlcihvcHRpb25zKXtcbiAgICByZXR1cm4ge1xuICAgICAgICBkb2M6IG5ldyBEb2N1bWVudCgpLFxuICAgICAgICBibG9ja3M6IGJsb2NrcyxcbiAgICAgICAgYmxvY2tTdGFydHM6IGJsb2NrU3RhcnRzLFxuICAgICAgICB0aXA6IHRoaXMuZG9jLFxuICAgICAgICBvbGR0aXA6IHRoaXMuZG9jLFxuICAgICAgICBjdXJyZW50TGluZTogXCJcIixcbiAgICAgICAgbGluZU51bWJlcjogMCxcbiAgICAgICAgb2Zmc2V0OiAwLFxuICAgICAgICBjb2x1bW46IDAsXG4gICAgICAgIG5leHROb25zcGFjZTogMCxcbiAgICAgICAgbmV4dE5vbnNwYWNlQ29sdW1uOiAwLFxuICAgICAgICBpbmRlbnQ6IDAsXG4gICAgICAgIGluZGVudGVkOiBmYWxzZSxcbiAgICAgICAgYmxhbms6IGZhbHNlLFxuICAgICAgICBhbGxDbG9zZWQ6IHRydWUsXG4gICAgICAgIGxhc3RNYXRjaGVkQ29udGFpbmVyOiB0aGlzLmRvYyxcbiAgICAgICAgcmVmbWFwOiB7fSxcbiAgICAgICAgbGFzdExpbmVMZW5ndGg6IDAsXG4gICAgICAgIGlubGluZVBhcnNlcjogbmV3IElubGluZVBhcnNlcihvcHRpb25zKSxcbiAgICAgICAgZmluZE5leHROb25zcGFjZTogZmluZE5leHROb25zcGFjZSxcbiAgICAgICAgYWR2YW5jZU9mZnNldDogYWR2YW5jZU9mZnNldCxcbiAgICAgICAgYWR2YW5jZU5leHROb25zcGFjZTogYWR2YW5jZU5leHROb25zcGFjZSxcbiAgICAgICAgYnJlYWtPdXRPZkxpc3RzOiBicmVha091dE9mTGlzdHMsXG4gICAgICAgIGFkZExpbmU6IGFkZExpbmUsXG4gICAgICAgIGFkZENoaWxkOiBhZGRDaGlsZCxcbiAgICAgICAgaW5jb3Jwb3JhdGVMaW5lOiBpbmNvcnBvcmF0ZUxpbmUsXG4gICAgICAgIGZpbmFsaXplOiBmaW5hbGl6ZSxcbiAgICAgICAgcHJvY2Vzc0lubGluZXM6IHByb2Nlc3NJbmxpbmVzLFxuICAgICAgICBjbG9zZVVubWF0Y2hlZEJsb2NrczogY2xvc2VVbm1hdGNoZWRCbG9ja3MsXG4gICAgICAgIHBhcnNlOiBwYXJzZSxcbiAgICAgICAgb3B0aW9uczogb3B0aW9ucyB8fCB7fVxuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGFyc2VyO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvbW1vbm1hcmsvbGliL2Jsb2Nrcy5qc1xuLy8gbW9kdWxlIGlkID0gNTU3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlwidXNlIHN0cmljdFwiO1xuXG4vLyBkZXJpdmVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL21hdGhpYXNieW5lbnMvU3RyaW5nLmZyb21Db2RlUG9pbnRcbi8qISBodHRwOi8vbXRocy5iZS9mcm9tY29kZXBvaW50IHYwLjIuMSBieSBAbWF0aGlhcyAqL1xuaWYgKFN0cmluZy5mcm9tQ29kZVBvaW50KSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoXykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ29kZVBvaW50KF8pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIFJhbmdlRXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSgweEZGRkQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgIH07XG5cbn0gZWxzZSB7XG5cbiAgdmFyIHN0cmluZ0Zyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG4gIHZhciBmbG9vciA9IE1hdGguZmxvb3I7XG4gIHZhciBmcm9tQ29kZVBvaW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgTUFYX1NJWkUgPSAweDQwMDA7XG4gICAgICB2YXIgY29kZVVuaXRzID0gW107XG4gICAgICB2YXIgaGlnaFN1cnJvZ2F0ZTtcbiAgICAgIHZhciBsb3dTdXJyb2dhdGU7XG4gICAgICB2YXIgaW5kZXggPSAtMTtcbiAgICAgIHZhciBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgaWYgKCFsZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG4gICAgICB2YXIgcmVzdWx0ID0gJyc7XG4gICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgIHZhciBjb2RlUG9pbnQgPSBOdW1iZXIoYXJndW1lbnRzW2luZGV4XSk7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAhaXNGaW5pdGUoY29kZVBvaW50KSB8fCAvLyBgTmFOYCwgYCtJbmZpbml0eWAsIG9yIGAtSW5maW5pdHlgXG4gICAgICAgICAgICAgICAgICBjb2RlUG9pbnQgPCAwIHx8IC8vIG5vdCBhIHZhbGlkIFVuaWNvZGUgY29kZSBwb2ludFxuICAgICAgICAgICAgICAgICAgY29kZVBvaW50ID4gMHgxMEZGRkYgfHwgLy8gbm90IGEgdmFsaWQgVW5pY29kZSBjb2RlIHBvaW50XG4gICAgICAgICAgICAgICAgICBmbG9vcihjb2RlUG9pbnQpICE9PSBjb2RlUG9pbnQgLy8gbm90IGFuIGludGVnZXJcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoMHhGRkZEKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGNvZGVQb2ludCA8PSAweEZGRkYpIHsgLy8gQk1QIGNvZGUgcG9pbnRcbiAgICAgICAgICAgICAgY29kZVVuaXRzLnB1c2goY29kZVBvaW50KTtcbiAgICAgICAgICB9IGVsc2UgeyAvLyBBc3RyYWwgY29kZSBwb2ludDsgc3BsaXQgaW4gc3Vycm9nYXRlIGhhbHZlc1xuICAgICAgICAgICAgICAvLyBodHRwOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nI3N1cnJvZ2F0ZS1mb3JtdWxhZVxuICAgICAgICAgICAgICBjb2RlUG9pbnQgLT0gMHgxMDAwMDtcbiAgICAgICAgICAgICAgaGlnaFN1cnJvZ2F0ZSA9IChjb2RlUG9pbnQgPj4gMTApICsgMHhEODAwO1xuICAgICAgICAgICAgICBsb3dTdXJyb2dhdGUgPSAoY29kZVBvaW50ICUgMHg0MDApICsgMHhEQzAwO1xuICAgICAgICAgICAgICBjb2RlVW5pdHMucHVzaChoaWdoU3Vycm9nYXRlLCBsb3dTdXJyb2dhdGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaW5kZXggKyAxID09PSBsZW5ndGggfHwgY29kZVVuaXRzLmxlbmd0aCA+IE1BWF9TSVpFKSB7XG4gICAgICAgICAgICAgIHJlc3VsdCArPSBzdHJpbmdGcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgY29kZVVuaXRzKTtcbiAgICAgICAgICAgICAgY29kZVVuaXRzLmxlbmd0aCA9IDA7XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgbW9kdWxlLmV4cG9ydHMgPSBmcm9tQ29kZVBvaW50O1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2NvbW1vbm1hcmsvbGliL2Zyb20tY29kZS1wb2ludC5qc1xuLy8gbW9kdWxlIGlkID0gNTU4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgZXNjYXBlWG1sID0gcmVxdWlyZSgnLi9jb21tb24nKS5lc2NhcGVYbWw7XG5cbi8vIEhlbHBlciBmdW5jdGlvbiB0byBwcm9kdWNlIGFuIEhUTUwgdGFnLlxudmFyIHRhZyA9IGZ1bmN0aW9uKG5hbWUsIGF0dHJzLCBzZWxmY2xvc2luZykge1xuICAgIHZhciByZXN1bHQgPSAnPCcgKyBuYW1lO1xuICAgIGlmIChhdHRycyAmJiBhdHRycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgdmFyIGF0dHJpYjtcbiAgICAgICAgd2hpbGUgKChhdHRyaWIgPSBhdHRyc1tpXSkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmVzdWx0ICs9ICcgJyArIGF0dHJpYlswXSArICc9XCInICsgYXR0cmliWzFdICsgJ1wiJztcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoc2VsZmNsb3NpbmcpIHtcbiAgICAgICAgcmVzdWx0ICs9ICcgLyc7XG4gICAgfVxuXG4gICAgcmVzdWx0ICs9ICc+JztcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxudmFyIHJlSHRtbFRhZyA9IC9cXDxbXj5dKlxcPi87XG52YXIgcmVVbnNhZmVQcm90b2NvbCA9IC9eamF2YXNjcmlwdDp8dmJzY3JpcHQ6fGZpbGU6fGRhdGE6L2k7XG52YXIgcmVTYWZlRGF0YVByb3RvY29sID0gL15kYXRhOmltYWdlXFwvKD86cG5nfGdpZnxqcGVnfHdlYnApL2k7XG5cbnZhciBwb3RlbnRpYWxseVVuc2FmZSA9IGZ1bmN0aW9uKHVybCkge1xuICAgIHJldHVybiByZVVuc2FmZVByb3RvY29sLnRlc3QodXJsKSAmJlxuICAgICAgICAhcmVTYWZlRGF0YVByb3RvY29sLnRlc3QodXJsKTtcbn07XG5cbnZhciByZW5kZXJOb2RlcyA9IGZ1bmN0aW9uKGJsb2NrKSB7XG5cbiAgICB2YXIgYXR0cnM7XG4gICAgdmFyIGluZm9fd29yZHM7XG4gICAgdmFyIHRhZ25hbWU7XG4gICAgdmFyIHdhbGtlciA9IGJsb2NrLndhbGtlcigpO1xuICAgIHZhciBldmVudCwgbm9kZSwgZW50ZXJpbmc7XG4gICAgdmFyIGJ1ZmZlciA9IFwiXCI7XG4gICAgdmFyIGxhc3RPdXQgPSBcIlxcblwiO1xuICAgIHZhciBkaXNhYmxlVGFncyA9IDA7XG4gICAgdmFyIGdyYW5kcGFyZW50O1xuICAgIHZhciBvdXQgPSBmdW5jdGlvbihzKSB7XG4gICAgICAgIGlmIChkaXNhYmxlVGFncyA+IDApIHtcbiAgICAgICAgICAgIGJ1ZmZlciArPSBzLnJlcGxhY2UocmVIdG1sVGFnLCAnJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBidWZmZXIgKz0gcztcbiAgICAgICAgfVxuICAgICAgICBsYXN0T3V0ID0gcztcbiAgICB9O1xuICAgIHZhciBlc2MgPSB0aGlzLmVzY2FwZTtcbiAgICB2YXIgY3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGxhc3RPdXQgIT09ICdcXG4nKSB7XG4gICAgICAgICAgICBidWZmZXIgKz0gJ1xcbic7XG4gICAgICAgICAgICBsYXN0T3V0ID0gJ1xcbic7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICBpZiAob3B0aW9ucy50aW1lKSB7IGNvbnNvbGUudGltZShcInJlbmRlcmluZ1wiKTsgfVxuXG4gICAgd2hpbGUgKChldmVudCA9IHdhbGtlci5uZXh0KCkpKSB7XG4gICAgICAgIGVudGVyaW5nID0gZXZlbnQuZW50ZXJpbmc7XG4gICAgICAgIG5vZGUgPSBldmVudC5ub2RlO1xuXG4gICAgICAgIGF0dHJzID0gW107XG4gICAgICAgIGlmIChvcHRpb25zLnNvdXJjZXBvcykge1xuICAgICAgICAgICAgdmFyIHBvcyA9IG5vZGUuc291cmNlcG9zO1xuICAgICAgICAgICAgaWYgKHBvcykge1xuICAgICAgICAgICAgICAgIGF0dHJzLnB1c2goWydkYXRhLXNvdXJjZXBvcycsIFN0cmluZyhwb3NbMF1bMF0pICsgJzonICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHJpbmcocG9zWzBdWzFdKSArICctJyArIFN0cmluZyhwb3NbMV1bMF0pICsgJzonICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHJpbmcocG9zWzFdWzFdKV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoIChub2RlLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnVGV4dCc6XG4gICAgICAgICAgICBvdXQoZXNjKG5vZGUubGl0ZXJhbCwgZmFsc2UpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ1NvZnRicmVhayc6XG4gICAgICAgICAgICBvdXQodGhpcy5zb2Z0YnJlYWspO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnSGFyZGJyZWFrJzpcbiAgICAgICAgICAgIG91dCh0YWcoJ2JyJywgW10sIHRydWUpKTtcbiAgICAgICAgICAgIGNyKCk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdFbXBoJzpcbiAgICAgICAgICAgIG91dCh0YWcoZW50ZXJpbmcgPyAnZW0nIDogJy9lbScpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ1N0cm9uZyc6XG4gICAgICAgICAgICBvdXQodGFnKGVudGVyaW5nID8gJ3N0cm9uZycgOiAnL3N0cm9uZycpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ0h0bWxJbmxpbmUnOlxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuc2FmZSkge1xuICAgICAgICAgICAgICAgIG91dCgnPCEtLSByYXcgSFRNTCBvbWl0dGVkIC0tPicpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvdXQobm9kZS5saXRlcmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ0N1c3RvbUlubGluZSc6XG4gICAgICAgICAgICBpZiAoZW50ZXJpbmcgJiYgbm9kZS5vbkVudGVyKSB7XG4gICAgICAgICAgICAgICAgb3V0KG5vZGUub25FbnRlcik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFlbnRlcmluZyAmJiBub2RlLm9uRXhpdCkge1xuICAgICAgICAgICAgICAgIG91dChub2RlLm9uRXhpdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdMaW5rJzpcbiAgICAgICAgICAgIGlmIChlbnRlcmluZykge1xuICAgICAgICAgICAgICAgIGlmICghKG9wdGlvbnMuc2FmZSAmJiBwb3RlbnRpYWxseVVuc2FmZShub2RlLmRlc3RpbmF0aW9uKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0cnMucHVzaChbJ2hyZWYnLCBlc2Mobm9kZS5kZXN0aW5hdGlvbiwgdHJ1ZSldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUudGl0bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0cnMucHVzaChbJ3RpdGxlJywgZXNjKG5vZGUudGl0bGUsIHRydWUpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG91dCh0YWcoJ2EnLCBhdHRycykpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvdXQodGFnKCcvYScpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ0ltYWdlJzpcbiAgICAgICAgICAgIGlmIChlbnRlcmluZykge1xuICAgICAgICAgICAgICAgIGlmIChkaXNhYmxlVGFncyA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5zYWZlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgcG90ZW50aWFsbHlVbnNhZmUobm9kZS5kZXN0aW5hdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dCgnPGltZyBzcmM9XCJcIiBhbHQ9XCInKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dCgnPGltZyBzcmM9XCInICsgZXNjKG5vZGUuZGVzdGluYXRpb24sIHRydWUpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnXCIgYWx0PVwiJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGlzYWJsZVRhZ3MgKz0gMTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGlzYWJsZVRhZ3MgLT0gMTtcbiAgICAgICAgICAgICAgICBpZiAoZGlzYWJsZVRhZ3MgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUudGl0bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dCgnXCIgdGl0bGU9XCInICsgZXNjKG5vZGUudGl0bGUsIHRydWUpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvdXQoJ1wiIC8+Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnQ29kZSc6XG4gICAgICAgICAgICBvdXQodGFnKCdjb2RlJykgKyBlc2Mobm9kZS5saXRlcmFsLCBmYWxzZSkgKyB0YWcoJy9jb2RlJykpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnRG9jdW1lbnQnOlxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnUGFyYWdyYXBoJzpcbiAgICAgICAgICAgIGdyYW5kcGFyZW50ID0gbm9kZS5wYXJlbnQucGFyZW50O1xuICAgICAgICAgICAgaWYgKGdyYW5kcGFyZW50ICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgZ3JhbmRwYXJlbnQudHlwZSA9PT0gJ0xpc3QnKSB7XG4gICAgICAgICAgICAgICAgaWYgKGdyYW5kcGFyZW50Lmxpc3RUaWdodCkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZW50ZXJpbmcpIHtcbiAgICAgICAgICAgICAgICBjcigpO1xuICAgICAgICAgICAgICAgIG91dCh0YWcoJ3AnLCBhdHRycykpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvdXQodGFnKCcvcCcpKTtcbiAgICAgICAgICAgICAgICBjcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnQmxvY2tRdW90ZSc6XG4gICAgICAgICAgICBpZiAoZW50ZXJpbmcpIHtcbiAgICAgICAgICAgICAgICBjcigpO1xuICAgICAgICAgICAgICAgIG91dCh0YWcoJ2Jsb2NrcXVvdGUnLCBhdHRycykpO1xuICAgICAgICAgICAgICAgIGNyKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNyKCk7XG4gICAgICAgICAgICAgICAgb3V0KHRhZygnL2Jsb2NrcXVvdGUnKSk7XG4gICAgICAgICAgICAgICAgY3IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ0l0ZW0nOlxuICAgICAgICAgICAgaWYgKGVudGVyaW5nKSB7XG4gICAgICAgICAgICAgICAgb3V0KHRhZygnbGknLCBhdHRycykpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvdXQodGFnKCcvbGknKSk7XG4gICAgICAgICAgICAgICAgY3IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ0xpc3QnOlxuICAgICAgICAgICAgdGFnbmFtZSA9IG5vZGUubGlzdFR5cGUgPT09ICdCdWxsZXQnID8gJ3VsJyA6ICdvbCc7XG4gICAgICAgICAgICBpZiAoZW50ZXJpbmcpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnQgPSBub2RlLmxpc3RTdGFydDtcbiAgICAgICAgICAgICAgICBpZiAoc3RhcnQgIT09IG51bGwgJiYgc3RhcnQgIT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0cnMucHVzaChbJ3N0YXJ0Jywgc3RhcnQudG9TdHJpbmcoKV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjcigpO1xuICAgICAgICAgICAgICAgIG91dCh0YWcodGFnbmFtZSwgYXR0cnMpKTtcbiAgICAgICAgICAgICAgICBjcigpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjcigpO1xuICAgICAgICAgICAgICAgIG91dCh0YWcoJy8nICsgdGFnbmFtZSkpO1xuICAgICAgICAgICAgICAgIGNyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdIZWFkaW5nJzpcbiAgICAgICAgICAgIHRhZ25hbWUgPSAnaCcgKyBub2RlLmxldmVsO1xuICAgICAgICAgICAgaWYgKGVudGVyaW5nKSB7XG4gICAgICAgICAgICAgICAgY3IoKTtcbiAgICAgICAgICAgICAgICBvdXQodGFnKHRhZ25hbWUsIGF0dHJzKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG91dCh0YWcoJy8nICsgdGFnbmFtZSkpO1xuICAgICAgICAgICAgICAgIGNyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdDb2RlQmxvY2snOlxuICAgICAgICAgICAgaW5mb193b3JkcyA9IG5vZGUuaW5mbyA/IG5vZGUuaW5mby5zcGxpdCgvXFxzKy8pIDogW107XG4gICAgICAgICAgICBpZiAoaW5mb193b3Jkcy5sZW5ndGggPiAwICYmIGluZm9fd29yZHNbMF0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGF0dHJzLnB1c2goWydjbGFzcycsICdsYW5ndWFnZS0nICsgZXNjKGluZm9fd29yZHNbMF0sIHRydWUpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjcigpO1xuICAgICAgICAgICAgb3V0KHRhZygncHJlJykgKyB0YWcoJ2NvZGUnLCBhdHRycykpO1xuICAgICAgICAgICAgb3V0KGVzYyhub2RlLmxpdGVyYWwsIGZhbHNlKSk7XG4gICAgICAgICAgICBvdXQodGFnKCcvY29kZScpICsgdGFnKCcvcHJlJykpO1xuICAgICAgICAgICAgY3IoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ0h0bWxCbG9jayc6XG4gICAgICAgICAgICBjcigpO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuc2FmZSkge1xuICAgICAgICAgICAgICAgIG91dCgnPCEtLSByYXcgSFRNTCBvbWl0dGVkIC0tPicpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvdXQobm9kZS5saXRlcmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNyKCk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdDdXN0b21CbG9jayc6XG4gICAgICAgICAgICBjcigpO1xuICAgICAgICAgICAgaWYgKGVudGVyaW5nICYmIG5vZGUub25FbnRlcikge1xuICAgICAgICAgICAgICAgIG91dChub2RlLm9uRW50ZXIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghZW50ZXJpbmcgJiYgbm9kZS5vbkV4aXQpIHtcbiAgICAgICAgICAgICAgICBvdXQobm9kZS5vbkV4aXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3IoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ1RoZW1hdGljQnJlYWsnOlxuICAgICAgICAgICAgY3IoKTtcbiAgICAgICAgICAgIG91dCh0YWcoJ2hyJywgYXR0cnMsIHRydWUpKTtcbiAgICAgICAgICAgIGNyKCk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgXCJVbmtub3duIG5vZGUgdHlwZSBcIiArIG5vZGUudHlwZTtcbiAgICAgICAgfVxuXG4gICAgfVxuICAgIGlmIChvcHRpb25zLnRpbWUpIHsgY29uc29sZS50aW1lRW5kKFwicmVuZGVyaW5nXCIpOyB9XG4gICAgcmV0dXJuIGJ1ZmZlcjtcbn07XG5cbi8vIFRoZSBIdG1sUmVuZGVyZXIgb2JqZWN0LlxuZnVuY3Rpb24gSHRtbFJlbmRlcmVyKG9wdGlvbnMpe1xuICAgIHJldHVybiB7XG4gICAgICAgIC8vIGRlZmF1bHQgb3B0aW9uczpcbiAgICAgICAgc29mdGJyZWFrOiAnXFxuJywgLy8gYnkgZGVmYXVsdCwgc29mdCBicmVha3MgYXJlIHJlbmRlcmVkIGFzIG5ld2xpbmVzIGluIEhUTUxcbiAgICAgICAgLy8gc2V0IHRvIFwiPGJyIC8+XCIgdG8gbWFrZSB0aGVtIGhhcmQgYnJlYWtzXG4gICAgICAgIC8vIHNldCB0byBcIiBcIiBpZiB5b3Ugd2FudCB0byBpZ25vcmUgbGluZSB3cmFwcGluZyBpbiBzb3VyY2VcbiAgICAgICAgZXNjYXBlOiBlc2NhcGVYbWwsXG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnMgfHwge30sXG4gICAgICAgIHJlbmRlcjogcmVuZGVyTm9kZXNcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEh0bWxSZW5kZXJlcjtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9jb21tb25tYXJrL2xpYi9odG1sLmpzXG4vLyBtb2R1bGUgaWQgPSA1NTlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vIGNvbW1vbm1hcmsuanMgLSBDb21tb21NYXJrIGluIEphdmFTY3JpcHRcbi8vIENvcHlyaWdodCAoQykgMjAxNCBKb2huIE1hY0ZhcmxhbmVcbi8vIExpY2Vuc2U6IEJTRDMuXG5cbi8vIEJhc2ljIHVzYWdlOlxuLy9cbi8vIHZhciBjb21tb25tYXJrID0gcmVxdWlyZSgnY29tbW9ubWFyaycpO1xuLy8gdmFyIHBhcnNlciA9IG5ldyBjb21tb25tYXJrLlBhcnNlcigpO1xuLy8gdmFyIHJlbmRlcmVyID0gbmV3IGNvbW1vbm1hcmsuSHRtbFJlbmRlcmVyKCk7XG4vLyBjb25zb2xlLmxvZyhyZW5kZXJlci5yZW5kZXIocGFyc2VyLnBhcnNlKCdIZWxsbyAqd29ybGQqJykpKTtcblxubW9kdWxlLmV4cG9ydHMudmVyc2lvbiA9ICcwLjI0LjAnXG5tb2R1bGUuZXhwb3J0cy5Ob2RlID0gcmVxdWlyZSgnLi9ub2RlJyk7XG5tb2R1bGUuZXhwb3J0cy5QYXJzZXIgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xubW9kdWxlLmV4cG9ydHMuSHRtbFJlbmRlcmVyID0gcmVxdWlyZSgnLi9odG1sJyk7XG5tb2R1bGUuZXhwb3J0cy5YbWxSZW5kZXJlciA9IHJlcXVpcmUoJy4veG1sJyk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29tbW9ubWFyay9saWIvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDU2MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIE5vZGUgPSByZXF1aXJlKCcuL25vZGUnKTtcbnZhciBjb21tb24gPSByZXF1aXJlKCcuL2NvbW1vbicpO1xudmFyIG5vcm1hbGl6ZVJlZmVyZW5jZSA9IHJlcXVpcmUoJy4vbm9ybWFsaXplLXJlZmVyZW5jZScpO1xuXG52YXIgbm9ybWFsaXplVVJJID0gY29tbW9uLm5vcm1hbGl6ZVVSSTtcbnZhciB1bmVzY2FwZVN0cmluZyA9IGNvbW1vbi51bmVzY2FwZVN0cmluZztcbnZhciBmcm9tQ29kZVBvaW50ID0gcmVxdWlyZSgnLi9mcm9tLWNvZGUtcG9pbnQuanMnKTtcbnZhciBkZWNvZGVIVE1MID0gcmVxdWlyZSgnZW50aXRpZXMnKS5kZWNvZGVIVE1MO1xucmVxdWlyZSgnc3RyaW5nLnByb3RvdHlwZS5yZXBlYXQnKTsgLy8gUG9seWZpbGwgZm9yIFN0cmluZy5wcm90b3R5cGUucmVwZWF0XG5cbi8vIENvbnN0YW50cyBmb3IgY2hhcmFjdGVyIGNvZGVzOlxuXG52YXIgQ19ORVdMSU5FID0gMTA7XG52YXIgQ19BU1RFUklTSyA9IDQyO1xudmFyIENfVU5ERVJTQ09SRSA9IDk1O1xudmFyIENfQkFDS1RJQ0sgPSA5NjtcbnZhciBDX09QRU5fQlJBQ0tFVCA9IDkxO1xudmFyIENfQ0xPU0VfQlJBQ0tFVCA9IDkzO1xudmFyIENfTEVTU1RIQU4gPSA2MDtcbnZhciBDX0JBTkcgPSAzMztcbnZhciBDX0JBQ0tTTEFTSCA9IDkyO1xudmFyIENfQU1QRVJTQU5EID0gMzg7XG52YXIgQ19PUEVOX1BBUkVOID0gNDA7XG52YXIgQ19DTE9TRV9QQVJFTiA9IDQxO1xudmFyIENfQ09MT04gPSA1ODtcbnZhciBDX1NJTkdMRVFVT1RFID0gMzk7XG52YXIgQ19ET1VCTEVRVU9URSA9IDM0O1xuXG4vLyBTb21lIHJlZ2V4cHMgdXNlZCBpbiBpbmxpbmUgcGFyc2VyOlxuXG52YXIgRVNDQVBBQkxFID0gY29tbW9uLkVTQ0FQQUJMRTtcbnZhciBFU0NBUEVEX0NIQVIgPSAnXFxcXFxcXFwnICsgRVNDQVBBQkxFO1xudmFyIFJFR19DSEFSID0gJ1teXFxcXFxcXFwoKVxcXFx4MDAtXFxcXHgyMF0nO1xudmFyIElOX1BBUkVOU19OT1NQID0gJ1xcXFwoKCcgKyBSRUdfQ0hBUiArICd8JyArIEVTQ0FQRURfQ0hBUiArICd8XFxcXFxcXFwpKlxcXFwpJztcblxudmFyIEVOVElUWSA9IGNvbW1vbi5FTlRJVFk7XG52YXIgcmVIdG1sVGFnID0gY29tbW9uLnJlSHRtbFRhZztcblxudmFyIHJlUHVuY3R1YXRpb24gPSBuZXcgUmVnRXhwKC9eW1xcdTIwMDAtXFx1MjA2RlxcdTJFMDAtXFx1MkU3RlxcXFwnIVwiI1xcJCUmXFwoXFwpXFwqXFwrLFxcLVxcLlxcLzo7PD0+XFw/QFxcW1xcXVxcXl9gXFx7XFx8XFx9fl0vKTtcblxudmFyIHJlTGlua1RpdGxlID0gbmV3IFJlZ0V4cChcbiAgICAnXig/OlwiKCcgKyBFU0NBUEVEX0NIQVIgKyAnfFteXCJcXFxceDAwXSkqXCInICtcbiAgICAgICAgJ3wnICtcbiAgICAgICAgJ1xcJygnICsgRVNDQVBFRF9DSEFSICsgJ3xbXlxcJ1xcXFx4MDBdKSpcXCcnICtcbiAgICAgICAgJ3wnICtcbiAgICAgICAgJ1xcXFwoKCcgKyBFU0NBUEVEX0NIQVIgKyAnfFteKVxcXFx4MDBdKSpcXFxcKSknKTtcblxudmFyIHJlTGlua0Rlc3RpbmF0aW9uQnJhY2VzID0gbmV3IFJlZ0V4cChcbiAgICAnXig/Ols8XSg/OlteIDw+XFxcXHRcXFxcblxcXFxcXFxcXFxcXHgwMF0nICsgJ3wnICsgRVNDQVBFRF9DSEFSICsgJ3wnICsgJ1xcXFxcXFxcKSpbPl0pJyk7XG5cbnZhciByZUxpbmtEZXN0aW5hdGlvbiA9IG5ldyBSZWdFeHAoXG4gICAgJ14oPzonICsgUkVHX0NIQVIgKyAnK3wnICsgRVNDQVBFRF9DSEFSICsgJ3xcXFxcXFxcXHwnICsgSU5fUEFSRU5TX05PU1AgKyAnKSonKTtcblxudmFyIHJlRXNjYXBhYmxlID0gbmV3IFJlZ0V4cCgnXicgKyBFU0NBUEFCTEUpO1xuXG52YXIgcmVFbnRpdHlIZXJlID0gbmV3IFJlZ0V4cCgnXicgKyBFTlRJVFksICdpJyk7XG5cbnZhciByZVRpY2tzID0gL2ArLztcblxudmFyIHJlVGlja3NIZXJlID0gL15gKy87XG5cbnZhciByZUVsbGlwc2VzID0gL1xcLlxcLlxcLi9nO1xuXG52YXIgcmVEYXNoID0gLy0tKy9nO1xuXG52YXIgcmVFbWFpbEF1dG9saW5rID0gL148KFthLXpBLVowLTkuISMkJSYnKitcXC89P15fYHt8fX4tXStAW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KD86XFwuW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KSopPi87XG5cbnZhciByZUF1dG9saW5rID0gL148W0EtWmEtel1bQS1aYS16MC05ListXXsxLDMxfTpbXjw+XFx4MDAtXFx4MjBdKj4vaTtcblxudmFyIHJlU3BubCA9IC9eICooPzpcXG4gKik/LztcblxudmFyIHJlV2hpdGVzcGFjZUNoYXIgPSAvXlxccy87XG5cbnZhciByZVdoaXRlc3BhY2UgPSAvXFxzKy9nO1xuXG52YXIgcmVGaW5hbFNwYWNlID0gLyAqJC87XG5cbnZhciByZUluaXRpYWxTcGFjZSA9IC9eICovO1xuXG52YXIgcmVTcGFjZUF0RW5kT2ZMaW5lID0gL14gKig/OlxcbnwkKS87XG5cbnZhciByZUxpbmtMYWJlbCA9IG5ldyBSZWdFeHAoJ15cXFxcWyg/OlteXFxcXFxcXFxcXFxcW1xcXFxdXXwnICsgRVNDQVBFRF9DSEFSICtcbiAgJ3xcXFxcXFxcXCl7MCwxMDAwfVxcXFxdJyk7XG5cbi8vIE1hdGNoZXMgYSBzdHJpbmcgb2Ygbm9uLXNwZWNpYWwgY2hhcmFjdGVycy5cbnZhciByZU1haW4gPSAvXlteXFxuYFxcW1xcXVxcXFwhPCYqXydcIl0rL207XG5cbnZhciB0ZXh0ID0gZnVuY3Rpb24ocykge1xuICAgIHZhciBub2RlID0gbmV3IE5vZGUoJ1RleHQnKTtcbiAgICBub2RlLl9saXRlcmFsID0gcztcbiAgICByZXR1cm4gbm9kZTtcbn07XG5cbi8vIElOTElORSBQQVJTRVJcblxuLy8gVGhlc2UgYXJlIG1ldGhvZHMgb2YgYW4gSW5saW5lUGFyc2VyIG9iamVjdCwgZGVmaW5lZCBiZWxvdy5cbi8vIEFuIElubGluZVBhcnNlciBrZWVwcyB0cmFjayBvZiBhIHN1YmplY3QgKGEgc3RyaW5nIHRvIGJlXG4vLyBwYXJzZWQpIGFuZCBhIHBvc2l0aW9uIGluIHRoYXQgc3ViamVjdC5cblxuLy8gSWYgcmUgbWF0Y2hlcyBhdCBjdXJyZW50IHBvc2l0aW9uIGluIHRoZSBzdWJqZWN0LCBhZHZhbmNlXG4vLyBwb3NpdGlvbiBpbiBzdWJqZWN0IGFuZCByZXR1cm4gdGhlIG1hdGNoOyBvdGhlcndpc2UgcmV0dXJuIG51bGwuXG52YXIgbWF0Y2ggPSBmdW5jdGlvbihyZSkge1xuICAgIHZhciBtID0gcmUuZXhlYyh0aGlzLnN1YmplY3Quc2xpY2UodGhpcy5wb3MpKTtcbiAgICBpZiAobSA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBvcyArPSBtLmluZGV4ICsgbVswXS5sZW5ndGg7XG4gICAgICAgIHJldHVybiBtWzBdO1xuICAgIH1cbn07XG5cbi8vIFJldHVybnMgdGhlIGNvZGUgZm9yIHRoZSBjaGFyYWN0ZXIgYXQgdGhlIGN1cnJlbnQgc3ViamVjdCBwb3NpdGlvbiwgb3IgLTFcbi8vIHRoZXJlIGFyZSBubyBtb3JlIGNoYXJhY3RlcnMuXG52YXIgcGVlayA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnBvcyA8IHRoaXMuc3ViamVjdC5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3ViamVjdC5jaGFyQ29kZUF0KHRoaXMucG9zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgfVxufTtcblxuLy8gUGFyc2UgemVybyBvciBtb3JlIHNwYWNlIGNoYXJhY3RlcnMsIGluY2x1ZGluZyBhdCBtb3N0IG9uZSBuZXdsaW5lXG52YXIgc3BubCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubWF0Y2gocmVTcG5sKTtcbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8vIEFsbCBvZiB0aGUgcGFyc2VycyBiZWxvdyB0cnkgdG8gbWF0Y2ggc29tZXRoaW5nIGF0IHRoZSBjdXJyZW50IHBvc2l0aW9uXG4vLyBpbiB0aGUgc3ViamVjdC4gIElmIHRoZXkgc3VjY2VlZCBpbiBtYXRjaGluZyBhbnl0aGluZywgdGhleVxuLy8gcmV0dXJuIHRoZSBpbmxpbmUgbWF0Y2hlZCwgYWR2YW5jaW5nIHRoZSBzdWJqZWN0LlxuXG4vLyBBdHRlbXB0IHRvIHBhcnNlIGJhY2t0aWNrcywgYWRkaW5nIGVpdGhlciBhIGJhY2t0aWNrIGNvZGUgc3BhbiBvciBhXG4vLyBsaXRlcmFsIHNlcXVlbmNlIG9mIGJhY2t0aWNrcy5cbnZhciBwYXJzZUJhY2t0aWNrcyA9IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgdmFyIHRpY2tzID0gdGhpcy5tYXRjaChyZVRpY2tzSGVyZSk7XG4gICAgaWYgKHRpY2tzID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIGFmdGVyT3BlblRpY2tzID0gdGhpcy5wb3M7XG4gICAgdmFyIG1hdGNoZWQ7XG4gICAgdmFyIG5vZGU7XG4gICAgd2hpbGUgKChtYXRjaGVkID0gdGhpcy5tYXRjaChyZVRpY2tzKSkgIT09IG51bGwpIHtcbiAgICAgICAgaWYgKG1hdGNoZWQgPT09IHRpY2tzKSB7XG4gICAgICAgICAgICBub2RlID0gbmV3IE5vZGUoJ0NvZGUnKTtcbiAgICAgICAgICAgIG5vZGUuX2xpdGVyYWwgPSB0aGlzLnN1YmplY3Quc2xpY2UoYWZ0ZXJPcGVuVGlja3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3MgLSB0aWNrcy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC50cmltKCkucmVwbGFjZShyZVdoaXRlc3BhY2UsICcgJyk7XG4gICAgICAgICAgICBibG9jay5hcHBlbmRDaGlsZChub2RlKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIElmIHdlIGdvdCBoZXJlLCB3ZSBkaWRuJ3QgbWF0Y2ggYSBjbG9zaW5nIGJhY2t0aWNrIHNlcXVlbmNlLlxuICAgIHRoaXMucG9zID0gYWZ0ZXJPcGVuVGlja3M7XG4gICAgYmxvY2suYXBwZW5kQ2hpbGQodGV4dCh0aWNrcykpO1xuICAgIHJldHVybiB0cnVlO1xufTtcblxuLy8gUGFyc2UgYSBiYWNrc2xhc2gtZXNjYXBlZCBzcGVjaWFsIGNoYXJhY3RlciwgYWRkaW5nIGVpdGhlciB0aGUgZXNjYXBlZFxuLy8gY2hhcmFjdGVyLCBhIGhhcmQgbGluZSBicmVhayAoaWYgdGhlIGJhY2tzbGFzaCBpcyBmb2xsb3dlZCBieSBhIG5ld2xpbmUpLFxuLy8gb3IgYSBsaXRlcmFsIGJhY2tzbGFzaCB0byB0aGUgYmxvY2sncyBjaGlsZHJlbi4gIEFzc3VtZXMgY3VycmVudCBjaGFyYWN0ZXJcbi8vIGlzIGEgYmFja3NsYXNoLlxudmFyIHBhcnNlQmFja3NsYXNoID0gZnVuY3Rpb24oYmxvY2spIHtcbiAgICB2YXIgc3ViaiA9IHRoaXMuc3ViamVjdDtcbiAgICB2YXIgbm9kZTtcbiAgICB0aGlzLnBvcyArPSAxO1xuICAgIGlmICh0aGlzLnBlZWsoKSA9PT0gQ19ORVdMSU5FKSB7XG4gICAgICAgIHRoaXMucG9zICs9IDE7XG4gICAgICAgIG5vZGUgPSBuZXcgTm9kZSgnSGFyZGJyZWFrJyk7XG4gICAgICAgIGJsb2NrLmFwcGVuZENoaWxkKG5vZGUpO1xuICAgIH0gZWxzZSBpZiAocmVFc2NhcGFibGUudGVzdChzdWJqLmNoYXJBdCh0aGlzLnBvcykpKSB7XG4gICAgICAgIGJsb2NrLmFwcGVuZENoaWxkKHRleHQoc3Viai5jaGFyQXQodGhpcy5wb3MpKSk7XG4gICAgICAgIHRoaXMucG9zICs9IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYmxvY2suYXBwZW5kQ2hpbGQodGV4dCgnXFxcXCcpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG4vLyBBdHRlbXB0IHRvIHBhcnNlIGFuIGF1dG9saW5rIChVUkwgb3IgZW1haWwgaW4gcG9pbnR5IGJyYWNrZXRzKS5cbnZhciBwYXJzZUF1dG9saW5rID0gZnVuY3Rpb24oYmxvY2spIHtcbiAgICB2YXIgbTtcbiAgICB2YXIgZGVzdDtcbiAgICB2YXIgbm9kZTtcbiAgICBpZiAoKG0gPSB0aGlzLm1hdGNoKHJlRW1haWxBdXRvbGluaykpKSB7XG4gICAgICAgIGRlc3QgPSBtLnNsaWNlKDEsIG0ubGVuZ3RoIC0gMSk7XG4gICAgICAgIG5vZGUgPSBuZXcgTm9kZSgnTGluaycpO1xuICAgICAgICBub2RlLl9kZXN0aW5hdGlvbiA9IG5vcm1hbGl6ZVVSSSgnbWFpbHRvOicgKyBkZXN0KTtcbiAgICAgICAgbm9kZS5fdGl0bGUgPSAnJztcbiAgICAgICAgbm9kZS5hcHBlbmRDaGlsZCh0ZXh0KGRlc3QpKTtcbiAgICAgICAgYmxvY2suYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAoKG0gPSB0aGlzLm1hdGNoKHJlQXV0b2xpbmspKSkge1xuICAgICAgICBkZXN0ID0gbS5zbGljZSgxLCBtLmxlbmd0aCAtIDEpO1xuICAgICAgICBub2RlID0gbmV3IE5vZGUoJ0xpbmsnKTtcbiAgICAgICAgbm9kZS5fZGVzdGluYXRpb24gPSBub3JtYWxpemVVUkkoZGVzdCk7XG4gICAgICAgIG5vZGUuX3RpdGxlID0gJyc7XG4gICAgICAgIG5vZGUuYXBwZW5kQ2hpbGQodGV4dChkZXN0KSk7XG4gICAgICAgIGJsb2NrLmFwcGVuZENoaWxkKG5vZGUpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufTtcblxuLy8gQXR0ZW1wdCB0byBwYXJzZSBhIHJhdyBIVE1MIHRhZy5cbnZhciBwYXJzZUh0bWxUYWcgPSBmdW5jdGlvbihibG9jaykge1xuICAgIHZhciBtID0gdGhpcy5tYXRjaChyZUh0bWxUYWcpO1xuICAgIGlmIChtID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbm9kZSA9IG5ldyBOb2RlKCdIdG1sSW5saW5lJyk7XG4gICAgICAgIG5vZGUuX2xpdGVyYWwgPSBtO1xuICAgICAgICBibG9jay5hcHBlbmRDaGlsZChub2RlKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufTtcblxuLy8gU2NhbiBhIHNlcXVlbmNlIG9mIGNoYXJhY3RlcnMgd2l0aCBjb2RlIGNjLCBhbmQgcmV0dXJuIGluZm9ybWF0aW9uIGFib3V0XG4vLyB0aGUgbnVtYmVyIG9mIGRlbGltaXRlcnMgYW5kIHdoZXRoZXIgdGhleSBhcmUgcG9zaXRpb25lZCBzdWNoIHRoYXRcbi8vIHRoZXkgY2FuIG9wZW4gYW5kL29yIGNsb3NlIGVtcGhhc2lzIG9yIHN0cm9uZyBlbXBoYXNpcy4gIEEgdXRpbGl0eVxuLy8gZnVuY3Rpb24gZm9yIHN0cm9uZy9lbXBoIHBhcnNpbmcuXG52YXIgc2NhbkRlbGltcyA9IGZ1bmN0aW9uKGNjKSB7XG4gICAgdmFyIG51bWRlbGltcyA9IDA7XG4gICAgdmFyIGNoYXJfYmVmb3JlLCBjaGFyX2FmdGVyLCBjY19hZnRlcjtcbiAgICB2YXIgc3RhcnRwb3MgPSB0aGlzLnBvcztcbiAgICB2YXIgbGVmdF9mbGFua2luZywgcmlnaHRfZmxhbmtpbmcsIGNhbl9vcGVuLCBjYW5fY2xvc2U7XG4gICAgdmFyIGFmdGVyX2lzX3doaXRlc3BhY2UsIGFmdGVyX2lzX3B1bmN0dWF0aW9uLCBiZWZvcmVfaXNfd2hpdGVzcGFjZSwgYmVmb3JlX2lzX3B1bmN0dWF0aW9uO1xuXG4gICAgaWYgKGNjID09PSBDX1NJTkdMRVFVT1RFIHx8IGNjID09PSBDX0RPVUJMRVFVT1RFKSB7XG4gICAgICAgIG51bWRlbGltcysrO1xuICAgICAgICB0aGlzLnBvcysrO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHdoaWxlICh0aGlzLnBlZWsoKSA9PT0gY2MpIHtcbiAgICAgICAgICAgIG51bWRlbGltcysrO1xuICAgICAgICAgICAgdGhpcy5wb3MrKztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChudW1kZWxpbXMgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY2hhcl9iZWZvcmUgPSBzdGFydHBvcyA9PT0gMCA/ICdcXG4nIDogdGhpcy5zdWJqZWN0LmNoYXJBdChzdGFydHBvcyAtIDEpO1xuXG4gICAgY2NfYWZ0ZXIgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAoY2NfYWZ0ZXIgPT09IC0xKSB7XG4gICAgICAgIGNoYXJfYWZ0ZXIgPSAnXFxuJztcbiAgICB9IGVsc2Uge1xuICAgICAgICBjaGFyX2FmdGVyID0gZnJvbUNvZGVQb2ludChjY19hZnRlcik7XG4gICAgfVxuXG4gICAgYWZ0ZXJfaXNfd2hpdGVzcGFjZSA9IHJlV2hpdGVzcGFjZUNoYXIudGVzdChjaGFyX2FmdGVyKTtcbiAgICBhZnRlcl9pc19wdW5jdHVhdGlvbiA9IHJlUHVuY3R1YXRpb24udGVzdChjaGFyX2FmdGVyKTtcbiAgICBiZWZvcmVfaXNfd2hpdGVzcGFjZSA9IHJlV2hpdGVzcGFjZUNoYXIudGVzdChjaGFyX2JlZm9yZSk7XG4gICAgYmVmb3JlX2lzX3B1bmN0dWF0aW9uID0gcmVQdW5jdHVhdGlvbi50ZXN0KGNoYXJfYmVmb3JlKTtcblxuICAgIGxlZnRfZmxhbmtpbmcgPSAhYWZ0ZXJfaXNfd2hpdGVzcGFjZSAmJlxuICAgICAgICAgICAgIShhZnRlcl9pc19wdW5jdHVhdGlvbiAmJiAhYmVmb3JlX2lzX3doaXRlc3BhY2UgJiYgIWJlZm9yZV9pc19wdW5jdHVhdGlvbik7XG4gICAgcmlnaHRfZmxhbmtpbmcgPSAhYmVmb3JlX2lzX3doaXRlc3BhY2UgJiZcbiAgICAgICAgICAgICEoYmVmb3JlX2lzX3B1bmN0dWF0aW9uICYmICFhZnRlcl9pc193aGl0ZXNwYWNlICYmICFhZnRlcl9pc19wdW5jdHVhdGlvbik7XG4gICAgaWYgKGNjID09PSBDX1VOREVSU0NPUkUpIHtcbiAgICAgICAgY2FuX29wZW4gPSBsZWZ0X2ZsYW5raW5nICYmXG4gICAgICAgICAgICAoIXJpZ2h0X2ZsYW5raW5nIHx8IGJlZm9yZV9pc19wdW5jdHVhdGlvbik7XG4gICAgICAgIGNhbl9jbG9zZSA9IHJpZ2h0X2ZsYW5raW5nICYmXG4gICAgICAgICAgICAoIWxlZnRfZmxhbmtpbmcgfHwgYWZ0ZXJfaXNfcHVuY3R1YXRpb24pO1xuICAgIH0gZWxzZSBpZiAoY2MgPT09IENfU0lOR0xFUVVPVEUgfHwgY2MgPT09IENfRE9VQkxFUVVPVEUpIHtcbiAgICAgICAgY2FuX29wZW4gPSBsZWZ0X2ZsYW5raW5nICYmICFyaWdodF9mbGFua2luZztcbiAgICAgICAgY2FuX2Nsb3NlID0gcmlnaHRfZmxhbmtpbmc7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY2FuX29wZW4gPSBsZWZ0X2ZsYW5raW5nO1xuICAgICAgICBjYW5fY2xvc2UgPSByaWdodF9mbGFua2luZztcbiAgICB9XG4gICAgdGhpcy5wb3MgPSBzdGFydHBvcztcbiAgICByZXR1cm4geyBudW1kZWxpbXM6IG51bWRlbGltcyxcbiAgICAgICAgICAgICBjYW5fb3BlbjogY2FuX29wZW4sXG4gICAgICAgICAgICAgY2FuX2Nsb3NlOiBjYW5fY2xvc2UgfTtcbn07XG5cbi8vIEhhbmRsZSBhIGRlbGltaXRlciBtYXJrZXIgZm9yIGVtcGhhc2lzIG9yIGEgcXVvdGUuXG52YXIgaGFuZGxlRGVsaW0gPSBmdW5jdGlvbihjYywgYmxvY2spIHtcbiAgICB2YXIgcmVzID0gdGhpcy5zY2FuRGVsaW1zKGNjKTtcbiAgICBpZiAoIXJlcykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciBudW1kZWxpbXMgPSByZXMubnVtZGVsaW1zO1xuICAgIHZhciBzdGFydHBvcyA9IHRoaXMucG9zO1xuICAgIHZhciBjb250ZW50cztcblxuICAgIHRoaXMucG9zICs9IG51bWRlbGltcztcbiAgICBpZiAoY2MgPT09IENfU0lOR0xFUVVPVEUpIHtcbiAgICAgICAgY29udGVudHMgPSBcIlxcdTIwMTlcIjtcbiAgICB9IGVsc2UgaWYgKGNjID09PSBDX0RPVUJMRVFVT1RFKSB7XG4gICAgICAgIGNvbnRlbnRzID0gXCJcXHUyMDFDXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29udGVudHMgPSB0aGlzLnN1YmplY3Quc2xpY2Uoc3RhcnRwb3MsIHRoaXMucG9zKTtcbiAgICB9XG4gICAgdmFyIG5vZGUgPSB0ZXh0KGNvbnRlbnRzKTtcbiAgICBibG9jay5hcHBlbmRDaGlsZChub2RlKTtcblxuICAgIC8vIEFkZCBlbnRyeSB0byBzdGFjayBmb3IgdGhpcyBvcGVuZXJcbiAgICB0aGlzLmRlbGltaXRlcnMgPSB7IGNjOiBjYyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bWRlbGltczogbnVtZGVsaW1zLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZTogbm9kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzOiB0aGlzLmRlbGltaXRlcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0OiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FuX29wZW46IHJlcy5jYW5fb3BlbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbl9jbG9zZTogcmVzLmNhbl9jbG9zZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZSB9O1xuICAgIGlmICh0aGlzLmRlbGltaXRlcnMucHJldmlvdXMgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5kZWxpbWl0ZXJzLnByZXZpb3VzLm5leHQgPSB0aGlzLmRlbGltaXRlcnM7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG5cbn07XG5cbnZhciByZW1vdmVEZWxpbWl0ZXIgPSBmdW5jdGlvbihkZWxpbSkge1xuICAgIGlmIChkZWxpbS5wcmV2aW91cyAhPT0gbnVsbCkge1xuICAgICAgICBkZWxpbS5wcmV2aW91cy5uZXh0ID0gZGVsaW0ubmV4dDtcbiAgICB9XG4gICAgaWYgKGRlbGltLm5leHQgPT09IG51bGwpIHtcbiAgICAgICAgLy8gdG9wIG9mIHN0YWNrXG4gICAgICAgIHRoaXMuZGVsaW1pdGVycyA9IGRlbGltLnByZXZpb3VzO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRlbGltLm5leHQucHJldmlvdXMgPSBkZWxpbS5wcmV2aW91cztcbiAgICB9XG59O1xuXG52YXIgcmVtb3ZlRGVsaW1pdGVyc0JldHdlZW4gPSBmdW5jdGlvbihib3R0b20sIHRvcCkge1xuICAgIGlmIChib3R0b20ubmV4dCAhPT0gdG9wKSB7XG4gICAgICAgIGJvdHRvbS5uZXh0ID0gdG9wO1xuICAgICAgICB0b3AucHJldmlvdXMgPSBib3R0b207XG4gICAgfVxufTtcblxudmFyIHByb2Nlc3NFbXBoYXNpcyA9IGZ1bmN0aW9uKHN0YWNrX2JvdHRvbSkge1xuICAgIHZhciBvcGVuZXIsIGNsb3Nlciwgb2xkX2Nsb3NlcjtcbiAgICB2YXIgb3BlbmVyX2lubCwgY2xvc2VyX2lubDtcbiAgICB2YXIgdGVtcHN0YWNrO1xuICAgIHZhciB1c2VfZGVsaW1zO1xuICAgIHZhciB0bXAsIG5leHQ7XG4gICAgdmFyIG9wZW5lcl9mb3VuZDtcbiAgICB2YXIgb3BlbmVyc19ib3R0b20gPSBbXTtcblxuICAgIG9wZW5lcnNfYm90dG9tW0NfVU5ERVJTQ09SRV0gPSBzdGFja19ib3R0b207XG4gICAgb3BlbmVyc19ib3R0b21bQ19BU1RFUklTS10gPSBzdGFja19ib3R0b207XG4gICAgb3BlbmVyc19ib3R0b21bQ19TSU5HTEVRVU9URV0gPSBzdGFja19ib3R0b207XG4gICAgb3BlbmVyc19ib3R0b21bQ19ET1VCTEVRVU9URV0gPSBzdGFja19ib3R0b207XG5cbiAgICAvLyBmaW5kIGZpcnN0IGNsb3NlciBhYm92ZSBzdGFja19ib3R0b206XG4gICAgY2xvc2VyID0gdGhpcy5kZWxpbWl0ZXJzO1xuICAgIHdoaWxlIChjbG9zZXIgIT09IG51bGwgJiYgY2xvc2VyLnByZXZpb3VzICE9PSBzdGFja19ib3R0b20pIHtcbiAgICAgICAgY2xvc2VyID0gY2xvc2VyLnByZXZpb3VzO1xuICAgIH1cbiAgICAvLyBtb3ZlIGZvcndhcmQsIGxvb2tpbmcgZm9yIGNsb3NlcnMsIGFuZCBoYW5kbGluZyBlYWNoXG4gICAgd2hpbGUgKGNsb3NlciAhPT0gbnVsbCkge1xuICAgICAgICB2YXIgY2xvc2VyY2MgPSBjbG9zZXIuY2M7XG4gICAgICAgIGlmICghKGNsb3Nlci5jYW5fY2xvc2UgJiYgKGNsb3NlcmNjID09PSBDX1VOREVSU0NPUkUgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VyY2MgPT09IENfQVNURVJJU0sgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VyY2MgPT09IENfU0lOR0xFUVVPVEUgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VyY2MgPT09IENfRE9VQkxFUVVPVEUpKSkge1xuICAgICAgICAgICAgY2xvc2VyID0gY2xvc2VyLm5leHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBmb3VuZCBlbXBoYXNpcyBjbG9zZXIuIG5vdyBsb29rIGJhY2sgZm9yIGZpcnN0IG1hdGNoaW5nIG9wZW5lcjpcbiAgICAgICAgICAgIG9wZW5lciA9IGNsb3Nlci5wcmV2aW91cztcbiAgICAgICAgICAgIG9wZW5lcl9mb3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgd2hpbGUgKG9wZW5lciAhPT0gbnVsbCAmJiBvcGVuZXIgIT09IHN0YWNrX2JvdHRvbSAmJlxuICAgICAgICAgICAgICAgICAgIG9wZW5lciAhPT0gb3BlbmVyc19ib3R0b21bY2xvc2VyY2NdKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9wZW5lci5jYyA9PT0gY2xvc2VyLmNjICYmIG9wZW5lci5jYW5fb3Blbikge1xuICAgICAgICAgICAgICAgICAgICBvcGVuZXJfZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb3BlbmVyID0gb3BlbmVyLnByZXZpb3VzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2xkX2Nsb3NlciA9IGNsb3NlcjtcblxuICAgICAgICAgICAgaWYgKGNsb3NlcmNjID09PSBDX0FTVEVSSVNLIHx8IGNsb3NlcmNjID09PSBDX1VOREVSU0NPUkUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIW9wZW5lcl9mb3VuZCkge1xuICAgICAgICAgICAgICAgICAgICBjbG9zZXIgPSBjbG9zZXIubmV4dDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBjYWxjdWxhdGUgYWN0dWFsIG51bWJlciBvZiBkZWxpbWl0ZXJzIHVzZWQgZnJvbSBjbG9zZXJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNsb3Nlci5udW1kZWxpbXMgPCAzIHx8IG9wZW5lci5udW1kZWxpbXMgPCAzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VfZGVsaW1zID0gY2xvc2VyLm51bWRlbGltcyA8PSBvcGVuZXIubnVtZGVsaW1zID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZXIubnVtZGVsaW1zIDogb3BlbmVyLm51bWRlbGltcztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZV9kZWxpbXMgPSBjbG9zZXIubnVtZGVsaW1zICUgMiA9PT0gMCA/IDIgOiAxO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgb3BlbmVyX2lubCA9IG9wZW5lci5ub2RlO1xuICAgICAgICAgICAgICAgICAgICBjbG9zZXJfaW5sID0gY2xvc2VyLm5vZGU7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gcmVtb3ZlIHVzZWQgZGVsaW1pdGVycyBmcm9tIHN0YWNrIGVsdHMgYW5kIGlubGluZXNcbiAgICAgICAgICAgICAgICAgICAgb3BlbmVyLm51bWRlbGltcyAtPSB1c2VfZGVsaW1zO1xuICAgICAgICAgICAgICAgICAgICBjbG9zZXIubnVtZGVsaW1zIC09IHVzZV9kZWxpbXM7XG4gICAgICAgICAgICAgICAgICAgIG9wZW5lcl9pbmwuX2xpdGVyYWwgPVxuICAgICAgICAgICAgICAgICAgICAgICAgb3BlbmVyX2lubC5fbGl0ZXJhbC5zbGljZSgwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuZXJfaW5sLl9saXRlcmFsLmxlbmd0aCAtIHVzZV9kZWxpbXMpO1xuICAgICAgICAgICAgICAgICAgICBjbG9zZXJfaW5sLl9saXRlcmFsID1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3Nlcl9pbmwuX2xpdGVyYWwuc2xpY2UoMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VyX2lubC5fbGl0ZXJhbC5sZW5ndGggLSB1c2VfZGVsaW1zKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBidWlsZCBjb250ZW50cyBmb3IgbmV3IGVtcGggZWxlbWVudFxuICAgICAgICAgICAgICAgICAgICB2YXIgZW1waCA9IG5ldyBOb2RlKHVzZV9kZWxpbXMgPT09IDEgPyAnRW1waCcgOiAnU3Ryb25nJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgdG1wID0gb3BlbmVyX2lubC5fbmV4dDtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHRtcCAmJiB0bXAgIT09IGNsb3Nlcl9pbmwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQgPSB0bXAuX25leHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0bXAudW5saW5rKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbXBoLmFwcGVuZENoaWxkKHRtcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0bXAgPSBuZXh0O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgb3BlbmVyX2lubC5pbnNlcnRBZnRlcihlbXBoKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyByZW1vdmUgZWx0cyBiZXR3ZWVuIG9wZW5lciBhbmQgY2xvc2VyIGluIGRlbGltaXRlcnMgc3RhY2tcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlRGVsaW1pdGVyc0JldHdlZW4ob3BlbmVyLCBjbG9zZXIpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIG9wZW5lciBoYXMgMCBkZWxpbXMsIHJlbW92ZSBpdCBhbmQgdGhlIGlubGluZVxuICAgICAgICAgICAgICAgICAgICBpZiAob3BlbmVyLm51bWRlbGltcyA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3BlbmVyX2lubC51bmxpbmsoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlRGVsaW1pdGVyKG9wZW5lcik7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoY2xvc2VyLm51bWRlbGltcyA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VyX2lubC51bmxpbmsoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBzdGFjayA9IGNsb3Nlci5uZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVEZWxpbWl0ZXIoY2xvc2VyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlciA9IHRlbXBzdGFjaztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNsb3NlcmNjID09PSBDX1NJTkdMRVFVT1RFKSB7XG4gICAgICAgICAgICAgICAgY2xvc2VyLm5vZGUuX2xpdGVyYWwgPSBcIlxcdTIwMTlcIjtcbiAgICAgICAgICAgICAgICBpZiAob3BlbmVyX2ZvdW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wZW5lci5ub2RlLl9saXRlcmFsID0gXCJcXHUyMDE4XCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNsb3NlciA9IGNsb3Nlci5uZXh0O1xuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNsb3NlcmNjID09PSBDX0RPVUJMRVFVT1RFKSB7XG4gICAgICAgICAgICAgICAgY2xvc2VyLm5vZGUuX2xpdGVyYWwgPSBcIlxcdTIwMURcIjtcbiAgICAgICAgICAgICAgICBpZiAob3BlbmVyX2ZvdW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wZW5lci5ub2RlLmxpdGVyYWwgPSBcIlxcdTIwMUNcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2xvc2VyID0gY2xvc2VyLm5leHQ7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghb3BlbmVyX2ZvdW5kKSB7XG4gICAgICAgICAgICAgICAgLy8gU2V0IGxvd2VyIGJvdW5kIGZvciBmdXR1cmUgc2VhcmNoZXMgZm9yIG9wZW5lcnM6XG4gICAgICAgICAgICAgICAgb3BlbmVyc19ib3R0b21bY2xvc2VyY2NdID0gb2xkX2Nsb3Nlci5wcmV2aW91cztcbiAgICAgICAgICAgICAgICBpZiAoIW9sZF9jbG9zZXIuY2FuX29wZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UgY2FuIHJlbW92ZSBhIGNsb3NlciB0aGF0IGNhbid0IGJlIGFuIG9wZW5lcixcbiAgICAgICAgICAgICAgICAgICAgLy8gb25jZSB3ZSd2ZSBzZWVuIHRoZXJlJ3Mgbm8gbWF0Y2hpbmcgb3BlbmVyOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZURlbGltaXRlcihvbGRfY2xvc2VyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8vIHJlbW92ZSBhbGwgZGVsaW1pdGVyc1xuICAgIHdoaWxlICh0aGlzLmRlbGltaXRlcnMgIT09IG51bGwgJiYgdGhpcy5kZWxpbWl0ZXJzICE9PSBzdGFja19ib3R0b20pIHtcbiAgICAgICAgdGhpcy5yZW1vdmVEZWxpbWl0ZXIodGhpcy5kZWxpbWl0ZXJzKTtcbiAgICB9XG59O1xuXG4vLyBBdHRlbXB0IHRvIHBhcnNlIGxpbmsgdGl0bGUgKHNhbnMgcXVvdGVzKSwgcmV0dXJuaW5nIHRoZSBzdHJpbmdcbi8vIG9yIG51bGwgaWYgbm8gbWF0Y2guXG52YXIgcGFyc2VMaW5rVGl0bGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGl0bGUgPSB0aGlzLm1hdGNoKHJlTGlua1RpdGxlKTtcbiAgICBpZiAodGl0bGUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gY2hvcCBvZmYgcXVvdGVzIGZyb20gdGl0bGUgYW5kIHVuZXNjYXBlOlxuICAgICAgICByZXR1cm4gdW5lc2NhcGVTdHJpbmcodGl0bGUuc3Vic3RyKDEsIHRpdGxlLmxlbmd0aCAtIDIpKTtcbiAgICB9XG59O1xuXG4vLyBBdHRlbXB0IHRvIHBhcnNlIGxpbmsgZGVzdGluYXRpb24sIHJldHVybmluZyB0aGUgc3RyaW5nIG9yXG4vLyBudWxsIGlmIG5vIG1hdGNoLlxudmFyIHBhcnNlTGlua0Rlc3RpbmF0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlcyA9IHRoaXMubWF0Y2gocmVMaW5rRGVzdGluYXRpb25CcmFjZXMpO1xuICAgIGlmIChyZXMgPT09IG51bGwpIHtcbiAgICAgICAgcmVzID0gdGhpcy5tYXRjaChyZUxpbmtEZXN0aW5hdGlvbik7XG4gICAgICAgIGlmIChyZXMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZVVSSSh1bmVzY2FwZVN0cmluZyhyZXMpKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7ICAvLyBjaG9wIG9mZiBzdXJyb3VuZGluZyA8Li4+OlxuICAgICAgICByZXR1cm4gbm9ybWFsaXplVVJJKHVuZXNjYXBlU3RyaW5nKHJlcy5zdWJzdHIoMSwgcmVzLmxlbmd0aCAtIDIpKSk7XG4gICAgfVxufTtcblxuLy8gQXR0ZW1wdCB0byBwYXJzZSBhIGxpbmsgbGFiZWwsIHJldHVybmluZyBudW1iZXIgb2YgY2hhcmFjdGVycyBwYXJzZWQuXG52YXIgcGFyc2VMaW5rTGFiZWwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbSA9IHRoaXMubWF0Y2gocmVMaW5rTGFiZWwpO1xuICAgIGlmIChtID09PSBudWxsIHx8IG0ubGVuZ3RoID4gMTAwMSkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbS5sZW5ndGg7XG4gICAgfVxufTtcblxuLy8gQWRkIG9wZW4gYnJhY2tldCB0byBkZWxpbWl0ZXIgc3RhY2sgYW5kIGFkZCBhIHRleHQgbm9kZSB0byBibG9jaydzIGNoaWxkcmVuLlxudmFyIHBhcnNlT3BlbkJyYWNrZXQgPSBmdW5jdGlvbihibG9jaykge1xuICAgIHZhciBzdGFydHBvcyA9IHRoaXMucG9zO1xuICAgIHRoaXMucG9zICs9IDE7XG5cbiAgICB2YXIgbm9kZSA9IHRleHQoJ1snKTtcbiAgICBibG9jay5hcHBlbmRDaGlsZChub2RlKTtcblxuICAgIC8vIEFkZCBlbnRyeSB0byBzdGFjayBmb3IgdGhpcyBvcGVuZXJcbiAgICB0aGlzLmRlbGltaXRlcnMgPSB7IGNjOiBDX09QRU5fQlJBQ0tFVCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bWRlbGltczogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2aW91czogdGhpcy5kZWxpbWl0ZXJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbl9vcGVuOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FuX2Nsb3NlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4OiBzdGFydHBvcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZSB9O1xuICAgIGlmICh0aGlzLmRlbGltaXRlcnMucHJldmlvdXMgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5kZWxpbWl0ZXJzLnByZXZpb3VzLm5leHQgPSB0aGlzLmRlbGltaXRlcnM7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG5cbn07XG5cbi8vIElGIG5leHQgY2hhcmFjdGVyIGlzIFssIGFuZCAhIGRlbGltaXRlciB0byBkZWxpbWl0ZXIgc3RhY2sgYW5kXG4vLyBhZGQgYSB0ZXh0IG5vZGUgdG8gYmxvY2sncyBjaGlsZHJlbi4gIE90aGVyd2lzZSBqdXN0IGFkZCBhIHRleHQgbm9kZS5cbnZhciBwYXJzZUJhbmcgPSBmdW5jdGlvbihibG9jaykge1xuICAgIHZhciBzdGFydHBvcyA9IHRoaXMucG9zO1xuICAgIHRoaXMucG9zICs9IDE7XG4gICAgaWYgKHRoaXMucGVlaygpID09PSBDX09QRU5fQlJBQ0tFVCkge1xuICAgICAgICB0aGlzLnBvcyArPSAxO1xuXG4gICAgICAgIHZhciBub2RlID0gdGV4dCgnIVsnKTtcbiAgICAgICAgYmxvY2suYXBwZW5kQ2hpbGQobm9kZSk7XG5cbiAgICAgICAgLy8gQWRkIGVudHJ5IHRvIHN0YWNrIGZvciB0aGlzIG9wZW5lclxuICAgICAgICB0aGlzLmRlbGltaXRlcnMgPSB7IGNjOiBDX0JBTkcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtZGVsaW1zOiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXM6IHRoaXMuZGVsaW1pdGVycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0OiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbl9vcGVuOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbl9jbG9zZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXg6IHN0YXJ0cG9zICsgMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmU6IHRydWUgfTtcbiAgICAgICAgaWYgKHRoaXMuZGVsaW1pdGVycy5wcmV2aW91cyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5kZWxpbWl0ZXJzLnByZXZpb3VzLm5leHQgPSB0aGlzLmRlbGltaXRlcnM7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBibG9jay5hcHBlbmRDaGlsZCh0ZXh0KCchJykpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8vIFRyeSB0byBtYXRjaCBjbG9zZSBicmFja2V0IGFnYWluc3QgYW4gb3BlbmluZyBpbiB0aGUgZGVsaW1pdGVyXG4vLyBzdGFjay4gIEFkZCBlaXRoZXIgYSBsaW5rIG9yIGltYWdlLCBvciBhIHBsYWluIFsgY2hhcmFjdGVyLFxuLy8gdG8gYmxvY2sncyBjaGlsZHJlbi4gIElmIHRoZXJlIGlzIGEgbWF0Y2hpbmcgZGVsaW1pdGVyLFxuLy8gcmVtb3ZlIGl0IGZyb20gdGhlIGRlbGltaXRlciBzdGFjay5cbnZhciBwYXJzZUNsb3NlQnJhY2tldCA9IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgdmFyIHN0YXJ0cG9zO1xuICAgIHZhciBpc19pbWFnZTtcbiAgICB2YXIgZGVzdDtcbiAgICB2YXIgdGl0bGU7XG4gICAgdmFyIG1hdGNoZWQgPSBmYWxzZTtcbiAgICB2YXIgcmVmbGFiZWw7XG4gICAgdmFyIG9wZW5lcjtcblxuICAgIHRoaXMucG9zICs9IDE7XG4gICAgc3RhcnRwb3MgPSB0aGlzLnBvcztcblxuICAgIC8vIGxvb2sgdGhyb3VnaCBzdGFjayBvZiBkZWxpbWl0ZXJzIGZvciBhIFsgb3IgIVtcbiAgICBvcGVuZXIgPSB0aGlzLmRlbGltaXRlcnM7XG5cbiAgICB3aGlsZSAob3BlbmVyICE9PSBudWxsKSB7XG4gICAgICAgIGlmIChvcGVuZXIuY2MgPT09IENfT1BFTl9CUkFDS0VUIHx8IG9wZW5lci5jYyA9PT0gQ19CQU5HKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBvcGVuZXIgPSBvcGVuZXIucHJldmlvdXM7XG4gICAgfVxuXG4gICAgaWYgKG9wZW5lciA9PT0gbnVsbCkge1xuICAgICAgICAvLyBubyBtYXRjaGVkIG9wZW5lciwganVzdCByZXR1cm4gYSBsaXRlcmFsXG4gICAgICAgIGJsb2NrLmFwcGVuZENoaWxkKHRleHQoJ10nKSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmICghb3BlbmVyLmFjdGl2ZSkge1xuICAgICAgICAvLyBubyBtYXRjaGVkIG9wZW5lciwganVzdCByZXR1cm4gYSBsaXRlcmFsXG4gICAgICAgIGJsb2NrLmFwcGVuZENoaWxkKHRleHQoJ10nKSk7XG4gICAgICAgIC8vIHRha2Ugb3BlbmVyIG9mZiBlbXBoYXNpcyBzdGFja1xuICAgICAgICB0aGlzLnJlbW92ZURlbGltaXRlcihvcGVuZXIpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBnb3QgaGVyZSwgb3BlbiBpcyBhIHBvdGVudGlhbCBvcGVuZXJcbiAgICBpc19pbWFnZSA9IG9wZW5lci5jYyA9PT0gQ19CQU5HO1xuXG4gICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHdlIGhhdmUgYSBsaW5rL2ltYWdlXG5cbiAgICAvLyBJbmxpbmUgbGluaz9cbiAgICBpZiAodGhpcy5wZWVrKCkgPT09IENfT1BFTl9QQVJFTikge1xuICAgICAgICB0aGlzLnBvcysrO1xuICAgICAgICBpZiAodGhpcy5zcG5sKCkgJiZcbiAgICAgICAgICAgICgoZGVzdCA9IHRoaXMucGFyc2VMaW5rRGVzdGluYXRpb24oKSkgIT09IG51bGwpICYmXG4gICAgICAgICAgICB0aGlzLnNwbmwoKSAmJlxuICAgICAgICAgICAgLy8gbWFrZSBzdXJlIHRoZXJlJ3MgYSBzcGFjZSBiZWZvcmUgdGhlIHRpdGxlOlxuICAgICAgICAgICAgKHJlV2hpdGVzcGFjZUNoYXIudGVzdCh0aGlzLnN1YmplY3QuY2hhckF0KHRoaXMucG9zIC0gMSkpICYmXG4gICAgICAgICAgICAgKHRpdGxlID0gdGhpcy5wYXJzZUxpbmtUaXRsZSgpKSB8fCB0cnVlKSAmJlxuICAgICAgICAgICAgdGhpcy5zcG5sKCkgJiZcbiAgICAgICAgICAgIHRoaXMucGVlaygpID09PSBDX0NMT1NFX1BBUkVOKSB7XG4gICAgICAgICAgICB0aGlzLnBvcyArPSAxO1xuICAgICAgICAgICAgbWF0Y2hlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuXG4gICAgICAgIC8vIE5leHQsIHNlZSBpZiB0aGVyZSdzIGEgbGluayBsYWJlbFxuICAgICAgICB2YXIgc2F2ZXBvcyA9IHRoaXMucG9zO1xuICAgICAgICB2YXIgYmVmb3JlbGFiZWwgPSB0aGlzLnBvcztcbiAgICAgICAgdmFyIG4gPSB0aGlzLnBhcnNlTGlua0xhYmVsKCk7XG4gICAgICAgIGlmIChuID09PSAwIHx8IG4gPT09IDIpIHtcbiAgICAgICAgICAgIC8vIGVtcHR5IG9yIG1pc3Npbmcgc2Vjb25kIGxhYmVsXG4gICAgICAgICAgICByZWZsYWJlbCA9IHRoaXMuc3ViamVjdC5zbGljZShvcGVuZXIuaW5kZXgsIHN0YXJ0cG9zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlZmxhYmVsID0gdGhpcy5zdWJqZWN0LnNsaWNlKGJlZm9yZWxhYmVsLCBiZWZvcmVsYWJlbCArIG4pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuID09PSAwKSB7XG4gICAgICAgICAgICAvLyBJZiBzaG9ydGN1dCByZWZlcmVuY2UgbGluaywgcmV3aW5kIGJlZm9yZSBzcGFjZXMgd2Ugc2tpcHBlZC5cbiAgICAgICAgICAgIHRoaXMucG9zID0gc2F2ZXBvcztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGxvb2t1cCByYXdsYWJlbCBpbiByZWZtYXBcbiAgICAgICAgdmFyIGxpbmsgPSB0aGlzLnJlZm1hcFtub3JtYWxpemVSZWZlcmVuY2UocmVmbGFiZWwpXTtcbiAgICAgICAgaWYgKGxpbmspIHtcbiAgICAgICAgICAgIGRlc3QgPSBsaW5rLmRlc3RpbmF0aW9uO1xuICAgICAgICAgICAgdGl0bGUgPSBsaW5rLnRpdGxlO1xuICAgICAgICAgICAgbWF0Y2hlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobWF0Y2hlZCkge1xuICAgICAgICB2YXIgbm9kZSA9IG5ldyBOb2RlKGlzX2ltYWdlID8gJ0ltYWdlJyA6ICdMaW5rJyk7XG4gICAgICAgIG5vZGUuX2Rlc3RpbmF0aW9uID0gZGVzdDtcbiAgICAgICAgbm9kZS5fdGl0bGUgPSB0aXRsZSB8fCAnJztcblxuICAgICAgICB2YXIgdG1wLCBuZXh0O1xuICAgICAgICB0bXAgPSBvcGVuZXIubm9kZS5fbmV4dDtcbiAgICAgICAgd2hpbGUgKHRtcCkge1xuICAgICAgICAgICAgbmV4dCA9IHRtcC5fbmV4dDtcbiAgICAgICAgICAgIHRtcC51bmxpbmsoKTtcbiAgICAgICAgICAgIG5vZGUuYXBwZW5kQ2hpbGQodG1wKTtcbiAgICAgICAgICAgIHRtcCA9IG5leHQ7XG4gICAgICAgIH1cbiAgICAgICAgYmxvY2suYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgICAgIHRoaXMucHJvY2Vzc0VtcGhhc2lzKG9wZW5lci5wcmV2aW91cyk7XG5cbiAgICAgICAgb3BlbmVyLm5vZGUudW5saW5rKCk7XG5cbiAgICAgICAgLy8gcHJvY2Vzc0VtcGhhc2lzIHdpbGwgcmVtb3ZlIHRoaXMgYW5kIGxhdGVyIGRlbGltaXRlcnMuXG4gICAgICAgIC8vIE5vdywgZm9yIGEgbGluaywgd2UgYWxzbyBkZWFjdGl2YXRlIGVhcmxpZXIgbGluayBvcGVuZXJzLlxuICAgICAgICAvLyAobm8gbGlua3MgaW4gbGlua3MpXG4gICAgICAgIGlmICghaXNfaW1hZ2UpIHtcbiAgICAgICAgICBvcGVuZXIgPSB0aGlzLmRlbGltaXRlcnM7XG4gICAgICAgICAgd2hpbGUgKG9wZW5lciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKG9wZW5lci5jYyA9PT0gQ19PUEVOX0JSQUNLRVQpIHtcbiAgICAgICAgICAgICAgICBvcGVuZXIuYWN0aXZlID0gZmFsc2U7IC8vIGRlYWN0aXZhdGUgdGhpcyBvcGVuZXJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9wZW5lciA9IG9wZW5lci5wcmV2aW91cztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcblxuICAgIH0gZWxzZSB7IC8vIG5vIG1hdGNoXG5cbiAgICAgICAgdGhpcy5yZW1vdmVEZWxpbWl0ZXIob3BlbmVyKTsgIC8vIHJlbW92ZSB0aGlzIG9wZW5lciBmcm9tIHN0YWNrXG4gICAgICAgIHRoaXMucG9zID0gc3RhcnRwb3M7XG4gICAgICAgIGJsb2NrLmFwcGVuZENoaWxkKHRleHQoJ10nKSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxufTtcblxuLy8gQXR0ZW1wdCB0byBwYXJzZSBhbiBlbnRpdHkuXG52YXIgcGFyc2VFbnRpdHkgPSBmdW5jdGlvbihibG9jaykge1xuICAgIHZhciBtO1xuICAgIGlmICgobSA9IHRoaXMubWF0Y2gocmVFbnRpdHlIZXJlKSkpIHtcbiAgICAgICAgYmxvY2suYXBwZW5kQ2hpbGQodGV4dChkZWNvZGVIVE1MKG0pKSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59O1xuXG4vLyBQYXJzZSBhIHJ1biBvZiBvcmRpbmFyeSBjaGFyYWN0ZXJzLCBvciBhIHNpbmdsZSBjaGFyYWN0ZXIgd2l0aFxuLy8gYSBzcGVjaWFsIG1lYW5pbmcgaW4gbWFya2Rvd24sIGFzIGEgcGxhaW4gc3RyaW5nLlxudmFyIHBhcnNlU3RyaW5nID0gZnVuY3Rpb24oYmxvY2spIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoKG0gPSB0aGlzLm1hdGNoKHJlTWFpbikpKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc21hcnQpIHtcbiAgICAgICAgICAgIGJsb2NrLmFwcGVuZENoaWxkKHRleHQoXG4gICAgICAgICAgICAgICAgbS5yZXBsYWNlKHJlRWxsaXBzZXMsIFwiXFx1MjAyNlwiKVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZShyZURhc2gsIGZ1bmN0aW9uKGNoYXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZW5Db3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZW1Db3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hhcnMubGVuZ3RoICUgMyA9PT0gMCkgeyAvLyBJZiBkaXZpc2libGUgYnkgMywgdXNlIGFsbCBlbSBkYXNoZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbUNvdW50ID0gY2hhcnMubGVuZ3RoIC8gMztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hhcnMubGVuZ3RoICUgMiA9PT0gMCkgeyAvLyBJZiBkaXZpc2libGUgYnkgMiwgdXNlIGFsbCBlbiBkYXNoZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbkNvdW50ID0gY2hhcnMubGVuZ3RoIC8gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hhcnMubGVuZ3RoICUgMyA9PT0gMikgeyAvLyBJZiAyIGV4dHJhIGRhc2hlcywgdXNlIGVuIGRhc2ggZm9yIGxhc3QgMjsgZW0gZGFzaGVzIGZvciByZXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5Db3VudCA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1Db3VudCA9IChjaGFycy5sZW5ndGggLSAyKSAvIDM7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgeyAvLyBVc2UgZW4gZGFzaGVzIGZvciBsYXN0IDQgaHlwaGVuczsgZW0gZGFzaGVzIGZvciByZXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5Db3VudCA9IDI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1Db3VudCA9IChjaGFycy5sZW5ndGggLSA0KSAvIDM7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJcXHUyMDE0XCIucmVwZWF0KGVtQ291bnQpICsgXCJcXHUyMDEzXCIucmVwZWF0KGVuQ291bnQpO1xuICAgICAgICAgICAgICAgICAgICB9KSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYmxvY2suYXBwZW5kQ2hpbGQodGV4dChtKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn07XG5cbi8vIFBhcnNlIGEgbmV3bGluZS4gIElmIGl0IHdhcyBwcmVjZWRlZCBieSB0d28gc3BhY2VzLCByZXR1cm4gYSBoYXJkXG4vLyBsaW5lIGJyZWFrOyBvdGhlcndpc2UgYSBzb2Z0IGxpbmUgYnJlYWsuXG52YXIgcGFyc2VOZXdsaW5lID0gZnVuY3Rpb24oYmxvY2spIHtcbiAgICB0aGlzLnBvcyArPSAxOyAvLyBhc3N1bWUgd2UncmUgYXQgYSBcXG5cbiAgICAvLyBjaGVjayBwcmV2aW91cyBub2RlIGZvciB0cmFpbGluZyBzcGFjZXNcbiAgICB2YXIgbGFzdGMgPSBibG9jay5fbGFzdENoaWxkO1xuICAgIGlmIChsYXN0YyAmJiBsYXN0Yy50eXBlID09PSAnVGV4dCcgJiYgbGFzdGMuX2xpdGVyYWxbbGFzdGMuX2xpdGVyYWwubGVuZ3RoIC0gMV0gPT09ICcgJykge1xuICAgICAgICB2YXIgaGFyZGJyZWFrID0gbGFzdGMuX2xpdGVyYWxbbGFzdGMuX2xpdGVyYWwubGVuZ3RoIC0gMl0gPT09ICcgJztcbiAgICAgICAgbGFzdGMuX2xpdGVyYWwgPSBsYXN0Yy5fbGl0ZXJhbC5yZXBsYWNlKHJlRmluYWxTcGFjZSwgJycpO1xuICAgICAgICBibG9jay5hcHBlbmRDaGlsZChuZXcgTm9kZShoYXJkYnJlYWsgPyAnSGFyZGJyZWFrJyA6ICdTb2Z0YnJlYWsnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYmxvY2suYXBwZW5kQ2hpbGQobmV3IE5vZGUoJ1NvZnRicmVhaycpKTtcbiAgICB9XG4gICAgdGhpcy5tYXRjaChyZUluaXRpYWxTcGFjZSk7IC8vIGdvYmJsZSBsZWFkaW5nIHNwYWNlcyBpbiBuZXh0IGxpbmVcbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8vIEF0dGVtcHQgdG8gcGFyc2UgYSBsaW5rIHJlZmVyZW5jZSwgbW9kaWZ5aW5nIHJlZm1hcC5cbnZhciBwYXJzZVJlZmVyZW5jZSA9IGZ1bmN0aW9uKHMsIHJlZm1hcCkge1xuICAgIHRoaXMuc3ViamVjdCA9IHM7XG4gICAgdGhpcy5wb3MgPSAwO1xuICAgIHZhciByYXdsYWJlbDtcbiAgICB2YXIgZGVzdDtcbiAgICB2YXIgdGl0bGU7XG4gICAgdmFyIG1hdGNoQ2hhcnM7XG4gICAgdmFyIHN0YXJ0cG9zID0gdGhpcy5wb3M7XG5cbiAgICAvLyBsYWJlbDpcbiAgICBtYXRjaENoYXJzID0gdGhpcy5wYXJzZUxpbmtMYWJlbCgpO1xuICAgIGlmIChtYXRjaENoYXJzID09PSAwKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJhd2xhYmVsID0gdGhpcy5zdWJqZWN0LnN1YnN0cigwLCBtYXRjaENoYXJzKTtcbiAgICB9XG5cbiAgICAvLyBjb2xvbjpcbiAgICBpZiAodGhpcy5wZWVrKCkgPT09IENfQ09MT04pIHtcbiAgICAgICAgdGhpcy5wb3MrKztcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBvcyA9IHN0YXJ0cG9zO1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICAvLyAgbGluayB1cmxcbiAgICB0aGlzLnNwbmwoKTtcblxuICAgIGRlc3QgPSB0aGlzLnBhcnNlTGlua0Rlc3RpbmF0aW9uKCk7XG4gICAgaWYgKGRlc3QgPT09IG51bGwgfHwgZGVzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5wb3MgPSBzdGFydHBvcztcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgdmFyIGJlZm9yZXRpdGxlID0gdGhpcy5wb3M7XG4gICAgdGhpcy5zcG5sKCk7XG4gICAgdGl0bGUgPSB0aGlzLnBhcnNlTGlua1RpdGxlKCk7XG4gICAgaWYgKHRpdGxlID09PSBudWxsKSB7XG4gICAgICAgIHRpdGxlID0gJyc7XG4gICAgICAgIC8vIHJld2luZCBiZWZvcmUgc3BhY2VzXG4gICAgICAgIHRoaXMucG9zID0gYmVmb3JldGl0bGU7XG4gICAgfVxuXG4gICAgLy8gbWFrZSBzdXJlIHdlJ3JlIGF0IGxpbmUgZW5kOlxuICAgIHZhciBhdExpbmVFbmQgPSB0cnVlO1xuICAgIGlmICh0aGlzLm1hdGNoKHJlU3BhY2VBdEVuZE9mTGluZSkgPT09IG51bGwpIHtcbiAgICAgICAgaWYgKHRpdGxlID09PSAnJykge1xuICAgICAgICAgICAgYXRMaW5lRW5kID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyB0aGUgcG90ZW50aWFsIHRpdGxlIHdlIGZvdW5kIGlzIG5vdCBhdCB0aGUgbGluZSBlbmQsXG4gICAgICAgICAgICAvLyBidXQgaXQgY291bGQgc3RpbGwgYmUgYSBsZWdhbCBsaW5rIHJlZmVyZW5jZSBpZiB3ZVxuICAgICAgICAgICAgLy8gZGlzY2FyZCB0aGUgdGl0bGVcbiAgICAgICAgICAgIHRpdGxlID0gJyc7XG4gICAgICAgICAgICAvLyByZXdpbmQgYmVmb3JlIHNwYWNlc1xuICAgICAgICAgICAgdGhpcy5wb3MgPSBiZWZvcmV0aXRsZTtcbiAgICAgICAgICAgIC8vIGFuZCBpbnN0ZWFkIGNoZWNrIGlmIHRoZSBsaW5rIFVSTCBpcyBhdCB0aGUgbGluZSBlbmRcbiAgICAgICAgICAgIGF0TGluZUVuZCA9IHRoaXMubWF0Y2gocmVTcGFjZUF0RW5kT2ZMaW5lKSAhPT0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmICghYXRMaW5lRW5kKSB7XG4gICAgICAgIHRoaXMucG9zID0gc3RhcnRwb3M7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIHZhciBub3JtbGFiZWwgPSBub3JtYWxpemVSZWZlcmVuY2UocmF3bGFiZWwpO1xuICAgIGlmIChub3JtbGFiZWwgPT09ICcnKSB7XG4gICAgICAgIC8vIGxhYmVsIG11c3QgY29udGFpbiBub24td2hpdGVzcGFjZSBjaGFyYWN0ZXJzXG4gICAgICAgIHRoaXMucG9zID0gc3RhcnRwb3M7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIGlmICghcmVmbWFwW25vcm1sYWJlbF0pIHtcbiAgICAgICAgcmVmbWFwW25vcm1sYWJlbF0gPSB7IGRlc3RpbmF0aW9uOiBkZXN0LCB0aXRsZTogdGl0bGUgfTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucG9zIC0gc3RhcnRwb3M7XG59O1xuXG4vLyBQYXJzZSB0aGUgbmV4dCBpbmxpbmUgZWxlbWVudCBpbiBzdWJqZWN0LCBhZHZhbmNpbmcgc3ViamVjdCBwb3NpdGlvbi5cbi8vIE9uIHN1Y2Nlc3MsIGFkZCB0aGUgcmVzdWx0IHRvIGJsb2NrJ3MgY2hpbGRyZW4gYW5kIHJldHVybiB0cnVlLlxuLy8gT24gZmFpbHVyZSwgcmV0dXJuIGZhbHNlLlxudmFyIHBhcnNlSW5saW5lID0gZnVuY3Rpb24oYmxvY2spIHtcbiAgICB2YXIgcmVzID0gZmFsc2U7XG4gICAgdmFyIGMgPSB0aGlzLnBlZWsoKTtcbiAgICBpZiAoYyA9PT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBzd2l0Y2goYykge1xuICAgIGNhc2UgQ19ORVdMSU5FOlxuICAgICAgICByZXMgPSB0aGlzLnBhcnNlTmV3bGluZShibG9jayk7XG4gICAgICAgIGJyZWFrO1xuICAgIGNhc2UgQ19CQUNLU0xBU0g6XG4gICAgICAgIHJlcyA9IHRoaXMucGFyc2VCYWNrc2xhc2goYmxvY2spO1xuICAgICAgICBicmVhaztcbiAgICBjYXNlIENfQkFDS1RJQ0s6XG4gICAgICAgIHJlcyA9IHRoaXMucGFyc2VCYWNrdGlja3MoYmxvY2spO1xuICAgICAgICBicmVhaztcbiAgICBjYXNlIENfQVNURVJJU0s6XG4gICAgY2FzZSBDX1VOREVSU0NPUkU6XG4gICAgICAgIHJlcyA9IHRoaXMuaGFuZGxlRGVsaW0oYywgYmxvY2spO1xuICAgICAgICBicmVhaztcbiAgICBjYXNlIENfU0lOR0xFUVVPVEU6XG4gICAgY2FzZSBDX0RPVUJMRVFVT1RFOlxuICAgICAgICByZXMgPSB0aGlzLm9wdGlvbnMuc21hcnQgJiYgdGhpcy5oYW5kbGVEZWxpbShjLCBibG9jayk7XG4gICAgICAgIGJyZWFrO1xuICAgIGNhc2UgQ19PUEVOX0JSQUNLRVQ6XG4gICAgICAgIHJlcyA9IHRoaXMucGFyc2VPcGVuQnJhY2tldChibG9jayk7XG4gICAgICAgIGJyZWFrO1xuICAgIGNhc2UgQ19CQU5HOlxuICAgICAgICByZXMgPSB0aGlzLnBhcnNlQmFuZyhibG9jayk7XG4gICAgICAgIGJyZWFrO1xuICAgIGNhc2UgQ19DTE9TRV9CUkFDS0VUOlxuICAgICAgICByZXMgPSB0aGlzLnBhcnNlQ2xvc2VCcmFja2V0KGJsb2NrKTtcbiAgICAgICAgYnJlYWs7XG4gICAgY2FzZSBDX0xFU1NUSEFOOlxuICAgICAgICByZXMgPSB0aGlzLnBhcnNlQXV0b2xpbmsoYmxvY2spIHx8IHRoaXMucGFyc2VIdG1sVGFnKGJsb2NrKTtcbiAgICAgICAgYnJlYWs7XG4gICAgY2FzZSBDX0FNUEVSU0FORDpcbiAgICAgICAgcmVzID0gdGhpcy5wYXJzZUVudGl0eShibG9jayk7XG4gICAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICAgIHJlcyA9IHRoaXMucGFyc2VTdHJpbmcoYmxvY2spO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKCFyZXMpIHtcbiAgICAgICAgdGhpcy5wb3MgKz0gMTtcbiAgICAgICAgYmxvY2suYXBwZW5kQ2hpbGQodGV4dChmcm9tQ29kZVBvaW50KGMpKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG4vLyBQYXJzZSBzdHJpbmcgY29udGVudCBpbiBibG9jayBpbnRvIGlubGluZSBjaGlsZHJlbixcbi8vIHVzaW5nIHJlZm1hcCB0byByZXNvbHZlIHJlZmVyZW5jZXMuXG52YXIgcGFyc2VJbmxpbmVzID0gZnVuY3Rpb24oYmxvY2spIHtcbiAgICB0aGlzLnN1YmplY3QgPSBibG9jay5fc3RyaW5nX2NvbnRlbnQudHJpbSgpO1xuICAgIHRoaXMucG9zID0gMDtcbiAgICB0aGlzLmRlbGltaXRlcnMgPSBudWxsO1xuICAgIHdoaWxlICh0aGlzLnBhcnNlSW5saW5lKGJsb2NrKSkge1xuICAgIH1cbiAgICBibG9jay5fc3RyaW5nX2NvbnRlbnQgPSBudWxsOyAvLyBhbGxvdyByYXcgc3RyaW5nIHRvIGJlIGdhcmJhZ2UgY29sbGVjdGVkXG4gICAgdGhpcy5wcm9jZXNzRW1waGFzaXMobnVsbCk7XG59O1xuXG4vLyBUaGUgSW5saW5lUGFyc2VyIG9iamVjdC5cbmZ1bmN0aW9uIElubGluZVBhcnNlcihvcHRpb25zKXtcbiAgICByZXR1cm4ge1xuICAgICAgICBzdWJqZWN0OiAnJyxcbiAgICAgICAgZGVsaW1pdGVyczogbnVsbCwgIC8vIHVzZWQgYnkgaGFuZGxlRGVsaW0gbWV0aG9kXG4gICAgICAgIHBvczogMCxcbiAgICAgICAgcmVmbWFwOiB7fSxcbiAgICAgICAgbWF0Y2g6IG1hdGNoLFxuICAgICAgICBwZWVrOiBwZWVrLFxuICAgICAgICBzcG5sOiBzcG5sLFxuICAgICAgICBwYXJzZUJhY2t0aWNrczogcGFyc2VCYWNrdGlja3MsXG4gICAgICAgIHBhcnNlQmFja3NsYXNoOiBwYXJzZUJhY2tzbGFzaCxcbiAgICAgICAgcGFyc2VBdXRvbGluazogcGFyc2VBdXRvbGluayxcbiAgICAgICAgcGFyc2VIdG1sVGFnOiBwYXJzZUh0bWxUYWcsXG4gICAgICAgIHNjYW5EZWxpbXM6IHNjYW5EZWxpbXMsXG4gICAgICAgIGhhbmRsZURlbGltOiBoYW5kbGVEZWxpbSxcbiAgICAgICAgcGFyc2VMaW5rVGl0bGU6IHBhcnNlTGlua1RpdGxlLFxuICAgICAgICBwYXJzZUxpbmtEZXN0aW5hdGlvbjogcGFyc2VMaW5rRGVzdGluYXRpb24sXG4gICAgICAgIHBhcnNlTGlua0xhYmVsOiBwYXJzZUxpbmtMYWJlbCxcbiAgICAgICAgcGFyc2VPcGVuQnJhY2tldDogcGFyc2VPcGVuQnJhY2tldCxcbiAgICAgICAgcGFyc2VDbG9zZUJyYWNrZXQ6IHBhcnNlQ2xvc2VCcmFja2V0LFxuICAgICAgICBwYXJzZUJhbmc6IHBhcnNlQmFuZyxcbiAgICAgICAgcGFyc2VFbnRpdHk6IHBhcnNlRW50aXR5LFxuICAgICAgICBwYXJzZVN0cmluZzogcGFyc2VTdHJpbmcsXG4gICAgICAgIHBhcnNlTmV3bGluZTogcGFyc2VOZXdsaW5lLFxuICAgICAgICBwYXJzZVJlZmVyZW5jZTogcGFyc2VSZWZlcmVuY2UsXG4gICAgICAgIHBhcnNlSW5saW5lOiBwYXJzZUlubGluZSxcbiAgICAgICAgcHJvY2Vzc0VtcGhhc2lzOiBwcm9jZXNzRW1waGFzaXMsXG4gICAgICAgIHJlbW92ZURlbGltaXRlcjogcmVtb3ZlRGVsaW1pdGVyLFxuICAgICAgICBvcHRpb25zOiBvcHRpb25zIHx8IHt9LFxuICAgICAgICBwYXJzZTogcGFyc2VJbmxpbmVzXG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbmxpbmVQYXJzZXI7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29tbW9ubWFyay9saWIvaW5saW5lcy5qc1xuLy8gbW9kdWxlIGlkID0gNTYxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBUaGUgYnVsayBvZiB0aGlzIGNvZGUgZGVyaXZlcyBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9kbW9zY3JvcC9mb2xkLWNhc2VcbkJ1dCBpbiBhZGRpdGlvbiB0byBjYXNlLWZvbGRpbmcsIHdlIGFsc28gbm9ybWFsaXplIHdoaXRlc3BhY2UuXG5cbmZvbGQtY2FzZSBpcyBDb3B5cmlnaHQgTWF0aGlhcyBCeW5lbnMgPGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS8+XG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZ1xuYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG5cIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbndpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbmRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0b1xucGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvXG50aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG5pbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbkVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcbk5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkVcbkxJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT05cbk9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTlxuV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4qL1xuXG4vKmVzbGludC1kaXNhYmxlICBrZXktc3BhY2luZywgY29tbWEtc3BhY2luZyAqL1xuXG52YXIgcmVnZXggPSAvWyBcXHRcXHJcXG5dK3xbQS1aXFx4QjVcXHhDMC1cXHhENlxceEQ4LVxceERGXFx1MDEwMFxcdTAxMDJcXHUwMTA0XFx1MDEwNlxcdTAxMDhcXHUwMTBBXFx1MDEwQ1xcdTAxMEVcXHUwMTEwXFx1MDExMlxcdTAxMTRcXHUwMTE2XFx1MDExOFxcdTAxMUFcXHUwMTFDXFx1MDExRVxcdTAxMjBcXHUwMTIyXFx1MDEyNFxcdTAxMjZcXHUwMTI4XFx1MDEyQVxcdTAxMkNcXHUwMTJFXFx1MDEzMFxcdTAxMzJcXHUwMTM0XFx1MDEzNlxcdTAxMzlcXHUwMTNCXFx1MDEzRFxcdTAxM0ZcXHUwMTQxXFx1MDE0M1xcdTAxNDVcXHUwMTQ3XFx1MDE0OVxcdTAxNEFcXHUwMTRDXFx1MDE0RVxcdTAxNTBcXHUwMTUyXFx1MDE1NFxcdTAxNTZcXHUwMTU4XFx1MDE1QVxcdTAxNUNcXHUwMTVFXFx1MDE2MFxcdTAxNjJcXHUwMTY0XFx1MDE2NlxcdTAxNjhcXHUwMTZBXFx1MDE2Q1xcdTAxNkVcXHUwMTcwXFx1MDE3MlxcdTAxNzRcXHUwMTc2XFx1MDE3OFxcdTAxNzlcXHUwMTdCXFx1MDE3RFxcdTAxN0ZcXHUwMTgxXFx1MDE4MlxcdTAxODRcXHUwMTg2XFx1MDE4N1xcdTAxODktXFx1MDE4QlxcdTAxOEUtXFx1MDE5MVxcdTAxOTNcXHUwMTk0XFx1MDE5Ni1cXHUwMTk4XFx1MDE5Q1xcdTAxOURcXHUwMTlGXFx1MDFBMFxcdTAxQTJcXHUwMUE0XFx1MDFBNlxcdTAxQTdcXHUwMUE5XFx1MDFBQ1xcdTAxQUVcXHUwMUFGXFx1MDFCMS1cXHUwMUIzXFx1MDFCNVxcdTAxQjdcXHUwMUI4XFx1MDFCQ1xcdTAxQzRcXHUwMUM1XFx1MDFDN1xcdTAxQzhcXHUwMUNBXFx1MDFDQlxcdTAxQ0RcXHUwMUNGXFx1MDFEMVxcdTAxRDNcXHUwMUQ1XFx1MDFEN1xcdTAxRDlcXHUwMURCXFx1MDFERVxcdTAxRTBcXHUwMUUyXFx1MDFFNFxcdTAxRTZcXHUwMUU4XFx1MDFFQVxcdTAxRUNcXHUwMUVFXFx1MDFGMC1cXHUwMUYyXFx1MDFGNFxcdTAxRjYtXFx1MDFGOFxcdTAxRkFcXHUwMUZDXFx1MDFGRVxcdTAyMDBcXHUwMjAyXFx1MDIwNFxcdTAyMDZcXHUwMjA4XFx1MDIwQVxcdTAyMENcXHUwMjBFXFx1MDIxMFxcdTAyMTJcXHUwMjE0XFx1MDIxNlxcdTAyMThcXHUwMjFBXFx1MDIxQ1xcdTAyMUVcXHUwMjIwXFx1MDIyMlxcdTAyMjRcXHUwMjI2XFx1MDIyOFxcdTAyMkFcXHUwMjJDXFx1MDIyRVxcdTAyMzBcXHUwMjMyXFx1MDIzQVxcdTAyM0JcXHUwMjNEXFx1MDIzRVxcdTAyNDFcXHUwMjQzLVxcdTAyNDZcXHUwMjQ4XFx1MDI0QVxcdTAyNENcXHUwMjRFXFx1MDM0NVxcdTAzNzBcXHUwMzcyXFx1MDM3NlxcdTAzN0ZcXHUwMzg2XFx1MDM4OC1cXHUwMzhBXFx1MDM4Q1xcdTAzOEUtXFx1MDNBMVxcdTAzQTMtXFx1MDNBQlxcdTAzQjBcXHUwM0MyXFx1MDNDRi1cXHUwM0QxXFx1MDNENVxcdTAzRDZcXHUwM0Q4XFx1MDNEQVxcdTAzRENcXHUwM0RFXFx1MDNFMFxcdTAzRTJcXHUwM0U0XFx1MDNFNlxcdTAzRThcXHUwM0VBXFx1MDNFQ1xcdTAzRUVcXHUwM0YwXFx1MDNGMVxcdTAzRjRcXHUwM0Y1XFx1MDNGN1xcdTAzRjlcXHUwM0ZBXFx1MDNGRC1cXHUwNDJGXFx1MDQ2MFxcdTA0NjJcXHUwNDY0XFx1MDQ2NlxcdTA0NjhcXHUwNDZBXFx1MDQ2Q1xcdTA0NkVcXHUwNDcwXFx1MDQ3MlxcdTA0NzRcXHUwNDc2XFx1MDQ3OFxcdTA0N0FcXHUwNDdDXFx1MDQ3RVxcdTA0ODBcXHUwNDhBXFx1MDQ4Q1xcdTA0OEVcXHUwNDkwXFx1MDQ5MlxcdTA0OTRcXHUwNDk2XFx1MDQ5OFxcdTA0OUFcXHUwNDlDXFx1MDQ5RVxcdTA0QTBcXHUwNEEyXFx1MDRBNFxcdTA0QTZcXHUwNEE4XFx1MDRBQVxcdTA0QUNcXHUwNEFFXFx1MDRCMFxcdTA0QjJcXHUwNEI0XFx1MDRCNlxcdTA0QjhcXHUwNEJBXFx1MDRCQ1xcdTA0QkVcXHUwNEMwXFx1MDRDMVxcdTA0QzNcXHUwNEM1XFx1MDRDN1xcdTA0QzlcXHUwNENCXFx1MDRDRFxcdTA0RDBcXHUwNEQyXFx1MDRENFxcdTA0RDZcXHUwNEQ4XFx1MDREQVxcdTA0RENcXHUwNERFXFx1MDRFMFxcdTA0RTJcXHUwNEU0XFx1MDRFNlxcdTA0RThcXHUwNEVBXFx1MDRFQ1xcdTA0RUVcXHUwNEYwXFx1MDRGMlxcdTA0RjRcXHUwNEY2XFx1MDRGOFxcdTA0RkFcXHUwNEZDXFx1MDRGRVxcdTA1MDBcXHUwNTAyXFx1MDUwNFxcdTA1MDZcXHUwNTA4XFx1MDUwQVxcdTA1MENcXHUwNTBFXFx1MDUxMFxcdTA1MTJcXHUwNTE0XFx1MDUxNlxcdTA1MThcXHUwNTFBXFx1MDUxQ1xcdTA1MUVcXHUwNTIwXFx1MDUyMlxcdTA1MjRcXHUwNTI2XFx1MDUyOFxcdTA1MkFcXHUwNTJDXFx1MDUyRVxcdTA1MzEtXFx1MDU1NlxcdTA1ODdcXHUxMEEwLVxcdTEwQzVcXHUxMEM3XFx1MTBDRFxcdTFFMDBcXHUxRTAyXFx1MUUwNFxcdTFFMDZcXHUxRTA4XFx1MUUwQVxcdTFFMENcXHUxRTBFXFx1MUUxMFxcdTFFMTJcXHUxRTE0XFx1MUUxNlxcdTFFMThcXHUxRTFBXFx1MUUxQ1xcdTFFMUVcXHUxRTIwXFx1MUUyMlxcdTFFMjRcXHUxRTI2XFx1MUUyOFxcdTFFMkFcXHUxRTJDXFx1MUUyRVxcdTFFMzBcXHUxRTMyXFx1MUUzNFxcdTFFMzZcXHUxRTM4XFx1MUUzQVxcdTFFM0NcXHUxRTNFXFx1MUU0MFxcdTFFNDJcXHUxRTQ0XFx1MUU0NlxcdTFFNDhcXHUxRTRBXFx1MUU0Q1xcdTFFNEVcXHUxRTUwXFx1MUU1MlxcdTFFNTRcXHUxRTU2XFx1MUU1OFxcdTFFNUFcXHUxRTVDXFx1MUU1RVxcdTFFNjBcXHUxRTYyXFx1MUU2NFxcdTFFNjZcXHUxRTY4XFx1MUU2QVxcdTFFNkNcXHUxRTZFXFx1MUU3MFxcdTFFNzJcXHUxRTc0XFx1MUU3NlxcdTFFNzhcXHUxRTdBXFx1MUU3Q1xcdTFFN0VcXHUxRTgwXFx1MUU4MlxcdTFFODRcXHUxRTg2XFx1MUU4OFxcdTFFOEFcXHUxRThDXFx1MUU4RVxcdTFFOTBcXHUxRTkyXFx1MUU5NFxcdTFFOTYtXFx1MUU5QlxcdTFFOUVcXHUxRUEwXFx1MUVBMlxcdTFFQTRcXHUxRUE2XFx1MUVBOFxcdTFFQUFcXHUxRUFDXFx1MUVBRVxcdTFFQjBcXHUxRUIyXFx1MUVCNFxcdTFFQjZcXHUxRUI4XFx1MUVCQVxcdTFFQkNcXHUxRUJFXFx1MUVDMFxcdTFFQzJcXHUxRUM0XFx1MUVDNlxcdTFFQzhcXHUxRUNBXFx1MUVDQ1xcdTFFQ0VcXHUxRUQwXFx1MUVEMlxcdTFFRDRcXHUxRUQ2XFx1MUVEOFxcdTFFREFcXHUxRURDXFx1MUVERVxcdTFFRTBcXHUxRUUyXFx1MUVFNFxcdTFFRTZcXHUxRUU4XFx1MUVFQVxcdTFFRUNcXHUxRUVFXFx1MUVGMFxcdTFFRjJcXHUxRUY0XFx1MUVGNlxcdTFFRjhcXHUxRUZBXFx1MUVGQ1xcdTFFRkVcXHUxRjA4LVxcdTFGMEZcXHUxRjE4LVxcdTFGMURcXHUxRjI4LVxcdTFGMkZcXHUxRjM4LVxcdTFGM0ZcXHUxRjQ4LVxcdTFGNERcXHUxRjUwXFx1MUY1MlxcdTFGNTRcXHUxRjU2XFx1MUY1OVxcdTFGNUJcXHUxRjVEXFx1MUY1RlxcdTFGNjgtXFx1MUY2RlxcdTFGODAtXFx1MUZBRlxcdTFGQjItXFx1MUZCNFxcdTFGQjYtXFx1MUZCQ1xcdTFGQkVcXHUxRkMyLVxcdTFGQzRcXHUxRkM2LVxcdTFGQ0NcXHUxRkQyXFx1MUZEM1xcdTFGRDYtXFx1MUZEQlxcdTFGRTItXFx1MUZFNFxcdTFGRTYtXFx1MUZFQ1xcdTFGRjItXFx1MUZGNFxcdTFGRjYtXFx1MUZGQ1xcdTIxMjZcXHUyMTJBXFx1MjEyQlxcdTIxMzJcXHUyMTYwLVxcdTIxNkZcXHUyMTgzXFx1MjRCNi1cXHUyNENGXFx1MkMwMC1cXHUyQzJFXFx1MkM2MFxcdTJDNjItXFx1MkM2NFxcdTJDNjdcXHUyQzY5XFx1MkM2QlxcdTJDNkQtXFx1MkM3MFxcdTJDNzJcXHUyQzc1XFx1MkM3RS1cXHUyQzgwXFx1MkM4MlxcdTJDODRcXHUyQzg2XFx1MkM4OFxcdTJDOEFcXHUyQzhDXFx1MkM4RVxcdTJDOTBcXHUyQzkyXFx1MkM5NFxcdTJDOTZcXHUyQzk4XFx1MkM5QVxcdTJDOUNcXHUyQzlFXFx1MkNBMFxcdTJDQTJcXHUyQ0E0XFx1MkNBNlxcdTJDQThcXHUyQ0FBXFx1MkNBQ1xcdTJDQUVcXHUyQ0IwXFx1MkNCMlxcdTJDQjRcXHUyQ0I2XFx1MkNCOFxcdTJDQkFcXHUyQ0JDXFx1MkNCRVxcdTJDQzBcXHUyQ0MyXFx1MkNDNFxcdTJDQzZcXHUyQ0M4XFx1MkNDQVxcdTJDQ0NcXHUyQ0NFXFx1MkNEMFxcdTJDRDJcXHUyQ0Q0XFx1MkNENlxcdTJDRDhcXHUyQ0RBXFx1MkNEQ1xcdTJDREVcXHUyQ0UwXFx1MkNFMlxcdTJDRUJcXHUyQ0VEXFx1MkNGMlxcdUE2NDBcXHVBNjQyXFx1QTY0NFxcdUE2NDZcXHVBNjQ4XFx1QTY0QVxcdUE2NENcXHVBNjRFXFx1QTY1MFxcdUE2NTJcXHVBNjU0XFx1QTY1NlxcdUE2NThcXHVBNjVBXFx1QTY1Q1xcdUE2NUVcXHVBNjYwXFx1QTY2MlxcdUE2NjRcXHVBNjY2XFx1QTY2OFxcdUE2NkFcXHVBNjZDXFx1QTY4MFxcdUE2ODJcXHVBNjg0XFx1QTY4NlxcdUE2ODhcXHVBNjhBXFx1QTY4Q1xcdUE2OEVcXHVBNjkwXFx1QTY5MlxcdUE2OTRcXHVBNjk2XFx1QTY5OFxcdUE2OUFcXHVBNzIyXFx1QTcyNFxcdUE3MjZcXHVBNzI4XFx1QTcyQVxcdUE3MkNcXHVBNzJFXFx1QTczMlxcdUE3MzRcXHVBNzM2XFx1QTczOFxcdUE3M0FcXHVBNzNDXFx1QTczRVxcdUE3NDBcXHVBNzQyXFx1QTc0NFxcdUE3NDZcXHVBNzQ4XFx1QTc0QVxcdUE3NENcXHVBNzRFXFx1QTc1MFxcdUE3NTJcXHVBNzU0XFx1QTc1NlxcdUE3NThcXHVBNzVBXFx1QTc1Q1xcdUE3NUVcXHVBNzYwXFx1QTc2MlxcdUE3NjRcXHVBNzY2XFx1QTc2OFxcdUE3NkFcXHVBNzZDXFx1QTc2RVxcdUE3NzlcXHVBNzdCXFx1QTc3RFxcdUE3N0VcXHVBNzgwXFx1QTc4MlxcdUE3ODRcXHVBNzg2XFx1QTc4QlxcdUE3OERcXHVBNzkwXFx1QTc5MlxcdUE3OTZcXHVBNzk4XFx1QTc5QVxcdUE3OUNcXHVBNzlFXFx1QTdBMFxcdUE3QTJcXHVBN0E0XFx1QTdBNlxcdUE3QThcXHVBN0FBLVxcdUE3QURcXHVBN0IwXFx1QTdCMVxcdUZCMDAtXFx1RkIwNlxcdUZCMTMtXFx1RkIxN1xcdUZGMjEtXFx1RkYzQV18XFx1RDgwMVtcXHVEQzAwLVxcdURDMjddfFxcdUQ4MDZbXFx1RENBMC1cXHVEQ0JGXS9nO1xuXG52YXIgbWFwID0geydBJzonYScsJ0InOidiJywnQyc6J2MnLCdEJzonZCcsJ0UnOidlJywnRic6J2YnLCdHJzonZycsJ0gnOidoJywnSSc6J2knLCdKJzonaicsJ0snOidrJywnTCc6J2wnLCdNJzonbScsJ04nOiduJywnTyc6J28nLCdQJzoncCcsJ1EnOidxJywnUic6J3InLCdTJzoncycsJ1QnOid0JywnVSc6J3UnLCdWJzondicsJ1cnOid3JywnWCc6J3gnLCdZJzoneScsJ1onOid6JywnXFx4QjUnOidcXHUwM0JDJywnXFx4QzAnOidcXHhFMCcsJ1xceEMxJzonXFx4RTEnLCdcXHhDMic6J1xceEUyJywnXFx4QzMnOidcXHhFMycsJ1xceEM0JzonXFx4RTQnLCdcXHhDNSc6J1xceEU1JywnXFx4QzYnOidcXHhFNicsJ1xceEM3JzonXFx4RTcnLCdcXHhDOCc6J1xceEU4JywnXFx4QzknOidcXHhFOScsJ1xceENBJzonXFx4RUEnLCdcXHhDQic6J1xceEVCJywnXFx4Q0MnOidcXHhFQycsJ1xceENEJzonXFx4RUQnLCdcXHhDRSc6J1xceEVFJywnXFx4Q0YnOidcXHhFRicsJ1xceEQwJzonXFx4RjAnLCdcXHhEMSc6J1xceEYxJywnXFx4RDInOidcXHhGMicsJ1xceEQzJzonXFx4RjMnLCdcXHhENCc6J1xceEY0JywnXFx4RDUnOidcXHhGNScsJ1xceEQ2JzonXFx4RjYnLCdcXHhEOCc6J1xceEY4JywnXFx4RDknOidcXHhGOScsJ1xceERBJzonXFx4RkEnLCdcXHhEQic6J1xceEZCJywnXFx4REMnOidcXHhGQycsJ1xceEREJzonXFx4RkQnLCdcXHhERSc6J1xceEZFJywnXFx1MDEwMCc6J1xcdTAxMDEnLCdcXHUwMTAyJzonXFx1MDEwMycsJ1xcdTAxMDQnOidcXHUwMTA1JywnXFx1MDEwNic6J1xcdTAxMDcnLCdcXHUwMTA4JzonXFx1MDEwOScsJ1xcdTAxMEEnOidcXHUwMTBCJywnXFx1MDEwQyc6J1xcdTAxMEQnLCdcXHUwMTBFJzonXFx1MDEwRicsJ1xcdTAxMTAnOidcXHUwMTExJywnXFx1MDExMic6J1xcdTAxMTMnLCdcXHUwMTE0JzonXFx1MDExNScsJ1xcdTAxMTYnOidcXHUwMTE3JywnXFx1MDExOCc6J1xcdTAxMTknLCdcXHUwMTFBJzonXFx1MDExQicsJ1xcdTAxMUMnOidcXHUwMTFEJywnXFx1MDExRSc6J1xcdTAxMUYnLCdcXHUwMTIwJzonXFx1MDEyMScsJ1xcdTAxMjInOidcXHUwMTIzJywnXFx1MDEyNCc6J1xcdTAxMjUnLCdcXHUwMTI2JzonXFx1MDEyNycsJ1xcdTAxMjgnOidcXHUwMTI5JywnXFx1MDEyQSc6J1xcdTAxMkInLCdcXHUwMTJDJzonXFx1MDEyRCcsJ1xcdTAxMkUnOidcXHUwMTJGJywnXFx1MDEzMic6J1xcdTAxMzMnLCdcXHUwMTM0JzonXFx1MDEzNScsJ1xcdTAxMzYnOidcXHUwMTM3JywnXFx1MDEzOSc6J1xcdTAxM0EnLCdcXHUwMTNCJzonXFx1MDEzQycsJ1xcdTAxM0QnOidcXHUwMTNFJywnXFx1MDEzRic6J1xcdTAxNDAnLCdcXHUwMTQxJzonXFx1MDE0MicsJ1xcdTAxNDMnOidcXHUwMTQ0JywnXFx1MDE0NSc6J1xcdTAxNDYnLCdcXHUwMTQ3JzonXFx1MDE0OCcsJ1xcdTAxNEEnOidcXHUwMTRCJywnXFx1MDE0Qyc6J1xcdTAxNEQnLCdcXHUwMTRFJzonXFx1MDE0RicsJ1xcdTAxNTAnOidcXHUwMTUxJywnXFx1MDE1Mic6J1xcdTAxNTMnLCdcXHUwMTU0JzonXFx1MDE1NScsJ1xcdTAxNTYnOidcXHUwMTU3JywnXFx1MDE1OCc6J1xcdTAxNTknLCdcXHUwMTVBJzonXFx1MDE1QicsJ1xcdTAxNUMnOidcXHUwMTVEJywnXFx1MDE1RSc6J1xcdTAxNUYnLCdcXHUwMTYwJzonXFx1MDE2MScsJ1xcdTAxNjInOidcXHUwMTYzJywnXFx1MDE2NCc6J1xcdTAxNjUnLCdcXHUwMTY2JzonXFx1MDE2NycsJ1xcdTAxNjgnOidcXHUwMTY5JywnXFx1MDE2QSc6J1xcdTAxNkInLCdcXHUwMTZDJzonXFx1MDE2RCcsJ1xcdTAxNkUnOidcXHUwMTZGJywnXFx1MDE3MCc6J1xcdTAxNzEnLCdcXHUwMTcyJzonXFx1MDE3MycsJ1xcdTAxNzQnOidcXHUwMTc1JywnXFx1MDE3Nic6J1xcdTAxNzcnLCdcXHUwMTc4JzonXFx4RkYnLCdcXHUwMTc5JzonXFx1MDE3QScsJ1xcdTAxN0InOidcXHUwMTdDJywnXFx1MDE3RCc6J1xcdTAxN0UnLCdcXHUwMTdGJzoncycsJ1xcdTAxODEnOidcXHUwMjUzJywnXFx1MDE4Mic6J1xcdTAxODMnLCdcXHUwMTg0JzonXFx1MDE4NScsJ1xcdTAxODYnOidcXHUwMjU0JywnXFx1MDE4Nyc6J1xcdTAxODgnLCdcXHUwMTg5JzonXFx1MDI1NicsJ1xcdTAxOEEnOidcXHUwMjU3JywnXFx1MDE4Qic6J1xcdTAxOEMnLCdcXHUwMThFJzonXFx1MDFERCcsJ1xcdTAxOEYnOidcXHUwMjU5JywnXFx1MDE5MCc6J1xcdTAyNUInLCdcXHUwMTkxJzonXFx1MDE5MicsJ1xcdTAxOTMnOidcXHUwMjYwJywnXFx1MDE5NCc6J1xcdTAyNjMnLCdcXHUwMTk2JzonXFx1MDI2OScsJ1xcdTAxOTcnOidcXHUwMjY4JywnXFx1MDE5OCc6J1xcdTAxOTknLCdcXHUwMTlDJzonXFx1MDI2RicsJ1xcdTAxOUQnOidcXHUwMjcyJywnXFx1MDE5Ric6J1xcdTAyNzUnLCdcXHUwMUEwJzonXFx1MDFBMScsJ1xcdTAxQTInOidcXHUwMUEzJywnXFx1MDFBNCc6J1xcdTAxQTUnLCdcXHUwMUE2JzonXFx1MDI4MCcsJ1xcdTAxQTcnOidcXHUwMUE4JywnXFx1MDFBOSc6J1xcdTAyODMnLCdcXHUwMUFDJzonXFx1MDFBRCcsJ1xcdTAxQUUnOidcXHUwMjg4JywnXFx1MDFBRic6J1xcdTAxQjAnLCdcXHUwMUIxJzonXFx1MDI4QScsJ1xcdTAxQjInOidcXHUwMjhCJywnXFx1MDFCMyc6J1xcdTAxQjQnLCdcXHUwMUI1JzonXFx1MDFCNicsJ1xcdTAxQjcnOidcXHUwMjkyJywnXFx1MDFCOCc6J1xcdTAxQjknLCdcXHUwMUJDJzonXFx1MDFCRCcsJ1xcdTAxQzQnOidcXHUwMUM2JywnXFx1MDFDNSc6J1xcdTAxQzYnLCdcXHUwMUM3JzonXFx1MDFDOScsJ1xcdTAxQzgnOidcXHUwMUM5JywnXFx1MDFDQSc6J1xcdTAxQ0MnLCdcXHUwMUNCJzonXFx1MDFDQycsJ1xcdTAxQ0QnOidcXHUwMUNFJywnXFx1MDFDRic6J1xcdTAxRDAnLCdcXHUwMUQxJzonXFx1MDFEMicsJ1xcdTAxRDMnOidcXHUwMUQ0JywnXFx1MDFENSc6J1xcdTAxRDYnLCdcXHUwMUQ3JzonXFx1MDFEOCcsJ1xcdTAxRDknOidcXHUwMURBJywnXFx1MDFEQic6J1xcdTAxREMnLCdcXHUwMURFJzonXFx1MDFERicsJ1xcdTAxRTAnOidcXHUwMUUxJywnXFx1MDFFMic6J1xcdTAxRTMnLCdcXHUwMUU0JzonXFx1MDFFNScsJ1xcdTAxRTYnOidcXHUwMUU3JywnXFx1MDFFOCc6J1xcdTAxRTknLCdcXHUwMUVBJzonXFx1MDFFQicsJ1xcdTAxRUMnOidcXHUwMUVEJywnXFx1MDFFRSc6J1xcdTAxRUYnLCdcXHUwMUYxJzonXFx1MDFGMycsJ1xcdTAxRjInOidcXHUwMUYzJywnXFx1MDFGNCc6J1xcdTAxRjUnLCdcXHUwMUY2JzonXFx1MDE5NScsJ1xcdTAxRjcnOidcXHUwMUJGJywnXFx1MDFGOCc6J1xcdTAxRjknLCdcXHUwMUZBJzonXFx1MDFGQicsJ1xcdTAxRkMnOidcXHUwMUZEJywnXFx1MDFGRSc6J1xcdTAxRkYnLCdcXHUwMjAwJzonXFx1MDIwMScsJ1xcdTAyMDInOidcXHUwMjAzJywnXFx1MDIwNCc6J1xcdTAyMDUnLCdcXHUwMjA2JzonXFx1MDIwNycsJ1xcdTAyMDgnOidcXHUwMjA5JywnXFx1MDIwQSc6J1xcdTAyMEInLCdcXHUwMjBDJzonXFx1MDIwRCcsJ1xcdTAyMEUnOidcXHUwMjBGJywnXFx1MDIxMCc6J1xcdTAyMTEnLCdcXHUwMjEyJzonXFx1MDIxMycsJ1xcdTAyMTQnOidcXHUwMjE1JywnXFx1MDIxNic6J1xcdTAyMTcnLCdcXHUwMjE4JzonXFx1MDIxOScsJ1xcdTAyMUEnOidcXHUwMjFCJywnXFx1MDIxQyc6J1xcdTAyMUQnLCdcXHUwMjFFJzonXFx1MDIxRicsJ1xcdTAyMjAnOidcXHUwMTlFJywnXFx1MDIyMic6J1xcdTAyMjMnLCdcXHUwMjI0JzonXFx1MDIyNScsJ1xcdTAyMjYnOidcXHUwMjI3JywnXFx1MDIyOCc6J1xcdTAyMjknLCdcXHUwMjJBJzonXFx1MDIyQicsJ1xcdTAyMkMnOidcXHUwMjJEJywnXFx1MDIyRSc6J1xcdTAyMkYnLCdcXHUwMjMwJzonXFx1MDIzMScsJ1xcdTAyMzInOidcXHUwMjMzJywnXFx1MDIzQSc6J1xcdTJDNjUnLCdcXHUwMjNCJzonXFx1MDIzQycsJ1xcdTAyM0QnOidcXHUwMTlBJywnXFx1MDIzRSc6J1xcdTJDNjYnLCdcXHUwMjQxJzonXFx1MDI0MicsJ1xcdTAyNDMnOidcXHUwMTgwJywnXFx1MDI0NCc6J1xcdTAyODknLCdcXHUwMjQ1JzonXFx1MDI4QycsJ1xcdTAyNDYnOidcXHUwMjQ3JywnXFx1MDI0OCc6J1xcdTAyNDknLCdcXHUwMjRBJzonXFx1MDI0QicsJ1xcdTAyNEMnOidcXHUwMjREJywnXFx1MDI0RSc6J1xcdTAyNEYnLCdcXHUwMzQ1JzonXFx1MDNCOScsJ1xcdTAzNzAnOidcXHUwMzcxJywnXFx1MDM3Mic6J1xcdTAzNzMnLCdcXHUwMzc2JzonXFx1MDM3NycsJ1xcdTAzN0YnOidcXHUwM0YzJywnXFx1MDM4Nic6J1xcdTAzQUMnLCdcXHUwMzg4JzonXFx1MDNBRCcsJ1xcdTAzODknOidcXHUwM0FFJywnXFx1MDM4QSc6J1xcdTAzQUYnLCdcXHUwMzhDJzonXFx1MDNDQycsJ1xcdTAzOEUnOidcXHUwM0NEJywnXFx1MDM4Ric6J1xcdTAzQ0UnLCdcXHUwMzkxJzonXFx1MDNCMScsJ1xcdTAzOTInOidcXHUwM0IyJywnXFx1MDM5Myc6J1xcdTAzQjMnLCdcXHUwMzk0JzonXFx1MDNCNCcsJ1xcdTAzOTUnOidcXHUwM0I1JywnXFx1MDM5Nic6J1xcdTAzQjYnLCdcXHUwMzk3JzonXFx1MDNCNycsJ1xcdTAzOTgnOidcXHUwM0I4JywnXFx1MDM5OSc6J1xcdTAzQjknLCdcXHUwMzlBJzonXFx1MDNCQScsJ1xcdTAzOUInOidcXHUwM0JCJywnXFx1MDM5Qyc6J1xcdTAzQkMnLCdcXHUwMzlEJzonXFx1MDNCRCcsJ1xcdTAzOUUnOidcXHUwM0JFJywnXFx1MDM5Ric6J1xcdTAzQkYnLCdcXHUwM0EwJzonXFx1MDNDMCcsJ1xcdTAzQTEnOidcXHUwM0MxJywnXFx1MDNBMyc6J1xcdTAzQzMnLCdcXHUwM0E0JzonXFx1MDNDNCcsJ1xcdTAzQTUnOidcXHUwM0M1JywnXFx1MDNBNic6J1xcdTAzQzYnLCdcXHUwM0E3JzonXFx1MDNDNycsJ1xcdTAzQTgnOidcXHUwM0M4JywnXFx1MDNBOSc6J1xcdTAzQzknLCdcXHUwM0FBJzonXFx1MDNDQScsJ1xcdTAzQUInOidcXHUwM0NCJywnXFx1MDNDMic6J1xcdTAzQzMnLCdcXHUwM0NGJzonXFx1MDNENycsJ1xcdTAzRDAnOidcXHUwM0IyJywnXFx1MDNEMSc6J1xcdTAzQjgnLCdcXHUwM0Q1JzonXFx1MDNDNicsJ1xcdTAzRDYnOidcXHUwM0MwJywnXFx1MDNEOCc6J1xcdTAzRDknLCdcXHUwM0RBJzonXFx1MDNEQicsJ1xcdTAzREMnOidcXHUwM0REJywnXFx1MDNERSc6J1xcdTAzREYnLCdcXHUwM0UwJzonXFx1MDNFMScsJ1xcdTAzRTInOidcXHUwM0UzJywnXFx1MDNFNCc6J1xcdTAzRTUnLCdcXHUwM0U2JzonXFx1MDNFNycsJ1xcdTAzRTgnOidcXHUwM0U5JywnXFx1MDNFQSc6J1xcdTAzRUInLCdcXHUwM0VDJzonXFx1MDNFRCcsJ1xcdTAzRUUnOidcXHUwM0VGJywnXFx1MDNGMCc6J1xcdTAzQkEnLCdcXHUwM0YxJzonXFx1MDNDMScsJ1xcdTAzRjQnOidcXHUwM0I4JywnXFx1MDNGNSc6J1xcdTAzQjUnLCdcXHUwM0Y3JzonXFx1MDNGOCcsJ1xcdTAzRjknOidcXHUwM0YyJywnXFx1MDNGQSc6J1xcdTAzRkInLCdcXHUwM0ZEJzonXFx1MDM3QicsJ1xcdTAzRkUnOidcXHUwMzdDJywnXFx1MDNGRic6J1xcdTAzN0QnLCdcXHUwNDAwJzonXFx1MDQ1MCcsJ1xcdTA0MDEnOidcXHUwNDUxJywnXFx1MDQwMic6J1xcdTA0NTInLCdcXHUwNDAzJzonXFx1MDQ1MycsJ1xcdTA0MDQnOidcXHUwNDU0JywnXFx1MDQwNSc6J1xcdTA0NTUnLCdcXHUwNDA2JzonXFx1MDQ1NicsJ1xcdTA0MDcnOidcXHUwNDU3JywnXFx1MDQwOCc6J1xcdTA0NTgnLCdcXHUwNDA5JzonXFx1MDQ1OScsJ1xcdTA0MEEnOidcXHUwNDVBJywnXFx1MDQwQic6J1xcdTA0NUInLCdcXHUwNDBDJzonXFx1MDQ1QycsJ1xcdTA0MEQnOidcXHUwNDVEJywnXFx1MDQwRSc6J1xcdTA0NUUnLCdcXHUwNDBGJzonXFx1MDQ1RicsJ1xcdTA0MTAnOidcXHUwNDMwJywnXFx1MDQxMSc6J1xcdTA0MzEnLCdcXHUwNDEyJzonXFx1MDQzMicsJ1xcdTA0MTMnOidcXHUwNDMzJywnXFx1MDQxNCc6J1xcdTA0MzQnLCdcXHUwNDE1JzonXFx1MDQzNScsJ1xcdTA0MTYnOidcXHUwNDM2JywnXFx1MDQxNyc6J1xcdTA0MzcnLCdcXHUwNDE4JzonXFx1MDQzOCcsJ1xcdTA0MTknOidcXHUwNDM5JywnXFx1MDQxQSc6J1xcdTA0M0EnLCdcXHUwNDFCJzonXFx1MDQzQicsJ1xcdTA0MUMnOidcXHUwNDNDJywnXFx1MDQxRCc6J1xcdTA0M0QnLCdcXHUwNDFFJzonXFx1MDQzRScsJ1xcdTA0MUYnOidcXHUwNDNGJywnXFx1MDQyMCc6J1xcdTA0NDAnLCdcXHUwNDIxJzonXFx1MDQ0MScsJ1xcdTA0MjInOidcXHUwNDQyJywnXFx1MDQyMyc6J1xcdTA0NDMnLCdcXHUwNDI0JzonXFx1MDQ0NCcsJ1xcdTA0MjUnOidcXHUwNDQ1JywnXFx1MDQyNic6J1xcdTA0NDYnLCdcXHUwNDI3JzonXFx1MDQ0NycsJ1xcdTA0MjgnOidcXHUwNDQ4JywnXFx1MDQyOSc6J1xcdTA0NDknLCdcXHUwNDJBJzonXFx1MDQ0QScsJ1xcdTA0MkInOidcXHUwNDRCJywnXFx1MDQyQyc6J1xcdTA0NEMnLCdcXHUwNDJEJzonXFx1MDQ0RCcsJ1xcdTA0MkUnOidcXHUwNDRFJywnXFx1MDQyRic6J1xcdTA0NEYnLCdcXHUwNDYwJzonXFx1MDQ2MScsJ1xcdTA0NjInOidcXHUwNDYzJywnXFx1MDQ2NCc6J1xcdTA0NjUnLCdcXHUwNDY2JzonXFx1MDQ2NycsJ1xcdTA0NjgnOidcXHUwNDY5JywnXFx1MDQ2QSc6J1xcdTA0NkInLCdcXHUwNDZDJzonXFx1MDQ2RCcsJ1xcdTA0NkUnOidcXHUwNDZGJywnXFx1MDQ3MCc6J1xcdTA0NzEnLCdcXHUwNDcyJzonXFx1MDQ3MycsJ1xcdTA0NzQnOidcXHUwNDc1JywnXFx1MDQ3Nic6J1xcdTA0NzcnLCdcXHUwNDc4JzonXFx1MDQ3OScsJ1xcdTA0N0EnOidcXHUwNDdCJywnXFx1MDQ3Qyc6J1xcdTA0N0QnLCdcXHUwNDdFJzonXFx1MDQ3RicsJ1xcdTA0ODAnOidcXHUwNDgxJywnXFx1MDQ4QSc6J1xcdTA0OEInLCdcXHUwNDhDJzonXFx1MDQ4RCcsJ1xcdTA0OEUnOidcXHUwNDhGJywnXFx1MDQ5MCc6J1xcdTA0OTEnLCdcXHUwNDkyJzonXFx1MDQ5MycsJ1xcdTA0OTQnOidcXHUwNDk1JywnXFx1MDQ5Nic6J1xcdTA0OTcnLCdcXHUwNDk4JzonXFx1MDQ5OScsJ1xcdTA0OUEnOidcXHUwNDlCJywnXFx1MDQ5Qyc6J1xcdTA0OUQnLCdcXHUwNDlFJzonXFx1MDQ5RicsJ1xcdTA0QTAnOidcXHUwNEExJywnXFx1MDRBMic6J1xcdTA0QTMnLCdcXHUwNEE0JzonXFx1MDRBNScsJ1xcdTA0QTYnOidcXHUwNEE3JywnXFx1MDRBOCc6J1xcdTA0QTknLCdcXHUwNEFBJzonXFx1MDRBQicsJ1xcdTA0QUMnOidcXHUwNEFEJywnXFx1MDRBRSc6J1xcdTA0QUYnLCdcXHUwNEIwJzonXFx1MDRCMScsJ1xcdTA0QjInOidcXHUwNEIzJywnXFx1MDRCNCc6J1xcdTA0QjUnLCdcXHUwNEI2JzonXFx1MDRCNycsJ1xcdTA0QjgnOidcXHUwNEI5JywnXFx1MDRCQSc6J1xcdTA0QkInLCdcXHUwNEJDJzonXFx1MDRCRCcsJ1xcdTA0QkUnOidcXHUwNEJGJywnXFx1MDRDMCc6J1xcdTA0Q0YnLCdcXHUwNEMxJzonXFx1MDRDMicsJ1xcdTA0QzMnOidcXHUwNEM0JywnXFx1MDRDNSc6J1xcdTA0QzYnLCdcXHUwNEM3JzonXFx1MDRDOCcsJ1xcdTA0QzknOidcXHUwNENBJywnXFx1MDRDQic6J1xcdTA0Q0MnLCdcXHUwNENEJzonXFx1MDRDRScsJ1xcdTA0RDAnOidcXHUwNEQxJywnXFx1MDREMic6J1xcdTA0RDMnLCdcXHUwNEQ0JzonXFx1MDRENScsJ1xcdTA0RDYnOidcXHUwNEQ3JywnXFx1MDREOCc6J1xcdTA0RDknLCdcXHUwNERBJzonXFx1MDREQicsJ1xcdTA0REMnOidcXHUwNEREJywnXFx1MDRERSc6J1xcdTA0REYnLCdcXHUwNEUwJzonXFx1MDRFMScsJ1xcdTA0RTInOidcXHUwNEUzJywnXFx1MDRFNCc6J1xcdTA0RTUnLCdcXHUwNEU2JzonXFx1MDRFNycsJ1xcdTA0RTgnOidcXHUwNEU5JywnXFx1MDRFQSc6J1xcdTA0RUInLCdcXHUwNEVDJzonXFx1MDRFRCcsJ1xcdTA0RUUnOidcXHUwNEVGJywnXFx1MDRGMCc6J1xcdTA0RjEnLCdcXHUwNEYyJzonXFx1MDRGMycsJ1xcdTA0RjQnOidcXHUwNEY1JywnXFx1MDRGNic6J1xcdTA0RjcnLCdcXHUwNEY4JzonXFx1MDRGOScsJ1xcdTA0RkEnOidcXHUwNEZCJywnXFx1MDRGQyc6J1xcdTA0RkQnLCdcXHUwNEZFJzonXFx1MDRGRicsJ1xcdTA1MDAnOidcXHUwNTAxJywnXFx1MDUwMic6J1xcdTA1MDMnLCdcXHUwNTA0JzonXFx1MDUwNScsJ1xcdTA1MDYnOidcXHUwNTA3JywnXFx1MDUwOCc6J1xcdTA1MDknLCdcXHUwNTBBJzonXFx1MDUwQicsJ1xcdTA1MEMnOidcXHUwNTBEJywnXFx1MDUwRSc6J1xcdTA1MEYnLCdcXHUwNTEwJzonXFx1MDUxMScsJ1xcdTA1MTInOidcXHUwNTEzJywnXFx1MDUxNCc6J1xcdTA1MTUnLCdcXHUwNTE2JzonXFx1MDUxNycsJ1xcdTA1MTgnOidcXHUwNTE5JywnXFx1MDUxQSc6J1xcdTA1MUInLCdcXHUwNTFDJzonXFx1MDUxRCcsJ1xcdTA1MUUnOidcXHUwNTFGJywnXFx1MDUyMCc6J1xcdTA1MjEnLCdcXHUwNTIyJzonXFx1MDUyMycsJ1xcdTA1MjQnOidcXHUwNTI1JywnXFx1MDUyNic6J1xcdTA1MjcnLCdcXHUwNTI4JzonXFx1MDUyOScsJ1xcdTA1MkEnOidcXHUwNTJCJywnXFx1MDUyQyc6J1xcdTA1MkQnLCdcXHUwNTJFJzonXFx1MDUyRicsJ1xcdTA1MzEnOidcXHUwNTYxJywnXFx1MDUzMic6J1xcdTA1NjInLCdcXHUwNTMzJzonXFx1MDU2MycsJ1xcdTA1MzQnOidcXHUwNTY0JywnXFx1MDUzNSc6J1xcdTA1NjUnLCdcXHUwNTM2JzonXFx1MDU2NicsJ1xcdTA1MzcnOidcXHUwNTY3JywnXFx1MDUzOCc6J1xcdTA1NjgnLCdcXHUwNTM5JzonXFx1MDU2OScsJ1xcdTA1M0EnOidcXHUwNTZBJywnXFx1MDUzQic6J1xcdTA1NkInLCdcXHUwNTNDJzonXFx1MDU2QycsJ1xcdTA1M0QnOidcXHUwNTZEJywnXFx1MDUzRSc6J1xcdTA1NkUnLCdcXHUwNTNGJzonXFx1MDU2RicsJ1xcdTA1NDAnOidcXHUwNTcwJywnXFx1MDU0MSc6J1xcdTA1NzEnLCdcXHUwNTQyJzonXFx1MDU3MicsJ1xcdTA1NDMnOidcXHUwNTczJywnXFx1MDU0NCc6J1xcdTA1NzQnLCdcXHUwNTQ1JzonXFx1MDU3NScsJ1xcdTA1NDYnOidcXHUwNTc2JywnXFx1MDU0Nyc6J1xcdTA1NzcnLCdcXHUwNTQ4JzonXFx1MDU3OCcsJ1xcdTA1NDknOidcXHUwNTc5JywnXFx1MDU0QSc6J1xcdTA1N0EnLCdcXHUwNTRCJzonXFx1MDU3QicsJ1xcdTA1NEMnOidcXHUwNTdDJywnXFx1MDU0RCc6J1xcdTA1N0QnLCdcXHUwNTRFJzonXFx1MDU3RScsJ1xcdTA1NEYnOidcXHUwNTdGJywnXFx1MDU1MCc6J1xcdTA1ODAnLCdcXHUwNTUxJzonXFx1MDU4MScsJ1xcdTA1NTInOidcXHUwNTgyJywnXFx1MDU1Myc6J1xcdTA1ODMnLCdcXHUwNTU0JzonXFx1MDU4NCcsJ1xcdTA1NTUnOidcXHUwNTg1JywnXFx1MDU1Nic6J1xcdTA1ODYnLCdcXHUxMEEwJzonXFx1MkQwMCcsJ1xcdTEwQTEnOidcXHUyRDAxJywnXFx1MTBBMic6J1xcdTJEMDInLCdcXHUxMEEzJzonXFx1MkQwMycsJ1xcdTEwQTQnOidcXHUyRDA0JywnXFx1MTBBNSc6J1xcdTJEMDUnLCdcXHUxMEE2JzonXFx1MkQwNicsJ1xcdTEwQTcnOidcXHUyRDA3JywnXFx1MTBBOCc6J1xcdTJEMDgnLCdcXHUxMEE5JzonXFx1MkQwOScsJ1xcdTEwQUEnOidcXHUyRDBBJywnXFx1MTBBQic6J1xcdTJEMEInLCdcXHUxMEFDJzonXFx1MkQwQycsJ1xcdTEwQUQnOidcXHUyRDBEJywnXFx1MTBBRSc6J1xcdTJEMEUnLCdcXHUxMEFGJzonXFx1MkQwRicsJ1xcdTEwQjAnOidcXHUyRDEwJywnXFx1MTBCMSc6J1xcdTJEMTEnLCdcXHUxMEIyJzonXFx1MkQxMicsJ1xcdTEwQjMnOidcXHUyRDEzJywnXFx1MTBCNCc6J1xcdTJEMTQnLCdcXHUxMEI1JzonXFx1MkQxNScsJ1xcdTEwQjYnOidcXHUyRDE2JywnXFx1MTBCNyc6J1xcdTJEMTcnLCdcXHUxMEI4JzonXFx1MkQxOCcsJ1xcdTEwQjknOidcXHUyRDE5JywnXFx1MTBCQSc6J1xcdTJEMUEnLCdcXHUxMEJCJzonXFx1MkQxQicsJ1xcdTEwQkMnOidcXHUyRDFDJywnXFx1MTBCRCc6J1xcdTJEMUQnLCdcXHUxMEJFJzonXFx1MkQxRScsJ1xcdTEwQkYnOidcXHUyRDFGJywnXFx1MTBDMCc6J1xcdTJEMjAnLCdcXHUxMEMxJzonXFx1MkQyMScsJ1xcdTEwQzInOidcXHUyRDIyJywnXFx1MTBDMyc6J1xcdTJEMjMnLCdcXHUxMEM0JzonXFx1MkQyNCcsJ1xcdTEwQzUnOidcXHUyRDI1JywnXFx1MTBDNyc6J1xcdTJEMjcnLCdcXHUxMENEJzonXFx1MkQyRCcsJ1xcdTFFMDAnOidcXHUxRTAxJywnXFx1MUUwMic6J1xcdTFFMDMnLCdcXHUxRTA0JzonXFx1MUUwNScsJ1xcdTFFMDYnOidcXHUxRTA3JywnXFx1MUUwOCc6J1xcdTFFMDknLCdcXHUxRTBBJzonXFx1MUUwQicsJ1xcdTFFMEMnOidcXHUxRTBEJywnXFx1MUUwRSc6J1xcdTFFMEYnLCdcXHUxRTEwJzonXFx1MUUxMScsJ1xcdTFFMTInOidcXHUxRTEzJywnXFx1MUUxNCc6J1xcdTFFMTUnLCdcXHUxRTE2JzonXFx1MUUxNycsJ1xcdTFFMTgnOidcXHUxRTE5JywnXFx1MUUxQSc6J1xcdTFFMUInLCdcXHUxRTFDJzonXFx1MUUxRCcsJ1xcdTFFMUUnOidcXHUxRTFGJywnXFx1MUUyMCc6J1xcdTFFMjEnLCdcXHUxRTIyJzonXFx1MUUyMycsJ1xcdTFFMjQnOidcXHUxRTI1JywnXFx1MUUyNic6J1xcdTFFMjcnLCdcXHUxRTI4JzonXFx1MUUyOScsJ1xcdTFFMkEnOidcXHUxRTJCJywnXFx1MUUyQyc6J1xcdTFFMkQnLCdcXHUxRTJFJzonXFx1MUUyRicsJ1xcdTFFMzAnOidcXHUxRTMxJywnXFx1MUUzMic6J1xcdTFFMzMnLCdcXHUxRTM0JzonXFx1MUUzNScsJ1xcdTFFMzYnOidcXHUxRTM3JywnXFx1MUUzOCc6J1xcdTFFMzknLCdcXHUxRTNBJzonXFx1MUUzQicsJ1xcdTFFM0MnOidcXHUxRTNEJywnXFx1MUUzRSc6J1xcdTFFM0YnLCdcXHUxRTQwJzonXFx1MUU0MScsJ1xcdTFFNDInOidcXHUxRTQzJywnXFx1MUU0NCc6J1xcdTFFNDUnLCdcXHUxRTQ2JzonXFx1MUU0NycsJ1xcdTFFNDgnOidcXHUxRTQ5JywnXFx1MUU0QSc6J1xcdTFFNEInLCdcXHUxRTRDJzonXFx1MUU0RCcsJ1xcdTFFNEUnOidcXHUxRTRGJywnXFx1MUU1MCc6J1xcdTFFNTEnLCdcXHUxRTUyJzonXFx1MUU1MycsJ1xcdTFFNTQnOidcXHUxRTU1JywnXFx1MUU1Nic6J1xcdTFFNTcnLCdcXHUxRTU4JzonXFx1MUU1OScsJ1xcdTFFNUEnOidcXHUxRTVCJywnXFx1MUU1Qyc6J1xcdTFFNUQnLCdcXHUxRTVFJzonXFx1MUU1RicsJ1xcdTFFNjAnOidcXHUxRTYxJywnXFx1MUU2Mic6J1xcdTFFNjMnLCdcXHUxRTY0JzonXFx1MUU2NScsJ1xcdTFFNjYnOidcXHUxRTY3JywnXFx1MUU2OCc6J1xcdTFFNjknLCdcXHUxRTZBJzonXFx1MUU2QicsJ1xcdTFFNkMnOidcXHUxRTZEJywnXFx1MUU2RSc6J1xcdTFFNkYnLCdcXHUxRTcwJzonXFx1MUU3MScsJ1xcdTFFNzInOidcXHUxRTczJywnXFx1MUU3NCc6J1xcdTFFNzUnLCdcXHUxRTc2JzonXFx1MUU3NycsJ1xcdTFFNzgnOidcXHUxRTc5JywnXFx1MUU3QSc6J1xcdTFFN0InLCdcXHUxRTdDJzonXFx1MUU3RCcsJ1xcdTFFN0UnOidcXHUxRTdGJywnXFx1MUU4MCc6J1xcdTFFODEnLCdcXHUxRTgyJzonXFx1MUU4MycsJ1xcdTFFODQnOidcXHUxRTg1JywnXFx1MUU4Nic6J1xcdTFFODcnLCdcXHUxRTg4JzonXFx1MUU4OScsJ1xcdTFFOEEnOidcXHUxRThCJywnXFx1MUU4Qyc6J1xcdTFFOEQnLCdcXHUxRThFJzonXFx1MUU4RicsJ1xcdTFFOTAnOidcXHUxRTkxJywnXFx1MUU5Mic6J1xcdTFFOTMnLCdcXHUxRTk0JzonXFx1MUU5NScsJ1xcdTFFOUInOidcXHUxRTYxJywnXFx1MUVBMCc6J1xcdTFFQTEnLCdcXHUxRUEyJzonXFx1MUVBMycsJ1xcdTFFQTQnOidcXHUxRUE1JywnXFx1MUVBNic6J1xcdTFFQTcnLCdcXHUxRUE4JzonXFx1MUVBOScsJ1xcdTFFQUEnOidcXHUxRUFCJywnXFx1MUVBQyc6J1xcdTFFQUQnLCdcXHUxRUFFJzonXFx1MUVBRicsJ1xcdTFFQjAnOidcXHUxRUIxJywnXFx1MUVCMic6J1xcdTFFQjMnLCdcXHUxRUI0JzonXFx1MUVCNScsJ1xcdTFFQjYnOidcXHUxRUI3JywnXFx1MUVCOCc6J1xcdTFFQjknLCdcXHUxRUJBJzonXFx1MUVCQicsJ1xcdTFFQkMnOidcXHUxRUJEJywnXFx1MUVCRSc6J1xcdTFFQkYnLCdcXHUxRUMwJzonXFx1MUVDMScsJ1xcdTFFQzInOidcXHUxRUMzJywnXFx1MUVDNCc6J1xcdTFFQzUnLCdcXHUxRUM2JzonXFx1MUVDNycsJ1xcdTFFQzgnOidcXHUxRUM5JywnXFx1MUVDQSc6J1xcdTFFQ0InLCdcXHUxRUNDJzonXFx1MUVDRCcsJ1xcdTFFQ0UnOidcXHUxRUNGJywnXFx1MUVEMCc6J1xcdTFFRDEnLCdcXHUxRUQyJzonXFx1MUVEMycsJ1xcdTFFRDQnOidcXHUxRUQ1JywnXFx1MUVENic6J1xcdTFFRDcnLCdcXHUxRUQ4JzonXFx1MUVEOScsJ1xcdTFFREEnOidcXHUxRURCJywnXFx1MUVEQyc6J1xcdTFFREQnLCdcXHUxRURFJzonXFx1MUVERicsJ1xcdTFFRTAnOidcXHUxRUUxJywnXFx1MUVFMic6J1xcdTFFRTMnLCdcXHUxRUU0JzonXFx1MUVFNScsJ1xcdTFFRTYnOidcXHUxRUU3JywnXFx1MUVFOCc6J1xcdTFFRTknLCdcXHUxRUVBJzonXFx1MUVFQicsJ1xcdTFFRUMnOidcXHUxRUVEJywnXFx1MUVFRSc6J1xcdTFFRUYnLCdcXHUxRUYwJzonXFx1MUVGMScsJ1xcdTFFRjInOidcXHUxRUYzJywnXFx1MUVGNCc6J1xcdTFFRjUnLCdcXHUxRUY2JzonXFx1MUVGNycsJ1xcdTFFRjgnOidcXHUxRUY5JywnXFx1MUVGQSc6J1xcdTFFRkInLCdcXHUxRUZDJzonXFx1MUVGRCcsJ1xcdTFFRkUnOidcXHUxRUZGJywnXFx1MUYwOCc6J1xcdTFGMDAnLCdcXHUxRjA5JzonXFx1MUYwMScsJ1xcdTFGMEEnOidcXHUxRjAyJywnXFx1MUYwQic6J1xcdTFGMDMnLCdcXHUxRjBDJzonXFx1MUYwNCcsJ1xcdTFGMEQnOidcXHUxRjA1JywnXFx1MUYwRSc6J1xcdTFGMDYnLCdcXHUxRjBGJzonXFx1MUYwNycsJ1xcdTFGMTgnOidcXHUxRjEwJywnXFx1MUYxOSc6J1xcdTFGMTEnLCdcXHUxRjFBJzonXFx1MUYxMicsJ1xcdTFGMUInOidcXHUxRjEzJywnXFx1MUYxQyc6J1xcdTFGMTQnLCdcXHUxRjFEJzonXFx1MUYxNScsJ1xcdTFGMjgnOidcXHUxRjIwJywnXFx1MUYyOSc6J1xcdTFGMjEnLCdcXHUxRjJBJzonXFx1MUYyMicsJ1xcdTFGMkInOidcXHUxRjIzJywnXFx1MUYyQyc6J1xcdTFGMjQnLCdcXHUxRjJEJzonXFx1MUYyNScsJ1xcdTFGMkUnOidcXHUxRjI2JywnXFx1MUYyRic6J1xcdTFGMjcnLCdcXHUxRjM4JzonXFx1MUYzMCcsJ1xcdTFGMzknOidcXHUxRjMxJywnXFx1MUYzQSc6J1xcdTFGMzInLCdcXHUxRjNCJzonXFx1MUYzMycsJ1xcdTFGM0MnOidcXHUxRjM0JywnXFx1MUYzRCc6J1xcdTFGMzUnLCdcXHUxRjNFJzonXFx1MUYzNicsJ1xcdTFGM0YnOidcXHUxRjM3JywnXFx1MUY0OCc6J1xcdTFGNDAnLCdcXHUxRjQ5JzonXFx1MUY0MScsJ1xcdTFGNEEnOidcXHUxRjQyJywnXFx1MUY0Qic6J1xcdTFGNDMnLCdcXHUxRjRDJzonXFx1MUY0NCcsJ1xcdTFGNEQnOidcXHUxRjQ1JywnXFx1MUY1OSc6J1xcdTFGNTEnLCdcXHUxRjVCJzonXFx1MUY1MycsJ1xcdTFGNUQnOidcXHUxRjU1JywnXFx1MUY1Ric6J1xcdTFGNTcnLCdcXHUxRjY4JzonXFx1MUY2MCcsJ1xcdTFGNjknOidcXHUxRjYxJywnXFx1MUY2QSc6J1xcdTFGNjInLCdcXHUxRjZCJzonXFx1MUY2MycsJ1xcdTFGNkMnOidcXHUxRjY0JywnXFx1MUY2RCc6J1xcdTFGNjUnLCdcXHUxRjZFJzonXFx1MUY2NicsJ1xcdTFGNkYnOidcXHUxRjY3JywnXFx1MUZCOCc6J1xcdTFGQjAnLCdcXHUxRkI5JzonXFx1MUZCMScsJ1xcdTFGQkEnOidcXHUxRjcwJywnXFx1MUZCQic6J1xcdTFGNzEnLCdcXHUxRkJFJzonXFx1MDNCOScsJ1xcdTFGQzgnOidcXHUxRjcyJywnXFx1MUZDOSc6J1xcdTFGNzMnLCdcXHUxRkNBJzonXFx1MUY3NCcsJ1xcdTFGQ0InOidcXHUxRjc1JywnXFx1MUZEOCc6J1xcdTFGRDAnLCdcXHUxRkQ5JzonXFx1MUZEMScsJ1xcdTFGREEnOidcXHUxRjc2JywnXFx1MUZEQic6J1xcdTFGNzcnLCdcXHUxRkU4JzonXFx1MUZFMCcsJ1xcdTFGRTknOidcXHUxRkUxJywnXFx1MUZFQSc6J1xcdTFGN0EnLCdcXHUxRkVCJzonXFx1MUY3QicsJ1xcdTFGRUMnOidcXHUxRkU1JywnXFx1MUZGOCc6J1xcdTFGNzgnLCdcXHUxRkY5JzonXFx1MUY3OScsJ1xcdTFGRkEnOidcXHUxRjdDJywnXFx1MUZGQic6J1xcdTFGN0QnLCdcXHUyMTI2JzonXFx1MDNDOScsJ1xcdTIxMkEnOidrJywnXFx1MjEyQic6J1xceEU1JywnXFx1MjEzMic6J1xcdTIxNEUnLCdcXHUyMTYwJzonXFx1MjE3MCcsJ1xcdTIxNjEnOidcXHUyMTcxJywnXFx1MjE2Mic6J1xcdTIxNzInLCdcXHUyMTYzJzonXFx1MjE3MycsJ1xcdTIxNjQnOidcXHUyMTc0JywnXFx1MjE2NSc6J1xcdTIxNzUnLCdcXHUyMTY2JzonXFx1MjE3NicsJ1xcdTIxNjcnOidcXHUyMTc3JywnXFx1MjE2OCc6J1xcdTIxNzgnLCdcXHUyMTY5JzonXFx1MjE3OScsJ1xcdTIxNkEnOidcXHUyMTdBJywnXFx1MjE2Qic6J1xcdTIxN0InLCdcXHUyMTZDJzonXFx1MjE3QycsJ1xcdTIxNkQnOidcXHUyMTdEJywnXFx1MjE2RSc6J1xcdTIxN0UnLCdcXHUyMTZGJzonXFx1MjE3RicsJ1xcdTIxODMnOidcXHUyMTg0JywnXFx1MjRCNic6J1xcdTI0RDAnLCdcXHUyNEI3JzonXFx1MjREMScsJ1xcdTI0QjgnOidcXHUyNEQyJywnXFx1MjRCOSc6J1xcdTI0RDMnLCdcXHUyNEJBJzonXFx1MjRENCcsJ1xcdTI0QkInOidcXHUyNEQ1JywnXFx1MjRCQyc6J1xcdTI0RDYnLCdcXHUyNEJEJzonXFx1MjRENycsJ1xcdTI0QkUnOidcXHUyNEQ4JywnXFx1MjRCRic6J1xcdTI0RDknLCdcXHUyNEMwJzonXFx1MjREQScsJ1xcdTI0QzEnOidcXHUyNERCJywnXFx1MjRDMic6J1xcdTI0REMnLCdcXHUyNEMzJzonXFx1MjRERCcsJ1xcdTI0QzQnOidcXHUyNERFJywnXFx1MjRDNSc6J1xcdTI0REYnLCdcXHUyNEM2JzonXFx1MjRFMCcsJ1xcdTI0QzcnOidcXHUyNEUxJywnXFx1MjRDOCc6J1xcdTI0RTInLCdcXHUyNEM5JzonXFx1MjRFMycsJ1xcdTI0Q0EnOidcXHUyNEU0JywnXFx1MjRDQic6J1xcdTI0RTUnLCdcXHUyNENDJzonXFx1MjRFNicsJ1xcdTI0Q0QnOidcXHUyNEU3JywnXFx1MjRDRSc6J1xcdTI0RTgnLCdcXHUyNENGJzonXFx1MjRFOScsJ1xcdTJDMDAnOidcXHUyQzMwJywnXFx1MkMwMSc6J1xcdTJDMzEnLCdcXHUyQzAyJzonXFx1MkMzMicsJ1xcdTJDMDMnOidcXHUyQzMzJywnXFx1MkMwNCc6J1xcdTJDMzQnLCdcXHUyQzA1JzonXFx1MkMzNScsJ1xcdTJDMDYnOidcXHUyQzM2JywnXFx1MkMwNyc6J1xcdTJDMzcnLCdcXHUyQzA4JzonXFx1MkMzOCcsJ1xcdTJDMDknOidcXHUyQzM5JywnXFx1MkMwQSc6J1xcdTJDM0EnLCdcXHUyQzBCJzonXFx1MkMzQicsJ1xcdTJDMEMnOidcXHUyQzNDJywnXFx1MkMwRCc6J1xcdTJDM0QnLCdcXHUyQzBFJzonXFx1MkMzRScsJ1xcdTJDMEYnOidcXHUyQzNGJywnXFx1MkMxMCc6J1xcdTJDNDAnLCdcXHUyQzExJzonXFx1MkM0MScsJ1xcdTJDMTInOidcXHUyQzQyJywnXFx1MkMxMyc6J1xcdTJDNDMnLCdcXHUyQzE0JzonXFx1MkM0NCcsJ1xcdTJDMTUnOidcXHUyQzQ1JywnXFx1MkMxNic6J1xcdTJDNDYnLCdcXHUyQzE3JzonXFx1MkM0NycsJ1xcdTJDMTgnOidcXHUyQzQ4JywnXFx1MkMxOSc6J1xcdTJDNDknLCdcXHUyQzFBJzonXFx1MkM0QScsJ1xcdTJDMUInOidcXHUyQzRCJywnXFx1MkMxQyc6J1xcdTJDNEMnLCdcXHUyQzFEJzonXFx1MkM0RCcsJ1xcdTJDMUUnOidcXHUyQzRFJywnXFx1MkMxRic6J1xcdTJDNEYnLCdcXHUyQzIwJzonXFx1MkM1MCcsJ1xcdTJDMjEnOidcXHUyQzUxJywnXFx1MkMyMic6J1xcdTJDNTInLCdcXHUyQzIzJzonXFx1MkM1MycsJ1xcdTJDMjQnOidcXHUyQzU0JywnXFx1MkMyNSc6J1xcdTJDNTUnLCdcXHUyQzI2JzonXFx1MkM1NicsJ1xcdTJDMjcnOidcXHUyQzU3JywnXFx1MkMyOCc6J1xcdTJDNTgnLCdcXHUyQzI5JzonXFx1MkM1OScsJ1xcdTJDMkEnOidcXHUyQzVBJywnXFx1MkMyQic6J1xcdTJDNUInLCdcXHUyQzJDJzonXFx1MkM1QycsJ1xcdTJDMkQnOidcXHUyQzVEJywnXFx1MkMyRSc6J1xcdTJDNUUnLCdcXHUyQzYwJzonXFx1MkM2MScsJ1xcdTJDNjInOidcXHUwMjZCJywnXFx1MkM2Myc6J1xcdTFEN0QnLCdcXHUyQzY0JzonXFx1MDI3RCcsJ1xcdTJDNjcnOidcXHUyQzY4JywnXFx1MkM2OSc6J1xcdTJDNkEnLCdcXHUyQzZCJzonXFx1MkM2QycsJ1xcdTJDNkQnOidcXHUwMjUxJywnXFx1MkM2RSc6J1xcdTAyNzEnLCdcXHUyQzZGJzonXFx1MDI1MCcsJ1xcdTJDNzAnOidcXHUwMjUyJywnXFx1MkM3Mic6J1xcdTJDNzMnLCdcXHUyQzc1JzonXFx1MkM3NicsJ1xcdTJDN0UnOidcXHUwMjNGJywnXFx1MkM3Ric6J1xcdTAyNDAnLCdcXHUyQzgwJzonXFx1MkM4MScsJ1xcdTJDODInOidcXHUyQzgzJywnXFx1MkM4NCc6J1xcdTJDODUnLCdcXHUyQzg2JzonXFx1MkM4NycsJ1xcdTJDODgnOidcXHUyQzg5JywnXFx1MkM4QSc6J1xcdTJDOEInLCdcXHUyQzhDJzonXFx1MkM4RCcsJ1xcdTJDOEUnOidcXHUyQzhGJywnXFx1MkM5MCc6J1xcdTJDOTEnLCdcXHUyQzkyJzonXFx1MkM5MycsJ1xcdTJDOTQnOidcXHUyQzk1JywnXFx1MkM5Nic6J1xcdTJDOTcnLCdcXHUyQzk4JzonXFx1MkM5OScsJ1xcdTJDOUEnOidcXHUyQzlCJywnXFx1MkM5Qyc6J1xcdTJDOUQnLCdcXHUyQzlFJzonXFx1MkM5RicsJ1xcdTJDQTAnOidcXHUyQ0ExJywnXFx1MkNBMic6J1xcdTJDQTMnLCdcXHUyQ0E0JzonXFx1MkNBNScsJ1xcdTJDQTYnOidcXHUyQ0E3JywnXFx1MkNBOCc6J1xcdTJDQTknLCdcXHUyQ0FBJzonXFx1MkNBQicsJ1xcdTJDQUMnOidcXHUyQ0FEJywnXFx1MkNBRSc6J1xcdTJDQUYnLCdcXHUyQ0IwJzonXFx1MkNCMScsJ1xcdTJDQjInOidcXHUyQ0IzJywnXFx1MkNCNCc6J1xcdTJDQjUnLCdcXHUyQ0I2JzonXFx1MkNCNycsJ1xcdTJDQjgnOidcXHUyQ0I5JywnXFx1MkNCQSc6J1xcdTJDQkInLCdcXHUyQ0JDJzonXFx1MkNCRCcsJ1xcdTJDQkUnOidcXHUyQ0JGJywnXFx1MkNDMCc6J1xcdTJDQzEnLCdcXHUyQ0MyJzonXFx1MkNDMycsJ1xcdTJDQzQnOidcXHUyQ0M1JywnXFx1MkNDNic6J1xcdTJDQzcnLCdcXHUyQ0M4JzonXFx1MkNDOScsJ1xcdTJDQ0EnOidcXHUyQ0NCJywnXFx1MkNDQyc6J1xcdTJDQ0QnLCdcXHUyQ0NFJzonXFx1MkNDRicsJ1xcdTJDRDAnOidcXHUyQ0QxJywnXFx1MkNEMic6J1xcdTJDRDMnLCdcXHUyQ0Q0JzonXFx1MkNENScsJ1xcdTJDRDYnOidcXHUyQ0Q3JywnXFx1MkNEOCc6J1xcdTJDRDknLCdcXHUyQ0RBJzonXFx1MkNEQicsJ1xcdTJDREMnOidcXHUyQ0REJywnXFx1MkNERSc6J1xcdTJDREYnLCdcXHUyQ0UwJzonXFx1MkNFMScsJ1xcdTJDRTInOidcXHUyQ0UzJywnXFx1MkNFQic6J1xcdTJDRUMnLCdcXHUyQ0VEJzonXFx1MkNFRScsJ1xcdTJDRjInOidcXHUyQ0YzJywnXFx1QTY0MCc6J1xcdUE2NDEnLCdcXHVBNjQyJzonXFx1QTY0MycsJ1xcdUE2NDQnOidcXHVBNjQ1JywnXFx1QTY0Nic6J1xcdUE2NDcnLCdcXHVBNjQ4JzonXFx1QTY0OScsJ1xcdUE2NEEnOidcXHVBNjRCJywnXFx1QTY0Qyc6J1xcdUE2NEQnLCdcXHVBNjRFJzonXFx1QTY0RicsJ1xcdUE2NTAnOidcXHVBNjUxJywnXFx1QTY1Mic6J1xcdUE2NTMnLCdcXHVBNjU0JzonXFx1QTY1NScsJ1xcdUE2NTYnOidcXHVBNjU3JywnXFx1QTY1OCc6J1xcdUE2NTknLCdcXHVBNjVBJzonXFx1QTY1QicsJ1xcdUE2NUMnOidcXHVBNjVEJywnXFx1QTY1RSc6J1xcdUE2NUYnLCdcXHVBNjYwJzonXFx1QTY2MScsJ1xcdUE2NjInOidcXHVBNjYzJywnXFx1QTY2NCc6J1xcdUE2NjUnLCdcXHVBNjY2JzonXFx1QTY2NycsJ1xcdUE2NjgnOidcXHVBNjY5JywnXFx1QTY2QSc6J1xcdUE2NkInLCdcXHVBNjZDJzonXFx1QTY2RCcsJ1xcdUE2ODAnOidcXHVBNjgxJywnXFx1QTY4Mic6J1xcdUE2ODMnLCdcXHVBNjg0JzonXFx1QTY4NScsJ1xcdUE2ODYnOidcXHVBNjg3JywnXFx1QTY4OCc6J1xcdUE2ODknLCdcXHVBNjhBJzonXFx1QTY4QicsJ1xcdUE2OEMnOidcXHVBNjhEJywnXFx1QTY4RSc6J1xcdUE2OEYnLCdcXHVBNjkwJzonXFx1QTY5MScsJ1xcdUE2OTInOidcXHVBNjkzJywnXFx1QTY5NCc6J1xcdUE2OTUnLCdcXHVBNjk2JzonXFx1QTY5NycsJ1xcdUE2OTgnOidcXHVBNjk5JywnXFx1QTY5QSc6J1xcdUE2OUInLCdcXHVBNzIyJzonXFx1QTcyMycsJ1xcdUE3MjQnOidcXHVBNzI1JywnXFx1QTcyNic6J1xcdUE3MjcnLCdcXHVBNzI4JzonXFx1QTcyOScsJ1xcdUE3MkEnOidcXHVBNzJCJywnXFx1QTcyQyc6J1xcdUE3MkQnLCdcXHVBNzJFJzonXFx1QTcyRicsJ1xcdUE3MzInOidcXHVBNzMzJywnXFx1QTczNCc6J1xcdUE3MzUnLCdcXHVBNzM2JzonXFx1QTczNycsJ1xcdUE3MzgnOidcXHVBNzM5JywnXFx1QTczQSc6J1xcdUE3M0InLCdcXHVBNzNDJzonXFx1QTczRCcsJ1xcdUE3M0UnOidcXHVBNzNGJywnXFx1QTc0MCc6J1xcdUE3NDEnLCdcXHVBNzQyJzonXFx1QTc0MycsJ1xcdUE3NDQnOidcXHVBNzQ1JywnXFx1QTc0Nic6J1xcdUE3NDcnLCdcXHVBNzQ4JzonXFx1QTc0OScsJ1xcdUE3NEEnOidcXHVBNzRCJywnXFx1QTc0Qyc6J1xcdUE3NEQnLCdcXHVBNzRFJzonXFx1QTc0RicsJ1xcdUE3NTAnOidcXHVBNzUxJywnXFx1QTc1Mic6J1xcdUE3NTMnLCdcXHVBNzU0JzonXFx1QTc1NScsJ1xcdUE3NTYnOidcXHVBNzU3JywnXFx1QTc1OCc6J1xcdUE3NTknLCdcXHVBNzVBJzonXFx1QTc1QicsJ1xcdUE3NUMnOidcXHVBNzVEJywnXFx1QTc1RSc6J1xcdUE3NUYnLCdcXHVBNzYwJzonXFx1QTc2MScsJ1xcdUE3NjInOidcXHVBNzYzJywnXFx1QTc2NCc6J1xcdUE3NjUnLCdcXHVBNzY2JzonXFx1QTc2NycsJ1xcdUE3NjgnOidcXHVBNzY5JywnXFx1QTc2QSc6J1xcdUE3NkInLCdcXHVBNzZDJzonXFx1QTc2RCcsJ1xcdUE3NkUnOidcXHVBNzZGJywnXFx1QTc3OSc6J1xcdUE3N0EnLCdcXHVBNzdCJzonXFx1QTc3QycsJ1xcdUE3N0QnOidcXHUxRDc5JywnXFx1QTc3RSc6J1xcdUE3N0YnLCdcXHVBNzgwJzonXFx1QTc4MScsJ1xcdUE3ODInOidcXHVBNzgzJywnXFx1QTc4NCc6J1xcdUE3ODUnLCdcXHVBNzg2JzonXFx1QTc4NycsJ1xcdUE3OEInOidcXHVBNzhDJywnXFx1QTc4RCc6J1xcdTAyNjUnLCdcXHVBNzkwJzonXFx1QTc5MScsJ1xcdUE3OTInOidcXHVBNzkzJywnXFx1QTc5Nic6J1xcdUE3OTcnLCdcXHVBNzk4JzonXFx1QTc5OScsJ1xcdUE3OUEnOidcXHVBNzlCJywnXFx1QTc5Qyc6J1xcdUE3OUQnLCdcXHVBNzlFJzonXFx1QTc5RicsJ1xcdUE3QTAnOidcXHVBN0ExJywnXFx1QTdBMic6J1xcdUE3QTMnLCdcXHVBN0E0JzonXFx1QTdBNScsJ1xcdUE3QTYnOidcXHVBN0E3JywnXFx1QTdBOCc6J1xcdUE3QTknLCdcXHVBN0FBJzonXFx1MDI2NicsJ1xcdUE3QUInOidcXHUwMjVDJywnXFx1QTdBQyc6J1xcdTAyNjEnLCdcXHVBN0FEJzonXFx1MDI2QycsJ1xcdUE3QjAnOidcXHUwMjlFJywnXFx1QTdCMSc6J1xcdTAyODcnLCdcXHVGRjIxJzonXFx1RkY0MScsJ1xcdUZGMjInOidcXHVGRjQyJywnXFx1RkYyMyc6J1xcdUZGNDMnLCdcXHVGRjI0JzonXFx1RkY0NCcsJ1xcdUZGMjUnOidcXHVGRjQ1JywnXFx1RkYyNic6J1xcdUZGNDYnLCdcXHVGRjI3JzonXFx1RkY0NycsJ1xcdUZGMjgnOidcXHVGRjQ4JywnXFx1RkYyOSc6J1xcdUZGNDknLCdcXHVGRjJBJzonXFx1RkY0QScsJ1xcdUZGMkInOidcXHVGRjRCJywnXFx1RkYyQyc6J1xcdUZGNEMnLCdcXHVGRjJEJzonXFx1RkY0RCcsJ1xcdUZGMkUnOidcXHVGRjRFJywnXFx1RkYyRic6J1xcdUZGNEYnLCdcXHVGRjMwJzonXFx1RkY1MCcsJ1xcdUZGMzEnOidcXHVGRjUxJywnXFx1RkYzMic6J1xcdUZGNTInLCdcXHVGRjMzJzonXFx1RkY1MycsJ1xcdUZGMzQnOidcXHVGRjU0JywnXFx1RkYzNSc6J1xcdUZGNTUnLCdcXHVGRjM2JzonXFx1RkY1NicsJ1xcdUZGMzcnOidcXHVGRjU3JywnXFx1RkYzOCc6J1xcdUZGNTgnLCdcXHVGRjM5JzonXFx1RkY1OScsJ1xcdUZGM0EnOidcXHVGRjVBJywnXFx1RDgwMVxcdURDMDAnOidcXHVEODAxXFx1REMyOCcsJ1xcdUQ4MDFcXHVEQzAxJzonXFx1RDgwMVxcdURDMjknLCdcXHVEODAxXFx1REMwMic6J1xcdUQ4MDFcXHVEQzJBJywnXFx1RDgwMVxcdURDMDMnOidcXHVEODAxXFx1REMyQicsJ1xcdUQ4MDFcXHVEQzA0JzonXFx1RDgwMVxcdURDMkMnLCdcXHVEODAxXFx1REMwNSc6J1xcdUQ4MDFcXHVEQzJEJywnXFx1RDgwMVxcdURDMDYnOidcXHVEODAxXFx1REMyRScsJ1xcdUQ4MDFcXHVEQzA3JzonXFx1RDgwMVxcdURDMkYnLCdcXHVEODAxXFx1REMwOCc6J1xcdUQ4MDFcXHVEQzMwJywnXFx1RDgwMVxcdURDMDknOidcXHVEODAxXFx1REMzMScsJ1xcdUQ4MDFcXHVEQzBBJzonXFx1RDgwMVxcdURDMzInLCdcXHVEODAxXFx1REMwQic6J1xcdUQ4MDFcXHVEQzMzJywnXFx1RDgwMVxcdURDMEMnOidcXHVEODAxXFx1REMzNCcsJ1xcdUQ4MDFcXHVEQzBEJzonXFx1RDgwMVxcdURDMzUnLCdcXHVEODAxXFx1REMwRSc6J1xcdUQ4MDFcXHVEQzM2JywnXFx1RDgwMVxcdURDMEYnOidcXHVEODAxXFx1REMzNycsJ1xcdUQ4MDFcXHVEQzEwJzonXFx1RDgwMVxcdURDMzgnLCdcXHVEODAxXFx1REMxMSc6J1xcdUQ4MDFcXHVEQzM5JywnXFx1RDgwMVxcdURDMTInOidcXHVEODAxXFx1REMzQScsJ1xcdUQ4MDFcXHVEQzEzJzonXFx1RDgwMVxcdURDM0InLCdcXHVEODAxXFx1REMxNCc6J1xcdUQ4MDFcXHVEQzNDJywnXFx1RDgwMVxcdURDMTUnOidcXHVEODAxXFx1REMzRCcsJ1xcdUQ4MDFcXHVEQzE2JzonXFx1RDgwMVxcdURDM0UnLCdcXHVEODAxXFx1REMxNyc6J1xcdUQ4MDFcXHVEQzNGJywnXFx1RDgwMVxcdURDMTgnOidcXHVEODAxXFx1REM0MCcsJ1xcdUQ4MDFcXHVEQzE5JzonXFx1RDgwMVxcdURDNDEnLCdcXHVEODAxXFx1REMxQSc6J1xcdUQ4MDFcXHVEQzQyJywnXFx1RDgwMVxcdURDMUInOidcXHVEODAxXFx1REM0MycsJ1xcdUQ4MDFcXHVEQzFDJzonXFx1RDgwMVxcdURDNDQnLCdcXHVEODAxXFx1REMxRCc6J1xcdUQ4MDFcXHVEQzQ1JywnXFx1RDgwMVxcdURDMUUnOidcXHVEODAxXFx1REM0NicsJ1xcdUQ4MDFcXHVEQzFGJzonXFx1RDgwMVxcdURDNDcnLCdcXHVEODAxXFx1REMyMCc6J1xcdUQ4MDFcXHVEQzQ4JywnXFx1RDgwMVxcdURDMjEnOidcXHVEODAxXFx1REM0OScsJ1xcdUQ4MDFcXHVEQzIyJzonXFx1RDgwMVxcdURDNEEnLCdcXHVEODAxXFx1REMyMyc6J1xcdUQ4MDFcXHVEQzRCJywnXFx1RDgwMVxcdURDMjQnOidcXHVEODAxXFx1REM0QycsJ1xcdUQ4MDFcXHVEQzI1JzonXFx1RDgwMVxcdURDNEQnLCdcXHVEODAxXFx1REMyNic6J1xcdUQ4MDFcXHVEQzRFJywnXFx1RDgwMVxcdURDMjcnOidcXHVEODAxXFx1REM0RicsJ1xcdUQ4MDZcXHVEQ0EwJzonXFx1RDgwNlxcdURDQzAnLCdcXHVEODA2XFx1RENBMSc6J1xcdUQ4MDZcXHVEQ0MxJywnXFx1RDgwNlxcdURDQTInOidcXHVEODA2XFx1RENDMicsJ1xcdUQ4MDZcXHVEQ0EzJzonXFx1RDgwNlxcdURDQzMnLCdcXHVEODA2XFx1RENBNCc6J1xcdUQ4MDZcXHVEQ0M0JywnXFx1RDgwNlxcdURDQTUnOidcXHVEODA2XFx1RENDNScsJ1xcdUQ4MDZcXHVEQ0E2JzonXFx1RDgwNlxcdURDQzYnLCdcXHVEODA2XFx1RENBNyc6J1xcdUQ4MDZcXHVEQ0M3JywnXFx1RDgwNlxcdURDQTgnOidcXHVEODA2XFx1RENDOCcsJ1xcdUQ4MDZcXHVEQ0E5JzonXFx1RDgwNlxcdURDQzknLCdcXHVEODA2XFx1RENBQSc6J1xcdUQ4MDZcXHVEQ0NBJywnXFx1RDgwNlxcdURDQUInOidcXHVEODA2XFx1RENDQicsJ1xcdUQ4MDZcXHVEQ0FDJzonXFx1RDgwNlxcdURDQ0MnLCdcXHVEODA2XFx1RENBRCc6J1xcdUQ4MDZcXHVEQ0NEJywnXFx1RDgwNlxcdURDQUUnOidcXHVEODA2XFx1RENDRScsJ1xcdUQ4MDZcXHVEQ0FGJzonXFx1RDgwNlxcdURDQ0YnLCdcXHVEODA2XFx1RENCMCc6J1xcdUQ4MDZcXHVEQ0QwJywnXFx1RDgwNlxcdURDQjEnOidcXHVEODA2XFx1RENEMScsJ1xcdUQ4MDZcXHVEQ0IyJzonXFx1RDgwNlxcdURDRDInLCdcXHVEODA2XFx1RENCMyc6J1xcdUQ4MDZcXHVEQ0QzJywnXFx1RDgwNlxcdURDQjQnOidcXHVEODA2XFx1RENENCcsJ1xcdUQ4MDZcXHVEQ0I1JzonXFx1RDgwNlxcdURDRDUnLCdcXHVEODA2XFx1RENCNic6J1xcdUQ4MDZcXHVEQ0Q2JywnXFx1RDgwNlxcdURDQjcnOidcXHVEODA2XFx1RENENycsJ1xcdUQ4MDZcXHVEQ0I4JzonXFx1RDgwNlxcdURDRDgnLCdcXHVEODA2XFx1RENCOSc6J1xcdUQ4MDZcXHVEQ0Q5JywnXFx1RDgwNlxcdURDQkEnOidcXHVEODA2XFx1RENEQScsJ1xcdUQ4MDZcXHVEQ0JCJzonXFx1RDgwNlxcdURDREInLCdcXHVEODA2XFx1RENCQyc6J1xcdUQ4MDZcXHVEQ0RDJywnXFx1RDgwNlxcdURDQkQnOidcXHVEODA2XFx1RENERCcsJ1xcdUQ4MDZcXHVEQ0JFJzonXFx1RDgwNlxcdURDREUnLCdcXHVEODA2XFx1RENCRic6J1xcdUQ4MDZcXHVEQ0RGJywnXFx4REYnOidzcycsJ1xcdTAxMzAnOidpXFx1MDMwNycsJ1xcdTAxNDknOidcXHUwMkJDbicsJ1xcdTAxRjAnOidqXFx1MDMwQycsJ1xcdTAzOTAnOidcXHUwM0I5XFx1MDMwOFxcdTAzMDEnLCdcXHUwM0IwJzonXFx1MDNDNVxcdTAzMDhcXHUwMzAxJywnXFx1MDU4Nyc6J1xcdTA1NjVcXHUwNTgyJywnXFx1MUU5Nic6J2hcXHUwMzMxJywnXFx1MUU5Nyc6J3RcXHUwMzA4JywnXFx1MUU5OCc6J3dcXHUwMzBBJywnXFx1MUU5OSc6J3lcXHUwMzBBJywnXFx1MUU5QSc6J2FcXHUwMkJFJywnXFx1MUU5RSc6J3NzJywnXFx1MUY1MCc6J1xcdTAzQzVcXHUwMzEzJywnXFx1MUY1Mic6J1xcdTAzQzVcXHUwMzEzXFx1MDMwMCcsJ1xcdTFGNTQnOidcXHUwM0M1XFx1MDMxM1xcdTAzMDEnLCdcXHUxRjU2JzonXFx1MDNDNVxcdTAzMTNcXHUwMzQyJywnXFx1MUY4MCc6J1xcdTFGMDBcXHUwM0I5JywnXFx1MUY4MSc6J1xcdTFGMDFcXHUwM0I5JywnXFx1MUY4Mic6J1xcdTFGMDJcXHUwM0I5JywnXFx1MUY4Myc6J1xcdTFGMDNcXHUwM0I5JywnXFx1MUY4NCc6J1xcdTFGMDRcXHUwM0I5JywnXFx1MUY4NSc6J1xcdTFGMDVcXHUwM0I5JywnXFx1MUY4Nic6J1xcdTFGMDZcXHUwM0I5JywnXFx1MUY4Nyc6J1xcdTFGMDdcXHUwM0I5JywnXFx1MUY4OCc6J1xcdTFGMDBcXHUwM0I5JywnXFx1MUY4OSc6J1xcdTFGMDFcXHUwM0I5JywnXFx1MUY4QSc6J1xcdTFGMDJcXHUwM0I5JywnXFx1MUY4Qic6J1xcdTFGMDNcXHUwM0I5JywnXFx1MUY4Qyc6J1xcdTFGMDRcXHUwM0I5JywnXFx1MUY4RCc6J1xcdTFGMDVcXHUwM0I5JywnXFx1MUY4RSc6J1xcdTFGMDZcXHUwM0I5JywnXFx1MUY4Ric6J1xcdTFGMDdcXHUwM0I5JywnXFx1MUY5MCc6J1xcdTFGMjBcXHUwM0I5JywnXFx1MUY5MSc6J1xcdTFGMjFcXHUwM0I5JywnXFx1MUY5Mic6J1xcdTFGMjJcXHUwM0I5JywnXFx1MUY5Myc6J1xcdTFGMjNcXHUwM0I5JywnXFx1MUY5NCc6J1xcdTFGMjRcXHUwM0I5JywnXFx1MUY5NSc6J1xcdTFGMjVcXHUwM0I5JywnXFx1MUY5Nic6J1xcdTFGMjZcXHUwM0I5JywnXFx1MUY5Nyc6J1xcdTFGMjdcXHUwM0I5JywnXFx1MUY5OCc6J1xcdTFGMjBcXHUwM0I5JywnXFx1MUY5OSc6J1xcdTFGMjFcXHUwM0I5JywnXFx1MUY5QSc6J1xcdTFGMjJcXHUwM0I5JywnXFx1MUY5Qic6J1xcdTFGMjNcXHUwM0I5JywnXFx1MUY5Qyc6J1xcdTFGMjRcXHUwM0I5JywnXFx1MUY5RCc6J1xcdTFGMjVcXHUwM0I5JywnXFx1MUY5RSc6J1xcdTFGMjZcXHUwM0I5JywnXFx1MUY5Ric6J1xcdTFGMjdcXHUwM0I5JywnXFx1MUZBMCc6J1xcdTFGNjBcXHUwM0I5JywnXFx1MUZBMSc6J1xcdTFGNjFcXHUwM0I5JywnXFx1MUZBMic6J1xcdTFGNjJcXHUwM0I5JywnXFx1MUZBMyc6J1xcdTFGNjNcXHUwM0I5JywnXFx1MUZBNCc6J1xcdTFGNjRcXHUwM0I5JywnXFx1MUZBNSc6J1xcdTFGNjVcXHUwM0I5JywnXFx1MUZBNic6J1xcdTFGNjZcXHUwM0I5JywnXFx1MUZBNyc6J1xcdTFGNjdcXHUwM0I5JywnXFx1MUZBOCc6J1xcdTFGNjBcXHUwM0I5JywnXFx1MUZBOSc6J1xcdTFGNjFcXHUwM0I5JywnXFx1MUZBQSc6J1xcdTFGNjJcXHUwM0I5JywnXFx1MUZBQic6J1xcdTFGNjNcXHUwM0I5JywnXFx1MUZBQyc6J1xcdTFGNjRcXHUwM0I5JywnXFx1MUZBRCc6J1xcdTFGNjVcXHUwM0I5JywnXFx1MUZBRSc6J1xcdTFGNjZcXHUwM0I5JywnXFx1MUZBRic6J1xcdTFGNjdcXHUwM0I5JywnXFx1MUZCMic6J1xcdTFGNzBcXHUwM0I5JywnXFx1MUZCMyc6J1xcdTAzQjFcXHUwM0I5JywnXFx1MUZCNCc6J1xcdTAzQUNcXHUwM0I5JywnXFx1MUZCNic6J1xcdTAzQjFcXHUwMzQyJywnXFx1MUZCNyc6J1xcdTAzQjFcXHUwMzQyXFx1MDNCOScsJ1xcdTFGQkMnOidcXHUwM0IxXFx1MDNCOScsJ1xcdTFGQzInOidcXHUxRjc0XFx1MDNCOScsJ1xcdTFGQzMnOidcXHUwM0I3XFx1MDNCOScsJ1xcdTFGQzQnOidcXHUwM0FFXFx1MDNCOScsJ1xcdTFGQzYnOidcXHUwM0I3XFx1MDM0MicsJ1xcdTFGQzcnOidcXHUwM0I3XFx1MDM0MlxcdTAzQjknLCdcXHUxRkNDJzonXFx1MDNCN1xcdTAzQjknLCdcXHUxRkQyJzonXFx1MDNCOVxcdTAzMDhcXHUwMzAwJywnXFx1MUZEMyc6J1xcdTAzQjlcXHUwMzA4XFx1MDMwMScsJ1xcdTFGRDYnOidcXHUwM0I5XFx1MDM0MicsJ1xcdTFGRDcnOidcXHUwM0I5XFx1MDMwOFxcdTAzNDInLCdcXHUxRkUyJzonXFx1MDNDNVxcdTAzMDhcXHUwMzAwJywnXFx1MUZFMyc6J1xcdTAzQzVcXHUwMzA4XFx1MDMwMScsJ1xcdTFGRTQnOidcXHUwM0MxXFx1MDMxMycsJ1xcdTFGRTYnOidcXHUwM0M1XFx1MDM0MicsJ1xcdTFGRTcnOidcXHUwM0M1XFx1MDMwOFxcdTAzNDInLCdcXHUxRkYyJzonXFx1MUY3Q1xcdTAzQjknLCdcXHUxRkYzJzonXFx1MDNDOVxcdTAzQjknLCdcXHUxRkY0JzonXFx1MDNDRVxcdTAzQjknLCdcXHUxRkY2JzonXFx1MDNDOVxcdTAzNDInLCdcXHUxRkY3JzonXFx1MDNDOVxcdTAzNDJcXHUwM0I5JywnXFx1MUZGQyc6J1xcdTAzQzlcXHUwM0I5JywnXFx1RkIwMCc6J2ZmJywnXFx1RkIwMSc6J2ZpJywnXFx1RkIwMic6J2ZsJywnXFx1RkIwMyc6J2ZmaScsJ1xcdUZCMDQnOidmZmwnLCdcXHVGQjA1Jzonc3QnLCdcXHVGQjA2Jzonc3QnLCdcXHVGQjEzJzonXFx1MDU3NFxcdTA1NzYnLCdcXHVGQjE0JzonXFx1MDU3NFxcdTA1NjUnLCdcXHVGQjE1JzonXFx1MDU3NFxcdTA1NkInLCdcXHVGQjE2JzonXFx1MDU3RVxcdTA1NzYnLCdcXHVGQjE3JzonXFx1MDU3NFxcdTA1NkQnfTtcblxuLy8gTm9ybWFsaXplIHJlZmVyZW5jZSBsYWJlbDogY29sbGFwc2UgaW50ZXJuYWwgd2hpdGVzcGFjZVxuLy8gdG8gc2luZ2xlIHNwYWNlLCByZW1vdmUgbGVhZGluZy90cmFpbGluZyB3aGl0ZXNwYWNlLCBjYXNlIGZvbGQuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcuc2xpY2UoMSwgc3RyaW5nLmxlbmd0aCAtIDEpLnRyaW0oKS5yZXBsYWNlKHJlZ2V4LCBmdW5jdGlvbigkMCkge1xuICAgICAgICAvLyBOb3RlOiB0aGVyZSBpcyBubyBuZWVkIHRvIGNoZWNrIGBoYXNPd25Qcm9wZXJ0eSgkMClgIGhlcmUuXG4gICAgICAgIC8vIElmIGNoYXJhY3RlciBub3QgZm91bmQgaW4gbG9va3VwIHRhYmxlLCBpdCBtdXN0IGJlIHdoaXRlc3BhY2UuXG4gICAgICAgIHJldHVybiBtYXBbJDBdIHx8ICcgJztcbiAgICB9KTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29tbW9ubWFyay9saWIvbm9ybWFsaXplLXJlZmVyZW5jZS5qc1xuLy8gbW9kdWxlIGlkID0gNTYyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgZXNjYXBlWG1sID0gcmVxdWlyZSgnLi9jb21tb24nKS5lc2NhcGVYbWw7XG5cbi8vIEhlbHBlciBmdW5jdGlvbiB0byBwcm9kdWNlIGFuIFhNTCB0YWcuXG52YXIgdGFnID0gZnVuY3Rpb24obmFtZSwgYXR0cnMsIHNlbGZjbG9zaW5nKSB7XG4gICAgdmFyIHJlc3VsdCA9ICc8JyArIG5hbWU7XG4gICAgaWYgKGF0dHJzICYmIGF0dHJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICB2YXIgYXR0cmliO1xuICAgICAgICB3aGlsZSAoKGF0dHJpYiA9IGF0dHJzW2ldKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gJyAnICsgYXR0cmliWzBdICsgJz1cIicgKyBhdHRyaWJbMV0gKyAnXCInO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChzZWxmY2xvc2luZykge1xuICAgICAgICByZXN1bHQgKz0gJyAvJztcbiAgICB9XG5cbiAgICByZXN1bHQgKz0gJz4nO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG52YXIgcmVYTUxUYWcgPSAvXFw8W14+XSpcXD4vO1xuXG52YXIgdG9UYWdOYW1lID0gZnVuY3Rpb24ocykge1xuICAgIHJldHVybiBzLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csIFwiJDFfJDJcIikudG9Mb3dlckNhc2UoKTtcbn07XG5cbnZhciByZW5kZXJOb2RlcyA9IGZ1bmN0aW9uKGJsb2NrKSB7XG5cbiAgICB2YXIgYXR0cnM7XG4gICAgdmFyIHRhZ25hbWU7XG4gICAgdmFyIHdhbGtlciA9IGJsb2NrLndhbGtlcigpO1xuICAgIHZhciBldmVudCwgbm9kZSwgZW50ZXJpbmc7XG4gICAgdmFyIGJ1ZmZlciA9IFwiXCI7XG4gICAgdmFyIGxhc3RPdXQgPSBcIlxcblwiO1xuICAgIHZhciBkaXNhYmxlVGFncyA9IDA7XG4gICAgdmFyIGluZGVudExldmVsID0gMDtcbiAgICB2YXIgaW5kZW50ID0gJyAgJztcbiAgICB2YXIgY29udGFpbmVyO1xuICAgIHZhciBzZWxmQ2xvc2luZztcbiAgICB2YXIgbm9kZXR5cGU7XG5cbiAgICB2YXIgb3V0ID0gZnVuY3Rpb24ocykge1xuICAgICAgICBpZiAoZGlzYWJsZVRhZ3MgPiAwKSB7XG4gICAgICAgICAgICBidWZmZXIgKz0gcy5yZXBsYWNlKHJlWE1MVGFnLCAnJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBidWZmZXIgKz0gcztcbiAgICAgICAgfVxuICAgICAgICBsYXN0T3V0ID0gcztcbiAgICB9O1xuICAgIHZhciBlc2MgPSB0aGlzLmVzY2FwZTtcbiAgICB2YXIgY3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGxhc3RPdXQgIT09ICdcXG4nKSB7XG4gICAgICAgICAgICBidWZmZXIgKz0gJ1xcbic7XG4gICAgICAgICAgICBsYXN0T3V0ID0gJ1xcbic7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gaW5kZW50TGV2ZWw7IGkgPiAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBidWZmZXIgKz0gaW5kZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG4gICAgaWYgKG9wdGlvbnMudGltZSkgeyBjb25zb2xlLnRpbWUoXCJyZW5kZXJpbmdcIik7IH1cblxuICAgIGJ1ZmZlciArPSAnPD94bWwgdmVyc2lvbj1cIjEuMFwiIGVuY29kaW5nPVwiVVRGLThcIj8+XFxuJztcbiAgICBidWZmZXIgKz0gJzwhRE9DVFlQRSBDb21tb25NYXJrIFNZU1RFTSBcIkNvbW1vbk1hcmsuZHRkXCI+XFxuJztcblxuICAgIHdoaWxlICgoZXZlbnQgPSB3YWxrZXIubmV4dCgpKSkge1xuICAgICAgICBlbnRlcmluZyA9IGV2ZW50LmVudGVyaW5nO1xuICAgICAgICBub2RlID0gZXZlbnQubm9kZTtcbiAgICAgICAgbm9kZXR5cGUgPSBub2RlLnR5cGU7XG5cbiAgICAgICAgY29udGFpbmVyID0gbm9kZS5pc0NvbnRhaW5lcjtcbiAgICAgICAgc2VsZkNsb3NpbmcgPSBub2RldHlwZSA9PT0gJ1RoZW1hdGljQnJlYWsnIHx8IG5vZGV0eXBlID09PSAnSGFyZGJyZWFrJyB8fFxuICAgICAgICAgICAgbm9kZXR5cGUgPT09ICdTb2Z0YnJlYWsnO1xuICAgICAgICB0YWduYW1lID0gdG9UYWdOYW1lKG5vZGV0eXBlKTtcblxuICAgICAgICBpZiAoZW50ZXJpbmcpIHtcblxuICAgICAgICAgICAgYXR0cnMgPSBbXTtcblxuICAgICAgICAgICAgc3dpdGNoIChub2RldHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnRG9jdW1lbnQnOlxuICAgICAgICAgICAgICAgIGF0dHJzLnB1c2goWyd4bWxucycsICdodHRwOi8vY29tbW9ubWFyay5vcmcveG1sLzEuMCddKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ0xpc3QnOlxuICAgICAgICAgICAgICAgIGlmIChub2RlLmxpc3RUeXBlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJzLnB1c2goWyd0eXBlJywgbm9kZS5saXN0VHlwZS50b0xvd2VyQ2FzZSgpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChub2RlLmxpc3RTdGFydCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBhdHRycy5wdXNoKFsnc3RhcnQnLCBTdHJpbmcobm9kZS5saXN0U3RhcnQpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChub2RlLmxpc3RUaWdodCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBhdHRycy5wdXNoKFsndGlnaHQnLCAobm9kZS5saXN0VGlnaHQgPyAndHJ1ZScgOiAnZmFsc2UnKV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgZGVsaW0gPSBub2RlLmxpc3REZWxpbWl0ZXI7XG4gICAgICAgICAgICAgICAgaWYgKGRlbGltICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkZWxpbXdvcmQgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlbGltID09PSAnLicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGltd29yZCA9ICdwZXJpb2QnO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVsaW13b3JkID0gJ3BhcmVuJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBhdHRycy5wdXNoKFsnZGVsaW1pdGVyJywgZGVsaW13b3JkXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnQ29kZUJsb2NrJzpcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5pbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJzLnB1c2goWydpbmZvJywgbm9kZS5pbmZvXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnSGVhZGluZyc6XG4gICAgICAgICAgICAgICAgYXR0cnMucHVzaChbJ2xldmVsJywgU3RyaW5nKG5vZGUubGV2ZWwpXSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdMaW5rJzpcbiAgICAgICAgICAgIGNhc2UgJ0ltYWdlJzpcbiAgICAgICAgICAgICAgICBhdHRycy5wdXNoKFsnZGVzdGluYXRpb24nLCBub2RlLmRlc3RpbmF0aW9uXSk7XG4gICAgICAgICAgICAgICAgYXR0cnMucHVzaChbJ3RpdGxlJywgbm9kZS50aXRsZV0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnQ3VzdG9tSW5saW5lJzpcbiAgICAgICAgICAgIGNhc2UgJ0N1c3RvbUJsb2NrJzpcbiAgICAgICAgICAgICAgICBhdHRycy5wdXNoKFsnb25fZW50ZXInLCBub2RlLm9uRW50ZXJdKTtcbiAgICAgICAgICAgICAgICBhdHRycy5wdXNoKFsnb25fZXhpdCcsIG5vZGUub25FeGl0XSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuc291cmNlcG9zKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBvcyA9IG5vZGUuc291cmNlcG9zO1xuICAgICAgICAgICAgICAgIGlmIChwb3MpIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0cnMucHVzaChbJ3NvdXJjZXBvcycsIFN0cmluZyhwb3NbMF1bMF0pICsgJzonICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3RyaW5nKHBvc1swXVsxXSkgKyAnLScgKyBTdHJpbmcocG9zWzFdWzBdKSArICc6JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0cmluZyhwb3NbMV1bMV0pXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjcigpO1xuICAgICAgICAgICAgb3V0KHRhZyh0YWduYW1lLCBhdHRycywgc2VsZkNsb3NpbmcpKTtcbiAgICAgICAgICAgIGlmIChjb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICBpbmRlbnRMZXZlbCArPSAxO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghY29udGFpbmVyICYmICFzZWxmQ2xvc2luZykge1xuICAgICAgICAgICAgICAgIHZhciBsaXQgPSBub2RlLmxpdGVyYWw7XG4gICAgICAgICAgICAgICAgaWYgKGxpdCkge1xuICAgICAgICAgICAgICAgICAgICBvdXQoZXNjKGxpdCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvdXQodGFnKCcvJyArIHRhZ25hbWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluZGVudExldmVsIC09IDE7XG4gICAgICAgICAgICBjcigpO1xuICAgICAgICAgICAgb3V0KHRhZygnLycgKyB0YWduYW1lKSk7XG4gICAgICAgIH1cblxuXG4gICAgfVxuICAgIGlmIChvcHRpb25zLnRpbWUpIHsgY29uc29sZS50aW1lRW5kKFwicmVuZGVyaW5nXCIpOyB9XG4gICAgYnVmZmVyICs9ICdcXG4nO1xuICAgIHJldHVybiBidWZmZXI7XG59O1xuXG4vLyBUaGUgWG1sUmVuZGVyZXIgb2JqZWN0LlxuZnVuY3Rpb24gWG1sUmVuZGVyZXIob3B0aW9ucyl7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLy8gZGVmYXVsdCBvcHRpb25zOlxuICAgICAgICBzb2Z0YnJlYWs6ICdcXG4nLCAvLyBieSBkZWZhdWx0LCBzb2Z0IGJyZWFrcyBhcmUgcmVuZGVyZWQgYXMgbmV3bGluZXMgaW4gSFRNTFxuICAgICAgICAvLyBzZXQgdG8gXCI8YnIgLz5cIiB0byBtYWtlIHRoZW0gaGFyZCBicmVha3NcbiAgICAgICAgLy8gc2V0IHRvIFwiIFwiIGlmIHlvdSB3YW50IHRvIGlnbm9yZSBsaW5lIHdyYXBwaW5nIGluIHNvdXJjZVxuICAgICAgICBlc2NhcGU6IGVzY2FwZVhtbCxcbiAgICAgICAgb3B0aW9uczogb3B0aW9ucyB8fCB7fSxcbiAgICAgICAgcmVuZGVyOiByZW5kZXJOb2Rlc1xuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gWG1sUmVuZGVyZXI7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vY29tbW9ubWFyay9saWIveG1sLmpzXG4vLyBtb2R1bGUgaWQgPSA1NjNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGVudGl0eU1hcCA9IHJlcXVpcmUoXCIuLi9tYXBzL2VudGl0aWVzLmpzb25cIiksXG4gICAgbGVnYWN5TWFwID0gcmVxdWlyZShcIi4uL21hcHMvbGVnYWN5Lmpzb25cIiksXG4gICAgeG1sTWFwICAgID0gcmVxdWlyZShcIi4uL21hcHMveG1sLmpzb25cIiksXG4gICAgZGVjb2RlQ29kZVBvaW50ID0gcmVxdWlyZShcIi4vZGVjb2RlX2NvZGVwb2ludC5qc1wiKTtcblxudmFyIGRlY29kZVhNTFN0cmljdCAgPSBnZXRTdHJpY3REZWNvZGVyKHhtbE1hcCksXG4gICAgZGVjb2RlSFRNTFN0cmljdCA9IGdldFN0cmljdERlY29kZXIoZW50aXR5TWFwKTtcblxuZnVuY3Rpb24gZ2V0U3RyaWN0RGVjb2RlcihtYXApe1xuXHR2YXIga2V5cyA9IE9iamVjdC5rZXlzKG1hcCkuam9pbihcInxcIiksXG5cdCAgICByZXBsYWNlID0gZ2V0UmVwbGFjZXIobWFwKTtcblxuXHRrZXlzICs9IFwifCNbeFhdW1xcXFxkYS1mQS1GXSt8I1xcXFxkK1wiO1xuXG5cdHZhciByZSA9IG5ldyBSZWdFeHAoXCImKD86XCIgKyBrZXlzICsgXCIpO1wiLCBcImdcIik7XG5cblx0cmV0dXJuIGZ1bmN0aW9uKHN0cil7XG5cdFx0cmV0dXJuIFN0cmluZyhzdHIpLnJlcGxhY2UocmUsIHJlcGxhY2UpO1xuXHR9O1xufVxuXG52YXIgZGVjb2RlSFRNTCA9IChmdW5jdGlvbigpe1xuXHR2YXIgbGVnYWN5ID0gT2JqZWN0LmtleXMobGVnYWN5TWFwKVxuXHRcdC5zb3J0KHNvcnRlcik7XG5cblx0dmFyIGtleXMgPSBPYmplY3Qua2V5cyhlbnRpdHlNYXApXG5cdFx0LnNvcnQoc29ydGVyKTtcblxuXHRmb3IodmFyIGkgPSAwLCBqID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspe1xuXHRcdGlmKGxlZ2FjeVtqXSA9PT0ga2V5c1tpXSl7XG5cdFx0XHRrZXlzW2ldICs9IFwiOz9cIjtcblx0XHRcdGorKztcblx0XHR9IGVsc2Uge1xuXHRcdFx0a2V5c1tpXSArPSBcIjtcIjtcblx0XHR9XG5cdH1cblxuXHR2YXIgcmUgPSBuZXcgUmVnRXhwKFwiJig/OlwiICsga2V5cy5qb2luKFwifFwiKSArIFwifCNbeFhdW1xcXFxkYS1mQS1GXSs7P3wjXFxcXGQrOz8pXCIsIFwiZ1wiKSxcblx0ICAgIHJlcGxhY2UgPSBnZXRSZXBsYWNlcihlbnRpdHlNYXApO1xuXG5cdGZ1bmN0aW9uIHJlcGxhY2VyKHN0cil7XG5cdFx0aWYoc3RyLnN1YnN0cigtMSkgIT09IFwiO1wiKSBzdHIgKz0gXCI7XCI7XG5cdFx0cmV0dXJuIHJlcGxhY2Uoc3RyKTtcblx0fVxuXG5cdC8vVE9ETyBjb25zaWRlciBjcmVhdGluZyBhIG1lcmdlZCBtYXBcblx0cmV0dXJuIGZ1bmN0aW9uKHN0cil7XG5cdFx0cmV0dXJuIFN0cmluZyhzdHIpLnJlcGxhY2UocmUsIHJlcGxhY2VyKTtcblx0fTtcbn0oKSk7XG5cbmZ1bmN0aW9uIHNvcnRlcihhLCBiKXtcblx0cmV0dXJuIGEgPCBiID8gMSA6IC0xO1xufVxuXG5mdW5jdGlvbiBnZXRSZXBsYWNlcihtYXApe1xuXHRyZXR1cm4gZnVuY3Rpb24gcmVwbGFjZShzdHIpe1xuXHRcdGlmKHN0ci5jaGFyQXQoMSkgPT09IFwiI1wiKXtcblx0XHRcdGlmKHN0ci5jaGFyQXQoMikgPT09IFwiWFwiIHx8IHN0ci5jaGFyQXQoMikgPT09IFwieFwiKXtcblx0XHRcdFx0cmV0dXJuIGRlY29kZUNvZGVQb2ludChwYXJzZUludChzdHIuc3Vic3RyKDMpLCAxNikpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGRlY29kZUNvZGVQb2ludChwYXJzZUludChzdHIuc3Vic3RyKDIpLCAxMCkpO1xuXHRcdH1cblx0XHRyZXR1cm4gbWFwW3N0ci5zbGljZSgxLCAtMSldO1xuXHR9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0WE1MOiBkZWNvZGVYTUxTdHJpY3QsXG5cdEhUTUw6IGRlY29kZUhUTUwsXG5cdEhUTUxTdHJpY3Q6IGRlY29kZUhUTUxTdHJpY3Rcbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2VudGl0aWVzL2xpYi9kZWNvZGUuanNcbi8vIG1vZHVsZSBpZCA9IDU2NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZGVjb2RlTWFwID0gcmVxdWlyZShcIi4uL21hcHMvZGVjb2RlLmpzb25cIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZGVjb2RlQ29kZVBvaW50O1xuXG4vLyBtb2RpZmllZCB2ZXJzaW9uIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRoaWFzYnluZW5zL2hlL2Jsb2IvbWFzdGVyL3NyYy9oZS5qcyNMOTQtTDExOVxuZnVuY3Rpb24gZGVjb2RlQ29kZVBvaW50KGNvZGVQb2ludCl7XG5cblx0aWYoKGNvZGVQb2ludCA+PSAweEQ4MDAgJiYgY29kZVBvaW50IDw9IDB4REZGRikgfHwgY29kZVBvaW50ID4gMHgxMEZGRkYpe1xuXHRcdHJldHVybiBcIlxcdUZGRkRcIjtcblx0fVxuXG5cdGlmKGNvZGVQb2ludCBpbiBkZWNvZGVNYXApe1xuXHRcdGNvZGVQb2ludCA9IGRlY29kZU1hcFtjb2RlUG9pbnRdO1xuXHR9XG5cblx0dmFyIG91dHB1dCA9IFwiXCI7XG5cblx0aWYoY29kZVBvaW50ID4gMHhGRkZGKXtcblx0XHRjb2RlUG9pbnQgLT0gMHgxMDAwMDtcblx0XHRvdXRwdXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlUG9pbnQgPj4+IDEwICYgMHgzRkYgfCAweEQ4MDApO1xuXHRcdGNvZGVQb2ludCA9IDB4REMwMCB8IGNvZGVQb2ludCAmIDB4M0ZGO1xuXHR9XG5cblx0b3V0cHV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoY29kZVBvaW50KTtcblx0cmV0dXJuIG91dHB1dDtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9lbnRpdGllcy9saWIvZGVjb2RlX2NvZGVwb2ludC5qc1xuLy8gbW9kdWxlIGlkID0gNTY1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBpbnZlcnNlWE1MID0gZ2V0SW52ZXJzZU9iaihyZXF1aXJlKFwiLi4vbWFwcy94bWwuanNvblwiKSksXG4gICAgeG1sUmVwbGFjZXIgPSBnZXRJbnZlcnNlUmVwbGFjZXIoaW52ZXJzZVhNTCk7XG5cbmV4cG9ydHMuWE1MID0gZ2V0SW52ZXJzZShpbnZlcnNlWE1MLCB4bWxSZXBsYWNlcik7XG5cbnZhciBpbnZlcnNlSFRNTCA9IGdldEludmVyc2VPYmoocmVxdWlyZShcIi4uL21hcHMvZW50aXRpZXMuanNvblwiKSksXG4gICAgaHRtbFJlcGxhY2VyID0gZ2V0SW52ZXJzZVJlcGxhY2VyKGludmVyc2VIVE1MKTtcblxuZXhwb3J0cy5IVE1MID0gZ2V0SW52ZXJzZShpbnZlcnNlSFRNTCwgaHRtbFJlcGxhY2VyKTtcblxuZnVuY3Rpb24gZ2V0SW52ZXJzZU9iaihvYmope1xuXHRyZXR1cm4gT2JqZWN0LmtleXMob2JqKS5zb3J0KCkucmVkdWNlKGZ1bmN0aW9uKGludmVyc2UsIG5hbWUpe1xuXHRcdGludmVyc2Vbb2JqW25hbWVdXSA9IFwiJlwiICsgbmFtZSArIFwiO1wiO1xuXHRcdHJldHVybiBpbnZlcnNlO1xuXHR9LCB7fSk7XG59XG5cbmZ1bmN0aW9uIGdldEludmVyc2VSZXBsYWNlcihpbnZlcnNlKXtcblx0dmFyIHNpbmdsZSA9IFtdLFxuXHQgICAgbXVsdGlwbGUgPSBbXTtcblxuXHRPYmplY3Qua2V5cyhpbnZlcnNlKS5mb3JFYWNoKGZ1bmN0aW9uKGspe1xuXHRcdGlmKGsubGVuZ3RoID09PSAxKXtcblx0XHRcdHNpbmdsZS5wdXNoKFwiXFxcXFwiICsgayk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG11bHRpcGxlLnB1c2goayk7XG5cdFx0fVxuXHR9KTtcblxuXHQvL1RPRE8gYWRkIHJhbmdlc1xuXHRtdWx0aXBsZS51bnNoaWZ0KFwiW1wiICsgc2luZ2xlLmpvaW4oXCJcIikgKyBcIl1cIik7XG5cblx0cmV0dXJuIG5ldyBSZWdFeHAobXVsdGlwbGUuam9pbihcInxcIiksIFwiZ1wiKTtcbn1cblxudmFyIHJlX25vbkFTQ0lJID0gL1teXFwwLVxceDdGXS9nLFxuICAgIHJlX2FzdHJhbFN5bWJvbHMgPSAvW1xcdUQ4MDAtXFx1REJGRl1bXFx1REMwMC1cXHVERkZGXS9nO1xuXG5mdW5jdGlvbiBzaW5nbGVDaGFyUmVwbGFjZXIoYyl7XG5cdHJldHVybiBcIiYjeFwiICsgYy5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpICsgXCI7XCI7XG59XG5cbmZ1bmN0aW9uIGFzdHJhbFJlcGxhY2VyKGMpe1xuXHQvLyBodHRwOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nI3N1cnJvZ2F0ZS1mb3JtdWxhZVxuXHR2YXIgaGlnaCA9IGMuY2hhckNvZGVBdCgwKTtcblx0dmFyIGxvdyAgPSBjLmNoYXJDb2RlQXQoMSk7XG5cdHZhciBjb2RlUG9pbnQgPSAoaGlnaCAtIDB4RDgwMCkgKiAweDQwMCArIGxvdyAtIDB4REMwMCArIDB4MTAwMDA7XG5cdHJldHVybiBcIiYjeFwiICsgY29kZVBvaW50LnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpICsgXCI7XCI7XG59XG5cbmZ1bmN0aW9uIGdldEludmVyc2UoaW52ZXJzZSwgcmUpe1xuXHRmdW5jdGlvbiBmdW5jKG5hbWUpe1xuXHRcdHJldHVybiBpbnZlcnNlW25hbWVdO1xuXHR9XG5cblx0cmV0dXJuIGZ1bmN0aW9uKGRhdGEpe1xuXHRcdHJldHVybiBkYXRhXG5cdFx0XHRcdC5yZXBsYWNlKHJlLCBmdW5jKVxuXHRcdFx0XHQucmVwbGFjZShyZV9hc3RyYWxTeW1ib2xzLCBhc3RyYWxSZXBsYWNlcilcblx0XHRcdFx0LnJlcGxhY2UocmVfbm9uQVNDSUksIHNpbmdsZUNoYXJSZXBsYWNlcik7XG5cdH07XG59XG5cbnZhciByZV94bWxDaGFycyA9IGdldEludmVyc2VSZXBsYWNlcihpbnZlcnNlWE1MKTtcblxuZnVuY3Rpb24gZXNjYXBlWE1MKGRhdGEpe1xuXHRyZXR1cm4gZGF0YVxuXHRcdFx0LnJlcGxhY2UocmVfeG1sQ2hhcnMsIHNpbmdsZUNoYXJSZXBsYWNlcilcblx0XHRcdC5yZXBsYWNlKHJlX2FzdHJhbFN5bWJvbHMsIGFzdHJhbFJlcGxhY2VyKVxuXHRcdFx0LnJlcGxhY2UocmVfbm9uQVNDSUksIHNpbmdsZUNoYXJSZXBsYWNlcik7XG59XG5cbmV4cG9ydHMuZXNjYXBlID0gZXNjYXBlWE1MO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2VudGl0aWVzL2xpYi9lbmNvZGUuanNcbi8vIG1vZHVsZSBpZCA9IDU2NlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IHtcblx0XCIwXCI6IDY1NTMzLFxuXHRcIjEyOFwiOiA4MzY0LFxuXHRcIjEzMFwiOiA4MjE4LFxuXHRcIjEzMVwiOiA0MDIsXG5cdFwiMTMyXCI6IDgyMjIsXG5cdFwiMTMzXCI6IDgyMzAsXG5cdFwiMTM0XCI6IDgyMjQsXG5cdFwiMTM1XCI6IDgyMjUsXG5cdFwiMTM2XCI6IDcxMCxcblx0XCIxMzdcIjogODI0MCxcblx0XCIxMzhcIjogMzUyLFxuXHRcIjEzOVwiOiA4MjQ5LFxuXHRcIjE0MFwiOiAzMzgsXG5cdFwiMTQyXCI6IDM4MSxcblx0XCIxNDVcIjogODIxNixcblx0XCIxNDZcIjogODIxNyxcblx0XCIxNDdcIjogODIyMCxcblx0XCIxNDhcIjogODIyMSxcblx0XCIxNDlcIjogODIyNixcblx0XCIxNTBcIjogODIxMSxcblx0XCIxNTFcIjogODIxMixcblx0XCIxNTJcIjogNzMyLFxuXHRcIjE1M1wiOiA4NDgyLFxuXHRcIjE1NFwiOiAzNTMsXG5cdFwiMTU1XCI6IDgyNTAsXG5cdFwiMTU2XCI6IDMzOSxcblx0XCIxNThcIjogMzgyLFxuXHRcIjE1OVwiOiAzNzZcbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2VudGl0aWVzL21hcHMvZGVjb2RlLmpzb25cbi8vIG1vZHVsZSBpZCA9IDU2N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IHtcblx0XCJBYWN1dGVcIjogXCLDgVwiLFxuXHRcImFhY3V0ZVwiOiBcIsOhXCIsXG5cdFwiQWNpcmNcIjogXCLDglwiLFxuXHRcImFjaXJjXCI6IFwiw6JcIixcblx0XCJhY3V0ZVwiOiBcIsK0XCIsXG5cdFwiQUVsaWdcIjogXCLDhlwiLFxuXHRcImFlbGlnXCI6IFwiw6ZcIixcblx0XCJBZ3JhdmVcIjogXCLDgFwiLFxuXHRcImFncmF2ZVwiOiBcIsOgXCIsXG5cdFwiYW1wXCI6IFwiJlwiLFxuXHRcIkFNUFwiOiBcIiZcIixcblx0XCJBcmluZ1wiOiBcIsOFXCIsXG5cdFwiYXJpbmdcIjogXCLDpVwiLFxuXHRcIkF0aWxkZVwiOiBcIsODXCIsXG5cdFwiYXRpbGRlXCI6IFwiw6NcIixcblx0XCJBdW1sXCI6IFwiw4RcIixcblx0XCJhdW1sXCI6IFwiw6RcIixcblx0XCJicnZiYXJcIjogXCLCplwiLFxuXHRcIkNjZWRpbFwiOiBcIsOHXCIsXG5cdFwiY2NlZGlsXCI6IFwiw6dcIixcblx0XCJjZWRpbFwiOiBcIsK4XCIsXG5cdFwiY2VudFwiOiBcIsKiXCIsXG5cdFwiY29weVwiOiBcIsKpXCIsXG5cdFwiQ09QWVwiOiBcIsKpXCIsXG5cdFwiY3VycmVuXCI6IFwiwqRcIixcblx0XCJkZWdcIjogXCLCsFwiLFxuXHRcImRpdmlkZVwiOiBcIsO3XCIsXG5cdFwiRWFjdXRlXCI6IFwiw4lcIixcblx0XCJlYWN1dGVcIjogXCLDqVwiLFxuXHRcIkVjaXJjXCI6IFwiw4pcIixcblx0XCJlY2lyY1wiOiBcIsOqXCIsXG5cdFwiRWdyYXZlXCI6IFwiw4hcIixcblx0XCJlZ3JhdmVcIjogXCLDqFwiLFxuXHRcIkVUSFwiOiBcIsOQXCIsXG5cdFwiZXRoXCI6IFwiw7BcIixcblx0XCJFdW1sXCI6IFwiw4tcIixcblx0XCJldW1sXCI6IFwiw6tcIixcblx0XCJmcmFjMTJcIjogXCLCvVwiLFxuXHRcImZyYWMxNFwiOiBcIsK8XCIsXG5cdFwiZnJhYzM0XCI6IFwiwr5cIixcblx0XCJndFwiOiBcIj5cIixcblx0XCJHVFwiOiBcIj5cIixcblx0XCJJYWN1dGVcIjogXCLDjVwiLFxuXHRcImlhY3V0ZVwiOiBcIsOtXCIsXG5cdFwiSWNpcmNcIjogXCLDjlwiLFxuXHRcImljaXJjXCI6IFwiw65cIixcblx0XCJpZXhjbFwiOiBcIsKhXCIsXG5cdFwiSWdyYXZlXCI6IFwiw4xcIixcblx0XCJpZ3JhdmVcIjogXCLDrFwiLFxuXHRcImlxdWVzdFwiOiBcIsK/XCIsXG5cdFwiSXVtbFwiOiBcIsOPXCIsXG5cdFwiaXVtbFwiOiBcIsOvXCIsXG5cdFwibGFxdW9cIjogXCLCq1wiLFxuXHRcImx0XCI6IFwiPFwiLFxuXHRcIkxUXCI6IFwiPFwiLFxuXHRcIm1hY3JcIjogXCLCr1wiLFxuXHRcIm1pY3JvXCI6IFwiwrVcIixcblx0XCJtaWRkb3RcIjogXCLCt1wiLFxuXHRcIm5ic3BcIjogXCLCoFwiLFxuXHRcIm5vdFwiOiBcIsKsXCIsXG5cdFwiTnRpbGRlXCI6IFwiw5FcIixcblx0XCJudGlsZGVcIjogXCLDsVwiLFxuXHRcIk9hY3V0ZVwiOiBcIsOTXCIsXG5cdFwib2FjdXRlXCI6IFwiw7NcIixcblx0XCJPY2lyY1wiOiBcIsOUXCIsXG5cdFwib2NpcmNcIjogXCLDtFwiLFxuXHRcIk9ncmF2ZVwiOiBcIsOSXCIsXG5cdFwib2dyYXZlXCI6IFwiw7JcIixcblx0XCJvcmRmXCI6IFwiwqpcIixcblx0XCJvcmRtXCI6IFwiwrpcIixcblx0XCJPc2xhc2hcIjogXCLDmFwiLFxuXHRcIm9zbGFzaFwiOiBcIsO4XCIsXG5cdFwiT3RpbGRlXCI6IFwiw5VcIixcblx0XCJvdGlsZGVcIjogXCLDtVwiLFxuXHRcIk91bWxcIjogXCLDllwiLFxuXHRcIm91bWxcIjogXCLDtlwiLFxuXHRcInBhcmFcIjogXCLCtlwiLFxuXHRcInBsdXNtblwiOiBcIsKxXCIsXG5cdFwicG91bmRcIjogXCLCo1wiLFxuXHRcInF1b3RcIjogXCJcXFwiXCIsXG5cdFwiUVVPVFwiOiBcIlxcXCJcIixcblx0XCJyYXF1b1wiOiBcIsK7XCIsXG5cdFwicmVnXCI6IFwiwq5cIixcblx0XCJSRUdcIjogXCLCrlwiLFxuXHRcInNlY3RcIjogXCLCp1wiLFxuXHRcInNoeVwiOiBcIsKtXCIsXG5cdFwic3VwMVwiOiBcIsK5XCIsXG5cdFwic3VwMlwiOiBcIsKyXCIsXG5cdFwic3VwM1wiOiBcIsKzXCIsXG5cdFwic3psaWdcIjogXCLDn1wiLFxuXHRcIlRIT1JOXCI6IFwiw55cIixcblx0XCJ0aG9yblwiOiBcIsO+XCIsXG5cdFwidGltZXNcIjogXCLDl1wiLFxuXHRcIlVhY3V0ZVwiOiBcIsOaXCIsXG5cdFwidWFjdXRlXCI6IFwiw7pcIixcblx0XCJVY2lyY1wiOiBcIsObXCIsXG5cdFwidWNpcmNcIjogXCLDu1wiLFxuXHRcIlVncmF2ZVwiOiBcIsOZXCIsXG5cdFwidWdyYXZlXCI6IFwiw7lcIixcblx0XCJ1bWxcIjogXCLCqFwiLFxuXHRcIlV1bWxcIjogXCLDnFwiLFxuXHRcInV1bWxcIjogXCLDvFwiLFxuXHRcIllhY3V0ZVwiOiBcIsOdXCIsXG5cdFwieWFjdXRlXCI6IFwiw71cIixcblx0XCJ5ZW5cIjogXCLCpVwiLFxuXHRcInl1bWxcIjogXCLDv1wiXG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9lbnRpdGllcy9tYXBzL2xlZ2FjeS5qc29uXG4vLyBtb2R1bGUgaWQgPSA1Njhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBsb2Rhc2ggKEN1c3RvbSBCdWlsZCkgPGh0dHBzOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIGV4cG9ydHM9XCJucG1cIiAtbyAuL2BcbiAqIENvcHlyaWdodCBqUXVlcnkgRm91bmRhdGlvbiBhbmQgb3RoZXIgY29udHJpYnV0b3JzIDxodHRwczovL2pxdWVyeS5vcmcvPlxuICogUmVsZWFzZWQgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHBzOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjguMyA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICovXG5cbi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nLFxuICAgIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIGdlblRhZyA9ICdbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXSc7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCB1bnNpZ25lZCBpbnRlZ2VyIHZhbHVlcy4gKi9cbnZhciByZUlzVWludCA9IC9eKD86MHxbMS05XVxcZCopJC87XG5cbi8qKlxuICogQSBmYXN0ZXIgYWx0ZXJuYXRpdmUgdG8gYEZ1bmN0aW9uI2FwcGx5YCwgdGhpcyBmdW5jdGlvbiBpbnZva2VzIGBmdW5jYFxuICogd2l0aCB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgYHRoaXNBcmdgIGFuZCB0aGUgYXJndW1lbnRzIG9mIGBhcmdzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gaW52b2tlLlxuICogQHBhcmFtIHsqfSB0aGlzQXJnIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgZnVuY2AuXG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzIFRoZSBhcmd1bWVudHMgdG8gaW52b2tlIGBmdW5jYCB3aXRoLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHJlc3VsdCBvZiBgZnVuY2AuXG4gKi9cbmZ1bmN0aW9uIGFwcGx5KGZ1bmMsIHRoaXNBcmcsIGFyZ3MpIHtcbiAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgIGNhc2UgMDogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnKTtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYXJnc1swXSk7XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFyZ3NbMF0sIGFyZ3NbMV0pO1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKTtcbiAgfVxuICByZXR1cm4gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbn1cblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy50aW1lc2Agd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzXG4gKiBvciBtYXggYXJyYXkgbGVuZ3RoIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IG4gVGhlIG51bWJlciBvZiB0aW1lcyB0byBpbnZva2UgYGl0ZXJhdGVlYC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHJlc3VsdHMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VUaW1lcyhuLCBpdGVyYXRlZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIHJlc3VsdCA9IEFycmF5KG4pO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbikge1xuICAgIHJlc3VsdFtpbmRleF0gPSBpdGVyYXRlZShpbmRleCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgdW5hcnkgZnVuY3Rpb24gdGhhdCBpbnZva2VzIGBmdW5jYCB3aXRoIGl0cyBhcmd1bWVudCB0cmFuc2Zvcm1lZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gd3JhcC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRyYW5zZm9ybSBUaGUgYXJndW1lbnQgdHJhbnNmb3JtLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIG92ZXJBcmcoZnVuYywgdHJhbnNmb3JtKSB7XG4gIHJldHVybiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gZnVuYyh0cmFuc2Zvcm0oYXJnKSk7XG4gIH07XG59XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IG9iamVjdFByb3RvLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlS2V5cyA9IG92ZXJBcmcoT2JqZWN0LmtleXMsIE9iamVjdCksXG4gICAgbmF0aXZlTWF4ID0gTWF0aC5tYXg7XG5cbi8qKiBEZXRlY3QgaWYgcHJvcGVydGllcyBzaGFkb3dpbmcgdGhvc2Ugb24gYE9iamVjdC5wcm90b3R5cGVgIGFyZSBub24tZW51bWVyYWJsZS4gKi9cbnZhciBub25FbnVtU2hhZG93cyA9ICFwcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHsgJ3ZhbHVlT2YnOiAxIH0sICd2YWx1ZU9mJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiB0aGUgYXJyYXktbGlrZSBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaW5oZXJpdGVkIFNwZWNpZnkgcmV0dXJuaW5nIGluaGVyaXRlZCBwcm9wZXJ0eSBuYW1lcy5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGFycmF5TGlrZUtleXModmFsdWUsIGluaGVyaXRlZCkge1xuICAvLyBTYWZhcmkgOC4xIG1ha2VzIGBhcmd1bWVudHMuY2FsbGVlYCBlbnVtZXJhYmxlIGluIHN0cmljdCBtb2RlLlxuICAvLyBTYWZhcmkgOSBtYWtlcyBgYXJndW1lbnRzLmxlbmd0aGAgZW51bWVyYWJsZSBpbiBzdHJpY3QgbW9kZS5cbiAgdmFyIHJlc3VsdCA9IChpc0FycmF5KHZhbHVlKSB8fCBpc0FyZ3VtZW50cyh2YWx1ZSkpXG4gICAgPyBiYXNlVGltZXModmFsdWUubGVuZ3RoLCBTdHJpbmcpXG4gICAgOiBbXTtcblxuICB2YXIgbGVuZ3RoID0gcmVzdWx0Lmxlbmd0aCxcbiAgICAgIHNraXBJbmRleGVzID0gISFsZW5ndGg7XG5cbiAgZm9yICh2YXIga2V5IGluIHZhbHVlKSB7XG4gICAgaWYgKChpbmhlcml0ZWQgfHwgaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwga2V5KSkgJiZcbiAgICAgICAgIShza2lwSW5kZXhlcyAmJiAoa2V5ID09ICdsZW5ndGgnIHx8IGlzSW5kZXgoa2V5LCBsZW5ndGgpKSkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogQXNzaWducyBgdmFsdWVgIHRvIGBrZXlgIG9mIGBvYmplY3RgIGlmIHRoZSBleGlzdGluZyB2YWx1ZSBpcyBub3QgZXF1aXZhbGVudFxuICogdXNpbmcgW2BTYW1lVmFsdWVaZXJvYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtc2FtZXZhbHVlemVybylcbiAqIGZvciBlcXVhbGl0eSBjb21wYXJpc29ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYXNzaWduLlxuICovXG5mdW5jdGlvbiBhc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgdmFyIG9ialZhbHVlID0gb2JqZWN0W2tleV07XG4gIGlmICghKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpICYmIGVxKG9ialZhbHVlLCB2YWx1ZSkpIHx8XG4gICAgICAodmFsdWUgPT09IHVuZGVmaW5lZCAmJiAhKGtleSBpbiBvYmplY3QpKSkge1xuICAgIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5rZXlzYCB3aGljaCBkb2Vzbid0IHRyZWF0IHNwYXJzZSBhcnJheXMgYXMgZGVuc2UuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VLZXlzKG9iamVjdCkge1xuICBpZiAoIWlzUHJvdG90eXBlKG9iamVjdCkpIHtcbiAgICByZXR1cm4gbmF0aXZlS2V5cyhvYmplY3QpO1xuICB9XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIE9iamVjdChvYmplY3QpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpICYmIGtleSAhPSAnY29uc3RydWN0b3InKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnJlc3RgIHdoaWNoIGRvZXNuJ3QgdmFsaWRhdGUgb3IgY29lcmNlIGFyZ3VtZW50cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gYXBwbHkgYSByZXN0IHBhcmFtZXRlciB0by5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbc3RhcnQ9ZnVuYy5sZW5ndGgtMV0gVGhlIHN0YXJ0IHBvc2l0aW9uIG9mIHRoZSByZXN0IHBhcmFtZXRlci5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlUmVzdChmdW5jLCBzdGFydCkge1xuICBzdGFydCA9IG5hdGl2ZU1heChzdGFydCA9PT0gdW5kZWZpbmVkID8gKGZ1bmMubGVuZ3RoIC0gMSkgOiBzdGFydCwgMCk7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gbmF0aXZlTWF4KGFyZ3MubGVuZ3RoIC0gc3RhcnQsIDApLFxuICAgICAgICBhcnJheSA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgYXJyYXlbaW5kZXhdID0gYXJnc1tzdGFydCArIGluZGV4XTtcbiAgICB9XG4gICAgaW5kZXggPSAtMTtcbiAgICB2YXIgb3RoZXJBcmdzID0gQXJyYXkoc3RhcnQgKyAxKTtcbiAgICB3aGlsZSAoKytpbmRleCA8IHN0YXJ0KSB7XG4gICAgICBvdGhlckFyZ3NbaW5kZXhdID0gYXJnc1tpbmRleF07XG4gICAgfVxuICAgIG90aGVyQXJnc1tzdGFydF0gPSBhcnJheTtcbiAgICByZXR1cm4gYXBwbHkoZnVuYywgdGhpcywgb3RoZXJBcmdzKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBDb3BpZXMgcHJvcGVydGllcyBvZiBgc291cmNlYCB0byBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tLlxuICogQHBhcmFtIHtBcnJheX0gcHJvcHMgVGhlIHByb3BlcnR5IGlkZW50aWZpZXJzIHRvIGNvcHkuXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdD17fV0gVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgdG8uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb3BpZWQgdmFsdWVzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gY29weU9iamVjdChzb3VyY2UsIHByb3BzLCBvYmplY3QsIGN1c3RvbWl6ZXIpIHtcbiAgb2JqZWN0IHx8IChvYmplY3QgPSB7fSk7XG5cbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIga2V5ID0gcHJvcHNbaW5kZXhdO1xuXG4gICAgdmFyIG5ld1ZhbHVlID0gY3VzdG9taXplclxuICAgICAgPyBjdXN0b21pemVyKG9iamVjdFtrZXldLCBzb3VyY2Vba2V5XSwga2V5LCBvYmplY3QsIHNvdXJjZSlcbiAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgYXNzaWduVmFsdWUob2JqZWN0LCBrZXksIG5ld1ZhbHVlID09PSB1bmRlZmluZWQgPyBzb3VyY2Vba2V5XSA6IG5ld1ZhbHVlKTtcbiAgfVxuICByZXR1cm4gb2JqZWN0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiBsaWtlIGBfLmFzc2lnbmAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGFzc2lnbmVyIFRoZSBmdW5jdGlvbiB0byBhc3NpZ24gdmFsdWVzLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYXNzaWduZXIgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUFzc2lnbmVyKGFzc2lnbmVyKSB7XG4gIHJldHVybiBiYXNlUmVzdChmdW5jdGlvbihvYmplY3QsIHNvdXJjZXMpIHtcbiAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gc291cmNlcy5sZW5ndGgsXG4gICAgICAgIGN1c3RvbWl6ZXIgPSBsZW5ndGggPiAxID8gc291cmNlc1tsZW5ndGggLSAxXSA6IHVuZGVmaW5lZCxcbiAgICAgICAgZ3VhcmQgPSBsZW5ndGggPiAyID8gc291cmNlc1syXSA6IHVuZGVmaW5lZDtcblxuICAgIGN1c3RvbWl6ZXIgPSAoYXNzaWduZXIubGVuZ3RoID4gMyAmJiB0eXBlb2YgY3VzdG9taXplciA9PSAnZnVuY3Rpb24nKVxuICAgICAgPyAobGVuZ3RoLS0sIGN1c3RvbWl6ZXIpXG4gICAgICA6IHVuZGVmaW5lZDtcblxuICAgIGlmIChndWFyZCAmJiBpc0l0ZXJhdGVlQ2FsbChzb3VyY2VzWzBdLCBzb3VyY2VzWzFdLCBndWFyZCkpIHtcbiAgICAgIGN1c3RvbWl6ZXIgPSBsZW5ndGggPCAzID8gdW5kZWZpbmVkIDogY3VzdG9taXplcjtcbiAgICAgIGxlbmd0aCA9IDE7XG4gICAgfVxuICAgIG9iamVjdCA9IE9iamVjdChvYmplY3QpO1xuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICB2YXIgc291cmNlID0gc291cmNlc1tpbmRleF07XG4gICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgIGFzc2lnbmVyKG9iamVjdCwgc291cmNlLCBpbmRleCwgY3VzdG9taXplcik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG4gIH0pO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBpbmRleC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcGFyYW0ge251bWJlcn0gW2xlbmd0aD1NQVhfU0FGRV9JTlRFR0VSXSBUaGUgdXBwZXIgYm91bmRzIG9mIGEgdmFsaWQgaW5kZXguXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGluZGV4LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzSW5kZXgodmFsdWUsIGxlbmd0aCkge1xuICBsZW5ndGggPSBsZW5ndGggPT0gbnVsbCA/IE1BWF9TQUZFX0lOVEVHRVIgOiBsZW5ndGg7XG4gIHJldHVybiAhIWxlbmd0aCAmJlxuICAgICh0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicgfHwgcmVJc1VpbnQudGVzdCh2YWx1ZSkpICYmXG4gICAgKHZhbHVlID4gLTEgJiYgdmFsdWUgJSAxID09IDAgJiYgdmFsdWUgPCBsZW5ndGgpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gYXJndW1lbnRzIGFyZSBmcm9tIGFuIGl0ZXJhdGVlIGNhbGwuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHBvdGVudGlhbCBpdGVyYXRlZSB2YWx1ZSBhcmd1bWVudC5cbiAqIEBwYXJhbSB7Kn0gaW5kZXggVGhlIHBvdGVudGlhbCBpdGVyYXRlZSBpbmRleCBvciBrZXkgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IG9iamVjdCBUaGUgcG90ZW50aWFsIGl0ZXJhdGVlIG9iamVjdCBhcmd1bWVudC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYXJndW1lbnRzIGFyZSBmcm9tIGFuIGl0ZXJhdGVlIGNhbGwsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0l0ZXJhdGVlQ2FsbCh2YWx1ZSwgaW5kZXgsIG9iamVjdCkge1xuICBpZiAoIWlzT2JqZWN0KG9iamVjdCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHR5cGUgPSB0eXBlb2YgaW5kZXg7XG4gIGlmICh0eXBlID09ICdudW1iZXInXG4gICAgICAgID8gKGlzQXJyYXlMaWtlKG9iamVjdCkgJiYgaXNJbmRleChpbmRleCwgb2JqZWN0Lmxlbmd0aCkpXG4gICAgICAgIDogKHR5cGUgPT0gJ3N0cmluZycgJiYgaW5kZXggaW4gb2JqZWN0KVxuICAgICAgKSB7XG4gICAgcmV0dXJuIGVxKG9iamVjdFtpbmRleF0sIHZhbHVlKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgbGlrZWx5IGEgcHJvdG90eXBlIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHByb3RvdHlwZSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc1Byb3RvdHlwZSh2YWx1ZSkge1xuICB2YXIgQ3RvciA9IHZhbHVlICYmIHZhbHVlLmNvbnN0cnVjdG9yLFxuICAgICAgcHJvdG8gPSAodHlwZW9mIEN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBDdG9yLnByb3RvdHlwZSkgfHwgb2JqZWN0UHJvdG87XG5cbiAgcmV0dXJuIHZhbHVlID09PSBwcm90bztcbn1cblxuLyoqXG4gKiBQZXJmb3JtcyBhXG4gKiBbYFNhbWVWYWx1ZVplcm9gXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1zYW1ldmFsdWV6ZXJvKVxuICogY29tcGFyaXNvbiBiZXR3ZWVuIHR3byB2YWx1ZXMgdG8gZGV0ZXJtaW5lIGlmIHRoZXkgYXJlIGVxdWl2YWxlbnQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0geyp9IG90aGVyIFRoZSBvdGhlciB2YWx1ZSB0byBjb21wYXJlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ2EnOiAxIH07XG4gKiB2YXIgb3RoZXIgPSB7ICdhJzogMSB9O1xuICpcbiAqIF8uZXEob2JqZWN0LCBvYmplY3QpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEob2JqZWN0LCBvdGhlcik7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoJ2EnLCAnYScpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEoJ2EnLCBPYmplY3QoJ2EnKSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoTmFOLCBOYU4pO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBlcSh2YWx1ZSwgb3RoZXIpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBvdGhlciB8fCAodmFsdWUgIT09IHZhbHVlICYmIG90aGVyICE9PSBvdGhlcik7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgbGlrZWx5IGFuIGBhcmd1bWVudHNgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBgYXJndW1lbnRzYCBvYmplY3QsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJndW1lbnRzKGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcmd1bWVudHMoWzEsIDIsIDNdKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJndW1lbnRzKHZhbHVlKSB7XG4gIC8vIFNhZmFyaSA4LjEgbWFrZXMgYGFyZ3VtZW50cy5jYWxsZWVgIGVudW1lcmFibGUgaW4gc3RyaWN0IG1vZGUuXG4gIHJldHVybiBpc0FycmF5TGlrZU9iamVjdCh2YWx1ZSkgJiYgaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpICYmXG4gICAgKCFwcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHZhbHVlLCAnY2FsbGVlJykgfHwgb2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gYXJnc1RhZyk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhbiBgQXJyYXlgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXkoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXkoZG9jdW1lbnQuYm9keS5jaGlsZHJlbik7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNBcnJheSgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNBcnJheShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGFycmF5LWxpa2UuIEEgdmFsdWUgaXMgY29uc2lkZXJlZCBhcnJheS1saWtlIGlmIGl0J3NcbiAqIG5vdCBhIGZ1bmN0aW9uIGFuZCBoYXMgYSBgdmFsdWUubGVuZ3RoYCB0aGF0J3MgYW4gaW50ZWdlciBncmVhdGVyIHRoYW4gb3JcbiAqIGVxdWFsIHRvIGAwYCBhbmQgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIGBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUmAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZShkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKCdhYmMnKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiBpc0xlbmd0aCh2YWx1ZS5sZW5ndGgpICYmICFpc0Z1bmN0aW9uKHZhbHVlKTtcbn1cblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBpcyBsaWtlIGBfLmlzQXJyYXlMaWtlYCBleGNlcHQgdGhhdCBpdCBhbHNvIGNoZWNrcyBpZiBgdmFsdWVgXG4gKiBpcyBhbiBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYXJyYXktbGlrZSBvYmplY3QsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZU9iamVjdChkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlT2JqZWN0KCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5TGlrZU9iamVjdChfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUxpa2VPYmplY3QodmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgaXNBcnJheUxpa2UodmFsdWUpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgRnVuY3Rpb25gIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNGdW5jdGlvbihfKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oL2FiYy8pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICAvLyBUaGUgdXNlIG9mIGBPYmplY3QjdG9TdHJpbmdgIGF2b2lkcyBpc3N1ZXMgd2l0aCB0aGUgYHR5cGVvZmAgb3BlcmF0b3JcbiAgLy8gaW4gU2FmYXJpIDgtOSB3aGljaCByZXR1cm5zICdvYmplY3QnIGZvciB0eXBlZCBhcnJheSBhbmQgb3RoZXIgY29uc3RydWN0b3JzLlxuICB2YXIgdGFnID0gaXNPYmplY3QodmFsdWUpID8gb2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSkgOiAnJztcbiAgcmV0dXJuIHRhZyA9PSBmdW5jVGFnIHx8IHRhZyA9PSBnZW5UYWc7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGxlbmd0aC5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBtZXRob2QgaXMgbG9vc2VseSBiYXNlZCBvblxuICogW2BUb0xlbmd0aGBdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXRvbGVuZ3RoKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGxlbmd0aCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzTGVuZ3RoKDMpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNMZW5ndGgoTnVtYmVyLk1JTl9WQUxVRSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNMZW5ndGgoSW5maW5pdHkpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKCczJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0xlbmd0aCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdudW1iZXInICYmXG4gICAgdmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8PSBNQVhfU0FGRV9JTlRFR0VSO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZVxuICogW2xhbmd1YWdlIHR5cGVdKGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzKVxuICogb2YgYE9iamVjdGAuIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChfLm5vb3ApO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuICEhdmFsdWUgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gISF2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogQXNzaWducyBvd24gZW51bWVyYWJsZSBzdHJpbmcga2V5ZWQgcHJvcGVydGllcyBvZiBzb3VyY2Ugb2JqZWN0cyB0byB0aGVcbiAqIGRlc3RpbmF0aW9uIG9iamVjdC4gU291cmNlIG9iamVjdHMgYXJlIGFwcGxpZWQgZnJvbSBsZWZ0IHRvIHJpZ2h0LlxuICogU3Vic2VxdWVudCBzb3VyY2VzIG92ZXJ3cml0ZSBwcm9wZXJ0eSBhc3NpZ25tZW50cyBvZiBwcmV2aW91cyBzb3VyY2VzLlxuICpcbiAqICoqTm90ZToqKiBUaGlzIG1ldGhvZCBtdXRhdGVzIGBvYmplY3RgIGFuZCBpcyBsb29zZWx5IGJhc2VkIG9uXG4gKiBbYE9iamVjdC5hc3NpZ25gXShodHRwczovL21kbi5pby9PYmplY3QvYXNzaWduKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMTAuMFxuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICogQHBhcmFtIHsuLi5PYmplY3R9IFtzb3VyY2VzXSBUaGUgc291cmNlIG9iamVjdHMuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICogQHNlZSBfLmFzc2lnbkluXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqIH1cbiAqXG4gKiBmdW5jdGlvbiBCYXIoKSB7XG4gKiAgIHRoaXMuYyA9IDM7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5iID0gMjtcbiAqIEJhci5wcm90b3R5cGUuZCA9IDQ7XG4gKlxuICogXy5hc3NpZ24oeyAnYSc6IDAgfSwgbmV3IEZvbywgbmV3IEJhcik7XG4gKiAvLyA9PiB7ICdhJzogMSwgJ2MnOiAzIH1cbiAqL1xudmFyIGFzc2lnbiA9IGNyZWF0ZUFzc2lnbmVyKGZ1bmN0aW9uKG9iamVjdCwgc291cmNlKSB7XG4gIGlmIChub25FbnVtU2hhZG93cyB8fCBpc1Byb3RvdHlwZShzb3VyY2UpIHx8IGlzQXJyYXlMaWtlKHNvdXJjZSkpIHtcbiAgICBjb3B5T2JqZWN0KHNvdXJjZSwga2V5cyhzb3VyY2UpLCBvYmplY3QpO1xuICAgIHJldHVybjtcbiAgfVxuICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7XG4gICAgICBhc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgc291cmNlW2tleV0pO1xuICAgIH1cbiAgfVxufSk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgYG9iamVjdGAuXG4gKlxuICogKipOb3RlOioqIE5vbi1vYmplY3QgdmFsdWVzIGFyZSBjb2VyY2VkIHRvIG9iamVjdHMuIFNlZSB0aGVcbiAqIFtFUyBzcGVjXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3Qua2V5cylcbiAqIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogQHN0YXRpY1xuICogQHNpbmNlIDAuMS4wXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogICB0aGlzLmIgPSAyO1xuICogfVxuICpcbiAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG4gKlxuICogXy5rZXlzKG5ldyBGb28pO1xuICogLy8gPT4gWydhJywgJ2InXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICpcbiAqIF8ua2V5cygnaGknKTtcbiAqIC8vID0+IFsnMCcsICcxJ11cbiAqL1xuZnVuY3Rpb24ga2V5cyhvYmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXlMaWtlKG9iamVjdCkgPyBhcnJheUxpa2VLZXlzKG9iamVjdCkgOiBiYXNlS2V5cyhvYmplY3QpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFzc2lnbjtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9sb2Rhc2guYXNzaWduL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA1Njlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBsb2Rhc2ggKEN1c3RvbSBCdWlsZCkgPGh0dHBzOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIGV4cG9ydHM9XCJucG1cIiAtbyAuL2BcbiAqIENvcHlyaWdodCBqUXVlcnkgRm91bmRhdGlvbiBhbmQgb3RoZXIgY29udHJpYnV0b3JzIDxodHRwczovL2pxdWVyeS5vcmcvPlxuICogUmVsZWFzZWQgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHBzOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjguMyA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICovXG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIGhvc3Qgb2JqZWN0IGluIElFIDwgOS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIGhvc3Qgb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzSG9zdE9iamVjdCh2YWx1ZSkge1xuICAvLyBNYW55IGhvc3Qgb2JqZWN0cyBhcmUgYE9iamVjdGAgb2JqZWN0cyB0aGF0IGNhbiBjb2VyY2UgdG8gc3RyaW5nc1xuICAvLyBkZXNwaXRlIGhhdmluZyBpbXByb3Blcmx5IGRlZmluZWQgYHRvU3RyaW5nYCBtZXRob2RzLlxuICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gIGlmICh2YWx1ZSAhPSBudWxsICYmIHR5cGVvZiB2YWx1ZS50b1N0cmluZyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJlc3VsdCA9ICEhKHZhbHVlICsgJycpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgdW5hcnkgZnVuY3Rpb24gdGhhdCBpbnZva2VzIGBmdW5jYCB3aXRoIGl0cyBhcmd1bWVudCB0cmFuc2Zvcm1lZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gd3JhcC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRyYW5zZm9ybSBUaGUgYXJndW1lbnQgdHJhbnNmb3JtLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIG92ZXJBcmcoZnVuYywgdHJhbnNmb3JtKSB7XG4gIHJldHVybiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gZnVuYyh0cmFuc2Zvcm0oYXJnKSk7XG4gIH07XG59XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGUsXG4gICAgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gZnVuY1Byb3RvLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogVXNlZCB0byBpbmZlciB0aGUgYE9iamVjdGAgY29uc3RydWN0b3IuICovXG52YXIgb2JqZWN0Q3RvclN0cmluZyA9IGZ1bmNUb1N0cmluZy5jYWxsKE9iamVjdCk7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBnZXRQcm90b3R5cGUgPSBvdmVyQXJnKE9iamVjdC5nZXRQcm90b3R5cGVPZiwgT2JqZWN0KTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gISF2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBwbGFpbiBvYmplY3QsIHRoYXQgaXMsIGFuIG9iamVjdCBjcmVhdGVkIGJ5IHRoZVxuICogYE9iamVjdGAgY29uc3RydWN0b3Igb3Igb25lIHdpdGggYSBgW1tQcm90b3R5cGVdXWAgb2YgYG51bGxgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC44LjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcGxhaW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqIH1cbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QobmV3IEZvbyk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoeyAneCc6IDAsICd5JzogMCB9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoT2JqZWN0LmNyZWF0ZShudWxsKSk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdExpa2UodmFsdWUpIHx8XG4gICAgICBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKSAhPSBvYmplY3RUYWcgfHwgaXNIb3N0T2JqZWN0KHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgcHJvdG8gPSBnZXRQcm90b3R5cGUodmFsdWUpO1xuICBpZiAocHJvdG8gPT09IG51bGwpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB2YXIgQ3RvciA9IGhhc093blByb3BlcnR5LmNhbGwocHJvdG8sICdjb25zdHJ1Y3RvcicpICYmIHByb3RvLmNvbnN0cnVjdG9yO1xuICByZXR1cm4gKHR5cGVvZiBDdG9yID09ICdmdW5jdGlvbicgJiZcbiAgICBDdG9yIGluc3RhbmNlb2YgQ3RvciAmJiBmdW5jVG9TdHJpbmcuY2FsbChDdG9yKSA9PSBvYmplY3RDdG9yU3RyaW5nKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc1BsYWluT2JqZWN0O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2xvZGFzaC5pc3BsYWlub2JqZWN0L2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA1NzBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXG4ndXNlIHN0cmljdCc7XG5cblxuLyogZXNsaW50LWRpc2FibGUgbm8tYml0d2lzZSAqL1xuXG52YXIgZGVjb2RlQ2FjaGUgPSB7fTtcblxuZnVuY3Rpb24gZ2V0RGVjb2RlQ2FjaGUoZXhjbHVkZSkge1xuICB2YXIgaSwgY2gsIGNhY2hlID0gZGVjb2RlQ2FjaGVbZXhjbHVkZV07XG4gIGlmIChjYWNoZSkgeyByZXR1cm4gY2FjaGU7IH1cblxuICBjYWNoZSA9IGRlY29kZUNhY2hlW2V4Y2x1ZGVdID0gW107XG5cbiAgZm9yIChpID0gMDsgaSA8IDEyODsgaSsrKSB7XG4gICAgY2ggPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGkpO1xuICAgIGNhY2hlLnB1c2goY2gpO1xuICB9XG5cbiAgZm9yIChpID0gMDsgaSA8IGV4Y2x1ZGUubGVuZ3RoOyBpKyspIHtcbiAgICBjaCA9IGV4Y2x1ZGUuY2hhckNvZGVBdChpKTtcbiAgICBjYWNoZVtjaF0gPSAnJScgKyAoJzAnICsgY2gudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCkpLnNsaWNlKC0yKTtcbiAgfVxuXG4gIHJldHVybiBjYWNoZTtcbn1cblxuXG4vLyBEZWNvZGUgcGVyY2VudC1lbmNvZGVkIHN0cmluZy5cbi8vXG5mdW5jdGlvbiBkZWNvZGUoc3RyaW5nLCBleGNsdWRlKSB7XG4gIHZhciBjYWNoZTtcblxuICBpZiAodHlwZW9mIGV4Y2x1ZGUgIT09ICdzdHJpbmcnKSB7XG4gICAgZXhjbHVkZSA9IGRlY29kZS5kZWZhdWx0Q2hhcnM7XG4gIH1cblxuICBjYWNoZSA9IGdldERlY29kZUNhY2hlKGV4Y2x1ZGUpO1xuXG4gIHJldHVybiBzdHJpbmcucmVwbGFjZSgvKCVbYS1mMC05XXsyfSkrL2dpLCBmdW5jdGlvbihzZXEpIHtcbiAgICB2YXIgaSwgbCwgYjEsIGIyLCBiMywgYjQsIGNocixcbiAgICAgICAgcmVzdWx0ID0gJyc7XG5cbiAgICBmb3IgKGkgPSAwLCBsID0gc2VxLmxlbmd0aDsgaSA8IGw7IGkgKz0gMykge1xuICAgICAgYjEgPSBwYXJzZUludChzZXEuc2xpY2UoaSArIDEsIGkgKyAzKSwgMTYpO1xuXG4gICAgICBpZiAoYjEgPCAweDgwKSB7XG4gICAgICAgIHJlc3VsdCArPSBjYWNoZVtiMV07XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoKGIxICYgMHhFMCkgPT09IDB4QzAgJiYgKGkgKyAzIDwgbCkpIHtcbiAgICAgICAgLy8gMTEweHh4eHggMTB4eHh4eHhcbiAgICAgICAgYjIgPSBwYXJzZUludChzZXEuc2xpY2UoaSArIDQsIGkgKyA2KSwgMTYpO1xuXG4gICAgICAgIGlmICgoYjIgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgIGNociA9ICgoYjEgPDwgNikgJiAweDdDMCkgfCAoYjIgJiAweDNGKTtcblxuICAgICAgICAgIGlmIChjaHIgPCAweDgwKSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gJ1xcdWZmZmRcXHVmZmZkJztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoY2hyKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpICs9IDM7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKChiMSAmIDB4RjApID09PSAweEUwICYmIChpICsgNiA8IGwpKSB7XG4gICAgICAgIC8vIDExMTB4eHh4IDEweHh4eHh4IDEweHh4eHh4XG4gICAgICAgIGIyID0gcGFyc2VJbnQoc2VxLnNsaWNlKGkgKyA0LCBpICsgNiksIDE2KTtcbiAgICAgICAgYjMgPSBwYXJzZUludChzZXEuc2xpY2UoaSArIDcsIGkgKyA5KSwgMTYpO1xuXG4gICAgICAgIGlmICgoYjIgJiAweEMwKSA9PT0gMHg4MCAmJiAoYjMgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgIGNociA9ICgoYjEgPDwgMTIpICYgMHhGMDAwKSB8ICgoYjIgPDwgNikgJiAweEZDMCkgfCAoYjMgJiAweDNGKTtcblxuICAgICAgICAgIGlmIChjaHIgPCAweDgwMCB8fCAoY2hyID49IDB4RDgwMCAmJiBjaHIgPD0gMHhERkZGKSkge1xuICAgICAgICAgICAgcmVzdWx0ICs9ICdcXHVmZmZkXFx1ZmZmZFxcdWZmZmQnO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShjaHIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGkgKz0gNjtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoKGIxICYgMHhGOCkgPT09IDB4RjAgJiYgKGkgKyA5IDwgbCkpIHtcbiAgICAgICAgLy8gMTExMTEweHggMTB4eHh4eHggMTB4eHh4eHggMTB4eHh4eHhcbiAgICAgICAgYjIgPSBwYXJzZUludChzZXEuc2xpY2UoaSArIDQsIGkgKyA2KSwgMTYpO1xuICAgICAgICBiMyA9IHBhcnNlSW50KHNlcS5zbGljZShpICsgNywgaSArIDkpLCAxNik7XG4gICAgICAgIGI0ID0gcGFyc2VJbnQoc2VxLnNsaWNlKGkgKyAxMCwgaSArIDEyKSwgMTYpO1xuXG4gICAgICAgIGlmICgoYjIgJiAweEMwKSA9PT0gMHg4MCAmJiAoYjMgJiAweEMwKSA9PT0gMHg4MCAmJiAoYjQgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgIGNociA9ICgoYjEgPDwgMTgpICYgMHgxQzAwMDApIHwgKChiMiA8PCAxMikgJiAweDNGMDAwKSB8ICgoYjMgPDwgNikgJiAweEZDMCkgfCAoYjQgJiAweDNGKTtcblxuICAgICAgICAgIGlmIChjaHIgPCAweDEwMDAwIHx8IGNociA+IDB4MTBGRkZGKSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gJ1xcdWZmZmRcXHVmZmZkXFx1ZmZmZFxcdWZmZmQnO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjaHIgLT0gMHgxMDAwMDtcbiAgICAgICAgICAgIHJlc3VsdCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4RDgwMCArIChjaHIgPj4gMTApLCAweERDMDAgKyAoY2hyICYgMHgzRkYpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpICs9IDk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmVzdWx0ICs9ICdcXHVmZmZkJztcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9KTtcbn1cblxuXG5kZWNvZGUuZGVmYXVsdENoYXJzICAgPSAnOy8/OkAmPSskLCMnO1xuZGVjb2RlLmNvbXBvbmVudENoYXJzID0gJyc7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBkZWNvZGU7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbWR1cmwvZGVjb2RlLmpzXG4vLyBtb2R1bGUgaWQgPSA1NzFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXG4ndXNlIHN0cmljdCc7XG5cblxudmFyIGVuY29kZUNhY2hlID0ge307XG5cblxuLy8gQ3JlYXRlIGEgbG9va3VwIGFycmF5IHdoZXJlIGFueXRoaW5nIGJ1dCBjaGFyYWN0ZXJzIGluIGBjaGFyc2Agc3RyaW5nXG4vLyBhbmQgYWxwaGFudW1lcmljIGNoYXJzIGlzIHBlcmNlbnQtZW5jb2RlZC5cbi8vXG5mdW5jdGlvbiBnZXRFbmNvZGVDYWNoZShleGNsdWRlKSB7XG4gIHZhciBpLCBjaCwgY2FjaGUgPSBlbmNvZGVDYWNoZVtleGNsdWRlXTtcbiAgaWYgKGNhY2hlKSB7IHJldHVybiBjYWNoZTsgfVxuXG4gIGNhY2hlID0gZW5jb2RlQ2FjaGVbZXhjbHVkZV0gPSBbXTtcblxuICBmb3IgKGkgPSAwOyBpIDwgMTI4OyBpKyspIHtcbiAgICBjaCA9IFN0cmluZy5mcm9tQ2hhckNvZGUoaSk7XG5cbiAgICBpZiAoL15bMC05YS16XSQvaS50ZXN0KGNoKSkge1xuICAgICAgLy8gYWx3YXlzIGFsbG93IHVuZW5jb2RlZCBhbHBoYW51bWVyaWMgY2hhcmFjdGVyc1xuICAgICAgY2FjaGUucHVzaChjaCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhY2hlLnB1c2goJyUnICsgKCcwJyArIGkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCkpLnNsaWNlKC0yKSk7XG4gICAgfVxuICB9XG5cbiAgZm9yIChpID0gMDsgaSA8IGV4Y2x1ZGUubGVuZ3RoOyBpKyspIHtcbiAgICBjYWNoZVtleGNsdWRlLmNoYXJDb2RlQXQoaSldID0gZXhjbHVkZVtpXTtcbiAgfVxuXG4gIHJldHVybiBjYWNoZTtcbn1cblxuXG4vLyBFbmNvZGUgdW5zYWZlIGNoYXJhY3RlcnMgd2l0aCBwZXJjZW50LWVuY29kaW5nLCBza2lwcGluZyBhbHJlYWR5XG4vLyBlbmNvZGVkIHNlcXVlbmNlcy5cbi8vXG4vLyAgLSBzdHJpbmcgICAgICAgLSBzdHJpbmcgdG8gZW5jb2RlXG4vLyAgLSBleGNsdWRlICAgICAgLSBsaXN0IG9mIGNoYXJhY3RlcnMgdG8gaWdub3JlIChpbiBhZGRpdGlvbiB0byBhLXpBLVowLTkpXG4vLyAgLSBrZWVwRXNjYXBlZCAgLSBkb24ndCBlbmNvZGUgJyUnIGluIGEgY29ycmVjdCBlc2NhcGUgc2VxdWVuY2UgKGRlZmF1bHQ6IHRydWUpXG4vL1xuZnVuY3Rpb24gZW5jb2RlKHN0cmluZywgZXhjbHVkZSwga2VlcEVzY2FwZWQpIHtcbiAgdmFyIGksIGwsIGNvZGUsIG5leHRDb2RlLCBjYWNoZSxcbiAgICAgIHJlc3VsdCA9ICcnO1xuXG4gIGlmICh0eXBlb2YgZXhjbHVkZSAhPT0gJ3N0cmluZycpIHtcbiAgICAvLyBlbmNvZGUoc3RyaW5nLCBrZWVwRXNjYXBlZClcbiAgICBrZWVwRXNjYXBlZCAgPSBleGNsdWRlO1xuICAgIGV4Y2x1ZGUgPSBlbmNvZGUuZGVmYXVsdENoYXJzO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBrZWVwRXNjYXBlZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBrZWVwRXNjYXBlZCA9IHRydWU7XG4gIH1cblxuICBjYWNoZSA9IGdldEVuY29kZUNhY2hlKGV4Y2x1ZGUpO1xuXG4gIGZvciAoaSA9IDAsIGwgPSBzdHJpbmcubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgY29kZSA9IHN0cmluZy5jaGFyQ29kZUF0KGkpO1xuXG4gICAgaWYgKGtlZXBFc2NhcGVkICYmIGNvZGUgPT09IDB4MjUgLyogJSAqLyAmJiBpICsgMiA8IGwpIHtcbiAgICAgIGlmICgvXlswLTlhLWZdezJ9JC9pLnRlc3Qoc3RyaW5nLnNsaWNlKGkgKyAxLCBpICsgMykpKSB7XG4gICAgICAgIHJlc3VsdCArPSBzdHJpbmcuc2xpY2UoaSwgaSArIDMpO1xuICAgICAgICBpICs9IDI7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb2RlIDwgMTI4KSB7XG4gICAgICByZXN1bHQgKz0gY2FjaGVbY29kZV07XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAoY29kZSA+PSAweEQ4MDAgJiYgY29kZSA8PSAweERGRkYpIHtcbiAgICAgIGlmIChjb2RlID49IDB4RDgwMCAmJiBjb2RlIDw9IDB4REJGRiAmJiBpICsgMSA8IGwpIHtcbiAgICAgICAgbmV4dENvZGUgPSBzdHJpbmcuY2hhckNvZGVBdChpICsgMSk7XG4gICAgICAgIGlmIChuZXh0Q29kZSA+PSAweERDMDAgJiYgbmV4dENvZGUgPD0gMHhERkZGKSB7XG4gICAgICAgICAgcmVzdWx0ICs9IGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdbaV0gKyBzdHJpbmdbaSArIDFdKTtcbiAgICAgICAgICBpKys7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlc3VsdCArPSAnJUVGJUJGJUJEJztcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHJlc3VsdCArPSBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5nW2ldKTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmVuY29kZS5kZWZhdWx0Q2hhcnMgICA9IFwiOy8/OkAmPSskLC1fLiF+KicoKSNcIjtcbmVuY29kZS5jb21wb25lbnRDaGFycyA9IFwiLV8uIX4qJygpXCI7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBlbmNvZGU7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbWR1cmwvZW5jb2RlLmpzXG4vLyBtb2R1bGUgaWQgPSA1NzJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyohXG4gKiBwYXNjYWxjYXNlIDxodHRwczovL2dpdGh1Yi5jb20vam9uc2NobGlua2VydC9wYXNjYWxjYXNlPlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNSwgSm9uIFNjaGxpbmtlcnQuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG4gKi9cblxuZnVuY3Rpb24gcGFzY2FsY2FzZShzdHIpIHtcbiAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhwZWN0ZWQgYSBzdHJpbmcuJyk7XG4gIH1cbiAgc3RyID0gc3RyLnJlcGxhY2UoLyhbQS1aXSkvZywgJyAkMScpO1xuICBpZiAoc3RyLmxlbmd0aCA9PT0gMSkgeyByZXR1cm4gc3RyLnRvVXBwZXJDYXNlKCk7IH1cbiAgc3RyID0gc3RyLnJlcGxhY2UoL15bXFxXX10rfFtcXFdfXSskL2csICcnKS50b0xvd2VyQ2FzZSgpO1xuICBzdHIgPSBzdHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSk7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvW1xcV19dKyhcXHd8JCkvZywgZnVuY3Rpb24gKF8sIGNoKSB7XG4gICAgcmV0dXJuIGNoLnRvVXBwZXJDYXNlKCk7XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBhc2NhbGNhc2U7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vcGFzY2FsY2FzZS9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gNTczXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBQYXJzZXIgPSByZXF1aXJlKCdjb21tb25tYXJrJykuUGFyc2VyO1xudmFyIFJlYWN0UmVuZGVyZXIgPSByZXF1aXJlKCdjb21tb25tYXJrLXJlYWN0LXJlbmRlcmVyJyk7XG52YXIgcHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG5mdW5jdGlvbiBSZWFjdE1hcmtkb3duKHByb3BzKSB7XG4gICAgUmVhY3QuQ29tcG9uZW50LmNhbGwodGhpcywgcHJvcHMpO1xufVxuXG5SZWFjdE1hcmtkb3duLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUmVhY3QuQ29tcG9uZW50LnByb3RvdHlwZSk7XG5SZWFjdE1hcmtkb3duLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFJlYWN0TWFya2Rvd247XG5cblJlYWN0TWFya2Rvd24ucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb250YWluZXJQcm9wcyA9IHRoaXMucHJvcHMuY29udGFpbmVyUHJvcHMgfHwge307XG4gICAgdmFyIHJlbmRlcmVyID0gbmV3IFJlYWN0UmVuZGVyZXIodGhpcy5wcm9wcyk7XG4gICAgdmFyIHBhcnNlciA9IG5ldyBQYXJzZXIodGhpcy5wcm9wcy5wYXJzZXJPcHRpb25zKTtcbiAgICB2YXIgYXN0ID0gcGFyc2VyLnBhcnNlKHRoaXMucHJvcHMuc291cmNlIHx8ICcnKTtcblxuICAgIGlmICh0aGlzLnByb3BzLndhbGtlcikge1xuICAgICAgICB2YXIgd2Fsa2VyID0gYXN0LndhbGtlcigpO1xuICAgICAgICB2YXIgZXZlbnQ7XG5cbiAgICAgICAgd2hpbGUgKChldmVudCA9IHdhbGtlci5uZXh0KCkpKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLndhbGtlci5jYWxsKHRoaXMsIGV2ZW50LCB3YWxrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucHJvcHMuY2xhc3NOYW1lKSB7XG4gICAgICAgIGNvbnRhaW5lclByb3BzLmNsYXNzTmFtZSA9IHRoaXMucHJvcHMuY2xhc3NOYW1lO1xuICAgIH1cblxuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50LmFwcGx5KFJlYWN0LFxuICAgICAgICBbdGhpcy5wcm9wcy5jb250YWluZXJUYWdOYW1lLCBjb250YWluZXJQcm9wcywgdGhpcy5wcm9wcy5jaGlsZEJlZm9yZV1cbiAgICAgICAgICAgIC5jb25jYXQocmVuZGVyZXIucmVuZGVyKGFzdCkuY29uY2F0KFxuICAgICAgICAgICAgICAgIFt0aGlzLnByb3BzLmNoaWxkQWZ0ZXJdXG4gICAgICAgICAgICApKVxuICAgICk7XG59O1xuXG5SZWFjdE1hcmtkb3duLnByb3BUeXBlcyA9IHtcbiAgICBjbGFzc05hbWU6IHByb3BUeXBlcy5zdHJpbmcsXG4gICAgY29udGFpbmVyUHJvcHM6IHByb3BUeXBlcy5vYmplY3QsXG4gICAgc291cmNlOiBwcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgY29udGFpbmVyVGFnTmFtZTogcHJvcFR5cGVzLnN0cmluZyxcbiAgICBjaGlsZEJlZm9yZTogcHJvcFR5cGVzLm9iamVjdCxcbiAgICBjaGlsZEFmdGVyOiBwcm9wVHlwZXMub2JqZWN0LFxuICAgIHNvdXJjZVBvczogcHJvcFR5cGVzLmJvb2wsXG4gICAgZXNjYXBlSHRtbDogcHJvcFR5cGVzLmJvb2wsXG4gICAgc2tpcEh0bWw6IHByb3BUeXBlcy5ib29sLFxuICAgIHNvZnRCcmVhazogcHJvcFR5cGVzLnN0cmluZyxcbiAgICBhbGxvd05vZGU6IHByb3BUeXBlcy5mdW5jLFxuICAgIGFsbG93ZWRUeXBlczogcHJvcFR5cGVzLmFycmF5LFxuICAgIGRpc2FsbG93ZWRUeXBlczogcHJvcFR5cGVzLmFycmF5LFxuICAgIHRyYW5zZm9ybUxpbmtVcmk6IHByb3BUeXBlcy5mdW5jLFxuICAgIHRyYW5zZm9ybUltYWdlVXJpOiBwcm9wVHlwZXMuZnVuYyxcbiAgICB1bndyYXBEaXNhbGxvd2VkOiBwcm9wVHlwZXMuYm9vbCxcbiAgICByZW5kZXJlcnM6IHByb3BUeXBlcy5vYmplY3QsXG4gICAgd2Fsa2VyOiBwcm9wVHlwZXMuZnVuYyxcbiAgICBwYXJzZXJPcHRpb25zOiBwcm9wVHlwZXMub2JqZWN0XG59O1xuXG5SZWFjdE1hcmtkb3duLmRlZmF1bHRQcm9wcyA9IHtcbiAgICBjb250YWluZXJUYWdOYW1lOiAnZGl2JyxcbiAgICBwYXJzZXJPcHRpb25zOiB7fVxufTtcblxuUmVhY3RNYXJrZG93bi50eXBlcyA9IFJlYWN0UmVuZGVyZXIudHlwZXM7XG5SZWFjdE1hcmtkb3duLnJlbmRlcmVycyA9IFJlYWN0UmVuZGVyZXIucmVuZGVyZXJzO1xuUmVhY3RNYXJrZG93bi51cmlUcmFuc2Zvcm1lciA9IFJlYWN0UmVuZGVyZXIudXJpVHJhbnNmb3JtZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3RNYXJrZG93bjtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9yZWFjdC1tYXJrZG93bi9zcmMvcmVhY3QtbWFya2Rvd24uanNcbi8vIG1vZHVsZSBpZCA9IDU3NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiEgaHR0cDovL210aHMuYmUvcmVwZWF0IHYwLjIuMCBieSBAbWF0aGlhcyAqL1xuaWYgKCFTdHJpbmcucHJvdG90eXBlLnJlcGVhdCkge1xuXHQoZnVuY3Rpb24oKSB7XG5cdFx0J3VzZSBzdHJpY3QnOyAvLyBuZWVkZWQgdG8gc3VwcG9ydCBgYXBwbHlgL2BjYWxsYCB3aXRoIGB1bmRlZmluZWRgL2BudWxsYFxuXHRcdHZhciBkZWZpbmVQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcblx0XHRcdC8vIElFIDggb25seSBzdXBwb3J0cyBgT2JqZWN0LmRlZmluZVByb3BlcnR5YCBvbiBET00gZWxlbWVudHNcblx0XHRcdHRyeSB7XG5cdFx0XHRcdHZhciBvYmplY3QgPSB7fTtcblx0XHRcdFx0dmFyICRkZWZpbmVQcm9wZXJ0eSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcblx0XHRcdFx0dmFyIHJlc3VsdCA9ICRkZWZpbmVQcm9wZXJ0eShvYmplY3QsIG9iamVjdCwgb2JqZWN0KSAmJiAkZGVmaW5lUHJvcGVydHk7XG5cdFx0XHR9IGNhdGNoKGVycm9yKSB7fVxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9KCkpO1xuXHRcdHZhciByZXBlYXQgPSBmdW5jdGlvbihjb3VudCkge1xuXHRcdFx0aWYgKHRoaXMgPT0gbnVsbCkge1xuXHRcdFx0XHR0aHJvdyBUeXBlRXJyb3IoKTtcblx0XHRcdH1cblx0XHRcdHZhciBzdHJpbmcgPSBTdHJpbmcodGhpcyk7XG5cdFx0XHQvLyBgVG9JbnRlZ2VyYFxuXHRcdFx0dmFyIG4gPSBjb3VudCA/IE51bWJlcihjb3VudCkgOiAwO1xuXHRcdFx0aWYgKG4gIT0gbikgeyAvLyBiZXR0ZXIgYGlzTmFOYFxuXHRcdFx0XHRuID0gMDtcblx0XHRcdH1cblx0XHRcdC8vIEFjY291bnQgZm9yIG91dC1vZi1ib3VuZHMgaW5kaWNlc1xuXHRcdFx0aWYgKG4gPCAwIHx8IG4gPT0gSW5maW5pdHkpIHtcblx0XHRcdFx0dGhyb3cgUmFuZ2VFcnJvcigpO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHJlc3VsdCA9ICcnO1xuXHRcdFx0d2hpbGUgKG4pIHtcblx0XHRcdFx0aWYgKG4gJSAyID09IDEpIHtcblx0XHRcdFx0XHRyZXN1bHQgKz0gc3RyaW5nO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChuID4gMSkge1xuXHRcdFx0XHRcdHN0cmluZyArPSBzdHJpbmc7XG5cdFx0XHRcdH1cblx0XHRcdFx0biA+Pj0gMTtcblx0XHRcdH1cblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fTtcblx0XHRpZiAoZGVmaW5lUHJvcGVydHkpIHtcblx0XHRcdGRlZmluZVByb3BlcnR5KFN0cmluZy5wcm90b3R5cGUsICdyZXBlYXQnLCB7XG5cdFx0XHRcdCd2YWx1ZSc6IHJlcGVhdCxcblx0XHRcdFx0J2NvbmZpZ3VyYWJsZSc6IHRydWUsXG5cdFx0XHRcdCd3cml0YWJsZSc6IHRydWVcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRTdHJpbmcucHJvdG90eXBlLnJlcGVhdCA9IHJlcGVhdDtcblx0XHR9XG5cdH0oKSk7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vc3RyaW5nLnByb3RvdHlwZS5yZXBlYXQvcmVwZWF0LmpzXG4vLyBtb2R1bGUgaWQgPSA1NzVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLypcbkNvcHlyaWdodCAoYykgMjAxNSwgWWFob28hIEluYy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbkNvcHlyaWdodHMgbGljZW5zZWQgdW5kZXIgdGhlIE5ldyBCU0QgTGljZW5zZS5cblNlZSB0aGUgYWNjb21wYW55aW5nIExJQ0VOU0UgZmlsZSBmb3IgdGVybXMuXG5cbkF1dGhvcnM6IE5lcmEgTGl1IDxuZXJhbGl1QHlhaG9vLWluYy5jb20+XG4gICAgICAgICBBZG9uaXMgRnVuZyA8YWRvbkB5YWhvby1pbmMuY29tPlxuICAgICAgICAgQWxiZXJ0IFl1IDxhbGJlcnR5dUB5YWhvby1pbmMuY29tPlxuKi9cbi8qanNoaW50IG5vZGU6IHRydWUgKi9cblxuZXhwb3J0cy5fZ2V0UHJpdkZpbHRlcnMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgTFQgICAgID0gLzwvZyxcbiAgICAgICAgUVVPVCAgID0gL1wiL2csXG4gICAgICAgIFNRVU9UICA9IC8nL2csXG4gICAgICAgIEFNUCAgICA9IC8mL2csXG4gICAgICAgIE5VTEwgICA9IC9cXHgwMC9nLFxuICAgICAgICBTUEVDSUFMX0FUVFJfVkFMVUVfVU5RVU9URURfQ0hBUlMgPSAvKD86XiR8W1xceDAwXFx4MDktXFx4MEQgXCInYD08Pl0pL2csXG4gICAgICAgIFNQRUNJQUxfSFRNTF9DSEFSUyA9IC9bJjw+XCInYF0vZywgXG4gICAgICAgIFNQRUNJQUxfQ09NTUVOVF9DSEFSUyA9IC8oPzpcXHgwMHxeLSohPz58LS0hPz58LS0/IT8kfFxcXT58XFxdJCkvZztcblxuICAgIC8vIENTUyBzZW5zaXRpdmUgY2hhcnM6ICgpXCInLywhKkB7fTo7XG4gICAgLy8gQnkgQ1NTOiAoVGFifE5ld0xpbmV8Y29sb258c2VtaXxscGFyfHJwYXJ8YXBvc3xzb2x8Y29tbWF8ZXhjbHxhc3R8bWlkYXN0KTt8KHF1b3R8UVVPVClcbiAgICAvLyBCeSBVUklfUFJPVE9DT0w6IChUYWJ8TmV3TGluZSk7XG4gICAgdmFyIFNFTlNJVElWRV9IVE1MX0VOVElUSUVTID0gLyYoPzojKFt4WF1bMC05QS1GYS1mXSt8XFxkKyk7P3woVGFifE5ld0xpbmV8Y29sb258c2VtaXxscGFyfHJwYXJ8YXBvc3xzb2x8Y29tbWF8ZXhjbHxhc3R8bWlkYXN0fGVuc3B8ZW1zcHx0aGluc3ApO3wobmJzcHxhbXB8QU1QfGx0fExUfGd0fEdUfHF1b3R8UVVPVCk7PykvZyxcbiAgICAgICAgU0VOU0lUSVZFX05BTUVEX1JFRl9NQVAgPSB7VGFiOiAnXFx0JywgTmV3TGluZTogJ1xcbicsIGNvbG9uOiAnOicsIHNlbWk6ICc7JywgbHBhcjogJygnLCBycGFyOiAnKScsIGFwb3M6ICdcXCcnLCBzb2w6ICcvJywgY29tbWE6ICcsJywgZXhjbDogJyEnLCBhc3Q6ICcqJywgbWlkYXN0OiAnKicsIGVuc3A6ICdcXHUyMDAyJywgZW1zcDogJ1xcdTIwMDMnLCB0aGluc3A6ICdcXHUyMDA5JywgbmJzcDogJ1xceEEwJywgYW1wOiAnJicsIGx0OiAnPCcsIGd0OiAnPicsIHF1b3Q6ICdcIicsIFFVT1Q6ICdcIid9O1xuXG4gICAgLy8gdmFyIENTU19WQUxJRF9WQUxVRSA9IFxuICAgIC8vICAgICAvXig/OlxuICAgIC8vICAgICAoPyEtKmV4cHJlc3Npb24pIz9bLVxcd10rXG4gICAgLy8gICAgIHxbKy1dPyg/OlxcZCt8XFxkKlxcLlxcZCspKD86ZW18ZXh8Y2h8cmVtfHB4fG1tfGNtfGlufHB0fHBjfCV8dmh8dnd8dm1pbnx2bWF4KT9cbiAgICAvLyAgICAgfCFpbXBvcnRhbnRcbiAgICAvLyAgICAgfCAvL2VtcHR5XG4gICAgLy8gICAgICkkL2k7XG4gICAgdmFyIENTU19WQUxJRF9WQUxVRSA9IC9eKD86KD8hLSpleHByZXNzaW9uKSM/Wy1cXHddK3xbKy1dPyg/OlxcZCt8XFxkKlxcLlxcZCspKD86cj9lbXxleHxjaHxjbXxtbXxpbnxweHxwdHxwY3wlfHZofHZ3fHZtaW58dm1heCk/fCFpbXBvcnRhbnR8KSQvaSxcbiAgICAgICAgLy8gVE9ETzogcHJldmVudCBkb3VibGUgY3NzIGVzY2FwaW5nIGJ5IG5vdCBlbmNvZGluZyBcXCBhZ2FpbiwgYnV0IHRoaXMgbWF5IHJlcXVpcmUgQ1NTIGRlY29kaW5nXG4gICAgICAgIC8vIFxceDdGIGFuZCBcXHgwMS1cXHgxRiBsZXNzIFxceDA5IGFyZSBmb3IgU2FmYXJpIDUuMCwgYWRkZWQgW117fS8qIGZvciB1bmJhbGFuY2VkIHF1b3RlXG4gICAgICAgIENTU19ET1VCTEVfUVVPVEVEX0NIQVJTID0gL1tcXHgwMC1cXHgxRlxceDdGXFxbXFxde31cXFxcXCJdL2csXG4gICAgICAgIENTU19TSU5HTEVfUVVPVEVEX0NIQVJTID0gL1tcXHgwMC1cXHgxRlxceDdGXFxbXFxde31cXFxcJ10vZyxcbiAgICAgICAgLy8gKCwgXFx1MjA3RCBhbmQgXFx1MjA4RCBjYW4gYmUgdXNlZCBpbiBiYWNrZ3JvdW5kOiAndXJsKC4uLiknIGluIElFLCBhc3N1bWVkIGFsbCBcXCBjaGFycyBhcmUgZW5jb2RlZCBieSBRVU9URURfQ0hBUlMsIGFuZCBudWxsIGlzIGFscmVhZHkgcmVwbGFjZWQgd2l0aCBcXHVGRkZEXG4gICAgICAgIC8vIG90aGVyd2lzZSwgdXNlIHRoaXMgQ1NTX0JMQUNLTElTVCBpbnN0ZWFkIChlbmhhbmNlIGl0IHdpdGggdXJsIG1hdGNoaW5nKTogLyg/OlxcXFw/XFwofFtcXHUyMDdEXFx1MjA4RF18XFxcXDB7MCw0fTI4ID98XFxcXDB7MCwyfTIwWzc4XVtEZF0gPykrL2dcbiAgICAgICAgQ1NTX0JMQUNLTElTVCA9IC91cmxbXFwoXFx1MjA3RFxcdTIwOERdKy9nLFxuICAgICAgICAvLyB0aGlzIGFzc3VtZXMgZW5jb2RlVVJJKCkgYW5kIGVuY29kZVVSSUNvbXBvbmVudCgpIGhhcyBlc2NhcGVkIDEtMzIsIDEyNyBmb3IgSUU4XG4gICAgICAgIENTU19VTlFVT1RFRF9VUkwgPSAvWydcXChcXCldL2c7IC8vIFwiIFxcIHRyZWF0ZWQgYnkgZW5jb2RlVVJJKClcblxuICAgIC8vIEdpdmVuIGEgZnVsbCBVUkksIG5lZWQgdG8gc3VwcG9ydCBcIltcIiAoIElQdjZhZGRyZXNzICkgXCJdXCIgaW4gVVJJIGFzIHBlciBSRkMzOTg2XG4gICAgLy8gUmVmZXJlbmNlOiBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlxuICAgIHZhciBVUkxfSVBWNiA9IC9cXC9cXC8lNVtCYl0oW0EtRmEtZjAtOTpdKyklNVtEZF0vO1xuXG5cbiAgICAvLyBSZWZlcmVuY2U6IGh0dHA6Ly9zaGF6emVyLmNvLnVrL2RhdGFiYXNlL0FsbC9jaGFyYWN0ZXJzLWFsbG93ZC1pbi1odG1sLWVudGl0aWVzXG4gICAgLy8gUmVmZXJlbmNlOiBodHRwOi8vc2hhenplci5jby51ay92ZWN0b3IvQ2hhcmFjdGVycy1hbGxvd2VkLWFmdGVyLWFtcGVyc2FuZC1pbi1uYW1lZC1jaGFyYWN0ZXItcmVmZXJlbmNlc1xuICAgIC8vIFJlZmVyZW5jZTogaHR0cDovL3NoYXp6ZXIuY28udWsvZGF0YWJhc2UvQWxsL0NoYXJhY3RlcnMtYmVmb3JlLWphdmFzY3JpcHQtdXJpXG4gICAgLy8gUmVmZXJlbmNlOiBodHRwOi8vc2hhenplci5jby51ay9kYXRhYmFzZS9BbGwvQ2hhcmFjdGVycy1hZnRlci1qYXZhc2NyaXB0LXVyaVxuICAgIC8vIFJlZmVyZW5jZTogaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjY29uc3VtZS1hLWNoYXJhY3Rlci1yZWZlcmVuY2VcbiAgICAvLyBSZWZlcmVuY2UgZm9yIG5hbWVkIGNoYXJhY3RlcnM6IGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL2VudGl0aWVzLmpzb25cbiAgICB2YXIgVVJJX0JMQUNLTElTVF9QUk9UT0NPTFMgPSB7J2phdmFzY3JpcHQnOjEsICdkYXRhJzoxLCAndmJzY3JpcHQnOjEsICdtaHRtbCc6MSwgJ3gtc2NoZW1hJzoxfSxcbiAgICAgICAgVVJJX1BST1RPQ09MX0NPTE9OID0gLyg/Ojp8JiNbeFhdMCozW2FBXTs/fCYjMCo1ODs/fCZjb2xvbjspLyxcbiAgICAgICAgVVJJX1BST1RPQ09MX1dISVRFU1BBQ0VTID0gLyg/Ol5bXFx4MDAtXFx4MjBdK3xbXFx0XFxuXFxyXFx4MDBdKykvZyxcbiAgICAgICAgVVJJX1BST1RPQ09MX05BTUVEX1JFRl9NQVAgPSB7VGFiOiAnXFx0JywgTmV3TGluZTogJ1xcbid9O1xuXG4gICAgdmFyIHgsIFxuICAgICAgICBzdHJSZXBsYWNlID0gZnVuY3Rpb24gKHMsIHJlZ2V4cCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBzID09PSB1bmRlZmluZWQgPyAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgICAgICAgICA6IHMgPT09IG51bGwgICAgICAgICAgICA/ICdudWxsJ1xuICAgICAgICAgICAgICAgICAgICA6IHMudG9TdHJpbmcoKS5yZXBsYWNlKHJlZ2V4cCwgY2FsbGJhY2spO1xuICAgICAgICB9LFxuICAgICAgICBmcm9tQ29kZVBvaW50ID0gU3RyaW5nLmZyb21Db2RlUG9pbnQgfHwgZnVuY3Rpb24oY29kZVBvaW50KSB7XG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjb2RlUG9pbnQgPD0gMHhGRkZGKSB7IC8vIEJNUCBjb2RlIHBvaW50XG4gICAgICAgICAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoY29kZVBvaW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQXN0cmFsIGNvZGUgcG9pbnQ7IHNwbGl0IGluIHN1cnJvZ2F0ZSBoYWx2ZXNcbiAgICAgICAgICAgIC8vIGh0dHA6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2phdmFzY3JpcHQtZW5jb2Rpbmcjc3Vycm9nYXRlLWZvcm11bGFlXG4gICAgICAgICAgICBjb2RlUG9pbnQgLT0gMHgxMDAwMDtcbiAgICAgICAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKChjb2RlUG9pbnQgPj4gMTApICsgMHhEODAwLCAoY29kZVBvaW50ICUgMHg0MDApICsgMHhEQzAwKTtcbiAgICAgICAgfTtcblxuXG4gICAgZnVuY3Rpb24gZ2V0UHJvdG9jb2woc3RyKSB7XG4gICAgICAgIHZhciBzID0gc3RyLnNwbGl0KFVSSV9QUk9UT0NPTF9DT0xPTiwgMik7XG4gICAgICAgIC8vIHN0ci5sZW5ndGggIT09IHNbMF0ubGVuZ3RoIGlzIGZvciBvbGRlciBJRSAoZS5nLiwgdjgpLCB3aGVyZSBkZWxpbWV0ZXIgcmVzaWRpbmcgYXQgbGFzdCB3aWxsIHJlc3VsdCBpbiBsZW5ndGggZXF1YWxzIDEsIGJ1dCBub3QgMlxuICAgICAgICByZXR1cm4gKHNbMF0gJiYgKHMubGVuZ3RoID09PSAyIHx8IHN0ci5sZW5ndGggIT09IHNbMF0ubGVuZ3RoKSkgPyBzWzBdIDogbnVsbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBodG1sRGVjb2RlKHMsIG5hbWVkUmVmTWFwLCByZU5hbWVkUmVmLCBza2lwUmVwbGFjZW1lbnQpIHtcbiAgICAgICAgXG4gICAgICAgIG5hbWVkUmVmTWFwID0gbmFtZWRSZWZNYXAgfHwgU0VOU0lUSVZFX05BTUVEX1JFRl9NQVA7XG4gICAgICAgIHJlTmFtZWRSZWYgPSByZU5hbWVkUmVmIHx8IFNFTlNJVElWRV9IVE1MX0VOVElUSUVTO1xuXG4gICAgICAgIGZ1bmN0aW9uIHJlZ0V4cEZ1bmN0aW9uKG0sIG51bSwgbmFtZWQsIG5hbWVkMSkge1xuICAgICAgICAgICAgaWYgKG51bSkge1xuICAgICAgICAgICAgICAgIG51bSA9IE51bWJlcihudW1bMF0gPD0gJzknID8gbnVtIDogJzAnICsgbnVtKTtcbiAgICAgICAgICAgICAgICAvLyBzd2l0Y2gobnVtKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIGNhc2UgMHg4MDogcmV0dXJuICdcXHUyMEFDJzsgIC8vIEVVUk8gU0lHTiAo4oKsKVxuICAgICAgICAgICAgICAgIC8vICAgICBjYXNlIDB4ODI6IHJldHVybiAnXFx1MjAxQSc7ICAvLyBTSU5HTEUgTE9XLTkgUVVPVEFUSU9OIE1BUksgKOKAmilcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDgzOiByZXR1cm4gJ1xcdTAxOTInOyAgLy8gTEFUSU4gU01BTEwgTEVUVEVSIEYgV0lUSCBIT09LICjGkilcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDg0OiByZXR1cm4gJ1xcdTIwMUUnOyAgLy8gRE9VQkxFIExPVy05IFFVT1RBVElPTiBNQVJLICjigJ4pXG4gICAgICAgICAgICAgICAgLy8gICAgIGNhc2UgMHg4NTogcmV0dXJuICdcXHUyMDI2JzsgIC8vIEhPUklaT05UQUwgRUxMSVBTSVMgKOKApilcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDg2OiByZXR1cm4gJ1xcdTIwMjAnOyAgLy8gREFHR0VSICjigKApXG4gICAgICAgICAgICAgICAgLy8gICAgIGNhc2UgMHg4NzogcmV0dXJuICdcXHUyMDIxJzsgIC8vIERPVUJMRSBEQUdHRVIgKOKAoSlcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDg4OiByZXR1cm4gJ1xcdTAyQzYnOyAgLy8gTU9ESUZJRVIgTEVUVEVSIENJUkNVTUZMRVggQUNDRU5UICjLhilcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDg5OiByZXR1cm4gJ1xcdTIwMzAnOyAgLy8gUEVSIE1JTExFIFNJR04gKOKAsClcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDhBOiByZXR1cm4gJ1xcdTAxNjAnOyAgLy8gTEFUSU4gQ0FQSVRBTCBMRVRURVIgUyBXSVRIIENBUk9OICjFoClcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDhCOiByZXR1cm4gJ1xcdTIwMzknOyAgLy8gU0lOR0xFIExFRlQtUE9JTlRJTkcgQU5HTEUgUVVPVEFUSU9OIE1BUksgKOKAuSlcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDhDOiByZXR1cm4gJ1xcdTAxNTInOyAgLy8gTEFUSU4gQ0FQSVRBTCBMSUdBVFVSRSBPRSAoxZIpXG4gICAgICAgICAgICAgICAgLy8gICAgIGNhc2UgMHg4RTogcmV0dXJuICdcXHUwMTdEJzsgIC8vIExBVElOIENBUElUQUwgTEVUVEVSIFogV0lUSCBDQVJPTiAoxb0pXG4gICAgICAgICAgICAgICAgLy8gICAgIGNhc2UgMHg5MTogcmV0dXJuICdcXHUyMDE4JzsgIC8vIExFRlQgU0lOR0xFIFFVT1RBVElPTiBNQVJLICjigJgpXG4gICAgICAgICAgICAgICAgLy8gICAgIGNhc2UgMHg5MjogcmV0dXJuICdcXHUyMDE5JzsgIC8vIFJJR0hUIFNJTkdMRSBRVU9UQVRJT04gTUFSSyAo4oCZKVxuICAgICAgICAgICAgICAgIC8vICAgICBjYXNlIDB4OTM6IHJldHVybiAnXFx1MjAxQyc7ICAvLyBMRUZUIERPVUJMRSBRVU9UQVRJT04gTUFSSyAo4oCcKVxuICAgICAgICAgICAgICAgIC8vICAgICBjYXNlIDB4OTQ6IHJldHVybiAnXFx1MjAxRCc7ICAvLyBSSUdIVCBET1VCTEUgUVVPVEFUSU9OIE1BUksgKOKAnSlcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDk1OiByZXR1cm4gJ1xcdTIwMjInOyAgLy8gQlVMTEVUICjigKIpXG4gICAgICAgICAgICAgICAgLy8gICAgIGNhc2UgMHg5NjogcmV0dXJuICdcXHUyMDEzJzsgIC8vIEVOIERBU0ggKOKAkylcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDk3OiByZXR1cm4gJ1xcdTIwMTQnOyAgLy8gRU0gREFTSCAo4oCUKVxuICAgICAgICAgICAgICAgIC8vICAgICBjYXNlIDB4OTg6IHJldHVybiAnXFx1MDJEQyc7ICAvLyBTTUFMTCBUSUxERSAoy5wpXG4gICAgICAgICAgICAgICAgLy8gICAgIGNhc2UgMHg5OTogcmV0dXJuICdcXHUyMTIyJzsgIC8vIFRSQURFIE1BUksgU0lHTiAo4oSiKVxuICAgICAgICAgICAgICAgIC8vICAgICBjYXNlIDB4OUE6IHJldHVybiAnXFx1MDE2MSc7ICAvLyBMQVRJTiBTTUFMTCBMRVRURVIgUyBXSVRIIENBUk9OICjFoSlcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDlCOiByZXR1cm4gJ1xcdTIwM0EnOyAgLy8gU0lOR0xFIFJJR0hULVBPSU5USU5HIEFOR0xFIFFVT1RBVElPTiBNQVJLICjigLopXG4gICAgICAgICAgICAgICAgLy8gICAgIGNhc2UgMHg5QzogcmV0dXJuICdcXHUwMTUzJzsgIC8vIExBVElOIFNNQUxMIExJR0FUVVJFIE9FICjFkylcbiAgICAgICAgICAgICAgICAvLyAgICAgY2FzZSAweDlFOiByZXR1cm4gJ1xcdTAxN0UnOyAgLy8gTEFUSU4gU01BTEwgTEVUVEVSIFogV0lUSCBDQVJPTiAoxb4pXG4gICAgICAgICAgICAgICAgLy8gICAgIGNhc2UgMHg5RjogcmV0dXJuICdcXHUwMTc4JzsgIC8vIExBVElOIENBUElUQUwgTEVUVEVSIFkgV0lUSCBESUFFUkVTSVMgKMW4KVxuICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICAvLyAvLyBudW0gPj0gMHhEODAwICYmIG51bSA8PSAweERGRkYsIGFuZCAweDBEIGlzIHNlcGFyYXRlbHkgaGFuZGxlZCwgYXMgaXQgZG9lc24ndCBmYWxsIGludG8gdGhlIHJhbmdlIG9mIHgucGVjKClcbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gKG51bSA+PSAweEQ4MDAgJiYgbnVtIDw9IDB4REZGRikgfHwgbnVtID09PSAweDBEID8gJ1xcdUZGRkQnIDogeC5mckNvUHQobnVtKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBza2lwUmVwbGFjZW1lbnQgPyBmcm9tQ29kZVBvaW50KG51bSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDgwID8gJ1xcdTIwQUMnICAvLyBFVVJPIFNJR04gKOKCrClcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDgyID8gJ1xcdTIwMUEnICAvLyBTSU5HTEUgTE9XLTkgUVVPVEFUSU9OIE1BUksgKOKAmilcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDgzID8gJ1xcdTAxOTInICAvLyBMQVRJTiBTTUFMTCBMRVRURVIgRiBXSVRIIEhPT0sgKMaSKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudW0gPT09IDB4ODQgPyAnXFx1MjAxRScgIC8vIERPVUJMRSBMT1ctOSBRVU9UQVRJT04gTUFSSyAo4oCeKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudW0gPT09IDB4ODUgPyAnXFx1MjAyNicgIC8vIEhPUklaT05UQUwgRUxMSVBTSVMgKOKApilcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDg2ID8gJ1xcdTIwMjAnICAvLyBEQUdHRVIgKOKAoClcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDg3ID8gJ1xcdTIwMjEnICAvLyBET1VCTEUgREFHR0VSICjigKEpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG51bSA9PT0gMHg4OCA/ICdcXHUwMkM2JyAgLy8gTU9ESUZJRVIgTEVUVEVSIENJUkNVTUZMRVggQUNDRU5UICjLhilcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDg5ID8gJ1xcdTIwMzAnICAvLyBQRVIgTUlMTEUgU0lHTiAo4oCwKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudW0gPT09IDB4OEEgPyAnXFx1MDE2MCcgIC8vIExBVElOIENBUElUQUwgTEVUVEVSIFMgV0lUSCBDQVJPTiAoxaApXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG51bSA9PT0gMHg4QiA/ICdcXHUyMDM5JyAgLy8gU0lOR0xFIExFRlQtUE9JTlRJTkcgQU5HTEUgUVVPVEFUSU9OIE1BUksgKOKAuSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDhDID8gJ1xcdTAxNTInICAvLyBMQVRJTiBDQVBJVEFMIExJR0FUVVJFIE9FICjFkilcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDhFID8gJ1xcdTAxN0QnICAvLyBMQVRJTiBDQVBJVEFMIExFVFRFUiBaIFdJVEggQ0FST04gKMW9KVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudW0gPT09IDB4OTEgPyAnXFx1MjAxOCcgIC8vIExFRlQgU0lOR0xFIFFVT1RBVElPTiBNQVJLICjigJgpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG51bSA9PT0gMHg5MiA/ICdcXHUyMDE5JyAgLy8gUklHSFQgU0lOR0xFIFFVT1RBVElPTiBNQVJLICjigJkpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG51bSA9PT0gMHg5MyA/ICdcXHUyMDFDJyAgLy8gTEVGVCBET1VCTEUgUVVPVEFUSU9OIE1BUksgKOKAnClcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDk0ID8gJ1xcdTIwMUQnICAvLyBSSUdIVCBET1VCTEUgUVVPVEFUSU9OIE1BUksgKOKAnSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDk1ID8gJ1xcdTIwMjInICAvLyBCVUxMRVQgKOKAoilcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDk2ID8gJ1xcdTIwMTMnICAvLyBFTiBEQVNIICjigJMpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG51bSA9PT0gMHg5NyA/ICdcXHUyMDE0JyAgLy8gRU0gREFTSCAo4oCUKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudW0gPT09IDB4OTggPyAnXFx1MDJEQycgIC8vIFNNQUxMIFRJTERFICjLnClcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDk5ID8gJ1xcdTIxMjInICAvLyBUUkFERSBNQVJLIFNJR04gKOKEoilcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDlBID8gJ1xcdTAxNjEnICAvLyBMQVRJTiBTTUFMTCBMRVRURVIgUyBXSVRIIENBUk9OICjFoSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDlCID8gJ1xcdTIwM0EnICAvLyBTSU5HTEUgUklHSFQtUE9JTlRJTkcgQU5HTEUgUVVPVEFUSU9OIE1BUksgKOKAuilcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtID09PSAweDlDID8gJ1xcdTAxNTMnICAvLyBMQVRJTiBTTUFMTCBMSUdBVFVSRSBPRSAoxZMpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG51bSA9PT0gMHg5RSA/ICdcXHUwMTdFJyAgLy8gTEFUSU4gU01BTEwgTEVUVEVSIFogV0lUSCBDQVJPTiAoxb4pXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG51bSA9PT0gMHg5RiA/ICdcXHUwMTc4JyAgLy8gTEFUSU4gQ0FQSVRBTCBMRVRURVIgWSBXSVRIIERJQUVSRVNJUyAoxbgpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IChudW0gPj0gMHhEODAwICYmIG51bSA8PSAweERGRkYpIHx8IG51bSA9PT0gMHgwRCA/ICdcXHVGRkZEJ1xuICAgICAgICAgICAgICAgICAgICAgICAgOiB4LmZyQ29QdChudW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5hbWVkUmVmTWFwW25hbWVkIHx8IG5hbWVkMV0gfHwgbTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzID09PSB1bmRlZmluZWQgID8gJ3VuZGVmaW5lZCdcbiAgICAgICAgICAgIDogcyA9PT0gbnVsbCAgICAgICAgPyAnbnVsbCdcbiAgICAgICAgICAgIDogcy50b1N0cmluZygpLnJlcGxhY2UoTlVMTCwgJ1xcdUZGRkQnKS5yZXBsYWNlKHJlTmFtZWRSZWYsIHJlZ0V4cEZ1bmN0aW9uKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjc3NFbmNvZGUoY2hyKSB7XG4gICAgICAgIC8vIHNwYWNlIGFmdGVyIFxcXFxIRVggaXMgbmVlZGVkIGJ5IHNwZWNcbiAgICAgICAgcmV0dXJuICdcXFxcJyArIGNoci5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KS50b0xvd2VyQ2FzZSgpICsgJyAnO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjc3NCbGFja2xpc3Qocykge1xuICAgICAgICByZXR1cm4gcy5yZXBsYWNlKENTU19CTEFDS0xJU1QsIGZ1bmN0aW9uKG0peyByZXR1cm4gJy14LScgKyBtOyB9KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY3NzVXJsKHMpIHtcbiAgICAgICAgLy8gZW5jb2RlVVJJKCkgaW4geXVmdWxsKCkgd2lsbCB0aHJvdyBlcnJvciBmb3IgdXNlIG9mIHRoZSBDU1NfVU5TVVBQT1JURURfQ09ERV9QT0lOVCAoaS5lLiwgW1xcdUQ4MDAtXFx1REZGRl0pXG4gICAgICAgIHMgPSB4Lnl1ZnVsbChodG1sRGVjb2RlKHMpKTtcbiAgICAgICAgdmFyIHByb3RvY29sID0gZ2V0UHJvdG9jb2wocyk7XG5cbiAgICAgICAgLy8gcHJlZml4ICMjIGZvciBibGFja2xpc3RlZCBwcm90b2NvbHNcbiAgICAgICAgLy8gaGVyZSAucmVwbGFjZShVUklfUFJPVE9DT0xfV0hJVEVTUEFDRVMsICcnKSBpcyBub3QgbmVlZGVkIHNpbmNlIHl1ZnVsbCBoYXMgYWxyZWFkeSBwZXJjZW50LWVuY29kZWQgdGhlIHdoaXRlc3BhY2VzXG4gICAgICAgIHJldHVybiAocHJvdG9jb2wgJiYgVVJJX0JMQUNLTElTVF9QUk9UT0NPTFNbcHJvdG9jb2wudG9Mb3dlckNhc2UoKV0pID8gJyMjJyArIHMgOiBzO1xuICAgIH1cblxuICAgIHJldHVybiAoeCA9IHtcbiAgICAgICAgLy8gdHVybiBpbnZhbGlkIGNvZGVQb2ludHMgYW5kIHRoYXQgb2Ygbm9uLWNoYXJhY3RlcnMgdG8gXFx1RkZGRCwgYW5kIHRoZW4gZnJvbUNvZGVQb2ludCgpXG4gICAgICAgIGZyQ29QdDogZnVuY3Rpb24obnVtKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVtID09PSB1bmRlZmluZWQgfHwgbnVtID09PSBudWxsID8gJycgOlxuICAgICAgICAgICAgICAgICFpc0Zpbml0ZShudW0gPSBOdW1iZXIobnVtKSkgfHwgLy8gYE5hTmAsIGArSW5maW5pdHlgLCBvciBgLUluZmluaXR5YFxuICAgICAgICAgICAgICAgIG51bSA8PSAwIHx8ICAgICAgICAgICAgICAgICAgICAgLy8gbm90IGEgdmFsaWQgVW5pY29kZSBjb2RlIHBvaW50XG4gICAgICAgICAgICAgICAgbnVtID4gMHgxMEZGRkYgfHwgICAgICAgICAgICAgICAvLyBub3QgYSB2YWxpZCBVbmljb2RlIGNvZGUgcG9pbnRcbiAgICAgICAgICAgICAgICAvLyBNYXRoLmZsb29yKG51bSkgIT0gbnVtIHx8IFxuXG4gICAgICAgICAgICAgICAgKG51bSA+PSAweDAxICYmIG51bSA8PSAweDA4KSB8fFxuICAgICAgICAgICAgICAgIChudW0gPj0gMHgwRSAmJiBudW0gPD0gMHgxRikgfHxcbiAgICAgICAgICAgICAgICAobnVtID49IDB4N0YgJiYgbnVtIDw9IDB4OUYpIHx8XG4gICAgICAgICAgICAgICAgKG51bSA+PSAweEZERDAgJiYgbnVtIDw9IDB4RkRFRikgfHxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgbnVtID09PSAweDBCIHx8IFxuICAgICAgICAgICAgICAgIChudW0gJiAweEZGRkYpID09PSAweEZGRkYgfHwgXG4gICAgICAgICAgICAgICAgKG51bSAmIDB4RkZGRikgPT09IDB4RkZGRSA/ICdcXHVGRkZEJyA6IGZyb21Db2RlUG9pbnQobnVtKTtcbiAgICAgICAgfSxcbiAgICAgICAgZDogaHRtbERlY29kZSxcbiAgICAgICAgLypcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHMgLSBBbiB1bnRydXN0ZWQgdXJpIGlucHV0XG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHMgLSBudWxsIGlmIHJlbGF0aXZlIHVybCwgb3RoZXJ3aXNlIHRoZSBwcm90b2NvbCB3aXRoIHdoaXRlc3BhY2VzIHN0cmlwcGVkIGFuZCBsb3dlci1jYXNlZFxuICAgICAgICAgKi9cbiAgICAgICAgeXVwOiBmdW5jdGlvbihzKSB7XG4gICAgICAgICAgICBzID0gZ2V0UHJvdG9jb2wocy5yZXBsYWNlKE5VTEwsICcnKSk7XG4gICAgICAgICAgICAvLyBVUklfUFJPVE9DT0xfV0hJVEVTUEFDRVMgaXMgcmVxdWlyZWQgZm9yIGxlZnQgdHJpbSBhbmQgcmVtb3ZlIGludGVyaW0gd2hpdGVzcGFjZXNcbiAgICAgICAgICAgIHJldHVybiBzID8gaHRtbERlY29kZShzLCBVUklfUFJPVE9DT0xfTkFNRURfUkVGX01BUCwgbnVsbCwgdHJ1ZSkucmVwbGFjZShVUklfUFJPVE9DT0xfV0hJVEVTUEFDRVMsICcnKS50b0xvd2VyQ2FzZSgpIDogbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICAvKlxuICAgICAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0XG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHMgLSBUaGUgb3JpZ2luYWwgdXNlciBpbnB1dCB3aXRoICYgPCA+IFwiICcgYCBlbmNvZGVkIHJlc3BlY3RpdmVseSBhcyAmYW1wOyAmbHQ7ICZndDsgJnF1b3Q7ICYjMzk7IGFuZCAmIzk2Oy5cbiAgICAgICAgICpcbiAgICAgICAgICovXG4gICAgICAgIHk6IGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHJSZXBsYWNlKHMsIFNQRUNJQUxfSFRNTF9DSEFSUywgZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbSA9PT0gJyYnID8gJyZhbXA7J1xuICAgICAgICAgICAgICAgICAgICA6ICBtID09PSAnPCcgPyAnJmx0OydcbiAgICAgICAgICAgICAgICAgICAgOiAgbSA9PT0gJz4nID8gJyZndDsnXG4gICAgICAgICAgICAgICAgICAgIDogIG0gPT09ICdcIicgPyAnJnF1b3Q7J1xuICAgICAgICAgICAgICAgICAgICA6ICBtID09PSBcIidcIiA/ICcmIzM5OydcbiAgICAgICAgICAgICAgICAgICAgOiAgLyptID09PSAnYCcqLyAnJiM5NjsnOyAgICAgICAvLyBpbiBoZXg6IDYwXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBUaGlzIGZpbHRlciBpcyBtZWFudCB0byBpbnRyb2R1Y2UgZG91YmxlLWVuY29kaW5nLCBhbmQgc2hvdWxkIGJlIHVzZWQgd2l0aCBleHRyYSBjYXJlLlxuICAgICAgICB5YTogZnVuY3Rpb24ocykge1xuICAgICAgICAgICAgcmV0dXJuIHN0clJlcGxhY2UocywgQU1QLCAnJmFtcDsnKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBGT1IgREVUQUlMUywgcmVmZXIgdG8gaW5IVE1MRGF0YSgpXG4gICAgICAgIC8vIFJlZmVyZW5jZTogaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjZGF0YS1zdGF0ZVxuICAgICAgICB5ZDogZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHJSZXBsYWNlKHMsIExULCAnJmx0OycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIEZPUiBERVRBSUxTLCByZWZlciB0byBpbkhUTUxDb21tZW50KClcbiAgICAgICAgLy8gQWxsIE5VTEwgY2hhcmFjdGVycyBpbiBzIGFyZSBmaXJzdCByZXBsYWNlZCB3aXRoIFxcdUZGRkQuXG4gICAgICAgIC8vIElmIHMgY29udGFpbnMgLS0+LCAtLSE+LCBvciBzdGFydHMgd2l0aCAtKj4sIGluc2VydCBhIHNwYWNlIHJpZ2h0IGJlZm9yZSA+IHRvIHN0b3Agc3RhdGUgYnJlYWtpbmcgYXQgPCEtLXt7e3ljIHN9fX0tLT5cbiAgICAgICAgLy8gSWYgcyBlbmRzIHdpdGggLS0hLCAtLSwgb3IgLSwgYXBwZW5kIGEgc3BhY2UgdG8gc3RvcCBjb2xsYWJvcmF0aXZlIHN0YXRlIGJyZWFraW5nIGF0IHt7e3ljIHN9fX0+LCB7e3t5YyBzfX19IT4sIHt7e3ljIHN9fX0tIT4sIHt7e3ljIHN9fX0tPlxuICAgICAgICAvLyBSZWZlcmVuY2U6IGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2NvbW1lbnQtc3RhdGVcbiAgICAgICAgLy8gUmVmZXJlbmNlOiBodHRwOi8vc2hhenplci5jby51ay92ZWN0b3IvQ2hhcmFjdGVycy10aGF0LWNsb3NlLWEtSFRNTC1jb21tZW50LTNcbiAgICAgICAgLy8gUmVmZXJlbmNlOiBodHRwOi8vc2hhenplci5jby51ay92ZWN0b3IvQ2hhcmFjdGVycy10aGF0LWNsb3NlLWEtSFRNTC1jb21tZW50XG4gICAgICAgIC8vIFJlZmVyZW5jZTogaHR0cDovL3NoYXp6ZXIuY28udWsvdmVjdG9yL0NoYXJhY3RlcnMtdGhhdC1jbG9zZS1hLUhUTUwtY29tbWVudC0wMDIxXG4gICAgICAgIC8vIElmIHMgY29udGFpbnMgXT4gb3IgZW5kcyB3aXRoIF0sIGFwcGVuZCBhIHNwYWNlIGFmdGVyIF0gaXMgdmVyaWZpZWQgaW4gSUUgdG8gc3RvcCBJRSBjb25kaXRpb25hbCBjb21tZW50cy5cbiAgICAgICAgLy8gUmVmZXJlbmNlOiBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvbXM1Mzc1MTIlMjh2PXZzLjg1JTI5LmFzcHhcbiAgICAgICAgLy8gV2UgZG8gbm90IGNhcmUgLS1cXHM+LCB3aGljaCBjYW4gcG9zc2libHkgYmUgaW50ZXByZXRlZCBhcyBhIHZhbGlkIGNsb3NlIGNvbW1lbnQgdGFnIGluIHZlcnkgb2xkIGJyb3dzZXJzIChlLmcuLCBmaXJlZm94IDMuNiksIGFzIHNwZWNpZmllZCBpbiB0aGUgaHRtbDQgc3BlY1xuICAgICAgICAvLyBSZWZlcmVuY2U6IGh0dHA6Ly93d3cudzMub3JnL1RSL2h0bWw0MDEvaW50cm8vc2dtbHR1dC5odG1sI2gtMy4yLjRcbiAgICAgICAgeWM6IGZ1bmN0aW9uIChzKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyUmVwbGFjZShzLCBTUEVDSUFMX0NPTU1FTlRfQ0hBUlMsIGZ1bmN0aW9uKG0pe1xuICAgICAgICAgICAgICAgIHJldHVybiBtID09PSAnXFx4MDAnID8gJ1xcdUZGRkQnXG4gICAgICAgICAgICAgICAgICAgIDogbSA9PT0gJy0tIScgfHwgbSA9PT0gJy0tJyB8fCBtID09PSAnLScgfHwgbSA9PT0gJ10nID8gbSArICcgJ1xuICAgICAgICAgICAgICAgICAgICA6LypcbiAgICAgICAgICAgICAgICAgICAgOiAgbSA9PT0gJ10+JyAgID8gJ10gPidcbiAgICAgICAgICAgICAgICAgICAgOiAgbSA9PT0gJy0tPicgID8gJy0tID4nXG4gICAgICAgICAgICAgICAgICAgIDogIG0gPT09ICctLSE+JyA/ICctLSEgPidcbiAgICAgICAgICAgICAgICAgICAgOiAvLSohPz4vLnRlc3QobSkgPyAqLyBtLnNsaWNlKDAsIC0xKSArICcgPic7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBGT1IgREVUQUlMUywgcmVmZXIgdG8gaW5Eb3VibGVRdW90ZWRBdHRyKClcbiAgICAgICAgLy8gUmVmZXJlbmNlOiBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNhdHRyaWJ1dGUtdmFsdWUtKGRvdWJsZS1xdW90ZWQpLXN0YXRlXG4gICAgICAgIHlhdmQ6IGZ1bmN0aW9uIChzKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyUmVwbGFjZShzLCBRVU9ULCAnJnF1b3Q7Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gRk9SIERFVEFJTFMsIHJlZmVyIHRvIGluU2luZ2xlUXVvdGVkQXR0cigpXG4gICAgICAgIC8vIFJlZmVyZW5jZTogaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYXR0cmlidXRlLXZhbHVlLShzaW5nbGUtcXVvdGVkKS1zdGF0ZVxuICAgICAgICB5YXZzOiBmdW5jdGlvbiAocykge1xuICAgICAgICAgICAgcmV0dXJuIHN0clJlcGxhY2UocywgU1FVT1QsICcmIzM5OycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIEZPUiBERVRBSUxTLCByZWZlciB0byBpblVuUXVvdGVkQXR0cigpXG4gICAgICAgIC8vIFBBUlQgQS5cbiAgICAgICAgLy8gaWYgcyBjb250YWlucyBhbnkgc3RhdGUgYnJlYWtpbmcgY2hhcnMgKFxcdCwgXFxuLCBcXHYsIFxcZiwgXFxyLCBzcGFjZSwgYW5kID4pLFxuICAgICAgICAvLyB0aGV5IGFyZSBlc2NhcGVkIGFuZCBlbmNvZGVkIGludG8gdGhlaXIgZXF1aXZhbGVudCBIVE1MIGVudGl0eSByZXByZXNlbnRhdGlvbnMuIFxuICAgICAgICAvLyBSZWZlcmVuY2U6IGh0dHA6Ly9zaGF6emVyLmNvLnVrL2RhdGFiYXNlL0FsbC9DaGFyYWN0ZXJzLXdoaWNoLWJyZWFrLWF0dHJpYnV0ZXMtd2l0aG91dC1xdW90ZXNcbiAgICAgICAgLy8gUmVmZXJlbmNlOiBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNhdHRyaWJ1dGUtdmFsdWUtKHVucXVvdGVkKS1zdGF0ZVxuICAgICAgICAvL1xuICAgICAgICAvLyBQQVJUIEIuIFxuICAgICAgICAvLyBpZiBzIHN0YXJ0cyB3aXRoICcsIFwiIG9yIGAsIGVuY29kZSBpdCByZXNwLiBhcyAmIzM5OywgJnF1b3Q7LCBvciAmIzk2OyB0byBcbiAgICAgICAgLy8gZW5mb3JjZSB0aGUgYXR0ciB2YWx1ZSAodW5xdW90ZWQpIHN0YXRlXG4gICAgICAgIC8vIFJlZmVyZW5jZTogaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYmVmb3JlLWF0dHJpYnV0ZS12YWx1ZS1zdGF0ZVxuICAgICAgICAvLyBSZWZlcmVuY2U6IGh0dHA6Ly9zaGF6emVyLmNvLnVrL3ZlY3Rvci9DaGFyYWN0ZXJzLWFsbG93ZWQtYXR0cmlidXRlLXF1b3RlXG4gICAgICAgIC8vIFxuICAgICAgICAvLyBQQVJUIEMuXG4gICAgICAgIC8vIEluamVjdCBhIFxcdUZGRkQgY2hhcmFjdGVyIGlmIGFuIGVtcHR5IG9yIGFsbCBudWxsIHN0cmluZyBpcyBlbmNvdW50ZXJlZCBpbiBcbiAgICAgICAgLy8gdW5xdW90ZWQgYXR0cmlidXRlIHZhbHVlIHN0YXRlLlxuICAgICAgICAvLyBcbiAgICAgICAgLy8gUmF0aW9uYWxlIDE6IG91ciBiZWxpZWYgaXMgdGhhdCBkZXZlbG9wZXJzIHdvdWxkbid0IGV4cGVjdCBhbiBcbiAgICAgICAgLy8gICBlbXB0eSBzdHJpbmcgd291bGQgcmVzdWx0IGluICcgbmFtZT1cInBhc3N3ZFwiJyByZW5kZXJlZCBhcyBcbiAgICAgICAgLy8gICBhdHRyaWJ1dGUgdmFsdWUsIGV2ZW4gdGhvdWdoIHRoaXMgaXMgaG93IEhUTUw1IGlzIHNwZWNpZmllZC5cbiAgICAgICAgLy8gUmF0aW9uYWxlIDI6IGFuIGVtcHR5IG9yIGFsbCBudWxsIHN0cmluZyAoZm9yIElFKSBjYW4gXG4gICAgICAgIC8vICAgZWZmZWN0aXZlbHkgYWx0ZXIgaXRzIGltbWVkaWF0ZSBzdWJzZXF1ZW50IHN0YXRlLCB3ZSBjaG9vc2VcbiAgICAgICAgLy8gICBcXHVGRkZEIHRvIGVuZCB0aGUgdW5xdW90ZWQgYXR0ciBcbiAgICAgICAgLy8gICBzdGF0ZSwgd2hpY2ggdGhlcmVmb3JlIHdpbGwgbm90IG1lc3MgdXAgbGF0ZXIgY29udGV4dHMuXG4gICAgICAgIC8vIFJhdGlvbmFsZSAzOiBTaW5jZSBJRSA2LCBpdCBpcyB2ZXJpZmllZCB0aGF0IE5VTEwgY2hhcnMgYXJlIHN0cmlwcGVkLlxuICAgICAgICAvLyBSZWZlcmVuY2U6IGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2F0dHJpYnV0ZS12YWx1ZS0odW5xdW90ZWQpLXN0YXRlXG4gICAgICAgIC8vIFxuICAgICAgICAvLyBFeGFtcGxlOlxuICAgICAgICAvLyA8aW5wdXQgdmFsdWU9e3t7eWF2dSBzfX19IG5hbWU9XCJwYXNzd2RcIi8+XG4gICAgICAgIHlhdnU6IGZ1bmN0aW9uIChzKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyUmVwbGFjZShzLCBTUEVDSUFMX0FUVFJfVkFMVUVfVU5RVU9URURfQ0hBUlMsIGZ1bmN0aW9uIChtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0gPT09ICdcXHQnICAgPyAnJiM5OycgIC8vIGluIGhleDogMDlcbiAgICAgICAgICAgICAgICAgICAgOiAgbSA9PT0gJ1xcbicgICA/ICcmIzEwOycgLy8gaW4gaGV4OiAwQVxuICAgICAgICAgICAgICAgICAgICA6ICBtID09PSAnXFx4MEInID8gJyYjMTE7JyAvLyBpbiBoZXg6IDBCICBmb3IgSUUuIElFPDkgXFx2IGVxdWFscyB2LCBzbyB1c2UgXFx4MEIgaW5zdGVhZFxuICAgICAgICAgICAgICAgICAgICA6ICBtID09PSAnXFxmJyAgID8gJyYjMTI7JyAvLyBpbiBoZXg6IDBDXG4gICAgICAgICAgICAgICAgICAgIDogIG0gPT09ICdcXHInICAgPyAnJiMxMzsnIC8vIGluIGhleDogMERcbiAgICAgICAgICAgICAgICAgICAgOiAgbSA9PT0gJyAnICAgID8gJyYjMzI7JyAvLyBpbiBoZXg6IDIwXG4gICAgICAgICAgICAgICAgICAgIDogIG0gPT09ICc9JyAgICA/ICcmIzYxOycgLy8gaW4gaGV4OiAzRFxuICAgICAgICAgICAgICAgICAgICA6ICBtID09PSAnPCcgICAgPyAnJmx0OydcbiAgICAgICAgICAgICAgICAgICAgOiAgbSA9PT0gJz4nICAgID8gJyZndDsnXG4gICAgICAgICAgICAgICAgICAgIDogIG0gPT09ICdcIicgICAgPyAnJnF1b3Q7J1xuICAgICAgICAgICAgICAgICAgICA6ICBtID09PSBcIidcIiAgICA/ICcmIzM5OydcbiAgICAgICAgICAgICAgICAgICAgOiAgbSA9PT0gJ2AnICAgID8gJyYjOTY7J1xuICAgICAgICAgICAgICAgICAgICA6IC8qZW1wdHkgb3IgbnVsbCovICdcXHVGRkZEJztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHl1OiBlbmNvZGVVUkksXG4gICAgICAgIHl1YzogZW5jb2RlVVJJQ29tcG9uZW50LFxuXG4gICAgICAgIC8vIE5vdGljZSB0aGF0IHl1YmwgTVVTVCBCRSBBUFBMSUVEIExBU1QsIGFuZCB3aWxsIG5vdCBiZSB1c2VkIGluZGVwZW5kZW50bHkgKGV4cGVjdGVkIG91dHB1dCBmcm9tIGVuY29kZVVSSS9lbmNvZGVVUklDb21wb25lbnQgYW5kIHlhdmQveWF2cy95YXZ1KVxuICAgICAgICAvLyBUaGlzIGlzIHVzZWQgdG8gZGlzYWJsZSBKUyBleGVjdXRpb24gY2FwYWJpbGl0aWVzIGJ5IHByZWZpeGluZyB4LSB0byBeamF2YXNjcmlwdDosIF52YnNjcmlwdDogb3IgXmRhdGE6IHRoYXQgcG9zc2libHkgY291bGQgdHJpZ2dlciBzY3JpcHQgZXhlY3V0aW9uIGluIFVSSSBhdHRyaWJ1dGUgY29udGV4dFxuICAgICAgICB5dWJsOiBmdW5jdGlvbiAocykge1xuICAgICAgICAgICAgcmV0dXJuIFVSSV9CTEFDS0xJU1RfUFJPVE9DT0xTW3gueXVwKHMpXSA/ICd4LScgKyBzIDogcztcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBUaGlzIGlzIE5PVCBhIHNlY3VyaXR5LWNyaXRpY2FsIGZpbHRlci5cbiAgICAgICAgLy8gUmVmZXJlbmNlOiBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlxuICAgICAgICB5dWZ1bGw6IGZ1bmN0aW9uIChzKSB7XG4gICAgICAgICAgICByZXR1cm4geC55dShzKS5yZXBsYWNlKFVSTF9JUFY2LCBmdW5jdGlvbihtLCBwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcvL1snICsgcCArICddJztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIGNoYWluIHl1ZnVsbCgpIHdpdGggeXVibCgpXG4gICAgICAgIHl1YmxmOiBmdW5jdGlvbiAocykge1xuICAgICAgICAgICAgcmV0dXJuIHgueXVibCh4Lnl1ZnVsbChzKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gVGhlIGRlc2lnbiBwcmluY2lwbGUgb2YgdGhlIENTUyBmaWx0ZXIgTVVTVCBtZWV0IHRoZSBmb2xsb3dpbmcgZ29hbChzKS5cbiAgICAgICAgLy8gKDEpIFRoZSBpbnB1dCBjYW5ub3QgYnJlYWsgb3V0IG9mIHRoZSBjb250ZXh0IChleHByKSBhbmQgdGhpcyBpcyB0byBmdWxmaWxsIHRoZSBqdXN0IHN1ZmZpY2llbnQgZW5jb2RpbmcgcHJpbmNpcGxlLlxuICAgICAgICAvLyAoMikgVGhlIGlucHV0IGNhbm5vdCBpbnRyb2R1Y2UgQ1NTIHBhcnNpbmcgZXJyb3IgYW5kIHRoaXMgaXMgdG8gYWRkcmVzcyB0aGUgY29uY2VybiBvZiBVSSByZWRyZXNzaW5nLlxuICAgICAgICAvL1xuICAgICAgICAvLyB0ZXJtXG4gICAgICAgIC8vICAgOiB1bmFyeV9vcGVyYXRvcj9cbiAgICAgICAgLy8gICAgIFsgTlVNQkVSIFMqIHwgUEVSQ0VOVEFHRSBTKiB8IExFTkdUSCBTKiB8IEVNUyBTKiB8IEVYUyBTKiB8IEFOR0xFIFMqIHxcbiAgICAgICAgLy8gICAgIFRJTUUgUyogfCBGUkVRIFMqIF1cbiAgICAgICAgLy8gICB8IFNUUklORyBTKiB8IElERU5UIFMqIHwgVVJJIFMqIHwgaGV4Y29sb3IgfCBmdW5jdGlvblxuICAgICAgICAvLyBcbiAgICAgICAgLy8gUmVmZXJlbmNlOlxuICAgICAgICAvLyAqIGh0dHA6Ly93d3cudzMub3JnL1RSL0NTUzIxL2dyYW1tYXIuaHRtbCBcbiAgICAgICAgLy8gKiBodHRwOi8vd3d3LnczLm9yZy9UUi9jc3Mtc3ludGF4LTMvXG4gICAgICAgIC8vIFxuICAgICAgICAvLyBOT1RFOiBkZWxpbWl0ZXIgaW4gQ1NTIC0gIFxcICBfICA6ICA7ICAoICApICBcIiAgJyAgLyAgLCAgJSAgIyAgISAgKiAgQCAgLiAgeyAgfVxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgIDJkIDVjIDVmIDNhIDNiIDI4IDI5IDIyIDI3IDJmIDJjIDI1IDIzIDIxIDJhIDQwIDJlIDdiIDdkXG5cbiAgICAgICAgeWNldTogZnVuY3Rpb24ocykge1xuICAgICAgICAgICAgcyA9IGh0bWxEZWNvZGUocyk7XG4gICAgICAgICAgICByZXR1cm4gQ1NTX1ZBTElEX1ZBTFVFLnRlc3QocykgPyBzIDogXCI7LXg6J1wiICsgY3NzQmxhY2tsaXN0KHMucmVwbGFjZShDU1NfU0lOR0xFX1FVT1RFRF9DSEFSUywgY3NzRW5jb2RlKSkgKyBcIic7LXY6XCI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gc3RyaW5nMSA9IFxcXCIoW15cXG5cXHJcXGZcXFxcXCJdfFxcXFx7bmx9fFxcXFxbXlxcblxcclxcZjAtOWEtZl18XFxcXFswLTlhLWZdezEsNn0oXFxyXFxufFsgXFxuXFxyXFx0XFxmXSk/KSpcXFwiXG4gICAgICAgIHljZWQ6IGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgICAgIHJldHVybiBjc3NCbGFja2xpc3QoaHRtbERlY29kZShzKS5yZXBsYWNlKENTU19ET1VCTEVfUVVPVEVEX0NIQVJTLCBjc3NFbmNvZGUpKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBzdHJpbmcyID0gXFwnKFteXFxuXFxyXFxmXFxcXCddfFxcXFx7bmx9fFxcXFxbXlxcblxcclxcZjAtOWEtZl18XFxcXFswLTlhLWZdezEsNn0oXFxyXFxufFsgXFxuXFxyXFx0XFxmXSk/KSpcXCdcbiAgICAgICAgeWNlczogZnVuY3Rpb24ocykge1xuICAgICAgICAgICAgcmV0dXJuIGNzc0JsYWNrbGlzdChodG1sRGVjb2RlKHMpLnJlcGxhY2UoQ1NTX1NJTkdMRV9RVU9URURfQ0hBUlMsIGNzc0VuY29kZSkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIGZvciB1cmwoe3t7eWNldXUgdXJsfX19XG4gICAgICAgIC8vIHVucXVvdGVkX3VybCA9IChbISMkJSYqLX5dfFxcXFx7aH17MSw2fShcXHJcXG58WyBcXHRcXHJcXG5cXGZdKT98XFxcXFteXFxyXFxuXFxmMC05YS1mXSkqIChDU1MgMi4xIGRlZmluaXRpb24pXG4gICAgICAgIC8vIHVucXVvdGVkX3VybCA9IChbXlwiJygpXFxcXCBcXHRcXG5cXHJcXGZcXHZcXHUwMDAwXFx1MDAwOFxcdTAwMGJcXHUwMDBlLVxcdTAwMWZcXHUwMDdmXXxcXFxce2h9ezEsNn0oXFxyXFxufFsgXFx0XFxyXFxuXFxmXSk/fFxcXFxbXlxcclxcblxcZjAtOWEtZl0pKiAoQ1NTIDMuMCBkZWZpbml0aW9uKVxuICAgICAgICAvLyBUaGUgc3RhdGUgbWFjaGluZSBpbiBDU1MgMy4wIGlzIG1vcmUgd2VsbCBkZWZpbmVkIC0gaHR0cDovL3d3dy53My5vcmcvVFIvY3NzLXN5bnRheC0zLyNjb25zdW1lLWEtdXJsLXRva2VuMFxuICAgICAgICAvLyBDU1NfVU5RVU9URURfVVJMID0gL1snXFwoXFwpXS9nOyAvLyBcIiBcXCB0cmVhdGVkIGJ5IGVuY29kZVVSSSgpICAgXG4gICAgICAgIHljZXV1OiBmdW5jdGlvbihzKSB7XG4gICAgICAgICAgICByZXR1cm4gY3NzVXJsKHMpLnJlcGxhY2UoQ1NTX1VOUVVPVEVEX1VSTCwgZnVuY3Rpb24gKGNocikge1xuICAgICAgICAgICAgICAgIHJldHVybiAgY2hyID09PSAnXFwnJyAgICAgICAgPyAnXFxcXDI3ICcgOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2hyID09PSAnKCcgICAgICAgICA/ICclMjgnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGNociA9PT0gJyknID8gKi8gICAnJTI5JztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIGZvciB1cmwoXCJ7e3t5Y2V1ZCB1cmx9fX1cbiAgICAgICAgeWNldWQ6IGZ1bmN0aW9uKHMpIHsgXG4gICAgICAgICAgICByZXR1cm4gY3NzVXJsKHMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIGZvciB1cmwoJ3t7e3ljZXVzIHVybH19fVxuICAgICAgICB5Y2V1czogZnVuY3Rpb24ocykgeyBcbiAgICAgICAgICAgIHJldHVybiBjc3NVcmwocykucmVwbGFjZShTUVVPVCwgJ1xcXFwyNyAnKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuLy8gZXhwb3NpbmcgcHJpdkZpbHRlcnNcbi8vIHRoaXMgaXMgYW4gdW5kb2N1bWVudGVkIGZlYXR1cmUsIGFuZCBwbGVhc2UgdXNlIGl0IHdpdGggZXh0cmEgY2FyZVxudmFyIHByaXZGaWx0ZXJzID0gZXhwb3J0cy5fcHJpdkZpbHRlcnMgPSBleHBvcnRzLl9nZXRQcml2RmlsdGVycygpO1xuXG5cbi8qIGNoYWluaW5nIGZpbHRlcnMgKi9cblxuLy8gdXJpSW5BdHRyIGFuZCBsaXRlcmFsbHkgdXJpUGF0aEluQXR0clxuLy8geXVibCBpcyBhbHdheXMgdXNlZCBcbi8vIFJhdGlvbmFsZTogZ2l2ZW4gcGF0dGVybiBsaWtlIHRoaXM6IDxhIGhyZWY9XCJ7e3t1cmlQYXRoSW5Eb3VibGVRdW90ZWRBdHRyIHN9fX1cIj5cbi8vICAgICAgICAgICAgZGV2ZWxvcGVyIG1heSBleHBlY3QgcyBpcyBhbHdheXMgcHJlZml4ZWQgd2l0aCA/IG9yIC8sIGJ1dCBhbiBhdHRhY2tlciBjYW4gYWJ1c2UgaXQgd2l0aCAnamF2YXNjcmlwdDphbGVydCgxKSdcbmZ1bmN0aW9uIHVyaUluQXR0ciAocywgeWF2LCB5dSkge1xuICAgIHJldHVybiBwcml2RmlsdGVycy55dWJsKHlhdigoeXUgfHwgcHJpdkZpbHRlcnMueXVmdWxsKShzKSkpO1xufVxuXG4vKiogXG4qIFlhaG9vIFNlY3VyZSBYU1MgRmlsdGVycyAtIGp1c3Qgc3VmZmljaWVudCBvdXRwdXQgZmlsdGVyaW5nIHRvIHByZXZlbnQgWFNTIVxuKiBAbW9kdWxlIHhzcy1maWx0ZXJzIFxuKi9cblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjaW5IVE1MRGF0YVxuKlxuKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0XG4qIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzdHJpbmcgcyB3aXRoICc8JyBlbmNvZGVkIGFzICcmYW1wO2x0OydcbipcbiogQGRlc2NyaXB0aW9uXG4qIFRoaXMgZmlsdGVyIGlzIHRvIGJlIHBsYWNlZCBpbiBIVE1MIERhdGEgY29udGV4dCB0byBlbmNvZGUgYWxsICc8JyBjaGFyYWN0ZXJzIGludG8gJyZhbXA7bHQ7J1xuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjZGF0YS1zdGF0ZVwiPkhUTUw1IERhdGEgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPGRpdj57e3tpbkhUTUxEYXRhIGh0bWxEYXRhfX19PC9kaXY+XG4qXG4qL1xuZXhwb3J0cy5pbkhUTUxEYXRhID0gcHJpdkZpbHRlcnMueWQ7XG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI2luSFRNTENvbW1lbnRcbipcbiogQHBhcmFtIHtzdHJpbmd9IHMgLSBBbiB1bnRydXN0ZWQgdXNlciBpbnB1dFxuKiBAcmV0dXJucyB7c3RyaW5nfSBBbGwgTlVMTCBjaGFyYWN0ZXJzIGluIHMgYXJlIGZpcnN0IHJlcGxhY2VkIHdpdGggXFx1RkZGRC4gSWYgcyBjb250YWlucyAtLT4sIC0tIT4sIG9yIHN0YXJ0cyB3aXRoIC0qPiwgaW5zZXJ0IGEgc3BhY2UgcmlnaHQgYmVmb3JlID4gdG8gc3RvcCBzdGF0ZSBicmVha2luZyBhdCA8IS0te3t7eWMgc319fS0tPi4gSWYgcyBlbmRzIHdpdGggLS0hLCAtLSwgb3IgLSwgYXBwZW5kIGEgc3BhY2UgdG8gc3RvcCBjb2xsYWJvcmF0aXZlIHN0YXRlIGJyZWFraW5nIGF0IHt7e3ljIHN9fX0+LCB7e3t5YyBzfX19IT4sIHt7e3ljIHN9fX0tIT4sIHt7e3ljIHN9fX0tPi4gSWYgcyBjb250YWlucyBdPiBvciBlbmRzIHdpdGggXSwgYXBwZW5kIGEgc3BhY2UgYWZ0ZXIgXSBpcyB2ZXJpZmllZCBpbiBJRSB0byBzdG9wIElFIGNvbmRpdGlvbmFsIGNvbW1lbnRzLlxuKlxuKiBAZGVzY3JpcHRpb25cbiogVGhpcyBmaWx0ZXIgaXMgdG8gYmUgcGxhY2VkIGluIEhUTUwgQ29tbWVudCBjb250ZXh0XG4qIDx1bD5cbiogPGxpPjxhIGhyZWY9XCJodHRwOi8vc2hhenplci5jby51ay92ZWN0b3IvQ2hhcmFjdGVycy10aGF0LWNsb3NlLWEtSFRNTC1jb21tZW50LTNcIj5TaGF6emVyIC0gQ2xvc2luZyBjb21tZW50cyBmb3IgLS4tPjwvYT5cbiogPGxpPjxhIGhyZWY9XCJodHRwOi8vc2hhenplci5jby51ay92ZWN0b3IvQ2hhcmFjdGVycy10aGF0LWNsb3NlLWEtSFRNTC1jb21tZW50XCI+U2hhenplciAtIENsb3NpbmcgY29tbWVudHMgZm9yIC0tLj48L2E+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3NoYXp6ZXIuY28udWsvdmVjdG9yL0NoYXJhY3RlcnMtdGhhdC1jbG9zZS1hLUhUTUwtY29tbWVudC0wMDIxXCI+U2hhenplciAtIENsb3NpbmcgY29tbWVudHMgZm9yIC4+PC9hPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2NvbW1lbnQtc3RhcnQtc3RhdGVcIj5IVE1MNSBDb21tZW50IFN0YXJ0IFN0YXRlPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjY29tbWVudC1zdGFydC1kYXNoLXN0YXRlXCI+SFRNTDUgQ29tbWVudCBTdGFydCBEYXNoIFN0YXRlPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjY29tbWVudC1zdGF0ZVwiPkhUTUw1IENvbW1lbnQgU3RhdGU8L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNjb21tZW50LWVuZC1kYXNoLXN0YXRlXCI+SFRNTDUgQ29tbWVudCBFbmQgRGFzaCBTdGF0ZTwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2NvbW1lbnQtZW5kLXN0YXRlXCI+SFRNTDUgQ29tbWVudCBFbmQgU3RhdGU8L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNjb21tZW50LWVuZC1iYW5nLXN0YXRlXCI+SFRNTDUgQ29tbWVudCBFbmQgQmFuZyBTdGF0ZTwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9tczUzNzUxMiUyOHY9dnMuODUlMjkuYXNweFwiPkNvbmRpdGlvbmFsIENvbW1lbnRzIGluIEludGVybmV0IEV4cGxvcmVyPC9hPjwvbGk+XG4qIDwvdWw+XG4qXG4qIEBleGFtcGxlXG4qIC8vIG91dHB1dCBjb250ZXh0IHRvIGJlIGFwcGxpZWQgYnkgdGhpcyBmaWx0ZXIuXG4qIDwhLS0ge3t7aW5IVE1MQ29tbWVudCBodG1sX2NvbW1lbnR9fX0gLS0+XG4qXG4qL1xuZXhwb3J0cy5pbkhUTUxDb21tZW50ID0gcHJpdkZpbHRlcnMueWM7XG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI2luU2luZ2xlUXVvdGVkQXR0clxuKlxuKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0XG4qIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzdHJpbmcgcyB3aXRoIGFueSBzaW5nbGUtcXVvdGUgY2hhcmFjdGVycyBlbmNvZGVkIGludG8gJyZhbXA7JiMzOTsnLlxuKlxuKiBAZGVzY3JpcHRpb25cbiogPHAgY2xhc3M9XCJ3YXJuaW5nXCI+V2FybmluZzogVGhpcyBpcyBOT1QgZGVzaWduZWQgZm9yIGFueSBvblggKGUuZy4sIG9uY2xpY2spIGF0dHJpYnV0ZXMhPC9wPlxuKiA8cCBjbGFzcz1cIndhcm5pbmdcIj5XYXJuaW5nOiBJZiB5b3UncmUgd29ya2luZyBvbiBVUkkvY29tcG9uZW50cywgdXNlIHRoZSBtb3JlIHNwZWNpZmljIHVyaV9fX0luU2luZ2xlUXVvdGVkQXR0ciBmaWx0ZXIgPC9wPlxuKiBUaGlzIGZpbHRlciBpcyB0byBiZSBwbGFjZWQgaW4gSFRNTCBBdHRyaWJ1dGUgVmFsdWUgKHNpbmdsZS1xdW90ZWQpIHN0YXRlIHRvIGVuY29kZSBhbGwgc2luZ2xlLXF1b3RlIGNoYXJhY3RlcnMgaW50byAnJmFtcDsmIzM5OydcbipcbiogPHVsPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2F0dHJpYnV0ZS12YWx1ZS0oc2luZ2xlLXF1b3RlZCktc3RhdGVcIj5IVE1MNSBBdHRyaWJ1dGUgVmFsdWUgKFNpbmdsZS1RdW90ZWQpIFN0YXRlPC9hPjwvbGk+XG4qIDwvdWw+XG4qXG4qIEBleGFtcGxlXG4qIC8vIG91dHB1dCBjb250ZXh0IHRvIGJlIGFwcGxpZWQgYnkgdGhpcyBmaWx0ZXIuXG4qIDxpbnB1dCBuYW1lPSdmaXJzdG5hbWUnIHZhbHVlPSd7e3tpblNpbmdsZVF1b3RlZEF0dHIgZmlyc3RuYW1lfX19JyAvPlxuKlxuKi9cbmV4cG9ydHMuaW5TaW5nbGVRdW90ZWRBdHRyID0gcHJpdkZpbHRlcnMueWF2cztcblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjaW5Eb3VibGVRdW90ZWRBdHRyXG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXRcbiogQHJldHVybnMge3N0cmluZ30gVGhlIHN0cmluZyBzIHdpdGggYW55IHNpbmdsZS1xdW90ZSBjaGFyYWN0ZXJzIGVuY29kZWQgaW50byAnJmFtcDsmcXVvdDsnLlxuKlxuKiBAZGVzY3JpcHRpb25cbiogPHAgY2xhc3M9XCJ3YXJuaW5nXCI+V2FybmluZzogVGhpcyBpcyBOT1QgZGVzaWduZWQgZm9yIGFueSBvblggKGUuZy4sIG9uY2xpY2spIGF0dHJpYnV0ZXMhPC9wPlxuKiA8cCBjbGFzcz1cIndhcm5pbmdcIj5XYXJuaW5nOiBJZiB5b3UncmUgd29ya2luZyBvbiBVUkkvY29tcG9uZW50cywgdXNlIHRoZSBtb3JlIHNwZWNpZmljIHVyaV9fX0luRG91YmxlUXVvdGVkQXR0ciBmaWx0ZXIgPC9wPlxuKiBUaGlzIGZpbHRlciBpcyB0byBiZSBwbGFjZWQgaW4gSFRNTCBBdHRyaWJ1dGUgVmFsdWUgKGRvdWJsZS1xdW90ZWQpIHN0YXRlIHRvIGVuY29kZSBhbGwgc2luZ2xlLXF1b3RlIGNoYXJhY3RlcnMgaW50byAnJmFtcDsmcXVvdDsnXG4qXG4qIDx1bD5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNhdHRyaWJ1dGUtdmFsdWUtKGRvdWJsZS1xdW90ZWQpLXN0YXRlXCI+SFRNTDUgQXR0cmlidXRlIFZhbHVlIChEb3VibGUtUXVvdGVkKSBTdGF0ZTwvYT48L2xpPlxuKiA8L3VsPlxuKlxuKiBAZXhhbXBsZVxuKiAvLyBvdXRwdXQgY29udGV4dCB0byBiZSBhcHBsaWVkIGJ5IHRoaXMgZmlsdGVyLlxuKiA8aW5wdXQgbmFtZT1cImZpcnN0bmFtZVwiIHZhbHVlPVwie3t7aW5Eb3VibGVRdW90ZWRBdHRyIGZpcnN0bmFtZX19fVwiIC8+XG4qXG4qL1xuZXhwb3J0cy5pbkRvdWJsZVF1b3RlZEF0dHIgPSBwcml2RmlsdGVycy55YXZkO1xuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyNpblVuUXVvdGVkQXR0clxuKlxuKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0XG4qIEByZXR1cm5zIHtzdHJpbmd9IElmIHMgY29udGFpbnMgYW55IHN0YXRlIGJyZWFraW5nIGNoYXJzIChcXHQsIFxcbiwgXFx2LCBcXGYsIFxcciwgc3BhY2UsIG51bGwsICcsIFwiLCBgLCA8LCA+LCBhbmQgPSksIHRoZXkgYXJlIGVzY2FwZWQgYW5kIGVuY29kZWQgaW50byB0aGVpciBlcXVpdmFsZW50IEhUTUwgZW50aXR5IHJlcHJlc2VudGF0aW9ucy4gSWYgdGhlIHN0cmluZyBpcyBlbXB0eSwgaW5qZWN0IGEgXFx1RkZGRCBjaGFyYWN0ZXIuXG4qXG4qIEBkZXNjcmlwdGlvblxuKiA8cCBjbGFzcz1cIndhcm5pbmdcIj5XYXJuaW5nOiBUaGlzIGlzIE5PVCBkZXNpZ25lZCBmb3IgYW55IG9uWCAoZS5nLiwgb25jbGljaykgYXR0cmlidXRlcyE8L3A+XG4qIDxwIGNsYXNzPVwid2FybmluZ1wiPldhcm5pbmc6IElmIHlvdSdyZSB3b3JraW5nIG9uIFVSSS9jb21wb25lbnRzLCB1c2UgdGhlIG1vcmUgc3BlY2lmaWMgdXJpX19fSW5VblF1b3RlZEF0dHIgZmlsdGVyIDwvcD5cbiogPHA+UmVnYXJkaW5nIFxcdUZGRkQgaW5qZWN0aW9uLCBnaXZlbiA8YSBpZD17e3tpZH19fSBuYW1lPVwicGFzc3dkXCI+LDxici8+XG4qICAgICAgICBSYXRpb25hbGUgMTogb3VyIGJlbGllZiBpcyB0aGF0IGRldmVsb3BlcnMgd291bGRuJ3QgZXhwZWN0IHdoZW4gaWQgZXF1YWxzIGFuXG4qICAgICAgICAgIGVtcHR5IHN0cmluZyB3b3VsZCByZXN1bHQgaW4gJyBuYW1lPVwicGFzc3dkXCInIHJlbmRlcmVkIGFzIFxuKiAgICAgICAgICBhdHRyaWJ1dGUgdmFsdWUsIGV2ZW4gdGhvdWdoIHRoaXMgaXMgaG93IEhUTUw1IGlzIHNwZWNpZmllZC48YnIvPlxuKiAgICAgICAgUmF0aW9uYWxlIDI6IGFuIGVtcHR5IG9yIGFsbCBudWxsIHN0cmluZyAoZm9yIElFKSBjYW4gXG4qICAgICAgICAgIGVmZmVjdGl2ZWx5IGFsdGVyIGl0cyBpbW1lZGlhdGUgc3Vic2VxdWVudCBzdGF0ZSwgd2UgY2hvb3NlXG4qICAgICAgICAgIFxcdUZGRkQgdG8gZW5kIHRoZSB1bnF1b3RlZCBhdHRyIFxuKiAgICAgICAgICBzdGF0ZSwgd2hpY2ggdGhlcmVmb3JlIHdpbGwgbm90IG1lc3MgdXAgbGF0ZXIgY29udGV4dHMuPGJyLz5cbiogICAgICAgIFJhdGlvbmFsZSAzOiBTaW5jZSBJRSA2LCBpdCBpcyB2ZXJpZmllZCB0aGF0IE5VTEwgY2hhcnMgYXJlIHN0cmlwcGVkLjxici8+XG4qICAgICAgICBSZWZlcmVuY2U6IGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2F0dHJpYnV0ZS12YWx1ZS0odW5xdW90ZWQpLXN0YXRlPC9wPlxuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYXR0cmlidXRlLXZhbHVlLSh1bnF1b3RlZCktc3RhdGVcIj5IVE1MNSBBdHRyaWJ1dGUgVmFsdWUgKFVucXVvdGVkKSBTdGF0ZTwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2JlZm9yZS1hdHRyaWJ1dGUtdmFsdWUtc3RhdGVcIj5IVE1MNSBCZWZvcmUgQXR0cmlidXRlIFZhbHVlIFN0YXRlPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3NoYXp6ZXIuY28udWsvZGF0YWJhc2UvQWxsL0NoYXJhY3RlcnMtd2hpY2gtYnJlYWstYXR0cmlidXRlcy13aXRob3V0LXF1b3Rlc1wiPlNoYXp6ZXIgLSBDaGFyYWN0ZXJzLXdoaWNoLWJyZWFrLWF0dHJpYnV0ZXMtd2l0aG91dC1xdW90ZXM8L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwOi8vc2hhenplci5jby51ay92ZWN0b3IvQ2hhcmFjdGVycy1hbGxvd2VkLWF0dHJpYnV0ZS1xdW90ZVwiPlNoYXp6ZXIgLSBDaGFyYWN0ZXJzLWFsbG93ZWQtYXR0cmlidXRlLXF1b3RlPC9hPjwvbGk+XG4qIDwvdWw+XG4qXG4qIEBleGFtcGxlXG4qIC8vIG91dHB1dCBjb250ZXh0IHRvIGJlIGFwcGxpZWQgYnkgdGhpcyBmaWx0ZXIuXG4qIDxpbnB1dCBuYW1lPVwiZmlyc3RuYW1lXCIgdmFsdWU9e3t7aW5VblF1b3RlZEF0dHIgZmlyc3RuYW1lfX19IC8+XG4qXG4qL1xuZXhwb3J0cy5pblVuUXVvdGVkQXR0ciA9IHByaXZGaWx0ZXJzLnlhdnU7XG5cblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpSW5TaW5nbGVRdW90ZWRBdHRyXG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXQsIHN1cHBvc2VkbHkgYW4gPHN0cm9uZz5hYnNvbHV0ZTwvc3Ryb25nPiBVUklcbiogQHJldHVybnMge3N0cmluZ30gVGhlIHN0cmluZyBzIGVuY29kZWQgZmlyc3QgYnkgd2luZG93LmVuY29kZVVSSSgpLCB0aGVuIGluU2luZ2xlUXVvdGVkQXR0cigpLCBhbmQgZmluYWxseSBwcmVmaXggdGhlIHJlc3VsdGVkIHN0cmluZyB3aXRoICd4LScgaWYgaXQgYmVnaW5zIHdpdGggJ2phdmFzY3JpcHQ6JyBvciAndmJzY3JpcHQ6JyB0aGF0IGNvdWxkIHBvc3NpYmx5IGxlYWQgdG8gc2NyaXB0IGV4ZWN1dGlvblxuKlxuKiBAZGVzY3JpcHRpb25cbiogVGhpcyBmaWx0ZXIgaXMgdG8gYmUgcGxhY2VkIGluIEhUTUwgQXR0cmlidXRlIFZhbHVlIChzaW5nbGUtcXVvdGVkKSBzdGF0ZSBmb3IgYW4gPHN0cm9uZz5hYnNvbHV0ZTwvc3Ryb25nPiBVUkkuPGJyLz5cbiogVGhlIGNvcnJlY3Qgb3JkZXIgb2YgZW5jb2RlcnMgaXMgdGh1czogZmlyc3Qgd2luZG93LmVuY29kZVVSSSgpLCB0aGVuIGluU2luZ2xlUXVvdGVkQXR0cigpLCBhbmQgZmluYWxseSBwcmVmaXggdGhlIHJlc3VsdGVkIHN0cmluZyB3aXRoICd4LScgaWYgaXQgYmVnaW5zIHdpdGggJ2phdmFzY3JpcHQ6JyBvciAndmJzY3JpcHQ6JyB0aGF0IGNvdWxkIHBvc3NpYmx5IGxlYWQgdG8gc2NyaXB0IGV4ZWN1dGlvblxuKlxuKiA8cD5Ob3RpY2U6IFRoaXMgZmlsdGVyIGlzIElQdjYgZnJpZW5kbHkgYnkgbm90IGVuY29kaW5nICdbJyBhbmQgJ10nLjwvcD5cbipcbiogPHVsPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL2VuY29kZVVSSVwiPmVuY29kZVVSSSB8IE1ETjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODZcIj5SRkMgMzk4NjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2F0dHJpYnV0ZS12YWx1ZS0oc2luZ2xlLXF1b3RlZCktc3RhdGVcIj5IVE1MNSBBdHRyaWJ1dGUgVmFsdWUgKFNpbmdsZS1RdW90ZWQpIFN0YXRlPC9hPjwvbGk+XG4qIDwvdWw+XG4qXG4qIEBleGFtcGxlXG4qIC8vIG91dHB1dCBjb250ZXh0IHRvIGJlIGFwcGxpZWQgYnkgdGhpcyBmaWx0ZXIuXG4qIDxhIGhyZWY9J3t7e3VyaUluU2luZ2xlUXVvdGVkQXR0ciBmdWxsX3VyaX19fSc+bGluazwvYT5cbiogXG4qL1xuZXhwb3J0cy51cmlJblNpbmdsZVF1b3RlZEF0dHIgPSBmdW5jdGlvbiAocykge1xuICAgIHJldHVybiB1cmlJbkF0dHIocywgcHJpdkZpbHRlcnMueWF2cyk7XG59O1xuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlJbkRvdWJsZVF1b3RlZEF0dHJcbipcbiogQHBhcmFtIHtzdHJpbmd9IHMgLSBBbiB1bnRydXN0ZWQgdXNlciBpbnB1dCwgc3VwcG9zZWRseSBhbiA8c3Ryb25nPmFic29sdXRlPC9zdHJvbmc+IFVSSVxuKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgc3RyaW5nIHMgZW5jb2RlZCBmaXJzdCBieSB3aW5kb3cuZW5jb2RlVVJJKCksIHRoZW4gaW5Eb3VibGVRdW90ZWRBdHRyKCksIGFuZCBmaW5hbGx5IHByZWZpeCB0aGUgcmVzdWx0ZWQgc3RyaW5nIHdpdGggJ3gtJyBpZiBpdCBiZWdpbnMgd2l0aCAnamF2YXNjcmlwdDonIG9yICd2YnNjcmlwdDonIHRoYXQgY291bGQgcG9zc2libHkgbGVhZCB0byBzY3JpcHQgZXhlY3V0aW9uXG4qXG4qIEBkZXNjcmlwdGlvblxuKiBUaGlzIGZpbHRlciBpcyB0byBiZSBwbGFjZWQgaW4gSFRNTCBBdHRyaWJ1dGUgVmFsdWUgKGRvdWJsZS1xdW90ZWQpIHN0YXRlIGZvciBhbiA8c3Ryb25nPmFic29sdXRlPC9zdHJvbmc+IFVSSS48YnIvPlxuKiBUaGUgY29ycmVjdCBvcmRlciBvZiBlbmNvZGVycyBpcyB0aHVzOiBmaXJzdCB3aW5kb3cuZW5jb2RlVVJJKCksIHRoZW4gaW5Eb3VibGVRdW90ZWRBdHRyKCksIGFuZCBmaW5hbGx5IHByZWZpeCB0aGUgcmVzdWx0ZWQgc3RyaW5nIHdpdGggJ3gtJyBpZiBpdCBiZWdpbnMgd2l0aCAnamF2YXNjcmlwdDonIG9yICd2YnNjcmlwdDonIHRoYXQgY291bGQgcG9zc2libHkgbGVhZCB0byBzY3JpcHQgZXhlY3V0aW9uXG4qXG4qIDxwPk5vdGljZTogVGhpcyBmaWx0ZXIgaXMgSVB2NiBmcmllbmRseSBieSBub3QgZW5jb2RpbmcgJ1snIGFuZCAnXScuPC9wPlxuKlxuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZW5jb2RlVVJJXCI+ZW5jb2RlVVJJIHwgTUROPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlwiPlJGQyAzOTg2PC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYXR0cmlidXRlLXZhbHVlLShkb3VibGUtcXVvdGVkKS1zdGF0ZVwiPkhUTUw1IEF0dHJpYnV0ZSBWYWx1ZSAoRG91YmxlLVF1b3RlZCkgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPGEgaHJlZj1cInt7e3VyaUluRG91YmxlUXVvdGVkQXR0ciBmdWxsX3VyaX19fVwiPmxpbms8L2E+XG4qIFxuKi9cbmV4cG9ydHMudXJpSW5Eb3VibGVRdW90ZWRBdHRyID0gZnVuY3Rpb24gKHMpIHtcbiAgICByZXR1cm4gdXJpSW5BdHRyKHMsIHByaXZGaWx0ZXJzLnlhdmQpO1xufTtcblxuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlJblVuUXVvdGVkQXR0clxuKlxuKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0LCBzdXBwb3NlZGx5IGFuIDxzdHJvbmc+YWJzb2x1dGU8L3N0cm9uZz4gVVJJXG4qIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzdHJpbmcgcyBlbmNvZGVkIGZpcnN0IGJ5IHdpbmRvdy5lbmNvZGVVUkkoKSwgdGhlbiBpblVuUXVvdGVkQXR0cigpLCBhbmQgZmluYWxseSBwcmVmaXggdGhlIHJlc3VsdGVkIHN0cmluZyB3aXRoICd4LScgaWYgaXQgYmVnaW5zIHdpdGggJ2phdmFzY3JpcHQ6JyBvciAndmJzY3JpcHQ6JyB0aGF0IGNvdWxkIHBvc3NpYmx5IGxlYWQgdG8gc2NyaXB0IGV4ZWN1dGlvblxuKlxuKiBAZGVzY3JpcHRpb25cbiogVGhpcyBmaWx0ZXIgaXMgdG8gYmUgcGxhY2VkIGluIEhUTUwgQXR0cmlidXRlIFZhbHVlICh1bnF1b3RlZCkgc3RhdGUgZm9yIGFuIDxzdHJvbmc+YWJzb2x1dGU8L3N0cm9uZz4gVVJJLjxici8+XG4qIFRoZSBjb3JyZWN0IG9yZGVyIG9mIGVuY29kZXJzIGlzIHRodXM6IGZpcnN0IHRoZSBidWlsdC1pbiBlbmNvZGVVUkkoKSwgdGhlbiBpblVuUXVvdGVkQXR0cigpLCBhbmQgZmluYWxseSBwcmVmaXggdGhlIHJlc3VsdGVkIHN0cmluZyB3aXRoICd4LScgaWYgaXQgYmVnaW5zIHdpdGggJ2phdmFzY3JpcHQ6JyBvciAndmJzY3JpcHQ6JyB0aGF0IGNvdWxkIHBvc3NpYmx5IGxlYWQgdG8gc2NyaXB0IGV4ZWN1dGlvblxuKlxuKiA8cD5Ob3RpY2U6IFRoaXMgZmlsdGVyIGlzIElQdjYgZnJpZW5kbHkgYnkgbm90IGVuY29kaW5nICdbJyBhbmQgJ10nLjwvcD5cbipcbiogPHVsPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL2VuY29kZVVSSVwiPmVuY29kZVVSSSB8IE1ETjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODZcIj5SRkMgMzk4NjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2F0dHJpYnV0ZS12YWx1ZS0odW5xdW90ZWQpLXN0YXRlXCI+SFRNTDUgQXR0cmlidXRlIFZhbHVlIChVbnF1b3RlZCkgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPGEgaHJlZj17e3t1cmlJblVuUXVvdGVkQXR0ciBmdWxsX3VyaX19fT5saW5rPC9hPlxuKiBcbiovXG5leHBvcnRzLnVyaUluVW5RdW90ZWRBdHRyID0gZnVuY3Rpb24gKHMpIHtcbiAgICByZXR1cm4gdXJpSW5BdHRyKHMsIHByaXZGaWx0ZXJzLnlhdnUpO1xufTtcblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpSW5IVE1MRGF0YVxuKlxuKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0LCBzdXBwb3NlZGx5IGFuIDxzdHJvbmc+YWJzb2x1dGU8L3N0cm9uZz4gVVJJXG4qIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzdHJpbmcgcyBlbmNvZGVkIGJ5IHdpbmRvdy5lbmNvZGVVUkkoKSBhbmQgdGhlbiBpbkhUTUxEYXRhKClcbipcbiogQGRlc2NyaXB0aW9uXG4qIFRoaXMgZmlsdGVyIGlzIHRvIGJlIHBsYWNlZCBpbiBIVE1MIERhdGEgc3RhdGUgZm9yIGFuIDxzdHJvbmc+YWJzb2x1dGU8L3N0cm9uZz4gVVJJLlxuKlxuKiA8cD5Ob3RpY2U6IFRoZSBhY3R1YWwgaW1wbGVtZW50YXRpb24gc2tpcHMgaW5IVE1MRGF0YSgpLCBzaW5jZSAnPCcgaXMgYWxyZWFkeSBlbmNvZGVkIGFzICclM0MnIGJ5IGVuY29kZVVSSSgpLjwvcD5cbiogPHA+Tm90aWNlOiBUaGlzIGZpbHRlciBpcyBJUHY2IGZyaWVuZGx5IGJ5IG5vdCBlbmNvZGluZyAnWycgYW5kICddJy48L3A+XG4qXG4qIDx1bD5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9lbmNvZGVVUklcIj5lbmNvZGVVUkkgfCBNRE48L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2XCI+UkZDIDM5ODY8L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNkYXRhLXN0YXRlXCI+SFRNTDUgRGF0YSBTdGF0ZTwvYT48L2xpPlxuKiA8L3VsPlxuKlxuKiBAZXhhbXBsZVxuKiAvLyBvdXRwdXQgY29udGV4dCB0byBiZSBhcHBsaWVkIGJ5IHRoaXMgZmlsdGVyLlxuKiA8YSBocmVmPVwiL3NvbWV3aGVyZVwiPnt7e3VyaUluSFRNTERhdGEgZnVsbF91cml9fX08L2E+XG4qIFxuKi9cbmV4cG9ydHMudXJpSW5IVE1MRGF0YSA9IHByaXZGaWx0ZXJzLnl1ZnVsbDtcblxuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlJbkhUTUxDb21tZW50XG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXQsIHN1cHBvc2VkbHkgYW4gPHN0cm9uZz5hYnNvbHV0ZTwvc3Ryb25nPiBVUklcbiogQHJldHVybnMge3N0cmluZ30gVGhlIHN0cmluZyBzIGVuY29kZWQgYnkgd2luZG93LmVuY29kZVVSSSgpLCBhbmQgZmluYWxseSBpbkhUTUxDb21tZW50KClcbipcbiogQGRlc2NyaXB0aW9uXG4qIFRoaXMgZmlsdGVyIGlzIHRvIGJlIHBsYWNlZCBpbiBIVE1MIENvbW1lbnQgc3RhdGUgZm9yIGFuIDxzdHJvbmc+YWJzb2x1dGU8L3N0cm9uZz4gVVJJLlxuKlxuKiA8cD5Ob3RpY2U6IFRoaXMgZmlsdGVyIGlzIElQdjYgZnJpZW5kbHkgYnkgbm90IGVuY29kaW5nICdbJyBhbmQgJ10nLjwvcD5cbipcbiogPHVsPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL2VuY29kZVVSSVwiPmVuY29kZVVSSSB8IE1ETjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODZcIj5SRkMgMzk4NjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2RhdGEtc3RhdGVcIj5IVE1MNSBEYXRhIFN0YXRlPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjY29tbWVudC1zdGF0ZVwiPkhUTUw1IENvbW1lbnQgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPCEtLSB7e3t1cmlJbkhUTUxDb21tZW50IGZ1bGxfdXJpfX19IC0tPlxuKiBcbiovXG5leHBvcnRzLnVyaUluSFRNTENvbW1lbnQgPSBmdW5jdGlvbiAocykge1xuICAgIHJldHVybiBwcml2RmlsdGVycy55Yyhwcml2RmlsdGVycy55dWZ1bGwocykpO1xufTtcblxuXG5cblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpUGF0aEluU2luZ2xlUXVvdGVkQXR0clxuKlxuKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0LCBzdXBwb3NlZGx5IGEgVVJJIFBhdGgvUXVlcnkgb3IgcmVsYXRpdmUgVVJJXG4qIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzdHJpbmcgcyBlbmNvZGVkIGZpcnN0IGJ5IHdpbmRvdy5lbmNvZGVVUkkoKSwgdGhlbiBpblNpbmdsZVF1b3RlZEF0dHIoKSwgYW5kIGZpbmFsbHkgcHJlZml4IHRoZSByZXN1bHRlZCBzdHJpbmcgd2l0aCAneC0nIGlmIGl0IGJlZ2lucyB3aXRoICdqYXZhc2NyaXB0Oicgb3IgJ3Zic2NyaXB0OicgdGhhdCBjb3VsZCBwb3NzaWJseSBsZWFkIHRvIHNjcmlwdCBleGVjdXRpb25cbipcbiogQGRlc2NyaXB0aW9uXG4qIFRoaXMgZmlsdGVyIGlzIHRvIGJlIHBsYWNlZCBpbiBIVE1MIEF0dHJpYnV0ZSBWYWx1ZSAoc2luZ2xlLXF1b3RlZCkgc3RhdGUgZm9yIGEgVVJJIFBhdGgvUXVlcnkgb3IgcmVsYXRpdmUgVVJJLjxici8+XG4qIFRoZSBjb3JyZWN0IG9yZGVyIG9mIGVuY29kZXJzIGlzIHRodXM6IGZpcnN0IHdpbmRvdy5lbmNvZGVVUkkoKSwgdGhlbiBpblNpbmdsZVF1b3RlZEF0dHIoKSwgYW5kIGZpbmFsbHkgcHJlZml4IHRoZSByZXN1bHRlZCBzdHJpbmcgd2l0aCAneC0nIGlmIGl0IGJlZ2lucyB3aXRoICdqYXZhc2NyaXB0Oicgb3IgJ3Zic2NyaXB0OicgdGhhdCBjb3VsZCBwb3NzaWJseSBsZWFkIHRvIHNjcmlwdCBleGVjdXRpb25cbipcbiogPHVsPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL2VuY29kZVVSSVwiPmVuY29kZVVSSSB8IE1ETjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODZcIj5SRkMgMzk4NjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2F0dHJpYnV0ZS12YWx1ZS0oc2luZ2xlLXF1b3RlZCktc3RhdGVcIj5IVE1MNSBBdHRyaWJ1dGUgVmFsdWUgKFNpbmdsZS1RdW90ZWQpIFN0YXRlPC9hPjwvbGk+XG4qIDwvdWw+XG4qXG4qIEBleGFtcGxlXG4qIC8vIG91dHB1dCBjb250ZXh0IHRvIGJlIGFwcGxpZWQgYnkgdGhpcyBmaWx0ZXIuXG4qIDxhIGhyZWY9J2h0dHA6Ly9leGFtcGxlLmNvbS97e3t1cmlQYXRoSW5TaW5nbGVRdW90ZWRBdHRyIHVyaV9wYXRofX19Jz5saW5rPC9hPlxuKiA8YSBocmVmPSdodHRwOi8vZXhhbXBsZS5jb20vP3t7e3VyaVF1ZXJ5SW5TaW5nbGVRdW90ZWRBdHRyIHVyaV9xdWVyeX19fSc+bGluazwvYT5cbiogXG4qL1xuZXhwb3J0cy51cmlQYXRoSW5TaW5nbGVRdW90ZWRBdHRyID0gZnVuY3Rpb24gKHMpIHtcbiAgICByZXR1cm4gdXJpSW5BdHRyKHMsIHByaXZGaWx0ZXJzLnlhdnMsIHByaXZGaWx0ZXJzLnl1KTtcbn07XG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI3VyaVBhdGhJbkRvdWJsZVF1b3RlZEF0dHJcbipcbiogQHBhcmFtIHtzdHJpbmd9IHMgLSBBbiB1bnRydXN0ZWQgdXNlciBpbnB1dCwgc3VwcG9zZWRseSBhIFVSSSBQYXRoL1F1ZXJ5IG9yIHJlbGF0aXZlIFVSSVxuKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgc3RyaW5nIHMgZW5jb2RlZCBmaXJzdCBieSB3aW5kb3cuZW5jb2RlVVJJKCksIHRoZW4gaW5Eb3VibGVRdW90ZWRBdHRyKCksIGFuZCBmaW5hbGx5IHByZWZpeCB0aGUgcmVzdWx0ZWQgc3RyaW5nIHdpdGggJ3gtJyBpZiBpdCBiZWdpbnMgd2l0aCAnamF2YXNjcmlwdDonIG9yICd2YnNjcmlwdDonIHRoYXQgY291bGQgcG9zc2libHkgbGVhZCB0byBzY3JpcHQgZXhlY3V0aW9uXG4qXG4qIEBkZXNjcmlwdGlvblxuKiBUaGlzIGZpbHRlciBpcyB0byBiZSBwbGFjZWQgaW4gSFRNTCBBdHRyaWJ1dGUgVmFsdWUgKGRvdWJsZS1xdW90ZWQpIHN0YXRlIGZvciBhIFVSSSBQYXRoL1F1ZXJ5IG9yIHJlbGF0aXZlIFVSSS48YnIvPlxuKiBUaGUgY29ycmVjdCBvcmRlciBvZiBlbmNvZGVycyBpcyB0aHVzOiBmaXJzdCB3aW5kb3cuZW5jb2RlVVJJKCksIHRoZW4gaW5Eb3VibGVRdW90ZWRBdHRyKCksIGFuZCBmaW5hbGx5IHByZWZpeCB0aGUgcmVzdWx0ZWQgc3RyaW5nIHdpdGggJ3gtJyBpZiBpdCBiZWdpbnMgd2l0aCAnamF2YXNjcmlwdDonIG9yICd2YnNjcmlwdDonIHRoYXQgY291bGQgcG9zc2libHkgbGVhZCB0byBzY3JpcHQgZXhlY3V0aW9uXG4qXG4qIDx1bD5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9lbmNvZGVVUklcIj5lbmNvZGVVUkkgfCBNRE48L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2XCI+UkZDIDM5ODY8L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNhdHRyaWJ1dGUtdmFsdWUtKGRvdWJsZS1xdW90ZWQpLXN0YXRlXCI+SFRNTDUgQXR0cmlidXRlIFZhbHVlIChEb3VibGUtUXVvdGVkKSBTdGF0ZTwvYT48L2xpPlxuKiA8L3VsPlxuKlxuKiBAZXhhbXBsZVxuKiAvLyBvdXRwdXQgY29udGV4dCB0byBiZSBhcHBsaWVkIGJ5IHRoaXMgZmlsdGVyLlxuKiA8YSBocmVmPVwiaHR0cDovL2V4YW1wbGUuY29tL3t7e3VyaVBhdGhJbkRvdWJsZVF1b3RlZEF0dHIgdXJpX3BhdGh9fX1cIj5saW5rPC9hPlxuKiA8YSBocmVmPVwiaHR0cDovL2V4YW1wbGUuY29tLz97e3t1cmlRdWVyeUluRG91YmxlUXVvdGVkQXR0ciB1cmlfcXVlcnl9fX1cIj5saW5rPC9hPlxuKiBcbiovXG5leHBvcnRzLnVyaVBhdGhJbkRvdWJsZVF1b3RlZEF0dHIgPSBmdW5jdGlvbiAocykge1xuICAgIHJldHVybiB1cmlJbkF0dHIocywgcHJpdkZpbHRlcnMueWF2ZCwgcHJpdkZpbHRlcnMueXUpO1xufTtcblxuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlQYXRoSW5VblF1b3RlZEF0dHJcbipcbiogQHBhcmFtIHtzdHJpbmd9IHMgLSBBbiB1bnRydXN0ZWQgdXNlciBpbnB1dCwgc3VwcG9zZWRseSBhIFVSSSBQYXRoL1F1ZXJ5IG9yIHJlbGF0aXZlIFVSSVxuKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgc3RyaW5nIHMgZW5jb2RlZCBmaXJzdCBieSB3aW5kb3cuZW5jb2RlVVJJKCksIHRoZW4gaW5VblF1b3RlZEF0dHIoKSwgYW5kIGZpbmFsbHkgcHJlZml4IHRoZSByZXN1bHRlZCBzdHJpbmcgd2l0aCAneC0nIGlmIGl0IGJlZ2lucyB3aXRoICdqYXZhc2NyaXB0Oicgb3IgJ3Zic2NyaXB0OicgdGhhdCBjb3VsZCBwb3NzaWJseSBsZWFkIHRvIHNjcmlwdCBleGVjdXRpb25cbipcbiogQGRlc2NyaXB0aW9uXG4qIFRoaXMgZmlsdGVyIGlzIHRvIGJlIHBsYWNlZCBpbiBIVE1MIEF0dHJpYnV0ZSBWYWx1ZSAodW5xdW90ZWQpIHN0YXRlIGZvciBhIFVSSSBQYXRoL1F1ZXJ5IG9yIHJlbGF0aXZlIFVSSS48YnIvPlxuKiBUaGUgY29ycmVjdCBvcmRlciBvZiBlbmNvZGVycyBpcyB0aHVzOiBmaXJzdCB0aGUgYnVpbHQtaW4gZW5jb2RlVVJJKCksIHRoZW4gaW5VblF1b3RlZEF0dHIoKSwgYW5kIGZpbmFsbHkgcHJlZml4IHRoZSByZXN1bHRlZCBzdHJpbmcgd2l0aCAneC0nIGlmIGl0IGJlZ2lucyB3aXRoICdqYXZhc2NyaXB0Oicgb3IgJ3Zic2NyaXB0OicgdGhhdCBjb3VsZCBwb3NzaWJseSBsZWFkIHRvIHNjcmlwdCBleGVjdXRpb25cbipcbiogPHVsPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL2VuY29kZVVSSVwiPmVuY29kZVVSSSB8IE1ETjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODZcIj5SRkMgMzk4NjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2F0dHJpYnV0ZS12YWx1ZS0odW5xdW90ZWQpLXN0YXRlXCI+SFRNTDUgQXR0cmlidXRlIFZhbHVlIChVbnF1b3RlZCkgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPGEgaHJlZj1odHRwOi8vZXhhbXBsZS5jb20ve3t7dXJpUGF0aEluVW5RdW90ZWRBdHRyIHVyaV9wYXRofX19Pmxpbms8L2E+XG4qIDxhIGhyZWY9aHR0cDovL2V4YW1wbGUuY29tLz97e3t1cmlRdWVyeUluVW5RdW90ZWRBdHRyIHVyaV9xdWVyeX19fT5saW5rPC9hPlxuKiBcbiovXG5leHBvcnRzLnVyaVBhdGhJblVuUXVvdGVkQXR0ciA9IGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuIHVyaUluQXR0cihzLCBwcml2RmlsdGVycy55YXZ1LCBwcml2RmlsdGVycy55dSk7XG59O1xuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlQYXRoSW5IVE1MRGF0YVxuKlxuKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0LCBzdXBwb3NlZGx5IGEgVVJJIFBhdGgvUXVlcnkgb3IgcmVsYXRpdmUgVVJJXG4qIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzdHJpbmcgcyBlbmNvZGVkIGJ5IHdpbmRvdy5lbmNvZGVVUkkoKSBhbmQgdGhlbiBpbkhUTUxEYXRhKClcbipcbiogQGRlc2NyaXB0aW9uXG4qIFRoaXMgZmlsdGVyIGlzIHRvIGJlIHBsYWNlZCBpbiBIVE1MIERhdGEgc3RhdGUgZm9yIGEgVVJJIFBhdGgvUXVlcnkgb3IgcmVsYXRpdmUgVVJJLlxuKlxuKiA8cD5Ob3RpY2U6IFRoZSBhY3R1YWwgaW1wbGVtZW50YXRpb24gc2tpcHMgaW5IVE1MRGF0YSgpLCBzaW5jZSAnPCcgaXMgYWxyZWFkeSBlbmNvZGVkIGFzICclM0MnIGJ5IGVuY29kZVVSSSgpLjwvcD5cbipcbiogPHVsPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL2VuY29kZVVSSVwiPmVuY29kZVVSSSB8IE1ETjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODZcIj5SRkMgMzk4NjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2RhdGEtc3RhdGVcIj5IVE1MNSBEYXRhIFN0YXRlPC9hPjwvbGk+XG4qIDwvdWw+XG4qXG4qIEBleGFtcGxlXG4qIC8vIG91dHB1dCBjb250ZXh0IHRvIGJlIGFwcGxpZWQgYnkgdGhpcyBmaWx0ZXIuXG4qIDxhIGhyZWY9XCJodHRwOi8vZXhhbXBsZS5jb20vXCI+aHR0cDovL2V4YW1wbGUuY29tL3t7e3VyaVBhdGhJbkhUTUxEYXRhIHVyaV9wYXRofX19PC9hPlxuKiA8YSBocmVmPVwiaHR0cDovL2V4YW1wbGUuY29tL1wiPmh0dHA6Ly9leGFtcGxlLmNvbS8/e3t7dXJpUXVlcnlJbkhUTUxEYXRhIHVyaV9xdWVyeX19fTwvYT5cbiogXG4qL1xuZXhwb3J0cy51cmlQYXRoSW5IVE1MRGF0YSA9IHByaXZGaWx0ZXJzLnl1O1xuXG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI3VyaVBhdGhJbkhUTUxDb21tZW50XG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXQsIHN1cHBvc2VkbHkgYSBVUkkgUGF0aC9RdWVyeSBvciByZWxhdGl2ZSBVUklcbiogQHJldHVybnMge3N0cmluZ30gVGhlIHN0cmluZyBzIGVuY29kZWQgYnkgd2luZG93LmVuY29kZVVSSSgpLCBhbmQgZmluYWxseSBpbkhUTUxDb21tZW50KClcbipcbiogQGRlc2NyaXB0aW9uXG4qIFRoaXMgZmlsdGVyIGlzIHRvIGJlIHBsYWNlZCBpbiBIVE1MIENvbW1lbnQgc3RhdGUgZm9yIGEgVVJJIFBhdGgvUXVlcnkgb3IgcmVsYXRpdmUgVVJJLlxuKlxuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZW5jb2RlVVJJXCI+ZW5jb2RlVVJJIHwgTUROPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlwiPlJGQyAzOTg2PC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjZGF0YS1zdGF0ZVwiPkhUTUw1IERhdGEgU3RhdGU8L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNjb21tZW50LXN0YXRlXCI+SFRNTDUgQ29tbWVudCBTdGF0ZTwvYT48L2xpPlxuKiA8L3VsPlxuKlxuKiBAZXhhbXBsZVxuKiAvLyBvdXRwdXQgY29udGV4dCB0byBiZSBhcHBsaWVkIGJ5IHRoaXMgZmlsdGVyLlxuKiA8IS0tIGh0dHA6Ly9leGFtcGxlLmNvbS97e3t1cmlQYXRoSW5IVE1MQ29tbWVudCB1cmlfcGF0aH19fSAtLT5cbiogPCEtLSBodHRwOi8vZXhhbXBsZS5jb20vP3t7e3VyaVF1ZXJ5SW5IVE1MQ29tbWVudCB1cmlfcXVlcnl9fX0gLS0+XG4qL1xuZXhwb3J0cy51cmlQYXRoSW5IVE1MQ29tbWVudCA9IGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuIHByaXZGaWx0ZXJzLnljKHByaXZGaWx0ZXJzLnl1KHMpKTtcbn07XG5cblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpUXVlcnlJblNpbmdsZVF1b3RlZEF0dHJcbiogQGRlc2NyaXB0aW9uIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlQYXRoSW5TaW5nbGVRdW90ZWRBdHRyfVxuKiBcbiogQGFsaWFzIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlQYXRoSW5TaW5nbGVRdW90ZWRBdHRyXG4qL1xuZXhwb3J0cy51cmlRdWVyeUluU2luZ2xlUXVvdGVkQXR0ciA9IGV4cG9ydHMudXJpUGF0aEluU2luZ2xlUXVvdGVkQXR0cjtcblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpUXVlcnlJbkRvdWJsZVF1b3RlZEF0dHJcbiogQGRlc2NyaXB0aW9uIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlQYXRoSW5Eb3VibGVRdW90ZWRBdHRyfVxuKiBcbiogQGFsaWFzIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlQYXRoSW5Eb3VibGVRdW90ZWRBdHRyXG4qL1xuZXhwb3J0cy51cmlRdWVyeUluRG91YmxlUXVvdGVkQXR0ciA9IGV4cG9ydHMudXJpUGF0aEluRG91YmxlUXVvdGVkQXR0cjtcblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpUXVlcnlJblVuUXVvdGVkQXR0clxuKiBAZGVzY3JpcHRpb24gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgbW9kdWxlOnhzcy1maWx0ZXJzI3VyaVBhdGhJblVuUXVvdGVkQXR0cn1cbiogXG4qIEBhbGlhcyBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpUGF0aEluVW5RdW90ZWRBdHRyXG4qL1xuZXhwb3J0cy51cmlRdWVyeUluVW5RdW90ZWRBdHRyID0gZXhwb3J0cy51cmlQYXRoSW5VblF1b3RlZEF0dHI7XG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI3VyaVF1ZXJ5SW5IVE1MRGF0YVxuKiBAZGVzY3JpcHRpb24gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgbW9kdWxlOnhzcy1maWx0ZXJzI3VyaVBhdGhJbkhUTUxEYXRhfVxuKiBcbiogQGFsaWFzIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlQYXRoSW5IVE1MRGF0YVxuKi9cbmV4cG9ydHMudXJpUXVlcnlJbkhUTUxEYXRhID0gZXhwb3J0cy51cmlQYXRoSW5IVE1MRGF0YTtcblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpUXVlcnlJbkhUTUxDb21tZW50XG4qIEBkZXNjcmlwdGlvbiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpUGF0aEluSFRNTENvbW1lbnR9XG4qIFxuKiBAYWxpYXMgbW9kdWxlOnhzcy1maWx0ZXJzI3VyaVBhdGhJbkhUTUxDb21tZW50XG4qL1xuZXhwb3J0cy51cmlRdWVyeUluSFRNTENvbW1lbnQgPSBleHBvcnRzLnVyaVBhdGhJbkhUTUxDb21tZW50O1xuXG5cblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpQ29tcG9uZW50SW5TaW5nbGVRdW90ZWRBdHRyXG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXQsIHN1cHBvc2VkbHkgYSBVUkkgQ29tcG9uZW50XG4qIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzdHJpbmcgcyBlbmNvZGVkIGZpcnN0IGJ5IHdpbmRvdy5lbmNvZGVVUklDb21wb25lbnQoKSwgdGhlbiBpblNpbmdsZVF1b3RlZEF0dHIoKVxuKlxuKiBAZGVzY3JpcHRpb25cbiogVGhpcyBmaWx0ZXIgaXMgdG8gYmUgcGxhY2VkIGluIEhUTUwgQXR0cmlidXRlIFZhbHVlIChzaW5nbGUtcXVvdGVkKSBzdGF0ZSBmb3IgYSBVUkkgQ29tcG9uZW50Ljxici8+XG4qIFRoZSBjb3JyZWN0IG9yZGVyIG9mIGVuY29kZXJzIGlzIHRodXM6IGZpcnN0IHdpbmRvdy5lbmNvZGVVUklDb21wb25lbnQoKSwgdGhlbiBpblNpbmdsZVF1b3RlZEF0dHIoKVxuKlxuKlxuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZW5jb2RlVVJJQ29tcG9uZW50XCI+ZW5jb2RlVVJJQ29tcG9uZW50IHwgTUROPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlwiPlJGQyAzOTg2PC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYXR0cmlidXRlLXZhbHVlLShzaW5nbGUtcXVvdGVkKS1zdGF0ZVwiPkhUTUw1IEF0dHJpYnV0ZSBWYWx1ZSAoU2luZ2xlLVF1b3RlZCkgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPGEgaHJlZj0naHR0cDovL2V4YW1wbGUuY29tLz9xPXt7e3VyaUNvbXBvbmVudEluU2luZ2xlUXVvdGVkQXR0ciB1cmlfY29tcG9uZW50fX19Jz5saW5rPC9hPlxuKiBcbiovXG5leHBvcnRzLnVyaUNvbXBvbmVudEluU2luZ2xlUXVvdGVkQXR0ciA9IGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuIHByaXZGaWx0ZXJzLnlhdnMocHJpdkZpbHRlcnMueXVjKHMpKTtcbn07XG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI3VyaUNvbXBvbmVudEluRG91YmxlUXVvdGVkQXR0clxuKlxuKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0LCBzdXBwb3NlZGx5IGEgVVJJIENvbXBvbmVudFxuKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgc3RyaW5nIHMgZW5jb2RlZCBmaXJzdCBieSB3aW5kb3cuZW5jb2RlVVJJQ29tcG9uZW50KCksIHRoZW4gaW5Eb3VibGVRdW90ZWRBdHRyKClcbipcbiogQGRlc2NyaXB0aW9uXG4qIFRoaXMgZmlsdGVyIGlzIHRvIGJlIHBsYWNlZCBpbiBIVE1MIEF0dHJpYnV0ZSBWYWx1ZSAoZG91YmxlLXF1b3RlZCkgc3RhdGUgZm9yIGEgVVJJIENvbXBvbmVudC48YnIvPlxuKiBUaGUgY29ycmVjdCBvcmRlciBvZiBlbmNvZGVycyBpcyB0aHVzOiBmaXJzdCB3aW5kb3cuZW5jb2RlVVJJQ29tcG9uZW50KCksIHRoZW4gaW5Eb3VibGVRdW90ZWRBdHRyKClcbipcbipcbiogPHVsPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL2VuY29kZVVSSUNvbXBvbmVudFwiPmVuY29kZVVSSUNvbXBvbmVudCB8IE1ETjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODZcIj5SRkMgMzk4NjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2F0dHJpYnV0ZS12YWx1ZS0oZG91YmxlLXF1b3RlZCktc3RhdGVcIj5IVE1MNSBBdHRyaWJ1dGUgVmFsdWUgKERvdWJsZS1RdW90ZWQpIFN0YXRlPC9hPjwvbGk+XG4qIDwvdWw+XG4qXG4qIEBleGFtcGxlXG4qIC8vIG91dHB1dCBjb250ZXh0IHRvIGJlIGFwcGxpZWQgYnkgdGhpcyBmaWx0ZXIuXG4qIDxhIGhyZWY9XCJodHRwOi8vZXhhbXBsZS5jb20vP3E9e3t7dXJpQ29tcG9uZW50SW5Eb3VibGVRdW90ZWRBdHRyIHVyaV9jb21wb25lbnR9fX1cIj5saW5rPC9hPlxuKiBcbiovXG5leHBvcnRzLnVyaUNvbXBvbmVudEluRG91YmxlUXVvdGVkQXR0ciA9IGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuIHByaXZGaWx0ZXJzLnlhdmQocHJpdkZpbHRlcnMueXVjKHMpKTtcbn07XG5cblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpQ29tcG9uZW50SW5VblF1b3RlZEF0dHJcbipcbiogQHBhcmFtIHtzdHJpbmd9IHMgLSBBbiB1bnRydXN0ZWQgdXNlciBpbnB1dCwgc3VwcG9zZWRseSBhIFVSSSBDb21wb25lbnRcbiogQHJldHVybnMge3N0cmluZ30gVGhlIHN0cmluZyBzIGVuY29kZWQgZmlyc3QgYnkgd2luZG93LmVuY29kZVVSSUNvbXBvbmVudCgpLCB0aGVuIGluVW5RdW90ZWRBdHRyKClcbipcbiogQGRlc2NyaXB0aW9uXG4qIFRoaXMgZmlsdGVyIGlzIHRvIGJlIHBsYWNlZCBpbiBIVE1MIEF0dHJpYnV0ZSBWYWx1ZSAodW5xdW90ZWQpIHN0YXRlIGZvciBhIFVSSSBDb21wb25lbnQuPGJyLz5cbiogVGhlIGNvcnJlY3Qgb3JkZXIgb2YgZW5jb2RlcnMgaXMgdGh1czogZmlyc3QgdGhlIGJ1aWx0LWluIGVuY29kZVVSSUNvbXBvbmVudCgpLCB0aGVuIGluVW5RdW90ZWRBdHRyKClcbipcbipcbiogPHVsPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL2VuY29kZVVSSUNvbXBvbmVudFwiPmVuY29kZVVSSUNvbXBvbmVudCB8IE1ETjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODZcIj5SRkMgMzk4NjwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2F0dHJpYnV0ZS12YWx1ZS0odW5xdW90ZWQpLXN0YXRlXCI+SFRNTDUgQXR0cmlidXRlIFZhbHVlIChVbnF1b3RlZCkgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPGEgaHJlZj1odHRwOi8vZXhhbXBsZS5jb20vP3E9e3t7dXJpQ29tcG9uZW50SW5VblF1b3RlZEF0dHIgdXJpX2NvbXBvbmVudH19fT5saW5rPC9hPlxuKiBcbiovXG5leHBvcnRzLnVyaUNvbXBvbmVudEluVW5RdW90ZWRBdHRyID0gZnVuY3Rpb24gKHMpIHtcbiAgICByZXR1cm4gcHJpdkZpbHRlcnMueWF2dShwcml2RmlsdGVycy55dWMocykpO1xufTtcblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpQ29tcG9uZW50SW5IVE1MRGF0YVxuKlxuKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0LCBzdXBwb3NlZGx5IGEgVVJJIENvbXBvbmVudFxuKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgc3RyaW5nIHMgZW5jb2RlZCBieSB3aW5kb3cuZW5jb2RlVVJJQ29tcG9uZW50KCkgYW5kIHRoZW4gaW5IVE1MRGF0YSgpXG4qXG4qIEBkZXNjcmlwdGlvblxuKiBUaGlzIGZpbHRlciBpcyB0byBiZSBwbGFjZWQgaW4gSFRNTCBEYXRhIHN0YXRlIGZvciBhIFVSSSBDb21wb25lbnQuXG4qXG4qIDxwPk5vdGljZTogVGhlIGFjdHVhbCBpbXBsZW1lbnRhdGlvbiBza2lwcyBpbkhUTUxEYXRhKCksIHNpbmNlICc8JyBpcyBhbHJlYWR5IGVuY29kZWQgYXMgJyUzQycgYnkgZW5jb2RlVVJJQ29tcG9uZW50KCkuPC9wPlxuKlxuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZW5jb2RlVVJJQ29tcG9uZW50XCI+ZW5jb2RlVVJJQ29tcG9uZW50IHwgTUROPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlwiPlJGQyAzOTg2PC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjZGF0YS1zdGF0ZVwiPkhUTUw1IERhdGEgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPGEgaHJlZj1cImh0dHA6Ly9leGFtcGxlLmNvbS9cIj5odHRwOi8vZXhhbXBsZS5jb20vP3E9e3t7dXJpQ29tcG9uZW50SW5IVE1MRGF0YSB1cmlfY29tcG9uZW50fX19PC9hPlxuKiA8YSBocmVmPVwiaHR0cDovL2V4YW1wbGUuY29tL1wiPmh0dHA6Ly9leGFtcGxlLmNvbS8je3t7dXJpQ29tcG9uZW50SW5IVE1MRGF0YSB1cmlfZnJhZ21lbnR9fX08L2E+XG4qIFxuKi9cbmV4cG9ydHMudXJpQ29tcG9uZW50SW5IVE1MRGF0YSA9IHByaXZGaWx0ZXJzLnl1YztcblxuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlDb21wb25lbnRJbkhUTUxDb21tZW50XG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXQsIHN1cHBvc2VkbHkgYSBVUkkgQ29tcG9uZW50XG4qIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzdHJpbmcgcyBlbmNvZGVkIGJ5IHdpbmRvdy5lbmNvZGVVUklDb21wb25lbnQoKSwgYW5kIGZpbmFsbHkgaW5IVE1MQ29tbWVudCgpXG4qXG4qIEBkZXNjcmlwdGlvblxuKiBUaGlzIGZpbHRlciBpcyB0byBiZSBwbGFjZWQgaW4gSFRNTCBDb21tZW50IHN0YXRlIGZvciBhIFVSSSBDb21wb25lbnQuXG4qXG4qIDx1bD5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9lbmNvZGVVUklDb21wb25lbnRcIj5lbmNvZGVVUklDb21wb25lbnQgfCBNRE48L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2XCI+UkZDIDM5ODY8L2E+PC9saT5cbiogPGxpPjxhIGhyZWY9XCJodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNkYXRhLXN0YXRlXCI+SFRNTDUgRGF0YSBTdGF0ZTwvYT48L2xpPlxuKiA8bGk+PGEgaHJlZj1cImh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2NvbW1lbnQtc3RhdGVcIj5IVE1MNSBDb21tZW50IFN0YXRlPC9hPjwvbGk+XG4qIDwvdWw+XG4qXG4qIEBleGFtcGxlXG4qIC8vIG91dHB1dCBjb250ZXh0IHRvIGJlIGFwcGxpZWQgYnkgdGhpcyBmaWx0ZXIuXG4qIDwhLS0gaHR0cDovL2V4YW1wbGUuY29tLz9xPXt7e3VyaUNvbXBvbmVudEluSFRNTENvbW1lbnQgdXJpX2NvbXBvbmVudH19fSAtLT5cbiogPCEtLSBodHRwOi8vZXhhbXBsZS5jb20vI3t7e3VyaUNvbXBvbmVudEluSFRNTENvbW1lbnQgdXJpX2ZyYWdtZW50fX19IC0tPlxuKi9cbmV4cG9ydHMudXJpQ29tcG9uZW50SW5IVE1MQ29tbWVudCA9IGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuIHByaXZGaWx0ZXJzLnljKHByaXZGaWx0ZXJzLnl1YyhzKSk7XG59O1xuXG5cbi8vIHVyaUZyYWdtZW50SW5TaW5nbGVRdW90ZWRBdHRyXG4vLyBhZGRlZCB5dWJsIG9uIHRvcCBvZiB1cmlDb21wb25lbnRJbkF0dHIgXG4vLyBSYXRpb25hbGU6IGdpdmVuIHBhdHRlcm4gbGlrZSB0aGlzOiA8YSBocmVmPSd7e3t1cmlGcmFnbWVudEluU2luZ2xlUXVvdGVkQXR0ciBzfX19Jz5cbi8vICAgICAgICAgICAgZGV2ZWxvcGVyIG1heSBleHBlY3QgcyBpcyBhbHdheXMgcHJlZml4ZWQgd2l0aCAjLCBidXQgYW4gYXR0YWNrZXIgY2FuIGFidXNlIGl0IHdpdGggJ2phdmFzY3JpcHQ6YWxlcnQoMSknXG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI3VyaUZyYWdtZW50SW5TaW5nbGVRdW90ZWRBdHRyXG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXQsIHN1cHBvc2VkbHkgYSBVUkkgRnJhZ21lbnRcbiogQHJldHVybnMge3N0cmluZ30gVGhlIHN0cmluZyBzIGVuY29kZWQgZmlyc3QgYnkgd2luZG93LmVuY29kZVVSSUNvbXBvbmVudCgpLCB0aGVuIGluU2luZ2xlUXVvdGVkQXR0cigpLCBhbmQgZmluYWxseSBwcmVmaXggdGhlIHJlc3VsdGVkIHN0cmluZyB3aXRoICd4LScgaWYgaXQgYmVnaW5zIHdpdGggJ2phdmFzY3JpcHQ6JyBvciAndmJzY3JpcHQ6JyB0aGF0IGNvdWxkIHBvc3NpYmx5IGxlYWQgdG8gc2NyaXB0IGV4ZWN1dGlvblxuKlxuKiBAZGVzY3JpcHRpb25cbiogVGhpcyBmaWx0ZXIgaXMgdG8gYmUgcGxhY2VkIGluIEhUTUwgQXR0cmlidXRlIFZhbHVlIChzaW5nbGUtcXVvdGVkKSBzdGF0ZSBmb3IgYSBVUkkgRnJhZ21lbnQuPGJyLz5cbiogVGhlIGNvcnJlY3Qgb3JkZXIgb2YgZW5jb2RlcnMgaXMgdGh1czogZmlyc3Qgd2luZG93LmVuY29kZVVSSUNvbXBvbmVudCgpLCB0aGVuIGluU2luZ2xlUXVvdGVkQXR0cigpLCBhbmQgZmluYWxseSBwcmVmaXggdGhlIHJlc3VsdGVkIHN0cmluZyB3aXRoICd4LScgaWYgaXQgYmVnaW5zIHdpdGggJ2phdmFzY3JpcHQ6JyBvciAndmJzY3JpcHQ6JyB0aGF0IGNvdWxkIHBvc3NpYmx5IGxlYWQgdG8gc2NyaXB0IGV4ZWN1dGlvblxuKlxuKlxuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZW5jb2RlVVJJQ29tcG9uZW50XCI+ZW5jb2RlVVJJQ29tcG9uZW50IHwgTUROPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlwiPlJGQyAzOTg2PC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYXR0cmlidXRlLXZhbHVlLShzaW5nbGUtcXVvdGVkKS1zdGF0ZVwiPkhUTUw1IEF0dHJpYnV0ZSBWYWx1ZSAoU2luZ2xlLVF1b3RlZCkgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPGEgaHJlZj0naHR0cDovL2V4YW1wbGUuY29tLyN7e3t1cmlGcmFnbWVudEluU2luZ2xlUXVvdGVkQXR0ciB1cmlfZnJhZ21lbnR9fX0nPmxpbms8L2E+XG4qIFxuKi9cbmV4cG9ydHMudXJpRnJhZ21lbnRJblNpbmdsZVF1b3RlZEF0dHIgPSBmdW5jdGlvbiAocykge1xuICAgIHJldHVybiBwcml2RmlsdGVycy55dWJsKHByaXZGaWx0ZXJzLnlhdnMocHJpdkZpbHRlcnMueXVjKHMpKSk7XG59O1xuXG4vLyB1cmlGcmFnbWVudEluRG91YmxlUXVvdGVkQXR0clxuLy8gYWRkZWQgeXVibCBvbiB0b3Agb2YgdXJpQ29tcG9uZW50SW5BdHRyIFxuLy8gUmF0aW9uYWxlOiBnaXZlbiBwYXR0ZXJuIGxpa2UgdGhpczogPGEgaHJlZj1cInt7e3VyaUZyYWdtZW50SW5Eb3VibGVRdW90ZWRBdHRyIHN9fX1cIj5cbi8vICAgICAgICAgICAgZGV2ZWxvcGVyIG1heSBleHBlY3QgcyBpcyBhbHdheXMgcHJlZml4ZWQgd2l0aCAjLCBidXQgYW4gYXR0YWNrZXIgY2FuIGFidXNlIGl0IHdpdGggJ2phdmFzY3JpcHQ6YWxlcnQoMSknXG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI3VyaUZyYWdtZW50SW5Eb3VibGVRdW90ZWRBdHRyXG4qXG4qIEBwYXJhbSB7c3RyaW5nfSBzIC0gQW4gdW50cnVzdGVkIHVzZXIgaW5wdXQsIHN1cHBvc2VkbHkgYSBVUkkgRnJhZ21lbnRcbiogQHJldHVybnMge3N0cmluZ30gVGhlIHN0cmluZyBzIGVuY29kZWQgZmlyc3QgYnkgd2luZG93LmVuY29kZVVSSUNvbXBvbmVudCgpLCB0aGVuIGluRG91YmxlUXVvdGVkQXR0cigpLCBhbmQgZmluYWxseSBwcmVmaXggdGhlIHJlc3VsdGVkIHN0cmluZyB3aXRoICd4LScgaWYgaXQgYmVnaW5zIHdpdGggJ2phdmFzY3JpcHQ6JyBvciAndmJzY3JpcHQ6JyB0aGF0IGNvdWxkIHBvc3NpYmx5IGxlYWQgdG8gc2NyaXB0IGV4ZWN1dGlvblxuKlxuKiBAZGVzY3JpcHRpb25cbiogVGhpcyBmaWx0ZXIgaXMgdG8gYmUgcGxhY2VkIGluIEhUTUwgQXR0cmlidXRlIFZhbHVlIChkb3VibGUtcXVvdGVkKSBzdGF0ZSBmb3IgYSBVUkkgRnJhZ21lbnQuPGJyLz5cbiogVGhlIGNvcnJlY3Qgb3JkZXIgb2YgZW5jb2RlcnMgaXMgdGh1czogZmlyc3Qgd2luZG93LmVuY29kZVVSSUNvbXBvbmVudCgpLCB0aGVuIGluRG91YmxlUXVvdGVkQXR0cigpLCBhbmQgZmluYWxseSBwcmVmaXggdGhlIHJlc3VsdGVkIHN0cmluZyB3aXRoICd4LScgaWYgaXQgYmVnaW5zIHdpdGggJ2phdmFzY3JpcHQ6JyBvciAndmJzY3JpcHQ6JyB0aGF0IGNvdWxkIHBvc3NpYmx5IGxlYWQgdG8gc2NyaXB0IGV4ZWN1dGlvblxuKlxuKlxuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZW5jb2RlVVJJQ29tcG9uZW50XCI+ZW5jb2RlVVJJQ29tcG9uZW50IHwgTUROPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlwiPlJGQyAzOTg2PC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYXR0cmlidXRlLXZhbHVlLShkb3VibGUtcXVvdGVkKS1zdGF0ZVwiPkhUTUw1IEF0dHJpYnV0ZSBWYWx1ZSAoRG91YmxlLVF1b3RlZCkgU3RhdGU8L2E+PC9saT5cbiogPC91bD5cbipcbiogQGV4YW1wbGVcbiogLy8gb3V0cHV0IGNvbnRleHQgdG8gYmUgYXBwbGllZCBieSB0aGlzIGZpbHRlci5cbiogPGEgaHJlZj1cImh0dHA6Ly9leGFtcGxlLmNvbS8je3t7dXJpRnJhZ21lbnRJbkRvdWJsZVF1b3RlZEF0dHIgdXJpX2ZyYWdtZW50fX19XCI+bGluazwvYT5cbiogXG4qL1xuZXhwb3J0cy51cmlGcmFnbWVudEluRG91YmxlUXVvdGVkQXR0ciA9IGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuIHByaXZGaWx0ZXJzLnl1YmwocHJpdkZpbHRlcnMueWF2ZChwcml2RmlsdGVycy55dWMocykpKTtcbn07XG5cbi8vIHVyaUZyYWdtZW50SW5VblF1b3RlZEF0dHJcbi8vIGFkZGVkIHl1Ymwgb24gdG9wIG9mIHVyaUNvbXBvbmVudEluQXR0ciBcbi8vIFJhdGlvbmFsZTogZ2l2ZW4gcGF0dGVybiBsaWtlIHRoaXM6IDxhIGhyZWY9e3t7dXJpRnJhZ21lbnRJblVuUXVvdGVkQXR0ciBzfX19PlxuLy8gICAgICAgICAgICBkZXZlbG9wZXIgbWF5IGV4cGVjdCBzIGlzIGFsd2F5cyBwcmVmaXhlZCB3aXRoICMsIGJ1dCBhbiBhdHRhY2tlciBjYW4gYWJ1c2UgaXQgd2l0aCAnamF2YXNjcmlwdDphbGVydCgxKSdcblxuLyoqXG4qIEBmdW5jdGlvbiBtb2R1bGU6eHNzLWZpbHRlcnMjdXJpRnJhZ21lbnRJblVuUXVvdGVkQXR0clxuKlxuKiBAcGFyYW0ge3N0cmluZ30gcyAtIEFuIHVudHJ1c3RlZCB1c2VyIGlucHV0LCBzdXBwb3NlZGx5IGEgVVJJIEZyYWdtZW50XG4qIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzdHJpbmcgcyBlbmNvZGVkIGZpcnN0IGJ5IHdpbmRvdy5lbmNvZGVVUklDb21wb25lbnQoKSwgdGhlbiBpblVuUXVvdGVkQXR0cigpLCBhbmQgZmluYWxseSBwcmVmaXggdGhlIHJlc3VsdGVkIHN0cmluZyB3aXRoICd4LScgaWYgaXQgYmVnaW5zIHdpdGggJ2phdmFzY3JpcHQ6JyBvciAndmJzY3JpcHQ6JyB0aGF0IGNvdWxkIHBvc3NpYmx5IGxlYWQgdG8gc2NyaXB0IGV4ZWN1dGlvblxuKlxuKiBAZGVzY3JpcHRpb25cbiogVGhpcyBmaWx0ZXIgaXMgdG8gYmUgcGxhY2VkIGluIEhUTUwgQXR0cmlidXRlIFZhbHVlICh1bnF1b3RlZCkgc3RhdGUgZm9yIGEgVVJJIEZyYWdtZW50Ljxici8+XG4qIFRoZSBjb3JyZWN0IG9yZGVyIG9mIGVuY29kZXJzIGlzIHRodXM6IGZpcnN0IHRoZSBidWlsdC1pbiBlbmNvZGVVUklDb21wb25lbnQoKSwgdGhlbiBpblVuUXVvdGVkQXR0cigpLCBhbmQgZmluYWxseSBwcmVmaXggdGhlIHJlc3VsdGVkIHN0cmluZyB3aXRoICd4LScgaWYgaXQgYmVnaW5zIHdpdGggJ2phdmFzY3JpcHQ6JyBvciAndmJzY3JpcHQ6JyB0aGF0IGNvdWxkIHBvc3NpYmx5IGxlYWQgdG8gc2NyaXB0IGV4ZWN1dGlvblxuKlxuKiA8dWw+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZW5jb2RlVVJJQ29tcG9uZW50XCI+ZW5jb2RlVVJJQ29tcG9uZW50IHwgTUROPC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NlwiPlJGQyAzOTg2PC9hPjwvbGk+XG4qIDxsaT48YSBocmVmPVwiaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYXR0cmlidXRlLXZhbHVlLSh1bnF1b3RlZCktc3RhdGVcIj5IVE1MNSBBdHRyaWJ1dGUgVmFsdWUgKFVucXVvdGVkKSBTdGF0ZTwvYT48L2xpPlxuKiA8L3VsPlxuKlxuKiBAZXhhbXBsZVxuKiAvLyBvdXRwdXQgY29udGV4dCB0byBiZSBhcHBsaWVkIGJ5IHRoaXMgZmlsdGVyLlxuKiA8YSBocmVmPWh0dHA6Ly9leGFtcGxlLmNvbS8je3t7dXJpRnJhZ21lbnRJblVuUXVvdGVkQXR0ciB1cmlfZnJhZ21lbnR9fX0+bGluazwvYT5cbiogXG4qL1xuZXhwb3J0cy51cmlGcmFnbWVudEluVW5RdW90ZWRBdHRyID0gZnVuY3Rpb24gKHMpIHtcbiAgICByZXR1cm4gcHJpdkZpbHRlcnMueXVibChwcml2RmlsdGVycy55YXZ1KHByaXZGaWx0ZXJzLnl1YyhzKSkpO1xufTtcblxuXG4vKipcbiogQGZ1bmN0aW9uIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlGcmFnbWVudEluSFRNTERhdGFcbiogQGRlc2NyaXB0aW9uIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlDb21wb25lbnRJbkhUTUxEYXRhfVxuKiBcbiogQGFsaWFzIG1vZHVsZTp4c3MtZmlsdGVycyN1cmlDb21wb25lbnRJbkhUTUxEYXRhXG4qL1xuZXhwb3J0cy51cmlGcmFnbWVudEluSFRNTERhdGEgPSBleHBvcnRzLnVyaUNvbXBvbmVudEluSFRNTERhdGE7XG5cbi8qKlxuKiBAZnVuY3Rpb24gbW9kdWxlOnhzcy1maWx0ZXJzI3VyaUZyYWdtZW50SW5IVE1MQ29tbWVudFxuKiBAZGVzY3JpcHRpb24gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgbW9kdWxlOnhzcy1maWx0ZXJzI3VyaUNvbXBvbmVudEluSFRNTENvbW1lbnR9XG4qIFxuKiBAYWxpYXMgbW9kdWxlOnhzcy1maWx0ZXJzI3VyaUNvbXBvbmVudEluSFRNTENvbW1lbnRcbiovXG5leHBvcnRzLnVyaUZyYWdtZW50SW5IVE1MQ29tbWVudCA9IGV4cG9ydHMudXJpQ29tcG9uZW50SW5IVE1MQ29tbWVudDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi94c3MtZmlsdGVycy9zcmMveHNzLWZpbHRlcnMuanNcbi8vIG1vZHVsZSBpZCA9IDU3NlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDOVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDOWtFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7OztBQ3ZaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7OztBQ3IyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7QUM3UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7OztBQ2w2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQ2hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDNW5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7O0FDMUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7OztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7OztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0EiLCJzb3VyY2VSb290IjoiIn0=