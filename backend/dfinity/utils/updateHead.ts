// Updated required for "mobile web app" behavior
// https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html

const APP_TITLE = "CanCan";

const updates = [
  {
    el: "meta",
    attrs: { name: "apple-mobile-web-app-title", content: APP_TITLE },
  },
  {
    el: "meta",
    attrs: { name: "apple-mobile-web-app-capable", content: "yes" },
  },
  {
    el: "meta",
    attrs: {
      name: "apple-mobile-web-app-status-bar-style",
      content: "black",
    },
  },
];

export const updateHead = (document: Document) => {
  document.title = APP_TITLE;

  updates.forEach(({ el, attrs }) => {
    const update = document.createElement(el);
    Object.entries(attrs).forEach(([attr, value]) => {
      // @ts-ignore
      update[attr] = value;
    });
    document.head.appendChild(update);
  });
};
