(($) => {
    $.fn.extend({
        htmlOptions(arr) {
            const $this = $(this);
            if ($this.is('select')) {
                $this.empty();
                $.each(arr, (i, obj) => {
                    const $opt = $('<option>', obj);
                    $this.append($opt);
                });
            }
            return $this;
        },
    });
})(jQuery);
