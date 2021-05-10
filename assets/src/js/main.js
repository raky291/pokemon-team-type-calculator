/* eslint-disable func-names */
/* global _, typeList, typeChart, typeCombChart */

jQuery(($) => {
    // Variables

    const $dropdowns = $('.pokemon-types select');
    const $items = $('#items .pokemon-item');
    const $team = $('.pokemon-team');
    const $recommended = $('#recommended tbody');
    const typeComb = [];

    // Calculate Defense Types

    function calculateDefenseTypes(arr) {
        const result = [];

        _.each(typeChart, (row, i) => {
            const name = typeList[i];
            let eff = 1;
            let count = 0;

            _.each(arr, (types) => {
                let tmp = 1;

                _.each(types, (type) => {
                    eff *= row[type];
                    tmp *= row[type];
                });

                if (tmp > 1) {
                    count += 1;
                } else if (tmp < 1) {
                    count -= 1;
                }
            });

            result.push({
                id: i,
                type: name,
                eff,
                count,
            });
        });

        return result;
    }

    // Show Weakness and Resistance

    function getTypesByItem(self) {
        const types = [];

        const type1 = $(self).find('.pokemon-type1').val();
        if (type1) {
            types.push(type1);
        }

        const type2 = $(self).find('.pokemon-type2').val();
        if (type2) {
            types.push(type2);
        }

        return types;
    }

    function showWeakness(defense, team = false) {
        const weakness = _(defense)
            .filter((o) => (team ? o.count > 0 : o.eff > 1))
            .orderBy((o) => (team ? o.count : o.eff), 'desc')
            .value();

        let html = '';
        _.each(weakness, (o) => {
            html += `
                <span class="type type-${o.id}">
                    ${o.type}
                    <span class="badge badge-light">${team ? o.count : `${o.eff}×`}</span>
                </span>`;
        });

        return html;
    }

    function showResistance(defense, team = false) {
        const resistance = _(defense)
            .filter((o) => (team ? o.count < 0 : o.eff < 1))
            .orderBy((o) => (team ? o.count : o.eff), 'asc')
            .value();

        let html = '';
        _.each(resistance, (o) => {
            html += `
                <span class="type type-${o.id}">
                    ${o.type}
                    <span class="badge badge-light">${team ? Math.abs(o.count) : `${o.eff}×`}</span>
                </span>`;
        });

        return html;
    }

    // Show Recommended Type Combinations

    function showRecommendedTypeCombinations(defense) {
        const weakness = _(defense)
            .filter((o) => o.count > 0)
            .map((o) => o.type)
            .value();

        const recommended = _(typeComb)
            .filter((x) => _.some(x.defense, (y) => _.includes(weakness, y.type) && y.eff < 1))
            .map((x) => ({
                id1: x.id1,
                id2: x.id2,
                defense: x.defense,
                matches: _.filter(x.defense, (y) => _.includes(weakness, y.type) && y.eff < 1).length,
            }))
            .orderBy((x) => x.matches, 'desc')
            .value();

        $recommended.empty();
        _.each(recommended, (o) => {
            const html = `
                <tr class="pokemon-item">
                    <td class="pokemon-types">
                        <span class="type type-${o.id1}">${typeList[o.id1]}</span>
                        <span class="type type-${o.id2}">${typeList[o.id2]}</span>
                    </td>
                    <td class="pokemon-weakness">${showWeakness(o.defense)}</td>
                    <td class="pokemon-resistance">${showResistance(o.defense)}</td>
                    <td class="pokemon-matches">${o.matches}</td>
                </tr>`;

            $recommended.append(html);
        });
    }

    // Events

    function onChangeType() {
        const team = [];

        $items.each(function () {
            let types = getTypesByItem(this);
            if (_.isEmpty(types)) {
                $(this).find('.pokemon-weakness').empty();
                $(this).find('.pokemon-resistance').empty();
                return;
            }

            types = _.uniq(types);
            team.push(types);
            const defense = calculateDefenseTypes([types]);
            $(this).find('.pokemon-weakness').html(showWeakness(defense));
            $(this).find('.pokemon-resistance').html(showResistance(defense));
        });

        if (_.isEmpty(team)) {
            $team.find('.pokemon-weakness').empty();
            $team.find('.pokemon-resistance').empty();
            return;
        }

        const defense = calculateDefenseTypes(team);
        $($team).find('.pokemon-weakness').html(showWeakness(defense, true));
        $($team).find('.pokemon-resistance').html(showResistance(defense, true));

        showRecommendedTypeCombinations(defense);
    }

    function initDropdowns() {
        $dropdowns.each(function () {
            const options = _(typeList)
                .map((v, i) => ({ value: i, text: v }))
                .value();
            options.unshift({ value: '', text: 'None' });
            $(this).htmlOptions(options);
            $(this).on('change', onChangeType);
        });
    }

    function initTypeCombinations() {
        _.each(typeCombChart, (row, i) => {
            _.each(row, (value, j) => {
                if (value === 1) {
                    typeComb.push({
                        id1: i,
                        id2: j,
                        defense: calculateDefenseTypes([[i, j]]),
                    });
                }
            });
        });
    }

    initDropdowns();
    initTypeCombinations();
});
