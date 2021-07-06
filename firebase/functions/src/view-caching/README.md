# Usage

In your functions index.js:

```
import {
  cacheViews,
  getRebuildAllViewCachesFunction,
} from ('view-caching')

// you need to define these
const views = [...]

// add necessary functions based off definitions
cacheViews(exports, views)

// expose a function to rebuild
exports.rebuildAllViewCaches = getRebuildAllViewCachesFunction(views)
```

# API

## cacheViews(exports: NodejsModuleExports, views: Views)

A function that sets up caching for the provided views. Views is a map where the key is the view name and the value is the definition for that view (see below).

### Views

```
{
  [viewName: string]: ViewDefinition
}
```

### ViewDefinition

```
{
  collectionName: string,
  debug?: boolean = false,
  where?: WhereConditions[],
  order?: [fieldName: string, direction: 'asc' | 'desc']
}
```

### WhereConditions

```
[fieldName, operator, value]
```

## View Definition

A view definition is an object that describes the view.
