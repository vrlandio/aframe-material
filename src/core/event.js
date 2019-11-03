module.exports = {
  emit: (el, name, data) => {
    console.error("emit", data);
    console.error(data);
    console.error(name);
    console.error(el);

    el.dispatchEvent(new CustomEvent(name, { detail: data }));
  }
};
