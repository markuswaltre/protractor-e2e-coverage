# Protractor e2e coverage
A plugin for Protractor to measure e2e coverage

### Install
```npm install protractor-e2e-coverage```

### Usage
in your protractor conf file add this:
```javascript
  plugins: [
    {
      path: '../node_modules/protractor-e2e-coverage/index.js',
      outdir: 'test/coverage'
    }
  ],
```

### Options
coverage setup comes predefined with what elements and events to listen to and report.
it's possible to set this up with the following command
```javascript
  plugins: [
	{
      elements: [ // add one for each DOM type
        {
          'type': 'button',
          'events': ['click'], // array of events to listen to
          'elements': []
        }
      ]
  }
 ```

### What it is
Runs after your tests to see which elements on the page has been interacted with.
If coverage in unit is measuring visited logic, then this can be seen as visited elements.

> What the user sees, the user should be able to interact with

It essentially detects [events](https://developer.mozilla.org/en-US/docs/Web/Events) on **buttons**, **links** and **input**

### Roadmap

* Add states when items where interacted with
* Strip classes for hashing items
* Options to specify elements and events
* Report
