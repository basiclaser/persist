
<h1 align="center">persist</h1>

<p align="center">
  <img alt="Repository size" src="https://img.shields.io/github/repo-size/chris-0x73/persist?color=56BEB8">
</p>

<p align="center">
  <a href="#about">About</a> &#xa0; | &#xa0; 
  <a href="#quick-start">start</a> &#xa0; | &#xa0;
  <a href="demo.com">demo</a> &#xa0; | &#xa0;
  <a href="https://github.com/chris-0x73" target="_blank">Author</a>
</p>

<br>

## About ##

`persist` makes quick work of automatically storing input field values and loading them on page load - aka persisting inputs. **For now this is just some speculative reality. Feel free to use it and gimme some feedback though!**

# quick start

add `persist` to any input, select, textarea field to have its value persist between page loads. or just add `persist`to the body tag to persist the whole page, or a form tag to persist the form.  
```
<input persist type="text"></input>
```


# API
These tags are to be applied to the input field you want to persist.
Support for form level and body level persistence is coming soon.

## separation of concerns 
its recommended to provide a `persist-name` value on your fields, especially if you have dynamic document bodies.
This will guard against name attribute changes breaking your persistence.

```
<input persist persist-name="my-input" name="my-input-post-migration" type="text"></input>
```
If you omit this attribute, `persist` will use the `name` attribute as the key for persistence. 
If the `name` attribute's not present, the css selector path will be used.


## persist
persist input values between page loads
```
<input persist type="text"></input>
```

## persist-for
persist input values for a certain amount of time
```
<input persist persist-for="1h" type="text"></input>
```

## persist-until
persist input values until a certain date
```
<input persist persist-until="2021-12-31" type="text"></input>
```

## forget-between-versions 
forget all stored values when the version changes
```
<input persist forget-between-versions type="text"></input>
```

## forget-before-date
forget all stored values before a certain date
```
<input persist forget-before-date="2021-12-31" type="text"></input>
``` 


## supported input types table
| input type | supported | notes |    |
| --- | --- |
| number | ✅ | 
| date | ✅ | 
| color | ✅ |
| url | ✅ |
| email | ✅ |
| phone | ✅ |
| textarea | ✅ |
| select | ✅ |
| select[multiple] | ✅ |
| checkbox | ✅ |
| radio | ✅ |
| file | ✅ |
| text | ✅ |
| range | ✅ |
| datetime-local | ✅ |
| month | ✅ |
| password | ✅ |
| search | ✅ |
| tel | ✅ |
| time | ✅ |
| week | ✅ |
































# files ⚠️
<h1 style="red">files dont work</h1>
note about files: `persist` will store files as base64 strings.
It goes without saying that this is not a good idea for large files.
Consult the mozilla documentation to see how much data browsers can store in local storage.
link: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#storage_limits

# browser support
`persist` uses the `localStorage` api, which is supported by all modern browsers.
link: https://caniuse.com/?search=localStorage





