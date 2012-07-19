//START AjaxControlToolkit.Common.Common.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />


// Add common toolkit scripts here.  To consume the scripts on a control add
// 
//      [RequiredScript(typeof(CommonToolkitScripts))] 
//      public class SomeExtender : ...
// 
// to the controls extender class declaration.


Type.registerNamespace('AjaxControlToolkit');


AjaxControlToolkit.BoxSide = function() {
    /// <summary>
    /// The BoxSide enumeration describes the sides of a DOM element
    /// </summary>
    /// <field name="Top" type="Number" integer="true" static="true" />
    /// <field name="Right" type="Number" integer="true" static="true" />
    /// <field name="Bottom" type="Number" integer="true" static="true" />
    /// <field name="Left" type="Number" integer="true" static="true" />
}
AjaxControlToolkit.BoxSide.prototype = {
    Top : 0,
    Right : 1,
    Bottom : 2,
    Left : 3
}
AjaxControlToolkit.BoxSide.registerEnum("AjaxControlToolkit.BoxSide", false);


AjaxControlToolkit._CommonToolkitScripts = function() {
    /// <summary>
    /// The _CommonToolkitScripts class contains functionality utilized across a number
    /// of controls (but not universally)
    /// </summary>
    /// <remarks>
    /// You should not create new instances of _CommonToolkitScripts.  Instead you should use the shared instance CommonToolkitScripts (or AjaxControlToolkit.CommonToolkitScripts).
    /// </remarks>
}
AjaxControlToolkit._CommonToolkitScripts.prototype = {
    // The order of these lookup tables is directly linked to the BoxSide enum defined above
    _borderStyleNames : ["borderTopStyle","borderRightStyle","borderBottomStyle","borderLeftStyle"],
    _borderWidthNames : ["borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth"],
    _paddingWidthNames : ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
    _marginWidthNames : ["marginTop", "marginRight", "marginBottom", "marginLeft"],

    getCurrentStyle : function(element, attribute, defaultValue) {
        /// <summary>
        /// CommonToolkitScripts.getCurrentStyle is used to compute the value of a style attribute on an
        /// element that is currently being displayed.  This is especially useful for scenarios where
        /// several CSS classes and style attributes are merged, or when you need information about the
        /// size of an element (such as its padding or margins) that is not exposed in any other fashion.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// Live DOM element to check style of
        /// </param>
        /// <param name="attribute" type="String">
        /// The style attribute's name is expected to be in a camel-cased form that you would use when
        /// accessing a JavaScript property instead of the hyphenated form you would use in a CSS
        /// stylesheet (i.e. it should be "backgroundColor" and not "background-color").
        /// </param>
        /// <param name="defaultValue" type="Object" mayBeNull="true" optional="true">
        /// In the event of a problem (i.e. a null element or an attribute that cannot be found) we
        /// return this object (or null if none if not specified).
        /// </param>
        /// <returns type="Object">
        /// Current style of the element's attribute
        /// </returns>

        var currentValue = null;
        if (element) {
            if (element.currentStyle) {
                currentValue = element.currentStyle[attribute];
            } else if (document.defaultView && document.defaultView.getComputedStyle) {
                var style = document.defaultView.getComputedStyle(element, null);
                if (style) {
                    currentValue = style[attribute];
                }
            }
            
            if (!currentValue && element.style.getPropertyValue) {
                currentValue = element.style.getPropertyValue(attribute);
            }
            else if (!currentValue && element.style.getAttribute) {
                currentValue = element.style.getAttribute(attribute);
            }       
        }
        
        if ((!currentValue || currentValue == "" || typeof(currentValue) === 'undefined')) {
            if (typeof(defaultValue) != 'undefined') {
                currentValue = defaultValue;
            }
            else {
                currentValue = null;
            }
        }   
        return currentValue;  
    },

    getInheritedBackgroundColor : function(element) {
        /// <summary>
        /// CommonToolkitScripts.getInheritedBackgroundColor provides the ability to get the displayed
        /// background-color of an element.  In most cases calling CommonToolkitScripts.getCurrentStyle
        /// won't do the job because it will return "transparent" unless the element has been given a
        /// specific background color.  This function will walk up the element's parents until it finds
        /// a non-transparent color.  If we get all the way to the top of the document or have any other
        /// problem finding a color, we will return the default value '#FFFFFF'.  This function is
        /// especially important when we're using opacity in IE (because ClearType will make text look
        /// horrendous if you fade it with a transparent background color).
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// Live DOM element to get the background color of
        /// </param>
        /// <returns type="String">
        /// Background color of the element
        /// </returns>
        
        if (!element) return '#FFFFFF';
        var background = this.getCurrentStyle(element, 'backgroundColor');
        try {
            while (!background || background == '' || background == 'transparent' || background == 'rgba(0, 0, 0, 0)') {
                element = element.parentNode;
                if (!element) {
                    background = '#FFFFFF';
                } else {
                    background = this.getCurrentStyle(element, 'backgroundColor');
                }
            }
        } catch(ex) {
            background = '#FFFFFF';
        }
        return background;
    },

    getLocation : function(element) {
    /// <summary>Gets the coordinates of a DOM element.</summary>
    /// <param name="element" domElement="true"/>
    /// <returns type="Sys.UI.Point">
    ///   A Point object with two fields, x and y, which contain the pixel coordinates of the element.
    /// </returns>

    // workaround for an issue in getLocation where it will compute the location of the document element.
    // this will return an offset if scrolled.
    //
    if (element === document.documentElement) {
        return new Sys.UI.Point(0,0);
    }

    // Workaround for IE6 bug in getLocation (also required patching getBounds - remove that fix when this is removed)
    if (Sys.Browser.agent == Sys.Browser.InternetExplorer && Sys.Browser.version < 7) {
        if (element.window === element || element.nodeType === 9 || !element.getClientRects || !element.getBoundingClientRect) return new Sys.UI.Point(0,0);

        // Get the first bounding rectangle in screen coordinates
        var screenRects = element.getClientRects();
        if (!screenRects || !screenRects.length) {
            return new Sys.UI.Point(0,0);
        }
        var first = screenRects[0];

        // Delta between client coords and screen coords
        var dLeft = 0;
        var dTop = 0;

        var inFrame = false;
        try {
            inFrame = element.ownerDocument.parentWindow.frameElement;
        } catch(ex) {
            // If accessing the frameElement fails, a frame is probably in a different
            // domain than its parent - and we still want to do the calculation below
            inFrame = true;
        }

        // If we're in a frame, get client coordinates too so we can compute the delta
        if (inFrame) {
            // Get the bounding rectangle in client coords
            var clientRect = element.getBoundingClientRect();
            if (!clientRect) {
                return new Sys.UI.Point(0,0);
            }

            // Find the minima in screen coords
            var minLeft = first.left;
            var minTop = first.top;
            for (var i = 1; i < screenRects.length; i++) {
                var r = screenRects[i];
                if (r.left < minLeft) {
                    minLeft = r.left;
                }
                if (r.top < minTop) {
                    minTop = r.top;
                }
            }

            // Compute the delta between screen and client coords
            dLeft = minLeft - clientRect.left;
            dTop = minTop - clientRect.top;
        }

        // Subtract 2px, the border of the viewport (It can be changed in IE6 by applying a border style to the HTML element,
        // but this is not supported by ASP.NET AJAX, and it cannot be changed in IE7.), and also subtract the delta between
        // screen coords and client coords
        var ownerDocument = element.document.documentElement;
        return new Sys.UI.Point(first.left - 2 - dLeft + ownerDocument.scrollLeft, first.top - 2 - dTop + ownerDocument.scrollTop);
    }

    return Sys.UI.DomElement.getLocation(element);
},

    setLocation : function(element, point) {
        /// <summary>
        /// Sets the current location for an element.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <param name="point" type="Object">
        /// Point object (of the form {x,y})
        /// </param>
        /// <remarks>
        /// This method does not attempt to set the positioning mode of an element.
        /// The position is relative from the elements nearest position:relative or
        /// position:absolute element.
        /// </remarks>
        Sys.UI.DomElement.setLocation(element, point.x, point.y);
    },
    
    getContentSize : function(element) {
        /// <summary>
        /// Gets the "content-box" size of an element.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <returns type="Object">
        /// Size of the element (in the form {width,height})
        /// </returns>
        /// <remarks>
        /// The "content-box" is the size of the content area *inside* of the borders and
        /// padding of an element. The "content-box" size does not include the margins around
        /// the element.
        /// </remarks>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        var size = this.getSize(element);
        var borderBox = this.getBorderBox(element);
        var paddingBox = this.getPaddingBox(element);
        return {
            width :  size.width - borderBox.horizontal - paddingBox.horizontal,
            height : size.height - borderBox.vertical - paddingBox.vertical
        }
    },

    getSize : function(element) {
        /// <summary>
        /// Gets the "border-box" size of an element.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <returns type="Object">
        /// Size of the element (in the form {width,height})
        /// </returns>
        /// <remarks>
        /// The "border-box" is the size of the content area *outside* of the borders and
        /// padding of an element.  The "border-box" size does not include the margins around
        /// the element.
        /// </remarks>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        return {
            width:  element.offsetWidth,
            height: element.offsetHeight
        };
    },
    
    setContentSize : function(element, size) {
        /// <summary>
        /// Sets the "content-box" size of an element.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <param name="size" type="Object">
        /// Size of the element (in the form {width,height})
        /// </param>
        /// <remarks>
        /// The "content-box" is the size of the content area *inside* of the borders and
        /// padding of an element. The "content-box" size does not include the margins around
        /// the element.
        /// </remarks>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        if (!size) {
            throw Error.argumentNull('size');
        }
        // FF respects -moz-box-sizing css extension, so adjust the box size for the border-box
        if(this.getCurrentStyle(element, 'MozBoxSizing') == 'border-box' || this.getCurrentStyle(element, 'BoxSizing') == 'border-box') {
            var borderBox = this.getBorderBox(element);
            var paddingBox = this.getPaddingBox(element);
            size = {
                width: size.width + borderBox.horizontal + paddingBox.horizontal,
                height: size.height + borderBox.vertical + paddingBox.vertical
            };
        }
        element.style.width = size.width.toString() + 'px';
        element.style.height = size.height.toString() + 'px';
    },
    
    setSize : function(element, size) {
        /// <summary>
        /// Sets the "border-box" size of an element.
        /// </summary>
        /// <remarks>
        /// The "border-box" is the size of the content area *outside* of the borders and 
        /// padding of an element.  The "border-box" size does not include the margins around
        /// the element.
        /// </remarks>
        /// <param name="element" type="Sys.UI.DomElement">DOM element</param>
        /// <param name="size" type="Object">Size of the element (in the form {width,height})</param>
        /// <returns />
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        if (!size) {
            throw Error.argumentNull('size');
        }
        var borderBox = this.getBorderBox(element);
        var paddingBox = this.getPaddingBox(element);
        var contentSize = {
            width:  size.width - borderBox.horizontal - paddingBox.horizontal,
            height: size.height - borderBox.vertical - paddingBox.vertical
        };
        this.setContentSize(element, contentSize);
    },
    
    getBounds : function(element) {
        /// <summary>Gets the coordinates, width and height of an element.</summary>
        /// <param name="element" domElement="true"/>
        /// <returns type="Sys.UI.Bounds">
        ///   A Bounds object with four fields, x, y, width and height, which contain the pixel coordinates,
        ///   width and height of the element.
        /// </returns>
        /// <remarks>
        ///   Use the CommonToolkitScripts version of getLocation to handle the workaround for IE6.  We can
        ///   remove the below implementation and just call Sys.UI.DomElement.getBounds when the other bug
        ///   is fixed.
        /// </remarks>
        
        var offset = $common.getLocation(element);
        return new Sys.UI.Bounds(offset.x, offset.y, element.offsetWidth || 0, element.offsetHeight || 0);
    }, 
    
    setBounds : function(element, bounds) {
        /// <summary>
        /// Sets the "border-box" bounds of an element
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <param name="bounds" type="Object">
        /// Bounds of the element (of the form {x,y,width,height})
        /// </param>
        /// <remarks>
        /// The "border-box" is the size of the content area *outside* of the borders and
        /// padding of an element.  The "border-box" size does not include the margins around
        /// the element.
        /// </remarks>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        if (!bounds) {
            throw Error.argumentNull('bounds');
        }
        this.setSize(element, bounds);
        $common.setLocation(element, bounds);
    },
    
    getClientBounds : function() {
        /// <summary>
        /// Gets the width and height of the browser client window (excluding scrollbars)
        /// </summary>
        /// <returns type="Sys.UI.Bounds">
        /// Browser's client width and height
        /// </returns>

        var clientWidth;
        var clientHeight;
        switch(Sys.Browser.agent) {
            case Sys.Browser.InternetExplorer:
                clientWidth = document.documentElement.clientWidth;
                clientHeight = document.documentElement.clientHeight;
                break;
            case Sys.Browser.Safari:
                clientWidth = window.innerWidth;
                clientHeight = window.innerHeight;
                break;
            case Sys.Browser.Opera:
                clientWidth = Math.min(window.innerWidth, document.body.clientWidth);
                clientHeight = Math.min(window.innerHeight, document.body.clientHeight);
                break;
            default:  // Sys.Browser.Firefox, etc.
                clientWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
                clientHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
                break;
        }
        return new Sys.UI.Bounds(0, 0, clientWidth, clientHeight);
    },
   
    getMarginBox : function(element) {
        /// <summary>
        /// Gets the entire margin box sizes.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <returns type="Object">
        /// Element's margin box sizes (of the form {top,left,bottom,right,horizontal,vertical})
        /// </returns>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        var box = {
            top: this.getMargin(element, AjaxControlToolkit.BoxSide.Top),
            right: this.getMargin(element, AjaxControlToolkit.BoxSide.Right),
            bottom: this.getMargin(element, AjaxControlToolkit.BoxSide.Bottom),
            left: this.getMargin(element, AjaxControlToolkit.BoxSide.Left)
        };
        box.horizontal = box.left + box.right;
        box.vertical = box.top + box.bottom;
        return box;
    },
    
    getBorderBox : function(element) {
        /// <summary>
        /// Gets the entire border box sizes.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <returns type="Object">
        /// Element's border box sizes (of the form {top,left,bottom,right,horizontal,vertical})
        /// </returns>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        var box = {
            top: this.getBorderWidth(element, AjaxControlToolkit.BoxSide.Top),
            right: this.getBorderWidth(element, AjaxControlToolkit.BoxSide.Right),
            bottom: this.getBorderWidth(element, AjaxControlToolkit.BoxSide.Bottom),
            left: this.getBorderWidth(element, AjaxControlToolkit.BoxSide.Left)
        };
        box.horizontal = box.left + box.right;
        box.vertical = box.top + box.bottom;
        return box;
    },
    
    getPaddingBox : function(element) {
        /// <summary>
        /// Gets the entire padding box sizes.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <returns type="Object">
        /// Element's padding box sizes (of the form {top,left,bottom,right,horizontal,vertical})
        /// </returns>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        var box = {
            top: this.getPadding(element, AjaxControlToolkit.BoxSide.Top),
            right: this.getPadding(element, AjaxControlToolkit.BoxSide.Right),
            bottom: this.getPadding(element, AjaxControlToolkit.BoxSide.Bottom),
            left: this.getPadding(element, AjaxControlToolkit.BoxSide.Left)
        };
        box.horizontal = box.left + box.right;
        box.vertical = box.top + box.bottom;
        return box;
    },
    
    isBorderVisible : function(element, boxSide) {
        /// <summary>
        /// Gets whether the current border style for an element on a specific boxSide is not 'none'.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <param name="boxSide" type="AjaxControlToolkit.BoxSide">
        /// Side of the element
        /// </param>
        /// <returns type="Boolean">
        /// Whether the current border style for an element on a specific boxSide is not 'none'.
        /// </returns>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        if(boxSide < AjaxControlToolkit.BoxSide.Top || boxSide > AjaxControlToolkit.BoxSide.Left) {
            throw Error.argumentOutOfRange(String.format(Sys.Res.enumInvalidValue, boxSide, 'AjaxControlToolkit.BoxSide'));
        }
        var styleName = this._borderStyleNames[boxSide];
        var styleValue = this.getCurrentStyle(element, styleName);
        return styleValue != "none";
    },
    
    getMargin : function(element, boxSide) {
        /// <summary>
        /// Gets the margin thickness of an element on a specific boxSide.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <param name="boxSide" type="AjaxControlToolkit.BoxSide">
        /// Side of the element
        /// </param>
        /// <returns type="Number" integer="true">
        /// Margin thickness on the element's specified side
        /// </returns>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        if(boxSide < AjaxControlToolkit.BoxSide.Top || boxSide > AjaxControlToolkit.BoxSide.Left) {
            throw Error.argumentOutOfRange(String.format(Sys.Res.enumInvalidValue, boxSide, 'AjaxControlToolkit.BoxSide'));
        }
        var styleName = this._marginWidthNames[boxSide];
        var styleValue = this.getCurrentStyle(element, styleName);
        try { return this.parsePadding(styleValue); } catch(ex) { return 0; }
    },

    getBorderWidth : function(element, boxSide) {
        /// <summary>
        /// Gets the border thickness of an element on a specific boxSide.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <param name="boxSide" type="AjaxControlToolkit.BoxSide">
        /// Side of the element
        /// </param>
        /// <returns type="Number" integer="true">
        /// Border thickness on the element's specified side
        /// </returns>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        if(boxSide < AjaxControlToolkit.BoxSide.Top || boxSide > AjaxControlToolkit.BoxSide.Left) {
            throw Error.argumentOutOfRange(String.format(Sys.Res.enumInvalidValue, boxSide, 'AjaxControlToolkit.BoxSide'));
        }
        if(!this.isBorderVisible(element, boxSide)) {
            return 0;
        }        
        var styleName = this._borderWidthNames[boxSide];    
        var styleValue = this.getCurrentStyle(element, styleName);
        return this.parseBorderWidth(styleValue);
    },
    
    getPadding : function(element, boxSide) {
        /// <summary>
        /// Gets the padding thickness of an element on a specific boxSide.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <param name="boxSide" type="AjaxControlToolkit.BoxSide">
        /// Side of the element
        /// </param>
        /// <returns type="Number" integer="true">
        /// Padding on the element's specified side
        /// </returns>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        if(boxSide < AjaxControlToolkit.BoxSide.Top || boxSide > AjaxControlToolkit.BoxSide.Left) {
            throw Error.argumentOutOfRange(String.format(Sys.Res.enumInvalidValue, boxSide, 'AjaxControlToolkit.BoxSide'));
        }
        var styleName = this._paddingWidthNames[boxSide];
        var styleValue = this.getCurrentStyle(element, styleName);
        return this.parsePadding(styleValue);
    },
    
    parseBorderWidth : function(borderWidth) {
        /// <summary>
        /// Parses a border-width string into a pixel size
        /// </summary>
        /// <param name="borderWidth" type="String" mayBeNull="true">
        /// Type of border ('thin','medium','thick','inherit',px unit,null,'')
        /// </param>
        /// <returns type="Number" integer="true">
        /// Number of pixels in the border-width
        /// </returns>
        if (!this._borderThicknesses) {
            
            // Populate the borderThicknesses lookup table
            var borderThicknesses = { };
            var div0 = document.createElement('div');
            div0.style.visibility = 'hidden';
            div0.style.position = 'absolute';
            div0.style.fontSize = '1px';
            document.body.appendChild(div0)
            var div1 = document.createElement('div');
            div1.style.height = '0px';
            div1.style.overflow = 'hidden';
            div0.appendChild(div1);
            var base = div0.offsetHeight;
            div1.style.borderTop = 'solid black';
            div1.style.borderTopWidth = 'thin';
            borderThicknesses['thin'] = div0.offsetHeight - base;
            div1.style.borderTopWidth = 'medium';
            borderThicknesses['medium'] = div0.offsetHeight - base;
            div1.style.borderTopWidth = 'thick';
            borderThicknesses['thick'] = div0.offsetHeight - base;
            div0.removeChild(div1);
            document.body.removeChild(div0);
            this._borderThicknesses = borderThicknesses;
        }
        
        if (borderWidth) {
            switch(borderWidth) {
                case 'thin':
                case 'medium':
                case 'thick':
                    return this._borderThicknesses[borderWidth];
                case 'inherit':
                    return 0;
            }
            var unit = this.parseUnit(borderWidth);
            Sys.Debug.assert(unit.type == 'px', String.format(AjaxControlToolkit.Resources.Common_InvalidBorderWidthUnit, unit.type));
            return unit.size;
        }
        return 0;
    },
    
    parsePadding : function(padding) {
        /// <summary>
        /// Parses a padding string into a pixel size
        /// </summary>
        /// <param name="padding" type="String" mayBeNull="true">
        /// Padding to parse ('inherit',px unit,null,'')
        /// </param>
        /// <returns type="Number" integer="true">
        /// Number of pixels in the padding
        /// </returns>
        
        if(padding) {
            if(padding == 'inherit') {
                return 0;
            }
            var unit = this.parseUnit(padding);
            Sys.Debug.assert(unit.type == 'px', String.format(AjaxControlToolkit.Resources.Common_InvalidPaddingUnit, unit.type));
            return unit.size;
        }
        return 0;
    },
    
    parseUnit : function(value) {
        /// <summary>
        /// Parses a unit string into a unit object
        /// </summary>
        /// <param name="value" type="String" mayBeNull="true">
        /// Value to parse (of the form px unit,% unit,em unit,...)
        /// </param>
        /// <returns type="Object">
        /// Parsed unit (of the form {size,type})
        /// </returns>
        
        if (!value) {
            throw Error.argumentNull('value');
        }
        
        value = value.trim().toLowerCase();
        var l = value.length;
        var s = -1;
        for(var i = 0; i < l; i++) {
            var ch = value.substr(i, 1);
            if((ch < '0' || ch > '9') && ch != '-' && ch != '.' && ch != ',') {
                break;
            }
            s = i;
        }
        if(s == -1) {
            throw Error.create(AjaxControlToolkit.Resources.Common_UnitHasNoDigits);
        }
        var type;
        var size;
        if(s < (l - 1)) {
            type = value.substring(s + 1).trim();
        } else {
            type = 'px';
        }
        size = parseFloat(value.substr(0, s + 1));
        if(type == 'px') {
            size = Math.floor(size);
        }
        return { 
            size: size,
            type: type
        };
    },
    
    getElementOpacity : function(element) {
        /// <summary>
        /// Get the element's opacity
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// Element
        /// </param>
        /// <returns type="Number">
        /// Opacity of the element
        /// </returns>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        
        var hasOpacity = false;
        var opacity;
        
        if (element.filters) {
            var filters = element.filters;
            if (filters.length !== 0) {
                var alphaFilter = filters['DXImageTransform.Microsoft.Alpha'];
                if (alphaFilter) {
                    opacity = alphaFilter.opacity / 100.0;
                    hasOpacity = true;
                }
            }
        }
        else {
            opacity = this.getCurrentStyle(element, 'opacity', 1);
            hasOpacity = true;
        }
        
        if (hasOpacity === false) {
            return 1.0;
        }
        return parseFloat(opacity);
    },

    setElementOpacity : function(element, value) {
        /// <summary>
        /// Set the element's opacity
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// Element
        /// </param>
        /// <param name="value" type="Number">
        /// Opacity of the element
        /// </param>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        
        if (element.filters) {
            var filters = element.filters;
            var createFilter = true;
            if (filters.length !== 0) {
                var alphaFilter = filters['DXImageTransform.Microsoft.Alpha'];
                if (alphaFilter) {
                    createFilter = false;
                    alphaFilter.opacity = value * 100;
                }
            }
            if (createFilter) {
                element.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + (value * 100) + ')';
            }
        }
        else {
            element.style.opacity = value;
        }
    },
    
    getVisible : function(element) {
        /// <summary>
        /// Check if an element is visible
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// Element
        /// </param>
        /// <returns type="Boolean" mayBeNull="false">
        /// True if the element is visible, false otherwise
        /// </returns>
        
        // Note: reference to CommonToolkitScripts must be left intact (i.e. don't
        // replace with 'this') because this function will be aliased
        
        return (element &&
                ("none" != $common.getCurrentStyle(element, "display")) &&
                ("hidden" != $common.getCurrentStyle(element, "visibility")));
    },
    
    setVisible : function(element, value) {
        /// <summary>
        /// Check if an element is visible
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// Element
        /// </param>
        /// <param name="value" type="Boolean" mayBeNull="false">
        /// True to make the element visible, false to hide it
        /// </param>
        
        // Note: reference to CommonToolkitScripts must be left intact (i.e. don't
        // replace with 'this') because this function will be aliased
        
        if (element && value != $common.getVisible(element)) {
            if (value) {
                if (element.style.removeAttribute) {
                    element.style.removeAttribute("display");
                } else {
                   element.style.removeProperty("display");
                }
            } else {
                element.style.display = 'none';
            }
            element.style.visibility = value ? 'visible' : 'hidden';
        }
    },
    
    resolveFunction : function(value) {
        /// <summary>
        /// Returns a function reference that corresponds to the provided value
        /// </summary>
        /// <param name="value" type="Object">
        /// The value can either be a Function, the name of a function (that can be found using window['name']),
        /// or an expression that evaluates to a function.
        /// </param>
        /// <returns type="Function">
        /// Reference to the function, or null if not found
        /// </returns>
        
        if (value) {
            if (value instanceof Function) {
                return value;
            } else if (String.isInstanceOfType(value) && value.length > 0) {
                var func;
                if ((func = window[value]) instanceof Function) {
                    return func;
                } else if ((func = eval(value)) instanceof Function) {
                    return func;
                }
            }
        }
        return null;
    },

    addCssClasses : function(element, classNames) {
        /// <summary>
        /// Adds multiple css classes to a DomElement
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement">The element to modify</param>
        /// <param name="classNames" type="Array">The class names to add</param>
        
        for(var i = 0; i < classNames.length; i++) {
            Sys.UI.DomElement.addCssClass(element, classNames[i]);
        }
    },
    removeCssClasses : function(element, classNames) {
        /// <summary>
        /// Removes multiple css classes to a DomElement
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement">The element to modify</param>
        /// <param name="classNames" type="Array">The class names to remove</param>
        
        for(var i = 0; i < classNames.length; i++) {
            Sys.UI.DomElement.removeCssClass(element, classNames[i]);
        }
    },
    setStyle : function(element, style) {
        /// <summary>
        /// Sets the style of the element using the supplied style template object
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement">The element to modify</param>
        /// <param name="style" type="Object">The template</param>

        $common.applyProperties(element.style, style);
    },
    removeHandlers : function(element, events) {
        /// <summary>
        /// Removes a set of event handlers from an element
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement">The element to modify</param>
        /// <param name="events" type="Object">The template object that contains event names and delegates</param>
        /// <remarks>
        /// This is NOT the same as $clearHandlers which removes all delegates from a DomElement.  This rather removes select delegates 
        /// from a specified element and has a matching signature as $addHandlers
        /// </remarks>
        for (var name in events) {
            $removeHandler(element, name, events[name]);
        }
    },
    
    overlaps : function(r1, r2) {
        /// <summary>
        /// Determine if two rectangles overlap
        /// </summary>
        /// <param name="r1" type="Object">
        /// Rectangle
        /// </param>
        /// <param name="r2" type="Object">
        /// Rectangle
        /// </param>
        /// <returns type="Boolean">
        /// True if the rectangles overlap, false otherwise
        /// </returns>
        
         return r1.x < (r2.x + r2.width)
                && r2.x < (r1.x + r1.width)
                && r1.y < (r2.y + r2.height)
                && r2.y < (r1.y + r1.height);
    },
    
    containsPoint : function(rect, x, y) {
        /// <summary>
        /// Tests whether a point (x,y) is contained within a rectangle
        /// </summary>
        /// <param name="rect" type="Object">The rectangle</param>
        /// <param name="x" type="Number">The x coordinate of the point</param>
        /// <param name="y" type="Number">The y coordinate of the point</param>
        
        return x >= rect.x && x < (rect.x + rect.width) && y >= rect.y && y < (rect.y + rect.height);
    },

    isKeyDigit : function(keyCode) { 
        /// <summary>
        /// Gets whether the supplied key-code is a digit
        /// </summary>
        /// <param name="keyCode" type="Number" integer="true">The key code of the event (from Sys.UI.DomEvent)</param>
        /// <returns type="Boolean" />

        return (0x30 <= keyCode && keyCode <= 0x39); 
    },
    
    isKeyNavigation : function(keyCode) { 
        /// <summary>
        /// Gets whether the supplied key-code is a navigation key
        /// </summary>
        /// <param name="keyCode" type="Number" integer="true">The key code of the event (from Sys.UI.DomEvent)</param>
        /// <returns type="Boolean" />

        return (Sys.UI.Key.left <= keyCode && keyCode <= Sys.UI.Key.down); 
    },
    
    padLeft : function(text, size, ch, truncate) { 
        /// <summary>
        /// Pads the left hand side of the supplied text with the specified pad character up to the requested size
        /// </summary>
        /// <param name="text" type="String">The text to pad</param>
        /// <param name="size" type="Number" integer="true" optional="true">The size to pad the text (default is 2)</param>
        /// <param name="ch" type="String" optional="true">The single character to use as the pad character (default is ' ')</param>
        /// <param name="truncate" type="Boolean" optional="true">Whether to truncate the text to size (default is false)</param>
        
        return $common._pad(text, size || 2, ch || ' ', 'l', truncate || false); 
    },
    
    padRight : function(text, size, ch, truncate) { 
        /// <summary>
        /// Pads the right hand side of the supplied text with the specified pad character up to the requested size
        /// </summary>
        /// <param name="text" type="String">The text to pad</param>
        /// <param name="size" type="Number" integer="true" optional="true">The size to pad the text (default is 2)</param>
        /// <param name="ch" type="String" optional="true">The single character to use as the pad character (default is ' ')</param>
        /// <param name="truncate" type="Boolean" optional="true">Whether to truncate the text to size (default is false)</param>

        return $common._pad(text, size || 2, ch || ' ', 'r', truncate || false); 
    },
    
    _pad : function(text, size, ch, side, truncate) {
        /// <summary>
        /// Pads supplied text with the specified pad character up to the requested size
        /// </summary>
        /// <param name="text" type="String">The text to pad</param>
        /// <param name="size" type="Number" integer="true">The size to pad the text</param>
        /// <param name="ch" type="String">The single character to use as the pad character</param>
        /// <param name="side" type="String">Either 'l' or 'r' to siginfy whether to pad the Left or Right side respectively</param>
        /// <param name="truncate" type="Boolean">Whether to truncate the text to size</param>

        text = text.toString();
        var length = text.length;
        var builder = new Sys.StringBuilder();
        if (side == 'r') {
            builder.append(text);
        } 
        while (length < size) {
            builder.append(ch);
            length++;
        }
        if (side == 'l') {
            builder.append(text);
        }
        var result = builder.toString();
        if (truncate && result.length > size) {
            if (side == 'l') {
                result = result.substr(result.length - size, size);
            } else {
                result = result.substr(0, size);
            }
        }
        return result;
    },
    
    __DOMEvents : {
        focusin : { eventGroup : "UIEvents", init : function(e, p) { e.initUIEvent("focusin", true, false, window, 1); } },
        focusout : { eventGroup : "UIEvents", init : function(e, p) { e.initUIEvent("focusout", true, false, window, 1); } },
        activate : { eventGroup : "UIEvents", init : function(e, p) { e.initUIEvent("activate", true, true, window, 1); } },
        focus : { eventGroup : "UIEvents", init : function(e, p) { e.initUIEvent("focus", false, false, window, 1); } },
        blur : { eventGroup : "UIEvents", init : function(e, p) { e.initUIEvent("blur", false, false, window, 1); } },
        click : { eventGroup : "MouseEvents", init : function(e, p) { e.initMouseEvent("click", true, true, window, 1, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
        dblclick : { eventGroup : "MouseEvents", init : function(e, p) { e.initMouseEvent("click", true, true, window, 2, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
        mousedown : { eventGroup : "MouseEvents", init : function(e, p) { e.initMouseEvent("mousedown", true, true, window, 1, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
        mouseup : { eventGroup : "MouseEvents", init : function(e, p) { e.initMouseEvent("mouseup", true, true, window, 1, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
        mouseover : { eventGroup : "MouseEvents", init : function(e, p) { e.initMouseEvent("mouseover", true, true, window, 1, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
        mousemove : { eventGroup : "MouseEvents", init : function(e, p) { e.initMouseEvent("mousemove", true, true, window, 1, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
        mouseout : { eventGroup : "MouseEvents", init : function(e, p) { e.initMouseEvent("mousemove", true, true, window, 1, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
        load : { eventGroup : "HTMLEvents", init : function(e, p) { e.initEvent("load", false, false); } },
        unload : { eventGroup : "HTMLEvents", init : function(e, p) { e.initEvent("unload", false, false); } },
        select : { eventGroup : "HTMLEvents", init : function(e, p) { e.initEvent("select", true, false); } },
        change : { eventGroup : "HTMLEvents", init : function(e, p) { e.initEvent("change", true, false); } },
        submit : { eventGroup : "HTMLEvents", init : function(e, p) { e.initEvent("submit", true, true); } },
        reset : { eventGroup : "HTMLEvents", init : function(e, p) { e.initEvent("reset", true, false); } },
        resize : { eventGroup : "HTMLEvents", init : function(e, p) { e.initEvent("resize", true, false); } },
        scroll : { eventGroup : "HTMLEvents", init : function(e, p) { e.initEvent("scroll", true, false); } }
    },
    
    tryFireRawEvent : function(element, rawEvent) {
        /// <summary>
        /// Attempts to fire a raw DOM event on an element
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement">The element to fire the event</param>
        /// <param name="rawEvent" type="Object">The raw DOM event object to fire. Must not be Sys.UI.DomEvent</param>
        /// <returns type="Boolean">True if the event was successfully fired, otherwise false</returns>
        
        try {
            if (element.fireEvent) {
                element.fireEvent("on" + rawEvent.type, rawEvent);
                return true;
            } else if (element.dispatchEvent) {
                element.dispatchEvent(rawEvent);
                return true;
            }
        } catch (e) {
        }
        return false;
    },    

    tryFireEvent : function(element, eventName, properties) {
        /// <summary>
        /// Attempts to fire a DOM event on an element
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement">The element to fire the event</param>
        /// <param name="eventName" type="String">The name of the event to fire (without an 'on' prefix)</param>
        /// <param name="properties" type="Object">Properties to add to the event</param>
        /// <returns type="Boolean">True if the event was successfully fired, otherwise false</returns>
        
        try {
            if (document.createEventObject) {
                var e = document.createEventObject();
                $common.applyProperties(e, properties || {});
                element.fireEvent("on" + eventName, e);
                return true;
            } else if (document.createEvent) {
                var def = $common.__DOMEvents[eventName];
                if (def) {
                    var e = document.createEvent(def.eventGroup);
                    def.init(e, properties || {});
                    element.dispatchEvent(e);
                    return true;
                }
            }
        } catch (e) {
        }
        return false;
    },

    wrapElement : function(innerElement, newOuterElement, newInnerParentElement) {
        /// <summary>
        /// Wraps an inner element with a new outer element at the same DOM location as the inner element
        /// </summary>
        /// <param name="innerElement" type="Sys.UI.DomElement">The element to be wrapped</param>
        /// <param name="newOuterElement" type="Sys.UI.DomElement">The new parent for the element</param>
        /// <returns />
        
        var parent = innerElement.parentNode;
        parent.replaceChild(newOuterElement, innerElement);        
        (newInnerParentElement || newOuterElement).appendChild(innerElement);
    },

    unwrapElement : function(innerElement, oldOuterElement) {
        /// <summary>
        /// Unwraps an inner element from an outer element at the same DOM location as the outer element
        /// </summary>
        /// <param name="innerElement" type="Sys.UI.DomElement">The element to be wrapped</param>
        /// <param name="newOuterElement" type="Sys.UI.DomElement">The new parent for the element</param>
        /// <returns />

        var parent = oldOuterElement.parentNode;
        if (parent != null) {
            $common.removeElement(innerElement);
            parent.replaceChild(innerElement, oldOuterElement);
        }
    },
    
    removeElement : function(element) {
        /// <summary>
        /// Removes an element from the DOM tree
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement">The element to be removed</param>
        /// <returns />

        var parent = element.parentNode;
        if (parent != null) {
            parent.removeChild(element);
        }
    },
 
    applyProperties : function(target, properties) {
        /// <summary>
        /// Quick utility method to copy properties from a template object to a target object
        /// </summary>
        /// <param name="target" type="Object">The object to apply to</param>
        /// <param name="properties" type="Object">The template to copy values from</param>
        
        for (var p in properties) {
            var pv = properties[p];
            if (pv != null && Object.getType(pv)===Object) {
                var tv = target[p];
                $common.applyProperties(tv, pv);
            } else {
                target[p] = pv;
            }
        }
    },
        
    createElementFromTemplate : function(template, appendToParent, nameTable) {
        /// <summary>
        /// Creates an element for the current document based on a template object
        /// </summary>
        /// <param name="template" type="Object">The template from which to create the element</param>
        /// <param name="appendToParent" type="Sys.UI.DomElement" optional="true" mayBeNull="true">A DomElement under which to append this element</param>
        /// <param name="nameTable" type="Object" optional="true" mayBeNull="true">An object to use as the storage for the element using template.name as the key</param>
        /// <returns type="Sys.UI.DomElement" />
        /// <remarks>
        /// This method is useful if you find yourself using the same or similar DomElement constructions throughout a class.  You can even set the templates
        /// as static properties for a type to cut down on overhead.  This method is often called with a JSON style template:
        /// <code>
        /// var elt = $common.createElementFromTemplate({
        ///     nodeName : "div",
        ///     properties : {
        ///         style : {
        ///             height : "100px",
        ///             width : "100px",
        ///             backgroundColor : "white"
        ///         },
        ///         expandoAttribute : "foo"
        ///     },
        ///     events : {
        ///         click : function() { alert("foo"); },
        ///         mouseover : function() { elt.backgroundColor = "silver"; },
        ///         mouseout : function() { elt.backgroundColor = "white"; }
        ///     },
        ///     cssClasses : [ "class0", "class1" ],
        ///     visible : true,
        ///     opacity : .5
        /// }, someParent);
        /// </code>
        /// </remarks>
        
        // if we wish to override the name table we do so here
        if (typeof(template.nameTable)!='undefined') {
            var newNameTable = template.nameTable;
            if (String.isInstanceOfType(newNameTable)) {
                newNameTable = nameTable[newNameTable];
            }
            if (newNameTable != null) {
                nameTable = newNameTable;
            }
        }
        
        // get a name for the element in the nameTable
        var elementName = null;
        if (typeof(template.name)!=='undefined') {
            elementName = template.name;
        }
        
        // create or acquire the element
        var elt = document.createElement(template.nodeName);
        
        // if our element is named, add it to the name table
        if (typeof(template.name)!=='undefined' && nameTable) {
            nameTable[template.name] = elt;
        }
        
        // if we wish to supply a default parent we do so here
        if (typeof(template.parent)!=='undefined' && appendToParent == null) {
            var newParent = template.parent;
            if (String.isInstanceOfType(newParent)) {
                newParent = nameTable[newParent];
            }
            if (newParent != null) {
                appendToParent = newParent;
            }
        }
        
        // properties are applied as expando values to the element
        if (typeof(template.properties)!=='undefined' && template.properties != null) {
            $common.applyProperties(elt, template.properties);
        }
        
        // css classes are added to the element's className property
        if (typeof(template.cssClasses)!=='undefined' && template.cssClasses != null) {
            $common.addCssClasses(elt, template.cssClasses);
        }
        
        // events are added to the dom element using $addHandlers
        if (typeof(template.events)!=='undefined' && template.events != null) {
            $addHandlers(elt, template.events);
        }
        
        // if the element is visible or not its visibility is set
        if (typeof(template.visible)!=='undefined' && template.visible != null) {
            this.setVisible(elt, template.visible);
        }
        
        // if we have an appendToParent we will now append to it
        if (appendToParent) {
            appendToParent.appendChild(elt);
        }

        // if we have opacity, apply it
        if (typeof(template.opacity)!=='undefined' && template.opacity != null) {
            $common.setElementOpacity(elt, template.opacity);
        }
        
        // if we have child templates, process them
        if (typeof(template.children)!=='undefined' && template.children != null) {
            for (var i = 0; i < template.children.length; i++) {
                var subtemplate = template.children[i];
                $common.createElementFromTemplate(subtemplate, elt, nameTable);
            }
        }
        
        // if we have a content presenter for the element get it (the element itself is the default presenter for content)
        var contentPresenter = elt;
        if (typeof(template.contentPresenter)!=='undefined' && template.contentPresenter != null) {
            contentPresenter = nameTable[contentPresenter];
        }
        
        // if we have content, add it
        if (typeof(template.content)!=='undefined' && template.content != null) {
            var content = template.content;
            if (String.isInstanceOfType(content)) {
                content = nameTable[content];
            }
            if (content.parentNode) {
                $common.wrapElement(content, elt, contentPresenter);
            } else {
                contentPresenter.appendChild(content);
            }
        }
        
        // return the created element
        return elt;
    },
    
    prepareHiddenElementForATDeviceUpdate : function () {
        /// <summary>
        /// JAWS, an Assistive Technology device responds to updates to form elements 
        /// and refreshes its document buffer to what is showing live
        /// in the browser. To ensure that Toolkit controls that make XmlHttpRequests to
        /// retrieve content are useful to users with visual disabilities, we update a
        /// hidden form element to ensure that JAWS conveys what is in
        /// the browser. See this article for more details: 
        /// http://juicystudio.com/article/improving-ajax-applications-for-jaws-users.php
        /// This method creates a hidden input on the screen for any page that uses a Toolkit
        /// control that will perform an XmlHttpRequest.
        /// </summary>   
        var objHidden = document.getElementById('hiddenInputToUpdateATBuffer_CommonToolkitScripts');
        if (!objHidden) {
            var objHidden = document.createElement('input');
            objHidden.setAttribute('type', 'hidden');
            objHidden.setAttribute('value', '1');
            objHidden.setAttribute('id', 'hiddenInputToUpdateATBuffer_CommonToolkitScripts');
            objHidden.setAttribute('name', 'hiddenInputToUpdateATBuffer_CommonToolkitScripts');
            if ( document.forms[0] ) {
                document.forms[0].appendChild(objHidden);
            }
        }
    },
    
    updateFormToRefreshATDeviceBuffer : function () {
        /// <summary>
        /// Updates the hidden buffer to ensure that the latest document stream is picked up
        /// by the screen reader.
        /// </summary>
        var objHidden = document.getElementById('hiddenInputToUpdateATBuffer_CommonToolkitScripts');

        if (objHidden) {
            if (objHidden.getAttribute('value') == '1') {
                objHidden.setAttribute('value', '0');
            } else {
                objHidden.setAttribute('value', '1');
            }
        }
    }
}

// Create the singleton instance of the CommonToolkitScripts
var CommonToolkitScripts = AjaxControlToolkit.CommonToolkitScripts = new AjaxControlToolkit._CommonToolkitScripts();
var $common = CommonToolkitScripts;

// Alias functions that were moved from BlockingScripts into Common
Sys.UI.DomElement.getVisible = $common.getVisible;
Sys.UI.DomElement.setVisible = $common.setVisible;
Sys.UI.Control.overlaps = $common.overlaps;

AjaxControlToolkit._DomUtility = function() {
    /// <summary>
    /// Utility functions for manipulating the DOM
    /// </summary>
}
AjaxControlToolkit._DomUtility.prototype = {
    isDescendant : function(ancestor, descendant) {
        /// <summary>
        /// Whether the specified element is a descendant of the ancestor
        /// </summary>
        /// <param name="ancestor" type="Sys.UI.DomElement">Ancestor node</param>
        /// <param name="descendant" type="Sys.UI.DomElement">Possible descendant node</param>
        /// <returns type="Boolean" />
        
        for (var n = descendant.parentNode; n != null; n = n.parentNode) {
            if (n == ancestor) return true;
        }
        return false;
    },
    isDescendantOrSelf : function(ancestor, descendant) {
        /// <summary>
        /// Whether the specified element is a descendant of the ancestor or the same as the ancestor
        /// </summary>
        /// <param name="ancestor" type="Sys.UI.DomElement">Ancestor node</param>
        /// <param name="descendant" type="Sys.UI.DomElement">Possible descendant node</param>
        /// <returns type="Boolean" />

        if (ancestor === descendant) 
            return true;
        return AjaxControlToolkit.DomUtility.isDescendant(ancestor, descendant);
    },
    isAncestor : function(descendant, ancestor) {
        /// <summary>
        /// Whether the specified element is an ancestor of the descendant
        /// </summary>
        /// <param name="descendant" type="Sys.UI.DomElement">Descendant node</param>
        /// <param name="ancestor" type="Sys.UI.DomElement">Possible ancestor node</param>
        /// <returns type="Boolean" />

        return AjaxControlToolkit.DomUtility.isDescendant(ancestor, descendant);
    },
    isAncestorOrSelf : function(descendant, ancestor) {
        /// <summary>
        /// Whether the specified element is an ancestor of the descendant or the same as the descendant
        /// </summary>
        /// <param name="descendant" type="Sys.UI.DomElement">Descendant node</param>
        /// <param name="ancestor" type="Sys.UI.DomElement">Possible ancestor node</param>
        /// <returns type="Boolean" />
        
        if (descendant === ancestor)
            return true;
            
        return AjaxControlToolkit.DomUtility.isDescendant(ancestor, descendant);
    },
    isSibling : function(self, sibling) {
        /// <summary>
        /// Whether the specified element is a sibling of the self element
        /// </summary>
        /// <param name="self" type="Sys.UI.DomElement">Self node</param>
        /// <param name="sibling" type="Sys.UI.DomElement">Possible sibling node</param>
        /// <returns type="Boolean" />
        
        var parent = self.parentNode;
        for (var i = 0; i < parent.childNodes.length; i++) {
            if (parent.childNodes[i] == sibling) return true;
        }
        return false;
    }
}
AjaxControlToolkit._DomUtility.registerClass("AjaxControlToolkit._DomUtility");
AjaxControlToolkit.DomUtility = new AjaxControlToolkit._DomUtility();


AjaxControlToolkit.TextBoxWrapper = function(element) {
    /// <summary>
    /// Class that wraps a TextBox (INPUT type="text") to abstract-out the
    /// presence of a watermark (which may be visible to the user but which
    /// should never be read by script.
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// The DOM element the behavior is associated with
    /// </param>
    AjaxControlToolkit.TextBoxWrapper.initializeBase(this, [element]);
    this._current = element.value;
    this._watermark = null;
    this._isWatermarked = false;
}

AjaxControlToolkit.TextBoxWrapper.prototype = {

    dispose : function() {
        /// <summary>
        /// Dispose the behavior
        /// </summary>
        this.get_element().AjaxControlToolkitTextBoxWrapper = null;
        AjaxControlToolkit.TextBoxWrapper.callBaseMethod(this, 'dispose');
    },

    get_Current : function() {
        /// <value type="String">
        /// Current value actually in the TextBox (i.e., TextBox.value)
        /// </value>
        this._current = this.get_element().value;
        return this._current;
    },
    set_Current : function(value) {
        this._current = value;
        this._updateElement();
    },

    get_Value : function() {
        /// <value type="String">
        /// Conceptual "value" of the TextBox - its contents if no watermark is present
        /// or "" if one is
        /// </value>
        if (this.get_IsWatermarked()) {
            return "";
        } else {
            return this.get_Current();
        }
    },
    set_Value : function(text) {
        this.set_Current(text);
        if (!text || (0 == text.length)) {
            if (null != this._watermark) {
                this.set_IsWatermarked(true);
            }
        } else {
            this.set_IsWatermarked(false);
        }
    },

    get_Watermark : function() {
        /// <value type="String">
        /// Text of the watermark for the TextBox
        /// </value>
        return this._watermark;
    },
    set_Watermark : function(value) {
        this._watermark = value;
        this._updateElement();
    },

    get_IsWatermarked : function() {
        /// <value type="Boolean">
        /// true iff the TextBox is watermarked
        /// </value>
        return this._isWatermarked;
    },
    set_IsWatermarked : function(isWatermarked) {
        if (this._isWatermarked != isWatermarked) {
            this._isWatermarked = isWatermarked;
            this._updateElement();
            this._raiseWatermarkChanged();
        }
    },

    _updateElement : function() {
        /// <summary>
        /// Updates the actual contents of the TextBox according to what should be there
        /// </summary>
        var element = this.get_element();
        if (this._isWatermarked) {
            if (element.value != this._watermark) {
                element.value = this._watermark;
            }
        } else {
            if (element.value != this._current) {
                element.value = this._current;
            }
        }
    },

    add_WatermarkChanged : function(handler) {
        /// <summary>
        /// Adds a handler for the WatermarkChanged event
        /// </summary>
        /// <param name="handler" type="Function">
        /// Handler
        /// </param>
        this.get_events().addHandler("WatermarkChanged", handler);
    },
    remove_WatermarkChanged : function(handler) {
        /// <summary>
        /// Removes a handler for the WatermarkChanged event
        /// </summary>
        /// <param name="handler" type="Function">
        /// Handler
        /// </param>
        this.get_events().removeHandler("WatermarkChanged", handler);
    },
    _raiseWatermarkChanged : function() {
        /// <summary>
        /// Raises the WatermarkChanged event
        /// </summary>
        var onWatermarkChangedHandler = this.get_events().getHandler("WatermarkChanged");
        if (onWatermarkChangedHandler) {
            onWatermarkChangedHandler(this, Sys.EventArgs.Empty);
        }
    }
}
AjaxControlToolkit.TextBoxWrapper.get_Wrapper = function(element) {
    /// <summary>
    /// Gets (creating one if necessary) the TextBoxWrapper for the specified TextBox
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// TextBox for which to get the wrapper
    /// </param>
    /// <returns type="AjaxControlToolkit.TextBoxWrapper">
    /// TextBoxWrapper instance
    /// </returns>
    if (null == element.AjaxControlToolkitTextBoxWrapper) {
        element.AjaxControlToolkitTextBoxWrapper = new AjaxControlToolkit.TextBoxWrapper(element);
    }
    return element.AjaxControlToolkitTextBoxWrapper;
}
AjaxControlToolkit.TextBoxWrapper.registerClass('AjaxControlToolkit.TextBoxWrapper', Sys.UI.Behavior);

AjaxControlToolkit.TextBoxWrapper.validatorGetValue = function(id) {
    /// <summary>
    /// Wrapper for ASP.NET's validatorGetValue to return the value from the wrapper if present
    /// </summary>
    /// <param name="id" type="String">
    /// id of the element
    /// </param>
    /// <returns type="Object">
    /// Value from the wrapper or result of original ValidatorGetValue
    /// </returns>
    var control = $get(id);
    if (control && control.AjaxControlToolkitTextBoxWrapper) {
        return control.AjaxControlToolkitTextBoxWrapper.get_Value();
    }
    return AjaxControlToolkit.TextBoxWrapper._originalValidatorGetValue(id);
}

// Wrap ASP.NET's ValidatorGetValue with AjaxControlToolkit.TextBoxWrapper.validatorGetValue
// to make validators work properly with watermarked TextBoxes
if (typeof(ValidatorGetValue) == 'function') {
    AjaxControlToolkit.TextBoxWrapper._originalValidatorGetValue = ValidatorGetValue;
    ValidatorGetValue = AjaxControlToolkit.TextBoxWrapper.validatorGetValue;
}


// Temporary fix null reference bug in Sys.CultureInfo._getAbbrMonthIndex
if (Sys.CultureInfo.prototype._getAbbrMonthIndex) {
    try {
        Sys.CultureInfo.prototype._getAbbrMonthIndex('');
    } catch(ex) {
        Sys.CultureInfo.prototype._getAbbrMonthIndex = function(value) {
            if (!this._upperAbbrMonths) {
                this._upperAbbrMonths = this._toUpperArray(this.dateTimeFormat.AbbreviatedMonthNames);
            }
            return Array.indexOf(this._upperAbbrMonths, this._toUpper(value));
        }
        Sys.CultureInfo.CurrentCulture._getAbbrMonthIndex = Sys.CultureInfo.prototype._getAbbrMonthIndex;
        Sys.CultureInfo.InvariantCulture._getAbbrMonthIndex = Sys.CultureInfo.prototype._getAbbrMonthIndex;
    }
}

//END AjaxControlToolkit.Common.Common.js
//START AjaxControlToolkit.ExtenderBase.BaseScripts.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />


Type.registerNamespace('AjaxControlToolkit');

// This is the base behavior for all extender behaviors
AjaxControlToolkit.BehaviorBase = function(element) {
    /// <summary>
    /// Base behavior for all extender behaviors
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// Element the behavior is associated with
    /// </param>
    AjaxControlToolkit.BehaviorBase.initializeBase(this,[element]);
    
    this._clientStateFieldID = null;
    this._pageRequestManager = null;
    this._partialUpdateBeginRequestHandler = null;
    this._partialUpdateEndRequestHandler = null;
}
AjaxControlToolkit.BehaviorBase.prototype = {
    initialize : function() {
        /// <summary>
        /// Initialize the behavior
        /// </summary>

        // TODO: Evaluate necessity
        AjaxControlToolkit.BehaviorBase.callBaseMethod(this, 'initialize');
    },

    dispose : function() {
        /// <summary>
        /// Dispose the behavior
        /// </summary>
        AjaxControlToolkit.BehaviorBase.callBaseMethod(this, 'dispose');

        if (this._pageRequestManager) {
            if (this._partialUpdateBeginRequestHandler) {
                this._pageRequestManager.remove_beginRequest(this._partialUpdateBeginRequestHandler);
                this._partialUpdateBeginRequestHandler = null;
            }
            if (this._partialUpdateEndRequestHandler) {
                this._pageRequestManager.remove_endRequest(this._partialUpdateEndRequestHandler);
                this._partialUpdateEndRequestHandler = null;
            }
            this._pageRequestManager = null;
        }
    },

    get_ClientStateFieldID : function() {
        /// <value type="String">
        /// ID of the hidden field used to store client state
        /// </value>
        return this._clientStateFieldID;
    },
    set_ClientStateFieldID : function(value) {
        if (this._clientStateFieldID != value) {
            this._clientStateFieldID = value;
            this.raisePropertyChanged('ClientStateFieldID');
        }
    },

    get_ClientState : function() {
        /// <value type="String">
        /// Client state
        /// </value>
        if (this._clientStateFieldID) {
            var input = document.getElementById(this._clientStateFieldID);
            if (input) {
                return input.value;
            }
        }
        return null;
    },
    set_ClientState : function(value) {
        if (this._clientStateFieldID) {
            var input = document.getElementById(this._clientStateFieldID);
            if (input) {
                input.value = value;
            }
        }
    },

    registerPartialUpdateEvents : function() {
        /// <summary>
        /// Register for beginRequest and endRequest events on the PageRequestManager,
        /// (which cause _partialUpdateBeginRequest and _partialUpdateEndRequest to be
        /// called when an UpdatePanel refreshes)
        /// </summary>

        if (Sys && Sys.WebForms && Sys.WebForms.PageRequestManager){
            this._pageRequestManager = Sys.WebForms.PageRequestManager.getInstance();
            if (this._pageRequestManager) {
                this._partialUpdateBeginRequestHandler = Function.createDelegate(this, this._partialUpdateBeginRequest);
                this._pageRequestManager.add_beginRequest(this._partialUpdateBeginRequestHandler);
                this._partialUpdateEndRequestHandler = Function.createDelegate(this, this._partialUpdateEndRequest);
                this._pageRequestManager.add_endRequest(this._partialUpdateEndRequestHandler);
            }
        }
    },

    _partialUpdateBeginRequest : function(sender, beginRequestEventArgs) {
        /// <summary>
        /// Method that will be called when a partial update (via an UpdatePanel) begins,
        /// if registerPartialUpdateEvents() has been called.
        /// </summary>
        /// <param name="sender" type="Object">
        /// Sender
        /// </param>
        /// <param name="beginRequestEventArgs" type="Sys.WebForms.BeginRequestEventArgs">
        /// Event arguments
        /// </param>

        // Nothing done here; override this method in a child class
    },
    
    _partialUpdateEndRequest : function(sender, endRequestEventArgs) {
        /// <summary>
        /// Method that will be called when a partial update (via an UpdatePanel) finishes,
        /// if registerPartialUpdateEvents() has been called.
        /// </summary>
        /// <param name="sender" type="Object">
        /// Sender
        /// </param>
        /// <param name="endRequestEventArgs" type="Sys.WebForms.EndRequestEventArgs">
        /// Event arguments
        /// </param>

        // Nothing done here; override this method in a child class
    }
}
AjaxControlToolkit.BehaviorBase.registerClass('AjaxControlToolkit.BehaviorBase', Sys.UI.Behavior);


// Dynamically populates content when the populate method is called
AjaxControlToolkit.DynamicPopulateBehaviorBase = function(element) {
    /// <summary>
    /// DynamicPopulateBehaviorBase is used to add DynamicPopulateBehavior funcitonality
    /// to other extenders.  It will dynamically populate the contents of the target element
    /// when its populate method is called.
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// DOM Element the behavior is associated with
    /// </param>
    AjaxControlToolkit.DynamicPopulateBehaviorBase.initializeBase(this, [element]);
    
    this._DynamicControlID = null;
    this._DynamicContextKey = null;
    this._DynamicServicePath = null;
    this._DynamicServiceMethod = null;
    this._cacheDynamicResults = false;
    this._dynamicPopulateBehavior = null;
    this._populatingHandler = null;
    this._populatedHandler = null;
}
AjaxControlToolkit.DynamicPopulateBehaviorBase.prototype = {
    initialize : function() {
        /// <summary>
        /// Initialize the behavior
        /// </summary>

        AjaxControlToolkit.DynamicPopulateBehaviorBase.callBaseMethod(this, 'initialize');

        // Create event handlers
        this._populatingHandler = Function.createDelegate(this, this._onPopulating);
        this._populatedHandler = Function.createDelegate(this, this._onPopulated);
    },

    dispose : function() {
        /// <summary>
        /// Dispose the behavior
        /// </summary>

        // Dispose of event handlers
        if (this._populatedHandler) {
            if (this._dynamicPopulateBehavior) {
                this._dynamicPopulateBehavior.remove_populated(this._populatedHandler);
            }
            this._populatedHandler = null;
        }
        if (this._populatingHandler) {
            if (this._dynamicPopulateBehavior) {
                this._dynamicPopulateBehavior.remove_populating(this._populatingHandler);
            }
            this._populatingHandler = null;
        }

        // Dispose of the placeholder control and behavior
        if (this._dynamicPopulateBehavior) {
            this._dynamicPopulateBehavior.dispose();
            this._dynamicPopulateBehavior = null;
        }
        AjaxControlToolkit.DynamicPopulateBehaviorBase.callBaseMethod(this, 'dispose');
    },

    populate : function(contextKeyOverride) {
        /// <summary>
        /// Demand-create the DynamicPopulateBehavior and use it to populate the target element
        /// </summary>
        /// <param name="contextKeyOverride" type="String" mayBeNull="true" optional="true">
        /// An arbitrary string value to be passed to the web method. For example, if the element to be populated is within a data-bound repeater, this could be the ID of the current row.
        /// </param>

        // If the DynamicPopulateBehavior's element is out of date, dispose of it
        if (this._dynamicPopulateBehavior && (this._dynamicPopulateBehavior.get_element() != $get(this._DynamicControlID))) {
            this._dynamicPopulateBehavior.dispose();
            this._dynamicPopulateBehavior = null;
        }
        
        // If a DynamicPopulateBehavior is not available and the necessary information is, create one
        if (!this._dynamicPopulateBehavior && this._DynamicControlID && this._DynamicServiceMethod) {
            this._dynamicPopulateBehavior = $create(AjaxControlToolkit.DynamicPopulateBehavior,
                {
                    "id" : this.get_id() + "_DynamicPopulateBehavior",
                    "ContextKey" : this._DynamicContextKey,
                    "ServicePath" : this._DynamicServicePath,
                    "ServiceMethod" : this._DynamicServiceMethod,
                    "cacheDynamicResults" : this._cacheDynamicResults
                }, null, null, $get(this._DynamicControlID));

            // Attach event handlers
            this._dynamicPopulateBehavior.add_populating(this._populatingHandler);
            this._dynamicPopulateBehavior.add_populated(this._populatedHandler);
        }
        
        // If a DynamicPopulateBehavior is available, use it to populate the dynamic content
        if (this._dynamicPopulateBehavior) {
            this._dynamicPopulateBehavior.populate(contextKeyOverride ? contextKeyOverride : this._DynamicContextKey);
        }
    },

    _onPopulating : function(sender, eventArgs) {
        /// <summary>
        /// Handler for DynamicPopulate behavior's Populating event
        /// </summary>
        /// <param name="sender" type="Object">
        /// DynamicPopulate behavior
        /// </param>
        /// <param name="eventArgs" type="Sys.CancelEventArgs" mayBeNull="false">
        /// Event args
        /// </param>
        this.raisePopulating(eventArgs);
    },

    _onPopulated : function(sender, eventArgs) {
        /// <summary>
        /// Handler for DynamicPopulate behavior's Populated event
        /// </summary>
        /// <param name="sender" type="Object">
        /// DynamicPopulate behavior
        /// </param>
        /// <param name="eventArgs" type="Sys.EventArgs" mayBeNull="false">
        /// Event args
        /// </param>
        this.raisePopulated(eventArgs);
    },

    get_dynamicControlID : function() {
        /// <value type="String">
        /// ID of the element to populate with dynamic content
        /// </value>
        return this._DynamicControlID;
    },
    get_DynamicControlID : this.get_dynamicControlID,
    set_dynamicControlID : function(value) {
        if (this._DynamicControlID != value) {
            this._DynamicControlID = value;
            this.raisePropertyChanged('dynamicControlID');
            this.raisePropertyChanged('DynamicControlID');
        }
    },
    set_DynamicControlID : this.set_dynamicControlID,

    get_dynamicContextKey : function() {
        /// <value type="String">
        /// An arbitrary string value to be passed to the web method.
        /// For example, if the element to be populated is within a
        /// data-bound repeater, this could be the ID of the current row.
        /// </value>
        return this._DynamicContextKey;
    },
    get_DynamicContextKey : this.get_dynamicContextKey,
    set_dynamicContextKey : function(value) {
        if (this._DynamicContextKey != value) {
            this._DynamicContextKey = value;
            this.raisePropertyChanged('dynamicContextKey');
            this.raisePropertyChanged('DynamicContextKey');
        }
    },
    set_DynamicContextKey : this.set_dynamicContextKey,

    get_dynamicServicePath : function() {
        /// <value type="String" mayBeNull="true" optional="true">
        /// The URL of the web service to call.  If the ServicePath is not defined, then we will invoke a PageMethod instead of a web service.
        /// </value>
        return this._DynamicServicePath;
    },
    get_DynamicServicePath : this.get_dynamicServicePath,
    set_dynamicServicePath : function(value) {
        if (this._DynamicServicePath != value) {
            this._DynamicServicePath = value;
            this.raisePropertyChanged('dynamicServicePath');
            this.raisePropertyChanged('DynamicServicePath');
        }
    },
    set_DynamicServicePath : this.set_dynamicServicePath,

    get_dynamicServiceMethod : function() {
        /// <value type="String">
        /// The name of the method to call on the page or web service
        /// </value>
        /// <remarks>
        /// The signature of the method must exactly match the following:
        ///     [WebMethod]
        ///     string DynamicPopulateMethod(string contextKey)
        ///     {
        ///         ...
        ///     }
        /// </remarks>
        return this._DynamicServiceMethod;
    },
    get_DynamicServiceMethod : this.get_dynamicServiceMethod,
    set_dynamicServiceMethod : function(value) {
        if (this._DynamicServiceMethod != value) {
            this._DynamicServiceMethod = value;
            this.raisePropertyChanged('dynamicServiceMethod');
            this.raisePropertyChanged('DynamicServiceMethod');
        }
    },
    set_DynamicServiceMethod : this.set_dynamicServiceMethod,
    
    get_cacheDynamicResults : function() {
        /// <value type="Boolean" mayBeNull="false">
        /// Whether the results of the dynamic population should be cached and
        /// not fetched again after the first load
        /// </value>
        return this._cacheDynamicResults;
    },
    set_cacheDynamicResults : function(value) {
        if (this._cacheDynamicResults != value) {
            this._cacheDynamicResults = value;
            this.raisePropertyChanged('cacheDynamicResults');
        }
    },
    
    add_populated : function(handler) {
        /// <summary>
        /// Add a handler on the populated event
        /// </summary>
        /// <param name="handler" type="Function">
        /// Handler
        /// </param>
        this.get_events().addHandler("populated", handler);
    },
    remove_populated : function(handler) {
        /// <summary>
        /// Remove a handler from the populated event
        /// </summary>
        /// <param name="handler" type="Function">
        /// Handler
        /// </param>
        this.get_events().removeHandler("populated", handler);
    },
    raisePopulated : function(arg) {
        /// <summary>
        /// Raise the populated event
        /// </summary>
        /// <param name="arg" type="Sys.EventArgs">
        /// Event arguments
        /// </param>
        var handler = this.get_events().getHandler("populated");  
        if (handler) handler(this, arg);
    },
    
    add_populating : function(handler) {
        /// <summary>
        /// Add an event handler for the populating event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().addHandler('populating', handler);
    },
    remove_populating : function(handler) {
        /// <summary>
        /// Remove an event handler from the populating event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().removeHandler('populating', handler);
    },
    raisePopulating : function(eventArgs) {
        /// <summary>
        /// Raise the populating event
        /// </summary>
        /// <param name="eventArgs" type="Sys.CancelEventArgs" mayBeNull="false">
        /// Event arguments for the populating event
        /// </param>
        /// <returns />
        
        var handler = this.get_events().getHandler('populating');
        if (handler) {
            handler(this, eventArgs);
        }
    }
}
AjaxControlToolkit.DynamicPopulateBehaviorBase.registerClass('AjaxControlToolkit.DynamicPopulateBehaviorBase', AjaxControlToolkit.BehaviorBase);


AjaxControlToolkit.ControlBase = function(element) {
    AjaxControlToolkit.ControlBase.initializeBase(this, [element]);
    this._clientStateField = null;
    this._callbackTarget = null;
    this._onsubmit$delegate = Function.createDelegate(this, this._onsubmit);
    this._oncomplete$delegate = Function.createDelegate(this, this._oncomplete);
    this._onerror$delegate = Function.createDelegate(this, this._onerror);
}
AjaxControlToolkit.ControlBase.prototype = {
    initialize : function() {
        AjaxControlToolkit.ControlBase.callBaseMethod(this, "initialize");
        // load the client state if possible
        if (this._clientStateField) {
            this.loadClientState(this._clientStateField.value);
        }
        // attach an event to save the client state before a postback or updatepanel partial postback
        if (typeof(Sys.WebForms)!=="undefined" && typeof(Sys.WebForms.PageRequestManager)!=="undefined") {
            Array.add(Sys.WebForms.PageRequestManager.getInstance()._onSubmitStatements, this._onsubmit$delegate);
        } else {
            $addHandler(document.forms[0], "submit", this._onsubmit$delegate);
        }
    },
    dispose : function() {
        if (typeof(Sys.WebForms)!=="undefined" && typeof(Sys.WebForms.PageRequestManager)!=="undefined") {
            Array.remove(Sys.WebForms.PageRequestManager.getInstance()._onSubmitStatements, this._onsubmit$delegate);
        } else {
            $removeHandler(document.forms[0], "submit", this._onsubmit$delegate);
        }
        AjaxControlToolkit.ControlBase.callBaseMethod(this, "dispose");
    },
    findElement : function(id) {
        // <summary>Finds an element within this control (ScriptControl/ScriptUserControl are NamingContainers);
        return $get(this.get_id() + '_' + id.split(':').join('_'));
    },
    get_clientStateField : function() {
        return this._clientStateField;
    },
    set_clientStateField : function(value) {
        if (this.get_isInitialized()) throw Error.invalidOperation(AjaxControlToolkit.Resources.ExtenderBase_CannotSetClientStateField);
        if (this._clientStateField != value) {
            this._clientStateField = value;
            this.raisePropertyChanged('clientStateField');
        }
    },
    loadClientState : function(value) {
        /// <remarks>override this method to intercept client state loading after a callback</remarks>
    },
    saveClientState : function() {
        /// <remarks>override this method to intercept client state acquisition before a callback</remarks>
        return null;
    },
    _invoke : function(name, args, cb) {
        /// <summary>invokes a callback method on the server control</summary>        
        if (!this._callbackTarget) {
            throw Error.invalidOperation(AjaxControlToolkit.Resources.ExtenderBase_ControlNotRegisteredForCallbacks);
        }
        if (typeof(WebForm_DoCallback)==="undefined") {
            throw Error.invalidOperation(AjaxControlToolkit.Resources.ExtenderBase_PageNotRegisteredForCallbacks);
        }
        var ar = [];
        for (var i = 0; i < args.length; i++) 
            ar[i] = args[i];
        var clientState = this.saveClientState();
        if (clientState != null && !String.isInstanceOfType(clientState)) {
            throw Error.invalidOperation(AjaxControlToolkit.Resources.ExtenderBase_InvalidClientStateType);
        }
        var payload = Sys.Serialization.JavaScriptSerializer.serialize({name:name,args:ar,state:this.saveClientState()});
        WebForm_DoCallback(this._callbackTarget, payload, this._oncomplete$delegate, cb, this._onerror$delegate, true);
    },
    _oncomplete : function(result, context) {
        result = Sys.Serialization.JavaScriptSerializer.deserialize(result);
        if (result.error) {
            throw Error.create(result.error);
        }
        this.loadClientState(result.state);
        context(result.result);
    },
    _onerror : function(message, context) {
        throw Error.create(message);
    },
    _onsubmit : function() {
        if (this._clientStateField) {
            this._clientStateField.value = this.saveClientState();
        }
        return true;
    }    
   
}
AjaxControlToolkit.ControlBase.registerClass("AjaxControlToolkit.ControlBase", Sys.UI.Control);

AjaxControlToolkit.Resources={
"PasswordStrength_InvalidWeightingRatios":"Strength Weighting ratios must have 4 elements","Animation_ChildrenNotAllowed":"AjaxControlToolkit.Animation.createAnimation cannot add child animations to type \"{0}\" that does not derive from AjaxControlToolkit.Animation.ParentAnimation","PasswordStrength_RemainingSymbols":"{0} symbol characters","ExtenderBase_CannotSetClientStateField":"clientStateField can only be set before initialization","RTE_PreviewHTML":"Preview HTML","RTE_JustifyCenter":"Justify Center","PasswordStrength_RemainingUpperCase":"{0} more upper case characters","Animation_TargetNotFound":"AjaxControlToolkit.Animation.Animation.set_animationTarget requires the ID of a Sys.UI.DomElement or Sys.UI.Control.  No element or control could be found corresponding to \"{0}\"","RTE_FontColor":"Font Color","RTE_LabelColor":"Label Color","Common_InvalidBorderWidthUnit":"A unit type of \"{0}\"\u0027 is invalid for parseBorderWidth","RTE_Heading":"Heading","Tabs_PropertySetBeforeInitialization":"{0} cannot be changed before initialization","RTE_OrderedList":"Ordered List","ReorderList_DropWatcherBehavior_NoChild":"Could not find child of list with id \"{0}\"","CascadingDropDown_MethodTimeout":"[Method timeout]","RTE_Columns":"Columns","RTE_InsertImage":"Insert Image","RTE_InsertTable":"Insert Table","RTE_Values":"Values","RTE_OK":"OK","ExtenderBase_PageNotRegisteredForCallbacks":"This Page has not been registered for callbacks","Animation_NoDynamicPropertyFound":"AjaxControlToolkit.Animation.createAnimation found no property corresponding to \"{0}\" or \"{1}\"","Animation_InvalidBaseType":"AjaxControlToolkit.Animation.registerAnimation can only register types that inherit from AjaxControlToolkit.Animation.Animation","RTE_UnorderedList":"Unordered List","ResizableControlBehavior_InvalidHandler":"{0} handler not a function, function name, or function text","Animation_InvalidColor":"Color must be a 7-character hex representation (e.g. #246ACF), not \"{0}\"","RTE_CellColor":"Cell Color","PasswordStrength_RemainingMixedCase":"Mixed case characters","RTE_Italic":"Italic","CascadingDropDown_NoParentElement":"Failed to find parent element \"{0}\"","ValidatorCallout_DefaultErrorMessage":"This control is invalid","RTE_Indent":"Indent","ReorderList_DropWatcherBehavior_CallbackError":"Reorder failed, see details below.\\r\\n\\r\\n{0}","PopupControl_NoDefaultProperty":"No default property supported for control \"{0}\" of type \"{1}\"","RTE_Normal":"Normal","PopupExtender_NoParentElement":"Couldn\u0027t find parent element \"{0}\"","RTE_ViewValues":"View Values","RTE_Legend":"Legend","RTE_Labels":"Labels","RTE_CellSpacing":"Cell Spacing","PasswordStrength_RemainingNumbers":"{0} more numbers","RTE_Border":"Border","RTE_Create":"Create","RTE_BackgroundColor":"Background Color","RTE_Cancel":"Cancel","RTE_JustifyFull":"Justify Full","RTE_JustifyLeft":"Justify Left","RTE_Cut":"Cut","ResizableControlBehavior_CannotChangeProperty":"Changes to {0} not supported","RTE_ViewSource":"View Source","Common_InvalidPaddingUnit":"A unit type of \"{0}\" is invalid for parsePadding","RTE_Paste":"Paste","ExtenderBase_ControlNotRegisteredForCallbacks":"This Control has not been registered for callbacks","Calendar_Today":"Today: {0}","Common_DateTime_InvalidFormat":"Invalid format","ListSearch_DefaultPrompt":"Type to search","CollapsiblePanel_NoControlID":"Failed to find element \"{0}\"","RTE_ViewEditor":"View Editor","RTE_BarColor":"Bar Color","PasswordStrength_DefaultStrengthDescriptions":"NonExistent;Very Weak;Weak;Poor;Almost OK;Barely Acceptable;Average;Good;Strong;Excellent;Unbreakable!","RTE_Inserttexthere":"Insert text here","Animation_UknownAnimationName":"AjaxControlToolkit.Animation.createAnimation could not find an Animation corresponding to the name \"{0}\"","ExtenderBase_InvalidClientStateType":"saveClientState must return a value of type String","Rating_CallbackError":"An unhandled exception has occurred:\\r\\n{0}","Tabs_OwnerExpected":"owner must be set before initialize","DynamicPopulate_WebServiceTimeout":"Web service call timed out","PasswordStrength_RemainingLowerCase":"{0} more lower case characters","Animation_MissingAnimationName":"AjaxControlToolkit.Animation.createAnimation requires an object with an AnimationName property","RTE_JustifyRight":"Justify Right","Tabs_ActiveTabArgumentOutOfRange":"Argument is not a member of the tabs collection","RTE_CellPadding":"Cell Padding","RTE_ClearFormatting":"Clear Formatting","AlwaysVisible_ElementRequired":"AjaxControlToolkit.AlwaysVisibleControlBehavior must have an element","Slider_NoSizeProvided":"Please set valid values for the height and width attributes in the slider\u0027s CSS classes","DynamicPopulate_WebServiceError":"Web Service call failed: {0}","PasswordStrength_StrengthPrompt":"Strength: ","PasswordStrength_RemainingCharacters":"{0} more characters","PasswordStrength_Satisfied":"Nothing more required","RTE_Hyperlink":"Hyperlink","Animation_NoPropertyFound":"AjaxControlToolkit.Animation.createAnimation found no property corresponding to \"{0}\"","PasswordStrength_InvalidStrengthDescriptionStyles":"Text Strength description style classes must match the number of text descriptions.","PasswordStrength_GetHelpRequirements":"Get help on password requirements","PasswordStrength_InvalidStrengthDescriptions":"Invalid number of text strength descriptions specified","RTE_Underline":"Underline","Tabs_PropertySetAfterInitialization":"{0} cannot be changed after initialization","RTE_Rows":"Rows","RTE_Redo":"Redo","RTE_Size":"Size","RTE_Undo":"Undo","RTE_Bold":"Bold","RTE_Copy":"Copy","RTE_Font":"Font","CascadingDropDown_MethodError":"[Method error {0}]","RTE_BorderColor":"Border Color","RTE_Paragraph":"Paragraph","RTE_InsertHorizontalRule":"Insert Horizontal Rule","Common_UnitHasNoDigits":"No digits","RTE_Outdent":"Outdent","Common_DateTime_InvalidTimeSpan":"\"{0}\" is not a valid TimeSpan format","Animation_CannotNestSequence":"AjaxControlToolkit.Animation.SequenceAnimation cannot be nested inside AjaxControlToolkit.Animation.ParallelAnimation","Shared_BrowserSecurityPreventsPaste":"Your browser security settings don\u0027t permit the automatic execution of paste operations. Please use the keyboard shortcut Ctrl+V instead."};
//END AjaxControlToolkit.ExtenderBase.BaseScripts.js
//START AjaxControlToolkit.RoundedCorners.RoundedCornersBehavior.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../ExtenderBase/BaseScripts.js" />
/// <reference path="../Common/Common.js" />


Type.registerNamespace('AjaxControlToolkit');

AjaxControlToolkit.BoxCorners = function() {
    /// <summary>
    /// Corners of an element
    /// </summary>
    /// <field name="None" type="Number" integer="true" />
    /// <field name="TopLeft" type="Number" integer="true" />
    /// <field name="TopRight" type="Number" integer="true" />
    /// <field name="BottomRight" type="Number" integer="true" />
    /// <field name="BottomLeft" type="Number" integer="true" />
    /// <field name="Top" type="Number" integer="true" />
    /// <field name="Right" type="Number" integer="true" />
    /// <field name="Bottom" type="Number" integer="true" />
    /// <field name="Left" type="Number" integer="true" />
    /// <field name="All" type="Number" integer="true" />
    throw Error.invalidOperation();
}
AjaxControlToolkit.BoxCorners.prototype = {
    None        : 0x00,

    TopLeft     : 0x01,
    TopRight    : 0x02,
    BottomRight : 0x04,
    BottomLeft  : 0x08,
    
    Top         : 0x01 | 0x02,
    Right       : 0x02 | 0x04,
    Bottom      : 0x04 | 0x08,
    Left        : 0x08 | 0x01,
    All         : 0x01 | 0x02 | 0x04 | 0x08
}
AjaxControlToolkit.BoxCorners.registerEnum("AjaxControlToolkit.BoxCorners", true);


AjaxControlToolkit.RoundedCornersBehavior = function(element) {
    /// <summary>
    /// The RoundedCornersBehavior rounds the corners of its target element
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// DOM element associated with the behavior
    /// </param>
    AjaxControlToolkit.RoundedCornersBehavior.initializeBase(this, [element]);
    
    this._corners = AjaxControlToolkit.BoxCorners.All;
    this._radius = 5;
    this._color = null;
    this._parentDiv = null;
    this._originalStyle = null;
    this._borderColor = null;
}
AjaxControlToolkit.RoundedCornersBehavior.prototype = {
    initialize : function() {
        /// <summary>
        /// Initialize the behavior
        /// </summary>
        AjaxControlToolkit.RoundedCornersBehavior.callBaseMethod(this, 'initialize');
        this.buildParentDiv();
    },
    
    dispose : function() {
        /// <summary>
        /// Dispose the behavior
        /// </summary>

        this.disposeParentDiv();
        AjaxControlToolkit.RoundedCornersBehavior.callBaseMethod(this, 'dispose');
    },

    buildParentDiv : function() {
        /// <summary>
        /// Create the surrounding div that will have rounded corners
        /// </summary>
        var e = this.get_element();

        if (!e) return;

        this.disposeParentDiv();
        
        var color = this.getBackgroundColor();
        var originalWidth = e.offsetWidth;
        var newParent = e.cloneNode(false);

        // move all children into the new div.
        this.moveChildren(e, newParent);

        // modify the target element to be transparent
        // and set up the new parent
        this._originalStyle = e.style.cssText;
        e.style.backgroundColor = "transparent";
        e.style.verticalAlign = "top";
        e.style.padding = "0";
        e.style.overflow = "";
        e.style.className = "";
        if (e.style.height) {
            // Increase the height to account for the rounded corners
            e.style.height = parseInt($common.getCurrentStyle(e, 'height')) + (this._radius * 2) + "px";
        } else {
            // Note: Do NOT use $common.getCurrentStyle in the check below
            // because that breaks the work-around
            if (!e.style.width && (0 < originalWidth)) {
                // The following line works around a problem where IE renders the first
                // rounded DIV about 6 pixels too high if e doesn't have a width or height
                e.style.width = originalWidth + "px";
            }
        }

        // these are properties we don't want cloned down to the new parent
        newParent.style.position = "";
        newParent.style.border   = "";
        newParent.style.margin   = "";
        newParent.style.width    = "100%";
        newParent.id             = "";
        newParent.removeAttribute("control");

        if (this._borderColor) {
            newParent.style.borderTopStyle = "none";
            newParent.style.borderBottomStyle = "none";
            newParent.style.borderLeftStyle = "solid";
            newParent.style.borderRightStyle = "solid";
            newParent.style.borderLeftColor = this._borderColor;
            newParent.style.borderRightColor = this._borderColor;
            newParent.style.borderLeftWidth = "1px";
            newParent.style.borderRightWidth = "1px";
            if (this._radius == 0) {
                newParent.style.borderTopStyle = "solid";
                newParent.style.borderBottomStyle = "solid";
                newParent.style.borderTopColor = this._borderColor;
                newParent.style.borderBottomColor = this._borderColor;
                newParent.style.borderTopWidth = "1px";
                newParent.style.borderBottomWidth = "1px";
            }
        } else {
            newParent.style.borderTopStyle = "none";
            newParent.style.borderBottomStyle = "none";
            newParent.style.borderLeftStyle = "none";
            newParent.style.borderRightStyle = "none";
        }

        // build a set of steps on each end to fake the corners.
        //  ------- (step 0)
        //  -------- (step n-1)
        //  --------- (step n)
        //  XXXXXXXXX (inner div)
        //  XXXXXXXXX
        //  --------- (bottom step n)
        //  --------  (bottom step n-1)
        //  ------    (bottom step 0)

        var lastDiv = null;
        var radius = this._radius;
        var lines = this._radius;
        var lastDelta = 0;
        
        for (var i = lines; i > 0; i--) {

            // figure out how much we'll need to subtract from each item
            var angle = Math.acos(i / radius);
            var delta = radius - Math.round(Math.sin(angle) * radius);

            // build a 1 pixel tall div
            // that's delta pixels shorter on each end.

            // add the top one
            var newDiv = document.createElement("DIV");
            newDiv.__roundedDiv = true;
            newDiv.style.backgroundColor = color;
            newDiv.style.marginLeft = delta + "px";
            newDiv.style.marginRight = (delta - (this._borderColor ? 2 : 0)) + "px";
            newDiv.style.height = "1px";
            newDiv.style.fontSize = "1px"; // workaround for IE wierdness with 1px divs.
            newDiv.style.overflow = "hidden";

            if (this._borderColor) {
                newDiv.style.borderLeftStyle = "solid";
                newDiv.style.borderRightStyle = "solid";
                newDiv.style.borderLeftColor = this._borderColor;
                newDiv.style.borderRightColor = this._borderColor;
                
                var offset = Math.max(0, lastDelta - delta - 1);
                newDiv.style.borderLeftWidth = (offset + 1) + "px";
                newDiv.style.borderRightWidth = (offset + 1) + "px";
                
                if (i == lines) {
                    newDiv.__roundedDivNoBorder = true;
                    newDiv.style.backgroundColor = this._borderColor;
                }
            }

            e.insertBefore(newDiv, lastDiv);

            var topDiv = newDiv;

            // add the bottom one one
            newDiv = newDiv.cloneNode(true);
            newDiv.__roundedDiv = true;

            e.insertBefore(newDiv, lastDiv);

            var bottomDiv = newDiv;

            lastDiv = newDiv;
            lastDelta = delta;
            
            if (!this.isCornerSet(AjaxControlToolkit.BoxCorners.TopLeft)) {
                topDiv.style.marginLeft = "0";
                if (this._borderColor) {
                    topDiv.style.borderLeftWidth = "1px";
                }
            }
            if (!this.isCornerSet(AjaxControlToolkit.BoxCorners.TopRight)) {
                topDiv.style.marginRight = "0";
                if (this._borderColor) {
                    topDiv.style.borderRightWidth = "1px";
                    topDiv.style.marginRight = "-2px";
                }
            }
            if (!this.isCornerSet(AjaxControlToolkit.BoxCorners.BottomLeft)) {
                bottomDiv.style.marginLeft = "0";
                if (this._borderColor) {
                    bottomDiv.style.borderLeftWidth = "1px";
                }
            }
            if (!this.isCornerSet(AjaxControlToolkit.BoxCorners.BottomRight)) {
                bottomDiv.style.marginRight = "0";
                if (this._borderColor) {
                    bottomDiv.style.borderRightWidth = "1px";
                    bottomDiv.style.marginRight = "-2px";
                }
            }
        }

        // finally, add the newParent (which has all the original content)
        // into the div.
        e.insertBefore(newParent, lastDiv);
        this._parentDiv = newParent;
    },

    disposeParentDiv : function() {
        /// <summary>
        /// Dispose the surrounding div with rounded corners
        /// </summary>

        if (this._parentDiv) {
            // clean up the divs we added.
            var e = this.get_element();
            var children = e.childNodes;
            for (var i = children.length - 1; i >=0; i--) {
                var child = children[i];
                if (child) {
                    if (child == this._parentDiv) {
                        this.moveChildren(child, e);
                    }
                    try {
                        e.removeChild(child);
                    } catch(e) {
                        // Safari likes to throw NOT_FOUND_ERR (DOMException 8)
                        // but it seems to work fine anyway.
                    }
                }
            }

            // restore the original style
            if (this._originalStyle) {
                e.style.cssText = this._originalStyle;
                this._originalStyle = null;
            }
            this._parentDiv = null;
        }
    },

    getBackgroundColor : function() {
        /// <summary>
        /// Get the background color of the target element
        /// </summary>
        if (this._color) {
            return this._color;
        }
        return $common.getCurrentStyle(this.get_element(), 'backgroundColor');
    },

    moveChildren : function(src, dest) {
        /// <summary>
        /// Move the child nodes from one element to another
        /// </summary>
        /// <param name="src" type="Sys.UI.DomElement" domElement="true">
        /// DOM Element
        /// </param>
        /// <param name="dest" type="Sys.UI.DomElement" domElement="true">
        /// DOM Element
        /// </param>

        var moveCount = 0;
        while (src.hasChildNodes()) {
            var child = src.childNodes[0];
            child = src.removeChild(child);
            dest.appendChild(child);
            moveCount++;
        }
        return moveCount;
    },
    
    isCornerSet : function(corner) {
        /// <summary>
        /// Check whether the a flag for this corner has been set
        /// </summary>
        /// <param name="corner" type="AjaxControlTooolkit.BoxCorners">
        /// Corner to check
        /// </param>
        /// <returns type="Boolean">
        /// True if it is included in the flags, false otherwise
        /// </returns>
        return (this._corners & corner) != AjaxControlToolkit.BoxCorners.None;
    },
    
    setCorner : function(corner, value) {
        /// <summary>
        /// Set a corner as one that should be rounded
        /// </summary>
        /// <param name="corner" type="AjaxControlToolkit.BoxCorners">
        /// Corner to set
        /// </param>
        /// <param name="value" type="Boolean">
        /// True to set the value, False to clear it
        /// </param>
        if (value) {
            this.set_Corners(this._corners | corner);
        } else {
            this.set_Corners(this._corners & ~corner);
        }
    },
    
    get_Color : function() {
        /// <value type="String">
        /// The background color of the rounded area an corners.  By default this picks up the background color of the panel that it is attached to.
        /// </value>
        return this._color;
    },
    set_Color : function(value) {
        if (value != this._color) {
            this._color = value;
            this.buildParentDiv();
            this.raisePropertyChanged('Color');
        }
    },

    get_Radius : function() {
        /// <value type="Number" integer="true">
        /// The radius of the corners (and height of the added area).  Default is 5.
        /// </value>
        return this._radius;
    },
    set_Radius : function(value) {
        if (value != this._radius) {
            this._radius = value;
            this.buildParentDiv();
            this.raisePropertyChanged('Radius');
        }
    },
    
    get_Corners : function() {
        /// <value type="AjaxControlToolkit.BoxCorners">
        /// Corners that should be rounded
        /// </value>
        return this._corners;
    },
    set_Corners : function(value) {
        if (value != this._corners) {
            this._corners = value;
            this.buildParentDiv();
            this.raisePropertyChanged("Corners");
        }
    },
    
    get_BorderColor : function() {
        /// <value type="String">
        /// Color of the border (and hence the rounded corners)
        /// </value>
        return this._borderColor;
    },
    set_BorderColor : function(value) {
        if (value != this._borderColor) {
            this._borderColor = value;
            this.buildParentDiv();
            this.raisePropertyChanged("BorderColor");
        }
    }
}
AjaxControlToolkit.RoundedCornersBehavior.registerClass('AjaxControlToolkit.RoundedCornersBehavior', AjaxControlToolkit.BehaviorBase);

//END AjaxControlToolkit.RoundedCorners.RoundedCornersBehavior.js
//START AjaxControlToolkit.Compat.Timer.Timer.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />


///////////////////////////////////////////////////////////////////////////////
// Sys.Timer

Sys.Timer = function() {
    Sys.Timer.initializeBase(this);
    
    this._interval = 1000;
    this._enabled = false;
    this._timer = null;
}

Sys.Timer.prototype = {
    get_interval: function() {
        
        return this._interval;
    },
    set_interval: function(value) {
        
        if (this._interval !== value) {
            this._interval = value;
            this.raisePropertyChanged('interval');
            
            if (!this.get_isUpdating() && (this._timer !== null)) {
                this._stopTimer();
                this._startTimer();
            }
        }
    },
    
    get_enabled: function() {
        
        return this._enabled;
    },
    set_enabled: function(value) {
        
        if (value !== this.get_enabled()) {
            this._enabled = value;
            this.raisePropertyChanged('enabled');
            if (!this.get_isUpdating()) {
                if (value) {
                    this._startTimer();
                }
                else {
                    this._stopTimer();
                }
            }
        }
    },

    
    add_tick: function(handler) {
        
        
        this.get_events().addHandler("tick", handler);
    },

    remove_tick: function(handler) {
        
        
        this.get_events().removeHandler("tick", handler);
    },

    dispose: function() {
        this.set_enabled(false);
        this._stopTimer();
        
        Sys.Timer.callBaseMethod(this, 'dispose');
    },
    
    updated: function() {
        Sys.Timer.callBaseMethod(this, 'updated');

        if (this._enabled) {
            this._stopTimer();
            this._startTimer();
        }
    },

    _timerCallback: function() {
        var handler = this.get_events().getHandler("tick");
        if (handler) {
            handler(this, Sys.EventArgs.Empty);
        }
    },

    _startTimer: function() {
        this._timer = window.setInterval(Function.createDelegate(this, this._timerCallback), this._interval);
    },

    _stopTimer: function() {
        window.clearInterval(this._timer);
        this._timer = null;
    }
}

Sys.Timer.descriptor = {
    properties: [   {name: 'interval', type: Number},
                    {name: 'enabled', type: Boolean} ],
    events: [ {name: 'tick'} ]
}

Sys.Timer.registerClass('Sys.Timer', Sys.Component);

//END AjaxControlToolkit.Compat.Timer.Timer.js
//START AjaxControlToolkit.DropShadow.DropShadowBehavior.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../ExtenderBase/BaseScripts.js" />
/// <reference path="../Common/Common.js" />
/// <reference path="../RoundedCorners/RoundedCornersBehavior.js" />
/// <reference path="../Compat/Timer/Timer.js" />


Type.registerNamespace('AjaxControlToolkit');

AjaxControlToolkit.DropShadowBehavior = function(element) {
    /// <summary>
    /// The DropShadowBehavior is used to attach a drop shadow to the element
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// DOM Element the behavior is associated with
    /// </param>
    AjaxControlToolkit.DropShadowBehavior.initializeBase(this, [element]);

    // our property values
    this._opacity = 1.0;
    this._width = 5;

    // the div we create for the shadow.
    this._shadowDiv = null;

    // our timer for tracking position
    this._trackPosition = null;
    this._trackPositionDelay = 50;
    this._timer = null;
    this._tickHandler = null;
    this._roundedBehavior = null;
    this._shadowRoundedBehavior = null;

    this._rounded = false;
    this._radius = 5;

    // our cache of our last size and position for tracking
    this._lastX = null;
    this._lastY = null;
    this._lastW = null;
    this._lastH = null;
}
AjaxControlToolkit.DropShadowBehavior.prototype = {
    initialize : function() {
        /// <summary>
        /// Initialize the behavior
        /// </summary>
        AjaxControlToolkit.DropShadowBehavior.callBaseMethod(this, 'initialize');
        
        var e = this.get_element();

        // flip the styles position to relative so that we z-order properly.
        if ($common.getCurrentStyle(e, 'position', e.style.position) != "absolute") {
            e.style.position = "relative";
        }

        // set up our initial state
        if (this._rounded) {
            this.setupRounded();
        }
        if (this._trackPosition) {
            this.startTimer();
        }
        this.setShadow();
    },

    dispose : function() {
        /// <summary>
        /// Dispose the behavior
        /// </summary>
        this.stopTimer();
        this.disposeShadowDiv();
        AjaxControlToolkit.DropShadowBehavior.callBaseMethod(this, 'dispose');
    },

    buildShadowDiv : function() {
        /// <summary>
        /// Create the div that we'll use as the shadow
        /// </summary>
        
        var e = this.get_element();

        if (!this.get_isInitialized() || !e || !this._width) return;

        var div = document.createElement("DIV");
        div.style.backgroundColor = "black";
        div.style.position= "absolute";
                
        if (e.id) {
            div.id = e.id + "_DropShadow";
        }

        // initialize a control around it, and
        // set up the opacity behavior and rounding
        this._shadowDiv = div;

       e.parentNode.appendChild(div);

       if (this._rounded ) {
            this._shadowDiv.style.height = Math.max(0, e.offsetHeight - (2*this._radius)) + "px";
            if (!this._shadowRoundedBehavior) {
                this._shadowRoundedBehavior = $create(AjaxControlToolkit.RoundedCornersBehavior, {"Radius": this._radius}, null, null, this._shadowDiv);
            } else {
                this._shadowRoundedBehavior.set_Radius(this._radius);
            }
        } else if (this._shadowRoundedBehavior) {
            this._shadowRoundedBehavior.set_Radius(0);
        }

        if (this._opacity != 1.0) {
            this.setupOpacity();
        }

        this.setShadow(false, true);
        this.updateZIndex();
    },

    disposeShadowDiv : function() {
        /// <summary>
        /// Dispose of the div we use as the shadow
        /// </summary>

        if (this._shadowDiv) {
            // on page teardown (or in an update panel, this may already
            // be gone)
            //
            if (this._shadowDiv.parentNode) {
                this._shadowDiv.parentNode.removeChild(this._shadowDiv);
            }            
            this._shadowDiv = null;
        }
        
        if (this._shadowRoundedBehavior) {
            this._shadowRoundedBehavior.dispose();
            this._shadowRoundedBehavior = null;            
        }
    },

    onTimerTick : function() {
        /// <summary>
        /// Timer's tick handler that is used to position the shadow when its target moves
        /// </summary>
        this.setShadow();
    },

    startTimer : function() {
        /// <summary>
        /// Start the timer (and hence start tracking the bounds of the target element)
        /// </summary>

        if (!this._timer) {
            if (!this._tickHandler) {
                this._tickHandler = Function.createDelegate(this, this.onTimerTick);
            }
            this._timer = new Sys.Timer();
            this._timer.set_interval(this._trackPositionDelay);
            this._timer.add_tick(this._tickHandler);
            this._timer.set_enabled(true);
        }
    },

    stopTimer : function() {
        /// <summary>
        /// Stop the timer (and hence stop tracking the bounds of the target element)
        /// </summary>

        // on stop, just clean the thing up completely
        if (this._timer) {
            this._timer.remove_tick(this._tickHandler);
            this._timer.set_enabled(false);
            this._timer.dispose();
            this._timer = null;
        }
    },

    setShadow : function(force, norecurse) {
        /// <summary>
        /// This function does the heavy lifting of positioning and sizing the shadow.
        /// It caches values to avoid extra work - it's called on a timer so we need to
        /// keep it light weight.
        /// </summary>
        /// <param name="force" type="Boolean">
        /// Whether to force the bounds change
        /// </param>
        /// <param name="norecurse" type="Boolean">
        /// Whether to recurse if we need to recreate the shadow div
        /// </param>

        var e = this.get_element();
        if (!this.get_isInitialized() || !e || (!this._width && !force)) return;

        var existingShadow = this._shadowDiv;
        if (!existingShadow) {
            this.buildShadowDiv();
        }

        // Consider calling offsetLeft first to avoid recursive math of location?                
        var location = $common.getLocation(e);
        
        if (force || this._lastX != location.x || this._lastY != location.y || !existingShadow) {
            this._lastX = location.x;
            this._lastY = location.y;

            var w = this.get_Width();
            
            // to work around setlocation bug because elements embedded within fixed\absolute
            // elements are set relative to their parent instead of the window
            if((e.parentNode.style.position == "absolute") || (e.parentNode.style.position == "fixed") )
            {
                location.x = w;
                location.y = w;
            }
            else if (e.parentNode.style.position == "relative")
            {
                location.x = w;
                var paddingTop = e.parentNode.style.paddingTop;
                paddingTop = paddingTop.replace("px", "");
                
                var intPaddingTop = 0;
                intPaddingTop = parseInt(paddingTop);
                 
                location.y = w + intPaddingTop;
            }
            else
            {
                location.x += w;
                location.y += w;
            }
            
            $common.setLocation(this._shadowDiv, location);
        }

        var h = e.offsetHeight;
        var w = e.offsetWidth;

        if (force || h != this._lastH || w != this._lastW || !existingShadow) {
            this._lastW = w;
            this._lastH = h;
            if (!this._rounded || !existingShadow || norecurse) {
               this._shadowDiv.style.width = w + "px";
               this._shadowDiv.style.height = h + "px";
            } else {
                // recurse if we need to redo the div
                this.disposeShadowDiv();
                this.setShadow();
            }
        }

        if (this._shadowDiv) {
            this._shadowDiv.style.visibility = $common.getCurrentStyle(e, 'visibility');
        }
    },

    setupOpacity : function() {
        /// <summary>
        /// Set the opacity of the shadow div
        /// </summary>
        if (this.get_isInitialized() && this._shadowDiv) {
            $common.setElementOpacity(this._shadowDiv, this._opacity);
        }
    },

    setupRounded : function() {
        /// <summary>
        /// Demand create and initialize the RoundedCornersBehavior
        /// </summary>
        
        if (!this._roundedBehavior && this._rounded) {
            this._roundedBehavior = $create(AjaxControlToolkit.RoundedCornersBehavior, null, null, null, this.get_element());            
        }
        if (this._roundedBehavior) {
            this._roundedBehavior.set_Radius(this._rounded ? this._radius : 0);
        }
    },

    updateZIndex : function() {
        /// <summary>
        /// Update the z-Index so the shadow div remains behind the target element
        /// </summary>

        if (!this._shadowDiv) return;
        
        var e = this.get_element();
        var targetZIndex = e.style.zIndex;
        var shadowZIndex = this._shadowDiv.style.zIndex;

        if (shadowZIndex && targetZIndex && targetZIndex > shadowZIndex) {
            return;
        } else {
           targetZIndex = Math.max(2, targetZIndex);
           shadowZIndex = targetZIndex - 1;
        }
        e.style.zIndex = targetZIndex;
        this._shadowDiv.style.zIndex = shadowZIndex;
    },

    updateRoundedCorners : function() {
        /// <summary>
        /// Update the RoundedCorndersBehavior and recreate the shadow div so its corners are rounded as well
        /// </summary>
        if (this.get_isInitialized()) {
            this.setupRounded();
            this.disposeShadowDiv();
            this.setShadow();
        }
    },

    get_Opacity : function() {
        /// <value type="Number">
        /// The opacity of the drop shadow, from 0 (fully transparent) to 1.0 (fully opaque). The default value is .5.
        /// </value>
        return this._opacity;
    },
    set_Opacity : function(value) {
        if (this._opacity != value) {
            this._opacity = value;
            this.setupOpacity();
            this.raisePropertyChanged('Opacity');
        }
    },

    get_Rounded : function() {
        /// <value type="Boolean">
        /// Whether or not the corners of the target and drop shadow should be rounded
        /// </value>
        return this._rounded;
    },
    set_Rounded : function(value) {
        if (value != this._rounded) {
            this._rounded = value;
            this.updateRoundedCorners();
            this.raisePropertyChanged('Rounded');
        }
    },

    get_Radius : function() {
        /// <value type="Number" integer="true">
        /// Radius, in pixels, of the rounded corners
        /// </value>
        return this._radius;
    },
    set_Radius : function(value) {
        if (value != this._radius) {
            this._radius = value;
            this.updateRoundedCorners();
            this.raisePropertyChanged('Radius');
        }
    },

    get_Width : function() {
        /// <value type="Number" integer="true">
        /// Width in pixels of the drop shadow.  The default value is 5 pixels.
        /// </value>
        return this._width;
    },
    set_Width : function(value) {
        if (value != this._width) {
            this._width = value;
            
            if (this._shadowDiv) {
                $common.setVisible(this._shadowDiv, value > 0);
            }
            
            this.setShadow(true);
            this.raisePropertyChanged('Width');
        }
    },

    get_TrackPositionDelay : function() {
        /// <value type="Number">
        /// Length of the timer interval used when tracking the position of the target
        /// </value>
        return this._trackPositionDelay;
    },
    set_TrackPositionDelay : function(value) {
        if (value != this._trackPositionDelay) {
            this._trackPositionDelay = value;
            if (this._trackPosition) {
                this.stopTimer();
                this.startTimer();
            }
            this.raisePropertyChanged('TrackPositionDelay');
        }
    },

    get_TrackPosition : function() {
        /// <value type="Boolean">
        /// Whether the drop shadow should track the position of the panel it is attached to. Use this if the panel is absolutely positioned or will otherwise move.
        /// </value>
        return this._trackPosition;
    },
    set_TrackPosition : function(value) {
        if (value != this._trackPosition) {
            this._trackPosition = value;
            if (this.get_element()) {
                if (value) {
                    this.startTimer();
                } else {
                    this.stopTimer();
                }
            }
            this.raisePropertyChanged('TrackPosition');
        }
    }
}
AjaxControlToolkit.DropShadowBehavior.registerClass('AjaxControlToolkit.DropShadowBehavior', AjaxControlToolkit.BehaviorBase);
//    getDescriptor : function() {
//        var td = AjaxControlToolkit.DropShadowBehavior.callBaseMethod(this, 'getDescriptor');
//        td.addProperty('Opacity', Number);
//        td.addProperty('Width', Number);
//        td.addProperty('TrackPosition', Boolean);
//        td.addProperty('TrackPositionDelay', Number);
//        td.addProperty('Rounded', Boolean);
//        td.addProperty('Radius', Number);
//        return td;
//    },

//END AjaxControlToolkit.DropShadow.DropShadowBehavior.js
//START AjaxControlToolkit.DynamicPopulate.DynamicPopulateBehavior.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../ExtenderBase/BaseScripts.js" />
/// <reference path="../Common/Common.js" />


Type.registerNamespace('AjaxControlToolkit');

AjaxControlToolkit.DynamicPopulateBehavior = function(element) {
    /// <summary>
    /// The DynamicPopulateBehavior replaces the contents of an element with the result of a web service or page method call.  The method call returns a string of HTML that is inserted as the children of the target element.
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// DOM Element the behavior is associated with
    /// </param>
    AjaxControlToolkit.DynamicPopulateBehavior.initializeBase(this, [element]);
    
    this._servicePath = null;
    this._serviceMethod = null;
    this._contextKey = null;
    this._cacheDynamicResults = false;
    this._populateTriggerID = null;
    this._setUpdatingCssClass = null;
    this._clearDuringUpdate = true;
    this._customScript = null;
    
    this._clickHandler = null;
    
    this._callID = 0;
    this._currentCallID = -1;
    
    // Whether or not we've already populated (used for cacheDynamicResults)
    this._populated = false;
}
AjaxControlToolkit.DynamicPopulateBehavior.prototype = {
    initialize : function() {
        /// <summary>
        /// Initialize the behavior
        /// </summary>
        AjaxControlToolkit.DynamicPopulateBehavior.callBaseMethod(this, 'initialize');
        $common.prepareHiddenElementForATDeviceUpdate();        
    
        // hook up the trigger if we have one.
        if (this._populateTriggerID) {
            var populateTrigger = $get(this._populateTriggerID);
            if (populateTrigger) {
                this._clickHandler = Function.createDelegate(this, this._onPopulateTriggerClick);
                $addHandler(populateTrigger, "click", this._clickHandler);
            }
        }
    },
    
    dispose : function() {
        /// <summary>
        /// Dispose the behavior
        /// </summary>

        // clean up the trigger event.
        if (this._populateTriggerID && this._clickHandler) {
            var populateTrigger = $get(this._populateTriggerID);
            if (populateTrigger) {
                $removeHandler(populateTrigger, "click", this._clickHandler);
            }
            this._populateTriggerID = null;
            this._clickHandler = null;
        }
       
        AjaxControlToolkit.DynamicPopulateBehavior.callBaseMethod(this, 'dispose');
    },
    
    populate : function(contextKey) {
        /// <summary>
        /// Get the dymanic content and use it to populate the target element
        /// </summary>
        /// <param name="contextKey" type="String" mayBeNull="true" optional="true">
        /// An arbitrary string value to be passed to the web method. For example, if the element to be
        /// populated is within a data-bound repeater, this could be the ID of the current row.
        /// </param>
        
        // Don't populate if we already cached the results
        if (this._populated && this._cacheDynamicResults) {
            return;
        }

        // Initialize the population if this is the very first call
        if (this._currentCallID == -1) {
            var eventArgs = new Sys.CancelEventArgs();
            this.raisePopulating(eventArgs);
            if (eventArgs.get_cancel()) {
                return;
            }
            this._setUpdating(true);
        }
        
        // Either run the custom population script or invoke the web service
        if (this._customScript) {
            // Call custom javascript call to populate control
            var scriptResult = eval(this._customScript);
            this.get_element().innerHTML = scriptResult; 
            this._setUpdating(false);
         } else {
             this._currentCallID = ++this._callID;
             if (this._servicePath && this._serviceMethod) {
                Sys.Net.WebServiceProxy.invoke(this._servicePath, this._serviceMethod, false,
                    { contextKey:(contextKey ? contextKey : this._contextKey) },
                    Function.createDelegate(this, this._onMethodComplete), Function.createDelegate(this, this._onMethodError),
                    this._currentCallID);
                $common.updateFormToRefreshATDeviceBuffer();
             }
        }
    },

    _onMethodComplete : function (result, userContext, methodName) {
        /// <summary>
        /// Callback used when the populating service returns successfully
        /// </summary>
        /// <param name="result" type="Object" mayBeNull="">
        /// The data returned from the Web service method call
        /// </param>
        /// <param name="userContext" type="Object">
        /// The context information that was passed when the Web service method was invoked
        /// </param>        
        /// <param name="methodName" type="String">
        /// The Web service method that was invoked
        /// </param>

        // ignore if it's not the current call.
        if (userContext != this._currentCallID) return;

        // Time has passed; make sure the element is still accessible
        var e = this.get_element();
        if (e) {
            e.innerHTML = result;
        }

        this._setUpdating(false);
    },

    _onMethodError : function(webServiceError, userContext, methodName) {
        /// <summary>
        /// Callback used when the populating service fails
        /// </summary>
        /// <param name="webServiceError" type="Sys.Net.WebServiceError">
        /// Web service error
        /// </param>
        /// <param name="userContext" type="Object">
        /// The context information that was passed when the Web service method was invoked
        /// </param>        
        /// <param name="methodName" type="String">
        /// The Web service method that was invoked
        /// </param>

        // ignore if it's not the current call.
        if (userContext != this._currentCallID) return;

        var e = this.get_element();
        if (e) {
            if (webServiceError.get_timedOut()) {
                e.innerHTML = AjaxControlToolkit.Resources.DynamicPopulate_WebServiceTimeout;
            } else {
                e.innerHTML = String.format(AjaxControlToolkit.Resources.DynamicPopulate_WebServiceError, webServiceError.get_statusCode());
            }
        }

        this._setUpdating(false);
    },

    _onPopulateTriggerClick : function() {
        /// <summary>
        /// Handler for the element described by PopulateTriggerID's click event
        /// </summary>

        // just call through to the trigger.
        this.populate(this._contextKey);
    },
    
    _setUpdating : function(updating) {
        /// <summary>
        /// Toggle the display elements to indicate if they are being updated or not
        /// </summary>
        /// <param name="updating" type="Boolean">
        /// Whether or not the display should indicated it is being updated
        /// </param>

        this.setStyle(updating);
        
        if (!updating) {
            this._currentCallID = -1;
            this._populated = true;
            this.raisePopulated(this, Sys.EventArgs.Empty);
        }
    },
    
    setStyle : function(updating) {
        /// <summary>
        /// Set the style of the display
        /// </summary>
        /// <param name="updating" type="Boolean">
        /// Whether or not the display is being updated
        /// </param>
        
        var e = this.get_element();
        if (this._setUpdatingCssClass) {
            if (!updating) {
                e.className = this._oldCss;
                this._oldCss = null;
            } else {
                this._oldCss = e.className;
                e.className = this._setUpdatingCssClass;
            }
        }
        
        if (updating && this._clearDuringUpdate) {
            e.innerHTML = "";
        }
    },
    
    get_ClearContentsDuringUpdate : function() {
        /// <value type="Boolean">
        /// Whether the contents of the target should be cleared when an update begins
        /// </value>
        return this._clearDuringUpdate;
    },
    set_ClearContentsDuringUpdate : function(value) {
        if (this._clearDuringUpdate != value) {
            this._clearDuringUpdate = value;
            this.raisePropertyChanged('ClearContentsDuringUpdate');
        }
    },
    
    get_ContextKey : function() {
        /// <value type="String">
        /// An arbitrary string value to be passed to the web method.
        /// For example, if the element to be populated is within a
        /// data-bound repeater, this could be the ID of the current row.
        /// </value>
        return this._contextKey;
    },
    set_ContextKey : function(value) {
        if (this._contextKey != value) {
            this._contextKey = value;
            this.raisePropertyChanged('ContextKey');
        }
    },
    
    get_PopulateTriggerID : function() {
        /// <value type="String" mayBeNull="true" optional="true">
        /// Name of an element that triggers the population of the target when clicked
        /// </value>
        return this._populateTriggerID;
    },
    set_PopulateTriggerID : function(value) {
        if (this._populateTriggerID != value) {
            this._populateTriggerID = value;
            this.raisePropertyChanged('PopulateTriggerID');
        }
    },
    
    get_ServicePath : function() {
        /// <value type="String" mayBeNull="true" optional="true">
        /// The URL of the web service to call.  If the ServicePath is not defined, then we will invoke a PageMethod instead of a web service.
        /// </value>
        return this._servicePath;
    },
    set_ServicePath : function(value) {
        if (this._servicePath != value) {
            this._servicePath = value;
            this.raisePropertyChanged('ServicePath');
        }
    },
    
    get_ServiceMethod : function() {
        /// <value type="String">
        /// The name of the method to call on the page or web service
        /// </value>
        /// <remarks>
        /// The signature of the method must exactly match the following:
        ///    [WebMethod]
        ///    string DynamicPopulateMethod(string contextKey)
        ///    {
        ///        ...
        ///    }
        /// </remarks>
        return this._serviceMethod;
    },
    set_ServiceMethod : function(value) {
        if (this._serviceMethod != value) {
            this._serviceMethod = value;
            this.raisePropertyChanged('ServiceMethod');
        }
    },
    
    get_cacheDynamicResults : function() {
        /// <value type="Boolean" mayBeNull="false">
        /// Whether the results of the dynamic population should be cached and
        /// not fetched again after the first load
        /// </value>
        return this._cacheDynamicResults;
    },
    set_cacheDynamicResults : function(value) {
        if (this._cacheDynamicResults != value) {
            this._cacheDynamicResults = value;
            this.raisePropertyChanged('cacheDynamicResults');
        }
    },
    
    get_UpdatingCssClass : function() {
        /// <value type="String">
        /// The CSS class to apply to the target during asynchronous calls
        /// </value>
        return this._setUpdatingCssClass;
    },
    set_UpdatingCssClass : function(value) {
        if (this._setUpdatingCssClass != value) {
            this._setUpdatingCssClass = value;
            this.raisePropertyChanged('UpdatingCssClass');
        }
    },
    
    get_CustomScript : function() {
        /// <value type="String">
        /// The script to invoke instead of calling a Web or Page method. This script must evaluate to a string value.
        /// </value>
        return this._customScript;
    },   
    set_CustomScript : function(value) {
        if (this._customScript != value) {
            this._customScript = value;
            this.raisePropertyChanged('CustomScript');
        }
    },
    
    add_populating : function(handler) {
        /// <summary>
        /// Add an event handler for the populating event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().addHandler('populating', handler);
    },
    remove_populating : function(handler) {
        /// <summary>
        /// Remove an event handler from the populating event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().removeHandler('populating', handler);
    },
    raisePopulating : function(eventArgs) {
        /// <summary>
        /// Raise the populating event
        /// </summary>
        /// <param name="eventArgs" type="Sys.CancelEventArgs" mayBeNull="false">
        /// Event arguments for the populating event
        /// </param>
        /// <returns />
        
        var handler = this.get_events().getHandler('populating');
        if (handler) {
            handler(this, eventArgs);
        }
    },
    
    add_populated : function(handler) {
        /// <summary>
        /// Add an event handler for the populated event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().addHandler('populated', handler);
    },
    remove_populated : function(handler) {
        /// <summary>
        /// Remove an event handler from the populated event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().removeHandler('populated', handler);
    },
    raisePopulated : function(eventArgs) {
        /// <summary>
        /// Raise the populated event
        /// </summary>
        /// <param name="eventArgs" type="Sys.EventArgs" mayBeNull="false">
        /// Event arguments for the populated event
        /// </param>
        /// <returns />
         
        var handler = this.get_events().getHandler('populated');
        if (handler) {
            handler(this, eventArgs);
        }
    }
}
AjaxControlToolkit.DynamicPopulateBehavior.registerClass('AjaxControlToolkit.DynamicPopulateBehavior', AjaxControlToolkit.BehaviorBase);

//END AjaxControlToolkit.DynamicPopulate.DynamicPopulateBehavior.js
//START AjaxControlToolkit.Compat.DragDrop.DragDropScripts.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../../Common/Common.js" />
/// <reference path="../Timer/Timer.js" />


///////////////////////////////////////////////////////////////////////////////
// IDropSource

Type.registerNamespace('AjaxControlToolkit');

AjaxControlToolkit.IDragSource = function() {
}
AjaxControlToolkit.IDragSource.prototype = {
    // Type get_dragDataType()
    get_dragDataType: function() { throw Error.notImplemented(); },
    // Object getDragData(Context)
    getDragData: function() { throw Error.notImplemented(); },
    // DragMode get_dragMode()
    get_dragMode: function() { throw Error.notImplemented(); },
    // void onDragStart()
    onDragStart: function() { throw Error.notImplemented(); },
    // void onDrag()
    onDrag: function() { throw Error.notImplemented(); },
    // void onDragEnd(Cancelled)
    onDragEnd: function() { throw Error.notImplemented(); }
}
AjaxControlToolkit.IDragSource.registerInterface('AjaxControlToolkit.IDragSource');

///////////////////////////////////////////////////////////////////////////////
// IDropTarget
AjaxControlToolkit.IDropTarget = function() {
}
AjaxControlToolkit.IDropTarget.prototype = {
    get_dropTargetElement: function() { throw Error.notImplemented(); },
    // bool canDrop(DragMode, DataType, Data)
    canDrop: function() { throw Error.notImplemented(); },
    // void drop(DragMode, DataType, Data)
    drop: function() { throw Error.notImplemented(); },
    // void onDragEnterTarget(DragMode, DataType, Data)
    onDragEnterTarget: function() { throw Error.notImplemented(); },
    // void onDragLeaveTarget(DragMode, DataType, Data)
    onDragLeaveTarget: function() { throw Error.notImplemented(); },
    // void onDragInTarget(DragMode, DataType, Data)
    onDragInTarget: function() { throw Error.notImplemented(); }
}
AjaxControlToolkit.IDropTarget.registerInterface('AjaxControlToolkit.IDropTarget');

///////////////////////////////////////////////
// DragMode
//

AjaxControlToolkit.DragMode = function() {
    throw Error.invalidOperation();
}
AjaxControlToolkit.DragMode.prototype = {
    Copy: 0,
    Move: 1
}
AjaxControlToolkit.DragMode.registerEnum('AjaxControlToolkit.DragMode');

////////////////////////////////////////////////////////////////////
// DragDropEventArgs
//

AjaxControlToolkit.DragDropEventArgs = function(dragMode, dragDataType, dragData) {
    this._dragMode = dragMode;
    this._dataType = dragDataType;
    this._data = dragData;
}
AjaxControlToolkit.DragDropEventArgs.prototype = {
    get_dragMode: function() {
        return this._dragMode || null;
    },
    get_dragDataType: function() {
        return this._dataType || null;
    },
    get_dragData: function() {
        return this._data || null;
    }
}
AjaxControlToolkit.DragDropEventArgs.registerClass('AjaxControlToolkit.DragDropEventArgs');


AjaxControlToolkit._DragDropManager = function() {
    this._instance = null;
    this._events =  null;
}
AjaxControlToolkit._DragDropManager.prototype = {

    add_dragStart: function(handler) {
        this.get_events().addHandler('dragStart', handler);
    },
    remove_dragStart: function(handler) {
        this.get_events().removeHandler('dragStart', handler);
    },
    
    get_events: function() {
    // todo: doc comments. this one is commented out (two //) due to a bug with the preprocessor.
        // <value type="Sys.EventHandlerList">
        // </value>
        if (!this._events) {
            this._events = new Sys.EventHandlerList();
        }
        return this._events;
    },
    
    add_dragStop: function(handler) {
        this.get_events().addHandler('dragStop', handler);
    },
    remove_dragStop: function(handler) {
        this.get_events().removeHandler('dragStop', handler);
    },
    
    _getInstance: function() {
        if (!this._instance) {
            if (Sys.Browser.agent === Sys.Browser.InternetExplorer) {
                this._instance = new AjaxControlToolkit.IEDragDropManager();
            }
            else {
                this._instance = new AjaxControlToolkit.GenericDragDropManager();
            }
            this._instance.initialize();
            this._instance.add_dragStart(Function.createDelegate(this, this._raiseDragStart));
            this._instance.add_dragStop(Function.createDelegate(this, this._raiseDragStop));
        }
        return this._instance;
    },
    
    startDragDrop: function(dragSource, dragVisual, context) {
        this._getInstance().startDragDrop(dragSource, dragVisual, context);
    },
    
    registerDropTarget: function(target) {
        this._getInstance().registerDropTarget(target);
    },
    
    unregisterDropTarget: function(target) {
        this._getInstance().unregisterDropTarget(target);
    },
    
    dispose: function() {
        delete this._events;
        Sys.Application.unregisterDisposableObject(this);
        Sys.Application.removeComponent(this);
    },
    
    _raiseDragStart: function(sender, eventArgs) {
        var handler = this.get_events().getHandler('dragStart');
        if(handler) {
            handler(this, eventArgs);
        }
    },
    
    _raiseDragStop: function(sender, eventArgs) {
        var handler = this.get_events().getHandler('dragStop');
        if(handler) {
            handler(this, eventArgs);
        }
    }
}
AjaxControlToolkit._DragDropManager.registerClass('AjaxControlToolkit._DragDropManager');
AjaxControlToolkit.DragDropManager = new AjaxControlToolkit._DragDropManager();


AjaxControlToolkit.IEDragDropManager = function() {
    AjaxControlToolkit.IEDragDropManager.initializeBase(this);
    
    this._dropTargets = null;
    // Radius of the cursor used to determine what drop target we 
    // are hovering. Anything below the cursor's zone may be a 
    // potential drop target.
    this._radius = 10;
    this._activeDragVisual = null;
    this._activeContext = null;
    this._activeDragSource = null;
    this._underlyingTarget = null;
    this._oldOffset = null;
    this._potentialTarget = null;
    this._isDragging = false;
    this._mouseUpHandler = null;
    this._documentMouseMoveHandler = null;
    this._documentDragOverHandler = null;
    this._dragStartHandler = null;
    this._mouseMoveHandler = null;
    this._dragEnterHandler = null;
    this._dragLeaveHandler = null;
    this._dragOverHandler = null;
    this._dropHandler = null;
}
AjaxControlToolkit.IEDragDropManager.prototype = {

    add_dragStart : function(handler) {
        this.get_events().addHandler("dragStart", handler);
    },
    
    remove_dragStart : function(handler) {
        this.get_events().removeHandler("dragStart", handler);
    },
    
    add_dragStop : function(handler) {
        this.get_events().addHandler("dragStop", handler);
    },
    
    remove_dragStop : function(handler) {
        this.get_events().removeHandler("dragStop", handler);
    },
    
    initialize : function() {
        AjaxControlToolkit.IEDragDropManager.callBaseMethod(this, 'initialize');
        this._mouseUpHandler = Function.createDelegate(this, this._onMouseUp);
        this._documentMouseMoveHandler = Function.createDelegate(this, this._onDocumentMouseMove);
        this._documentDragOverHandler = Function.createDelegate(this, this._onDocumentDragOver);
        this._dragStartHandler = Function.createDelegate(this, this._onDragStart);
        this._mouseMoveHandler = Function.createDelegate(this, this._onMouseMove);
        this._dragEnterHandler = Function.createDelegate(this, this._onDragEnter);
        this._dragLeaveHandler = Function.createDelegate(this, this._onDragLeave);
        this._dragOverHandler = Function.createDelegate(this, this._onDragOver);
        this._dropHandler = Function.createDelegate(this, this._onDrop);
    },
    
    
    dispose : function() {
        if(this._dropTargets) {
            for (var i = 0; i < this._dropTargets; i++) {
                this.unregisterDropTarget(this._dropTargets[i]);
            }
            this._dropTargets = null;
        }
        
        AjaxControlToolkit.IEDragDropManager.callBaseMethod(this, 'dispose');
    },
    

    startDragDrop : function(dragSource, dragVisual, context) {
        var ev = window._event;
        
        // Don't allow drag and drop if there is another active drag operation going on.
        if (this._isDragging) {
            return;
        }
        
        this._underlyingTarget = null;
        this._activeDragSource = dragSource;
        this._activeDragVisual = dragVisual;
        this._activeContext = context;
        
        var mousePosition = { x: ev.clientX, y: ev.clientY };
        
        // By default we use absolute positioning, unless a different type 
        // of positioning is set explicitly.
        dragVisual.originalPosition = dragVisual.style.position;
        dragVisual.style.position = "absolute";
        
        document._lastPosition = mousePosition;
        dragVisual.startingPoint = mousePosition;
        var scrollOffset = this.getScrollOffset(dragVisual, /* recursive */ true);
        
        dragVisual.startingPoint = this.addPoints(dragVisual.startingPoint, scrollOffset);
        
        if (dragVisual.style.position == "absolute") {
            dragVisual.startingPoint = this.subtractPoints(dragVisual.startingPoint, $common.getLocation(dragVisual));
        }
        else {
            var left = parseInt(dragVisual.style.left);
            var top = parseInt(dragVisual.style.top);
            if (isNaN(left)) left = "0";
            if (isNaN(top)) top = "0";
            
            dragVisual.startingPoint = this.subtractPoints(dragVisual.startingPoint, { x: left, y: top });
        }
        
        // Monitor DOM changes.
        this._prepareForDomChanges();
        dragSource.onDragStart();
        var eventArgs = new AjaxControlToolkit.DragDropEventArgs(
            dragSource.get_dragMode(),
            dragSource.get_dragDataType(),
            dragSource.getDragData(context));
        var handler = this.get_events().getHandler('dragStart');
        if(handler) handler(this,eventArgs);
        this._recoverFromDomChanges();
        
        this._wireEvents();
        
        this._drag(/* isInitialDrag */ true);
    },
    
    
    _stopDragDrop : function(cancelled) {
        var ev = window._event;
        if (this._activeDragSource != null) {
            this._unwireEvents();
        
            if (!cancelled) {
                // The drag operation is cancelled if there 
                // is no drop target.
                cancelled = (this._underlyingTarget == null);
            }

            if (!cancelled && this._underlyingTarget != null) {
                this._underlyingTarget.drop(this._activeDragSource.get_dragMode(), this._activeDragSource.get_dragDataType(),
                    this._activeDragSource.getDragData(this._activeContext));
            }

            this._activeDragSource.onDragEnd(cancelled);
            var handler = this.get_events().getHandler('dragStop');
            if(handler) handler(this,Sys.EventArgs.Empty);
            
            this._activeDragVisual.style.position = this._activeDragVisual.originalPosition;
        
            this._activeDragSource = null;
            this._activeContext = null;
            this._activeDragVisual = null;
            this._isDragging = false;
            this._potentialTarget = null;
            ev.preventDefault();
        }
    },
    
    _drag : function(isInitialDrag) {
        var ev = window._event;
        var mousePosition = { x: ev.clientX, y: ev.clientY };
        
        // NOTE: We store the event object to be able to determine the current 
        // mouse position in Mozilla in other event handlers such as keydown.
        document._lastPosition = mousePosition;
        
        var scrollOffset = this.getScrollOffset(this._activeDragVisual, /* recursive */ true);
        var position = this.addPoints(this.subtractPoints(mousePosition, this._activeDragVisual.startingPoint), scrollOffset);
        
        // Check if the visual moved at all.
        if (!isInitialDrag && parseInt(this._activeDragVisual.style.left) == position.x && parseInt(this._activeDragVisual.style.top) == position.y) {
            return;
        }
        
        $common.setLocation(this._activeDragVisual, position);
        
        // Monitor DOM changes.
        this._prepareForDomChanges();
        this._activeDragSource.onDrag();
        this._recoverFromDomChanges();
        
        // Find a potential target.
        this._potentialTarget = this._findPotentialTarget(this._activeDragSource, this._activeDragVisual);
        
        var movedToOtherTarget = (this._potentialTarget != this._underlyingTarget || this._potentialTarget == null);
        // Check if we are leaving an underlying target.
        if (movedToOtherTarget && this._underlyingTarget != null) {
            this._leaveTarget(this._activeDragSource, this._underlyingTarget);
        }
        
        if (this._potentialTarget != null) {
            // Check if we are entering a new target.
            if (movedToOtherTarget) {
                this._underlyingTarget = this._potentialTarget;
                
                // Enter the new target.
                this._enterTarget(this._activeDragSource, this._underlyingTarget);
            }
            else {
                this._moveInTarget(this._activeDragSource, this._underlyingTarget);
            }
        }
        else {
            this._underlyingTarget = null;
        }
    },
    
    
    _wireEvents : function() {
        $addHandler(document, "mouseup", this._mouseUpHandler);
        $addHandler(document, "mousemove", this._documentMouseMoveHandler);
        $addHandler(document.body, "dragover", this._documentDragOverHandler);
        
        $addHandler(this._activeDragVisual, "dragstart", this._dragStartHandler);
        $addHandler(this._activeDragVisual, "dragend", this._mouseUpHandler);
        $addHandler(this._activeDragVisual, "drag", this._mouseMoveHandler);
    },
    
    
    _unwireEvents : function() {
        $removeHandler(this._activeDragVisual, "drag", this._mouseMoveHandler);
        $removeHandler(this._activeDragVisual, "dragend", this._mouseUpHandler);
        $removeHandler(this._activeDragVisual, "dragstart", this._dragStartHandler);

        $removeHandler(document.body, "dragover", this._documentDragOverHandler);
        $removeHandler(document, "mousemove", this._documentMouseMoveHandler);
        $removeHandler(document, "mouseup", this._mouseUpHandler);
    },
    
    
    registerDropTarget : function(dropTarget) {
        if (this._dropTargets == null) {
            this._dropTargets = [];
        }
        Array.add(this._dropTargets, dropTarget);
        
        this._wireDropTargetEvents(dropTarget);
    },
    
    
    unregisterDropTarget : function(dropTarget) {
        this._unwireDropTargetEvents(dropTarget);
        if (this._dropTargets) {
            Array.remove(this._dropTargets, dropTarget);
        }
    },
    
    
    _wireDropTargetEvents : function(dropTarget) {
        var associatedElement = dropTarget.get_dropTargetElement();
        associatedElement._dropTarget = dropTarget;
        $addHandler(associatedElement, "dragenter",  this._dragEnterHandler);
        $addHandler(associatedElement, "dragleave",  this._dragLeaveHandler);
        $addHandler(associatedElement, "dragover", this._dragOverHandler);
        $addHandler(associatedElement, "drop", this._dropHandler);
    },
    
    
    _unwireDropTargetEvents : function(dropTarget) {
        var associatedElement = dropTarget.get_dropTargetElement();
        // make sure that the handlers are not removed twice
        if(associatedElement._dropTarget)
        {
            associatedElement._dropTarget = null;
            $removeHandler(associatedElement, "dragenter",  this._dragEnterHandler);
            $removeHandler(associatedElement, "dragleave",  this._dragLeaveHandler);
            $removeHandler(associatedElement, "dragover", this._dragOverHandler);
            $removeHandler(associatedElement, "drop", this._dropHandler);
        }
    },
    
    
    _onDragStart : function(ev) {
        window._event = ev;
        document.selection.empty();
        
        var dt = ev.dataTransfer;
        if(!dt && ev.rawEvent) dt = ev.rawEvent.dataTransfer;
        
        var dataType = this._activeDragSource.get_dragDataType().toLowerCase();
        var data = this._activeDragSource.getDragData(this._activeContext);
        
        if (data) {
            // TODO: How do we want to deal with 'non-compatible types'?
            if (dataType != "text" && dataType != "url") {
                dataType = "text";
                
                if (data.innerHTML != null) {
                    data = data.innerHTML;
                }
            }
            
            dt.effectAllowed = "move";
            dt.setData(dataType, data.toString());
        }
    },
    
    _onMouseUp : function(ev) {
        window._event = ev;
        this._stopDragDrop(false);
    },
    
    _onDocumentMouseMove : function(ev) {
        window._event = ev;
        this._dragDrop();
    },

    _onDocumentDragOver : function(ev) {
        window._event = ev;
        if(this._potentialTarget) ev.preventDefault();
        //ev.returnValue = (_potentialTarget == null);
    },
    
    _onMouseMove : function(ev) {
        window._event = ev;
        this._drag();
    },
    
    _onDragEnter : function(ev) {
        window._event = ev;
        if (this._isDragging) {
            ev.preventDefault();
            //ev.returnValue = false;
        }
        else {
            // An external object is dragged to the drop target.
            var dataObjects = AjaxControlToolkit.IEDragDropManager._getDataObjectsForDropTarget(this._getDropTarget(ev.target));
            for (var i = 0; i < dataObjects.length; i++) {
                this._dropTarget.onDragEnterTarget(AjaxControlToolkit.DragMode.Copy, dataObjects[i].type, dataObjects[i].value);
            }
        }
    },
    
    _onDragLeave : function(ev) {
        window._event = ev;
        if (this._isDragging) {
            ev.preventDefault();
            //ev.returnValue = false;
        }
        else {
            // An external object is dragged to the drop target.
            var dataObjects = AjaxControlToolkit.IEDragDropManager._getDataObjectsForDropTarget(this._getDropTarget(ev.target));
            for (var i = 0; i < dataObjects.length; i++) {
                this._dropTarget.onDragLeaveTarget(AjaxControlToolkit.DragMode.Copy, dataObjects[i].type, dataObjects[i].value);
            }
        }
    },
    
    _onDragOver : function(ev) {
        window._event = ev;
        if (this._isDragging) {
            ev.preventDefault();
            //ev.returnValue = false;
        }
        else {
            // An external object is dragged over the drop target.
            var dataObjects = AjaxControlToolkit.IEDragDropManager._getDataObjectsForDropTarget(this._getDropTarget(ev.target));
            for (var i = 0; i < dataObjects.length; i++) {
                this._dropTarget.onDragInTarget(AjaxControlToolkit.DragMode.Copy, dataObjects[i].type, dataObjects[i].value);
            }
        }
    },
    
    _onDrop : function(ev) {
        window._event = ev;
        if (!this._isDragging) {
            // An external object is dropped on the drop target.
            var dataObjects = AjaxControlToolkit.IEDragDropManager._getDataObjectsForDropTarget(this._getDropTarget(ev.target));
            for (var i = 0; i < dataObjects.length; i++) {
                this._dropTarget.drop(AjaxControlToolkit.DragMode.Copy, dataObjects[i].type, dataObjects[i].value);
            }
        }
        ev.preventDefault();
        //ev.returnValue = false;
    },
    
    _getDropTarget : function(element) {
        while (element) {
            if (element._dropTarget != null) {
                return element._dropTarget;
            }
            element = element.parentNode;
        }
        return null;
    },
    
    _dragDrop : function() {
        if (this._isDragging) {
            return;
        }
        
        this._isDragging = true;
        this._activeDragVisual.dragDrop();
        document.selection.empty();
    },
    
    _moveInTarget : function(dragSource, dropTarget) {
        // Monitor DOM changes.
        this._prepareForDomChanges();
        dropTarget.onDragInTarget(dragSource.get_dragMode(), dragSource.get_dragDataType(), dragSource.getDragData(this._activeContext));
        this._recoverFromDomChanges();
    },
    
    _enterTarget : function(dragSource, dropTarget) {
        // Monitor DOM changes.
        this._prepareForDomChanges();
        dropTarget.onDragEnterTarget(dragSource.get_dragMode(), dragSource.get_dragDataType(), dragSource.getDragData(this._activeContext));
        this._recoverFromDomChanges();
    },
    
    _leaveTarget : function(dragSource, dropTarget) {
        // Monitor DOM changes.
        this._prepareForDomChanges();
        dropTarget.onDragLeaveTarget(dragSource.get_dragMode(), dragSource.get_dragDataType(), dragSource.getDragData(this._activeContext));
        this._recoverFromDomChanges();
    },
    
    _findPotentialTarget : function(dragSource, dragVisual) {
        var ev = window._event;

        if (this._dropTargets == null) {
            return null;
        }
        
        var type = dragSource.get_dragDataType();
        var mode = dragSource.get_dragMode();
        var data = dragSource.getDragData(this._activeContext);

        // Get the current cursor location.
        var scrollOffset = this.getScrollOffset(document.body, /* recursive */ true);
        var x = ev.clientX + scrollOffset.x;
        var y = ev.clientY + scrollOffset.y;
        var cursorRect = { x: x - this._radius, y: y - this._radius, width: this._radius * 2, height: this._radius * 2 };
        
        // Find any targets near the current cursor location.
        var targetRect;
        for (var i = 0; i < this._dropTargets.length; i++) {
            targetRect = $common.getBounds(this._dropTargets[i].get_dropTargetElement());
            if ($common.overlaps(cursorRect, targetRect) && this._dropTargets[i].canDrop(mode, type, data)) {
                return this._dropTargets[i];
            }
        }
        
        return null;
    },
    
    _prepareForDomChanges : function() {
        this._oldOffset = $common.getLocation(this._activeDragVisual);
    },
    
    _recoverFromDomChanges : function() {
        var newOffset = $common.getLocation(this._activeDragVisual);
        if (this._oldOffset.x != newOffset.x || this._oldOffset.y != newOffset.y) {
            this._activeDragVisual.startingPoint = this.subtractPoints(this._activeDragVisual.startingPoint, this.subtractPoints(this._oldOffset, newOffset));
            scrollOffset = this.getScrollOffset(this._activeDragVisual, /* recursive */ true);
            var position = this.addPoints(this.subtractPoints(document._lastPosition, this._activeDragVisual.startingPoint), scrollOffset);
            $common.setLocation(this._activeDragVisual, position);
        }
    },
    
    addPoints : function(p1, p2) {
        return { x: p1.x + p2.x, y: p1.y + p2.y };
    },
    
    subtractPoints : function(p1, p2) {
        return { x: p1.x - p2.x, y: p1.y - p2.y };
    },
    
    // -- Drag and drop helper methods.
    getScrollOffset : function(element, recursive) {
        var left = element.scrollLeft;
        var top = element.scrollTop;
        if (recursive) {
            var parent = element.parentNode;
            while (parent != null && parent.scrollLeft != null) {
                left += parent.scrollLeft;
                top += parent.scrollTop;
                // Don't include anything below the body.
                if (parent == document.body && (left != 0 && top != 0))
                    break;
                parent = parent.parentNode;
            }
        }
        return { x: left, y: top };
    },
    
    getBrowserRectangle : function() {
        var width = window.innerWidth;
        var height = window.innerHeight;
        if (width == null) {
            width = document.body.clientWidth;
        }
        if (height == null) {
            height = document.body.clientHeight;
        }
        
        return { x: 0, y: 0, width: width, height: height };
    },
    
    getNextSibling : function(item) {
        for (item = item.nextSibling; item != null; item = item.nextSibling) {
            if (item.innerHTML != null) {
                return item;
            }
        }
        return null;
    },
    
    hasParent : function(element) {
        return (element.parentNode != null && element.parentNode.tagName != null);
    }
}
AjaxControlToolkit.IEDragDropManager.registerClass('AjaxControlToolkit.IEDragDropManager', Sys.Component);

AjaxControlToolkit.IEDragDropManager._getDataObjectsForDropTarget = function(dropTarget) {
    if (dropTarget == null) {
        return [];
    }
    var ev = window._event;
    var dataObjects = [];
    var dataTypes = [ "URL", "Text" ];
    var data;
    for (var i = 0; i < dataTypes.length; i++) {
        var dt = ev.dataTransfer;
        if(!dt && ev.rawEvent) dt = ev.rawEvent.dataTransfer;
        data = dt.getData(dataTypes[i]);
        if (dropTarget.canDrop(AjaxControlToolkit.DragMode.Copy, dataTypes[i], data)) {
            if (data) {
                Array.add(dataObjects, { type : dataTypes[i], value : data });
            }
        }
    }

    return dataObjects;
}


AjaxControlToolkit.GenericDragDropManager = function() {
    AjaxControlToolkit.GenericDragDropManager.initializeBase(this);
    
    this._dropTargets = null;
    // Radius of the cursor used to determine what drop target we 
    // are hovering. Anything below the cursor's zone may be a 
    // potential drop target.
    this._scrollEdgeConst = 40;
    this._scrollByConst = 10;
    this._scroller = null;
    this._scrollDeltaX = 0;
    this._scrollDeltaY = 0;
    this._activeDragVisual = null;
    this._activeContext = null;
    this._activeDragSource = null;
    this._oldOffset = null;
    this._potentialTarget = null;
    this._mouseUpHandler = null;
    this._mouseMoveHandler = null;
    this._keyPressHandler = null;
    this._scrollerTickHandler = null;
}
AjaxControlToolkit.GenericDragDropManager.prototype = {
   
    initialize : function() {
        AjaxControlToolkit.GenericDragDropManager.callBaseMethod(this, "initialize");
        this._mouseUpHandler = Function.createDelegate(this, this._onMouseUp);
        this._mouseMoveHandler = Function.createDelegate(this, this._onMouseMove);
        this._keyPressHandler = Function.createDelegate(this, this._onKeyPress);
        this._scrollerTickHandler = Function.createDelegate(this, this._onScrollerTick);
        if (Sys.Browser.agent === Sys.Browser.Safari) {
            AjaxControlToolkit.GenericDragDropManager.__loadSafariCompatLayer(this);
        }
        this._scroller = new Sys.Timer();
        this._scroller.set_interval(10);
        this._scroller.add_tick(this._scrollerTickHandler);
    },

    startDragDrop : function(dragSource, dragVisual, context) {
        this._activeDragSource = dragSource;
        this._activeDragVisual = dragVisual;
        this._activeContext = context;
        
        AjaxControlToolkit.GenericDragDropManager.callBaseMethod(this, "startDragDrop", [dragSource, dragVisual, context]);
    },
    
    _stopDragDrop : function(cancelled) {
        this._scroller.set_enabled(false);
        
        AjaxControlToolkit.GenericDragDropManager.callBaseMethod(this, "_stopDragDrop", [cancelled]);
    },
    
    _drag : function(isInitialDrag) {
        AjaxControlToolkit.GenericDragDropManager.callBaseMethod(this, "_drag", [isInitialDrag]);
        
        this._autoScroll();
    },
    
    _wireEvents : function() {
        $addHandler(document, "mouseup", this._mouseUpHandler);
        $addHandler(document, "mousemove", this._mouseMoveHandler);
        $addHandler(document, "keypress", this._keyPressHandler);
    },
    
    _unwireEvents : function() {
        $removeHandler(document, "keypress", this._keyPressHandler);
        $removeHandler(document, "mousemove", this._mouseMoveHandler);
        $removeHandler(document, "mouseup", this._mouseUpHandler);
    },
    
    _wireDropTargetEvents : function(dropTarget) {
        //
    },
    
    _unwireDropTargetEvents : function(dropTarget) {
        //
    },
    
    _onMouseUp : function(e) {
        window._event = e;
        this._stopDragDrop(false);
    },
    
    _onMouseMove : function(e) {
        window._event = e;
        this._drag();
    },
    
    _onKeyPress : function(e) {
        window._event = e;
        // Escape.
        var k = e.keyCode ? e.keyCode : e.rawEvent.keyCode;
        if (k == 27) {
            this._stopDragDrop(/* cancel */ true);
        }
    },
    
    _autoScroll : function() {
        var ev = window._event;
        var browserRect = this.getBrowserRectangle();
        if (browserRect.width > 0) {
            this._scrollDeltaX = this._scrollDeltaY = 0;
            if (ev.clientX < browserRect.x + this._scrollEdgeConst) this._scrollDeltaX = -this._scrollByConst;
            else if (ev.clientX > browserRect.width - this._scrollEdgeConst) this._scrollDeltaX = this._scrollByConst;
            if (ev.clientY < browserRect.y + this._scrollEdgeConst) this._scrollDeltaY = -this._scrollByConst;
            else if (ev.clientY > browserRect.height - this._scrollEdgeConst) this._scrollDeltaY = this._scrollByConst;
            if (this._scrollDeltaX != 0 || this._scrollDeltaY != 0) {
                this._scroller.set_enabled(true);
            }
            else {
                this._scroller.set_enabled(false);
            }
        }
    },
    
    _onScrollerTick : function() {
        var oldLeft = document.body.scrollLeft;
        var oldTop = document.body.scrollTop;
        window.scrollBy(this._scrollDeltaX, this._scrollDeltaY);
        var newLeft = document.body.scrollLeft;
        var newTop = document.body.scrollTop;
        
        var dragVisual = this._activeDragVisual;
        var position = { x: parseInt(dragVisual.style.left) + (newLeft - oldLeft), y: parseInt(dragVisual.style.top) + (newTop - oldTop) };
        $common.setLocation(dragVisual, position);
    }
}
AjaxControlToolkit.GenericDragDropManager.registerClass('AjaxControlToolkit.GenericDragDropManager', AjaxControlToolkit.IEDragDropManager);


if (Sys.Browser.agent === Sys.Browser.Safari) {
    AjaxControlToolkit.GenericDragDropManager.__loadSafariCompatLayer = function(ddm) {
        ddm._getScrollOffset = ddm.getScrollOffset;

        ddm.getScrollOffset = function(element, recursive) {
            return { x: 0, y: 0 };
        }

        ddm._getBrowserRectangle = ddm.getBrowserRectangle;

        ddm.getBrowserRectangle = function() {
            var browserRect = ddm._getBrowserRectangle();
            
            var offset = ddm._getScrollOffset(document.body, true);
            return { x: browserRect.x + offset.x, y: browserRect.y + offset.y,
                width: browserRect.width + offset.x, height: browserRect.height + offset.y };
        }
    }
}

//END AjaxControlToolkit.Compat.DragDrop.DragDropScripts.js
//START AjaxControlToolkit.DragPanel.FloatingBehavior.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../ExtenderBase/BaseScripts.js" />
/// <reference path="../Common/Common.js" />
/// <reference path="../Compat/Timer/Timer.js" />
/// <reference path="../Compat/DragDrop/DragDropScripts.js" />


AjaxControlToolkit.FloatingBehavior = function(element) {
    AjaxControlToolkit.FloatingBehavior.initializeBase(this,[element]);
    
    var _handle;
    var _location;
    var _dragStartLocation;
    var _profileProperty;
    var _profileComponent;
    
    var _mouseDownHandler = Function.createDelegate(this, mouseDownHandler);
    
    this.add_move = function(handler) {
        this.get_events().addHandler('move', handler);
    }
    this.remove_move = function(handler) {
        this.get_events().removeHandler('move', handler);
    }
    
    this.get_handle = function() {
        return _handle;
    }
    this.set_handle = function(value) {
        if (_handle != null) {
            $removeHandler(_handle, "mousedown", _mouseDownHandler);            
        }
    
        _handle = value;
        $addHandler(_handle, "mousedown", _mouseDownHandler);        
    }
    
    this.get_profileProperty = function() {
        return _profileProperty;
    }
    this.set_profileProperty = function(value) {
        //##DEBUG Sys.Debug.assert(!this.get_isInitialized() || _profileProperty === value, "You cannot change the profile property after initialization.");
        _profileProperty = value;
    }
    
    this.get_profileComponent = function() {
        return _profileComponent;
    }
    this.set_profileComponent = function(value) {
        _profileComponent = value;
    }
    
    this.get_location = function() {
        return _location;
    }
    this.set_location = function(value) {
        if (_location != value) {
            _location = value;
            if (this.get_isInitialized()) {                
                $common.setLocation(this.get_element(), _location);
            }
            this.raisePropertyChanged('location');
        }
    }
    
    this.initialize = function() {
        AjaxControlToolkit.FloatingBehavior.callBaseMethod(this, 'initialize');
        AjaxControlToolkit.DragDropManager.registerDropTarget(this);

        var el = this.get_element();

        
        if (!_location) {                       
            _location = $common.getLocation(el);
        }
        
        el.style.position = "fixed";
        $common.setLocation(el, _location);

//        var p = this.get_profileProperty();
//        if(p) {
//            var b = new Sys.Preview.Binding();
//            b.beginUpdate();
//            b.set_target(this);
//            b.set_property("location");
//            var profile = this.get_profileComponent();
//            if(!profile) profile = Sys.Preview.Services.Components.Profile.instance;
//            b.set_dataContext(profile);
//            b.set_dataPath(p);
//            b.set_direction(Sys.Preview.BindingDirection.InOut);            
//                      
//            // we must hook into the loaded event since the profile may be loaded and the location property
//            // will be different. But profile doesnt raise a change notificaiton for every property after a load
//            var a = new Sys.Preview.InvokeMethodAction();
//            a.beginUpdate();
//            a.set_eventSource(profile);
//            a.set_eventName("loadComplete");
//            a.set_target(b);
//            a.set_method("evaluateIn");

//            a.endUpdate();
//            b.endUpdate();

//            this._binding = b;
//            this._action = a;
//        }
    }
    
    this.dispose = function() {
        AjaxControlToolkit.DragDropManager.unregisterDropTarget(this);
        if (_handle && _mouseDownHandler) {
            $removeHandler(_handle, "mousedown", _mouseDownHandler);
            //_handle.detachEvent("onmousedown", _mouseDownHandler);
        }
        _mouseDownHandler = null;
        AjaxControlToolkit.FloatingBehavior.callBaseMethod(this, 'dispose');
    }
    
    this.checkCanDrag = function(element) {
        var undraggableTagNames = ["input", "button", "select", "textarea", "label"];
        var tagName = element.tagName;
        
        if ((tagName.toLowerCase() == "a") && (element.href != null) && (element.href.length > 0)) {
            return false;
        }
        if (Array.indexOf(undraggableTagNames, tagName.toLowerCase()) > -1) {
            return false;
        }
        return true;
    }
    
    function mouseDownHandler(ev) {
        window._event = ev;
        var el = this.get_element();
        
        if (this.checkCanDrag(ev.target)) {
            _dragStartLocation = $common.getLocation(el);
            
            ev.preventDefault();
            
            this.startDragDrop(el);
        }
    }

    // Type get_dataType()
    this.get_dragDataType = function() {
        return "_floatingObject";
    }
    
    // Object get_data(Context)
    this.getDragData = function(context) {
        return null;
    }
    
    // DragMode get_dragMode()
    this.get_dragMode = function() {
        return AjaxControlToolkit.DragMode.Move;
    }
    
    // void onDragStart()
    this.onDragStart = function() { }
    
    // void onDrag()
    this.onDrag = function() { }
    
    // void onDragEnd(Canceled)
    this.onDragEnd = function(canceled) {
        if (!canceled) {
            var handler = this.get_events().getHandler('move');
            if(handler) {
                var cancelArgs = new Sys.CancelEventArgs();
                handler(this, cancelArgs);
                canceled = cancelArgs.get_cancel();
            }            
        }
        
        var el = this.get_element();
        if (canceled) {
            // Restore the position of the control.
            $common.setLocation(el, _dragStartLocation);
        } else {
            _location = $common.getLocation(el);
            this.raisePropertyChanged('location');
        }
    }
    
    this.startDragDrop = function(dragVisual) {
        AjaxControlToolkit.DragDropManager.startDragDrop(this, dragVisual, null);
    }
    
    this.get_dropTargetElement = function() {
        return document.body;
    }
    
    // bool canDrop(DragMode, DataType, Data)
    this.canDrop = function(dragMode, dataType, data) {
        return (dataType == "_floatingObject");
    }
    
    // void drop(DragMode, DataType, Data)
    this.drop = function(dragMode, dataType, data) {}
    
    // void onDragEnterTarget(DragMode, DataType, Data)
    this.onDragEnterTarget = function(dragMode, dataType, data) {}
    
    // void onDragLeaveTarget(DragMode, DataType, Data)
    this.onDragLeaveTarget = function(dragMode, dataType, data) {}
    
    // void onDragInTarget(DragMode, DataType, Data)
    this.onDragInTarget = function(dragMode, dataType, data) {}
}
//AjaxControlToolkit.FloatingBehavior.descriptor = {
//    properties: [   {name: "profileProperty", type: String},
//                    {name: "profileComponent", type: Object},
//                    {name: "dragData", type: Object, readOnly: true},
//                    {name: "dragDataType", type: String, readOnly: true},
//                    {name: "dragMode", type: AjaxControlToolkit.DragMode, readOnly: true},
//                    {name: "dropTargetElement", type: Object, readOnly: true},
//                    {name: "handle", type: Sys.UI.DomElement},
//                    {name: "location", type: String} ],
//    events: [   {name: "move"} ]
//}
AjaxControlToolkit.FloatingBehavior.registerClass('AjaxControlToolkit.FloatingBehavior', AjaxControlToolkit.BehaviorBase, AjaxControlToolkit.IDragSource, AjaxControlToolkit.IDropTarget, Sys.IDisposable);

//END AjaxControlToolkit.DragPanel.FloatingBehavior.js
//START AjaxControlToolkit.ModalPopup.ModalPopupBehavior.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../ExtenderBase/BaseScripts.js" />
/// <reference path="../Common/Common.js" />
/// <reference path="../DynamicPopulate/DynamicPopulateBehavior.js" />
/// <reference path="../RoundedCorners/RoundedCornersBehavior.js" />
/// <reference path="../Compat/Timer/Timer.js" />
/// <reference path="../DropShadow/DropShadowBehavior.js" />
/// <reference path="../Compat/DragDrop/DragDropScripts.js" />
/// <reference path="../DragPanel/FloatingBehavior.js" />


Type.registerNamespace('AjaxControlToolkit');

AjaxControlToolkit.ModalPopupRepositionMode = function() {
    /// <summary>
    /// The ModalPopupRepositionMode enumeration describes how the modal popup repositions
    /// </summary>
    /// <field name="None" type="Number" integer="true" />
    /// <field name="RepositionOnWindowResize" type="Number" integer="true" />
    /// <field name="RepositionOnWindowScroll" type="Number" integer="true" />
    /// <field name="RepositionOnWindowResizeAndScroll" type="Number" integer="true" />
    throw Error.invalidOperation();
}
AjaxControlToolkit.ModalPopupRepositionMode.prototype = {
    None : 0,
    RepositionOnWindowResize : 1,
    RepositionOnWindowScroll : 2,
    RepositionOnWindowResizeAndScroll : 3
}
AjaxControlToolkit.ModalPopupRepositionMode.registerEnum('AjaxControlToolkit.ModalPopupRepositionMode');


AjaxControlToolkit.ModalPopupBehavior = function(element) {
    /// <summary>
    /// The ModalPopupBehavior is used to display the target element as a modal dialog
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// DOM Element the behavior is associated with
    /// </param>
    AjaxControlToolkit.ModalPopupBehavior.initializeBase(this, [element]);
    
    // Properties
    this._PopupControlID = null;
    this._PopupDragHandleControlID = null;
    this._BackgroundCssClass = null;
    this._DropShadow = false;
    this._Drag = false;    
    this._OkControlID = null;
    this._CancelControlID = null;
    this._OnOkScript = null;
    this._OnCancelScript = null;
    this._xCoordinate = -1;
    this._yCoordinate = -1;
    this._repositionMode = AjaxControlToolkit.ModalPopupRepositionMode.RepositionOnWindowResizeAndScroll;

    // Variables
    this._backgroundElement = null;
    this._foregroundElement = null;
    this._relativeOrAbsoluteParentElement = null;
    this._popupElement = null;
    this._dragHandleElement = null;
    this._showHandler = null;
    this._okHandler = null;
    this._cancelHandler = null;
    this._scrollHandler = null;
    this._resizeHandler = null;
    this._windowHandlersAttached = false;
    this._dropShadowBehavior = null;
    this._dragBehavior = null;
    this._isIE6 = false;

    this._saveTabIndexes = new Array();
    this._saveDesableSelect = new Array();
    this._tagWithTabIndex = new Array('A','AREA','BUTTON','INPUT','OBJECT','SELECT','TEXTAREA','IFRAME');
}
AjaxControlToolkit.ModalPopupBehavior.prototype = {
    initialize : function() {
        /// <summary>
        /// Initialize the behavior
        /// </summary>
        
        /*
            <div superpopup - drag container resizable><div -- drag handle\dropshadow foreground></div></div>
        */
        AjaxControlToolkit.ModalPopupBehavior.callBaseMethod(this, 'initialize');
        this._isIE6 = (Sys.Browser.agent == Sys.Browser.InternetExplorer && Sys.Browser.version < 7);
        if(this._PopupDragHandleControlID)
            this._dragHandleElement = $get(this._PopupDragHandleControlID);

        this._popupElement = $get(this._PopupControlID);
        if(this._DropShadow)
        {
            this._foregroundElement = document.createElement('div');
            this._foregroundElement.id = this.get_id() + '_foregroundElement';
            this._popupElement.parentNode.appendChild(this._foregroundElement);
            this._foregroundElement.appendChild(this._popupElement);
        }
        else
        {
            this._foregroundElement = this._popupElement;
        }
        this._backgroundElement = document.createElement('div');
        this._backgroundElement.id = this.get_id() + '_backgroundElement';
        this._backgroundElement.style.display = 'none';
        this._backgroundElement.style.position = 'fixed';
        this._backgroundElement.style.left = '0px';
        this._backgroundElement.style.top = '0px';
        // Want zIndex to big enough that the background sits above everything else
        // CSS 2.1 defines no bounds for the <integer> type, so pick arbitrarily
        this._backgroundElement.style.zIndex = 10000;
        if (this._BackgroundCssClass) {
            this._backgroundElement.className = this._BackgroundCssClass;
        }
        this._foregroundElement.parentNode.appendChild(this._backgroundElement);

        this._foregroundElement.style.display = 'none';
        this._foregroundElement.style.position = 'fixed';
        this._foregroundElement.style.zIndex = $common.getCurrentStyle(this._backgroundElement, 'zIndex', this._backgroundElement.style.zIndex) + 1;
        
        this._showHandler = Function.createDelegate(this, this._onShow);
        $addHandler(this.get_element(), 'click', this._showHandler);

        if (this._OkControlID) {
            this._okHandler = Function.createDelegate(this, this._onOk);
            $addHandler($get(this._OkControlID), 'click', this._okHandler);
        }

        if (this._CancelControlID) {
            this._cancelHandler = Function.createDelegate(this, this._onCancel);
            $addHandler($get(this._CancelControlID), 'click', this._cancelHandler);
        }

        this._scrollHandler = Function.createDelegate(this, this._onLayout);
        this._resizeHandler = Function.createDelegate(this, this._onLayout);

        // Need to know when partial updates complete
        this.registerPartialUpdateEvents();
    },

    dispose : function() {
        /// <summary>
        /// Dispose the behavior
        /// </summary>

        // Going away; restore any changes to the page
        this._hideImplementation();

        if (this._foregroundElement && this._foregroundElement.parentNode) {
            // Remove background we added to the DOM
            this._foregroundElement.parentNode.removeChild(this._backgroundElement);

            if(this._DropShadow) {
                // Remove DIV wrapper added in initialize
                this._foregroundElement.parentNode.appendChild(this._popupElement);
                this._foregroundElement.parentNode.removeChild(this._foregroundElement);
            }
        }

        this._scrollHandler = null;
        this._resizeHandler = null;
        if (this._cancelHandler && $get(this._CancelControlID)) {
            $removeHandler($get(this._CancelControlID), 'click', this._cancelHandler);
            this._cancelHandler = null;
        }
        if (this._okHandler && $get(this._OkControlID)) {
            $removeHandler($get(this._OkControlID), 'click', this._okHandler);
            this._okHandler = null;
        }
        if (this._showHandler) {
            $removeHandler(this.get_element(), 'click', this._showHandler);
            this._showHandler = null;
        }
        
        AjaxControlToolkit.ModalPopupBehavior.callBaseMethod(this, 'dispose');
    },

    _attachPopup : function() {
        /// <summary>
        /// Attach the event handlers for the popup
        /// </summary>

        if (this._DropShadow && !this._dropShadowBehavior) {
            this._dropShadowBehavior = $create(AjaxControlToolkit.DropShadowBehavior, {}, null, null, this._popupElement);
        }
        if (this._dragHandleElement && !this._dragBehavior) {
            this._dragBehavior = $create(AjaxControlToolkit.FloatingBehavior, {"handle" : this._dragHandleElement}, null, null, this._foregroundElement);
        }        
                
        $addHandler(window, 'resize', this._resizeHandler);
        $addHandler(window, 'scroll', this._scrollHandler);
        this._windowHandlersAttached = true;
    },

    _detachPopup : function() {
        /// <summary>
        /// Detach the event handlers for the popup
        /// </summary>

        if (this._windowHandlersAttached) {
            if (this._scrollHandler) {
                $removeHandler(window, 'scroll', this._scrollHandler);
            }
            if (this._resizeHandler) {
                $removeHandler(window, 'resize', this._resizeHandler);
            }
            this._windowHandlersAttached = false;
        }
        
        if (this._dragBehavior) {
            this._dragBehavior.dispose();
            this._dragBehavior = null;
        }       
        
        if (this._dropShadowBehavior) {
            this._dropShadowBehavior.dispose();
            this._dropShadowBehavior = null;
        }
    },

    _onShow : function(e) {
        /// <summary>
        /// Handler for the target's click event
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">
        /// Event info
        /// </param>

        if (!this.get_element().disabled) {
            this.show();
            e.preventDefault();
            return false;
        }
    },

    _onOk : function(e) {
        /// <summary>
        /// Handler for the modal dialog's OK button click
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">
        /// Event info
        /// </param>

        var element = $get(this._OkControlID);
        if (element && !element.disabled) {
            if (this.hide() && this._OnOkScript) {
                window.setTimeout(this._OnOkScript, 0);
            }
            e.preventDefault();
            return false;
        }
    },

    _onCancel : function(e) {
        /// <summary>
        /// Handler for the modal dialog's Cancel button click
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">
        /// Event info
        /// </param>

        var element = $get(this._CancelControlID);
        if (element && !element.disabled) {
            if (this.hide() && this._OnCancelScript) {
                window.setTimeout(this._OnCancelScript, 0);
            }
            e.preventDefault();
            return false;
        }
    },

    _onLayout : function(e) {
        /// <summary>
        /// Handler for scrolling and resizing events that would require a repositioning of the modal dialog
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">
        /// Event info
        /// </param>
        var positioning = this.get_repositionMode();
        if (((positioning === AjaxControlToolkit.ModalPopupRepositionMode.RepositionOnWindowScroll) ||
            (positioning === AjaxControlToolkit.ModalPopupRepositionMode.RepositionOnWindowResizeAndScroll)) && (e.type === 'scroll')) {
            this._layout();
        } else if (((positioning === AjaxControlToolkit.ModalPopupRepositionMode.RepositionOnWindowResize) ||
            (positioning === AjaxControlToolkit.ModalPopupRepositionMode.RepositionOnWindowResizeAndScroll)) && (e.type === 'resize')) {
            this._layout();
        } else {
            // Layout background element again to make sure it covers the whole background.
            // This needs to be called separately since _layout will not be always called
            // to reposition the popup depending on the RepositionMode but the background needs 
            // to handle the resize/scroll every time.
            this._layoutBackgroundElement();
        }
    },

    show : function() {
        /// <summary>
        /// Display the element referenced by PopupControlID as a modal dialog
        /// </summary>
        
        var eventArgs = new Sys.CancelEventArgs();
        this.raiseShowing(eventArgs);
        if (eventArgs.get_cancel()) {
            return;
        }
        
        this.populate();
        this._attachPopup();

        this._backgroundElement.style.display = '';
        this._foregroundElement.style.display = '';
        this._popupElement.style.display = '';
        if (this._isIE6) {
            this._foregroundElement.style.position = 'absolute';
            this._backgroundElement.style.position = 'absolute'; 
            // find the relative or absolute parent
            var tempRelativeOrAbsoluteParent = this._foregroundElement.parentNode;
            while (tempRelativeOrAbsoluteParent && (tempRelativeOrAbsoluteParent != document.documentElement)) {
                if((tempRelativeOrAbsoluteParent.style.position != 'relative') && (tempRelativeOrAbsoluteParent.style.position != 'absolute')) {
                    tempRelativeOrAbsoluteParent = tempRelativeOrAbsoluteParent.parentNode;
                } else {
                    this._relativeOrAbsoluteParentElement = tempRelativeOrAbsoluteParent;
                    break;
                }
            }                       
        }        


        // Disable TAB
        this.disableTab();

        this._layout();
        // On pages that don't need scrollbars, Firefox and Safari act like
        // one or both are present the first time the layout code runs which
        // obviously leads to display issues - run the layout code a second
        // time to work around this problem
        this._layout();
        
        this.raiseShown(Sys.EventArgs.Empty);
    },

    disableTab : function() {
        /// <summary>
        /// Change the tab indices so we only tab through the modal popup
        /// (and hide SELECT tags in IE6)
        /// </summary>

        var i = 0;
        var tagElements;
        var tagElementsInPopUp = new Array();
        Array.clear(this._saveTabIndexes);

        //Save all popup's tag in tagElementsInPopUp
        for (var j = 0; j < this._tagWithTabIndex.length; j++) {
            tagElements = this._foregroundElement.getElementsByTagName(this._tagWithTabIndex[j]);
            for (var k = 0 ; k < tagElements.length; k++) {
                tagElementsInPopUp[i] = tagElements[k];
                i++;
            }
        }

        i = 0;
        for (var j = 0; j < this._tagWithTabIndex.length; j++) {
            tagElements = document.getElementsByTagName(this._tagWithTabIndex[j]);
            for (var k = 0 ; k < tagElements.length; k++) {
                if (Array.indexOf(tagElementsInPopUp, tagElements[k]) == -1)  {
                    this._saveTabIndexes[i] = {tag: tagElements[k], index: tagElements[k].tabIndex};
                    tagElements[k].tabIndex="-1";
                    i++;
                }
            }
        }

        //IE6 Bug with SELECT element always showing up on top
        i = 0;
        if ((Sys.Browser.agent === Sys.Browser.InternetExplorer) && (Sys.Browser.version < 7)) {
            //Save SELECT in PopUp
            var tagSelectInPopUp = new Array();
            for (var j = 0; j < this._tagWithTabIndex.length; j++) {
                tagElements = this._foregroundElement.getElementsByTagName('SELECT');
                for (var k = 0 ; k < tagElements.length; k++) {
                    tagSelectInPopUp[i] = tagElements[k];
                    i++;
                }
            }

            i = 0;
            Array.clear(this._saveDesableSelect);
            tagElements = document.getElementsByTagName('SELECT');
            for (var k = 0 ; k < tagElements.length; k++) {
                if (Array.indexOf(tagSelectInPopUp, tagElements[k]) == -1)  {
                    this._saveDesableSelect[i] = {tag: tagElements[k], visib: $common.getCurrentStyle(tagElements[k], 'visibility')} ;
                    tagElements[k].style.visibility = 'hidden';
                    i++;
                }
            }
        }
    },

    restoreTab : function() {
        /// <summary>
        /// Restore the tab indices so we tab through the page like normal
        /// (and restore SELECT tags in IE6)
        /// </summary>

        for (var i = 0; i < this._saveTabIndexes.length; i++) {
            this._saveTabIndexes[i].tag.tabIndex = this._saveTabIndexes[i].index;
        }
        Array.clear(this._saveTabIndexes);

        //IE6 Bug with SELECT element always showing up on top
        if ((Sys.Browser.agent === Sys.Browser.InternetExplorer) && (Sys.Browser.version < 7)) {
            for (var k = 0 ; k < this._saveDesableSelect.length; k++) {
                this._saveDesableSelect[k].tag.style.visibility = this._saveDesableSelect[k].visib;
            }
            Array.clear(this._saveDesableSelect);
        }
    },

    hide : function() {
        /// <summary>
        /// Hide the modal dialog
        /// </summary>
        /// <returns type="Boolean" mayBeNull="false">
        /// Whether or not the dialog was hidden
        /// </returns>

        var eventArgs = new Sys.CancelEventArgs();
        this.raiseHiding(eventArgs);
        if (eventArgs.get_cancel()) {
            return false;
        }

        this._hideImplementation();

        this.raiseHidden(Sys.EventArgs.Empty);
        return true;
    },

    _hideImplementation : function() {
        /// <summary>
        /// Internal implementation to hide the modal dialog
        /// </summary>

        this._backgroundElement.style.display = 'none';
        this._foregroundElement.style.display = 'none';

        this.restoreTab();

        this._detachPopup();
    },

    _layout : function() {
        /// <summary>
        /// Position the modal dialog 
        /// </summary>
        var scrollLeft = (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
        var scrollTop = (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
               
        var clientBounds = $common.getClientBounds();
        var clientWidth = clientBounds.width;
        var clientHeight = clientBounds.height;
        
        // Setup the location of the background element
        this._layoutBackgroundElement();

        var xCoord = 0;
        var yCoord = 0;
        if(this._xCoordinate < 0) {
            var foregroundelementwidth = this._foregroundElement.offsetWidth? this._foregroundElement.offsetWidth: this._foregroundElement.scrollWidth;
            xCoord = ((clientWidth-foregroundelementwidth)/2);
            // workaround for drag behavior which calls setlocation which in turn
            // changes the position of the panel to be absolute and requiring us
            // to add the scrollLeft so that it is positioned correctly.
            if (this._foregroundElement.style.position == 'absolute') {
                xCoord += scrollLeft;
            }
            this._foregroundElement.style.left = xCoord + 'px';
            
        } else {
            if(this._isIE6) {
                this._foregroundElement.style.left = (this._xCoordinate + scrollLeft) + 'px';
                xCoord = this._xCoordinate + scrollLeft;
            }
            else {
                this._foregroundElement.style.left = this._xCoordinate + 'px';
                xCoord = this._xCoordinate;
            }
        }
        if(this._yCoordinate < 0) {
            var foregroundelementheight = this._foregroundElement.offsetHeight? this._foregroundElement.offsetHeight: this._foregroundElement.scrollHeight;
            yCoord = ((clientHeight-foregroundelementheight)/2);           
            // workaround for drag behavior which calls setlocation which in turn
            // changes the position of the panel to be absolute and requiring us
            // to add the scrollLeft so that it is positioned correctly.
            if (this._foregroundElement.style.position == 'absolute') {
                yCoord += scrollTop;
            }
            this._foregroundElement.style.top = yCoord + 'px';
          
        } else {
            if(this._isIE6) {
                this._foregroundElement.style.top = (this._yCoordinate + scrollTop) + 'px';
                yCoord = this._yCoordinate + scrollTop;
            }
            else {
                this._foregroundElement.style.top = this._yCoordinate + 'px';
                yCoord = this._yCoordinate;
            }
        }

        // make sure get location agrees with the location of the foreground element
        this._layoutForegroundElement(xCoord, yCoord);
        
        if (this._dropShadowBehavior) {
            this._dropShadowBehavior.setShadow();
            window.setTimeout(Function.createDelegate(this, this._fixupDropShadowBehavior), 0);
        }
        
        // layout background element again to make sure it covers the whole background 
        // in case things moved around when laying out the foreground element
        this._layoutBackgroundElement();
    },
    
    _layoutForegroundElement : function(xCoord, yCoord) {
        /// <summary>
        /// Set the correct location of the foreground element to ensure that it is absolutely 
        /// positioned with respect to the browser. This is just a workaround for IE 6 since
        /// elements nested in relative parents cause modal popup positioning issues and 'fixed'
        /// is not supported by IE 6. Hence we manually compute the right location of the popup.
        /// </summary>
        /// <param name="xCoord" type="Number" integer="true" maybenull="false">
        /// <param name="yCoord" type="Number" integer="true" maybenull="false">        
        /// </params>
        
        if (this._isIE6 && this._relativeOrAbsoluteParentElement) {
            var foregroundLocation = $common.getLocation(this._foregroundElement);  
            var relativeParentLocation = $common.getLocation(this._relativeOrAbsoluteParentElement);
            var getLocationXCoord = foregroundLocation.x;
            if (getLocationXCoord != xCoord) {
                // offset it by that amount
                this._foregroundElement.style.left = (xCoord - relativeParentLocation.x) + 'px';
            } 
                        
            var getLocationYCoord = foregroundLocation.y;
            if (getLocationYCoord != yCoord) {
                // offset it by that amount
                this._foregroundElement.style.top = (yCoord - relativeParentLocation.y) + 'px';
            } 
        }
    },
    
    _layoutBackgroundElement : function() {
        /// <summary>
        /// Set the correct location of the background element to ensure that it is absolutely 
        /// positioned with respect to the browser.
        /// </summary>

        // Background element needs to cover the visible client area completely hence its
        // top and left coordinates need to be 0, and if relatively positioned its getlocation
        // value needs to be 0.
        if(this._isIE6) { 
            var backgroundLocation = $common.getLocation(this._backgroundElement);
            var backgroundXCoord = backgroundLocation.x;
            if (backgroundXCoord != 0) {
                // offset it by that amount. This is assuming only one level of nesting. If
                // multiple parents with absolute/relative positioning are setup this may not 
                // cover the whole background.
                this._backgroundElement.style.left = (-backgroundXCoord) + 'px';
            } 
            
            var backgroundYCoord = backgroundLocation.y;
            if (backgroundYCoord != 0) {
                // offset it by that amount. This is assuming only one level of nesting. If
                // multiple parents with absolute/relative positioning are setup this may not 
                // cover the whole background.
                this._backgroundElement.style.top = (-backgroundYCoord) + 'px';
            }         
        }
        var clientBounds = $common.getClientBounds();
        var clientWidth = clientBounds.width;
        var clientHeight = clientBounds.height;
        this._backgroundElement.style.width = Math.max(Math.max(document.documentElement.scrollWidth, document.body.scrollWidth), clientWidth)+'px';
        this._backgroundElement.style.height = Math.max(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight), clientHeight)+'px';
    },

    _fixupDropShadowBehavior : function() {
        /// <summary>
        /// Some browsers don't update the location values immediately, so
        /// the location of the drop shadow would always be a step behind
        /// without this method
        /// </summary>

        if (this._dropShadowBehavior) {
            this._dropShadowBehavior.setShadow();
        }
    },

    _partialUpdateEndRequest : function(sender, endRequestEventArgs) {
        /// <summary>
        /// Show the popup if requested during a partial postback
        /// </summary>
        /// <param name="sender" type="Object">
        /// Sender
        /// </param>
        /// <param name="endRequestEventArgs" type="Sys.WebForms.EndRequestEventArgs">
        /// Event arguments
        /// </param>
        /// <returns />
        AjaxControlToolkit.ModalPopupBehavior.callBaseMethod(this, '_partialUpdateEndRequest', [sender, endRequestEventArgs]);

        if (this.get_element()) {
            // Look up result by element's ID
            var action = endRequestEventArgs.get_dataItems()[this.get_element().id];
            if ("show" == action) {
                this.show();
            } else if ("hide" == action) {
                this.hide();
            }
        }

        // Async postback may have added content; re-layout to accomodate it
        this._layout();
    },

    _onPopulated : function(sender, eventArgs) {
        /// <summary>
        /// Re-layout the popup after we've dynamically populated
        /// </summary>
        /// <param name="sender" type="Object">
        /// Sender
        /// </param>
        /// <param name="eventArgs" type="Sys.EventArgs">
        /// Event arguments
        /// </param>
        /// <returns />
        AjaxControlToolkit.ModalPopupBehavior.callBaseMethod(this, '_onPopulated', [sender, eventArgs]);

        // Dynamic populate may have added content; re-layout to accomodate it
        this._layout();
    },
    
    get_PopupControlID : function() {
        /// <value type="String">
        /// The ID of the element to display as a modal popup
        /// </value>
        return this._PopupControlID;
    },
    set_PopupControlID : function(value) {
        if (this._PopupControlID != value) {
            this._PopupControlID = value;
            this.raisePropertyChanged('PopupControlID');
        }
    },

    get_X: function() {
        /// <value type="Number" integer="true">
        /// The number of pixels from the left of the browser to position the modal popup.
        /// </value>
        return this._xCoordinate;
    },
    set_X: function(value) {
        if (this._xCoordinate != value) {
            this._xCoordinate = value;
            this.raisePropertyChanged('X');
        }
    },

    get_Y: function() {
        /// <value type="Number" integer="true">
        /// The number of pixels from the top of the browser to position the modal popup.
        /// </value>
        return this._yCoordinate;
    },
    set_Y: function(value) {
        if (this._yCoordinate != value) {
            this._yCoordinate = value;
            this.raisePropertyChanged('Y');
        }
    },
       
    get_PopupDragHandleControlID : function() {
        /// <value type="String">
        /// The ID of the element to display as the drag handle for the modal popup
        /// </value>
        return this._PopupDragHandleControlID;
    },
    set_PopupDragHandleControlID : function(value) {
        if (this._PopupDragHandleControlID != value) {
            this._PopupDragHandleControlID = value;
            this.raisePropertyChanged('PopupDragHandleControlID');
        }
    },

    get_BackgroundCssClass : function() {
        /// <value type="String">
        /// The CSS class to apply to the background when the modal popup is displayed
        /// </value>
        return this._BackgroundCssClass;
    },
    set_BackgroundCssClass : function(value) {
        if (this._BackgroundCssClass != value) {
            this._BackgroundCssClass = value;
            this.raisePropertyChanged('BackgroundCssClass');
        }
    },

    get_DropShadow : function() {
        /// <value type="Boolean">
        /// Whether or not a drop-shadow should be added to the modal popup
        /// </value>
        return this._DropShadow;
    },
    set_DropShadow : function(value) {
        if (this._DropShadow != value) {
            this._DropShadow = value;
            this.raisePropertyChanged('DropShadow');
        }
    },

    get_Drag : function() {
        /// <value type="Boolean">
        /// Obsolete: Setting the _Drag property is a noop
        /// </value>
        return this._Drag;
    },
    set_Drag : function(value) {
        if (this._Drag != value) {
            this._Drag = value;
            this.raisePropertyChanged('Drag');
        }
    },

    get_OkControlID : function() {
        /// <value type="String">
        /// The ID of the element that dismisses the modal popup
        /// </value>
        return this._OkControlID;
    },
    set_OkControlID : function(value) {
        if (this._OkControlID != value) {
            this._OkControlID = value;
            this.raisePropertyChanged('OkControlID');
        }
    },

    get_CancelControlID : function() {
        /// <value type="String">
        /// The ID of the element that cancels the modal popup
        /// </value>
        return this._CancelControlID;
    },
    set_CancelControlID : function(value) {
        if (this._CancelControlID != value) {
            this._CancelControlID = value;
            this.raisePropertyChanged('CancelControlID');
        }
    },

    get_OnOkScript : function() {
        /// <value type="String">
        /// Script to run when the modal popup is dismissed with the OkControlID
        /// </value>
        return this._OnOkScript;
    },
    set_OnOkScript : function(value) {
        if (this._OnOkScript != value) {
            this._OnOkScript = value;
            this.raisePropertyChanged('OnOkScript');
        }
    },

    get_OnCancelScript : function() {
        /// <value type="String">
        /// Script to run when the modal popup is dismissed with the CancelControlID
        /// </value>
        return this._OnCancelScript;
    },
    set_OnCancelScript : function(value) {
        if (this._OnCancelScript != value) {
            this._OnCancelScript = value;
            this.raisePropertyChanged('OnCancelScript');
        }
    },

    get_repositionMode : function() {
        /// <value type="AjaxControlToolkit.ModalPopupRepositionMode">
        /// Determines if the ModalPopup should be repositioned on window resize/scroll
        /// </value>
        return this._repositionMode;
    },
    set_repositionMode : function(value) {
        if (this._repositionMode !== value) {
            this._repositionMode = value;
            this.raisePropertyChanged('RepositionMode');
        }
    },
    
    add_showing : function(handler) {
        /// <summary>
        /// Add an event handler for the showing event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().addHandler('showing', handler);
    },
    remove_showing : function(handler) {
        /// <summary>
        /// Remove an event handler from the showing event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().removeHandler('showing', handler);
    },
    raiseShowing : function(eventArgs) {
        /// <summary>
        /// Raise the showing event
        /// </summary>
        /// <param name="eventArgs" type="Sys.CancelEventArgs" mayBeNull="false">
        /// Event arguments for the showing event
        /// </param>
        /// <returns />
        
        var handler = this.get_events().getHandler('showing');
        if (handler) {
            handler(this, eventArgs);
        }
    },
    
    add_shown : function(handler) {
        /// <summary>
        /// Add an event handler for the shown event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().addHandler('shown', handler);
    },
    remove_shown : function(handler) {
        /// <summary>
        /// Remove an event handler from the shown event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().removeHandler('shown', handler);
    },
    raiseShown : function(eventArgs) {
        /// <summary>
        /// Raise the shown event
        /// </summary>
        /// <param name="eventArgs" type="Sys.EventArgs" mayBeNull="false">
        /// Event arguments for the shown event
        /// </param>
        /// <returns />
        
        var handler = this.get_events().getHandler('shown');
        if (handler) {
            handler(this, eventArgs);
        }
    },
    
    add_hiding : function(handler) {
        /// <summary>
        /// Add an event handler for the hiding event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().addHandler('hiding', handler);
    },
    remove_hiding : function(handler) {
        /// <summary>
        /// Remove an event handler from the hiding event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().removeHandler('hiding', handler);
    },
    raiseHiding : function(eventArgs) {
        /// <summary>
        /// Raise the hiding event
        /// </summary>
        /// <param name="eventArgs" type="Sys.CancelEventArgs" mayBeNull="false">
        /// Event arguments for the hiding event
        /// </param>
        /// <returns />
        
        var handler = this.get_events().getHandler('hiding');
        if (handler) {
            handler(this, eventArgs);
        }
    },
    
    add_hidden : function(handler) {
        /// <summary>
        /// Add an event handler for the hidden event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().addHandler('hidden', handler);
    },
    remove_hidden : function(handler) {
        /// <summary>
        /// Remove an event handler from the hidden event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().removeHandler('hidden', handler);
    },
    raiseHidden : function(eventArgs) {
        /// <summary>
        /// Raise the hidden event
        /// </summary>
        /// <param name="eventArgs" type="Sys.EventArgs" mayBeNull="false">
        /// Event arguments for the hidden event
        /// </param>
        /// <returns />
        
        var handler = this.get_events().getHandler('hidden');
        if (handler) {
            handler(this, eventArgs);
        }
    }
}
AjaxControlToolkit.ModalPopupBehavior.registerClass('AjaxControlToolkit.ModalPopupBehavior', AjaxControlToolkit.DynamicPopulateBehaviorBase);

AjaxControlToolkit.ModalPopupBehavior.invokeViaServer = function(behaviorID, show) {
    /// <summary>
    /// This static function (that is intended to be called from script emitted
    /// on the server) will show or hide the behavior associated with behaviorID
    /// (i.e. to use this, the ModalPopupExtender must have an ID or BehaviorID) and
    /// will either show or hide depending on the show parameter.
    /// </summary>
    /// <param name="behaviorID" type="String">
    /// ID of the modal popup behavior
    /// </param>
    /// <param name="show" type="Boolean">
    /// Whether to show or hide the modal popup
    /// </param>
    var behavior = $find(behaviorID);
    if (behavior) {
        if (show) {
            behavior.show();
        } else {
            behavior.hide();
        }
    }
}

//END AjaxControlToolkit.ModalPopup.ModalPopupBehavior.js
if(typeof(Sys)!=='undefined')Sys.Application.notifyScriptLoaded();
(function() {var fn = function() {$get('ctl00_ctl00_ToolkitScriptManager1_HiddenField').value += ';;AjaxControlToolkit, Version=1.0.11119.41102, Culture=neutral, PublicKeyToken=28f01b0e84b6d53e:vi-VN:b6c6a29e-a678-4f82-8215-1947249c9eb0:e2e86ef9:1df13a87:3858419b:9ea3f0e2:96741c43:c4c00916:c7c04611:cd120801:38ec41c0';Sys.Application.remove_load(fn);};Sys.Application.add_load(fn);})();