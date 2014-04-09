---
layout: post
title: Tinymce Syntaxhighlighter Plugin
description: A simple plugin for tinymce that provides syntax highlighting.
categories:
  - projects
  - open source
---
I went to integrate [Syntaxhighlighter](http://code.google.com/p/syntaxhighlighter/) into the site tonight, something I'd forgotten to do in the redesign and I thought it would be nice if I could just click a button in [tinymce](http://tinymce.moxiecode.com/) and paste in the code, select a few options and click insert. Which of course is entirely possible so I've written a tinymce plugin to do just that.

I did encounter one little bug writing the plugin. When inserting the pasted code it kept repeating itself if there was currently no content in the body of the textarea (tinymce). I finally managed to fix it by putting a space at the end of the variable I was trying to insert (and with the power of highlighting here's what that looked like).

{% highlight javascript %}
textarea_output += '</textarea> '; /* Note space */
tinyMCEPopup.editor.execCommand('mceInsertContent', false, textarea_output);
{% endhighlight %}

You can download the plugin from my [github account](http://github.com/RichGuk/syntaxhl/tree/master)

## Getting it to work
First you need to download [Syntaxhighlighter](http://code.google.com/p/syntaxhighlighter/) and get that working by including the CSS file and Javascript files.

### Extract the plugin
Next you need to extract the plugin to your tinymce plugin directory. When extracted it should be something like this:
**/path/to/tinymce/plugins/syntaxhl**

### Configure tinymce
Finally we need to configure tinymce to use our plugin we also need to stop tinymce from stripping out &lt;textarea&gt;&lt;/textarea&gt; html tags as this is needed for Syntaxhighlighter.

{% highlight javascript %}
tinyMCE.init({
  theme : "advanced",
  plugins : "syntaxhl",
  theme_advanced_buttons1 : "bold,italic,underline,undo,redo,link,unlink,image,forecolor,styleselect,removeformat,cleanup,code, syntaxhl",
  theme_advanced_buttons2 : "",
  theme_advanced_buttons3 : "",
  remove_linebreaks : false,
  extended_valid_elements : "textarea[cols|rows|disabled|name|readonly|class]"
});
{% endhighlight %}

We tell tinymce to use our plugin by adding **syntaxhl** to the plugins list and also adding the **syntaxhl** button to the buttons list also note that extended_valid_elements contains the textarea tag this tells tinymce to not remove it.

If all went well you should see a new highlighter icon button in tinymce and when you click it you should get a dialog popup allowing you to insert code into your content.

If you encounter any bugs then please create an issue on the [github account](http://github.com/RichGuk/syntaxhl/tree/master) and any forks/patches are welcome!
