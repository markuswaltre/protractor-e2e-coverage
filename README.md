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
      elements: [ 
      	// add one for each DOM type
        {
          'type': 'button',
          'events': ['click'], // array of events to listen to
          'elements': []
        }
      ]
  }
```

### Current DOM element and event setup
| Elements | Events |       |         |       |      |        |        |
|----------|--------|-------|---------|-------|------|--------|--------|
| Button   | -      | Click | -       | -     | -    | -      | -      |
| Form     | -      | -     | -       | -     | -    | -      | Submit |
| Input    | Input  | Click | Invalid | Focus | Blur | Change | -      |
| Select   | -      | Click | -       | -     | -    | Change | -      |
| Textarea | Input  | Click | -       | Focus | Blur | Change | -      |
| A        | -      | Click | -       | Focus | Blur | -      | -      |

### What it is
Runs after your tests to see which elements on the page has been interacted with.
If coverage in unit is measuring visited logic, then this can be seen as visited elements.

> What the user sees, the user should be able to interact with

It essentially detects [events](https://developer.mozilla.org/en-US/docs/Web/Events) on certain [elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element)