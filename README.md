# Scrapito

> Templated and easy to use scraping tool.

# Usage

## Template Basics

Here is an empty template for example.

`example.yaml:`
```yaml
name: ExampleTemplate # Required
timeout: 3600000 # Default value (ms)
renderJS: false # Default value
maxThreads: 10 # Default value
maxRetries: 2 # Default value
version: 1 # Required, needs to be === 1

params: # TODO:
  - query: !!string
  - page: !!number

# Contains scraping flow
pipelines: []
```

## Pipelines

Each pipeline represent a group of one or more selector. It's used to group results.

### Parameters

**name**:
> Used to describe content.
>
> `name = string`

**url**:
> Used to target one or more webpage.
>
> `url ?= string | string[]`

**selector**:
> Used to target one or more HTML elements.
>
> Uses the [`querySelector`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) syntax
>
> `selector = string`

**attribute**:
> Used to extract informations from HTML elements.
>
> `attribute ?= string`

**transform**:
> Used to transform the result.
> Internally treated as a function having a `res` parameter.
>
> `eval("(res: any) => " + transform)`
>
> `transform ?= string`

### Basics

This example below is listing all urls from the `explore` page on GitHub.
```yaml
pipelines:
  - name: list_repos
    url: https://github.com/explore
    selector: article h1 a.text-bold
    attribute: href
```

Now if we want to get a list of trending developers we can do this:
```yaml
pipelines:
  - name: list_repos
    url: https://github.com/explore
    selector: article h1 a.text-bold
    attribute: href

  - name: list_devs
    url: https://github.com/trending/developers
    selector: article h1.h3 a
    attribute: href
```

The output will be similar to this:
```json
{
  "list_repos": [
    // Many repos URLs
  ],
  "list_devs": [
    // Many devs profile URLs
  ]
}
```

### Multi-URLs

We can easily scrap many pages at once like this:

```yaml
pipelines:
  - name: list_repos_and_devs
    url:
      - https://github.com/trending
      - https://github.com/trending/developers
    selector: article h1.h3 a
    attribute: href
```
Will returns:
```json
{
  "list_repos_and_devs": [
    // Many repos URLs
    // Many devs profile URLs
  ]
}
```

### Use responses as argument

You may want to use some older results to target something in another site/page. Values identifiers are here to solve this issue.

Here is a simple example:
```yaml
pipelines:
  - name: list_repos
    url:
      - https://github.com/trending
    selector: article h1.h3 a
    attribute: href
    next:
      - name: last_commit_time
        url: map@list_repos
        selector: .Box relative-time
        attribute: $text
```

Similar to:
```yaml
pipelines:
  - name: list_repos
    url:
      - https://github.com/trending
    selector: article h1.h3 a
    attribute: href

  - name: last_commit_time
    url: map@list_repos
    selector: .Box relative-time
    attribute: $text
    wait: [pipe::list_repos]
```

The `map@list_repos` url modifier make the pipeline act like if it has the `url` parameter filled with `list_repos` results.

You can also use a number istead of `map` before the `@`.
For example `0@list_repos` will only take the first result of the `list_repos` pipeline and use it as a value.

### Handle dependencies

As you may have seen in the previous example we have to use `wait: [pipe::list_repos]` in order to wait for the `list_repos` pipeline to finish before processing the `last_commit_time` pipeline.

You can have multiple dependencies for one pipeline.

```yaml
pipelines:
  - name: do_first

  - name: do_first_too

  - name: do_second
    wait: [pipe::do_first]

  - name: do_third
    wait: [pipe::do_second]

  - name: do_last
    wait: [pipe::do_third, pipe::do_first_too]
```


**TODO: Talk about**
  - [ ] format output
  - [ ] remove some pipelines of the output
  - [ ] cascade result sharing
  - [ ] map selectors
  - [x] template element can't have `attribute` and `next` property

# Development

## Important notes

- If you permform some changes in rollup config or package.json run the `npm run refresh` command each time you make a change to be able to test the result properly.
  - It may save you an hour or so ...


# Use-cases

- Be able to paste some HTML on a web app, then editor to the right allow you to write the json template.