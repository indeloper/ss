# Material Reference Data

Этот каталог содержит справочные данные из базы данных ERP системы, выгруженные из MariaDB контейнера `erp-db`. Данные предназначены для использования в качестве подсказок при разработке и отладке функций, связанных с материалами.

## Выгруженные таблицы

### Основные справочники

1. **material_types.txt** - Типы материалов
   - Содержит различные типы материалов (шпунт, арматура, двутавр, трубы и т.д.)
   - Поля: id, name, unit_id, fixed_quantity, description, instruction

2. **material_units.txt** - Единицы измерения материалов
   - Содержит единицы измерения (м, кг, шт, м², м³ и т.д.)
   - Поля: id, name, short_name

3. **material_brands.txt** - Марки материалов
   - Содержит марки материалов (например, марки стали, бетона и т.д.)
   - Поля: id, name, description

4. **material_properties.txt** - Свойства материалов
   - Содержит свойства материалов (клиновидный, обрезок, с замком, с листом и т.д.)
   - Поля: id, name, description, weight_factor

5. **material_standards.txt** - Стандарты материалов
   - Содержит стандарты материалов (ГОСТ, ТУ и т.д.)
   - Поля: id, name, description, material_type_id, q3w_material_standard_id

### Связующие таблицы

6. **material_standard_alternatives.txt** - Альтернативы стандартов материалов
   - Связывает стандарты материалов с их альтернативами
   - Поля: id, material_standard_id, alternative_material_standard_id

7. **material_standard_material_brand.txt** - Связь стандартов и марок
   - Связывает стандарты материалов с марками
   - Поля: id, material_standard_id, material_brand_id

8. **material_standard_property.txt** - Связь стандартов и свойств
   - Связывает стандарты материалов со свойствами
   - Поля: id, material_standard_id, material_property_id

9. **material_type_property.txt** - Связь типов и свойств
   - Связывает типы материалов со свойствами
   - Поля: id, material_type_id, material_property_id

## Структура данных

### Основные связи:
- `material_standards` связан с `material_types` через `material_type_id`
- `material_standards` связан с `q3w_material_standards` через `q3w_material_standard_id` (старая система)
- Марки привязываются к стандартам через `material_standard_material_brand`
- Свойства привязываются к стандартам через `material_standard_property`
- Свойства привязываются к типам через `material_type_property`

### Примечания:
- Таблица `q3w_materials` является активной для материалов
- Таблица `q3w_material_standards` является старой, вместо неё используется `material_standards`
- В `material_standards` есть ссылка на старые стандарты через `q3w_material_standard_id`

## Использование

Эти данные могут быть использованы для:
- Понимания структуры данных при разработке фильтров и поиска
- Отладки запросов и проверки корректности данных
- Создания тестовых данных
- Понимания бизнес-логики работы с материалами

## Дата выгрузки
27.07.2025

## Источник
MariaDB контейнер `erp-db`, база данных `erp`
