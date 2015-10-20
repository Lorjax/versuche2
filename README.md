# wmsviewer
### Overview
Integrates into Mozilla Firefox as an add-on and displays geospatial data from wms sources.
Could request Web Map Services using their URL. Only URLs matching the OGC WMS Standard will be accepted.
Once connected to a valid WMS, a list of all available layers will be displayed. Additionally, this add-on integrates the "GetFeatureInfo" operation, which lets you retrieve more information about a selected point.

The geospatial data is displayed by <a href="https://github.com/Leaflet/Leaflet">Leaflet</a>, an awesome javascript library written by <a href="http://agafonkin.com/en">Vladimir Agafonkin</a>.


### Installation
1. Download <em>wmsviewer.xpi</em>
2. Open Mozilla Firefox
3. In Firefox, open add-on page (e.g. type "about:addons" in address bar)
4. select <em>install add-on from file...</em> in the dropdown-menu in the upper right corner and select <em>wmsviewer.xpi</em>


### GetFeatureInfo
To make a GetFeatureInfo request, simply right-click on the point you're interested in. If the displayed layers aren't queryable, you'll get appropriate message.
If there is more than one displayed layer queryable, the output of each layer will be appended and displayed.


### TODOs
<ul>
<li>more detailed documentation</li>
<li>some parts of the sourcecode (like variable names) might be in German - English translation needed</li>
</ul>


### planned features
<ul>
<li>translation!</li>
<li>CRS selection</li>
</ul>
