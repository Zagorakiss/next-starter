'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _style = require('styled-jsx/style.js');

var _style2 = _interopRequireDefault(_style);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _MyLayout = require('../components/MyLayout.js');

var _MyLayout2 = _interopRequireDefault(_MyLayout);

var _reactMarkdown = require('react-markdown');

var _reactMarkdown2 = _interopRequireDefault(_reactMarkdown);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _jsxFileName = '/Users/Zagora/Documents/next-starter/pages/post.js?entry';

exports.default = function (props) {
  return _react2.default.createElement(_MyLayout2.default, {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 5
    }
  }, _react2.default.createElement('h1', {
    'data-jsx': 1238997497,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 6
    }
  }, props.url.query.title), _react2.default.createElement('div', { className: 'markdown', 'data-jsx': 1238997497,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 7
    }
  }, _react2.default.createElement(_reactMarkdown2.default, { source: '\nThis is our blog post.\nYes. We can have a [link](/link).\nAnd we can have a title as well.\n\n### This is a title\n\nAnd here\'s the content.\n     ', __source: {
      fileName: _jsxFileName,
      lineNumber: 8
    }
  })), _react2.default.createElement(_style2.default, {
    styleId: 1238997497,
    css: '.markdown{font-family:\'Arial\'}.markdown a{-webkit-text-decoration:none;text-decoration:none;color:blue}.markdown a:hover{opacity:0.6}.markdown h3{margin:0;padding:0;-webkit-text-transform:uppercase;text-transform:uppercase}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhZ2VzL3Bvc3QuanM/ZW50cnkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBaUJzQixBQUc0QixBQUVDLEFBRVQsQUFFSCxVQUFrQixHQUZULFFBSlEsQUFNa0MsK0JBSnBCLFlBQU0saUJBSW9CIiwiZmlsZSI6InBhZ2VzL3Bvc3QuanM/ZW50cnkiLCJzb3VyY2VSb290IjoiL1VzZXJzL1phZ29yYS9Eb2N1bWVudHMvbmV4dC1zdGFydGVyIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExheW91dCBmcm9tICcuLi9jb21wb25lbnRzL015TGF5b3V0LmpzJ1xuaW1wb3J0IE1hcmtkb3duIGZyb20gJ3JlYWN0LW1hcmtkb3duJ1xuXG5leHBvcnQgZGVmYXVsdCAocHJvcHMpID0+IChcbiAgPExheW91dD5cbiAgIDxoMT57cHJvcHMudXJsLnF1ZXJ5LnRpdGxlfTwvaDE+XG4gICA8ZGl2IGNsYXNzTmFtZT1cIm1hcmtkb3duXCI+XG4gICAgIDxNYXJrZG93biBzb3VyY2U9e2BcblRoaXMgaXMgb3VyIGJsb2cgcG9zdC5cblllcy4gV2UgY2FuIGhhdmUgYSBbbGlua10oL2xpbmspLlxuQW5kIHdlIGNhbiBoYXZlIGEgdGl0bGUgYXMgd2VsbC5cblxuIyMjIFRoaXMgaXMgYSB0aXRsZVxuXG5BbmQgaGVyZSdzIHRoZSBjb250ZW50LlxuICAgICBgfS8+XG4gICA8L2Rpdj5cbiAgIDxzdHlsZSBqc3ggZ2xvYmFsPntgXG4gICAgIC5tYXJrZG93biB7XG4gICAgICAgZm9udC1mYW1pbHk6ICdBcmlhbCc7XG4gICAgIH1cblxuICAgICAubWFya2Rvd24gYSB7XG4gICAgICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgICAgIGNvbG9yOiBibHVlO1xuICAgICB9XG5cbiAgICAgLm1hcmtkb3duIGE6aG92ZXIge1xuICAgICAgIG9wYWNpdHk6IDAuNjtcbiAgICAgfVxuXG4gICAgIC5tYXJrZG93biBoMyB7XG4gICAgICAgbWFyZ2luOiAwO1xuICAgICAgIHBhZGRpbmc6IDA7XG4gICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgICAgfVxuICBgfTwvc3R5bGU+XG4gIDwvTGF5b3V0PlxuKVxuIl19 */\n/*@ sourceURL=pages/post.js?entry */'
  }));
};