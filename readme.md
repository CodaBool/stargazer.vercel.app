# community VTT RPG maps
> A spot for any RPG community to create accurate maps and keep them up to date.

### Why?
Most VTT maps are just static images. These have a few issues

- difficult to use programmatically
- rendering a new image is usually done locally and is inefficient
- the styling from image maps won't match everyone's preference

By creating a data driven map, all downstream uses of it become improved.
This is because the project will release a free TopoJSON.
This is a common standard for map making in real world applications.
However, it can also be useful for fictional maps.

With this data, it becomes easier to make a accurate stylized UI for any map.
Just pick up [d3-geo](https://observablehq.com/collection/@d3/d3-geo) or one of the many tools which can interpret the TopoJSON.
Then write your UI using the the accurate SVGs this will produce.

# Which Maps
I will be focusing on `Lancer` and `Alien` but any community can make a PR to be added to the collection.

Then reap the benefits of the free published TopoJSON data.