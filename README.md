# diva

diva is a CSS layout engine written in TypeScript.

While not being practical on its own, this project serves as a precursor to a
C++ implementation of a UI framework for game engines, enabling web-based UI
inside native game development.

Since C++ can be quite cumbersome to deal with due to its low-level nature,
writing with TypeScript makes more sense for prototyping such engines,
as it allows faster experiments, validation, and leveraging libraries.

As this will be targeted for use in game engines, the layout engine will
target GPU support (WebGL), while dropping less frequently used features in UI
development, such as float.
