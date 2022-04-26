import { BlobContainer } from "app/models";
import { DecoratorBase } from "app/utils/decorators";
import { ContainerLeaseDecorator } from "./container-lease-decorator";

export class ContainerDecorator extends DecoratorBase<BlobContainer> {
    public id: string;
    public name: string;
    public publicAccessLevel: string;
    public lease: any;
    public metadata: any;

    constructor(container: BlobContainer) {
        super(container);

        this.id = this.stringField(container.id);
        this.name = this.stringField(container.name);
        this.publicAccessLevel = this.stringField(null); // TODO
        this.lease = new ContainerLeaseDecorator({
            status: container.properties.leaseStatus,
            state: container.properties.leaseState,
        } as any);
        this.metadata = container.properties.metadata;
    }

    // private _buildMetadata(metadata: Map<string, string>): List<Metadata> {
    //     const metaArray = [];
    //     if (metadata) {
    //         for (const key of Object.keys(metadata)) {
    //             metaArray.push(new Metadata({ name: key, value: metadata[key] }));
    //         }
    //     }

    //     return List<Metadata>(metaArray);
    // }
}
