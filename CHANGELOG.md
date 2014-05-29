
# Okanjo basic product load / importer

When stuff changes, it's described here.

# 2014-05-29
 * Added ability to handle image URLs by downloading them first then uploading to Okanjo
 * Changed example dir into image cache dir for downloads
 * Added sanitize-filename dependency to make sure remote paths are file safe
 * Added path/platform portability via path.join instead of fixed unix path separators

# 2014-05-28
 * Initial import / setup