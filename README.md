# Protractor e2e coverage
A plugin for Protractor to measure e2e coverage

### Install
```npm install protractor-e2e-coverage```

### Usage
in your protractor conf file add this:
```
  plugins: [
    {
      path: '../node_modules/protractor-e2e-coverage/index.js',
      outdir: 'test/coverage'
    }
  ],
```

### What it is
Runs after your tests to see which elements on the page has been interacted with.
If coverage in unit is measuring visited logic, then this can be seen as visited elements.

> What the user sees, the user should be able to interact with

It essentially detects [events](https://developer.mozilla.org/en-US/docs/Web/Events) on **buttons**, **links** and **input**

### Roadmap

* Add states when items where interacted with
