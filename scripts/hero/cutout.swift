// Cuts the subject out of photos with macOS's Vision foreground mask (macOS 14+).
//
// Usage: swift scripts/hero/cutout.swift in.png out.png [in2.png out2.png ...]
import AppKit
import CoreImage
import Vision

let args = Array(CommandLine.arguments.dropFirst())
guard !args.isEmpty, args.count % 2 == 0 else { fatalError("usage: cutout.swift in.png out.png [...]") }
let context = CIContext()
for pair in stride(from: 0, to: args.count, by: 2) {
    guard let input = CIImage(contentsOf: URL(fileURLWithPath: args[pair])) else { fatalError("can't read \(args[pair])") }
    let request = VNGenerateForegroundInstanceMaskRequest()
    let handler = VNImageRequestHandler(ciImage: input)
    try handler.perform([request])
    guard let result = request.results?.first else { fatalError("no subject in \(args[pair])") }
    let masked = try result.generateMaskedImage(ofInstances: result.allInstances, from: handler, croppedToInstancesExtent: false)
    try context.writePNGRepresentation(
        of: CIImage(cvPixelBuffer: masked),
        to: URL(fileURLWithPath: args[pair + 1]),
        format: .RGBA8,
        colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!
    )
}
