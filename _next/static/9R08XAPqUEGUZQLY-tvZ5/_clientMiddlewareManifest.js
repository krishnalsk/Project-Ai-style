self.__MIDDLEWARE_MATCHERS = [
  {
    "regexp": "^\\/Project-Ai-style(?:\\/(_next\\/data\\/[^/]{1,}))?\\/dashboard(?:\\/((?:[^\\/#\\?]+?)(?:\\/(?:[^\\/#\\?]+?))*))?(\\\\.json)?[\\/#\\?]?$",
    "originalSource": "/dashboard/:path*"
  },
  {
    "regexp": "^\\/Project-Ai-style(?:\\/(_next\\/data\\/[^/]{1,}))?\\/profile(?:\\/((?:[^\\/#\\?]+?)(?:\\/(?:[^\\/#\\?]+?))*))?(\\\\.json)?[\\/#\\?]?$",
    "originalSource": "/profile/:path*"
  },
  {
    "regexp": "^\\/Project-Ai-style(?:\\/(_next\\/data\\/[^/]{1,}))?\\/settings(?:\\/((?:[^\\/#\\?]+?)(?:\\/(?:[^\\/#\\?]+?))*))?(\\\\.json)?[\\/#\\?]?$",
    "originalSource": "/settings/:path*"
  },
  {
    "regexp": "^\\/Project-Ai-style(?:\\/(_next\\/data\\/[^/]{1,}))?\\/cart(?:\\/((?:[^\\/#\\?]+?)(?:\\/(?:[^\\/#\\?]+?))*))?(\\\\.json)?[\\/#\\?]?$",
    "originalSource": "/cart/:path*"
  },
  {
    "regexp": "^\\/Project-Ai-style(?:\\/(_next\\/data\\/[^/]{1,}))?\\/checkout(?:\\/((?:[^\\/#\\?]+?)(?:\\/(?:[^\\/#\\?]+?))*))?(\\\\.json)?[\\/#\\?]?$",
    "originalSource": "/checkout/:path*"
  },
  {
    "regexp": "^\\/Project-Ai-style(?:\\/(_next\\/data\\/[^/]{1,}))?\\/orders(?:\\/((?:[^\\/#\\?]+?)(?:\\/(?:[^\\/#\\?]+?))*))?(\\\\.json)?[\\/#\\?]?$",
    "originalSource": "/orders/:path*"
  },
  {
    "regexp": "^\\/Project-Ai-style(?:\\/(_next\\/data\\/[^/]{1,}))?\\/wishlist(?:\\/((?:[^\\/#\\?]+?)(?:\\/(?:[^\\/#\\?]+?))*))?(\\\\.json)?[\\/#\\?]?$",
    "originalSource": "/wishlist/:path*"
  },
  {
    "regexp": "^\\/Project-Ai-style(?:\\/(_next\\/data\\/[^/]{1,}))?\\/notifications(?:\\/((?:[^\\/#\\?]+?)(?:\\/(?:[^\\/#\\?]+?))*))?(\\\\.json)?[\\/#\\?]?$",
    "originalSource": "/notifications/:path*"
  },
  {
    "regexp": "^\\/Project-Ai-style(?:\\/(_next\\/data\\/[^/]{1,}))?\\/rewards(?:\\/((?:[^\\/#\\?]+?)(?:\\/(?:[^\\/#\\?]+?))*))?(\\\\.json)?[\\/#\\?]?$",
    "originalSource": "/rewards/:path*"
  },
  {
    "regexp": "^\\/Project-Ai-style(?:\\/(_next\\/data\\/[^/]{1,}))?\\/skin-diary(?:\\/((?:[^\\/#\\?]+?)(?:\\/(?:[^\\/#\\?]+?))*))?(\\\\.json)?[\\/#\\?]?$",
    "originalSource": "/skin-diary/:path*"
  },
  {
    "regexp": "^\\/Project-Ai-style(?:\\/(_next\\/data\\/[^/]{1,}))?\\/virtual-closet(?:\\/((?:[^\\/#\\?]+?)(?:\\/(?:[^\\/#\\?]+?))*))?(\\\\.json)?[\\/#\\?]?$",
    "originalSource": "/virtual-closet/:path*"
  },
  {
    "regexp": "^\\/Project-Ai-style(?:\\/(_next\\/data\\/[^/]{1,}))?\\/outfit-generator(?:\\/((?:[^\\/#\\?]+?)(?:\\/(?:[^\\/#\\?]+?))*))?(\\\\.json)?[\\/#\\?]?$",
    "originalSource": "/outfit-generator/:path*"
  },
  {
    "regexp": "^\\/Project-Ai-style(?:\\/(_next\\/data\\/[^/]{1,}))?\\/analytics(?:\\/((?:[^\\/#\\?]+?)(?:\\/(?:[^\\/#\\?]+?))*))?(\\\\.json)?[\\/#\\?]?$",
    "originalSource": "/analytics/:path*"
  }
];self.__MIDDLEWARE_MATCHERS_CB && self.__MIDDLEWARE_MATCHERS_CB()