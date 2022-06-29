export abstract class IMapper<T, TDto> {
    toDTO(t: T){};
    toEntity(tDto: TDto){};
}