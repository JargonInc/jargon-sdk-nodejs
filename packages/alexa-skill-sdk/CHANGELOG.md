### 1.0.4
#### Suport RenderItem instances as RenderParams values

The use of a RenderItem instance as a parameter value makes it easy to compose multiple
resource together at runtime. This is useful when a parameter value varies across locales,
or when you want the SDK to select across multiple variations for a parameter value, and reduces
the need to chain together multiple calls into the  ResourceManager.

### 1.0.3
* Add ResourceManager.selectedVariation\[s\]()
### 1.0.2
* Add ResourceManager.renderBatch()
### 1.0.1
* Add ResourceManager.renderObject()
### 1.0.0
* Intitial Release