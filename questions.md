Question: What is the difference between Component and PureComponent? give an example where it might break my app. <br/>
Answer: The difference is that Component doesnt implement `shouldComponentUpdate` and rerenders everytime a parent rerenders, when PureComponent implements `shouldComponentUpdate` with a shallow prop and state comparison.
The answer to second question is the perfect illustration of how PureComponent can break an app cause it also performs `shouldComponentUpdate` under the hood.

Context + ShouldComponentUpdate might be dangerous. Can think of why is that?<br/>
Answer: Lets say we have a following structure:
A component A renders component B as a child and component B renders component C as a child. And lets say component A is a  context provider, and component C is subscribed to consume that context. If component B has `shouldComponentUpdate` implemented, but doesnt subscribed to the context, any updates to the context will not reach to component C because component B prevnts itsself and its children from rerendering.

Describe 3 ways to pass information from a component to its PARENT. <br/>
Answer: 
1. By passing a function from parent to child, which the child can later call with desired argument(s) value
2. By using React context API
3. A parrent can pass its ref to a child component as a prop, and child can call a method of the parent and pass info as an argument, however this is strongly discouraged cause it breaks reacts unidirectional data flow concept

Give 2 ways to prevent components from re-rendering. <br/>
Answer: In class components one can use `shouldComponentUpdate` lyfcicle method to specify cases when component shall rerender (by always returning false for example we will prevent to component from rerendering at all). React.memo HOC, or useMemo and useCallback hooks are designed to help prevent unnecessary rerenders when the coomponent gets the same props
when a parent rerenders. React.PureComponent is special component from React that can also avoid unneceserry rerenders cause it implement a shouldComponentUpdate method under the hood in which it shallowly compares the props and updates only if that comparison shows changes.

What is a fragment and why do we need it? Give an example where it might break my app. <br/>
Answer: React fragments act as invisible containers for grouping elements within React components without introducing extra elements to the web page's structure. They allow you to keep your HTML clean and let you avoid unnecesery wrapping HTML tags in the eventual markup. React forces you to have a single root jsx element for your components, and sometimes haveing a wrapper html element for a particular component may mean breaking some css logic or other issues, and this is one example where React.Fragment comes handy. 
Jsx tag is <React.Fragment> or the shorthand version: <>. 
One example that comes to my mind that can cause issues with fragments is related to the fact that shorthand version of React Fragment doesnt support key prop, so if we use react fragment shorthand version inside an array map function and dont provide
key property, React may have a hard time optimising rerender of the list, and in some cases this could lead to compleat mount and unmount of the components renderred from array map, which on its turn can and will cause its local state loss.
Example and how to reproduce is in my js sandbox: https://codesandbox.io/s/angry-blackburn-cqptz5?file=/src/index.js

Give 3 examples of the HOC pattern. <br/>
Answer: Honestly this question made me scrath my had little bit cause I'm not sure what exactly mean an `example of HOC pattern`, however my guess is it meant to be a `real world example where HOC pattern usage`. 
HOCs are very usefull when we are dealing with components that must react to some global application state change, such as light or dark theme, selected language, auth status. Also they come handy when we need to separate data request managment part from the component.
1. withTheme HOC
```
import React, { Component } from 'react';

const withTheme = (MyComponent) => {
    const [theme] = useContext(ThemeContext)
  const NewComponent (props) => {
    render() {
      return <WrappedComponent theme={theme} {...this.props} />;
    }
  }; 
  return NewComponent;
};
```
2. withAuth HOC
```
import { Redirect } from 'react-router-dom';

const withAuth = (MyComponent) => {
  const NewComponent (props) => {
    if (userIsAuthenticated) { return <MyComponent {...this.props} /> };
    return <Redirect to="/login" />;
  }; 
  return NewComponent;
};
```
3. Couple of well known HOCs like React.memo, withApollo from React.Apollo or connect from Redux

What's the difference in handling exceptions in promises, callbacks and async...await. <br/>
Answer: <br/>
In Promises we use the .catch() method to handle the rejection.
```
const myFunc = () => {
  return new Promise((resolve, reject) => {
    // async operation here with resolve and reject called in respective situations
  });
};

myFunc()
  .then((data) => {
    console.log(data); // data retirved.
  })
  .catch((error) => {
    console.error(error.message); // Error case.
  });
```
In strategy with Callbacks we pass specific callback to handle error case.
```
const myFunc = (onSuccess, onError) => {
    // async operation here with onSuccess and onError called in respective situations
};

myFunc(
  (data) => {
    console.log(data); // Data fetched successfully.
  },
  (error) => {
    console.error(error.message); // Error fetching data.
  }
);
```
In Async function we use try and catch to handle exceptions.
```
const myFunc = () => {
  return new Promise((resolve, reject) => {
    // async operation here with resolve and reject called in respective situations
  });
};

const getServerResponse = async () => {
  try {
    const data = await myFunc();
    console.log(data); // Data fetched successfully.
  } catch (error) {
    console.error(error.message); // Error fetching data.
  }
};
```
How many arguments does setState take and why is it async. <br/>
Answer: Reacts setState function takes two arguments, first one is is the chunk of new state to be merged with existing state, and secon optional parameter is a callback function to fire after state updated.
In React, setState is made asynchronous to improve performance by avoid unnecessary re-renders of components. When you use setState, React groups state updates together and only performs a single re-render at the end of the current event loop.
Since setState is asynchronous, you cant immediately access the updated state after calling it. If you need to do something based on the updated state, you can use the optional callback. 

List the steps needed to migrate a Class to Function Component.
Answer:  
1. Get rid of this (props, instead of this.props)
2. Rewrite state variables with useState 
3. Get rid of lifecicle methods, use useEffect(s) instead
4. Replace class methods with regular functions
5. No more render method, return instead

List a few ways styles can be used with components. 
Answer: 
1. Inlline styles in JSX
```
const Component = ({ htmlContent }) => {
  return <div style={{ background: "red" }} />;
};
```
2. Importing a css file in the component module
```
import './css.css';
```
3. 3rd party libs like emotion or styled-components<-(my fav)


How to render an HTML string coming from the server. <br/>
Answer: We can do it by using dangerouslySetInnerHTML attribute on the JSX element, however this is strongly discouraged cause of the potential security issues especially if you dont trust the source.
```
const Component = ({ htmlContent }) => {
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};
```
